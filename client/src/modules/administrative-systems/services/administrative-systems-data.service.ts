import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { NGXLogger } from 'ngx-logger';
import { AdministrativeSystem } from '../models/administrative-system.model';
import { environment } from 'environments/environment';
import { catchError, map, tap } from 'rxjs/operators';
import { AdministrativeSystemState } from '../models/administrative-system-state.model';

const LOG_PREFIX: string = "[Administrative Systems Data Service]";
const HEADERS = { 'Content-Type': 'application/json' };

@Injectable({
  providedIn: 'root'
})
export class AdministrativeSystemsDataService {

  // Keeps tabs of the default url string
  private url: string = environment.production ?
    `${environment.urls.api}/api/v1/administrative_systems` :
    `${environment.urls.api}/administrative_systems`;

  // Keeps tabs of the user defined search or sort criteria.
  private state: AdministrativeSystemState = {
    searchTerm: null,
    page: 1,
    pageSize: 20,
    sortColumn: 'name',
    sortDirection: 'asc',
    id: null,
    name: null
  };

  // Keeps tabs of the administrativeSystems
  private administrativeSystemsSubject$ = new BehaviorSubject<AdministrativeSystem[]>([]);
  readonly administrativeSystems$ = this.administrativeSystemsSubject$.asObservable();

  // Keeps tabs of the total administrativeSystems (irregardless of pagination)
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
   * Creates a new Administrative System Record
   * 
   * @param administrativeSystem the details of the Administrative System Record to be created
   * @returns the newly created Administrative System Record
   */
  public createAdministrativeSystem(administrativeSystem: AdministrativeSystem): Observable<AdministrativeSystem> {

    this.log.trace(`${LOG_PREFIX} Entering createAdministrativeSystem()`);
    this.log.debug(`${LOG_PREFIX} Administrative System = ${JSON.stringify(administrativeSystem)}`);

    // Set the loading status to true
    this.log.debug(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Make a HTTP POST Request to create the record
    this.log.debug(`${LOG_PREFIX} Making a HTTP POST Request to ${this.url} to create the record`);
    return this.http.post<AdministrativeSystem>(`${this.url}`, JSON.stringify(administrativeSystem), { headers: new HttpHeaders(HEADERS) })
      .pipe(

        tap((data: AdministrativeSystem) => {

          // Administrative System Record Creation was successful
          this.log.trace(`${LOG_PREFIX} Record Creation was successful`);
          this.log.debug(`${LOG_PREFIX} Created Record = ${JSON.stringify(data)}`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          // Refresh the records / record count
          this.log.trace(`${LOG_PREFIX} Refreshing the records / record count`);
          this.getFreshAdministrativeSystems(true, this.state).subscribe();

        }),

        catchError((error: any) => {

          // Administrative System Record Creation was unsuccessful
          this.log.error(`${LOG_PREFIX} Administrative System Record Creation was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);

        }));
  }



  /**
   * Retrieves Administrative Systems Records from the local cache or database
   * 
   * @param cache Whether the results should be locally cached if freshly retrieved from the database
   * @param state The desired records state
   * @returns The Administrative Systems Records
   */
  public getAdministrativeSystems(cache: boolean, state: AdministrativeSystemState): Observable<AdministrativeSystem[]> {

    this.log.trace(`${LOG_PREFIX} Entering getAdministrativeSystems()`);

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

        if (this.administrativeSystemsSubject$.value.length > 0) {

          // The desired data is already available in the local cache
          this.log.trace(`${LOG_PREFIX} The desired data is already available in the local cache`);

          // Return the locally cached data
          this.log.trace(`${LOG_PREFIX} Returning the locally cached data`);

          return of(this.administrativeSystemsSubject$.value);

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

      if (this.administrativeSystemsSubject$.value.length > 0) {

        // The desired data is already available in the local cache
        this.log.trace(`${LOG_PREFIX} The desired data is already available in the local cache`);

        // Return the locally cached data
        this.log.trace(`${LOG_PREFIX} Returning the locally cached data`);

        return of(this.administrativeSystemsSubject$.value);

      }

    }


    // Get a fresh set of Administrative Systems Records from the backend
    this.log.trace(`${LOG_PREFIX} Getting a fresh set of Administrative Systems Records from the backend`);
    return this.getFreshAdministrativeSystems(cache, state);

  }


  /**
   * Retrieves a fresh set of Administrative Systems Records from the backend
   * 
   * @param cache Whether the results should be locally cached if freshly retrieved from the database
   * @param state The desired records state
   * @returns The Administrative Systems Records
   */  
  private getFreshAdministrativeSystems(cache: boolean, state: AdministrativeSystemState): Observable<AdministrativeSystem[]> {

    this.log.trace(`${LOG_PREFIX} Entering getFreshAdministrativeSystems()`);

    // Set the loading status to true
    this.log.debug(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

        // Collate the query parameters
        this.log.debug(`${LOG_PREFIX} Collating the query parameters`);
        const parameters: any = this.getQueryParams(state);
    

    // Make a HTTP GET Request to retrieve the records
    this.log.debug(`${LOG_PREFIX} Making a HTTP GET Request to ${this.url} to retrieve the fresh set of records`);
    return this.http.get<AdministrativeSystem[]>(`${this.url}`, { headers: new HttpHeaders(HEADERS), params: new HttpParams({ fromObject: parameters }), observe: 'response' })
      .pipe(

        map((res: HttpResponse<any>) => {

          // Administrative Systems Records Retrieval was successful
          this.log.trace(`${LOG_PREFIX} Administrative Systems Records Retrieval was successful`);
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
            this.administrativeSystemsSubject$.next(res.body);

          } else {

            // The results should not be locally cached
            this.log.trace(`${LOG_PREFIX} The results should not be locally cached`);

          }

          return res.body;

        }),

        catchError((error: any) => {

          // Administrative Systems Records Retrieval was unsuccessful
          this.log.error(`${LOG_PREFIX} Administrative Systems Records Retrieval was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);

        }));
  }



  /**
   * Updates a single Administrative System Record
   * 
   * @param administrativeSystem The details of the Administrative System Record to be updated
   * @returns the updated Administrative System Record
   */
  public updateAdministrativeSystem(administrativeSystem: AdministrativeSystem): Observable<AdministrativeSystem> {

    this.log.trace(`${LOG_PREFIX} Entering updateAdministrativeSystem()`);
    this.log.debug(`${LOG_PREFIX} Administrative System = ${JSON.stringify(administrativeSystem)}`);

    // Set the loading status to true
    this.log.debug(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Make a HTTP POST Request to update the record
    this.log.debug(`${LOG_PREFIX} Making a HTTP POST Request to ${this.url}/${administrativeSystem.id} to update the record`);
    return this.http.put<AdministrativeSystem>(`${this.url}/${administrativeSystem.id} `, JSON.stringify(administrativeSystem), { headers: new HttpHeaders(HEADERS) })
      .pipe(

        tap((data: AdministrativeSystem) => {

          // Administrative System Record Update was successful
          this.log.trace(`${LOG_PREFIX} Administrative System Record Update was successful`);
          this.log.debug(`${LOG_PREFIX} Updated Record = ${JSON.stringify(data)}`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          // Refresh the records / record count
          this.log.trace(`${LOG_PREFIX} Refreshing the records / record count`);
          this.getFreshAdministrativeSystems(true, this.state).subscribe();


        }),

        catchError((error: any) => {

          // Administrative System Record Update was unsuccessful
          this.log.error(`${LOG_PREFIX} Administrative System Record Update was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);

        }));
  }


  /**
   * Deletes a single Administrative System Record
   *
   * @param administrativeSystemId The id of the Administrative System Record to be deleted
   */
  public deleteAdministrativeSystem(administrativeSystemId: number): Observable<void> {

    this.log.trace(`${LOG_PREFIX} Entering deleteAdministrativeSystem()`);
    this.log.debug(`${LOG_PREFIX} Administrative System Id = ${administrativeSystemId}`);

    // Make a HTTP DELETE Request to delete the records
    this.log.debug(`${LOG_PREFIX} Making a HTTP DELETE Request to ${this.url}/${administrativeSystemId} to delete the record`);

    return this.http.delete<void>(`${this.url}/${administrativeSystemId}`, { headers: new HttpHeaders(HEADERS) })
      .pipe(

        tap(() => {

          // Administrative System Record Deletion was successful
          this.log.trace(`${LOG_PREFIX} Administrative System Record Deletion was successful`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          // Refresh the records / record count
          this.log.trace(`${LOG_PREFIX} Refreshing the records / record count`);
          this.getFreshAdministrativeSystems(true, this.state).subscribe();

        }),

        catchError((error: any) => {

          // Administrative System Record Deletion was unsuccessful
          this.log.error(`${LOG_PREFIX} Administrative System Record Deletion was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

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
  public get records(): AdministrativeSystem[] {
    return this.administrativeSystemsSubject$.value;
  }

  /**
   * Collates query parameters that correspond to the currently set required records state
   * @state The target state
   * @returns The query parameters
   */
  private getQueryParams(state: AdministrativeSystemState): any {

    this.log.trace(`${LOG_PREFIX} Entering getQueryParams()`);

    let params: any = {}

    if (state.id) {
      this.log.trace(`${LOG_PREFIX} Adding id parameter`);
      params['id'] = state.id;
    }    

    if (state.name && state.name.trim().length > 0) {
      this.log.trace(`${LOG_PREFIX} Adding name parameter`);
      environment.production ? params['name'] = state.name : params['data.name'] = state.name;
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

    if (state.page) {
      this.log.trace(`${LOG_PREFIX} Adding page parameter`);
      params['_page'] = state.page;
    }

    if (state.pageSize) {
      this.log.trace(`${LOG_PREFIX} Adding limit`);
      params['_limit'] = state.pageSize;
    }    

    return params;
  }
  
}
