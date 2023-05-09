import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { NGXLogger } from 'ngx-logger';
import { Claims } from '../models/claims.model';
import { environment } from 'environments/environment';
import { catchError, map, tap } from 'rxjs/operators';
import { EncodedToken } from '../models/encoded-token.model';
import { TokenValidity } from '../models';

const LOG_PREFIX: string = "[Tokens Service]";

const HEADERS = { 'Content-Type': 'application/json' };

@Injectable({
  providedIn: 'root'
})
export class TokensService {

  // Keeps tabs of the default url string
  private url: string = environment.production ?
    `${environment.urls.tokens}/api/v1/tokens` :
    `${environment.urls.tokens}/api/v1/tokens`;

  // Keeps tabs of the loading status
  private loadingSubject$ = new BehaviorSubject<boolean>(false);
  readonly loading$ = this.loadingSubject$.asObservable();

  constructor(
    private http: HttpClient,
    private log: NGXLogger) {

  }

  /**
   * Generates a new jwt token
   * 
   * @param claims the pieces of information asserted about the subject
   * @returns the newly created jwt token
   */
  public encodeToken(claims: Claims): Observable<EncodedToken> {

    this.log.trace(`${LOG_PREFIX} Entering encodeToken()`);
    this.log.debug(`${LOG_PREFIX} Claims = ${JSON.stringify(claims)}`);

    // Set the loading status to true
    this.log.trace(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Make a HTTP POST Request to create the token
    this.log.debug(`${LOG_PREFIX} Making a HTTP POST Request to ${this.url} to create the token`);
    return this.http.post<EncodedToken>(`${this.url}/encoding`, JSON.stringify(claims), { headers: new HttpHeaders(HEADERS) })
      .pipe(

        tap((data: EncodedToken) => {

          // Token Creation was successful
          this.log.trace(`${LOG_PREFIX} Token Creation was successful`);
          this.log.debug(`${LOG_PREFIX} Created Token = ${data}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

        }),

        catchError((error: any) => {

          // Token Creation was unsuccessful
          this.log.error(`${LOG_PREFIX} Token Creation was unsuccessful: ${error.message|| "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error("Token Encoding Failed");

        }));
  }




  /**
   * Verifies whether a jwt token is valid
   * 
   * See: https://www.reddit.com/r/reactjs/comments/qskt8o/should_i_decode_a_jwt_token_on_the_client_side_to/
   * 
   * @param token the jwt token
   * @returns true or false
   */
  public verifyToken(token: string): Observable<TokenValidity> {

    this.log.trace(`${LOG_PREFIX} Entering verifyToken()`);

    // Set the loading status to true
    this.log.trace(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Make a HTTP GET Request to verify the token's validity
    this.log.debug(`${LOG_PREFIX} Making a HTTP GET Request to ${this.url} to verify the token's validity`);
    return this.http.get<TokenValidity>(`${this.url}/verification`, { headers: new HttpHeaders({ 'Authorization': "Bearer " + token }), observe: 'response' })
      .pipe(

        map((res: HttpResponse<any>) => {

          // Verification was successful
          this.log.trace(`${LOG_PREFIX} Verification was successful`);
          this.log.debug(`${LOG_PREFIX} Validity = ${JSON.stringify(res.body)}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          return res.body;
        }),

        catchError((error: any) => {

          // Verification was unsuccessful
          this.log.trace(`${LOG_PREFIX} Verification was unsuccessful`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error("Token Verification Failed");

        }));
  }



  /**
   * Decodes a jwt token
   * 
   * See: https://www.reddit.com/r/reactjs/comments/qskt8o/should_i_decode_a_jwt_token_on_the_client_side_to/
   * 
   * @param token the jwt token
   * @returns the token's claims
   */
  public decodeToken(token: string): Observable<Claims> {

    this.log.trace(`${LOG_PREFIX} Entering decodeToken()`);

    // Set the loading status to true
    this.log.trace(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Make a HTTP GET Request to retrieve the claims
    this.log.debug(`${LOG_PREFIX} Making a HTTP GET Request to ${this.url} to retrieve the token's claims`);
    return this.http.get<Claims>(`${this.url}/decoding`, { headers: new HttpHeaders({ 'Authorization': "Bearer " + token }), observe: 'response' })
      .pipe(

        map((res: HttpResponse<any>) => {

          // Claims Retrieval was successful
          this.log.trace(`${LOG_PREFIX} Claims Retrieval was successful`);
          this.log.debug(`${LOG_PREFIX} Retrieved Claims = ${JSON.stringify(res.body)}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          return res.body;

        }),

        catchError((error: any) => {

          // Claims Retrieval was unsuccessful
          this.log.error(`${LOG_PREFIX} Claims Retrieval was unsuccessful: ${error.message|| "See Server Logs for more details"}`);

          // Set the loading status to false
          this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error("Token Decoding Failed");

        }));
  }

}
