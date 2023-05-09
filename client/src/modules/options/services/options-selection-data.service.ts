import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { NGXLogger } from 'ngx-logger';
import { Option } from '../models/option.model';
import { environment } from 'environments/environment';
import { catchError, first, map, tap } from 'rxjs/operators';
import { OptionState } from '../models/option-state.model';

const LOG_PREFIX: string = "[Options Selection Data Service]";
const HEADERS = { 'Content-Type': 'application/json' };

@Injectable({
  providedIn: 'root'
})
export class OptionsSelectionDataService {

  // Keeps tabs of the default url string
  private url: string = environment.production ?
    `${environment.urls.api}/api/v1/options` :
    `${environment.urls.api}/options`;

  // Keeps tabs of the user defined search or sort criteria.
  private state: OptionState = {
    page: 1,
    pageSize: 20,
    searchTerm: null,
    sortColumn: 'name',
    sortDirection: 'asc',
    ids: null,
    typeId: null,
    name: null
  };

  // Keeps tabs of the options
  private optionsSubject$ = new BehaviorSubject<Option[]>([]);
  readonly options$ = this.optionsSubject$.asObservable();

  // Keeps tabs of the total options (irregardless of pagination)
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
   * Asynchronously retrieves the options associated with given unique identifiers
   * @param optionsIds The options unique ids
   * @returns An Observable that emits an array of Option objects
   */
  public getOptions$(optionsIds: number[] | null | undefined): Observable<Option[]> {

    this.log.trace(`${LOG_PREFIX} Entering getOptions()`);
    this.log.debug(`${LOG_PREFIX} Option Ids = ${JSON.stringify(optionsIds)}`);

    if (optionsIds && optionsIds.length > 0) {

      this.log.trace(`${LOG_PREFIX} The Option Ids were specified`);

      return this.getOptions(true, {
        searchTerm: null,
        page: null,
        pageSize: null,
        sortColumn: 'id',
        sortDirection: 'asc',
        ids: null,
        typeId: null,
        name: null
      }).pipe(
        first(),
        map((options: Option[]) => {
          return options.filter(o => o.id && optionsIds.includes(o.id));
        }),
        tap((options: Option[]) => {
          this.log.trace(`${LOG_PREFIX} Returning ${JSON.stringify(options)}`);
        })
      );
    } else {

      this.log.trace(`${LOG_PREFIX} The Option Ids were not specified`);

      return of([]);
    }
  }



  /**
   * Retrieves Options Records from the local cache or database
   * 
   * @param cache Whether the results should be locally cached if freshly retrieved from the database
   * @param state The desired records state
   * @returns The Options Records
   */
  public getOptions(cache: boolean, state: OptionState): Observable<Option[]> {

    this.log.trace(`${LOG_PREFIX} Entering getOptions()`);

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

        if (this.optionsSubject$.value.length > 0) {

          // The desired data is already available in the local cache
          this.log.trace(`${LOG_PREFIX} The desired data is already available in the local cache`);

          // Return the locally cached data
          this.log.trace(`${LOG_PREFIX} Returning the locally cached data`);

          return of(this.optionsSubject$.value);

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

      if (this.optionsSubject$.value.length > 0) {

        // The desired data is already available in the local cache
        this.log.trace(`${LOG_PREFIX} The desired data is already available in the local cache`);

        // Return the locally cached data
        this.log.trace(`${LOG_PREFIX} Returning the locally cached data`);

        return of(this.optionsSubject$.value);

      }

    }


    // Get a fresh set of Options Records from the backend
    this.log.trace(`${LOG_PREFIX} Getting a fresh set of Options Records from the backend`);
    return this.getFreshOptions(cache, state);

  }


  /**
   * Retrieves a fresh set of Options Records from the backend
   * 
   * @param cache Whether the results should be locally cached if freshly retrieved from the database
   * @param state The desired records state
   * @returns The Options Records
   */
  private getFreshOptions(cache: boolean, state: OptionState): Observable<Option[]> {

    this.log.trace(`${LOG_PREFIX} Entering getFreshOptions()`);

    // Set the loading status to true
    this.log.trace(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Make a HTTP GET Request to retrieve the records
    this.log.debug(`${LOG_PREFIX} Making a HTTP GET Request to ${this.url} to retrieve the fresh set of records`);
    return this.http.get<Option[]>(`${this.url}`, { headers: new HttpHeaders(HEADERS), params: this.getQueryParams(state), observe: 'response' })
      .pipe(

        map((res: HttpResponse<any>) => {

          // Options Records Retrieval was successful
          this.log.trace(`${LOG_PREFIX} Options Records Retrieval was successful`);
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
            this.optionsSubject$.next(res.body);

          } else {

            // The results should not be locally cached
            this.log.trace(`${LOG_PREFIX} The results should not be locally cached`);

          }

          return res.body;

        }),

        catchError((error: any) => {

          // Options Records Retrieval was unsuccessful
          this.log.error(`${LOG_PREFIX} Options Records Retrieval was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

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
  public get records(): Option[] {
    return this.optionsSubject$.value;
  }

  /**
   * Collates query parameters that correspond to the currently set required records state
   * @state The target state
   * @returns The query parameters
   */
  private getQueryParams(state: OptionState): HttpParams {

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
      environment.production ? params = params.append("_sort", state.sortColumn) : params = (state.sortColumn == "id" ? params.append("_sort", "id") : params.append("_sort", "data. " + state.sortColumn));
    }

    if (state.sortDirection) {
      this.log.trace(`${LOG_PREFIX} Adding sort direction parameter`);
      params = params.append("_order", state.sortDirection);
    }

    return params;
  }

}
