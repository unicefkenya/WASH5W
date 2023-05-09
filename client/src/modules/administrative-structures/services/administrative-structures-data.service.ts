import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { NGXLogger } from 'ngx-logger';
import { AdministrativeStructure } from '../models/administrative-structure.model';
import { environment } from 'environments/environment';
import { catchError, map, tap } from 'rxjs/operators';
import { AdministrativeStructureState } from '../models/administrative-structure-state.model';

const LOG_PREFIX: string = "[Administrative Structures Data Service]";
const HEADERS = { 'Content-Type': 'application/json' };

@Injectable({
  providedIn: 'root'
})
export class AdministrativeStructuresDataService {

  // Keeps tabs of the default url string
  private url: string = environment.production ?
    `${environment.urls.api}/api/v1/administrative_structures` :
    `${environment.urls.api}/administrative_structures`;

  // Keeps tabs of the user defined search or sort criteria.
  private state: AdministrativeStructureState = {
    page: 1,
    pageSize: 20,
    searchTerm: null,
    sortColumn: 'id',
    sortDirection: 'asc',
    hierarchyId: null,
    hierarchyName: null,
    commissionerId: null,
    commissionerName: null,
    responsibleId: null,
    responsibleName: null,
  };

  // Keeps tabs of the administrativeStructures
  private administrativeStructuresSubject$ = new BehaviorSubject<AdministrativeStructure[]>([]);
  readonly administrativeStructures$ = this.administrativeStructuresSubject$.asObservable();

  // Keeps tabs of the total administrativeStructures (irregardless of pagination)
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
   * Creates a new Administrative Structure Record
   * 
   * @param administrativeStructure the details of the Administrative Structure Record to be created
   * @returns the newly created Administrative Structure Record
   */
  public createAdministrativeStructure(administrativeStructure: AdministrativeStructure): Observable<AdministrativeStructure> {

    this.log.trace(`${LOG_PREFIX} Entering createAdministrativeStructure()`);
    this.log.debug(`${LOG_PREFIX} Administrative Structure = ${JSON.stringify(administrativeStructure)}`);

    // Set the loading status to true
    this.log.debug(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Make a HTTP POST Request to create the record
    this.log.debug(`${LOG_PREFIX} Making a HTTP POST Request to ${this.url} to create the record`);
    return this.http.post<AdministrativeStructure>(`${this.url}`, JSON.stringify(administrativeStructure), { headers: new HttpHeaders(HEADERS) })
      .pipe(

        tap((data: AdministrativeStructure) => {

          // Administrative Structure Record Creation was successful
          this.log.trace(`${LOG_PREFIX} Record Creation was successful`);
          this.log.debug(`${LOG_PREFIX} Created Record = ${JSON.stringify(data)}`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          // Refresh the records / record count
          this.log.trace(`${LOG_PREFIX} Refreshing the records / record count`);
          this.getFreshAdministrativeStructures(true, this.state).subscribe();

        }),

        catchError((error: any) => {

          // Administrative Structure Record Creation was unsuccessful
          this.log.error(`${LOG_PREFIX} Administrative Structure Record Creation was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);

        }));
  }



  /**
   * Retrieves Administrative Structures Records from the local cache or database
   * 
   * @param cache Whether the results should be locally cached if freshly retrieved from the database
   * @param state The desired records state
   * @returns The Administrative Structures Records
   */
  public getAdministrativeStructures(cache: boolean, state: AdministrativeStructureState): Observable<AdministrativeStructure[]> {

    this.log.trace(`${LOG_PREFIX} Entering getAdministrativeStructures()`);

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

        if (this.administrativeStructuresSubject$.value.length > 0) {

          // The desired data is already available in the local cache
          this.log.trace(`${LOG_PREFIX} The desired data is already available in the local cache`);

          // Return the locally cached data
          this.log.trace(`${LOG_PREFIX} Returning the locally cached data`);

          return of(this.administrativeStructuresSubject$.value);

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

      if (this.administrativeStructuresSubject$.value.length > 0) {

        // The desired data is already available in the local cache
        this.log.trace(`${LOG_PREFIX} The desired data is already available in the local cache`);

        // Return the locally cached data
        this.log.trace(`${LOG_PREFIX} Returning the locally cached data`);

        return of(this.administrativeStructuresSubject$.value);

      }

    }


    // Get a fresh set of Administrative Structures Records from the backend
    this.log.trace(`${LOG_PREFIX} Getting a fresh set of Administrative Structures Records from the backend`);
    return this.getFreshAdministrativeStructures(cache, state);

  }


  /**
   * Retrieves a fresh set of Administrative Structures Records from the backend
   * 
   * @param cache Whether the results should be locally cached if freshly retrieved from the database
   * @param state The desired records state
   * @returns The Administrative Structures Records
   */
  private getFreshAdministrativeStructures(cache: boolean, state: AdministrativeStructureState): Observable<AdministrativeStructure[]> {

    this.log.trace(`${LOG_PREFIX} Entering getFreshAdministrativeStructures()`);

    // Set the loading status to true
    this.log.debug(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Collate the query parameters
    this.log.debug(`${LOG_PREFIX} Collating the query parameters`);
    const parameters: any = this.getQueryParams(state);


    // Make a HTTP GET Request to retrieve the records
    this.log.debug(`${LOG_PREFIX} Making a HTTP GET Request to ${this.url} to retrieve the fresh set of records`);
    return this.http.get<AdministrativeStructure[]>(`${this.url}`, { headers: new HttpHeaders(HEADERS), params: new HttpParams({ fromObject: parameters }), observe: 'response' })
      .pipe(

        map((res: HttpResponse<any>) => {

          // Administrative Structures Records Retrieval was successful
          this.log.trace(`${LOG_PREFIX} Administrative Structures Records Retrieval was successful`);
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
            this.administrativeStructuresSubject$.next(res.body);

          } else {

            // The results should not be locally cached
            this.log.trace(`${LOG_PREFIX} The results should not be locally cached`);

          }

          return res.body;

        }),

        catchError((error: any) => {

          // Administrative Structures Records Retrieval was unsuccessful
          this.log.error(`${LOG_PREFIX} Administrative Structures Records Retrieval was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);

        }));
  }



  /**
   * Updates a single Administrative Structure Record
   * 
   * @param administrativeStructure The details of the Administrative Structure Record to be updated
   * @returns the updated Administrative Structure Record
   */
  public updateAdministrativeStructure(administrativeStructure: AdministrativeStructure): Observable<AdministrativeStructure> {

    this.log.trace(`${LOG_PREFIX} Entering updateAdministrativeStructure()`);
    this.log.debug(`${LOG_PREFIX} Administrative Structure = ${JSON.stringify(administrativeStructure)}`);

    // Set the loading status to true
    this.log.debug(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Make a HTTP POST Request to update the record
    this.log.debug(`${LOG_PREFIX} Making a HTTP POST Request to ${this.url}/${administrativeStructure.id} to update the record`);
    return this.http.put<AdministrativeStructure>(`${this.url}/${administrativeStructure.id} `, JSON.stringify(administrativeStructure), { headers: new HttpHeaders(HEADERS) })
      .pipe(

        tap((data: AdministrativeStructure) => {

          // Administrative Structure Record Update was successful
          this.log.trace(`${LOG_PREFIX} Administrative Structure Record Update was successful`);
          this.log.debug(`${LOG_PREFIX} Updated Record = ${JSON.stringify(data)}`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          // Refresh the records / record count
          this.log.trace(`${LOG_PREFIX} Refreshing the records / record count`);
          this.getFreshAdministrativeStructures(true, this.state).subscribe();


        }),

        catchError((error: any) => {

          // Administrative Structure Record Update was unsuccessful
          this.log.error(`${LOG_PREFIX} Administrative Structure Record Update was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);

        }));
  }


  /**
   * Deletes a single Administrative Structure Record
   *
   * @param administrativeStructureId The id of the Administrative Structure Record to be deleted
   */
  public deleteAdministrativeStructure(administrativeStructureId: number): Observable<void> {

    this.log.trace(`${LOG_PREFIX} Entering deleteAdministrativeStructure()`);
    this.log.debug(`${LOG_PREFIX} Administrative Structure Id = ${administrativeStructureId}`);

    // Make a HTTP DELETE Request to delete the records
    this.log.debug(`${LOG_PREFIX} Making a HTTP DELETE Request to ${this.url}/${administrativeStructureId} to delete the record`);

    return this.http.delete<void>(`${this.url}/${administrativeStructureId}`, { headers: new HttpHeaders(HEADERS) })
      .pipe(

        tap(() => {

          // Administrative Structure Record Deletion was successful
          this.log.trace(`${LOG_PREFIX} Administrative Structure Record Deletion was successful`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          // Refresh the records / record count
          this.log.trace(`${LOG_PREFIX} Refreshing the records / record count`);
          this.getFreshAdministrativeStructures(true, this.state).subscribe();

        }),

        catchError((error: any) => {

          // Administrative Structure Record Deletion was unsuccessful
          this.log.error(`${LOG_PREFIX} Administrative Structure Record Deletion was unsuccessful: ${error.statusText || "See Server Logs for more details"}`);

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
  public get records(): AdministrativeStructure[] {
    return this.administrativeStructuresSubject$.value;
  }

  /**
   * Collates query parameters that correspond to the currently set required records state
   * @state The target state
   * @returns The query parameters
   */
  private getQueryParams(state: AdministrativeStructureState): any {

    this.log.trace(`${LOG_PREFIX} Entering getQueryParams()`);

    let params: any = {}

    if (state.hierarchyId) {
      this.log.trace(`${LOG_PREFIX} Adding hierarchy id parameter`);
      environment.production ? params['hierarchyId'] = state.hierarchyId : params['data.hierarchy.id'] = state.hierarchyId;
    }

    if (state.hierarchyName) {
      this.log.trace(`${LOG_PREFIX} Adding hierarchy name parameter`);
      environment.production ? params['hierarchyName'] = state.hierarchyName : params['data.hierarchy.name'] = state.hierarchyName;
    }

    if (state.commissionerId) {
      this.log.trace(`${LOG_PREFIX} Adding commissioner id parameter`);
      environment.production ? params['commissionerId'] = state.commissionerId : params['data.commissioner.id'] = state.commissionerId;
    }

    if (state.commissionerName) {
      this.log.trace(`${LOG_PREFIX} Adding commissioner name parameter`);
      environment.production ? params['commissionerName'] = state.commissionerName : params['data.commissioner.name'] = state.commissionerName;
    }

    if (state.responsibleId) {
      this.log.trace(`${LOG_PREFIX} Adding responsible id parameter`);
      environment.production ? params['responsibleId'] = state.responsibleId : params['data.responsible.id'] = state.responsibleId;
    }

    if (state.responsibleName) {
      this.log.trace(`${LOG_PREFIX} Adding responsible name parameter`);
      environment.production ? params['responsibleName'] = state.responsibleName : params['data.responsible.name'] = state.responsibleName;
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
