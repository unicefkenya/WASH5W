import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { NGXLogger } from 'ngx-logger';
import { Indicator } from '../models/indicator.model';
import { environment } from 'environments/environment';
import { catchError, map, tap } from 'rxjs/operators';
import { IndicatorState } from '../models/indicator-state.model';

const LOG_PREFIX: string = "[Indicators Data Service]";
const HEADERS = { 'Content-Type': 'application/json' };

@Injectable({
  providedIn: 'root'
})
export class IndicatorsDataService {

  // Keeps tabs of the default url string
  private url: string = environment.production ?
    `${environment.urls.api}/api/v1/indicators` :
    `${environment.urls.api}/indicators`;

  // Keeps tabs of the user defined search or sort criteria.
  private state: IndicatorState = {
    searchTerm: null,
    page: 1,
    pageSize: 20,
    sortColumn: 'name',
    sortDirection: 'asc',
    ids: null,
    contextId: null,
    no: null,
    name: null,
    logicalParentId: null
  };

  // Keeps tabs of the indicators
  private indicatorsSubject$ = new BehaviorSubject<Indicator[]>([]);
  readonly indicators$ = this.indicatorsSubject$.asObservable();

  // Keeps tabs of the total indicators (irregardless of pagination)
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
   * Creates a new Indicator Record
   * 
   * @param indicator the details of the Indicator Record to be created
   * @returns the newly created Indicator Record
   */
  public createIndicator(indicator: Indicator): Observable<Indicator> {

    this.log.trace(`${LOG_PREFIX} Entering createIndicator()`);
    this.log.debug(`${LOG_PREFIX} Indicator = ${JSON.stringify(indicator)}`);

    // Set the loading status to true
    this.log.trace(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Make a HTTP POST Request to create the record
    this.log.debug(`${LOG_PREFIX} Making a HTTP POST Request to ${this.url} to create the record`);
    return this.http.post<Indicator>(`${this.url}`, JSON.stringify(indicator), { headers: new HttpHeaders(HEADERS) })
      .pipe(

        tap((data: Indicator) => {

          // Indicator Record Creation was successful
          this.log.trace(`${LOG_PREFIX} Record Creation was successful`);
          this.log.debug(`${LOG_PREFIX} Created Record = ${JSON.stringify(data)}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          // Refresh the records / record count
          this.log.trace(`${LOG_PREFIX} Refreshing the records / record count`);
          this.getFreshIndicators(true, this.state).subscribe();

        }),

        catchError((error: any) => {

          // Indicator Record Creation was unsuccessful
          this.log.error(`${LOG_PREFIX} Indicator Record Creation was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);

        }));
  }



  /**
   * Retrieves Indicators Records from the local cache or database
   * 
   * @param cache Whether the results should be locally cached if freshly retrieved from the database
   * @param state The desired records state
   * @returns The Indicators Records
   */
  public getIndicators(cache: boolean, state: IndicatorState): Observable<Indicator[]> {

    this.log.trace(`${LOG_PREFIX} Entering getIndicators()`);

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

        if (this.indicatorsSubject$.value.length > 0) {

          // The desired data is already available in the local cache
          this.log.trace(`${LOG_PREFIX} The desired data is already available in the local cache`);

          // Return the locally cached data
          this.log.trace(`${LOG_PREFIX} Returning the locally cached data`);

          return of(this.indicatorsSubject$.value);

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

      if (this.indicatorsSubject$.value.length > 0) {

        // The desired data is already available in the local cache
        this.log.trace(`${LOG_PREFIX} The desired data is already available in the local cache`);

        // Return the locally cached data
        this.log.trace(`${LOG_PREFIX} Returning the locally cached data`);

        return of(this.indicatorsSubject$.value);

      }

    }


    // Get a fresh set of Indicators Records from the backend
    this.log.trace(`${LOG_PREFIX} Getting a fresh set of Indicators Records from the backend`);
    return this.getFreshIndicators(cache, state);

  }


  /**
   * Retrieves a fresh set of Indicators Records from the backend
   * 
   * @param cache Whether the results should be locally cached if freshly retrieved from the database
   * @param state The desired records state
   * @returns The Indicators Records
   */
  private getFreshIndicators(cache: boolean, state: IndicatorState): Observable<Indicator[]> {

    this.log.trace(`${LOG_PREFIX} Entering getFreshIndicators()`);

    // Set the loading status to true
    this.log.trace(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Make a HTTP GET Request to retrieve the records
    this.log.debug(`${LOG_PREFIX} Making a HTTP GET Request to ${this.url} to retrieve the fresh set of records`);
    return this.http.get<Indicator[]>(`${this.url}`, { headers: new HttpHeaders(HEADERS), params: this.getQueryParams(state), observe: 'response' })
      .pipe(

        map((res: HttpResponse<any>) => {

          // Indicators Records Retrieval was successful
          this.log.trace(`${LOG_PREFIX} Indicators Records Retrieval was successful`);
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
            this.indicatorsSubject$.next(res.body);

          } else {

            // The results should not be locally cached
            this.log.trace(`${LOG_PREFIX} The results should not be locally cached`);

          }

          return res.body;

        }),

        catchError((error: any) => {

          // Indicators Records Retrieval was unsuccessful
          this.log.error(`${LOG_PREFIX} Indicators Records Retrieval was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);

        }));
  }



  /**
   * Updates a single Indicator Record
   * 
   * @param indicator The details of the Indicator Record to be updated
   * @returns the updated Indicator Record
   */
  public updateIndicator(indicator: Indicator): Observable<Indicator> {

    this.log.trace(`${LOG_PREFIX} Entering updateIndicator()`);
    this.log.debug(`${LOG_PREFIX} Indicator = ${JSON.stringify(indicator)}`);

    // Set the loading status to true
    this.log.trace(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Make a HTTP POST Request to update the record
    this.log.debug(`${LOG_PREFIX} Making a HTTP POST Request to ${this.url}/${indicator.id} to update the record`);
    return this.http.put<Indicator>(`${this.url}/${indicator.id} `, JSON.stringify(indicator), { headers: new HttpHeaders(HEADERS) })
      .pipe(

        tap((data: Indicator) => {

          // Indicator Record Update was successful
          this.log.trace(`${LOG_PREFIX} Indicator Record Update was successful`);
          this.log.debug(`${LOG_PREFIX} Updated Record = ${JSON.stringify(data)}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          // Refresh the records / record count
          this.log.trace(`${LOG_PREFIX} Refreshing the records / record count`);
          this.getFreshIndicators(true, this.state).subscribe();


        }),

        catchError((error: any) => {

          // Indicator Record Update was unsuccessful
          this.log.error(`${LOG_PREFIX} Indicator Record Update was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);

        }));
  }


  /**
   * Deletes a single Indicator Record
   *
   * @param indicatorId The id of the Indicator Record to be deleted
   */
  public deleteIndicator(indicatorId: number): Observable<void> {

    this.log.trace(`${LOG_PREFIX} Entering deleteIndicator()`);
    this.log.debug(`${LOG_PREFIX} Indicator Id = ${indicatorId}`);

    // Make a HTTP DELETE Request to delete the records
    this.log.debug(`${LOG_PREFIX} Making a HTTP DELETE Request to ${this.url}/${indicatorId} to delete the record`);

    return this.http.delete<void>(`${this.url}/${indicatorId}`, { headers: new HttpHeaders(HEADERS) })
      .pipe(

        tap(() => {

          // Indicator Record Deletion was successful
          this.log.trace(`${LOG_PREFIX} Indicator Record Deletion was successful`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          // Refresh the records / record count
          this.log.trace(`${LOG_PREFIX} Refreshing the records / record count`);
          this.getFreshIndicators(true, this.state).subscribe();

        }),

        catchError((error: any) => {

          // Indicator Record Deletion was unsuccessful
          this.log.error(`${LOG_PREFIX} Indicator Record Deletion was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

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
  public get records(): Indicator[] {
    return this.indicatorsSubject$.value;
  }

  /**
   * Collates query parameters that correspond to the currently set required records state
   * @state The target state
   * @returns The query parameters
   */
  private getQueryParams(state: IndicatorState): HttpParams {

    this.log.trace(`${LOG_PREFIX} Entering getQueryParams()`);

    let params: HttpParams = new HttpParams();

    if (state.ids) {
      this.log.trace(`${LOG_PREFIX} Adding id parameters`);
      state.ids.forEach(id => {
        params = params.append("id", id);
      });
    }


    if (state.contextId) {
      this.log.trace(`${LOG_PREFIX} Adding context id parameter`);
      environment.production ? params = params.append("contextId", state.contextId) : params = params.append("data.contextId", state.contextId);
    }

    if (state.no && state.no.trim().length > 0) {
      this.log.trace(`${LOG_PREFIX} Adding no parameter`);
      environment.production ? params = params.append("no", state.no) : params = params.append("data.no", state.no);
    }

    if (state.name && state.name.trim().length > 0) {
      this.log.trace(`${LOG_PREFIX} Adding name parameter`);
      environment.production ? params = params.append("name", state.name) : params = params.append("data.name", state.name);
    }

    if (state.searchTerm && state.searchTerm.trim().length > 0) {
      this.log.trace(`${LOG_PREFIX} Adding search term parameter`);
      environment.production ? params = params.append("q", state.searchTerm) : params = params.append("q", state.searchTerm);
    }

    if (state.logicalParentId) {
      this.log.trace(`${LOG_PREFIX} Adding logicalParent id parameter`);
      environment.production ? params = params.append("logicalParentId", state.logicalParentId) : params = params.append("data.logicalParentId", state.logicalParentId);
    }

    if (state.sortColumn) {
      this.log.trace(`${LOG_PREFIX} Adding sort parameter`);
      switch (state.sortColumn) {
        case "id":
          params = params.append("_sort", state.sortColumn);
          break;
        default:
          environment.production ? params = params.append("_sort", state.sortColumn) : params = (state.sortColumn == "id"? params.append("_sort", "id") : params.append("_sort", "data. " + state.sortColumn));

      }
    }

    if (state.sortDirection) {
      this.log.trace(`${LOG_PREFIX} Adding sort direction parameter`);
      params = params.append("_order", state.sortDirection);
    }


    if (state.page) {
      this.log.trace(`${LOG_PREFIX} Adding page parameter`);
      params = params.append("_page", state.page);
    }

    if (state.pageSize) {
      this.log.trace(`${LOG_PREFIX} Adding limit`);
      params = params.append("_limit", state.pageSize);
    }    

    return params;
  }

}
