import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { NGXLogger } from 'ngx-logger';
import { SystemModule } from '../models/system-module.model';
import { environment } from 'environments/environment';
import { catchError, map, tap } from 'rxjs/operators';
import { SystemModuleState } from '../models/system-module-state.model';

const LOG_PREFIX: string = "[Systems Modules Data Service]";
const HEADERS = { 'Content-Type': 'application/json' };

@Injectable({
  providedIn: 'root'
})
export class SystemsModulesDataService {

  // Keeps tabs of the default url string
  private url: string = environment.production ?
    `${environment.urls.api}/api/v1/systems_modules` :
    `${environment.urls.api}/systems_modules`;

  // Keeps tabs of the user defined search or sort criteria.
  private state: SystemModuleState = {
    searchTerm: null,
    page: 1,
    pageSize: 20,
    sortColumn: 'name',
    sortDirection: 'asc',
    ids: null,
    name: null,
    enabled: null,
    customisable: null
  };

  // Keeps tabs of the systemsModules
  private systemsModulesSubject$ = new BehaviorSubject<SystemModule[]>([]);
  readonly systemsModules$ = this.systemsModulesSubject$.asObservable();

  // Keeps tabs of the total systemsModules (irregardless of pagination)
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
   * Creates a new System Module Record
   * 
   * @param systemModule the details of the System Module Record to be created
   * @returns the newly created System Module Record
   */
  public createSystemModule(systemModule: SystemModule): Observable<SystemModule> {

    this.log.trace(`${LOG_PREFIX} Entering createSystemModule()`);
    this.log.debug(`${LOG_PREFIX} System Module = ${JSON.stringify(systemModule)}`);

    // Set the loading status to true
    this.log.trace(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Make a HTTP POST Request to create the record
    this.log.debug(`${LOG_PREFIX} Making a HTTP POST Request to ${this.url} to create the record`);
    return this.http.post<SystemModule>(`${this.url}`, JSON.stringify(systemModule), { headers: new HttpHeaders(HEADERS) })
      .pipe(

        tap((data: SystemModule) => {

          // System Module Record Creation was successful
          this.log.trace(`${LOG_PREFIX} Record Creation was successful`);
          this.log.debug(`${LOG_PREFIX} Created Record = ${JSON.stringify(data)}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          // Refresh the records / record count
          this.log.trace(`${LOG_PREFIX} Refreshing the records / record count`);
          this.getFreshSystemsModules(true, this.state).subscribe();

        }),

        catchError((error: any) => {

          // System Module Record Creation was unsuccessful
          this.log.error(`${LOG_PREFIX} System Module Record Creation was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);

        }));
  }



  /**
   * Retrieves Systems Modules Records from the local cache or database
   * 
   * @param cache Whether the results should be locally cached if freshly retrieved from the database
   * @param state The desired records state
   * @returns The Systems Modules Records
   */
  public getSystemsModules(cache: boolean, state: SystemModuleState): Observable<SystemModule[]> {

    this.log.trace(`${LOG_PREFIX} Entering getSystemsModules()`);

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

        if (this.systemsModulesSubject$.value.length > 0) {

          // The desired data is already available in the local cache
          this.log.trace(`${LOG_PREFIX} The desired data is already available in the local cache`);

          // Return the locally cached data
          this.log.trace(`${LOG_PREFIX} Returning the locally cached data`);

          return of(this.systemsModulesSubject$.value);

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

      if (this.systemsModulesSubject$.value.length > 0) {

        // The desired data is already available in the local cache
        this.log.trace(`${LOG_PREFIX} The desired data is already available in the local cache`);

        // Return the locally cached data
        this.log.trace(`${LOG_PREFIX} Returning the locally cached data`);

        return of(this.systemsModulesSubject$.value);

      }

    }


    // Get a fresh set of Systems Modules Records from the backend
    this.log.trace(`${LOG_PREFIX} Getting a fresh set of Systems Modules Records from the backend`);
    return this.getFreshSystemsModules(cache, state);

  }


  /**
   * Retrieves a fresh set of Systems Modules Records from the backend
   * 
   * @param cache Whether the results should be locally cached if freshly retrieved from the database
   * @param state The desired records state
   * @returns The Systems Modules Records
   */  
  private getFreshSystemsModules(cache: boolean, state: SystemModuleState): Observable<SystemModule[]> {

    this.log.trace(`${LOG_PREFIX} Entering getFreshSystemsModules()`);

    // Set the loading status to true
    this.log.trace(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);
    

    // Make a HTTP GET Request to retrieve the records
    this.log.debug(`${LOG_PREFIX} Making a HTTP GET Request to ${this.url} to retrieve the fresh set of records`);
    return this.http.get<SystemModule[]>(`${this.url}`, { headers: new HttpHeaders(HEADERS), params: this.getQueryParams(state), observe: 'response' })
      .pipe(

        map((res: HttpResponse<any>) => {

          // Systems Modules Records Retrieval was successful
          this.log.trace(`${LOG_PREFIX} Systems Modules Records Retrieval was successful`);
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
            this.systemsModulesSubject$.next(res.body);

          } else {

            // The results should not be locally cached
            this.log.trace(`${LOG_PREFIX} The results should not be locally cached`);

          }

          return res.body;

        }),

        catchError((error: any) => {

          // Systems Modules Records Retrieval was unsuccessful
          this.log.error(`${LOG_PREFIX} Systems Modules Records Retrieval was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);

        }));
  }



  /**
   * Updates a single System Module Record
   * 
   * @param systemModule The details of the System Module Record to be updated
   * @returns the updated System Module Record
   */
  public updateSystemModule(systemModule: SystemModule): Observable<SystemModule> {

    this.log.trace(`${LOG_PREFIX} Entering updateSystemModule()`);
    this.log.debug(`${LOG_PREFIX} System Module = ${JSON.stringify(systemModule)}`);

    // Set the loading status to true
    this.log.trace(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Make a HTTP POST Request to update the record
    this.log.debug(`${LOG_PREFIX} Making a HTTP POST Request to ${this.url}/${systemModule.id} to update the record`);
    return this.http.put<SystemModule>(`${this.url}/${systemModule.id} `, JSON.stringify(systemModule), { headers: new HttpHeaders(HEADERS) })
      .pipe(

        tap((data: SystemModule) => {

          // System Module Record Update was successful
          this.log.trace(`${LOG_PREFIX} System Module Record Update was successful`);
          this.log.debug(`${LOG_PREFIX} Updated Record = ${JSON.stringify(data)}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          // Refresh the records / record count
          this.log.trace(`${LOG_PREFIX} Refreshing the records / record count`);
          this.getFreshSystemsModules(true, this.state).subscribe();


        }),

        catchError((error: any) => {

          // System Module Record Update was unsuccessful
          this.log.error(`${LOG_PREFIX} System Module Record Update was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);

        }));
  }


  /**
   * Deletes a single System Module Record
   *
   * @param systemModuleId The id of the System Module Record to be deleted
   */
  public deleteSystemModule(systemModuleId: number): Observable<void> {

    this.log.trace(`${LOG_PREFIX} Entering deleteSystemModule()`);
    this.log.debug(`${LOG_PREFIX} System Module Id = ${systemModuleId}`);

    // Make a HTTP DELETE Request to delete the records
    this.log.debug(`${LOG_PREFIX} Making a HTTP DELETE Request to ${this.url}/${systemModuleId} to delete the record`);

    return this.http.delete<void>(`${this.url}/${systemModuleId}`, { headers: new HttpHeaders(HEADERS) })
      .pipe(

        tap(() => {

          // System Module Record Deletion was successful
          this.log.trace(`${LOG_PREFIX} System Module Record Deletion was successful`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          // Refresh the records / record count
          this.log.trace(`${LOG_PREFIX} Refreshing the records / record count`);
          this.getFreshSystemsModules(true, this.state).subscribe();

        }),

        catchError((error: any) => {

          // System Module Record Deletion was unsuccessful
          this.log.error(`${LOG_PREFIX} System Module Record Deletion was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

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
  public get records(): SystemModule[] {
    return this.systemsModulesSubject$.value;
  }

  /**
   * Collates query parameters that correspond to the currently set required records state
   * @state The target state
   * @returns The query parameters
   */
   private getQueryParams(state: SystemModuleState): HttpParams {

    this.log.trace(`${LOG_PREFIX} Entering getQueryParams()`);

    let params: HttpParams = new HttpParams();

    if (state.ids) {
      this.log.trace(`${LOG_PREFIX} Adding id parameters`);
      state.ids.forEach(id => {
        params = params.append("id", id);
      });
    }

    if (state.name) {
      this.log.trace(`${LOG_PREFIX} Adding name parameter`);
      environment.production ? params = params.append("name", state.name) : params = params.append("data.name", state.name);
    }  

    if (state.searchTerm && state.searchTerm.trim().length > 0) {
      this.log.trace(`${LOG_PREFIX} Adding search parameter`);
      environment.production ? params = params.append("q", state.searchTerm) : params = params.append("q", state.searchTerm);
    }

    if (state.enabled) {
      this.log.trace(`${LOG_PREFIX} Adding enabled parameter`);
      environment.production ? params = params.append("enabled", state.enabled) : params = params.append("data.enabled", state.enabled);
    }  
    
    if (state.customisable) {
      this.log.trace(`${LOG_PREFIX} Adding customisable parameter`);
      environment.production ? params = params.append("customisable", state.customisable) : params = params.append("data.customisable", state.customisable);
    }     

    if (state.page) {
      this.log.trace(`${LOG_PREFIX} Adding page parameter`);
      params = params.append("_page",state.page);
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
