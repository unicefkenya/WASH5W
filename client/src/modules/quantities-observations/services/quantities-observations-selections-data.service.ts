import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { NGXLogger } from 'ngx-logger';
import { QuantityObservation } from '../models/quantity-observation.model';
import { environment } from 'environments/environment';
import { catchError, map, tap } from 'rxjs/operators';
import { QuantityObservationState } from '../models/quantity-observation-state.model';

const LOG_PREFIX: string = "[Quantities Observations Selection Data Service]";
const HEADERS = { 'Content-Type': 'application/json' };

@Injectable({
  providedIn: 'root'
})
export class QuantitiesObservationsSelectionDataService {


  // Keeps tabs of the default url string
  private url: string = environment.production ?
    `${environment.urls.api}/api/v1/quantities_observations` :
    `${environment.urls.api}/quantities_observations`;

  // Keeps tabs of the user defined search or sort criteria.
  private state: QuantityObservationState = {
    page: 1,
    pageSize: 20,
    searchTerm: null,
    sortColumn: 'id',
    sortDirection: 'asc',
    partiesIds: null,
    timePointId: null,
    timePointIdGTE: null,
    timePointIdLTE: null,
    timePeriodId: null,
    phenomenonTypesIds: null,
    observationTypeId: null
  };

  // Keeps tabs of the quantityObservations
  private quantityObservationsSubject$ = new BehaviorSubject<QuantityObservation[]>([]);
  readonly quantityObservations$ = this.quantityObservationsSubject$.asObservable();

  // Keeps tabs of the total quantityObservations (irregardless of pagination)
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
   * Creates a new Administrative Unit Record
   * 
   * @param quantityObservation the details of the Administrative Unit Record to be created
   * @returns the newly created Administrative Unit Record
   */
  public createQuantityObservation(quantityObservation: QuantityObservation): Observable<QuantityObservation> {

    this.log.trace(`${LOG_PREFIX} Entering createQuantityObservation()`);
    this.log.debug(`${LOG_PREFIX} Administrative Unit = ${JSON.stringify(quantityObservation)}`);

    // Set the loading status to true
    this.log.trace(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Make a HTTP POST Request to create the record
    this.log.debug(`${LOG_PREFIX} Making a HTTP POST Request to ${this.url} to create the record`);
    return this.http.post<QuantityObservation>(`${this.url}`, JSON.stringify(quantityObservation), { headers: new HttpHeaders(HEADERS) })
      .pipe(

        tap((data: QuantityObservation) => {

          // Administrative Unit Record Creation was successful
          this.log.trace(`${LOG_PREFIX} Record Creation was successful`);
          this.log.debug(`${LOG_PREFIX} Created Record = ${JSON.stringify(data)}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          // Refresh the records / record count
          this.log.trace(`${LOG_PREFIX} Refreshing the records / record count`);
          this.getFreshQuantityObservations(true, this.state).subscribe();

        }),

        catchError((error: any) => {

          // Administrative Unit Record Creation was unsuccessful
          this.log.error(`${LOG_PREFIX} Administrative Unit Record Creation was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);

        }));
  }



  /**
   * Retrieves Administrative Units Records from the local cache or database
   * 
   * @param cache Whether the results should be locally cached if freshly retrieved from the database
   * @param state The desired records state
   * @returns The Administrative Units Records
   */
  public getQuantityObservations(cache: boolean, state: QuantityObservationState): Observable<QuantityObservation[]> {

    this.log.trace(`${LOG_PREFIX} Entering getQuantityObservations()`);

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

        if (this.quantityObservationsSubject$.value.length > 0) {

          // The desired data is already available in the local cache
          this.log.trace(`${LOG_PREFIX} The desired data is already available in the local cache`);

          // Return the locally cached data
          this.log.trace(`${LOG_PREFIX} Returning the locally cached data`);

          return of(this.quantityObservationsSubject$.value);

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

      if (this.quantityObservationsSubject$.value.length > 0) {

        // The desired data is already available in the local cache
        this.log.trace(`${LOG_PREFIX} The desired data is already available in the local cache`);

        // Return the locally cached data
        this.log.trace(`${LOG_PREFIX} Returning the locally cached data`);

        return of(this.quantityObservationsSubject$.value);

      }

    }


    // Get a fresh set of Administrative Units Records from the backend
    this.log.trace(`${LOG_PREFIX} Getting a fresh set of Administrative Units Records from the backend`);
    return this.getFreshQuantityObservations(cache, state);

  }


  /**
   * Retrieves a fresh set of Administrative Units Records from the backend
   * 
   * @param cache Whether the results should be locally cached if freshly retrieved from the database
   * @param state The desired records state
   * @returns The Administrative Units Records
   */
  private getFreshQuantityObservations(cache: boolean, state: QuantityObservationState): Observable<QuantityObservation[]> {

    this.log.trace(`${LOG_PREFIX} Entering getFreshQuantityObservations()`);

    // Set the loading status to true
    this.log.trace(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Make a HTTP GET Request to retrieve the records
    this.log.debug(`${LOG_PREFIX} Making a HTTP GET Request to ${this.url} to retrieve the fresh set of records`);
    return this.http.get<QuantityObservation[]>(`${this.url}`, { headers: new HttpHeaders(HEADERS), params: this.getQueryParams(state), observe: 'response' })
      .pipe(

        map((res: HttpResponse<any>) => {

          // Administrative Units Records Retrieval was successful
          this.log.trace(`${LOG_PREFIX} Administrative Units Records Retrieval was successful`);
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
            this.quantityObservationsSubject$.next(res.body);

          } else {

            // The results should not be locally cached
            this.log.trace(`${LOG_PREFIX} The results should not be locally cached`);

          }

          return res.body;

        }),

        catchError((error: any) => {

          // Administrative Units Records Retrieval was unsuccessful
          this.log.error(`${LOG_PREFIX} Administrative Units Records Retrieval was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);

        }));
  }



  /**
   * Updates a single Administrative Unit Record
   * 
   * @param quantityObservation The details of the Administrative Unit Record to be updated
   * @returns the updated Administrative Unit Record
   */
  public updateQuantityObservation(quantityObservation: QuantityObservation): Observable<QuantityObservation> {

    this.log.trace(`${LOG_PREFIX} Entering updateQuantityObservation()`);
    this.log.debug(`${LOG_PREFIX} Administrative Unit = ${JSON.stringify(quantityObservation)}`);

    // Set the loading status to true
    this.log.trace(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Make a HTTP POST Request to update the record
    this.log.debug(`${LOG_PREFIX} Making a HTTP POST Request to ${this.url}/${quantityObservation.id} to update the record`);
    return this.http.put<QuantityObservation>(`${this.url}/${quantityObservation.id} `, JSON.stringify(quantityObservation), { headers: new HttpHeaders(HEADERS) })
      .pipe(

        tap((data: QuantityObservation) => {

          // Administrative Unit Record Update was successful
          this.log.trace(`${LOG_PREFIX} Administrative Unit Record Update was successful`);
          this.log.debug(`${LOG_PREFIX} Updated Record = ${JSON.stringify(data)}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          // Refresh the records / record count
          this.log.trace(`${LOG_PREFIX} Refreshing the records / record count`);
          this.getFreshQuantityObservations(true, this.state).subscribe();


        }),

        catchError((error: any) => {

          // Administrative Unit Record Update was unsuccessful
          this.log.error(`${LOG_PREFIX} Administrative Unit Record Update was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);

        }));
  }


  /**
   * Deletes a single Administrative Unit Record
   *
   * @param quantityObservationId The id of the Administrative Unit Record to be deleted
   */
  public deleteQuantityObservation(quantityObservationId: number): Observable<void> {

    this.log.trace(`${LOG_PREFIX} Entering deleteQuantityObservation()`);
    this.log.debug(`${LOG_PREFIX} Administrative Unit Id = ${quantityObservationId}`);

    // Make a HTTP DELETE Request to delete the records
    this.log.debug(`${LOG_PREFIX} Making a HTTP DELETE Request to ${this.url}/${quantityObservationId} to delete the record`);

    return this.http.delete<void>(`${this.url}/${quantityObservationId}`, { headers: new HttpHeaders(HEADERS) })
      .pipe(

        tap(() => {

          // Administrative Unit Record Deletion was successful
          this.log.trace(`${LOG_PREFIX} Administrative Unit Record Deletion was successful`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          // Refresh the records / record count
          this.log.trace(`${LOG_PREFIX} Refreshing the records / record count`);
          this.getFreshQuantityObservations(true, this.state).subscribe();

        }),

        catchError((error: any) => {

          // Administrative Unit Record Deletion was unsuccessful
          this.log.error(`${LOG_PREFIX} Administrative Unit Record Deletion was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

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
  public get records(): QuantityObservation[] {
    return this.quantityObservationsSubject$.value;
  }

  /**
   * Collates query parameters that correspond to the currently set required records state
   * @state The target state
   * @returns The query parameters
   */
   private getQueryParams(state: QuantityObservationState): HttpParams {

    this.log.trace(`${LOG_PREFIX} Entering getQueryParams()`);

    let params: HttpParams = new HttpParams();

    if (state.partiesIds) {
      this.log.trace(`${LOG_PREFIX} Adding party id parameter`);
      if (environment.production) {

        state.partiesIds.forEach(id => {
          params = params.append("partyId", id);
        });
      } else {
        state.partiesIds.forEach(id => {
          params = params.append("data.partyId", id);
        });
      }
    }

    if (state.timePointId) {
      this.log.trace(`${LOG_PREFIX} Adding timePoint id parameter`);
      params = environment.production ? params.set("timePointId", state.timePointId) : params.set("data.timePointId", state.timePointId);
    }

    if (state.timePointIdGTE) {
      this.log.trace(`${LOG_PREFIX} Adding timePoint id GTE parameter`);
      params = environment.production ? params.set("timePointId_gte", state.timePointIdGTE) : params.set("data.timePointId_gte", state.timePointIdGTE);
    }

    if (state.timePointIdLTE) {
      this.log.trace(`${LOG_PREFIX} Adding timePoint id LTE parameter`);
      params = environment.production ? params.set("timePointId_lte", state.timePointIdLTE) : params.set("data.timePointId_lte", state.timePointIdLTE);
    }

    if (state.timePeriodId) {
      this.log.trace(`${LOG_PREFIX} Adding timePeriod id parameter`);
      params = environment.production ? params.set("timePeriodId", state.timePeriodId) : params.set("data.timePeriodId", state.timePeriodId);
    }    

    if (state.phenomenonTypesIds) {
      this.log.trace(`${LOG_PREFIX} Adding type parameter`);
      if (environment.production) {

        state.phenomenonTypesIds.forEach(id => {
          params = params.append("phenomenonTypeId", id);
        });
      } else {
        state.phenomenonTypesIds.forEach(id => {
          params = params.append("data.phenomenonTypeId", id);
        });
      }
    }

    if (state.observationTypeId) {
      this.log.trace(`${LOG_PREFIX} Adding observation type id parameter`);
      params = environment.production ? params.set("observationTypeId", state.observationTypeId) : params.set("data.observationTypeId", state.observationTypeId);
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

    return params;
  }

}
