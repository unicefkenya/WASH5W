import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { NGXLogger } from 'ngx-logger';
import { VisualisationVariable } from '../models/visualisation-variable.model';
import { environment } from 'environments/environment';
import { catchError, map, tap } from 'rxjs/operators';
import { VisualisationVariableState } from '../models/visualisation-variable-state.model';

const LOG_PREFIX: string = "[Visualisation Variables Data Service]";
const HEADERS = { 'Content-Type': 'application/json' };

@Injectable({
  providedIn: 'root'
})
export class VisualisationVariablesDataService {

  // Keeps tabs of the default url string
  private url: string = environment.production ?
    `${environment.urls.api}/api/v1/visualisations_variables` :
    `${environment.urls.api}/visualisations_variables`;

  // Keeps tabs of the user defined search or sort criteria.
  private state: VisualisationVariableState = {
    searchTerm: null,
    page: 1,
    pageSize: 20,
    sortColumn: 'name',
    sortDirection: 'asc',
    id: null,
    visualisationId: null,
    indicatorId: null,
    roleId: null
  };

  // Keeps tabs of the visualisationVariables
  private visualisationVariablesSubject$ = new BehaviorSubject<VisualisationVariable[]>([]);
  readonly visualisationVariables$ = this.visualisationVariablesSubject$.asObservable();

  // Keeps tabs of the total visualisationVariables (irregardless of pagination)
  private totalRecordsSubject$ = new BehaviorSubject<number>(0);
  readonly totalRecords$ = this.totalRecordsSubject$.asObservable();

  // Keeps tabs of the loading status
  private loadingSubject$ = new BehaviorSubject<boolean>(false);
  readonly loading$ = this.loadingSubject$.asObservable();

  constructor(
    private http: HttpClient,
    private log: NGXLogger) {

  }


  /**
   * Creates a new Visualisation Variable Record
   * 
   * @param visualisationVariable the details of the Visualisation Variable Record to be created
   * @returns the newly created Visualisation Variable Record
   */
  public createVisualisationVariable(visualisationVariable: VisualisationVariable): Observable<VisualisationVariable> {

    this.log.trace(`${LOG_PREFIX} Entering createVisualisationVariable()`);
    this.log.debug(`${LOG_PREFIX} Visualisation Variable = ${JSON.stringify(visualisationVariable)}`);

    // Set the loading status to true
    this.log.trace(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Make a HTTP POST Request to create the record
    this.log.debug(`${LOG_PREFIX} Making a HTTP POST Request to ${this.url} to create the record`);
    return this.http.post<VisualisationVariable>(`${this.url}`, JSON.stringify(visualisationVariable), { headers: new HttpHeaders(HEADERS) })
      .pipe(

        tap((data: VisualisationVariable) => {

          // Visualisation Variable Record Creation was successful
          this.log.trace(`${LOG_PREFIX} Record Creation was successful`);
          this.log.debug(`${LOG_PREFIX} Created Record = ${JSON.stringify(data)}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          // Refresh the records / record count
          this.log.trace(`${LOG_PREFIX} Refreshing the records / record count`);
          this.getFreshVisualisationsVariables(true, this.state).subscribe();

        }),

        catchError((error: any) => {

          // Visualisation Variable Record Creation was unsuccessful
          this.log.error(`${LOG_PREFIX} Visualisation Variable Record Creation was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);

        }));
  }



  /**
   * Retrieves Visualisations Variables Records from the local cache or database
   * 
   * @param cache Whether the results should be locally cached if freshly retrieved from the database
   * @param state The desired records state
   * @returns The Visualisations Variables Records
   */
  public getVisualisationsVariables(cache: boolean, state: VisualisationVariableState): Observable<VisualisationVariable[]> {

    this.log.trace(`${LOG_PREFIX} Entering getVisualisationsVariables()`);

    // Check if the desired records state has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the desired records state has been specified`);

    if (state) {

      // The desired records state has been specified
      this.log.debug(`${LOG_PREFIX} The desired records state has been specified`);
      this.log.debug(`${LOG_PREFIX} Desired Records State = ${JSON.stringify(state)}`);

      // Check if the specified desired records state is equal to the local desired records state
      this.log.trace(`${LOG_PREFIX} Checking if the specified desired records state is equal to the local desired records state`);

      if (JSON.stringify(this.state) === JSON.stringify(state)) {

        // The specified desired records state is equal to the local desired records state
        this.log.trace(`${LOG_PREFIX} The specified desired records state is equal to the local desired records state`);

        // Check if the desired data is already available in the local cache
        this.log.trace(`${LOG_PREFIX} Checking if the desired data is already available in the local cache`);

        if (this.visualisationVariablesSubject$.value.length > 0) {

          // The desired data is already available in the local cache
          this.log.trace(`${LOG_PREFIX} The desired data is already available in the local cache`);

          // Return the locally cached data
          this.log.trace(`${LOG_PREFIX} Returning the locally cached data`);

          return of(this.visualisationVariablesSubject$.value);

        }

      } else {

        // The specified desired records state is not equal to the local desired records state
        this.log.trace(`${LOG_PREFIX} The specified desired records state is not equal to the local desired records state`);

        // Check if the local desired records state needs updating
        this.log.trace(`${LOG_PREFIX} Checking if the local desired records state needs updating`);
        if (cache) {

          // The local desired records state needs updating
          this.log.trace(`${LOG_PREFIX} The local desired records state needs updating`);

          // Update the local desired records state 
          this.log.trace(`${LOG_PREFIX} Updating the local desired records state `);
          this.state = Object.assign({}, state);

        } else {

          // The local desired records state does not need updating
          this.log.trace(`${LOG_PREFIX} The local desired records state does not need updating`);

        }

      }


    } else {

      // The desired records state has not been specified
      this.log.trace(`${LOG_PREFIX} The desired records state has not been specified`);

      // Check if the desired data is already available in the local cache
      this.log.trace(`${LOG_PREFIX} Checking if the desired data is already available in the local cache`);

      if (this.visualisationVariablesSubject$.value.length > 0) {

        // The desired data is already available in the local cache
        this.log.trace(`${LOG_PREFIX} The desired data is already available in the local cache`);

        // Return the locally cached data
        this.log.trace(`${LOG_PREFIX} Returning the locally cached data`);

        return of(this.visualisationVariablesSubject$.value);

      }

    }


    // Get a fresh set of Visualisation Variables Records from the backend
    this.log.trace(`${LOG_PREFIX} Getting a fresh set of Visualisation Variables Records from the backend`);
    return this.getFreshVisualisationsVariables(cache, state);

  }


  /**
   * Retrieves a fresh set of Visualisation Variables Records from the backend
   * 
   * @param cache Whether the results should be locally cached if freshly retrieved from the database
   * @param state The desired records state
   * @returns The Visualisation Variables Records
   */
  private getFreshVisualisationsVariables(cache: boolean, state: VisualisationVariableState): Observable<VisualisationVariable[]> {

    this.log.trace(`${LOG_PREFIX} Entering getFreshVisualisationsVariables()`);

    // Set the loading status to true
    this.log.trace(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Collate the query parameters
    this.log.debug(`${LOG_PREFIX} Collating the query parameters`);
    const parameters: any = this.getQueryParams(state);


    // Make a HTTP GET Request to retrieve the records
    this.log.debug(`${LOG_PREFIX} Making a HTTP GET Request to ${this.url} to retrieve the fresh set of records`);
    return this.http.get<VisualisationVariable[]>(`${this.url}`, { headers: new HttpHeaders(HEADERS), params: new HttpParams({ fromObject: parameters }), observe: 'response' })
      .pipe(

        map((res: HttpResponse<any>) => {

          // Visualisation Variables Records Retrieval was successful
          this.log.trace(`${LOG_PREFIX} Visualisation Variables Records Retrieval was successful`);
          this.log.debug(`${LOG_PREFIX} Retrieved Records = ${JSON.stringify(res.body)}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          // Check if the results should be locally cached
          this.log.trace(`${LOG_PREFIX} Checking if the results should be locally cached`);

          if (cache) {

            // The results should be locally cached
            this.log.trace(`${LOG_PREFIX} The results should be locally cached`);

            // Add the total results to the locale cache and broadcast the update
            this.log.trace(`${LOG_PREFIX} Adding the total results to the locale cache and broadcast the update`);
            const totals: string | null = res.headers.get('X-Total-Count');
            this.totalRecordsSubject$.next(totals ? parseInt(totals) : 0);

            // Add the actual results to the locale cache and broadcast the update
            this.log.trace(`${LOG_PREFIX} Adding the actual results to the locale cache and broadcast the update`);
            this.visualisationVariablesSubject$.next(res.body);

          } else {

            // The results should not be locally cached
            this.log.trace(`${LOG_PREFIX} The results should not be locally cached`);

          }

          return res.body;

        }),

        catchError((error: any) => {

          // Visualisation Variables Records Retrieval was unsuccessful
          this.log.error(`${LOG_PREFIX} Visualisation Variables Records Retrieval was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);

        }));
  }



  /**
   * Updates a single Visualisation Variable Record
   * 
   * @param visualisationVariable The details of the Visualisation Variable Record to be updated
   * @returns the updated Visualisation Variable Record
   */
  public updateVisualisationVariable(visualisationVariable: VisualisationVariable): Observable<VisualisationVariable> {

    this.log.trace(`${LOG_PREFIX} Entering updateVisualisationVariable()`);
    this.log.debug(`${LOG_PREFIX} Visualisation Variable = ${JSON.stringify(visualisationVariable)}`);

    // Set the loading status to true
    this.log.trace(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Make a HTTP POST Request to update the record
    this.log.debug(`${LOG_PREFIX} Making a HTTP POST Request to ${this.url}/${visualisationVariable.id} to update the record`);
    return this.http.put<VisualisationVariable>(`${this.url}/${visualisationVariable.id} `, JSON.stringify(visualisationVariable), { headers: new HttpHeaders(HEADERS) })
      .pipe(

        tap((data: VisualisationVariable) => {

          // Visualisation Variable Record Update was successful
          this.log.trace(`${LOG_PREFIX} Visualisation Variable Record Update was successful`);
          this.log.debug(`${LOG_PREFIX} Updated Record = ${JSON.stringify(data)}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          // Refresh the records / record count
          this.log.trace(`${LOG_PREFIX} Refreshing the records / record count`);
          this.getFreshVisualisationsVariables(true, this.state).subscribe();


        }),

        catchError((error: any) => {

          // Visualisation Variable Record Update was unsuccessful
          this.log.error(`${LOG_PREFIX} Visualisation Variable Record Update was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);

        }));
  }


  /**
   * Deletes a single Visualisation Variable Record
   *
   * @param visualisationVariableId The id of the Visualisation Variable Record to be deleted
   */
  public deleteVisualisationVariable(visualisationVariableId: number): Observable<void> {

    this.log.trace(`${LOG_PREFIX} Entering deleteVisualisationVariable()`);
    this.log.debug(`${LOG_PREFIX} Visualisation Variable Id = ${visualisationVariableId}`);

    // Make a HTTP DELETE Request to delete the records
    this.log.debug(`${LOG_PREFIX} Making a HTTP DELETE Request to ${this.url}/${visualisationVariableId} to delete the record`);

    return this.http.delete<void>(`${this.url}/${visualisationVariableId}`, { headers: new HttpHeaders(HEADERS) })
      .pipe(

        tap(() => {

          // Visualisation Variable Record Deletion was successful
          this.log.trace(`${LOG_PREFIX} Visualisation Variable Record Deletion was successful`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          // Refresh the records / record count
          this.log.trace(`${LOG_PREFIX} Refreshing the records / record count`);
          this.getFreshVisualisationsVariables(true, this.state).subscribe();

        }),

        catchError((error: any) => {

          // Visualisation Variable Record Deletion was unsuccessful
          this.log.error(`${LOG_PREFIX} Visualisation Variable Record Deletion was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);
        }));
  }


  /**
   * Retrieves the total retrievable records as per the specified query
   */
  public get count(): number {
    return this.totalRecordsSubject$.value;
  }

  /**
   * Retrieves the records that correspond to the current pagination page
   */
  public get records(): VisualisationVariable[] {
    return this.visualisationVariablesSubject$.value;
  }

  /**
   * Collates query parameters that correspond to the currently set required records state
   * @state The target state
   * @returns The query parameters
   */
   private getQueryParams(state: VisualisationVariableState): any {

    this.log.trace(`${LOG_PREFIX} Entering getQueryParams()`);
    this.log.debug(`${LOG_PREFIX} State = ${JSON.stringify(state)}`);

    // Collate the query parameters
    this.log.trace(`${LOG_PREFIX} Collating query parameters`);
    let params: any = {}

    if (state.id) {
      this.log.trace(`${LOG_PREFIX} Adding id parameter`);
      params['id']=state.id;
    }

    if (state.visualisationId) {
      this.log.trace(`${LOG_PREFIX} Adding visualisation id parameter`);
      environment.production? params['visualisationId']=state.visualisationId : params['data.visualisationId']=state.visualisationId;
    }

    if (state.indicatorId) {
      this.log.trace(`${LOG_PREFIX} Adding indicator id parameter`);
      environment.production? params['indicatorId']=state.indicatorId : params['data.indicatorId']=state.indicatorId;
    }

    if (state.roleId) {
      this.log.trace(`${LOG_PREFIX} Adding role id parameter`);
      environment.production? params['roleId']=state.roleId : params['data.roleId']=state.roleId;
    }

    if (state.page) {
      this.log.trace(`${LOG_PREFIX} Adding page parameter`);
      params['_page']=state.page;
    }

    if (state.pageSize) {
      this.log.trace(`${LOG_PREFIX} Adding limit`);
      params['_limit']=state.pageSize;
    }    

    if (state.sortColumn) {
      this.log.trace(`${LOG_PREFIX} Adding sort parameter`);
      params['_sort']=state.sortColumn;
    }

    if (state.sortDirection) {
      this.log.trace(`${LOG_PREFIX} Adding sort direction parameter`);
      params['_order']=state.sortDirection;
    }

    return params;
  }
}
