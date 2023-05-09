import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { NGXLogger } from 'ngx-logger';
import { Dissagregation } from '../models/dissagregation.model';
import { environment } from 'environments/environment';
import { catchError, map, tap } from 'rxjs/operators';
import { DissagregationState } from '../models/dissagregation-state.model';

const LOG_PREFIX: string = "[Dissagregations Data Service]";
const HEADERS = { 'Content-Type': 'application/json' };

@Injectable({
  providedIn: 'root'
})
export class DissagregationsDataService {

  // Keeps tabs of the default url string
  private url: string = environment.production ?
    `${environment.urls.api}/api/v1/dissagregations` :
    `${environment.urls.api}/dissagregations`;

  // Keeps tabs of the user defined search or sort criteria.
  private state: DissagregationState = {
    page: 1,
    pageSize: 20,
    searchTerm: null,
    sortColumn: 'name',
    sortDirection: 'asc',
    ids: null,
    typeId: null,
    name: null
  };

  // Keeps tabs of the dissagregations
  private dissagregationsSubject$ = new BehaviorSubject<Dissagregation[]>([]);
  readonly dissagregations$ = this.dissagregationsSubject$.asObservable();

  // Keeps tabs of the total dissagregations (irregardless of pagination)
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
   * Creates a new Dissagregation Record
   * 
   * @param dissagregation the details of the Dissagregation Record to be created
   * @returns the newly created Dissagregation Record
   */
  public createDissagregation(dissagregation: Dissagregation): Observable<Dissagregation> {

    this.log.trace(`${LOG_PREFIX} Entering createDissagregation()`);
    this.log.debug(`${LOG_PREFIX} Dissagregation = ${JSON.stringify(dissagregation)}`);

    // Set the loading status to true
    this.log.debug(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Make a HTTP POST Request to create the record
    this.log.debug(`${LOG_PREFIX} Making a HTTP POST Request to ${this.url} to create the record`);
    return this.http.post<Dissagregation>(`${this.url}`, JSON.stringify(dissagregation), { headers: new HttpHeaders(HEADERS) })
      .pipe(

        tap((data: Dissagregation) => {

          // Dissagregation Record Creation was successful
          this.log.trace(`${LOG_PREFIX} Record Creation was successful`);
          this.log.debug(`${LOG_PREFIX} Created Record = ${JSON.stringify(data)}`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          // Refresh the records / record count
          this.log.trace(`${LOG_PREFIX} Refreshing the records / record count`);
          this.getFreshDissagregations(true, this.state).subscribe();

        }),

        catchError((error: any) => {

          // Dissagregation Record Creation was unsuccessful
          this.log.error(`${LOG_PREFIX} Dissagregation Record Creation was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);

        }));
  }



  /**
   * Retrieves Dissagregations Records from the local cache or database
   * 
   * @param cache Whether the results should be locally cached if freshly retrieved from the database
   * @param state The desired records state
   * @returns The Dissagregations Records
   */
  public getDissagregations(cache: boolean, state: DissagregationState): Observable<Dissagregation[]> {

    this.log.trace(`${LOG_PREFIX} Entering getDissagregations()`);

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

        if (this.dissagregationsSubject$.value.length > 0) {

          // The desired data is already available in the local cache
          this.log.trace(`${LOG_PREFIX} The desired data is already available in the local cache`);

          // Return the locally cached data
          this.log.trace(`${LOG_PREFIX} Returning the locally cached data`);

          return of(this.dissagregationsSubject$.value);

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

      if (this.dissagregationsSubject$.value.length > 0) {

        // The desired data is already available in the local cache
        this.log.trace(`${LOG_PREFIX} The desired data is already available in the local cache`);

        // Return the locally cached data
        this.log.trace(`${LOG_PREFIX} Returning the locally cached data`);

        return of(this.dissagregationsSubject$.value);

      }

    }


    // Get a fresh set of Dissagregations Records from the backend
    this.log.trace(`${LOG_PREFIX} Getting a fresh set of Dissagregations Records from the backend`);
    return this.getFreshDissagregations(cache, state);

  }


  /**
   * Retrieves a fresh set of Dissagregations Records from the backend
   * 
   * @param cache Whether the results should be locally cached if freshly retrieved from the database
   * @param state The desired records state
   * @returns The Dissagregations Records
   */  
  private getFreshDissagregations(cache: boolean, state: DissagregationState): Observable<Dissagregation[]> {

    this.log.trace(`${LOG_PREFIX} Entering getFreshDissagregations()`);

    // Set the loading status to true
    this.log.debug(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Make a HTTP GET Request to retrieve the records
    this.log.debug(`${LOG_PREFIX} Making a HTTP GET Request to ${this.url} to retrieve the fresh set of records`);
    return this.http.get<Dissagregation[]>(`${this.url}`, { headers: new HttpHeaders(HEADERS), params: this.getQueryParams(state), observe: 'response' })
      .pipe(

        map((res: HttpResponse<any>) => {

          // Dissagregations Records Retrieval was successful
          this.log.trace(`${LOG_PREFIX} Dissagregations Records Retrieval was successful`);
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
            this.dissagregationsSubject$.next(res.body);

          } else {

            // The results should not be locally cached
            this.log.trace(`${LOG_PREFIX} The results should not be locally cached`);

          }

          return res.body;

        }),

        catchError((error: any) => {

          // Dissagregations Records Retrieval was unsuccessful
          this.log.error(`${LOG_PREFIX} Dissagregations Records Retrieval was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);

        }));
  }



  /**
   * Updates a single Dissagregation Record
   * 
   * @param dissagregation The details of the Dissagregation Record to be updated
   * @returns the updated Dissagregation Record
   */
  public updateDissagregation(dissagregation: Dissagregation): Observable<Dissagregation> {

    this.log.trace(`${LOG_PREFIX} Entering updateDissagregation()`);
    this.log.debug(`${LOG_PREFIX} Dissagregation = ${JSON.stringify(dissagregation)}`);

    // Set the loading status to true
    this.log.debug(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Make a HTTP POST Request to update the record
    this.log.debug(`${LOG_PREFIX} Making a HTTP POST Request to ${this.url}/${dissagregation.id} to update the record`);
    return this.http.put<Dissagregation>(`${this.url}/${dissagregation.id} `, JSON.stringify(dissagregation), { headers: new HttpHeaders(HEADERS) })
      .pipe(

        tap((data: Dissagregation) => {

          // Dissagregation Record Update was successful
          this.log.trace(`${LOG_PREFIX} Dissagregation Record Update was successful`);
          this.log.debug(`${LOG_PREFIX} Updated Record = ${JSON.stringify(data)}`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          // Refresh the records / record count
          this.log.trace(`${LOG_PREFIX} Refreshing the records / record count`);
          this.getFreshDissagregations(true, this.state).subscribe();


        }),

        catchError((error: any) => {

          // Dissagregation Record Update was unsuccessful
          this.log.error(`${LOG_PREFIX} Dissagregation Record Update was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);

        }));
  }


  /**
   * Deletes a single Dissagregation Record
   *
   * @param dissagregationId The id of the Dissagregation Record to be deleted
   */
  public deleteDissagregation(dissagregationId: number): Observable<void> {

    this.log.trace(`${LOG_PREFIX} Entering deleteDissagregation()`);
    this.log.debug(`${LOG_PREFIX} Dissagregation Id = ${dissagregationId}`);

    // Make a HTTP DELETE Request to delete the records
    this.log.debug(`${LOG_PREFIX} Making a HTTP DELETE Request to ${this.url}/${dissagregationId} to delete the record`);

    return this.http.delete<void>(`${this.url}/${dissagregationId}`, { headers: new HttpHeaders(HEADERS) })
      .pipe(

        tap(() => {

          // Dissagregation Record Deletion was successful
          this.log.trace(`${LOG_PREFIX} Dissagregation Record Deletion was successful`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          // Refresh the records / record count
          this.log.trace(`${LOG_PREFIX} Refreshing the records / record count`);
          this.getFreshDissagregations(true, this.state).subscribe();

        }),

        catchError((error: any) => {

          // Dissagregation Record Deletion was unsuccessful
          this.log.error(`${LOG_PREFIX} Dissagregation Record Deletion was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

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
  public get records(): Dissagregation[] {
    return this.dissagregationsSubject$.value;
  }

  /**
   * Collates query parameters that correspond to the currently set required records state
   * @state The target state
   * @returns The query parameters
   */
   private getQueryParams(state: DissagregationState): HttpParams {

    this.log.trace(`${LOG_PREFIX} Entering getQueryParams()`);

    let params: HttpParams = new HttpParams();

    if (state.ids) {
      this.log.trace(`${LOG_PREFIX} Adding id parameters`);
      state.ids.forEach(id => {
        params = params.append("id", id);
      });
    }
    
    if (state.typeId) {
      this.log.trace(`${LOG_PREFIX} Adding type id parameter`);
      environment.production ? params = params.append("typeId", state.typeId) : params = params.append("data.typeId", state.typeId);
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
