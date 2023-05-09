import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { NGXLogger } from 'ngx-logger';
import { DataFormElement } from '../models/data-form-element.model';
import { environment } from 'environments/environment';
import { catchError, map, tap } from 'rxjs/operators';
import { DataFormElementState } from '../models/data-form-element-state.model';

const LOG_PREFIX: string = "[Data Forms Elements Data Service]";
const HEADERS = { 'Content-Type': 'application/json' };

@Injectable({
  providedIn: 'root'
})
export class DataFormsElementsDataService {

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

  // Keeps tabs of the top-level data form elements
  private topLevelDataFormElementsSubject$ = new BehaviorSubject<DataFormElement[]>([]);
  readonly topLevelDataFormElements$ = this.topLevelDataFormElementsSubject$.asObservable();

  // Keeps tabs of the nested data form elements
  private nestedDataFormElementsSubject$ = new BehaviorSubject<Map<number, DataFormElement[]>>(new Map());
  readonly nestedDataFormElements$ = this.nestedDataFormElementsSubject$.asObservable();

  // Keeps tabs of the nested data form elements mapped to their parent id
  public nestedDataFormElements: Map<number, DataFormElement[]> = new Map<number, DataFormElement[]>();

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
   * Creates a new Data Form Element Record
   * 
   * @param dataFormElement the details of the Data Form Element Record to be created
   * @returns the newly created Data Form Element Record
   */
  public createDataFormElement(dataFormElement: DataFormElement): Observable<DataFormElement> {

    this.log.trace(`${LOG_PREFIX} Entering createDataFormElement()`);
    this.log.debug(`${LOG_PREFIX} Data Form = ${JSON.stringify(dataFormElement)}`);

    // Set the loading status to true
    this.log.debug(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Make a HTTP POST Request to create the record
    this.log.debug(`${LOG_PREFIX} Making a HTTP POST Request to ${this.url} to create the record`);
    return this.http.post<DataFormElement>(`${this.url}`, JSON.stringify(dataFormElement), { headers: new HttpHeaders(HEADERS) })
      .pipe(

        tap((data: DataFormElement) => {

          // Data Form Element Record Creation was successful
          this.log.trace(`${LOG_PREFIX} Record Creation was successful`);
          this.log.debug(`${LOG_PREFIX} Created Record = ${JSON.stringify(data)}`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          // Refresh the records / record count
          this.log.trace(`${LOG_PREFIX} Refreshing the records / record count`);
          this.getFreshDataFormsElements(true, this.state).subscribe();

        }),

        catchError((error: any) => {

          // Data Form Element Record Creation was unsuccessful
          this.log.error(`${LOG_PREFIX} Data Form Element Record Creation was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);

        }));
  }


  /**
   * Creates new Data Forms Elements Records
   * 
   * @param dataFormElement the details of the Data Forms Elements Records to be created
   * @returns the newly created Data Forms Elements Records
   */
  public createDataFormElements(dataFormElements: DataFormElement[]): Observable<DataFormElement[]> {

    this.log.trace(`${LOG_PREFIX} Entering createDataFormElements()`);
    this.log.debug(`${LOG_PREFIX} Data Form Elements = ${JSON.stringify(dataFormElements)}`);

    // Set the loading status to true
    this.log.debug(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Make a HTTP POST Request to create the records
    this.log.debug(`${LOG_PREFIX} Making a HTTP POST Request to ${this.url}/all to create the records`);
    return this.http.post<DataFormElement[]>(`${this.url}/all`, JSON.stringify(dataFormElements), { headers: new HttpHeaders(HEADERS) })
      .pipe(

        tap((data: DataFormElement[]) => {

          // Data Form Element Records Creation was successful
          this.log.trace(`${LOG_PREFIX} Records Creation was successful`);
          this.log.debug(`${LOG_PREFIX} Created Records = ${JSON.stringify(data)}`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          // Refresh the records / record count
          this.log.trace(`${LOG_PREFIX} Refreshing the records / record count`);
          this.getFreshDataFormsElements(true, this.state).subscribe();

        }),

        catchError((error: any) => {

          // Data Form Element Records Creation was unsuccessful
          this.log.error(`${LOG_PREFIX} Data Form Element Records Creation was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);

        }));
  }



  /**
   * Retrieves Data Forms Elements Records from the local cache or database
   * 
   * @param cache Whether the results should be locally cached if freshly retrieved from the database
   * @param state The desired records state
   * @returns The Data Forms Elements Records
   */
  public getDataFormsElements(cache: boolean, state: DataFormElementState): Observable<DataFormElement[]> {

    this.log.trace(`${LOG_PREFIX} Entering getDataFormsElements()`);

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

        if (this.dataFormElementsSubject$.value.length > 0) {

          // The desired data is already available in the local cache
          this.log.trace(`${LOG_PREFIX} The desired data is already available in the local cache`);

          // Return the locally cached data
          this.log.trace(`${LOG_PREFIX} Returning the locally cached data`);

          return of(this.dataFormElementsSubject$.value);

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

      if (this.dataFormElementsSubject$.value.length > 0) {

        // The desired data is already available in the local cache
        this.log.trace(`${LOG_PREFIX} The desired data is already available in the local cache`);

        // Return the locally cached data
        this.log.trace(`${LOG_PREFIX} Returning the locally cached data`);

        return of(this.dataFormElementsSubject$.value);

      }

    }


    if (state.dataFormId) {

      // Get a fresh set of Data Forms Elements Records from the backend
      this.log.trace(`${LOG_PREFIX} Getting a fresh set of Data Forms Elements Records from the backend`);
      return this.getFreshDataFormsElements(cache, state);

    } else {

      if (cache) {

        // Add the total results to the locale cache and broadcast the update
        this.log.trace(`${LOG_PREFIX} Adding the total results to the locale cache and broadcast the update`);
        this.totalRecordsSubject$.next(0);

        // Add the actual results to the locale cache and broadcast the update
        this.log.trace(`${LOG_PREFIX} Adding the actual results to the locale cache and broadcast the update`);
        this.dataFormElementsSubject$.next([]);

        // Update the local Top Level and Nested Data Form Elements
        this.log.trace(`${LOG_PREFIX} Updating the local Top Level and Nested Data Form Elements`);
        this.topLevelDataFormElementsSubject$.next([]);
        this.nestedDataFormElements = new Map();

      }

      return of([]);

    }



  }

  /**
   * Recursively retrieves a fresh set of Data Forms Elements Records
   * 
   * @param state The desired records state
   * @returns The Data Forms Elements Records
   */
  public getDataFormsElementsRecursively(id: number): Observable<DataFormElement[]> {

    this.log.trace(`${LOG_PREFIX} Entering getDataFormsElementsRecursively()`);

    // Set the loading status to true
    this.log.debug(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Make a HTTP GET Request to retrieve the records
    this.log.debug(`${LOG_PREFIX} Making a HTTP GET Request to ${this.url} to retrieve the fresh set of records`);
    return this.http.get<DataFormElement[]>(`${this.url}/parent/${id}`, { headers: new HttpHeaders(HEADERS), observe: 'response' })
      .pipe(

        map((res: HttpResponse<any>) => {

          // Data Forms Elements Records Retrieval was successful
          this.log.trace(`${LOG_PREFIX} Data Forms Elements Records Retrieval was successful`);
          this.log.debug(`${LOG_PREFIX} Retrieved Records = ${JSON.stringify(res.body)}`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

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
   * Return a data form's last data element
   * @param dataFormId the target data form
   * @param parentId the parent data form group
   * @returns the last data form element or null if it doesn't exist
   */
  public getLastDataFormElement(dataFormId: number, parentId: number | null | undefined): Observable<DataFormElement | null> {
    return this.getDataFormsElements(false, {
      searchTerm: null,
      page: null,
      pageSize: null,
      sortColumn: 'index',
      sortDirection: 'desc',
      id: null,
      indexLTE: null,
      indexGTE: null,
      dataFormId: dataFormId,
      categoryId: null,
      typeId: null,
      parentId: parentId,
      name: null
    }).pipe(
      map((res: DataFormElement[]) => {
        const temp: DataFormElement[] = res.filter(d => d.data.parentId === parentId);
        return temp.length > 0 ? temp[0] : null;
      }),
      catchError((err: any) => {
        throw new Error(err);
      })
    );
  }


  /**
 * Return a data form's data element's preceding element
 * @param dataFormId the target data form
 * @param parentId the parent data form group
 * @param index the index of the data form element from whose perspective the comparison is being made
 * @returns the last data form element or null if it doesn't exist
 */
  public getPrecedingDataFormElement(dataFormId: number, parentId: number | null | undefined, index: number): Observable<DataFormElement | null> {
    return this.getDataFormsElements(false, {
      searchTerm: null,
      page: null,
      pageSize: null,
      sortColumn: 'index',
      sortDirection: 'desc',
      id: null,
      indexLTE: index - 1, // Subtract 1 to avoid retrieving the same data form element
      indexGTE: null,
      dataFormId: dataFormId,
      categoryId: null,
      typeId: null,
      parentId: parentId,
      name: null
    }).pipe(
      map((res: DataFormElement[]) => {
        const temp: DataFormElement[] = res.filter(d => d.data.parentId === parentId);
        return temp.length > 0 ? temp[0] : null;
      }),
      catchError((err: any) => {
        throw new Error(err);
      })
    );
  }

  /**
 * Return a data form's data element's suceeding element
 * @param dataFormId the target data form
 * @param parentId the parent data form group
 * @param index the index of the data form element from whose perspective the comparison is being made
 * @returns the last data form element or null if it doesn't exist
 */
  public getSucceedingDataFormElement(dataFormId: number, parentId: number | null | undefined, index: number): Observable<DataFormElement | null> {
    return this.getDataFormsElements(false, {
      searchTerm: null,
      page: null,
      pageSize: null,
      sortColumn: 'index',
      sortDirection: 'asc',
      id: null,
      indexLTE: null,
      indexGTE: index + 1, // Add 1 to avoid retrieving the same data form element,
      dataFormId: dataFormId,
      categoryId: null,
      typeId: null,
      parentId: parentId,
      name: null
    }).pipe(
      map((res: DataFormElement[]) => {
        const temp: DataFormElement[] = res.filter(d => d.data.parentId === parentId);
        return temp.length > 0 ? temp[0] : null;
      }),
      catchError((err: any) => {
        throw new Error(err);
      })
    );
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

            // Collate the Top Level and Nested Data Form Elements
            this.log.trace(`${LOG_PREFIX} Collating the Top Level and Nested Data Form Elements`);
            const top: DataFormElement[] = [];
            const nested: Map<number, DataFormElement[]> = new Map();
            for (let dataFormElement of res.body) {
              this.log.trace(`${LOG_PREFIX} ${dataFormElement.data.title}`);
              if (dataFormElement.data.parentId) {

                let siblings: DataFormElement[] | undefined = nested.get(dataFormElement.data.parentId);
                if (siblings) {
                  siblings.push(dataFormElement);
                } else {
                  nested.set(dataFormElement.data.parentId, [dataFormElement])
                }
              } else {
                top.push(dataFormElement);
              }
            }

            // Update the local Top Level and Nested Data Form Elements
            this.log.trace(`${LOG_PREFIX} Updating the local Top Level and Nested Data Form Elements`);
            this.topLevelDataFormElementsSubject$.next(top);
            this.nestedDataFormElements = nested;

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
   * Updates a single Data Form Element Record
   * 
   * @param dataFormElement The details of the Data Form Element Record to be updated
   * @returns the updated Data Form Element Record
   */
  public updateDataFormElement(dataFormElement: DataFormElement): Observable<DataFormElement> {

    this.log.trace(`${LOG_PREFIX} Entering updateDataFormElement()`);
    this.log.debug(`${LOG_PREFIX} Data Form = ${JSON.stringify(dataFormElement)}`);

    // Set the loading status to true
    this.log.debug(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Make a HTTP POST Request to update the record
    this.log.debug(`${LOG_PREFIX} Making a HTTP POST Request to ${this.url}/${dataFormElement.id} to update the record`);
    return this.http.put<DataFormElement>(`${this.url}/${dataFormElement.id} `, JSON.stringify(dataFormElement), { headers: new HttpHeaders(HEADERS) })
      .pipe(

        tap((data: DataFormElement) => {

          // Data Form Element Record Update was successful
          this.log.trace(`${LOG_PREFIX} Data Form Element Record Update was successful`);
          this.log.debug(`${LOG_PREFIX} Updated Record = ${JSON.stringify(data)}`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          // Refresh the records / record count
          this.log.trace(`${LOG_PREFIX} Refreshing the records / record count`);
          this.getFreshDataFormsElements(true, this.state).subscribe();


        }),

        catchError((error: any) => {

          // Data Form Element Record Update was unsuccessful
          this.log.error(`${LOG_PREFIX} Data Form Element Record Update was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);

        }));
  }

  /**
 * Updates existing Data Form Elements records.
 *
 * @param dataFormElements The details of the DataFormElements records to be updated.
 * @returns The updated DataFormElements records.
 */
  public updateDataFormElements(dataFormElements: DataFormElement[]): Observable<DataFormElement[]> {
    this.log.trace(`${LOG_PREFIX} Entering updateDataFormElements()`);
    this.log.debug(`${LOG_PREFIX} Data Form Elements = ${JSON.stringify(dataFormElements)}`);

    // Set the loading status to true
    this.log.debug(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Make a HTTP PUT Request to update the records
    this.log.debug(`${LOG_PREFIX} Making a HTTP PUT Request to ${this.url}/all to update the records`);
    return this.http.put<DataFormElement[]>(`${this.url}/all`, JSON.stringify(dataFormElements), { headers: new HttpHeaders(HEADERS) })
      .pipe(
        tap((data: DataFormElement[]) => {

          // Data Form Element Records update was successful
          this.log.trace(`${LOG_PREFIX} Records update was successful`);
          this.log.debug(`${LOG_PREFIX} Updated Records = ${JSON.stringify(data)}`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          // Refresh the records / record count
          this.log.trace(`${LOG_PREFIX} Refreshing the records / record count`);
          this.getFreshDataFormsElements(true, this.state).subscribe();

        }),

        catchError((error: any) => {

          // Data Form Element Records update was unsuccessful
          this.log.error(`${LOG_PREFIX} Data Form Element Records update was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);

        })
      );
  }



  /**
   * Deletes a single Data Form Element Record
   *
   * @param dataFormElementId The id of the Data Form Element Record to be deleted
   */
  public deleteDataFormElement(dataFormElementId: number): Observable<void> {

    this.log.trace(`${LOG_PREFIX} Entering deleteDataFormElement()`);
    this.log.debug(`${LOG_PREFIX} Data Form Id = ${dataFormElementId}`);

    // Make a HTTP DELETE Request to delete the records
    this.log.debug(`${LOG_PREFIX} Making a HTTP DELETE Request to ${this.url}/${dataFormElementId} to delete the record`);

    return this.http.delete<void>(`${this.url}/${dataFormElementId}`, { headers: new HttpHeaders(HEADERS) })
      .pipe(

        tap(() => {

          // Data Form Element Record Deletion was successful
          this.log.trace(`${LOG_PREFIX} Data Form Element Record Deletion was successful`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          // Refresh the records / record count
          this.log.trace(`${LOG_PREFIX} Refreshing the records / record count`);
          this.getFreshDataFormsElements(true, this.state).subscribe();

        }),

        catchError((error: any) => {

          // Data Form Element Record Deletion was unsuccessful
          this.log.error(`${LOG_PREFIX} Data Form Element Record Deletion was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);
        }));
  }


  /**
     * Delete Data Forms Elements Records
     *
     * @param parentId The id of the Data Form Element Record to be deleted
     */
  public deleteDataFormElements(parentId: number): Observable<DataFormElement[]> {

    this.log.trace(`${LOG_PREFIX} Entering deleteDataFormElements()`);
    this.log.debug(`${LOG_PREFIX} Parent Id = ${parentId}`);

    // Make a HTTP DELETE Request to delete the records
    this.log.debug(`${LOG_PREFIX} Making a HTTP DELETE Request to ${this.url}/parent/${parentId} to delete the records`);

    return this.http.delete<DataFormElement[]>(`${this.url}/parent/${parentId}`, { headers: new HttpHeaders(HEADERS) })
      .pipe(

        tap(() => {

          // Data Form Elements Records Deletion was successful
          this.log.trace(`${LOG_PREFIX} Data Form Elements Records Deletion was successful`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          // Refresh the records / record count
          this.log.trace(`${LOG_PREFIX} Refreshing the records / record count`);
          this.getFreshDataFormsElements(true, this.state).subscribe();

        }),

        catchError((error: any) => {

          // Data Forms Elements Records Deletion were unsuccessful
          this.log.error(`${LOG_PREFIX} Data Forms Elements Records Deletion were unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

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
      environment.production ? params['parentId'] = state.parentId : params['data.parentId'] = state.parentId;
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
      environment.production ? params['_sort'] = state.sortColumn : (params['_sort'] = state.sortColumn == "id" ? state.sortColumn : "data." + state.sortColumn);
    }

    if (state.sortDirection) {
      this.log.trace(`${LOG_PREFIX} Adding sort direction parameter`);
      params['_order'] = state.sortDirection;
    }


    return params;

  }

}
