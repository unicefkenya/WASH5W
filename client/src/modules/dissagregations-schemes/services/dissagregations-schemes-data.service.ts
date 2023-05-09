import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { NGXLogger } from 'ngx-logger';
import { DissagregationScheme } from '../models/dissagregation-scheme.model';
import { environment } from 'environments/environment';
import { catchError, map, tap } from 'rxjs/operators';
import { DissagregationSchemeState } from '../models/dissagregation-scheme-state.model';

const LOG_PREFIX: string = "[Dissagregations Schemes Data Service]";
const HEADERS = { 'Content-Type': 'application/json' };

@Injectable({
  providedIn: 'root'
})
export class DissagregationsSchemesDataService {

  // Keeps tabs of the default url string
  private url: string = environment.production ?
    `${environment.urls.api}/api/v1/dissagregations_schemes` :
    `${environment.urls.api}/dissagregations_schemes`;

  // Keeps tabs of the user defined search or sort criteria.
  private state: DissagregationSchemeState = {
    searchTerm: null,
    page: 1,
    pageSize: 20,
    sortColumn: 'name',
    sortDirection: 'asc',
    ids: null,
    name: null  
  };

  // Keeps tabs of the dissagregationsSchemes
  private dissagregationsSchemesSubject$ = new BehaviorSubject<DissagregationScheme[]>([]);
  readonly dissagregationsSchemes$ = this.dissagregationsSchemesSubject$.asObservable();

  // Keeps tabs of the total dissagregationsSchemes (irregardless of pagination)
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
   * Creates a new Dissagregation Scheme Record
   * 
   * @param dissagregationScheme the details of the Dissagregation Scheme Record to be created
   * @returns the newly created Dissagregation Scheme Record
   */
  public createDissagregationScheme(dissagregationScheme: DissagregationScheme): Observable<DissagregationScheme> {

    this.log.trace(`${LOG_PREFIX} Entering createDissagregationScheme()`);
    this.log.debug(`${LOG_PREFIX} Dissagregation Scheme = ${JSON.stringify(dissagregationScheme)}`);

    // Set the loading status to true
    this.log.debug(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Make a HTTP POST Request to create the record
    this.log.debug(`${LOG_PREFIX} Making a HTTP POST Request to ${this.url} to create the record`);
    return this.http.post<DissagregationScheme>(`${this.url}`, JSON.stringify(dissagregationScheme), { headers: new HttpHeaders(HEADERS) })
      .pipe(

        tap((data: DissagregationScheme) => {

          // Dissagregation Scheme Record Creation was successful
          this.log.trace(`${LOG_PREFIX} Record Creation was successful`);
          this.log.debug(`${LOG_PREFIX} Created Record = ${JSON.stringify(data)}`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          // Refresh the records / record count
          this.log.trace(`${LOG_PREFIX} Refreshing the records / record count`);
          this.getFreshDissagregationsSchemes(true, this.state).subscribe();

        }),

        catchError((error: any) => {

          // Dissagregation Scheme Record Creation was unsuccessful
          this.log.error(`${LOG_PREFIX} Dissagregation Scheme Record Creation was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);

        }));
  }



  /**
   * Retrieves Dissagregations Schemes Records from the local cache or database
   * 
   * @param cache Whether the results should be locally cached if freshly retrieved from the database
   * @param state The desired records state
   * @returns The Dissagregations Schemes Records
   */
  public getDissagregationsSchemes(cache: boolean, state: DissagregationSchemeState): Observable<DissagregationScheme[]> {

    this.log.trace(`${LOG_PREFIX} Entering getDissagregationsSchemes()`);

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

        if (this.dissagregationsSchemesSubject$.value.length > 0) {

          // The desired data is already available in the local cache
          this.log.trace(`${LOG_PREFIX} The desired data is already available in the local cache`);

          // Return the locally cached data
          this.log.trace(`${LOG_PREFIX} Returning the locally cached data`);

          return of(this.dissagregationsSchemesSubject$.value);

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

      if (this.dissagregationsSchemesSubject$.value.length > 0) {

        // The desired data is already available in the local cache
        this.log.trace(`${LOG_PREFIX} The desired data is already available in the local cache`);

        // Return the locally cached data
        this.log.trace(`${LOG_PREFIX} Returning the locally cached data`);

        return of(this.dissagregationsSchemesSubject$.value);

      }

    }


    // Get a fresh set of Dissagregations Schemes Records from the backend
    this.log.trace(`${LOG_PREFIX} Getting a fresh set of Dissagregations Schemes Records from the backend`);
    return this.getFreshDissagregationsSchemes(cache, state);

  }


  /**
   * Retrieves a fresh set of Dissagregations Schemes Records from the backend
   * 
   * @param cache Whether the results should be locally cached if freshly retrieved from the database
   * @param state The desired records state
   * @returns The Dissagregations Schemes Records
   */  
  private getFreshDissagregationsSchemes(cache: boolean, state: DissagregationSchemeState): Observable<DissagregationScheme[]> {

    this.log.trace(`${LOG_PREFIX} Entering getFreshDissagregationsSchemes()`);

    // Set the loading status to true
    this.log.debug(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);
    

    // Make a HTTP GET Request to retrieve the records
    this.log.debug(`${LOG_PREFIX} Making a HTTP GET Request to ${this.url} to retrieve the fresh set of records`);
    return this.http.get<DissagregationScheme[]>(`${this.url}`, { headers: new HttpHeaders(HEADERS), params: this.getQueryParams(state), observe: 'response' })
      .pipe(

        map((res: HttpResponse<any>) => {

          // Dissagregations Schemes Records Retrieval was successful
          this.log.trace(`${LOG_PREFIX} Dissagregations Schemes Records Retrieval was successful`);
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
            this.dissagregationsSchemesSubject$.next(res.body);

          } else {

            // The results should not be locally cached
            this.log.trace(`${LOG_PREFIX} The results should not be locally cached`);

          }

          return res.body;

        }),

        catchError((error: any) => {

          // Dissagregations Schemes Records Retrieval was unsuccessful
          this.log.error(`${LOG_PREFIX} Dissagregations Schemes Records Retrieval was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);

        }));
  }



  /**
   * Updates a single Dissagregation Scheme Record
   * 
   * @param dissagregationScheme The details of the Dissagregation Scheme Record to be updated
   * @returns the updated Dissagregation Scheme Record
   */
  public updateDissagregationScheme(dissagregationScheme: DissagregationScheme): Observable<DissagregationScheme> {

    this.log.trace(`${LOG_PREFIX} Entering updateDissagregationScheme()`);
    this.log.debug(`${LOG_PREFIX} Dissagregation Scheme = ${JSON.stringify(dissagregationScheme)}`);

    // Set the loading status to true
    this.log.debug(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Make a HTTP POST Request to update the record
    this.log.debug(`${LOG_PREFIX} Making a HTTP POST Request to ${this.url}/${dissagregationScheme.id} to update the record`);
    return this.http.put<DissagregationScheme>(`${this.url}/${dissagregationScheme.id} `, JSON.stringify(dissagregationScheme), { headers: new HttpHeaders(HEADERS) })
      .pipe(

        tap((data: DissagregationScheme) => {

          // Dissagregation Scheme Record Update was successful
          this.log.trace(`${LOG_PREFIX} Dissagregation Scheme Record Update was successful`);
          this.log.debug(`${LOG_PREFIX} Updated Record = ${JSON.stringify(data)}`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          // Refresh the records / record count
          this.log.trace(`${LOG_PREFIX} Refreshing the records / record count`);
          this.getFreshDissagregationsSchemes(true, this.state).subscribe();


        }),

        catchError((error: any) => {

          // Dissagregation Scheme Record Update was unsuccessful
          this.log.error(`${LOG_PREFIX} Dissagregation Scheme Record Update was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);

        }));
  }


  /**
   * Deletes a single Dissagregation Scheme Record
   *
   * @param dissagregationSchemeId The id of the Dissagregation Scheme Record to be deleted
   */
  public deleteDissagregationScheme(dissagregationSchemeId: number): Observable<void> {

    this.log.trace(`${LOG_PREFIX} Entering deleteDissagregationScheme()`);
    this.log.debug(`${LOG_PREFIX} Dissagregation Scheme Id = ${dissagregationSchemeId}`);

    // Make a HTTP DELETE Request to delete the records
    this.log.debug(`${LOG_PREFIX} Making a HTTP DELETE Request to ${this.url}/${dissagregationSchemeId} to delete the record`);

    return this.http.delete<void>(`${this.url}/${dissagregationSchemeId}`, { headers: new HttpHeaders(HEADERS) })
      .pipe(

        tap(() => {

          // Dissagregation Scheme Record Deletion was successful
          this.log.trace(`${LOG_PREFIX} Dissagregation Scheme Record Deletion was successful`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          // Refresh the records / record count
          this.log.trace(`${LOG_PREFIX} Refreshing the records / record count`);
          this.getFreshDissagregationsSchemes(true, this.state).subscribe();

        }),

        catchError((error: any) => {

          // Dissagregation Scheme Record Deletion was unsuccessful
          this.log.error(`${LOG_PREFIX} Dissagregation Scheme Record Deletion was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

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
  public get records(): DissagregationScheme[] {
    return this.dissagregationsSchemesSubject$.value;
  }

  /**
   * Collates query parameters that correspond to the currently set required records state
   * @state The target state
   * @returns The query parameters
   */
   private getQueryParams(state: DissagregationSchemeState): HttpParams {

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
