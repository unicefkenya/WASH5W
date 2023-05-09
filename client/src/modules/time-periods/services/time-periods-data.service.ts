import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { NGXLogger } from 'ngx-logger';
import { TimePeriod } from '../models/time-period.model';
import { environment } from 'environments/environment';
import { catchError, map, tap } from 'rxjs/operators';
import { TimePeriodState } from '../models/time-period-state.model';
import moment from 'moment';
import { Context } from '@modules/contexts/models/context.model';

const LOG_PREFIX: string = "[Times Periods Data Service]";
const HEADERS = { 'Content-Type': 'application/json' };

@Injectable({
  providedIn: 'root'
})
export class TimePeriodsDataService {

  // Keeps tabs of the default url string
  private url: string = environment.production ?
    `${environment.urls.api}/api/v1/time_periods` :
    `${environment.urls.api}/time_periods`;

  // Keeps tabs of the user defined search or sort criteria.
  private state: TimePeriodState = {
    searchTerm: null,
    page: 1,
    pageSize: 20,
    sortColumn: 'id',
    sortDirection: 'desc',
    contextId: null,
    open: null,
    id: null
  };

  // Keeps tabs of the timePeriods
  private timePeriodsSubject$ = new BehaviorSubject<TimePeriod[]>([]);
  readonly timePeriods$ = this.timePeriodsSubject$.asObservable();

  // Keeps tabs of the total timePeriods (irregardless of pagination)
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
   * Creates a new Time Period Record
   * 
   * @param timePeriod the details of the Time Period Record to be created
   * @returns the newly created Time Period Record
   */
  public createTimePeriod(timePeriod: TimePeriod): Observable<TimePeriod> {

    this.log.trace(`${LOG_PREFIX} Entering createTimePeriod()`);
    this.log.debug(`${LOG_PREFIX} Time Period = ${JSON.stringify(timePeriod)}`);

    // Set the loading status to true
    this.log.trace(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Make a HTTP POST Request to create the record
    this.log.debug(`${LOG_PREFIX} Making a HTTP POST Request to ${this.url} to create the record`);
    return this.http.post<TimePeriod>(`${this.url}`, JSON.stringify(timePeriod), { headers: new HttpHeaders(HEADERS) })
      .pipe(

        tap((data: TimePeriod) => {

          // Time Period Record Creation was successful
          this.log.trace(`${LOG_PREFIX} Record Creation was successful`);
          this.log.debug(`${LOG_PREFIX} Created Record = ${JSON.stringify(data)}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          // Refresh the records / record count
          this.log.trace(`${LOG_PREFIX} Refreshing the records / record count`);
          this.getFreshTimePeriods(true, this.state).subscribe();

        }),

        catchError((error: any) => {

          // Time Period Record Creation was unsuccessful
          this.log.error(`${LOG_PREFIX} Time Period Record Creation was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);

        }));
  }



  /**
   * Retrieves Times Periods Records from the local cache or database
   * 
   * @param cache Whether the results should be locally cached if freshly retrieved from the database
   * @param state The desired records state
   * @returns The Times Periods Records
   */
  public getTimePeriods(cache: boolean, state: TimePeriodState): Observable<TimePeriod[]> {

    this.log.trace(`${LOG_PREFIX} Entering getTimePeriods()`);

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

        if (this.timePeriodsSubject$.value.length > 0) {

          // The desired data is already available in the local cache
          this.log.trace(`${LOG_PREFIX} The desired data is already available in the local cache`);

          // Return the locally cached data
          this.log.trace(`${LOG_PREFIX} Returning the locally cached data`);

          return of(this.timePeriodsSubject$.value);

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

      if (this.timePeriodsSubject$.value.length > 0) {

        // The desired data is already available in the local cache
        this.log.trace(`${LOG_PREFIX} The desired data is already available in the local cache`);

        // Return the locally cached data
        this.log.trace(`${LOG_PREFIX} Returning the locally cached data`);

        return of(this.timePeriodsSubject$.value);

      }

    }


    // Get a fresh set of Times Periods Records from the backend
    this.log.trace(`${LOG_PREFIX} Getting a fresh set of Times Periods Records from the backend`);
    return this.getFreshTimePeriods(cache, state);

  }


  /**
   * Retrieves a fresh set of Times Periods Records from the backend
   * 
   * @param cache Whether the results should be locally cached if freshly retrieved from the database
   * @param state The desired records state
   * @returns The Times Periods Records
   */
  private getFreshTimePeriods(cache: boolean, state: TimePeriodState): Observable<TimePeriod[]> {

    this.log.trace(`${LOG_PREFIX} Entering getFreshTimePeriods()`);

    // Set the loading status to true
    this.log.trace(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Collate the query parameters
    this.log.debug(`${LOG_PREFIX} Collating the query parameters`);
    const parameters: any = this.getQueryParams(state);


    // Make a HTTP GET Request to retrieve the records
    this.log.debug(`${LOG_PREFIX} Making a HTTP GET Request to ${this.url} to retrieve the fresh set of records`);
    return this.http.get<TimePeriod[]>(`${this.url}`, { headers: new HttpHeaders(HEADERS), params: new HttpParams({ fromObject: parameters }), observe: 'response' })
      .pipe(

        map((res: HttpResponse<any>) => {

          // Times Periods Records Retrieval was successful
          this.log.trace(`${LOG_PREFIX} Times Periods Records Retrieval was successful`);
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
            this.timePeriodsSubject$.next(res.body);

          } else {

            // The results should not be locally cached
            this.log.trace(`${LOG_PREFIX} The results should not be locally cached`);

          }

          return res.body;

        }),

        catchError((error: any) => {

          // Times Periods Records Retrieval was unsuccessful
          this.log.error(`${LOG_PREFIX} Times Periods Records Retrieval was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);

        }));
  }



  /**
   * Updates a single Time Period Record
   * 
   * @param timePeriod The details of the Time Period Record to be updated
   * @returns the updated Time Period Record
   */
  public updateTimePeriod(timePeriod: TimePeriod): Observable<TimePeriod> {

    this.log.trace(`${LOG_PREFIX} Entering updateTimePeriod()`);
    this.log.debug(`${LOG_PREFIX} Time Period = ${JSON.stringify(timePeriod)}`);

    // Set the loading status to true
    this.log.trace(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Make a HTTP POST Request to update the record
    this.log.debug(`${LOG_PREFIX} Making a HTTP POST Request to ${this.url}/${timePeriod.id} to update the record`);
    return this.http.put<TimePeriod>(`${this.url}/${timePeriod.id} `, JSON.stringify(timePeriod), { headers: new HttpHeaders(HEADERS) })
      .pipe(

        tap((data: TimePeriod) => {

          // Time Period Record Update was successful
          this.log.trace(`${LOG_PREFIX} Time Period Record Update was successful`);
          this.log.debug(`${LOG_PREFIX} Updated Record = ${JSON.stringify(data)}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          // Refresh the records / record count
          this.log.trace(`${LOG_PREFIX} Refreshing the records / record count`);
          this.getFreshTimePeriods(true, this.state).subscribe();


        }),

        catchError((error: any) => {

          // Time Period Record Update was unsuccessful
          this.log.error(`${LOG_PREFIX} Time Period Record Update was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);

        }));
  }


  /**
   * Deletes a single Time Period Record
   *
   * @param timePeriodId The id of the Time Period Record to be deleted
   */
  public deleteTimePeriod(timePeriodId: number): Observable<void> {

    this.log.trace(`${LOG_PREFIX} Entering deleteTimePeriod()`);
    this.log.debug(`${LOG_PREFIX} Time Period Id = ${timePeriodId}`);

    // Make a HTTP DELETE Request to delete the records
    this.log.debug(`${LOG_PREFIX} Making a HTTP DELETE Request to ${this.url}/${timePeriodId} to delete the record`);

    return this.http.delete<void>(`${this.url}/${timePeriodId}`, { headers: new HttpHeaders(HEADERS) })
      .pipe(

        tap(() => {

          // Time Period Record Deletion was successful
          this.log.trace(`${LOG_PREFIX} Time Period Record Deletion was successful`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          // Refresh the records / record count
          this.log.trace(`${LOG_PREFIX} Refreshing the records / record count`);
          this.getFreshTimePeriods(true, this.state).subscribe();

        }),

        catchError((error: any) => {

          // Time Period Record Deletion was unsuccessful
          this.log.error(`${LOG_PREFIX} Time Period Record Deletion was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

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
  public get records(): TimePeriod[] {
    return this.timePeriodsSubject$.value;
  }

  /**
   * Collates query parameters that correspond to the currently set required records state
   * @state The target state
   * @returns The query parameters
   */
  private getQueryParams(state: TimePeriodState): any {

    this.log.trace(`${LOG_PREFIX} Entering getQueryParams()`);

    let params: any = {}

    if (state.id) {
      this.log.trace(`${LOG_PREFIX} Adding id parameter`);
      params['id'] = state.id;
    }

    if (state.contextId) {
      this.log.trace(`${LOG_PREFIX} Adding timePeriod id parameter`);
      environment.production ? params['contextId'] = state.contextId : params['data.contextId'] = state.contextId;
    }

    if (state.open) {
      this.log.trace(`${LOG_PREFIX} Adding open parameter`);
      environment.production ? params['open'] = state.open : params['data.open'] = state.open;
    }

    if (state.page) {
      this.log.trace(`${LOG_PREFIX} Adding page parameter`);
      params['_page'] = state.page;
    }

    if (state.pageSize) {
      this.log.trace(`${LOG_PREFIX} Adding limit`);
      params['_limit'] = state.pageSize;
    }

    if (state.searchTerm && state.searchTerm.trim().length > 0) {
      this.log.trace(`${LOG_PREFIX} Adding search term parameter`);
      environment.production ? params['q'] = state.searchTerm : params['q'] = state.searchTerm;
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


  /**
   * Gets a time period that follows the current time period and is aligned with the context settings
   * @returns The time period
   */
  public getNextTimePeriod(currentTimePeriod: TimePeriod, targetContext: Context): TimePeriod | null {

    this.log.trace(`${LOG_PREFIX} Entering getNextTimePeriod()`);

    // Check if the target context time step specification has been provided
    this.log.trace(`${LOG_PREFIX} Checking if the target context time step specification has been provided`);
    if (targetContext.data?.timestep?.id) {

      // The target context time step specification has been provided
      this.log.trace(`${LOG_PREFIX} The target context time step specification has been provided`);

      switch (targetContext.data.timestep.id) {

        case 1:  // Daily
          return this.getNextDailyTimePeriod(currentTimePeriod);

        case 2:  // Weekly
          return this.getNextWeeklyTimePeriod(currentTimePeriod);

        case 3:  // Biweekly
          return this.getNextBiweeklyTimePeriod(currentTimePeriod);

        case 4:  // Monthly
          return this.getNextMonthlyTimePeriod(currentTimePeriod);

        case 5:  // Quarterly
          return this.getNextQuarterlyTimePeriod(currentTimePeriod);

        case 6:  // Semiannually
          return this.getNextSemiannualTimePeriod(currentTimePeriod);

        case 7: // Annual
          return this.getNextAnnualTimePeriod(currentTimePeriod);

        case 8: // Biennial
          return this.getNextBiennialTimePeriod(currentTimePeriod);

        default:

          // The target context time step specification is unsupported
          this.log.warn(`${LOG_PREFIX} The target context time step specification is unsupported`);

          // Return null
          this.log.warn(`${LOG_PREFIX} Returning null`);
          return null;

      }

    } else {

      // The target context time step specification has not been provided
      this.log.warn(`${LOG_PREFIX} The target context time step specification has not been provided`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Returning null`);
      return null;
    }
  }

  /**
   * Gets a time period that precedes the current time period and is aligned with the context settings
   * @returns The time period
   */
  public getPreviousTimePeriod(currentTimePeriod: TimePeriod, targetContext: Context): TimePeriod | null {

    this.log.trace(`${LOG_PREFIX} Entering getPreviousTimePeriod()`);

    // Check if the target context time step specification has been provided
    this.log.trace(`${LOG_PREFIX} Checking if the target context time step specification has been provided`);
    if (targetContext.data?.timestep?.id) {

      // The target context time step specification has been provided
      this.log.trace(`${LOG_PREFIX} The target context time step specification has been provided`);

      switch (targetContext.data.timestep.id) {

        case 1:  // Daily
          return this.getPreviousDailyTimePeriod(currentTimePeriod);

        case 2:  // Weekly
          return this.getPreviousWeeklyTimePeriod(currentTimePeriod);

        case 3:  // Biweekly
          return this.getPreviousBiweeklyTimePeriod(currentTimePeriod);

        case 4:  // Monthly
          return this.getPreviousMonthlyTimePeriod(currentTimePeriod);

        case 5:  // Quarterly
          return this.getPreviousQuarterlyTimePeriod(currentTimePeriod);

        case 6:  // Semiannually
          return this.getPreviousSemiannualTimePeriod(currentTimePeriod);

        case 7: // Annual
          return this.getPreviousAnnualTimePeriod(currentTimePeriod);

        case 8: // Biennial
          return this.getPreviousBiennialTimePeriod(currentTimePeriod);

        default:

          // The target context time step specification is unsupported
          this.log.warn(`${LOG_PREFIX} The target context time step specification is unsupported`);

          // Return null
          this.log.warn(`${LOG_PREFIX} Returning null`);
          return null;

      }

    } else {

      // The target context time step specification has not been provided
      this.log.warn(`${LOG_PREFIX} The target context time step specification has not been provided`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Returning null`);
      return null;
    }
  }



  /**
   * Gets a time period that follows the current time period and spans a day
   * @returns The time period
   */
  private getNextDailyTimePeriod(currentTimePeriod: TimePeriod): TimePeriod | null {

    this.log.trace(`${LOG_PREFIX} Entering getNextDailyTimePeriod()`);

    // Check if the last day of the prevailing time period has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the last day of the prevailing time period has been specified`);
    if (currentTimePeriod && currentTimePeriod.data.end) {

      // The last day of the prevailing time period has been specified
      this.log.trace(`${LOG_PREFIX} The last day of the prevailing time period has been specified`);

      // Get the first and last day of the incoming period
      this.log.trace(`${LOG_PREFIX} Getting the first and last day of the incoming period`);
      const nextDay: moment.Moment = moment(currentTimePeriod.data.end, "YYYY-MM-DD").add(1, 'days');

      // Construct and return the incoming period bean
      this.log.trace(`${LOG_PREFIX} Constructing and returning the incoming period bean`);
      return new TimePeriod({
        id: null,
        data: {
          contextId: currentTimePeriod.data.contextId,
          typeId: 1, // Daily
          start: nextDay.format(),
          end: nextDay.format(),
          open: true
        },
        version: null
      });

    } else {

      // The last day of the prevailing time period has been specified
      this.log.warn(`${LOG_PREFIX} The last day of the prevailing time period has been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Returning null`);
      return null;
    }
  }

  /**
   * Gets a time period that precedes the current time period and spans a day
   * @returns The time period
   */
  private getPreviousDailyTimePeriod(currentTimePeriod: TimePeriod): TimePeriod | null {

    this.log.trace(`${LOG_PREFIX} Entering getPreviousDailyTimePeriod()`);

    // Check if the first day of the prevailing time period has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the first day of the prevailing time period has been specified`);
    if (currentTimePeriod && currentTimePeriod.data.start) {

      // The first day of the prevailing time period has been specified
      this.log.trace(`${LOG_PREFIX} The first day of the prevailing time period has been specified`);

      // Get the first and last day of the incoming period
      this.log.trace(`${LOG_PREFIX} Getting the first and last day of the incoming period`);
      const previousDay: moment.Moment = moment(currentTimePeriod.data.start, "YYYY-MM-DD").subtract(1, 'days');

      // Construct and return the incoming period bean
      this.log.trace(`${LOG_PREFIX} Constructing and returning the incoming period bean`);
      return new TimePeriod({
        id: null,
        data: {
          contextId: currentTimePeriod.data.contextId,
          typeId: 1, // Daily
          start: previousDay.format(),
          end: previousDay.format(),
          open: true
        },
        version: null
      });

    } else {

      // The first day of the prevailing time period has not been specified
      this.log.warn(`${LOG_PREFIX} The first day of the prevailing time period has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Returning null`);
      return null;
    }
  }


  /**
   * Gets a time period that follows the current time period and spans a week
   * @returns The time period
   */
  private getNextWeeklyTimePeriod(currentTimePeriod: TimePeriod): TimePeriod | null {

    this.log.trace(`${LOG_PREFIX} Entering getNextWeeklyTimePeriod()`);

    // Check if the last day of the prevailing time period has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the last day of the prevailing time period has been specified`);
    if (currentTimePeriod && currentTimePeriod.data.end) {

      // The last day of the prevailing time period has been specified
      this.log.trace(`${LOG_PREFIX} The last day of the prevailing time period has been specified`);

      // Get the first day of the incoming period
      this.log.trace(`${LOG_PREFIX} Getting the first day of the incoming period`);
      const incomingPeriodFirstDay: moment.Moment = moment(currentTimePeriod.data.end, "YYYY-MM-DD").add(1, 'days');

      // Get the last day of the incoming period
      this.log.trace(`${LOG_PREFIX} Getting the last day of the incoming period`);
      let incomingPeriodLastDay: moment.Moment;

      incomingPeriodLastDay = (incomingPeriodFirstDay.clone().add('1', 'week')).subtract('1', 'day');

      // Construct and return the incoming period bean
      this.log.trace(`${LOG_PREFIX} Constructing and returning the incoming period bean`);
      return new TimePeriod({
        id: null,
        data: {
          contextId: currentTimePeriod.data.contextId,
          typeId: 2, // Weekly
          start: incomingPeriodFirstDay.format(),
          end: incomingPeriodLastDay.format(),
          open: true
        },
        version: null
      });

    } else {

      // The last day of the prevailing time period has been specified
      this.log.warn(`${LOG_PREFIX} The last day of the prevailing time period has been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Returning null`);
      return null;
    }
  }


  /**
   * Gets a time period that precedes the current time period and spans a week
   * @returns The time period
   */
  private getPreviousWeeklyTimePeriod(currentTimePeriod: TimePeriod): TimePeriod | null {

    this.log.trace(`${LOG_PREFIX} Entering getPreviousWeeklyTimePeriod()`);

    // Check if the start day of the prevailing time period has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the start day of the prevailing time period has been specified`);
    if (currentTimePeriod && currentTimePeriod.data.start) {

      // The start day of the prevailing time period has been specified
      this.log.trace(`${LOG_PREFIX} The start day of the prevailing time period has been specified`);

      // Get the last day of the outgoing period
      this.log.trace(`${LOG_PREFIX} Getting the last day of the outgoing period`);
      const outgoingPeriodLastDay: moment.Moment = moment(currentTimePeriod.data.start, "YYYY-MM-DD").subtract(1, 'days');

      // Get the first day of the outgoing period
      this.log.trace(`${LOG_PREFIX} Getting the first day of the outgoing period`);
      let outgoingPeriodFirstDay: moment.Moment;

      outgoingPeriodFirstDay = (outgoingPeriodLastDay.clone().subtract('1', 'week')).add('1', 'day');

      // Construct and return the outgoing period bean
      this.log.trace(`${LOG_PREFIX} Constructing and returning the outgoing period bean`);
      return new TimePeriod({
        id: null,
        data: {
          contextId: currentTimePeriod.data.contextId,
          typeId: 2, // Weekly
          start: outgoingPeriodFirstDay.format(),
          end: outgoingPeriodLastDay.format(),
          open: true
        },
        version: null
      });

    } else {

      // The start day of the prevailing time period has not been specified
      this.log.warn(`${LOG_PREFIX} The start day of the prevailing time period has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Returning null`);
      return null;
    }
  }

  /**
   * Gets a time period that follows the current time period and spans 3 months
   * @returns The time period
   */
  private getNextBiweeklyTimePeriod(currentTimePeriod: TimePeriod): TimePeriod | null {

    this.log.trace(`${LOG_PREFIX} Entering getNextBiweeklyTimePeriod()`);

    // Check if the last day of the prevailing time period has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the last day of the prevailing time period has been specified`);
    if (currentTimePeriod && currentTimePeriod.data.end) {

      // The last day of the prevailing time period has been specified
      this.log.trace(`${LOG_PREFIX} The last day of the prevailing time period has been specified`);

      // Get the first day of the incoming period
      this.log.trace(`${LOG_PREFIX} Getting the first day of the incoming period`);
      const incomingPeriodFirstDay: moment.Moment = moment(currentTimePeriod.data.end, "YYYY-MM-DD").add(1, 'days');

      // Get the last day of the incoming period
      this.log.trace(`${LOG_PREFIX} Getting the last day of the incoming period`);
      let incomingPeriodLastDay: moment.Moment;

      incomingPeriodLastDay = (incomingPeriodFirstDay.clone().add('2', 'weeks')).subtract('1', 'day');

      // Construct and return the incoming period bean
      this.log.trace(`${LOG_PREFIX} Constructing and returning the incoming period bean`);
      return new TimePeriod({
        id: null,
        data: {
          contextId: currentTimePeriod.data.contextId,
          typeId: 3, // Biweekly
          start: incomingPeriodFirstDay.format(),
          end: incomingPeriodLastDay.format(),
          open: true
        },
        version: null
      });

    } else {

      // The last day of the prevailing time period has been specified
      this.log.warn(`${LOG_PREFIX} The last day of the prevailing time period has been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Returning null`);
      return null;
    }
  }

  /**
   * Gets a time period that precedes the current time period and spans 3 months
   * @returns The time period
   */
  private getPreviousBiweeklyTimePeriod(currentTimePeriod: TimePeriod): TimePeriod | null {

    this.log.trace(`${LOG_PREFIX} Entering getPreviousBiweeklyTimePeriod()`);

    // Check if the start day of the prevailing time period has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the start day of the prevailing time period has been specified`);
    if (currentTimePeriod && currentTimePeriod.data.start) {

      // The start day of the prevailing time period has been specified
      this.log.trace(`${LOG_PREFIX} The start day of the prevailing time period has been specified`);

      // Get the last day of the outgoing period
      this.log.trace(`${LOG_PREFIX} Getting the last day of the outgoing period`);
      const outgoingPeriodLastDay: moment.Moment = moment(currentTimePeriod.data.start, "YYYY-MM-DD").subtract(1, 'days');

      // Get the first day of the outgoing period
      this.log.trace(`${LOG_PREFIX} Getting the first day of the outgoing period`);
      let outgoingPeriodFirstDay: moment.Moment;

      outgoingPeriodFirstDay = (outgoingPeriodLastDay.clone().subtract('2', 'weeks')).add('1', 'day');

      // Construct and return the outgoing period bean
      this.log.trace(`${LOG_PREFIX} Constructing and returning the outgoing period bean`);
      return new TimePeriod({
        id: null,
        data: {
          contextId: currentTimePeriod.data.contextId,
          typeId: 3, // Biweekly
          start: outgoingPeriodFirstDay.format(),
          end: outgoingPeriodLastDay.format(),
          open: true
        },
        version: null
      });

    } else {

      // The start day of the prevailing time period has not been specified
      this.log.warn(`${LOG_PREFIX} The start day of the prevailing time period has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Returning null`);
      return null;
    }
  }

  /**
   * Gets a time period that follows the current time period and spans a month
   * @returns The time period
   */
  private getNextMonthlyTimePeriod(currentTimePeriod: TimePeriod): TimePeriod | null {

    this.log.trace(`${LOG_PREFIX} Entering getNextMonthlyTimePeriod()`);

    // Check if the last day of the prevailing time period has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the last day of the prevailing time period has been specified`);
    if (currentTimePeriod && currentTimePeriod.data.end) {

      // The last day of the prevailing time period has been specified
      this.log.trace(`${LOG_PREFIX} The last day of the prevailing time period has been specified`);

      // Get the first day of the incoming period
      this.log.trace(`${LOG_PREFIX} Getting the first day of the incoming period`);
      const incomingPeriodFirstDay: moment.Moment = moment(currentTimePeriod.data.end, "YYYY-MM-DD").add(1, 'days');

      // Get the last day of the incoming period
      this.log.trace(`${LOG_PREFIX} Getting the last day of the incoming period`);
      let incomingPeriodLastDay: moment.Moment;

      incomingPeriodLastDay = (incomingPeriodFirstDay.clone().add('1', 'month')).subtract('1', 'day');

      // Construct and return the incoming period bean
      this.log.trace(`${LOG_PREFIX} Constructing and returning the incoming period bean`);
      return new TimePeriod({
        id: null,
        data: {
          contextId: currentTimePeriod.data.contextId,
          typeId: 4, // Monthly
          start: incomingPeriodFirstDay.format(),
          end: incomingPeriodLastDay.format(),
          open: true
        },
        version: null
      });

    } else {

      // The last day of the prevailing time period has been specified
      this.log.warn(`${LOG_PREFIX} The last day of the prevailing time period has been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Returning null`);
      return null;
    }
  }

  /**
   * Gets a time period that precedes the current time period and spans a month
   * @returns The time period
   */
  private getPreviousMonthlyTimePeriod(currentTimePeriod: TimePeriod): TimePeriod | null {

    this.log.trace(`${LOG_PREFIX} Entering getPreviousMonthlyTimePeriod()`);

    // Check if the start day of the prevailing time period has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the start day of the prevailing time period has been specified`);
    if (currentTimePeriod && currentTimePeriod.data.start) {

      // The start day of the prevailing time period has been specified
      this.log.trace(`${LOG_PREFIX} The start day of the prevailing time period has been specified`);

      // Get the last day of the outgoing period
      this.log.trace(`${LOG_PREFIX} Getting the last day of the outgoing period`);
      const outgoingPeriodLastDay: moment.Moment = moment(currentTimePeriod.data.start, "YYYY-MM-DD").subtract(1, 'days');

      // Get the first day of the outgoing period
      this.log.trace(`${LOG_PREFIX} Getting the first day of the outgoing period`);
      let outgoingPeriodFirstDay: moment.Moment;

      outgoingPeriodFirstDay = (outgoingPeriodLastDay.clone().subtract('1', 'month')).add('1', 'day');

      // Construct and return the outgoing period bean
      this.log.trace(`${LOG_PREFIX} Constructing and returning the outgoing period bean`);
      return new TimePeriod({
        id: null,
        data: {
          contextId: currentTimePeriod.data.contextId,
          typeId: 4, // Monthly
          start: outgoingPeriodFirstDay.format(),
          end: outgoingPeriodLastDay.format(),
          open: true
        },
        version: null
      });

    } else {

      // The start day of the prevailing time period has not been specified
      this.log.warn(`${LOG_PREFIX} The start day of the prevailing time period has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Returning null`);
      return null;
    }
  }


  /**
   * Gets a time period that follows the current time period and spans 3 months
   * @returns The time period
   */
  private getNextQuarterlyTimePeriod(currentTimePeriod: TimePeriod): TimePeriod | null {

    this.log.trace(`${LOG_PREFIX} Entering getNextQuarterlyTimePeriod()`);

    // Check if the last day of the prevailing time period has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the last day of the prevailing time period has been specified`);
    if (currentTimePeriod && currentTimePeriod.data.end) {

      // The last day of the prevailing time period has been specified
      this.log.trace(`${LOG_PREFIX} The last day of the prevailing time period has been specified`);

      // Get the first day of the incoming period
      this.log.trace(`${LOG_PREFIX} Getting the first day of the incoming period`);
      const incomingPeriodFirstDay: moment.Moment = moment(currentTimePeriod.data.end, "YYYY-MM-DD").add(1, 'days');

      // Get the last day of the incoming period
      this.log.trace(`${LOG_PREFIX} Getting the last day of the incoming period`);
      let incomingPeriodLastDay: moment.Moment;

      incomingPeriodLastDay = (incomingPeriodFirstDay.clone().add('3', 'months')).subtract('1', 'day');

      // Construct and return the incoming period bean
      this.log.trace(`${LOG_PREFIX} Constructing and returning the incoming period bean`);
      return new TimePeriod({
        id: null,
        data: {
          contextId: currentTimePeriod.data.contextId,
          typeId: 5, // Quarterly
          start: incomingPeriodFirstDay.format(),
          end: incomingPeriodLastDay.format(),
          open: true
        },
        version: null
      });

    } else {

      // The last day of the prevailing time period has been specified
      this.log.warn(`${LOG_PREFIX} The last day of the prevailing time period has been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Returning null`);
      return null;
    }
  }


  /**
   * Gets a time period that precedes the current time period and spans 3 months
   * @returns The time period
   */
  private getPreviousQuarterlyTimePeriod(currentTimePeriod: TimePeriod): TimePeriod | null {

    this.log.trace(`${LOG_PREFIX} Entering getPreviousQuarterlyTimePeriod()`);

    // Check if the start day of the prevailing time period has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the start day of the prevailing time period has been specified`);
    if (currentTimePeriod && currentTimePeriod.data.start) {

      // The start day of the prevailing time period has been specified
      this.log.trace(`${LOG_PREFIX} The start day of the prevailing time period has been specified`);

      // Get the last day of the outgoing period
      this.log.trace(`${LOG_PREFIX} Getting the last day of the outgoing period`);
      const outgoingPeriodLastDay: moment.Moment = moment(currentTimePeriod.data.start, "YYYY-MM-DD").subtract(1, 'days');

      // Get the first day of the outgoing period
      this.log.trace(`${LOG_PREFIX} Getting the first day of the outgoing period`);
      let outgoingPeriodFirstDay: moment.Moment;

      outgoingPeriodFirstDay = (outgoingPeriodLastDay.clone().subtract('3', 'months')).add('1', 'day');

      // Construct and return the outgoing period bean
      this.log.trace(`${LOG_PREFIX} Constructing and returning the outgoing period bean`);
      return new TimePeriod({
        id: null,
        data: {
          contextId: currentTimePeriod.data.contextId,
          typeId: 5, // Quarterly
          start: outgoingPeriodFirstDay.format(),
          end: outgoingPeriodLastDay.format(),
          open: true
        },
        version: null
      });

    } else {

      // The start day of the prevailing time period has not been specified
      this.log.warn(`${LOG_PREFIX} The start day of the prevailing time period has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Returning null`);
      return null;
    }
  }



  /**
   * Gets a time period that follows the current time period and spans 6 months
   * @returns The time period
   */
  private getNextSemiannualTimePeriod(currentTimePeriod: TimePeriod): TimePeriod | null {

    this.log.trace(`${LOG_PREFIX} Entering getNextSemiannualTimePeriod()`);

    // Check if the last day of the prevailing time period has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the last day of the prevailing time period has been specified`);
    if (currentTimePeriod && currentTimePeriod.data.end) {

      // The last day of the prevailing time period has been specified
      this.log.trace(`${LOG_PREFIX} The last day of the prevailing time period has been specified`);

      // Get the first day of the incoming period
      this.log.trace(`${LOG_PREFIX} Getting the first day of the incoming period`);
      const incomingPeriodFirstDay: moment.Moment = moment(currentTimePeriod.data.end, "YYYY-MM-DD").add(1, 'days');

      // Get the last day of the incoming period
      this.log.trace(`${LOG_PREFIX} Getting the last day of the incoming period`);
      let incomingPeriodLastDay: moment.Moment;

      incomingPeriodLastDay = (incomingPeriodFirstDay.clone().add('6', 'months')).subtract('1', 'day');

      // Construct and return the incoming period bean
      this.log.trace(`${LOG_PREFIX} Constructing and returning the incoming period bean`);
      return new TimePeriod({
        id: null,
        data: {
          contextId: currentTimePeriod.data.contextId,
          typeId: 6, // Semiannually
          start: incomingPeriodFirstDay.format(),
          end: incomingPeriodLastDay.format(),
          open: true
        },
        version: null
      });

    } else {

      // The last day of the prevailing time period has been specified
      this.log.warn(`${LOG_PREFIX} The last day of the prevailing time period has been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Returning null`);
      return null;
    }
  }

  /**
 * Gets a time period that precedes the current time period and spans 6 months
 * @returns The time period
 */
  private getPreviousSemiannualTimePeriod(currentTimePeriod: TimePeriod): TimePeriod | null {

    this.log.trace(`${LOG_PREFIX} Entering getPreviousSemiannualTimePeriod()`);

    // Check if the first day of the prevailing time period has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the first day of the prevailing time period has been specified`);
    if (currentTimePeriod && currentTimePeriod.data.start) {

      // The first day of the prevailing time period has been specified
      this.log.trace(`${LOG_PREFIX} The first day of the prevailing time period has been specified`);

      // Get the last day of the previous period
      this.log.trace(`${LOG_PREFIX} Getting the last day of the previous period`);
      const previousPeriodLastDay: moment.Moment = moment(currentTimePeriod.data.start, "YYYY-MM-DD").subtract(1, 'days');

      // Get the first day of the previous period
      this.log.trace(`${LOG_PREFIX} Getting the first day of the previous period`);
      let previousPeriodFirstDay: moment.Moment;

      if (currentTimePeriod.data.typeId == 6) { // Semiannually
        previousPeriodFirstDay = (previousPeriodLastDay.clone().subtract('6', 'months')).add('1', 'day');
      } else {
        previousPeriodFirstDay = ((previousPeriodLastDay.clone().startOf('month')).subtract('5', 'months'));
      }

      // Construct and return the previous period bean
      this.log.trace(`${LOG_PREFIX} Constructing and returning the previous period bean`);
      return new TimePeriod({
        id: null,
        data: {
          contextId: currentTimePeriod.data.contextId,
          typeId: 6, // Semiannually
          start: previousPeriodFirstDay.format(),
          end: previousPeriodLastDay.format(),
          open: true
        },
        version: null
      });

    } else {

      // The first day of the prevailing time period has not been specified
      this.log.warn(`${LOG_PREFIX} The first day of the prevailing time period has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Returning null`);
      return null;
    }
  }


  /**
   * Gets a time period that follows the current time period and spans 12 months
   * @returns The time period
   */
  private getNextAnnualTimePeriod(currentTimePeriod: TimePeriod): TimePeriod | null {

    this.log.trace(`${LOG_PREFIX} Entering getNextAnnualTimePeriod()`);

    // Check if the last day of the prevailing time period has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the last day of the prevailing time period has been specified`);
    if (currentTimePeriod && currentTimePeriod.data.end) {

      // The last day of the prevailing time period has been specified
      this.log.trace(`${LOG_PREFIX} The last day of the prevailing time period has been specified`);

      // Get the first day of the incoming period
      this.log.trace(`${LOG_PREFIX} Getting the first day of the incoming period`);
      const incomingPeriodFirstDay: moment.Moment = moment(currentTimePeriod.data.end, "YYYY-MM-DD").add(1, 'days');

      // Get the last day of the incoming period
      this.log.trace(`${LOG_PREFIX} Getting the last day of the incoming period`);
      let incomingPeriodLastDay: moment.Moment;

      incomingPeriodLastDay = (incomingPeriodFirstDay.clone().add('12', 'months')).subtract('1', 'day');

      // Construct and return the incoming period bean
      this.log.trace(`${LOG_PREFIX} Constructing and returning the incoming period bean`);
      return new TimePeriod({
        id: null,
        data: {
          contextId: currentTimePeriod.data.contextId,
          typeId: 7, // Annually
          start: incomingPeriodFirstDay.format(),
          end: incomingPeriodLastDay.format(),
          open: true
        },
        version: null
      });

    } else {

      // The last day of the prevailing time period has been specified
      this.log.warn(`${LOG_PREFIX} The last day of the prevailing time period has been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Returning null`);
      return null;
    }
  }

  /**
   * Gets a time period that precedes the current time period and spans 12 months
   * @returns The time period
   */
  private getPreviousAnnualTimePeriod(currentTimePeriod: TimePeriod): TimePeriod | null {

    this.log.trace(`${LOG_PREFIX} Entering getPreviousAnnualTimePeriod()`);

    // Check if the first day of the prevailing time period has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the first day of the prevailing time period has been specified`);
    if (currentTimePeriod && currentTimePeriod.data.start) {

      // The first day of the prevailing time period has been specified
      this.log.trace(`${LOG_PREFIX} The first day of the prevailing time period has been specified`);

      // Get the last day of the previous period
      this.log.trace(`${LOG_PREFIX} Getting the last day of the previous period`);
      const previousPeriodLastDay: moment.Moment = moment(currentTimePeriod.data.start, "YYYY-MM-DD").subtract(1, 'days');

      // Get the first day of the previous period
      this.log.trace(`${LOG_PREFIX} Getting the first day of the previous period`);
      let previousPeriodFirstDay: moment.Moment;

      previousPeriodFirstDay = (previousPeriodLastDay.clone().subtract('12', 'months')).add('1', 'day');

      // Construct and return the previous period bean
      this.log.trace(`${LOG_PREFIX} Constructing and returning the previous period bean`);
      return new TimePeriod({
        id: null,
        data: {
          contextId: currentTimePeriod.data.contextId,
          typeId: 7, // Annually
          start: previousPeriodFirstDay.format(),
          end: previousPeriodLastDay.format(),
          open: true
        },
        version: null
      });

    } else {

      // The first day of the prevailing time period has not been specified
      this.log.warn(`${LOG_PREFIX} The first day of the prevailing time period has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Returning null`);
      return null;
    }
  }



  /**
   * Gets a time period that follows the current time period and spans 24 months
   * @returns The time period
   */
  private getNextBiennialTimePeriod(currentTimePeriod: TimePeriod): TimePeriod | null {

    this.log.trace(`${LOG_PREFIX} Entering getNextBiennialTimePeriod()`);

    // Check if the last day of the prevailing time period has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the last day of the prevailing time period has been specified`);
    if (currentTimePeriod && currentTimePeriod.data.end) {

      // The last day of the prevailing time period has been specified
      this.log.trace(`${LOG_PREFIX} The last day of the prevailing time period has been specified`);

      // Get the first day of the incoming period
      this.log.trace(`${LOG_PREFIX} Getting the first day of the incoming period`);
      const incomingPeriodFirstDay: moment.Moment = moment(currentTimePeriod.data.end, "YYYY-MM-DD").add(1, 'days');

      // Get the last day of the incoming period
      this.log.trace(`${LOG_PREFIX} Getting the last day of the incoming period`);
      let incomingPeriodLastDay: moment.Moment;

      incomingPeriodLastDay = (incomingPeriodFirstDay.clone().add('24', 'months')).subtract('1', 'day');

      // Construct and return the incoming period bean
      this.log.trace(`${LOG_PREFIX} Constructing and returning the incoming period bean`);
      return new TimePeriod({
        id: null,
        data: {
          contextId: currentTimePeriod.data.contextId,
          typeId: 8, // Biennially
          start: incomingPeriodFirstDay.format(),
          end: incomingPeriodLastDay.format(),
          open: true
        },
        version: null
      });

    } else {

      // The last day of the prevailing time period has been specified
      this.log.warn(`${LOG_PREFIX} The last day of the prevailing time period has been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Returning null`);
      return null;
    }
  }


  /**
   * Gets a time period that precedes the current time period and spans 24 months
   * @returns The time period
   */
  private getPreviousBiennialTimePeriod(currentTimePeriod: TimePeriod): TimePeriod | null {

    this.log.trace(`${LOG_PREFIX} Entering getPreviousBiennialTimePeriod()`);

    // Check if the start day of the prevailing time period has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the start day of the prevailing time period has been specified`);
    if (currentTimePeriod && currentTimePeriod.data.start) {

      // The start day of the prevailing time period has been specified
      this.log.trace(`${LOG_PREFIX} The start day of the prevailing time period has been specified`);

      // Get the last day of the incoming period
      this.log.trace(`${LOG_PREFIX} Getting the last day of the incoming period`);
      const incomingPeriodLastDay: moment.Moment = moment(currentTimePeriod.data.start, "YYYY-MM-DD").subtract(1, 'days');

      // Get the first day of the incoming period
      this.log.trace(`${LOG_PREFIX} Getting the first day of the incoming period`);
      let incomingPeriodFirstDay: moment.Moment;

      incomingPeriodFirstDay = (incomingPeriodLastDay.clone().subtract('24', 'months')).add('1', 'day');

      // Construct and return the incoming period bean
      this.log.trace(`${LOG_PREFIX} Constructing and returning the incoming period bean`);
      return new TimePeriod({
        id: null,
        data: {
          contextId: currentTimePeriod.data.contextId,
          typeId: 8, // Biennially
          start: incomingPeriodFirstDay.format(),
          end: incomingPeriodLastDay.format(),
          open: true
        },
        version: null
      });

    } else {

      // The start day of the prevailing time period has not been specified
      this.log.warn(`${LOG_PREFIX} The start day of the prevailing time period has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Returning null`);
      return null;
    }
  }


}
