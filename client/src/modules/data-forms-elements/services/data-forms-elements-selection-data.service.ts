import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { NGXLogger } from 'ngx-logger';
import { DataFormElement } from '../models/data-form-element.model';
import { environment } from 'environments/environment';
import { catchError, map, tap } from 'rxjs/operators';
import { DataFormElementState } from '../models/data-form-element-state.model';

const LOG_PREFIX: string = "[Data Forms Elements Selection Data Service]";
const HEADERS = { 'Content-Type': 'application/json' };

@Injectable({
  providedIn: 'root'
})
export class DataFormsElementsSelectionDataService {

  // Keeps tabs of the default url string
  private url: string = environment.production ?
    `${environment.urls.api}/api/v1/data_forms_elements` :
    `${environment.urls.api}/data_forms_elements`;

  // Keeps tabs of the user defined search or sort criteria.
  private state: DataFormElementState = {
    searchTerm: null,
    page: null,
    pageSize: null,
    sortColumn: null,
    sortDirection: null,
    id: null,
    indexLTE: null,
    indexGTE: null,    
    dataFormId: null,
    categoryId: null,
    typeId: null,    
    parentId: null,
    name: null
  };

  // Keeps tabs of the Data Forms Elements
  private dataFormElementsSubject$ = new BehaviorSubject<DataFormElement[]>([]);
  readonly dataFormElements$ = this.dataFormElementsSubject$.asObservable();

  // Keeps tabs of the total dataFormElements (irregardless of pagination)
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
   * Retrieves Data Forms Elements Records from the database
   * Avoids retrieving the elements from the cache to keep up with changes that might have been made externally
   * 
   * @param state The desired records state
   * @returns The Data Forms Elements Records
   */
  public getDataFormsElements(state: DataFormElementState): Observable<DataFormElement[]> {

    this.log.trace(`${LOG_PREFIX} Entering getDataFormsElements()`);

    // Check if the desired records state has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the desired records state has been specified`);

    if (state) {

      // The desired records state has been specified
      this.log.debug(`${LOG_PREFIX} The desired records state has been specified`);
      this.log.debug(`${LOG_PREFIX} Desired Records State = ${JSON.stringify(state)}`);

      // Check if the specified desired records state is equal to the local desired records state
      this.log.trace(`${LOG_PREFIX} Checking if the specified desired records state is equal to the local desired records state`);

      if (JSON.stringify(this.state) !== JSON.stringify(state)) {

        // The specified desired records state is equal to the local desired records state
        this.log.trace(`${LOG_PREFIX} The specified desired records state is equal to the local desired records state`);

          // There is no need to update the local desired records state 
          this.log.trace(`${LOG_PREFIX} There is no need to update the local desired records state `);

      } else {

        // The specified desired records state is not equal to the local desired records state
        this.log.trace(`${LOG_PREFIX} The specified desired records state is not equal to the local desired records state`);

          // Update the local desired records state 
          this.log.trace(`${LOG_PREFIX} Updating the local desired records state `);
          this.state = Object.assign({}, state);

      }


    } else {

      // The desired records state has not been specified
      this.log.trace(`${LOG_PREFIX} The desired records state has not been specified`);

      // Use default state
      this.log.trace(`${LOG_PREFIX} Using default state`);


    }

    // Get a fresh set of Data Forms Elements Records from the backend
    this.log.trace(`${LOG_PREFIX} Getting a fresh set of Data Forms Elements Records from the backend`);
    return this.getFreshDataFormsElements(true, state);

  }


  /**
   * Retrieves a fresh set of Data Forms Elements Records from the backend
   * 
   * @param cache Whether the results should be locally cached if freshly retrieved from the database
   * @param state The desired records state
   * @returns The Data Forms Elements Records
   */
  private getFreshDataFormsElements(cache: boolean, state: DataFormElementState): Observable<DataFormElement[]> {

    this.log.trace(`${LOG_PREFIX} Entering getFreshDataFormsElements()`);

    // Set the loading status to true
    this.log.debug(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Collate the query parameters
    this.log.debug(`${LOG_PREFIX} Collating the query parameters`);
    const parameters: any = this.getQueryParams(state);

    // Make a HTTP GET Request to retrieve the records
    this.log.debug(`${LOG_PREFIX} Making a HTTP GET Request to ${this.url} to retrieve the fresh set of records`);
    return this.http.get<DataFormElement[]>(`${this.url}`, { headers: new HttpHeaders(HEADERS), params: new HttpParams({ fromObject: parameters }), observe: 'response' })
      .pipe(

        map((res: HttpResponse<any>) => {

          // Data Forms Elements Records Retrieval was successful
          this.log.trace(`${LOG_PREFIX} Data Forms Elements Records Retrieval was successful`);
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
            this.dataFormElementsSubject$.next(res.body);

          } else {

            // The results should not be locally cached
            this.log.trace(`${LOG_PREFIX} The results should not be locally cached`);

          }

          return res.body;

        }),

        catchError((error: any) => {

          // Data Forms Elements Records Retrieval was unsuccessful
          this.log.error(`${LOG_PREFIX} Data Forms Elements Records Retrieval was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

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
  public get records(): DataFormElement[] {
    return this.dataFormElementsSubject$.value;
  }

  /**
   * Collates query parameters that correspond to the currently set required records state
   * @state The target state
   * @returns The query parameters
   */
   private getQueryParams(state: DataFormElementState): any {

    this.log.trace(`${LOG_PREFIX} Entering getQueryParams()`);

    let params: any = {}

    if (state.id) {
      this.log.trace(`${LOG_PREFIX} Adding id parameter`);
      params['id'] = state.id;
    } 
    
    if (state.indexLTE) {
      this.log.trace(`${LOG_PREFIX} Adding Index LTE`);
      environment.production ? params['index_lte'] = state.indexLTE : params['data.index_lte'] = state.indexLTE;
    }    

    if (state.indexGTE) {
      this.log.trace(`${LOG_PREFIX} Adding Index GTE`);
      environment.production ? params['index_gte'] = state.indexGTE : params['data.index_gte'] = state.indexGTE;
    }     

    if (state.dataFormId) {
      this.log.trace(`${LOG_PREFIX} Adding Data Form Id`);
      environment.production ? params['dataFormId'] = state.dataFormId : params['data.dataFormId'] = state.dataFormId;
    }

    if (state.categoryId) {
      this.log.trace(`${LOG_PREFIX} Adding Category Id`);
      environment.production ? params['categoryId'] = state.categoryId : params['data.categoryId'] = state.categoryId;
    }

    if (state.typeId) {
      this.log.trace(`${LOG_PREFIX} Adding Type Id`);
      environment.production ? params['typeId'] = state.typeId : params['data.typeId'] = state.typeId;
    }

    if (state.parentId) {
      this.log.trace(`${LOG_PREFIX} Adding Parent Id`);
      if(state.parentId == -1){
        environment.production ? params['parentId'] = null : params['data.parentId'] = null;
      } else {
        environment.production ? params['parentId'] = state.parentId : params['data.parentId'] = state.parentId;
      }
    }

    if (state.name && state.name.trim().length > 0) {
      this.log.trace(`${LOG_PREFIX} Adding name parameter`);
      environment.production ? params['name'] = state.name : params['data.name'] = state.name;
    }

    if (state.searchTerm && state.searchTerm.trim().length > 0) {
      this.log.trace(`${LOG_PREFIX} Adding search term parameter`);
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
