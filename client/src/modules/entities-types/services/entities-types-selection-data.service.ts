import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { NGXLogger } from 'ngx-logger';
import { EntityType } from '../models/entity-type.model';
import { environment } from 'environments/environment';
import { catchError, map } from 'rxjs/operators';
import { EntityTypeState } from '../models/entity-type-state.model';

const LOG_PREFIX: string = "[Entities Types Selection Data Service]";
const HEADERS = { 'Content-Type': 'application/json' };

@Injectable({
  providedIn: 'root'
})
export class EntitiesTypesSelectionDataService {

  // Keeps tabs of the default url string
  private url: string = environment.production ?
    `${environment.urls.api}/api/v1/entities_types` :
    `${environment.urls.api}/entities_types`;

  // Keeps tabs of the user defined search or sort criteria.
  private state: EntityTypeState = {
    page: 1,
    pageSize: 20,
    searchTerm: null,
    sortColumn: 'name',
    sortDirection: 'asc',
    contextId: null,
    id: null,
    name: null,
    plural: null
  };

  // Keeps tabs of the entitiesTypes
  private entitiesTypesSubject$ = new BehaviorSubject<EntityType[]>([]);
  readonly entitiesTypes$ = this.entitiesTypesSubject$.asObservable();

  // Keeps tabs of the total entitiesTypes (irregardless of pagination)
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
   * Retrieves Entities Types Records from the local cache or database
   * 
   * @param cache Whether the results should be locally cached if freshly retrieved from the database
   * @param state The desired records state
   * @returns The Entities Types Records
   */
  public getEntitiesTypes(cache: boolean, state: EntityTypeState): Observable<EntityType[]> {

    this.log.trace(`${LOG_PREFIX} Entering getEntitiesTypes()`);

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

        if (this.entitiesTypesSubject$.value.length > 0) {

          // The desired data is already available in the local cache
          this.log.trace(`${LOG_PREFIX} The desired data is already available in the local cache`);

          // Return the locally cached data
          this.log.trace(`${LOG_PREFIX} Returning the locally cached data`);

          return of(this.entitiesTypesSubject$.value);

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

      if (this.entitiesTypesSubject$.value.length > 0) {

        // The desired data is already available in the local cache
        this.log.trace(`${LOG_PREFIX} The desired data is already available in the local cache`);

        // Return the locally cached data
        this.log.trace(`${LOG_PREFIX} Returning the locally cached data`);

        return of(this.entitiesTypesSubject$.value);

      }

    }


    // Get a fresh set of Entities Types Records from the backend
    this.log.trace(`${LOG_PREFIX} Getting a fresh set of Entities Types Records from the backend`);
    return this.getFreshEntitiesTypes(cache, state);

  }


  /**
   * Retrieves a fresh set of Entities Types Records from the backend
   * 
   * @param cache Whether the results should be locally cached if freshly retrieved from the database
   * @param state The desired records state
   * @returns The Entities Types Records
   */  
  private getFreshEntitiesTypes(cache: boolean, state: EntityTypeState): Observable<EntityType[]> {

    this.log.trace(`${LOG_PREFIX} Entering getFreshEntitiesTypes()`);

    // Set the loading status to true
    this.log.debug(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Make a HTTP GET Request to retrieve the records
    this.log.debug(`${LOG_PREFIX} Making a HTTP GET Request to ${this.url} to retrieve the fresh set of records`);
    return this.http.get<EntityType[]>(`${this.url}`, { headers: new HttpHeaders(HEADERS), params: new HttpParams({ fromObject: this.getQueryParams(state) }), observe: 'response' })
      .pipe(

        map((res: HttpResponse<any>) => {

          // Entities Types Records Retrieval was successful
          this.log.trace(`${LOG_PREFIX} Entities Types Records Retrieval was successful`);
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
            this.entitiesTypesSubject$.next(res.body);

          } else {

            // The results should not be locally cached
            this.log.trace(`${LOG_PREFIX} The results should not be locally cached`);

          }

          return res.body;

        }),

        catchError((error: any) => {

          // Entities Types Records Retrieval was unsuccessful
          this.log.error(`${LOG_PREFIX} Entities Types Records Retrieval was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

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
  public get records(): EntityType[] {
    return this.entitiesTypesSubject$.value;
  }

  /**
   * Collates query parameters that correspond to the currently set required records state
   * @state The target state
   * @returns The query parameters
   */
  private getQueryParams(state: EntityTypeState): any {

    // Collate the query parameters
    this.log.trace(`${LOG_PREFIX} Collating query parameters`);
    this.log.debug(`${LOG_PREFIX} State = ${JSON.stringify(state)}`);
    let params: any = {}

    if (state.id) {
      this.log.trace(`${LOG_PREFIX} Adding id parameter`);
      params['id'] = state.id;
    }    

    if (state.contextId) {
      this.log.trace(`${LOG_PREFIX} Adding context id parameter`);
      environment.production ? params['contextId'] = state.contextId : params['data.contextId'] = state.contextId;
    }

    if (state.name && state.name.trim().length > 0) {
      this.log.trace(`${LOG_PREFIX} Adding singular name parameter`);
      environment.production ? params['name'] = state.name : params['data.name'] = state.name;
    }

    if (state.plural && state.plural.trim().length > 0) {
      this.log.trace(`${LOG_PREFIX} Adding plural name parameter`);
      environment.production ? params['plural'] = state.plural : params['data.plural'] = state.plural;
    }   

    if (state.searchTerm && state.searchTerm.trim().length > 0) {
      this.log.trace(`${LOG_PREFIX} Adding search parameter`);
      environment.production ? params['q'] = state.searchTerm : params['q'] = state.searchTerm;
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
