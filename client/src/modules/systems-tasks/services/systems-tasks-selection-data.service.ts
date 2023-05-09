import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { NGXLogger } from 'ngx-logger';
import { SystemTask } from '../models/system-task.model';
import { environment } from 'environments/environment';
import { catchError, map, tap } from 'rxjs/operators';
import { SystemTaskState } from '../models/system-task-state.model';

const LOG_PREFIX: string = "[Systems Tasks Selection Data Service]";
const HEADERS = { 'Content-Type': 'application/json' };

@Injectable({
  providedIn: 'root'
})
export class SystemsTasksSelectionDataService {

  // Keeps tabs of the default url string
  private url: string = environment.production ?
    `${environment.urls.api}/api/v1/systems_tasks` :
    `${environment.urls.api}/systems_tasks`;

  // Keeps tabs of the user defined search or sort criteria.
  private state: SystemTaskState = {
    searchTerm: null,
    page: 1,
    pageSize: 20,
    sortColumn: 'name',
    sortDirection: 'asc',
    id: null,
    contextId: null,
    timePointId: null,
    taskTypeId: null,
    taskStatusId: null   
  };

  // Keeps tabs of the systemsTasks
  private systemsTasksSubject$ = new BehaviorSubject<SystemTask[]>([]);
  readonly systemsTasks$ = this.systemsTasksSubject$.asObservable();

  // Keeps tabs of the total systemsTasks (irregardless of pagination)
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
   * Retrieves Systems Tasks Records from the local cache or database
   * 
   * @param cache Whether the results should be locally cached if freshly retrieved from the database
   * @param state The desired records state
   * @returns The Systems Tasks Records
   */
  public getSystemsTasks(cache: boolean, state: SystemTaskState): Observable<SystemTask[]> {

    this.log.trace(`${LOG_PREFIX} Entering getSystemsTasks()`);

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

        if (this.systemsTasksSubject$.value.length > 0) {

          // The desired data is already available in the local cache
          this.log.trace(`${LOG_PREFIX} The desired data is already available in the local cache`);

          // Return the locally cached data
          this.log.trace(`${LOG_PREFIX} Returning the locally cached data`);

          return of(this.systemsTasksSubject$.value);

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

      if (this.systemsTasksSubject$.value.length > 0) {

        // The desired data is already available in the local cache
        this.log.trace(`${LOG_PREFIX} The desired data is already available in the local cache`);

        // Return the locally cached data
        this.log.trace(`${LOG_PREFIX} Returning the locally cached data`);

        return of(this.systemsTasksSubject$.value);

      }

    }


    // Get a fresh set of Systems Tasks Records from the backend
    this.log.trace(`${LOG_PREFIX} Getting a fresh set of Systems Tasks Records from the backend`);
    return this.getFreshSystemsTasks(cache, state);

  }


  /**
   * Retrieves a fresh set of Systems Tasks Records from the backend
   * 
   * @param cache Whether the results should be locally cached if freshly retrieved from the database
   * @param state The desired records state
   * @returns The Systems Tasks Records
   */
  private getFreshSystemsTasks(cache: boolean, state: SystemTaskState): Observable<SystemTask[]> {

    this.log.trace(`${LOG_PREFIX} Entering getFreshSystemsTasks()`);

    // Set the loading status to true
    this.log.trace(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Make a HTTP GET Request to retrieve the records
    this.log.debug(`${LOG_PREFIX} Making a HTTP GET Request to ${this.url} to retrieve the fresh set of records`);
    return this.http.get<SystemTask[]>(`${this.url}`, { headers: new HttpHeaders(HEADERS), params: new HttpParams({ fromObject: this.getQueryParams(state) }), observe: 'response' })
      .pipe(

        map((res: HttpResponse<any>) => {

          // Systems Tasks Records Retrieval was successful
          this.log.trace(`${LOG_PREFIX} Systems Tasks Records Retrieval was successful`);
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
            this.systemsTasksSubject$.next(res.body);

          } else {

            // The results should not be locally cached
            this.log.trace(`${LOG_PREFIX} The results should not be locally cached`);

          }

          return res.body;

        }),

        catchError((error: any) => {

          // Systems Tasks Records Retrieval was unsuccessful
          this.log.error(`${LOG_PREFIX} Systems Tasks Records Retrieval was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

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
  public get records(): SystemTask[] {
    return this.systemsTasksSubject$.value;
  }

  /**
   * Collates query parameters that correspond to the currently set required records state
   * @state The target state
   * @returns The query parameters
   */
  private getQueryParams(state: SystemTaskState): any {

    this.log.trace(`${LOG_PREFIX} Entering getQueryParams()`);

    let params: any = {}

    if (state.id) {
      this.log.trace(`${LOG_PREFIX} Adding id parameter`);
      params['id'] = state.id;
    }

    if (state.contextId) {
      this.log.trace(`${LOG_PREFIX} Adding context id parameter`);
      environment.production ? params['contextId'] = state.contextId : params['data.contextId'] = state.contextId;
    }

    if (state.timePointId) {
      this.log.trace(`${LOG_PREFIX} Adding time point id parameter`);
      environment.production ? params['timePointId'] = state.timePointId : params['data.timePointId'] = state.timePointId;
    }

    if (state.taskTypeId) {
      this.log.trace(`${LOG_PREFIX} Adding task type id parameter`);
      environment.production ? params['taskTypeId'] = state.taskTypeId : params['data.taskTypeId'] = state.taskTypeId;
    }

    if (state.taskStatusId) {
      this.log.trace(`${LOG_PREFIX} Adding task status id parameter`);
      environment.production ? params['taskStatusId'] = state.taskStatusId : params['data.taskStatusId'] = state.taskStatusId;
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
