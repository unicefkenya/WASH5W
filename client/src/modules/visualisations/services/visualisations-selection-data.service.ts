import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { NGXLogger } from 'ngx-logger';
import { Visualisation } from '../models/visualisation.model';
import { environment } from 'environments/environment';
import { catchError, map, tap } from 'rxjs/operators';
import { VisualisationState } from '../models/visualisation-state.model';

const LOG_PREFIX: string = "[Visualisations Selection Data Service]";
const HEADERS = { 'Content-Type': 'application/json' };

@Injectable({
  providedIn: 'root'
})
export class VisualisationsSelectionDataService {

  // Keeps tabs of the default url string
  private url: string = environment.production ?
    `${environment.urls.api}/api/v1/visualisations` :
    `${environment.urls.api}/visualisations`;

  // Keeps tabs of the user defined search or sort criteria.
  private state: VisualisationState = {
    searchTerm: null,
    page: 1,
    pageSize: 20,
    sortColumn: 'id',
    sortDirection: 'asc',
    id: null,
    visualisationContainerId: null,
    visualisationTypeId: null,
    visualisationDataTypeId: null,
    name: null
  };

  // Keeps tabs of the visualisations
  private visualisationsSubject$ = new BehaviorSubject<Visualisation[]>([]);
  readonly visualisations$ = this.visualisationsSubject$.asObservable();

  // Keeps tabs of the total visualisations (irregardless of pagination)
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
   * Retrieves Visualisations Records from the local cache or database
   * 
   * @param cache Whether the results should be locally cached if freshly retrieved from the database
   * @param state The desired records state
   * @returns The Visualisations Records
   */
  public getVisualisations(cache: boolean, state: VisualisationState): Observable<Visualisation[]> {

    this.log.trace(`${LOG_PREFIX} Entering getVisualisations()`);

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

        if (this.visualisationsSubject$.value.length > 0) {

          // The desired data is already available in the local cache
          this.log.trace(`${LOG_PREFIX} The desired data is already available in the local cache`);

          // Return the locally cached data
          this.log.trace(`${LOG_PREFIX} Returning the locally cached data`);

          return of(this.visualisationsSubject$.value);

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

      if (this.visualisationsSubject$.value.length > 0) {

        // The desired data is already available in the local cache
        this.log.trace(`${LOG_PREFIX} The desired data is already available in the local cache`);

        // Return the locally cached data
        this.log.trace(`${LOG_PREFIX} Returning the locally cached data`);

        return of(this.visualisationsSubject$.value);

      }

    }


    // Get a fresh set of Visualisations Records from the backend
    this.log.trace(`${LOG_PREFIX} Getting a fresh set of Visualisations Records from the backend`);
    return this.getFreshVisualisations(cache, state);

  }


  /**
   * Retrieves a fresh set of Visualisations Records from the backend
   * 
   * @param cache Whether the results should be locally cached if freshly retrieved from the database
   * @param state The desired records state
   * @returns The Visualisations Records
   */
  private getFreshVisualisations(cache: boolean, state: VisualisationState): Observable<Visualisation[]> {

    this.log.trace(`${LOG_PREFIX} Entering getFreshVisualisations()`);

    // Set the loading status to true
    this.log.trace(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Make a HTTP GET Request to retrieve the records
    this.log.debug(`${LOG_PREFIX} Making a HTTP GET Request to ${this.url} to retrieve the fresh set of records`);
    return this.http.get<Visualisation[]>(`${this.url}`, { headers: new HttpHeaders(HEADERS), params: new HttpParams({ fromObject: this.getQueryParams(state) }), observe: 'response' })
      .pipe(

        map((res: HttpResponse<any>) => {

          // Visualisations Records Retrieval was successful
          this.log.trace(`${LOG_PREFIX} Visualisations Records Retrieval was successful`);
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
            this.visualisationsSubject$.next(res.body);

          } else {

            // The results should not be locally cached
            this.log.trace(`${LOG_PREFIX} The results should not be locally cached`);

          }

          return res.body;

        }),

        catchError((error: any) => {

          // Visualisations Records Retrieval was unsuccessful
          this.log.error(`${LOG_PREFIX} Visualisations Records Retrieval was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

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
  public get records(): Visualisation[] {
    return this.visualisationsSubject$.value;
  }

  /**
   * Collates query parameters that correspond to the currently set required records state
   * @state The target state
   * @returns The query parameters
   */
   private getQueryParams(state: VisualisationState): any {

    this.log.trace(`${LOG_PREFIX} Entering getQueryParams()`);

    let params: any = {}   
    
    if (state.id) {
      this.log.trace(`${LOG_PREFIX} Adding id parameter`);
      params['id'] = state.id;
    }  
    
    if (state.visualisationContainerId) {
      this.log.trace(`${LOG_PREFIX} Adding visualisation container id parameter`);
      environment.production? params['visualisationContainerId']=state.visualisationContainerId : params['data.visualisationContainerId']=state.visualisationContainerId;
    }  
    
    if (state.visualisationTypeId) {
      this.log.trace(`${LOG_PREFIX} Adding visualisation type id parameter`);
      environment.production? params['visualisationTypeId']=state.visualisationTypeId : params['data.visualisationTypeId']=state.visualisationTypeId;
    }      

    if (state.visualisationDataTypeId) {
      this.log.trace(`${LOG_PREFIX} Adding visualisation data type id parameter`);
      environment.production? params['visualisationDataTypeId']=state.visualisationDataTypeId : params['data.visualisationDataTypeId']=state.visualisationDataTypeId;
    } 

    if (state.name && state.name.trim().length > 0) {
      this.log.trace(`${LOG_PREFIX} Adding visualisation parameter`);
      environment.production? params['name']=state.name : params['data.name']=state.name;
    }    
   
    if (state.searchTerm && state.searchTerm.trim().length > 0) {
      this.log.trace(`${LOG_PREFIX} Adding search term parameter`);
      environment.production? params['name_like']=state.searchTerm : params['data.name_like']=state.searchTerm;
    }

    if (state.page) {
      this.log.trace(`${LOG_PREFIX} Adding page parameter`);
      params['_page']=state.page;
    }

    if (state.pageSize) {
      this.log.trace(`${LOG_PREFIX} Adding limit`);
      params['_limit']=state.pageSize;
    }    

    if (state.sortColumn) {
      this.log.trace(`${LOG_PREFIX} Adding sort parameter`);
      params['_sort']=state.sortColumn;
    }

    if (state.sortDirection) {
      this.log.trace(`${LOG_PREFIX} Adding sort direction parameter`);
      params['_order']=state.sortDirection;
    }

    return params;
  }

}
