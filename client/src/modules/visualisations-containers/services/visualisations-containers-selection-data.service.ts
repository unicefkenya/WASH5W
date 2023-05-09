import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { NGXLogger } from 'ngx-logger';
import { VisualisationContainer } from '../models/visualisation-container.model';
import { environment } from 'environments/environment';
import { catchError, map } from 'rxjs/operators';
import { VisualisationContainerState } from '../models/visualisation-container-state.model';

const LOG_PREFIX: string = "[Visualisations Containers Selection Data Service]";
const HEADERS = { 'Content-Type': 'application/json' };

@Injectable({
  providedIn: 'root'
})
export class VisualisationsContainersSelectionDataService {

  // Keeps tabs of the default url string
  private url: string = environment.production ?
    `${environment.urls.api}/api/v1/visualisations_containers` :
    `${environment.urls.api}/visualisations_containers`;

  // Keeps tabs of the user defined search or sort criteria.
  private state: VisualisationContainerState = {
    page: 1,
    pageSize: 20,
    searchTerm: null,
    sortColumn: 'id',
    sortDirection: 'asc',
    id: null,
    contextId: null,
    typesIds: null,    
    parentId: null,
    navTitle: null,
    pageTitle: null
  };

  // Keeps tabs of the Visualisations Containers
  private visualisationContainersSubject$ = new BehaviorSubject<VisualisationContainer[]>([]);
  readonly visualisationContainers$ = this.visualisationContainersSubject$.asObservable();

  // Keeps tabs of the top-level data form elements
  private topLevelVisualisationContainersSubject$ = new BehaviorSubject<VisualisationContainer[]>([]);
  readonly topLevelVisualisationContainers$ = this.topLevelVisualisationContainersSubject$.asObservable();

  // Keeps tabs of the nested data form elements
  private nestedVisualisationContainersSubject$ = new BehaviorSubject<Map<number, VisualisationContainer[]>>(new Map());
  readonly nestedVisualisationContainers$ = this.nestedVisualisationContainersSubject$.asObservable();  

  // Keeps tabs of the nested data form elements mapped to their parent id
  public nestedVisualisationContainers: Map<number, VisualisationContainer[]> = new Map<number, VisualisationContainer[]>();

  // Keeps tabs of the total visualisationContainers (irregardless of pagination)
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
   * Retrieves Visualisations Containers Records from the local cache or database
   * 
   * @param cache Whether the results should be locally cached if freshly retrieved from the database
   * @param state The desired records state
   * @returns The Visualisations Containers Records
   */
  public getVisualisationsContainers(cache: boolean, state: VisualisationContainerState): Observable<VisualisationContainer[]> {

    this.log.trace(`${LOG_PREFIX} Entering getVisualisationsContainers()`);

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

        if (this.visualisationContainersSubject$.value.length > 0) {

          // The desired data is already available in the local cache
          this.log.trace(`${LOG_PREFIX} The desired data is already available in the local cache`);

          // Return the locally cached data
          this.log.trace(`${LOG_PREFIX} Returning the locally cached data`);

          return of(this.visualisationContainersSubject$.value);

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

      if (this.visualisationContainersSubject$.value.length > 0) {

        // The desired data is already available in the local cache
        this.log.trace(`${LOG_PREFIX} The desired data is already available in the local cache`);

        // Return the locally cached data
        this.log.trace(`${LOG_PREFIX} Returning the locally cached data`);

        return of(this.visualisationContainersSubject$.value);

      }

    }


    // Get a fresh set of Visualisations Containers Records from the backend
    this.log.trace(`${LOG_PREFIX} Getting a fresh set of Visualisations Containers Records from the backend`);
    return this.getFreshVisualisationsContainers(cache, state);

  }


  /**
   * Retrieves a fresh set of Visualisations Containers Records from the backend
   * 
   * @param cache Whether the results should be locally cached if freshly retrieved from the database
   * @param state The desired records state
   * @returns The Visualisations Containers Records
   */
  private getFreshVisualisationsContainers(cache: boolean, state: VisualisationContainerState): Observable<VisualisationContainer[]> {

    this.log.trace(`${LOG_PREFIX} Entering getFreshVisualisationsContainers()`);

    // Set the loading status to true
    this.log.debug(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Make a HTTP GET Request to retrieve the records
    this.log.debug(`${LOG_PREFIX} Making a HTTP GET Request to ${this.url} to retrieve the fresh set of records`);
    return this.http.get<VisualisationContainer[]>(`${this.url}`, { headers: new HttpHeaders(HEADERS), params: this.getQueryParams(state), observe: 'response' })
      .pipe(

        map((res: HttpResponse<any>) => {

          // Visualisations Containers Records Retrieval was successful
          this.log.trace(`${LOG_PREFIX} Visualisations Containers Records Retrieval was successful`);
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
            this.visualisationContainersSubject$.next(res.body);

            // Collate the Top Level and Nested Data Form Elements
            this.log.trace(`${LOG_PREFIX} Collating the Top Level and Nested Data Form Elements`);
            const top: VisualisationContainer[] = [];
            const nested: Map<number, VisualisationContainer[]> = new Map();
            for (let visualisationContainer of res.body) {
              this.log.trace(`${LOG_PREFIX} ${visualisationContainer.data.title}`);
              if (visualisationContainer.data.parentId) {

                let siblings: VisualisationContainer[] | undefined = nested.get(visualisationContainer.data.parentId);
                if (siblings) {
                  siblings.push(visualisationContainer);
                } else {
                  nested.set(visualisationContainer.data.parentId, [visualisationContainer])
                }
              } else {
                top.push(visualisationContainer);
              }
            }

            // Update the local Top Level and Nested Data Form Elements
            this.log.trace(`${LOG_PREFIX} Updating the local Top Level and Nested Data Form Elements`);
            this.topLevelVisualisationContainersSubject$.next(top);
            this.nestedVisualisationContainers = nested;

          } else {

            // The results should not be locally cached
            this.log.trace(`${LOG_PREFIX} The results should not be locally cached`);

          }

          return res.body;

        }),

        catchError((error: any) => {

          // Visualisations Containers Records Retrieval was unsuccessful
          this.log.error(`${LOG_PREFIX} Visualisations Containers Records Retrieval was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

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
  public get records(): VisualisationContainer[] {
    return this.visualisationContainersSubject$.value;
  }

  /**
   * Collates query parameters that correspond to the currently set required records state
   * @state The target state
   * @returns The query parameters
   */
  private getQueryParams(state: VisualisationContainerState): HttpParams {

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

    if (state.parentId) {
      this.log.trace(`${LOG_PREFIX} Adding parent id parameter`);
      environment.production ? params = params.append("parentId", state.parentId) : params = params.append("data.parentId", state.parentId);
    }    

    if (state.navTitle) {
      this.log.trace(`${LOG_PREFIX} Adding nav title parameter`);
      environment.production ? params = params.append("navTitle", state.navTitle) : params = params.append("data.navTitle", state.navTitle);
    }

    if (state.pageTitle) {
      this.log.trace(`${LOG_PREFIX} Adding page title parameter`);
      environment.production ? params = params.append("pageTitle", state.pageTitle) : params = params.append("data.pageTitle", state.pageTitle);
    }

    if (state.searchTerm && state.searchTerm.trim().length > 0) {
      this.log.trace(`${LOG_PREFIX} Adding search parameter`);
      environment.production ? params = params.append("searchTerm", state.searchTerm) : params = params.append("data.navTitle_like", state.searchTerm);
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
