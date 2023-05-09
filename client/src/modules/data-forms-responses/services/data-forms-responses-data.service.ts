import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { NGXLogger } from 'ngx-logger';
import { DataFormResponse } from '../models/data-form-response.model';
import { environment } from 'environments/environment';
import { catchError, map, tap } from 'rxjs/operators';
import { DataFormResponseState } from '../models/data-form-response-state.model';

const LOG_PREFIX: string = "[Data Forms Responses Data Service]";
const HEADERS = { 'Content-Type': 'application/json' };

@Injectable({
  providedIn: 'root'
})
export class DataFormsResponsesDataService {

  // Keeps tabs of the default url string
  private url: string = environment.production ?
    `${environment.urls.api}/api/v1/data_forms_responses` :
    `${environment.urls.api}/data_forms_responses`;

  // Keeps tabs of the user defined search or sort criteria.
  private state: DataFormResponseState = {
    searchTerm: null,
    page: 1,
    pageSize: 20,
    sortColumn: 'id',
    sortDirection: 'asc',
    timePeriodId: null,
    formId: null,
    locationId: null,
    organisationId: null,
    entityId: null,
    respondentTypeId: null,
    respondentId: null,
    respondentName: null,
    statusIds: null
  };

  // Keeps tabs of the dataFormsResponses
  private dataFormsResponsesSubject$ = new BehaviorSubject<DataFormResponse[]>([]);
  readonly dataFormsResponses$ = this.dataFormsResponsesSubject$.asObservable();

  // Keeps tabs of the total dataFormsResponses (irregardless of pagination)
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
   * Creates a new Data Form Response Record
   * 
   * @param dataFormResponse the details of the Data Form Response Record to be created
   * @returns the newly created Data Form Response Record
   */
  public createDataFormResponse(dataFormResponse: DataFormResponse): Observable<DataFormResponse> {

    this.log.trace(`${LOG_PREFIX} Entering createDataFormResponse()`);
    this.log.debug(`${LOG_PREFIX} Data Form Response = ${JSON.stringify(dataFormResponse)}`);

    // Set the loading status to true
    this.log.debug(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Make a HTTP POST Request to create the record
    this.log.debug(`${LOG_PREFIX} Making a HTTP POST Request to ${this.url} to create the record`);
    return this.http.post<DataFormResponse>(`${this.url}`, JSON.stringify(dataFormResponse), { headers: new HttpHeaders(HEADERS) })
      .pipe(

        tap((data: DataFormResponse) => {

          // Data Form Response Record Creation was successful
          this.log.trace(`${LOG_PREFIX} Record Creation was successful`);
          this.log.debug(`${LOG_PREFIX} Created Record = ${JSON.stringify(data)}`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          // Refresh the records / record count
          this.log.trace(`${LOG_PREFIX} Refreshing the records / record count`);
          this.getFreshDataFormsResponses(true, this.state).subscribe();

        }),

        catchError((error: any) => {

          // Data Form Response Record Creation was unsuccessful
          this.log.error(`${LOG_PREFIX} Data Form Response Record Creation was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);

        }));
  }


  public createDataFormResponses(dataFormResponses: DataFormResponse[]): Observable<DataFormResponse[]> {
    
    this.log.trace(`${LOG_PREFIX} Entering createDataFormResponses()`);
    this.log.debug(`${LOG_PREFIX} Data Form Responses = ${JSON.stringify(dataFormResponses)}`);

    // Set the loading status to true
    this.log.debug(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Make a HTTP POST Request to create the records
    this.log.debug(`${LOG_PREFIX} Making a HTTP POST Request to ${this.url}/all to create the records`);
    return this.http.post<DataFormResponse[]>(`${this.url}/all`, JSON.stringify(dataFormResponses), { headers: new HttpHeaders(HEADERS) })
      .pipe(

        tap((data: DataFormResponse[]) => {

          // Data Form Response Records Creation was successful
          this.log.trace(`${LOG_PREFIX} Records Creation was successful`);
          this.log.debug(`${LOG_PREFIX} Created Records = ${JSON.stringify(data)}`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          // Refresh the records / record count
          this.log.trace(`${LOG_PREFIX} Refreshing the records / record count`);
          this.getFreshDataFormsResponses(true, this.state).subscribe();

        }),

        catchError((error: any) => {

          // Data Form Response Records Creation was unsuccessful
          this.log.error(`${LOG_PREFIX} Data Form Response Records Creation was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);

        }));
  }



  /**
   * Retrieves Data Forms Responses Records from the local cache or database
   * 
   * @param cache Whether the results should be locally cached if freshly retrieved from the database
   * @param state The desired records state
   * @returns The Data Forms Responses Records
   */
  public getDataFormsResponses(cache: boolean, state: DataFormResponseState): Observable<DataFormResponse[]> {

    this.log.trace(`${LOG_PREFIX} Entering getDataFormsResponses()`);

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

        if (this.dataFormsResponsesSubject$.value.length > 0) {

          // The desired data is already available in the local cache
          this.log.trace(`${LOG_PREFIX} The desired data is already available in the local cache`);

          // Return the locally cached data
          this.log.trace(`${LOG_PREFIX} Returning the locally cached data`);

          return of(this.dataFormsResponsesSubject$.value);

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

      if (this.dataFormsResponsesSubject$.value.length > 0) {

        // The desired data is already available in the local cache
        this.log.trace(`${LOG_PREFIX} The desired data is already available in the local cache`);

        // Return the locally cached data
        this.log.trace(`${LOG_PREFIX} Returning the locally cached data`);

        return of(this.dataFormsResponsesSubject$.value);

      }

    }


    // Get a fresh set of Data Forms Responses Records from the backend
    this.log.trace(`${LOG_PREFIX} Getting a fresh set of Data Forms Responses Records from the backend`);
    return this.getFreshDataFormsResponses(cache, state);

  }


  /**
   * Retrieves a fresh set of Data Forms Responses Records from the backend
   * 
   * @param cache Whether the results should be locally cached if freshly retrieved from the database
   * @param state The desired records state
   * @returns The Data Forms Responses Records
   */
  private getFreshDataFormsResponses(cache: boolean, state: DataFormResponseState): Observable<DataFormResponse[]> {

    this.log.trace(`${LOG_PREFIX} Entering getFreshDataFormsResponses()`);

    // Set the loading status to true
    this.log.debug(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Make a HTTP GET Request to retrieve the records
    this.log.debug(`${LOG_PREFIX} Making a HTTP GET Request to ${this.url} to retrieve the fresh set of records`);
    return this.http.get<DataFormResponse[]>(`${this.url}`, { headers: new HttpHeaders(HEADERS), params: this.getQueryParams(state), observe: 'response' })
      .pipe(

        map((res: HttpResponse<any>) => {

          // Data Forms Responses Records Retrieval was successful
          this.log.trace(`${LOG_PREFIX} Data Forms Responses Records Retrieval was successful`);
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
            this.dataFormsResponsesSubject$.next(res.body);

          } else {

            // The results should not be locally cached
            this.log.trace(`${LOG_PREFIX} The results should not be locally cached`);

          }

          return res.body;

        }),

        catchError((error: any) => {

          // Data Forms Responses Records Retrieval was unsuccessful
          this.log.error(`${LOG_PREFIX} Data Forms Responses Records Retrieval was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);

        }));
  }



  /**
   * Updates a single Data Form Response Record
   * 
   * @param dataFormResponse The details of the Data Form Response Record to be updated
   * @returns the updated Data Form Response Record
   */
  public updateDataFormResponse(dataFormResponse: DataFormResponse): Observable<DataFormResponse> {

    this.log.trace(`${LOG_PREFIX} Entering updateDataFormResponse()`);
    this.log.debug(`${LOG_PREFIX} Data Form Response = ${JSON.stringify(dataFormResponse)}`);

    // Set the loading status to true
    this.log.debug(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Make a HTTP POST Request to update the record
    this.log.debug(`${LOG_PREFIX} Making a HTTP POST Request to ${this.url}/${dataFormResponse.id} to update the record`);
    return this.http.put<DataFormResponse>(`${this.url}/${dataFormResponse.id} `, JSON.stringify(dataFormResponse), { headers: new HttpHeaders(HEADERS) })
      .pipe(

        tap((data: DataFormResponse) => {

          // Data Form Response Record Update was successful
          this.log.trace(`${LOG_PREFIX} Data Form Response Record Update was successful`);
          this.log.debug(`${LOG_PREFIX} Updated Record = ${JSON.stringify(data)}`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          // Refresh the records / record count
          this.log.trace(`${LOG_PREFIX} Refreshing the records / record count`);
          this.getFreshDataFormsResponses(true, this.state).subscribe();


        }),

        catchError((error: any) => {

          // Data Form Response Record Update was unsuccessful
          this.log.error(`${LOG_PREFIX} Data Form Response Record Update was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);

        }));
  }


  /**
   * Deletes a single Data Form Response Record
   *
   * @param dataFormResponseId The id of the Data Form Response Record to be deleted
   */
  public deleteDataFormResponse(dataFormResponseId: number): Observable<void> {

    this.log.trace(`${LOG_PREFIX} Entering deleteDataFormResponse()`);
    this.log.debug(`${LOG_PREFIX} Data Form Response Id = ${dataFormResponseId}`);

    // Make a HTTP DELETE Request to delete the records
    this.log.debug(`${LOG_PREFIX} Making a HTTP DELETE Request to ${this.url}/${dataFormResponseId} to delete the record`);

    return this.http.delete<void>(`${this.url}/${dataFormResponseId}`, { headers: new HttpHeaders(HEADERS) })
      .pipe(

        tap(() => {

          // Data Form Response Record Deletion was successful
          this.log.trace(`${LOG_PREFIX} Data Form Response Record Deletion was successful`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          // Refresh the records / record count
          this.log.trace(`${LOG_PREFIX} Refreshing the records / record count`);
          this.getFreshDataFormsResponses(true, this.state).subscribe();

        }),

        catchError((error: any) => {

          // Data Form Response Record Deletion was unsuccessful
          this.log.error(`${LOG_PREFIX} Data Form Response Record Deletion was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

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
  public get records(): DataFormResponse[] {
    return this.dataFormsResponsesSubject$.value;
  }



  /**
     * Collates query parameters that correspond to the currently set required records state
     * @state The target state
     * @returns The query parameters
     */
  private getQueryParams(state: DataFormResponseState): HttpParams {

    this.log.trace(`${LOG_PREFIX} Entering getQueryParams()`);

    let params: HttpParams = new HttpParams();


    if (state.timePeriodId) {
      this.log.trace(`${LOG_PREFIX} Adding Time Period Id parameter`);
      params = environment.production ? params.append("timePeriodId", state.timePeriodId) : params.append("data.timePeriodId", state.timePeriodId);
    }

    if (state.formId) {
      this.log.trace(`${LOG_PREFIX} Adding Data Form Id parameter`);
      params = environment.production ? params.append("formId", state.formId) : params.append("data.formId", state.formId);
    }

    if (state.locationId) {
      this.log.trace(`${LOG_PREFIX} Adding Location Id parameter`);
      params = environment.production ? params.append("location.id", state.locationId) : params.append("data.location.id", state.locationId);
    }

    if (state.organisationId) {
      this.log.trace(`${LOG_PREFIX} Adding Organisation Id parameter`);
      params = environment.production ? params.append("organisation.id", state.organisationId) : params.append("data.organisation.id", state.organisationId);
    }

    if (state.entityId) {
      this.log.trace(`${LOG_PREFIX} Adding Entity Id parameter`);
      params = environment.production ? params.append("entity.id", state.entityId) : params.append("data.entity.id", state.entityId);
    }

    if (state.respondentTypeId) {
      this.log.trace(`${LOG_PREFIX} Adding Respondent Type Id parameter`);
      params = environment.production ? params.append("respondent.typeId", state.respondentTypeId) : params.append("data.respondent.typeId", state.respondentTypeId);
    }

    if (state.respondentId) {
      this.log.trace(`${LOG_PREFIX} Adding Respondent Id parameter`);
      params = environment.production ? params.append("respondent.id", state.respondentId) : params.append("data.respondent.id", state.respondentId);
    }

    if (state.respondentName && state.respondentName.trim().length > 0) {
      this.log.trace(`${LOG_PREFIX} Adding Respondent Name parameter`);
      params = environment.production ? params.append("respondent.name", state.respondentName) : params.append("data.respondent.name", state.respondentName);
    }

    if (state.statusIds) {
      this.log.trace(`${LOG_PREFIX} Adding status id parameter`);
      if (environment.production) {

        state.statusIds.forEach((id: any) => {
          if (id) {
            params = params.append("status.id", id);
          }
        });
      } else {
        state.statusIds.forEach((id: any) => {
          if (id) {
            params = params.append("data.status.id", id);
          }
        });
      }
    }

    if (state.searchTerm && state.searchTerm.trim().length > 0) {
      this.log.trace(`${LOG_PREFIX} Adding search parameter`);
      environment.production ? params = params.append("q", state.searchTerm) : params = params.append("q", state.searchTerm);
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
