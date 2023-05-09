import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { NGXLogger } from 'ngx-logger';
import { SystemUserRight } from '../models/system-user-right.model';
import { environment } from 'environments/environment';
import { catchError, map, tap } from 'rxjs/operators';
import { SystemUserRightState } from '../models/system-user-right-state.model';

const LOG_PREFIX: string = "[Systems Users Rights Data Service]";
const HEADERS = { 'Content-Type': 'application/json' };

@Injectable({
  providedIn: 'root'
})
export class SystemsUsersRightsDataService {

  // Keeps tabs of the default url string
  private url: string = environment.production ?
    `${environment.urls.api}/api/v1/systems_users_rights` :
    `${environment.urls.api}/systems_users_rights`;

  // Keeps tabs of the user defined search or sort criteria.
  private state: SystemUserRightState = {
    searchTerm: null,
    page: 1,
    pageSize: 20,
    sortColumn: 'name',
    sortDirection: 'asc',
    id: null,
    systemUserId: null,
    contextId: null
  };

  // Keeps tabs of the systemsUsersRights
  private systemsUsersRightsSubject$ = new BehaviorSubject<SystemUserRight[]>([]);
  readonly systemsUsersRights$ = this.systemsUsersRightsSubject$.asObservable();

  // Keeps tabs of the total systemsUsersRights (irregardless of pagination)
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
   * Creates a new System User Right Record
   * 
   * @param systemUserRight the details of the System User Right Record to be created
   * @returns the newly created System User Right Record
   */
  public createSystemUserRight(systemUserRight: SystemUserRight): Observable<SystemUserRight> {

    this.log.trace(`${LOG_PREFIX} Entering createSystemUserRight()`);
    this.log.debug(`${LOG_PREFIX} System User Right = ${JSON.stringify(systemUserRight)}`);

    // Set the loading status to true
    this.log.debug(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Make a HTTP POST Request to create the record
    this.log.debug(`${LOG_PREFIX} Making a HTTP POST Request to ${this.url} to create the record`);
    return this.http.post<SystemUserRight>(`${this.url}`, JSON.stringify(systemUserRight), { headers: new HttpHeaders(HEADERS) })
      .pipe(

        tap((data: SystemUserRight) => {

          // System User Right Record Creation was successful
          this.log.trace(`${LOG_PREFIX} Record Creation was successful`);
          this.log.debug(`${LOG_PREFIX} Created Record = ${JSON.stringify(data)}`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          // Refresh the records / record count
          this.log.trace(`${LOG_PREFIX} Refreshing the records / record count`);
          this.getFreshSystemsUsersRights(true, this.state).subscribe();

        }),

        catchError((error: any) => {

          // System User Right Record Creation was unsuccessful
          this.log.error(`${LOG_PREFIX} System User Right Record Creation was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);

        }));
  }



  /**
   * Retrieves Systems Users Rights Records from the local cache or database
   * 
   * @param cache Whether the results should be locally cached if freshly retrieved from the database
   * @param state The desired records state
   * @returns The Systems Users Rights Records
   */
  public getSystemsUsersRights(cache: boolean, state: SystemUserRightState): Observable<SystemUserRight[]> {

    this.log.trace(`${LOG_PREFIX} Entering getSystemsUsersRights()`);

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

        if (this.systemsUsersRightsSubject$.value.length > 0) {

          // The desired data is already available in the local cache
          this.log.trace(`${LOG_PREFIX} The desired data is already available in the local cache`);

          // Return the locally cached data
          this.log.trace(`${LOG_PREFIX} Returning the locally cached data`);

          return of(this.systemsUsersRightsSubject$.value);

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

      if (this.systemsUsersRightsSubject$.value.length > 0) {

        // The desired data is already available in the local cache
        this.log.trace(`${LOG_PREFIX} The desired data is already available in the local cache`);

        // Return the locally cached data
        this.log.trace(`${LOG_PREFIX} Returning the locally cached data`);

        return of(this.systemsUsersRightsSubject$.value);

      }

    }


    // Get a fresh set of Systems Users Rights Records from the backend
    this.log.trace(`${LOG_PREFIX} Getting a fresh set of Systems Users Rights Records from the backend`);
    return this.getFreshSystemsUsersRights(cache, state);

  }


  /**
   * Retrieves a fresh set of Systems Users Rights Records from the backend
   * 
   * @param cache Whether the results should be locally cached if freshly retrieved from the database
   * @param state The desired records state
   * @returns The Systems Users Rights Records
   */  
  private getFreshSystemsUsersRights(cache: boolean, state: SystemUserRightState): Observable<SystemUserRight[]> {

    this.log.trace(`${LOG_PREFIX} Entering getFreshSystemsUsersRights()`);

    // Set the loading status to true
    this.log.debug(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Make a HTTP GET Request to retrieve the records
    this.log.debug(`${LOG_PREFIX} Making a HTTP GET Request to ${this.url} to retrieve the fresh set of records`);
    return this.http.get<SystemUserRight[]>(`${this.url}`, { headers: new HttpHeaders(HEADERS), params: this.getQueryParams(state), observe: 'response' })
      .pipe(

        map((res: HttpResponse<any>) => {

          // Systems Users Rights Records Retrieval was successful
          this.log.trace(`${LOG_PREFIX} Systems Users Rights Records Retrieval was successful`);
          this.log.debug(`${LOG_PREFIX} Retrieved Records = ${JSON.stringify(res.body)}`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
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
            this.systemsUsersRightsSubject$.next(res.body);

          } else {

            // The results should not be locally cached
            this.log.trace(`${LOG_PREFIX} The results should not be locally cached`);

          }

          return res.body;

        }),

        catchError((error: any) => {

          // Systems Users Rights Records Retrieval was unsuccessful
          this.log.error(`${LOG_PREFIX} Systems Users Rights Records Retrieval was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);

        }));
  }



  /**
   * Updates a single System User Right Record
   * 
   * @param systemUserRight The details of the System User Right Record to be updated
   * @returns the updated System User Right Record
   */
  public updateSystemUserRight(systemUserRight: SystemUserRight): Observable<SystemUserRight> {

    this.log.trace(`${LOG_PREFIX} Entering updateSystemUserRight()`);
    this.log.debug(`${LOG_PREFIX} System User Right = ${JSON.stringify(systemUserRight)}`);

    // Set the loading status to true
    this.log.debug(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Make a HTTP POST Request to update the record
    this.log.debug(`${LOG_PREFIX} Making a HTTP POST Request to ${this.url}/${systemUserRight.id} to update the record`);
    return this.http.put<SystemUserRight>(`${this.url}/${systemUserRight.id} `, JSON.stringify(systemUserRight), { headers: new HttpHeaders(HEADERS) })
      .pipe(

        tap((data: SystemUserRight) => {

          // System User Right Record Update was successful
          this.log.trace(`${LOG_PREFIX} System User Right Record Update was successful`);
          this.log.debug(`${LOG_PREFIX} Updated Record = ${JSON.stringify(data)}`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          // Refresh the records / record count
          this.log.trace(`${LOG_PREFIX} Refreshing the records / record count`);
          this.getFreshSystemsUsersRights(true, this.state).subscribe();


        }),

        catchError((error: any) => {

          // System User Right Record Update was unsuccessful
          this.log.error(`${LOG_PREFIX} System User Right Record Update was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);

        }));
  }


  /**
   * Deletes a single System User Right Record
   *
   * @param systemUserRightId The id of the System User Right Record to be deleted
   */
  public deleteSystemUserRight(systemUserRightId: number): Observable<void> {

    this.log.trace(`${LOG_PREFIX} Entering deleteSystemUserRight()`);
    this.log.debug(`${LOG_PREFIX} System User Right Id = ${systemUserRightId}`);

    // Make a HTTP DELETE Request to delete the records
    this.log.debug(`${LOG_PREFIX} Making a HTTP DELETE Request to ${this.url}/${systemUserRightId} to delete the record`);

    return this.http.delete<void>(`${this.url}/${systemUserRightId}`, { headers: new HttpHeaders(HEADERS) })
      .pipe(

        tap(() => {

          // System User Right Record Deletion was successful
          this.log.trace(`${LOG_PREFIX} System User Right Record Deletion was successful`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          // Refresh the records / record count
          this.log.trace(`${LOG_PREFIX} Refreshing the records / record count`);
          this.getFreshSystemsUsersRights(true, this.state).subscribe();

        }),

        catchError((error: any) => {

          // System User Right Record Deletion was unsuccessful
          this.log.error(`${LOG_PREFIX} System User Right Record Deletion was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
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
  public get records(): SystemUserRight[] {
    return this.systemsUsersRightsSubject$.value;
  }

 
   /**
   * Collates query parameters that correspond to the currently set required records state
   * @state The target state
   * @returns The query parameters
   */
    private getQueryParams(state: SystemUserRightState): HttpParams {

      this.log.trace(`${LOG_PREFIX} Entering getQueryParams()`);
  
      let params: HttpParams = new HttpParams();
  
      if (state.id) {
        this.log.trace(`${LOG_PREFIX} Adding id parameter`);
        params = params.append("id", state.id);
      }    
  
      if (state.systemUserId){
        this.log.trace(`${LOG_PREFIX} Adding system user id parameter`);
        environment.production ? params = params.append("user.id", state.systemUserId) : params = params.append("data.user.id", state.systemUserId);
      } 
      
      if (state.contextId){
        this.log.trace(`${LOG_PREFIX} Adding context id parameter`);
        environment.production ? params = params.append("context.id", state.contextId) : params = params.append("data.context.id", state.contextId);
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
