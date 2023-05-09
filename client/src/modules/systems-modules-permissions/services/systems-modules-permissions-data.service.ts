import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { NGXLogger } from 'ngx-logger';
import { SystemModulePermission } from '../models/system-module-permission.model';
import { environment } from 'environments/environment';
import { catchError, first, map, tap } from 'rxjs/operators';
import { SystemModulePermissionState } from '../models/system-module-permission-state.model';

const LOG_PREFIX: string = "[Systems Modules Permissions Data Service]";
const HEADERS = { 'Content-Type': 'application/json' };

@Injectable({
  providedIn: 'root'
})
export class SystemsModulesPermissionsDataService {

  // Keeps tabs of the default url string
  private url: string = environment.production ?
    `${environment.urls.api}/api/v1/systems_modules_permissions` :
    `${environment.urls.api}/systems_modules_permissions`;

  // Keeps tabs of the user defined search or sort criteria.
  private state: SystemModulePermissionState = {
    page: 1,
    pageSize: 20,
    searchTerm: '',
    sortColumn: 'name',
    sortDirection: 'asc',
    systemModuleId: null,
    code: null,
    name: null
  };

  // Keeps tabs of the systems modules permissions
  private systemsModulesPermissionsSubject$ = new BehaviorSubject<SystemModulePermission[]>([]);
  readonly systemsModulesPermissions$ = this.systemsModulesPermissionsSubject$.asObservable();

  // Keeps tabs of the total systems modules permissions (irregardless of pagination)
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
   * Creates a new System Module Permission Record
   * 
   * @param systemModulePermission the details of the System Module Permission Record to be created
   * @returns the newly created System Module Permission Record
   */
  public createSystemModulePermission(systemModulePermission: SystemModulePermission): Observable<SystemModulePermission> {

    this.log.trace(`${LOG_PREFIX} Entering createSystemModulePermission()`);
    this.log.debug(`${LOG_PREFIX} System Module Permission = ${JSON.stringify(systemModulePermission)}`);

    // Set the loading status to true
    this.log.trace(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Make a HTTP POST Request to create the record
    this.log.debug(`${LOG_PREFIX} Making a HTTP POST Request to ${this.url} to create the record`);
    return this.http.post<SystemModulePermission>(`${this.url}`, JSON.stringify(systemModulePermission), { headers: new HttpHeaders(HEADERS) })
      .pipe(

        tap((data: SystemModulePermission) => {

          // System Module Permission Record Creation was successful
          this.log.trace(`${LOG_PREFIX} Record Creation was successful`);
          this.log.debug(`${LOG_PREFIX} Created Record = ${JSON.stringify(data)}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          // Refresh the records / record count
          this.log.trace(`${LOG_PREFIX} Refreshing the records / record count`);
          this.getSystemsModulesPermissions(true)
            .pipe(first())
            .subscribe();

        }),

        catchError((error: any) => {

          // System Module Permission Record Creation was unsuccessful
          this.log.error(`${LOG_PREFIX} System Module Permission Record Creation was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);

        }));
  }


  /**
   * Retrieves Systems Modules Permissions Records
   * 
   * @param state Optional search or sort criteria
   * @returns The Systems Modules Permissions Records corresponding to the query 
   */
   getSystemsModulesPermissions(cache: boolean, state?: Partial<SystemModulePermissionState>): Observable<SystemModulePermission[]> {

    this.log.trace(`${LOG_PREFIX} Entering getSystemsModulesPermissions()`);

    let targetState: SystemModulePermissionState;

    // Check if the desired records state was specified
    this.log.debug(`${LOG_PREFIX} Checking if the desired records state was specified`);
    if (state) {

      // The desired records state was specified
      this.log.debug(`${LOG_PREFIX} The desired records state was specified`);
      this.log.debug(`${LOG_PREFIX} State = ${JSON.stringify(state)}`);

      // Make a copy of the desired records state
      this.log.trace(`${LOG_PREFIX} Making a copy of the desired records state`);
      let copy: SystemModulePermissionState = Object.assign({}, this.state);

      // Update and use the updated copy of the desired records state as the target desired records state
      this.log.debug(`${LOG_PREFIX} Updating and using the updated copy of the desired records state as the target desired records state`);
      targetState = Object.assign(copy, state);

    } else {

      // The desired records state was not specified
      this.log.debug(`${LOG_PREFIX} The desired records state was not specified`);

      // Use the default desired records state as the target desired state
      this.log.debug(`${LOG_PREFIX} Using the default desired records state as the target desired records state`);
      targetState = this.state;

    }

    // Set the loading status to true
    this.log.trace(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Make a HTTP GET Request to retrieve the records
    this.log.debug(`${LOG_PREFIX} Making a HTTP GET Request to ${this.url} to retrieve the records`);
    return this.http.get<SystemModulePermission[]>(`${this.url}`, { headers: new HttpHeaders(HEADERS), params: new HttpParams({ fromObject: this.getQueryParams(targetState) }), observe: 'response' })
      .pipe(

        map((res: HttpResponse<any>) => {

          // Systems Modules Permissions Records Retrieval was successful
          this.log.trace(`${LOG_PREFIX} Systems Modules Permissions Records Retrieval was successful`);
          this.log.debug(`${LOG_PREFIX} Retrieved Records = ${JSON.stringify(res.body)}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);


          // Check if the results should be locally cached and broadcasted
          this.log.debug(`${LOG_PREFIX} Checking if the results should be locally cached and broadcasted`);
          if (cache) {

            // The results should be locally cached and broadcasted
            this.log.debug(`${LOG_PREFIX} The results should be locally cached and broadcasted`);

            // Broadcast the record count
            this.log.trace(`${LOG_PREFIX} Broadcasting the record count`);
            const totals: string | null = res.headers.get('X-Total-Count');
            this.totalRecordsSubject$.next(totals ? parseInt(totals) : 0);

            // Broadcast the records
            this.log.trace(`${LOG_PREFIX} Broadcasting the records`);
            this.systemsModulesPermissionsSubject$.next(res.body);

            // Update the local desired records state
            this.log.debug(`${LOG_PREFIX} Updating the local desired records state`);
            this.state = targetState;

          } else {

            // The results should not be locally cached and broadcasted
            this.log.debug(`${LOG_PREFIX} The results should not be locally cached and broadcasted`);

            // Ignore results
            this.log.debug(`${LOG_PREFIX} Ignoring results`);

          }

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          return res.body;

        }),

        catchError((error: any) => {

          // Systems Modules Permissions Records Retrieval was unsuccessful
          this.log.error(`${LOG_PREFIX} Systems Modules Permissions Records Retrieval was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);

        }));
  }




  /**
   * Updates a single System Module Permission Record
   * 
   * @param systemModulePermission The details of the System Module Permission Record to be updated
   * @returns the updated System Module Permission Record
   */
  updateSystemModulePermission(systemModulePermission: SystemModulePermission): Observable<SystemModulePermission> {

    this.log.trace(`${LOG_PREFIX} Entering updateSystemModulePermission()`);
    this.log.debug(`${LOG_PREFIX} System Module Permission = ${JSON.stringify(systemModulePermission)}`);

    // Set the loading status to true
    this.log.trace(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Make a HTTP POST Request to update the record
    this.log.debug(`${LOG_PREFIX} Making a HTTP POST Request to ${this.url}/${systemModulePermission.id} to update the record`);
    return this.http.put<SystemModulePermission>(`${this.url}/${systemModulePermission.id} `, JSON.stringify(systemModulePermission), { headers: new HttpHeaders(HEADERS) })
      .pipe(

        tap((data: SystemModulePermission) => {

          // System Module Permission Record Update was successful
          this.log.trace(`${LOG_PREFIX} System Module Permission Record Update was successful`);
          this.log.debug(`${LOG_PREFIX} Updated Record = ${JSON.stringify(data)}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          // Refresh the records / record count
          this.log.trace(`${LOG_PREFIX} Refreshing the records / record count`);
          this.getSystemsModulesPermissions(true)
            .pipe(first())
            .subscribe();


        }),

        catchError((error: any) => {

          // System Module Permission Record Update was unsuccessful
          this.log.error(`${LOG_PREFIX} System Module Permission Record Update was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);

        }));
  }


  /**
   * Deletes a single System Module Permission Record
   *
   * @param systemModulePermissionId The id of the System Module Permission Record to be deleted
   */
  deleteSystemModulePermission(systemModulePermissionId: number): Observable<void> {

    this.log.trace(`${LOG_PREFIX} Entering deleteSystemModulePermission()`);
    this.log.debug(`${LOG_PREFIX} System Module Permission Id = ${systemModulePermissionId}`);

    // Make a HTTP DELETE Request to delete the records
    this.log.debug(`${LOG_PREFIX} Making a HTTP DELETE Request to ${this.url}/${systemModulePermissionId} to delete the record`);

    return this.http.delete<void>(`${this.url}/${systemModulePermissionId}`, { headers: new HttpHeaders(HEADERS) })
      .pipe(

        tap(() => {

          // System Module Permission Record Deletion was successful
          this.log.trace(`${LOG_PREFIX} System Module Permission Record Deletion was successful`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          // Refresh the records / record count
          this.log.trace(`${LOG_PREFIX} Refreshing the records / record count`);
          this.getSystemsModulesPermissions(true)
            .pipe(first())
            .subscribe();

        }),

        catchError((error: any) => {

          // System Module Permission Record Deletion was unsuccessful
          this.log.error(`${LOG_PREFIX} System Module Permission Record Deletion was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);
        }));
  }


  private getQueryParams(targetState: SystemModulePermissionState): any {

    // Collate the query parameters
    this.log.trace(`${LOG_PREFIX} Collating query parameters`);
    this.log.debug(`${LOG_PREFIX} State = ${JSON.stringify(targetState)}`);
    let params: any = {}  
    
    if (targetState.systemModuleId) {
      this.log.trace(`${LOG_PREFIX} Adding system module id parameter`);
      environment.production ? params['systemModuleId'] = targetState.systemModuleId : params['data.systemModuleId'] = targetState.systemModuleId;
    }     

    if (targetState.code && targetState.code.trim().length > 0) {
      this.log.trace(`${LOG_PREFIX} Adding code parameter`);
      environment.production ? params['code'] = targetState.code : params['data.code'] = targetState.code;
    }     
    
    if (targetState.name && targetState.name.trim().length > 0) {
      this.log.trace(`${LOG_PREFIX} Adding name parameter`);
      environment.production ? params['name'] = targetState.name : params['data.name'] = targetState.name;
    }   
  
    if (targetState.searchTerm && targetState.searchTerm.trim().length > 0) {
      this.log.trace(`${LOG_PREFIX} Adding search parameter`);
      environment.production ? params['searchTerm'] = targetState.searchTerm : params['data.name_like'] = targetState.searchTerm;
    }    
    
    if (targetState.page) {
      this.log.trace(`${LOG_PREFIX} Adding page parameter`);
      params['_page'] = targetState.page;
    }

    if (targetState.pageSize) {
      this.log.trace(`${LOG_PREFIX} Adding limit`);
      params['_limit'] = targetState.pageSize;
    }

    if (targetState.sortColumn) {
      this.log.trace(`${LOG_PREFIX} Adding sort parameter`);
      params['_sort'] = targetState.sortColumn;
    }

    if (targetState.sortDirection) {
      this.log.trace(`${LOG_PREFIX} Adding sort direction parameter`);
      params['_order'] = targetState.sortDirection;
    }

    return params;
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
  public get records(): SystemModulePermission[] {
    return this.systemsModulesPermissionsSubject$.value;
  }


}