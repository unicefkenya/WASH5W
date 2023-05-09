import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { NGXLogger } from 'ngx-logger';
import { LogicalHierarchy } from '../models/logical-hierarchy.model';
import { environment } from 'environments/environment';
import { catchError, map } from 'rxjs/operators';
import { LogicalHierarchyState } from '../models/logical-hierarchy-state.model';

const LOG_PREFIX: string = "[Logical Hierarchies Selection Data Service]";
const HEADERS = { 'Content-Type': 'application/json' };

@Injectable({
  providedIn: 'root'
})
export class LogicalHierarchiesSelectionDataService {

  // Keeps tabs of the default url string
  private url: string = environment.production ?
    `${environment.urls.api}/api/v1/logical_hierarchies` :
    `${environment.urls.api}/logical_hierarchies`;

  // Keeps tabs of the user defined search or sort criteria.
  private state: LogicalHierarchyState = {
    page: 1,
    pageSize: 20,
    searchTerm: null,
    sortColumn: 'name',
    sortDirection: 'asc',
    contextId: null,
    typesIds: null,
    commissionerId: null,
    commissionerName: null,
    responsibleId: null,
    responsibleName: null,
  };

  // Keeps tabs of the logicalHierarchies
  private logicalHierarchiesSubject$ = new BehaviorSubject<LogicalHierarchy[]>([]);
  readonly logicalHierarchies$ = this.logicalHierarchiesSubject$.asObservable();

  // Keeps tabs of the total logicalHierarchies (irregardless of pagination)
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
   * Retrieves Logical Hierarchies Records from the local cache or database
   * 
   * @param cache Whether the results should be locally cached if freshly retrieved from the database
   * @param state The desired records state
   * @returns The Logical Hierarchies Records
   */
  public getLogicalHierarchies(cache: boolean, state: LogicalHierarchyState): Observable<LogicalHierarchy[]> {

    this.log.trace(`${LOG_PREFIX} Entering getLogicalHierarchies()`);

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

        if (this.logicalHierarchiesSubject$.value.length > 0) {

          // The desired data is already available in the local cache
          this.log.trace(`${LOG_PREFIX} The desired data is already available in the local cache`);

          // Return the locally cached data
          this.log.trace(`${LOG_PREFIX} Returning the locally cached data`);

          return of(this.logicalHierarchiesSubject$.value);

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

      if (this.logicalHierarchiesSubject$.value.length > 0) {

        // The desired data is already available in the local cache
        this.log.trace(`${LOG_PREFIX} The desired data is already available in the local cache`);

        // Return the locally cached data
        this.log.trace(`${LOG_PREFIX} Returning the locally cached data`);

        return of(this.logicalHierarchiesSubject$.value);

      }

    }


    // Get a fresh set of Logical Hierarchies Records from the backend
    this.log.trace(`${LOG_PREFIX} Getting a fresh set of Logical Hierarchies Records from the backend`);
    return this.getFreshLogicalHierarchies(cache, state);

  }


  /**
   * Retrieves a fresh set of Logical Hierarchies Records from the backend
   * 
   * @param cache Whether the results should be locally cached if freshly retrieved from the database
   * @param state The desired records state
   * @returns The Logical Hierarchies Records
   */
  private getFreshLogicalHierarchies(cache: boolean, state: LogicalHierarchyState): Observable<LogicalHierarchy[]> {

    this.log.trace(`${LOG_PREFIX} Entering getFreshLogicalHierarchies()`);

    // Set the loading status to true
    this.log.trace(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Collate the query parameters
    this.log.debug(`${LOG_PREFIX} Collating the query parameters`);
    const parameters: HttpParams = this.getQueryParams(state);


    // Make a HTTP GET Request to retrieve the records
    this.log.debug(`${LOG_PREFIX} Making a HTTP GET Request to ${this.url} to retrieve the fresh set of records`);
    return this.http.get<LogicalHierarchy[]>(`${this.url}`, { headers: new HttpHeaders(HEADERS), params: parameters, observe: 'response' })
      .pipe(

        map((res: HttpResponse<any>) => {

          // Logical Hierarchies Records Retrieval was successful
          this.log.trace(`${LOG_PREFIX} Logical Hierarchies Records Retrieval was successful`);
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
            this.logicalHierarchiesSubject$.next(res.body);

          } else {

            // The results should not be locally cached
            this.log.trace(`${LOG_PREFIX} The results should not be locally cached`);

          }

          return res.body;

          

        }),

        catchError((error: any) => {

          // Logical Hierarchies Records Retrieval was unsuccessful
          this.log.error(`${LOG_PREFIX} Logical Hierarchies Records Retrieval was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

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
  public get records(): LogicalHierarchy[] {
    return this.logicalHierarchiesSubject$.value;
  }

  /**
   * Collates query parameters that correspond to the currently set required records state
   * @state The target state
   * @returns The query parameters
   */
   private getQueryParams(state: LogicalHierarchyState): HttpParams {

    this.log.trace(`${LOG_PREFIX} Entering getQueryParams()`);

    let params: HttpParams = new HttpParams();

    if (state.contextId) {
      this.log.trace(`${LOG_PREFIX} Adding context id parameter`);
      environment.production ? params = params.append("contextId", state.contextId) : params = params.append("data.context.id", state.contextId);
    }     

    if (state.typesIds) {
      this.log.trace(`${LOG_PREFIX} Adding type parameter`);
      if(environment.production) {
        
        state.typesIds.forEach(id => {
          params = params.append("typeId",id);
        });
      } else {
        state.typesIds.forEach(id => {
          params = params.append("data.type.id",id);
        });
      }
    }

    if (state.commissionerId) {
      this.log.trace(`${LOG_PREFIX} Adding commissioner id parameter`);
      environment.production ? params = params.append("commissionerId", state.commissionerId) : params = params.append("data.commissioner.id", state.commissionerId);
    }

    if (state.commissionerName) {
      this.log.trace(`${LOG_PREFIX} Adding commissioner name parameter`);
      environment.production ? params = params.append("commissionerName", state.commissionerName) : params = params.append("data.commissioner.name", state.commissionerName);
    }

    if (state.responsibleId) {
      this.log.trace(`${LOG_PREFIX} Adding responsible id parameter`);
      environment.production ? params = params.append("responsibleId", state.responsibleId) : params = params.append("data.responsible.id", state.responsibleId);
    }

    if (state.responsibleName) {
      this.log.trace(`${LOG_PREFIX} Adding responsible name parameter`);
      environment.production ? params = params.append("responsibleName", state.responsibleName) : params = params.append("data.responsible.name", state.responsibleName);
    }

    if (state.searchTerm && state.searchTerm.trim().length > 0) {
      this.log.trace(`${LOG_PREFIX} Adding search parameter`);
      environment.production ? params = params.append("searchTerm", state.searchTerm) : params = params.append("data.responsible.name_like", state.searchTerm);
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
