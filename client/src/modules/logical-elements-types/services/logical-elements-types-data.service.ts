import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { NGXLogger } from 'ngx-logger';
import { LogicalElementType } from '../models/logical-element-type.model';
import { environment } from 'environments/environment';
import { catchError, map, tap } from 'rxjs/operators';
import { LogicalElementTypeState } from '../models/logical-element-type-state.model';

const LOG_PREFIX: string = "[Logical Elements Types Data Service]";
const HEADERS = { 'Content-Type': 'application/json' };

@Injectable({
  providedIn: 'root'
})
export class LogicalElementsTypesDataService {

  // Keeps tabs of the default url string
  private url: string = environment.production ?
    `${environment.urls.api}/api/v1/logical_elements_types` :
    `${environment.urls.api}/logical_elements_types`;

  // Keeps tabs of the user defined search or sort criteria.
  private state: LogicalElementTypeState = {
    searchTerm: null,
    page: 1,
    pageSize: 20,
    sortColumn: 'name',
    sortDirection: 'asc',
    name: null,
    plural: null
  };

  // Keeps tabs of the logicalElementsTypes
  private logicalElementsTypesSubject$ = new BehaviorSubject<LogicalElementType[]>([]);
  readonly logicalElementsTypes$ = this.logicalElementsTypesSubject$.asObservable();

  // Keeps tabs of the total logicalElementsTypes (irregardless of pagination)
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
   * Creates a new Logical Element Type Record
   * 
   * @param logicalElementType the details of the Logical Element Type Record to be created
   * @returns the newly created Logical Element Type Record
   */
  public createLogicalElementType(logicalElementType: LogicalElementType): Observable<LogicalElementType> {

    this.log.trace(`${LOG_PREFIX} Entering createLogicalElementType()`);
    this.log.debug(`${LOG_PREFIX} Logical Element Type = ${JSON.stringify(logicalElementType)}`);

    // Set the loading status to true
    this.log.trace(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Make a HTTP POST Request to create the record
    this.log.debug(`${LOG_PREFIX} Making a HTTP POST Request to ${this.url} to create the record`);
    return this.http.post<LogicalElementType>(`${this.url}`, JSON.stringify(logicalElementType), { headers: new HttpHeaders(HEADERS) })
      .pipe(

        tap((data: LogicalElementType) => {

          // Logical Element Type Record Creation was successful
          this.log.trace(`${LOG_PREFIX} Record Creation was successful`);
          this.log.debug(`${LOG_PREFIX} Created Record = ${JSON.stringify(data)}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          // Refresh the records / record count
          this.log.trace(`${LOG_PREFIX} Refreshing the records / record count`);
          this.getFreshLogicalElementsTypes(true, this.state).subscribe();

        }),

        catchError((error: any) => {

          // Logical Element Type Record Creation was unsuccessful
          this.log.error(`${LOG_PREFIX} Logical Element Type Record Creation was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);

        }));
  }



  /**
   * Retrieves Logical Elements Types Records from the local cache or database
   * 
   * @param cache Whether the results should be locally cached if freshly retrieved from the database
   * @param state The desired records state
   * @returns The Logical Elements Types Records
   */
  public getLogicalElementsTypes(cache: boolean, state: LogicalElementTypeState): Observable<LogicalElementType[]> {

    this.log.trace(`${LOG_PREFIX} Entering getLogicalElementsTypes()`);

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

        if (this.logicalElementsTypesSubject$.value.length > 0) {

          // The desired data is already available in the local cache
          this.log.trace(`${LOG_PREFIX} The desired data is already available in the local cache`);

          // Return the locally cached data
          this.log.trace(`${LOG_PREFIX} Returning the locally cached data`);

          return of(this.logicalElementsTypesSubject$.value);

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

      if (this.logicalElementsTypesSubject$.value.length > 0) {

        // The desired data is already available in the local cache
        this.log.trace(`${LOG_PREFIX} The desired data is already available in the local cache`);

        // Return the locally cached data
        this.log.trace(`${LOG_PREFIX} Returning the locally cached data`);

        return of(this.logicalElementsTypesSubject$.value);

      }

    }


    // Get a fresh set of Logical Elements Types Records from the backend
    this.log.trace(`${LOG_PREFIX} Getting a fresh set of Logical Elements Types Records from the backend`);
    return this.getFreshLogicalElementsTypes(cache, state);

  }


  /**
   * Retrieves a fresh set of Logical Elements Types Records from the backend
   * 
   * @param cache Whether the results should be locally cached if freshly retrieved from the database
   * @param state The desired records state
   * @returns The Logical Elements Types Records
   */  
  private getFreshLogicalElementsTypes(cache: boolean, state: LogicalElementTypeState): Observable<LogicalElementType[]> {

    this.log.trace(`${LOG_PREFIX} Entering getFreshLogicalElementsTypes()`);

    // Set the loading status to true
    this.log.trace(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

        // Collate the query parameters
        this.log.debug(`${LOG_PREFIX} Collating the query parameters`);
        const parameters: any = this.getQueryParams(state);
    

    // Make a HTTP GET Request to retrieve the records
    this.log.debug(`${LOG_PREFIX} Making a HTTP GET Request to ${this.url} to retrieve the fresh set of records`);
    return this.http.get<LogicalElementType[]>(`${this.url}`, { headers: new HttpHeaders(HEADERS), params: new HttpParams({ fromObject: parameters }), observe: 'response' })
      .pipe(

        map((res: HttpResponse<any>) => {

          // Logical Elements Types Records Retrieval was successful
          this.log.trace(`${LOG_PREFIX} Logical Elements Types Records Retrieval was successful`);
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
            this.logicalElementsTypesSubject$.next(res.body);

          } else {

            // The results should not be locally cached
            this.log.trace(`${LOG_PREFIX} The results should not be locally cached`);

          }

          return res.body;

        }),

        catchError((error: any) => {

          // Logical Elements Types Records Retrieval was unsuccessful
          this.log.error(`${LOG_PREFIX} Logical Elements Types Records Retrieval was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);

        }));
  }



  /**
   * Updates a single Logical Element Type Record
   * 
   * @param logicalElementType The details of the Logical Element Type Record to be updated
   * @returns the updated Logical Element Type Record
   */
  public updateLogicalElementType(logicalElementType: LogicalElementType): Observable<LogicalElementType> {

    this.log.trace(`${LOG_PREFIX} Entering updateLogicalElementType()`);
    this.log.debug(`${LOG_PREFIX} Logical Element Type = ${JSON.stringify(logicalElementType)}`);

    // Set the loading status to true
    this.log.trace(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Make a HTTP POST Request to update the record
    this.log.debug(`${LOG_PREFIX} Making a HTTP POST Request to ${this.url}/${logicalElementType.id} to update the record`);
    return this.http.put<LogicalElementType>(`${this.url}/${logicalElementType.id} `, JSON.stringify(logicalElementType), { headers: new HttpHeaders(HEADERS) })
      .pipe(

        tap((data: LogicalElementType) => {

          // Logical Element Type Record Update was successful
          this.log.trace(`${LOG_PREFIX} Logical Element Type Record Update was successful`);
          this.log.debug(`${LOG_PREFIX} Updated Record = ${JSON.stringify(data)}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          // Refresh the records / record count
          this.log.trace(`${LOG_PREFIX} Refreshing the records / record count`);
          this.getFreshLogicalElementsTypes(true, this.state).subscribe();


        }),

        catchError((error: any) => {

          // Logical Element Type Record Update was unsuccessful
          this.log.error(`${LOG_PREFIX} Logical Element Type Record Update was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);

        }));
  }


  /**
   * Deletes a single Logical Element Type Record
   *
   * @param logicalElementTypeId The id of the Logical Element Type Record to be deleted
   */
  public deleteLogicalElementType(logicalElementTypeId: number): Observable<void> {

    this.log.trace(`${LOG_PREFIX} Entering deleteLogicalElementType()`);
    this.log.debug(`${LOG_PREFIX} Logical Element Type Id = ${logicalElementTypeId}`);

    // Make a HTTP DELETE Request to delete the records
    this.log.debug(`${LOG_PREFIX} Making a HTTP DELETE Request to ${this.url}/${logicalElementTypeId} to delete the record`);

    return this.http.delete<void>(`${this.url}/${logicalElementTypeId}`, { headers: new HttpHeaders(HEADERS) })
      .pipe(

        tap(() => {

          // Logical Element Type Record Deletion was successful
          this.log.trace(`${LOG_PREFIX} Logical Element Type Record Deletion was successful`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          // Refresh the records / record count
          this.log.trace(`${LOG_PREFIX} Refreshing the records / record count`);
          this.getFreshLogicalElementsTypes(true, this.state).subscribe();

        }),

        catchError((error: any) => {

          // Logical Element Type Record Deletion was unsuccessful
          this.log.error(`${LOG_PREFIX} Logical Element Type Record Deletion was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

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
  public get records(): LogicalElementType[] {
    return this.logicalElementsTypesSubject$.value;
  }

  /**
   * Collates query parameters that correspond to the currently set required records state
   * @state The target state
   * @returns The query parameters
   */
  private getQueryParams(state: LogicalElementTypeState): any {

    this.log.trace(`${LOG_PREFIX} Entering getQueryParams()`);

    let params: any = {}

    if (state.page) {
      this.log.trace(`${LOG_PREFIX} Adding page parameter`);
      params['_page'] = state.page;
    }

    if (state.pageSize) {
      this.log.trace(`${LOG_PREFIX} Adding limit`);
      params['_limit'] = state.pageSize;
    }

    if (state.name && state.name.trim().length > 0) {
      this.log.trace(`${LOG_PREFIX} Adding name parameter`);
      environment.production ? params['name'] = state.name : params['data.name'] = state.name;
    }

    if (state.plural && state.plural.trim().length > 0) {
      this.log.trace(`${LOG_PREFIX} Adding plural parameter`);
      environment.production ? params['plural'] = state.plural : params['data.plural'] = state.plural;
    }    

    if (state.searchTerm && state.searchTerm.trim().length > 0) {
      this.log.trace(`${LOG_PREFIX} Adding search term parameter`);
      environment.production ? params['q'] = state.searchTerm : params['q'] = state.searchTerm;
    }

    if (state.sortColumn) {
      this.log.trace(`${LOG_PREFIX} Adding sort parameter`);
      environment.production ? params['_sort'] = state.sortColumn : (params['_sort'] = state.sortColumn == "id"? state.sortColumn : "data." + state.sortColumn);
    }

    if (state.sortDirection) {
      this.log.trace(`${LOG_PREFIX} Adding sort direction parameter`);
      params['_order'] = state.sortDirection;
    }

    return params;
  }
  
}
