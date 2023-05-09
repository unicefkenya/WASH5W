import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { NGXLogger } from 'ngx-logger';
import { LogicalElement } from '../models/logical-element.model';
import { environment } from 'environments/environment';
import { catchError, map, tap } from 'rxjs/operators';
import { LogicalElementState } from '../models/logical-element-state.model';

const LOG_PREFIX: string = "[Logical Elements Data Service]";
const HEADERS = { 'Content-Type': 'application/json' };

@Injectable({
  providedIn: 'root'
})
export class LogicalElementsDataService {

  // Keeps tabs of the default url string
  private url: string = environment.production ?
    `${environment.urls.api}/api/v1/logical_elements` :
    `${environment.urls.api}/logical_elements`;

  // Keeps tabs of the user defined search or sort criteria.
  private state: LogicalElementState = {
    page: 1,
    pageSize: 20,
    searchTerm: null,
    sortColumn: 'name',
    sortDirection: 'asc',
    id: null,
    contextId: null,
    typesIds: null,
    no: null,
    name: null
  };

  // Keeps tabs of the logicalElements
  private logicalElementsSubject$ = new BehaviorSubject<LogicalElement[]>([]);
  readonly logicalElements$ = this.logicalElementsSubject$.asObservable();

  // Keeps tabs of the total logicalElements (irregardless of pagination)
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
   * Creates a new Logical Element Record
   * 
   * @param logicalElement the details of the Logical Element Record to be created
   * @returns the newly created Logical Element Record
   */
  public createLogicalElement(logicalElement: LogicalElement): Observable<LogicalElement> {

    this.log.trace(`${LOG_PREFIX} Entering createLogicalElement()`);
    this.log.debug(`${LOG_PREFIX} Logical Element = ${JSON.stringify(logicalElement)}`);

    // Set the loading status to true
    this.log.trace(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Make a HTTP POST Request to create the record
    this.log.debug(`${LOG_PREFIX} Making a HTTP POST Request to ${this.url} to create the record`);
    return this.http.post<LogicalElement>(`${this.url}`, JSON.stringify(logicalElement), { headers: new HttpHeaders(HEADERS) })
      .pipe(

        tap((data: LogicalElement) => {

          // Logical Element Record Creation was successful
          this.log.trace(`${LOG_PREFIX} Record Creation was successful`);
          this.log.debug(`${LOG_PREFIX} Created Record = ${JSON.stringify(data)}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          // Refresh the records / record count
          this.log.trace(`${LOG_PREFIX} Refreshing the records / record count`);
          this.getFreshLogicalElements(true, this.state).subscribe();

        }),

        catchError((error: any) => {

          // Logical Element Record Creation was unsuccessful
          this.log.error(`${LOG_PREFIX} Logical Element Record Creation was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);

        }));
  }



  /**
   * Retrieves Logical Elements Records from the local cache or database
   * 
   * @param cache Whether the results should be locally cached if freshly retrieved from the database
   * @param state The desired records state
   * @returns The Logical Elements Records
   */
  public getLogicalElements(cache: boolean, state: LogicalElementState): Observable<LogicalElement[]> {

    this.log.trace(`${LOG_PREFIX} Entering getLogicalElements()`);

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

        if (this.logicalElementsSubject$.value.length > 0) {

          // The desired data is already available in the local cache
          this.log.trace(`${LOG_PREFIX} The desired data is already available in the local cache`);

          // Return the locally cached data
          this.log.trace(`${LOG_PREFIX} Returning the locally cached data`);

          return of(this.logicalElementsSubject$.value);

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

      if (this.logicalElementsSubject$.value.length > 0) {

        // The desired data is already available in the local cache
        this.log.trace(`${LOG_PREFIX} The desired data is already available in the local cache`);

        // Return the locally cached data
        this.log.trace(`${LOG_PREFIX} Returning the locally cached data`);

        return of(this.logicalElementsSubject$.value);

      }

    }


    // Get a fresh set of Logical Elements Records from the backend
    this.log.trace(`${LOG_PREFIX} Getting a fresh set of Logical Elements Records from the backend`);
    return this.getFreshLogicalElements(cache, state);

  }


  /**
   * Retrieves a fresh set of Logical Elements Records from the backend
   * 
   * @param cache Whether the results should be locally cached if freshly retrieved from the database
   * @param state The desired records state
   * @returns The Logical Elements Records
   */
  private getFreshLogicalElements(cache: boolean, state: LogicalElementState): Observable<LogicalElement[]> {

    this.log.trace(`${LOG_PREFIX} Entering getFreshLogicalElements()`);

    // Set the loading status to true
    this.log.trace(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Make a HTTP GET Request to retrieve the records
    this.log.debug(`${LOG_PREFIX} Making a HTTP GET Request to ${this.url} to retrieve the fresh set of records`);
    return this.http.get<LogicalElement[]>(`${this.url}`, { headers: new HttpHeaders(HEADERS), params: this.getQueryParams(state), observe: 'response' })
      .pipe(

        map((res: HttpResponse<any>) => {

          // Logical Elements Records Retrieval was successful
          this.log.trace(`${LOG_PREFIX} Logical Elements Records Retrieval was successful`);
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
            this.logicalElementsSubject$.next(res.body);

          } else {

            // The results should not be locally cached
            this.log.trace(`${LOG_PREFIX} The results should not be locally cached`);

          }

          return res.body;

        }),

        catchError((error: any) => {

          // Logical Elements Records Retrieval was unsuccessful
          this.log.error(`${LOG_PREFIX} Logical Elements Records Retrieval was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);

        }));
  }



  /**
   * Updates a single Logical Element Record
   * 
   * @param logicalElement The details of the Logical Element Record to be updated
   * @returns the updated Logical Element Record
   */
  public updateLogicalElement(logicalElement: LogicalElement): Observable<LogicalElement> {

    this.log.trace(`${LOG_PREFIX} Entering updateLogicalElement()`);
    this.log.debug(`${LOG_PREFIX} Logical Element = ${JSON.stringify(logicalElement)}`);

    // Set the loading status to true
    this.log.trace(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Make a HTTP POST Request to update the record
    this.log.debug(`${LOG_PREFIX} Making a HTTP POST Request to ${this.url}/${logicalElement.id} to update the record`);
    return this.http.put<LogicalElement>(`${this.url}/${logicalElement.id} `, JSON.stringify(logicalElement), { headers: new HttpHeaders(HEADERS) })
      .pipe(

        tap((data: LogicalElement) => {

          // Logical Element Record Update was successful
          this.log.trace(`${LOG_PREFIX} Logical Element Record Update was successful`);
          this.log.debug(`${LOG_PREFIX} Updated Record = ${JSON.stringify(data)}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          // Refresh the records / record count
          this.log.trace(`${LOG_PREFIX} Refreshing the records / record count`);
          this.getFreshLogicalElements(true, this.state).subscribe();


        }),

        catchError((error: any) => {

          // Logical Element Record Update was unsuccessful
          this.log.error(`${LOG_PREFIX} Logical Element Record Update was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);

        }));
  }


  /**
   * Deletes a single Logical Element Record
   *
   * @param logicalElementId The id of the Logical Element Record to be deleted
   */
  public deleteLogicalElement(logicalElementId: number): Observable<void> {

    this.log.trace(`${LOG_PREFIX} Entering deleteLogicalElement()`);
    this.log.debug(`${LOG_PREFIX} Logical Element Id = ${logicalElementId}`);

    // Make a HTTP DELETE Request to delete the records
    this.log.debug(`${LOG_PREFIX} Making a HTTP DELETE Request to ${this.url}/${logicalElementId} to delete the record`);

    return this.http.delete<void>(`${this.url}/${logicalElementId}`, { headers: new HttpHeaders(HEADERS) })
      .pipe(

        tap(() => {

          // Logical Element Record Deletion was successful
          this.log.trace(`${LOG_PREFIX} Logical Element Record Deletion was successful`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          // Refresh the records / record count
          this.log.trace(`${LOG_PREFIX} Refreshing the records / record count`);
          this.getFreshLogicalElements(true, this.state).subscribe();

        }),

        catchError((error: any) => {

          // Logical Element Record Deletion was unsuccessful
          this.log.error(`${LOG_PREFIX} Logical Element Record Deletion was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

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
  public get records(): LogicalElement[] {
    return this.logicalElementsSubject$.value;
  }

  /**
   * Collates query parameters that correspond to the currently set required records state
   * @state The target state
   * @returns The query parameters
   */
  private getQueryParams(state: LogicalElementState): HttpParams {

    this.log.trace(`${LOG_PREFIX} Entering getQueryParams()`);

    let params: HttpParams = new HttpParams();

    if (state.id) {
      this.log.trace(`${LOG_PREFIX} Adding id parameter`);
      params = params.append("id", state.id);
    }    

    if (state.contextId) {
      this.log.trace(`${LOG_PREFIX} Adding context id parameter`);
      environment.production ? params = params.append("contextId", state.contextId) : params = params.append("data.contextId", state.contextId);
    }    

    if (state.typesIds) {
      this.log.trace(`${LOG_PREFIX} Adding type parameter`);
      if (environment.production) {

        state.typesIds.forEach(id => {
          params = params.append("typeId", id);
        });
      } else {
        state.typesIds.forEach(id => {
          params = params.append("data.typeId", id);
        });
      }
    }

    if (state.no) {
      this.log.trace(`${LOG_PREFIX} Adding no parameter`);
      environment.production ? params = params.append("no", state.no) : params = params.append("data.no", state.no);
    }    


    if (state.name) {
      this.log.trace(`${LOG_PREFIX} Adding name parameter`);
      environment.production ? params = params.append("name", state.name) : params = params.append("data.name", state.name);
    }

    if (state.searchTerm && state.searchTerm.trim().length > 0) {
      this.log.trace(`${LOG_PREFIX} Adding search parameter`);
      environment.production ? params = params.append("q", state.searchTerm) : params = params.append("q", state.searchTerm);
    }

    if (state.page) {
      this.log.trace(`${LOG_PREFIX} Adding page parameter`);
      params = params.append("_page", state.page);
    }

    if (state.pageSize) {
      this.log.trace(`${LOG_PREFIX} Adding limit`);
      params = params.append("_limit", state.pageSize);
    }

    if (state.sortColumn) {
      this.log.trace(`${LOG_PREFIX} Adding sort parameter`);
      environment.production ? params = params.append("_sort", state.sortColumn) : params = (state.sortColumn == "id"? params.append("_sort", "id") : params.append("_sort", "data. " + state.sortColumn));
    }

    if (state.sortDirection) {
      this.log.trace(`${LOG_PREFIX} Adding sort direction parameter`);
      params = params.append("_order", state.sortDirection);
    }

    return params;
  }

}
