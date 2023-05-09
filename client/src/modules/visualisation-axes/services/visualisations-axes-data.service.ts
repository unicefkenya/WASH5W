import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { NGXLogger } from 'ngx-logger';
import { VisualisationAxis } from '../models/visualisation-axis.model';
import { environment } from 'environments/environment';
import { catchError, map, tap } from 'rxjs/operators';
import { VisualisationAxisState } from '../models/visualisation-axis-state.model';

const LOG_PREFIX: string = "[Visualisation Axes Data Service]";
const HEADERS = { 'Content-Type': 'application/json' };

@Injectable({
  providedIn: 'root'
})
export class VisualisationsAxesDataService {

  // Keeps tabs of the default url string
  private url: string = environment.production ?
    `${environment.urls.api}/api/v1/visualisations_axes` :
    `${environment.urls.api}/visualisations_axes`;

  // Keeps tabs of the user defined search or sort criteria.
  private state: VisualisationAxisState = {
    page: 1,
    pageSize: 20,
    searchTerm: null,
    sortColumn: 'name',
    sortDirection: 'asc',
    id: null,
    visualisationId: null,
    axisId: null,
    label: null
  };


  // Keeps tabs of the visualisationAxes
  private visualisationAxesSubject$ = new BehaviorSubject<VisualisationAxis[]>([]);
  readonly visualisationAxes$ = this.visualisationAxesSubject$.asObservable();

  // Keeps tabs of the total visualisationAxes (irregardless of pagination)
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
   * Creates a new Visualisation Axis Record
   * 
   * @param visualisationAxis the details of the Visualisation Axis Record to be created
   * @returns the newly created Visualisation Axis Record
   */
  public createVisualisationAxis(visualisationAxis: VisualisationAxis): Observable<VisualisationAxis> {

    this.log.trace(`${LOG_PREFIX} Entering createVisualisationAxis()`);
    this.log.debug(`${LOG_PREFIX} VisualisationAxis = ${JSON.stringify(visualisationAxis)}`);

    // Set the loading status to true
    this.log.trace(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Make a HTTP POST Request to create the record
    this.log.debug(`${LOG_PREFIX} Making a HTTP POST Request to ${this.url} to create the record`);
    return this.http.post<VisualisationAxis>(`${this.url}`, JSON.stringify(visualisationAxis), { headers: new HttpHeaders(HEADERS) })
      .pipe(

        tap((data: VisualisationAxis) => {

          // Visualisation Axis Record Creation was successful
          this.log.trace(`${LOG_PREFIX} Record Creation was successful`);
          this.log.debug(`${LOG_PREFIX} Created Record = ${JSON.stringify(data)}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          // Refresh the records / record count
          this.log.trace(`${LOG_PREFIX} Refreshing the records / record count`);
          this.getFreshVisualisationsAxes(true, this.state).subscribe();

        }),

        catchError((error: any) => {

          // Visualisation Axis Record Creation was unsuccessful
          this.log.error(`${LOG_PREFIX} Visualisation Axis Record Creation was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);

        }));
  }



  /**
   * Retrieves VisualisationsAxes Records from the local cache or database
   * 
   * @param cache Whether the results should be locally cached if freshly retrieved from the database
   * @param state The desired records state
   * @returns The VisualisationsAxes Records
   */
  public getVisualisationsAxes(cache: boolean, state: VisualisationAxisState): Observable<VisualisationAxis[]> {

    this.log.trace(`${LOG_PREFIX} Entering getVisualisationsAxes()`);

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

        if (this.visualisationAxesSubject$.value.length > 0) {

          // The desired data is already available in the local cache
          this.log.trace(`${LOG_PREFIX} The desired data is already available in the local cache`);

          // Return the locally cached data
          this.log.trace(`${LOG_PREFIX} Returning the locally cached data`);

          return of(this.visualisationAxesSubject$.value);

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

      if (this.visualisationAxesSubject$.value.length > 0) {

        // The desired data is already available in the local cache
        this.log.trace(`${LOG_PREFIX} The desired data is already available in the local cache`);

        // Return the locally cached data
        this.log.trace(`${LOG_PREFIX} Returning the locally cached data`);

        return of(this.visualisationAxesSubject$.value);

      }

    }


    // Get a fresh set of VisualisationsAxes Records from the backend
    this.log.trace(`${LOG_PREFIX} Getting a fresh set of VisualisationsAxes Records from the backend`);
    return this.getFreshVisualisationsAxes(cache, state);

  }


  /**
   * Retrieves a fresh set of VisualisationsAxes Records from the backend
   * 
   * @param cache Whether the results should be locally cached if freshly retrieved from the database
   * @param state The desired records state
   * @returns The VisualisationsAxes Records
   */
  private getFreshVisualisationsAxes(cache: boolean, state: VisualisationAxisState): Observable<VisualisationAxis[]> {

    this.log.trace(`${LOG_PREFIX} Entering getFreshVisualisationsAxes()`);

    // Set the loading status to true
    this.log.trace(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Collate the query parameters
    this.log.debug(`${LOG_PREFIX} Collating the query parameters`);
    const parameters: any = this.getQueryParams(state);


    // Make a HTTP GET Request to retrieve the records
    this.log.debug(`${LOG_PREFIX} Making a HTTP GET Request to ${this.url} to retrieve the fresh set of records`);
    return this.http.get<VisualisationAxis[]>(`${this.url}`, { headers: new HttpHeaders(HEADERS), params: new HttpParams({ fromObject: parameters }), observe: 'response' })
      .pipe(

        map((res: HttpResponse<any>) => {

          // VisualisationsAxes Records Retrieval was successful
          this.log.trace(`${LOG_PREFIX} VisualisationsAxes Records Retrieval was successful`);
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
            this.visualisationAxesSubject$.next(res.body);

          } else {

            // The results should not be locally cached
            this.log.trace(`${LOG_PREFIX} The results should not be locally cached`);

          }

          return res.body;

        }),

        catchError((error: any) => {

          // VisualisationsAxes Records Retrieval was unsuccessful
          this.log.error(`${LOG_PREFIX} VisualisationsAxes Records Retrieval was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);

        }));
  }



  /**
   * Updates a single Visualisation Axis Record
   * 
   * @param visualisationAxis The details of the Visualisation Axis Record to be updated
   * @returns the updated Visualisation Axis Record
   */
  public updateVisualisationAxis(visualisationAxis: VisualisationAxis): Observable<VisualisationAxis> {

    this.log.trace(`${LOG_PREFIX} Entering updateVisualisationAxis()`);
    this.log.debug(`${LOG_PREFIX} VisualisationAxis = ${JSON.stringify(visualisationAxis)}`);

    // Set the loading status to true
    this.log.trace(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Make a HTTP POST Request to update the record
    this.log.debug(`${LOG_PREFIX} Making a HTTP POST Request to ${this.url}/${visualisationAxis.id} to update the record`);
    return this.http.put<VisualisationAxis>(`${this.url}/${visualisationAxis.id} `, JSON.stringify(visualisationAxis), { headers: new HttpHeaders(HEADERS) })
      .pipe(

        tap((data: VisualisationAxis) => {

          // Visualisation Axis Record Update was successful
          this.log.trace(`${LOG_PREFIX} Visualisation Axis Record Update was successful`);
          this.log.debug(`${LOG_PREFIX} Updated Record = ${JSON.stringify(data)}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          // Refresh the records / record count
          this.log.trace(`${LOG_PREFIX} Refreshing the records / record count`);
          this.getFreshVisualisationsAxes(true, this.state).subscribe();


        }),

        catchError((error: any) => {

          // Visualisation Axis Record Update was unsuccessful
          this.log.error(`${LOG_PREFIX} Visualisation Axis Record Update was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);

        }));
  }


  /**
   * Deletes a single Visualisation Axis Record
   *
   * @param visualisationAxisId The id of the Visualisation Axis Record to be deleted
   */
  public deleteVisualisationAxis(visualisationAxisId: number): Observable<void> {

    this.log.trace(`${LOG_PREFIX} Entering deleteVisualisationAxis()`);
    this.log.debug(`${LOG_PREFIX} VisualisationAxis Id = ${visualisationAxisId}`);

    // Make a HTTP DELETE Request to delete the records
    this.log.debug(`${LOG_PREFIX} Making a HTTP DELETE Request to ${this.url}/${visualisationAxisId} to delete the record`);

    return this.http.delete<void>(`${this.url}/${visualisationAxisId}`, { headers: new HttpHeaders(HEADERS) })
      .pipe(

        tap(() => {

          // Visualisation Axis Record Deletion was successful
          this.log.trace(`${LOG_PREFIX} Visualisation Axis Record Deletion was successful`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          // Refresh the records / record count
          this.log.trace(`${LOG_PREFIX} Refreshing the records / record count`);
          this.getFreshVisualisationsAxes(true, this.state).subscribe();

        }),

        catchError((error: any) => {

          // Visualisation Axis Record Deletion was unsuccessful
          this.log.error(`${LOG_PREFIX} Visualisation Axis Record Deletion was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

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
  public get records(): VisualisationAxis[] {
    return this.visualisationAxesSubject$.value;
  }

  /**
   * Collates query parameters that correspond to the currently set required records state
   * @state The target state
   * @returns The query parameters
   */
  private getQueryParams(state: VisualisationAxisState): any {

    this.log.trace(`${LOG_PREFIX} Entering getQueryParams()`);

    let params: any = {}

    if (state.id) {
      this.log.trace(`${LOG_PREFIX} Adding id parameter`);
      params['id']=state.id;
    }      

    if (state.visualisationId) {
      this.log.trace(`${LOG_PREFIX} Adding visualisation id parameter`);
      environment.production? params['visualisationId']=state.visualisationId : params['data.visualisationId']=state.visualisationId;
    }  
    
    if (state.axisId) {
      this.log.trace(`${LOG_PREFIX} Adding axis id parameter`);
      environment.production? params['axisId']=state.axisId : params['data.axisId']=state.axisId;
    }      

    if (state.label && state.label.trim().length > 0) {
      this.log.trace(`${LOG_PREFIX} Adding label parameter`);
      environment.production? params['label']=state.label : params['data.label']=state.label;
    }

    if (state.searchTerm && state.searchTerm.trim().length > 0) {
      this.log.trace(`${LOG_PREFIX} Adding search term parameter`);
      environment.production? params['label_like']=state.searchTerm : params['data.label_like']=state.searchTerm;
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
