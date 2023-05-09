import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { NGXLogger } from 'ngx-logger';
import { WorkflowTransition } from '../models/workflow-transition.model';
import { environment } from 'environments/environment';
import { catchError, map, tap } from 'rxjs/operators';
import { WorkflowTransitionState } from '../models/workflow-transition-state.model';

const LOG_PREFIX: string = "[Workflow Transitions Data Service]";
const HEADERS = { 'Content-Type': 'application/json' };

@Injectable({
  providedIn: 'root'
})
export class WorkflowTransitionsDataService {

  // Keeps tabs of the default url string
  private url: string = environment.production ?
    `${environment.urls.api}/api/v1/workflow_transitions` :
    `${environment.urls.api}/workflow_transitions`;

  // Keeps tabs of the user defined search or sort criteria.
  private state: WorkflowTransitionState = {
    page: 1,
    pageSize: 20,
    searchTerm: null,
    sortColumn: 'id',
    sortDirection: 'asc',
    workflowId: null,
    fromStateId: null,
    fromStateName: null,
    toStateId: null,
    toStateName: null,
    permissionId: null,
    permissionName: null,
    verb: null
  };

  // Keeps tabs of the workflowTransitions
  private workflowTransitionsSubject$ = new BehaviorSubject<WorkflowTransition[]>([]);
  readonly workflowTransitions$ = this.workflowTransitionsSubject$.asObservable();

  // Keeps tabs of the total workflowTransitions (irregardless of pagination)
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
   * Creates a new Workflow Transition Record
   * 
   * @param workflowTransition the details of the Workflow Transition Record to be created
   * @returns the newly created Workflow Transition Record
   */
  public createWorkflowTransition(workflowTransition: WorkflowTransition): Observable<WorkflowTransition> {

    this.log.trace(`${LOG_PREFIX} Entering createWorkflowTransition()`);
    this.log.debug(`${LOG_PREFIX} Workflow Transition = ${JSON.stringify(workflowTransition)}`);

    // Set the loading status to true
    this.log.trace(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Make a HTTP POST Request to create the record
    this.log.debug(`${LOG_PREFIX} Making a HTTP POST Request to ${this.url} to create the record`);
    return this.http.post<WorkflowTransition>(`${this.url}`, JSON.stringify(workflowTransition), { headers: new HttpHeaders(HEADERS) })
      .pipe(

        tap((data: WorkflowTransition) => {

          // Workflow Transition Record Creation was successful
          this.log.trace(`${LOG_PREFIX} Record Creation was successful`);
          this.log.debug(`${LOG_PREFIX} Created Record = ${JSON.stringify(data)}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          // Refresh the records / record count
          this.log.trace(`${LOG_PREFIX} Refreshing the records / record count`);
          this.getFreshWorkflowTransitions(true, this.state).subscribe();

        }),

        catchError((error: any) => {

          // Workflow Transition Record Creation was unsuccessful
          this.log.error(`${LOG_PREFIX} Workflow Transition Record Creation was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);

        }));
  }



  /**
   * Retrieves Workflow Transitions Records from the local cache or database
   * 
   * @param cache Whether the results should be locally cached if freshly retrieved from the database
   * @param state The desired records state
   * @returns The Workflow Transitions Records
   */
  public getWorkflowTransitions(cache: boolean, state: WorkflowTransitionState): Observable<WorkflowTransition[]> {

    this.log.trace(`${LOG_PREFIX} Entering getWorkflowTransitions()`);

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

        if (this.workflowTransitionsSubject$.value.length > 0) {

          // The desired data is already available in the local cache
          this.log.trace(`${LOG_PREFIX} The desired data is already available in the local cache`);

          // Return the locally cached data
          this.log.trace(`${LOG_PREFIX} Returning the locally cached data`);

          return of(this.workflowTransitionsSubject$.value);

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

      if (this.workflowTransitionsSubject$.value.length > 0) {

        // The desired data is already available in the local cache
        this.log.trace(`${LOG_PREFIX} The desired data is already available in the local cache`);

        // Return the locally cached data
        this.log.trace(`${LOG_PREFIX} Returning the locally cached data`);

        return of(this.workflowTransitionsSubject$.value);

      }

    }


    // Get a fresh set of Workflow Transitions Records from the backend
    this.log.trace(`${LOG_PREFIX} Getting a fresh set of Workflow Transitions Records from the backend`);
    return this.getFreshWorkflowTransitions(cache, state);

  }


  /**
   * Retrieves a fresh set of Workflow Transitions Records from the backend
   * 
   * @param cache Whether the results should be locally cached if freshly retrieved from the database
   * @param state The desired records state
   * @returns The Workflow Transitions Records
   */
  private getFreshWorkflowTransitions(cache: boolean, state: WorkflowTransitionState): Observable<WorkflowTransition[]> {

    this.log.trace(`${LOG_PREFIX} Entering getFreshWorkflowTransitions()`);

    // Set the loading status to true
    this.log.trace(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Collate the query parameters
    this.log.debug(`${LOG_PREFIX} Collating the query parameters`);
    const parameters: any = this.getQueryParams(state);


    // Make a HTTP GET Request to retrieve the records
    this.log.debug(`${LOG_PREFIX} Making a HTTP GET Request to ${this.url} to retrieve the fresh set of records`);
    return this.http.get<WorkflowTransition[]>(`${this.url}`, { headers: new HttpHeaders(HEADERS), params: new HttpParams({ fromObject: parameters }), observe: 'response' })
      .pipe(

        map((res: HttpResponse<any>) => {

          // Workflow Transitions Records Retrieval was successful
          this.log.trace(`${LOG_PREFIX} Workflow Transitions Records Retrieval was successful`);
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
            this.workflowTransitionsSubject$.next(res.body);

          } else {

            // The results should not be locally cached
            this.log.trace(`${LOG_PREFIX} The results should not be locally cached`);

          }

          return res.body;

        }),

        catchError((error: any) => {

          // Workflow Transitions Records Retrieval was unsuccessful
          this.log.error(`${LOG_PREFIX} Workflow Transitions Records Retrieval was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);

        }));
  }



  /**
   * Updates a single Workflow Transition Record
   * 
   * @param workflowTransition The details of the Workflow Transition Record to be updated
   * @returns the updated Workflow Transition Record
   */
  public updateWorkflowTransition(workflowTransition: WorkflowTransition): Observable<WorkflowTransition> {

    this.log.trace(`${LOG_PREFIX} Entering updateWorkflowTransition()`);
    this.log.debug(`${LOG_PREFIX} Workflow Transition = ${JSON.stringify(workflowTransition)}`);

    // Set the loading status to true
    this.log.trace(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Make a HTTP POST Request to update the record
    this.log.debug(`${LOG_PREFIX} Making a HTTP POST Request to ${this.url}/${workflowTransition.id} to update the record`);
    return this.http.put<WorkflowTransition>(`${this.url}/${workflowTransition.id} `, JSON.stringify(workflowTransition), { headers: new HttpHeaders(HEADERS) })
      .pipe(

        tap((data: WorkflowTransition) => {

          // Workflow Transition Record Update was successful
          this.log.trace(`${LOG_PREFIX} Workflow Transition Record Update was successful`);
          this.log.debug(`${LOG_PREFIX} Updated Record = ${JSON.stringify(data)}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          // Refresh the records / record count
          this.log.trace(`${LOG_PREFIX} Refreshing the records / record count`);
          this.getFreshWorkflowTransitions(true, this.state).subscribe();


        }),

        catchError((error: any) => {

          // Workflow Transition Record Update was unsuccessful
          this.log.error(`${LOG_PREFIX} Workflow Transition Record Update was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);

        }));
  }


  /**
   * Deletes a single Workflow Transition Record
   *
   * @param workflowTransitionId The id of the Workflow Transition Record to be deleted
   */
  public deleteWorkflowTransition(workflowTransitionId: number): Observable<void> {

    this.log.trace(`${LOG_PREFIX} Entering deleteWorkflowTransition()`);
    this.log.debug(`${LOG_PREFIX} Workflow Transition Id = ${workflowTransitionId}`);

    // Make a HTTP DELETE Request to delete the records
    this.log.debug(`${LOG_PREFIX} Making a HTTP DELETE Request to ${this.url}/${workflowTransitionId} to delete the record`);

    return this.http.delete<void>(`${this.url}/${workflowTransitionId}`, { headers: new HttpHeaders(HEADERS) })
      .pipe(

        tap(() => {

          // Workflow Transition Record Deletion was successful
          this.log.trace(`${LOG_PREFIX} Workflow Transition Record Deletion was successful`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          // Refresh the records / record count
          this.log.trace(`${LOG_PREFIX} Refreshing the records / record count`);
          this.getFreshWorkflowTransitions(true, this.state).subscribe();

        }),

        catchError((error: any) => {

          // Workflow Transition Record Deletion was unsuccessful
          this.log.error(`${LOG_PREFIX} Workflow Transition Record Deletion was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

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
  public get records(): WorkflowTransition[] {
    return this.workflowTransitionsSubject$.value;
  }

  /**
   * Collates query parameters that correspond to the currently set required records state
   * @state The target state
   * @returns The query parameters
   */
  private getQueryParams(state: WorkflowTransitionState): any {

    this.log.trace(`${LOG_PREFIX} Entering getQueryParams()`);

    let params: any = {}

    if (state.workflowId) {
      this.log.trace(`${LOG_PREFIX} Adding workflow id parameter`);
      environment.production ? params['workflowId'] = state.workflowId : params['data.workflowId'] = state.workflowId;
    }    

    if (state.fromStateId) {
      this.log.trace(`${LOG_PREFIX} Adding from state id parameter`);
      environment.production ? params['fromId'] = state.fromStateId : params['data.from.id'] = state.fromStateId;
    }

    if (state.fromStateName) {
      this.log.trace(`${LOG_PREFIX} Adding from state name parameter`);
      environment.production ? params['fromName'] = state.fromStateName : params['data.from.name'] = state.fromStateName;
    }

    if (state.toStateId) {
      this.log.trace(`${LOG_PREFIX} Adding to state id parameter`);
      environment.production ? params['toId'] = state.toStateId : params['data.to.id'] = state.toStateId;
    }

    if (state.toStateName) {
      this.log.trace(`${LOG_PREFIX} Adding to state name parameter`);
      environment.production ? params['toName'] = state.toStateName : params['data.to.name'] = state.toStateName;
    }

    if (state.permissionId) {
      this.log.trace(`${LOG_PREFIX} Adding permission id parameter`);
      environment.production ? params['permissionId'] = state.permissionId : params['data.permission.id'] = state.permissionId;
    }

    if (state.permissionName) {
      this.log.trace(`${LOG_PREFIX} Adding permission name parameter`);
      environment.production ? params['permissionName'] = state.permissionName : params['data.permission.name'] = state.permissionName;
    }

    if (state.verb) {
      this.log.trace(`${LOG_PREFIX} Adding verb parameter`);
      environment.production ? params['verb'] = state.verb : params['data.verb'] = state.verb;
    }    

    if (state.searchTerm && state.searchTerm.trim().length > 0) {
      this.log.trace(`${LOG_PREFIX} Adding search parameter`);
      environment.production ? params['searchTerm'] = state.searchTerm : params['data.verb_like'] = state.searchTerm;
    }

    if (state.page) {
      this.log.trace(`${LOG_PREFIX} Adding page parameter`);
      params['_page'] = state.page;
    }

    if (state.pageSize) {
      this.log.trace(`${LOG_PREFIX} Adding limit`);
      params['_limit'] = state.pageSize;
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
