import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NGXLogger } from 'ngx-logger';
import { environment } from 'environments/environment';
import { catchError, tap } from 'rxjs/operators';
import { EmailDispatchInfo, NotificationEmail, PasswordRecoveryEmail, RegistrationConfirmationEmail } from '../models';

const LOG_PREFIX: string = "[Emails Service]";

@Injectable({
  providedIn: 'root'
})
export class EmailsService {

  // Keeps tabs of the default url string
  private url: string = environment.production ?
    `${environment.urls.mail}/api/v1/emails` :
    `${environment.urls.mail}/api/v1/emails`;

  // Keeps tabs of the loading status
  private loadingSubject$ = new BehaviorSubject<boolean>(false);
  readonly loading$ = this.loadingSubject$.asObservable();

  constructor(
    private http: HttpClient,
    private log: NGXLogger) {

  }

  /**
   * Sends an account confirmation email
   * 
   * @param email the details of the email to send
   * @returns the metadata of the newly dispatched email
   */
  public sendRegistrationConfirmationEmail(email: RegistrationConfirmationEmail): Observable<EmailDispatchInfo> {

    this.log.trace(`${LOG_PREFIX} Entering sendRegistrationConfirmationEmail()`);
    this.log.debug(`${LOG_PREFIX} Email = ${JSON.stringify(email)}`);

    // Set the loading status to true
    this.log.debug(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Make a HTTP POST Request to send the email
    this.log.debug(`${LOG_PREFIX} Making a HTTP POST Request to ${this.url} to send the email`);
    return this.http.post<EmailDispatchInfo>(`${this.url}/confirmation`, JSON.stringify(email), { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) })
      .pipe(

        tap((data: EmailDispatchInfo) => {

          // Email was sent successfully
          this.log.trace(`${LOG_PREFIX} Email was sent successfully`);
          this.log.debug(`${LOG_PREFIX} Dispatch Info = ${JSON.stringify(data)}`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

        }),

        catchError((error: any) => {

          // Email was not sent successfully
          this.log.trace(`${LOG_PREFIX} Email was not sent successfully`);
          this.log.debug(`${LOG_PREFIX} Error = ${JSON.stringify(error)}`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);

        }));
  }



  /**
   * Sends a password recovery email
   * 
   * @param email the details of the email to send
   * @returns the metadata of the newly dispatched email
   */
   public sendPasswordRecoveryEmail(email: PasswordRecoveryEmail): Observable<EmailDispatchInfo> {

    this.log.trace(`${LOG_PREFIX} Entering sendPasswordRecoveryEmail()`);
    this.log.debug(`${LOG_PREFIX} Email = ${JSON.stringify(email)}`);

    // Set the loading status to true
    this.log.debug(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Make a HTTP POST Request to send the email
    this.log.debug(`${LOG_PREFIX} Making a HTTP POST Request to ${this.url} to send the email`);
    return this.http.post<EmailDispatchInfo>(`${this.url}/recovery`, JSON.stringify(email), { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) })
      .pipe(

        tap((data: EmailDispatchInfo) => {

          // Email was sent successfully
          this.log.trace(`${LOG_PREFIX} Email was sent successfully`);
          this.log.debug(`${LOG_PREFIX} Dispatch Info = ${JSON.stringify(data)}`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

        }),

        catchError((error: any) => {

          // Email was not sent successfully
          this.log.trace(`${LOG_PREFIX} Email was not sent successfully`);
          this.log.debug(`${LOG_PREFIX} Error = ${JSON.stringify(error)}`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);

        }));
  } 
  
  
  /**
   * Sends a notification email
   * 
   * @param email the details of the email to send
   * @returns the metadata of the newly dispatched email
   */
   public sendNotificationEmail(email: NotificationEmail): Observable<EmailDispatchInfo> {

    this.log.trace(`${LOG_PREFIX} Entering sendNotificationEmail()`);
    this.log.debug(`${LOG_PREFIX} Email = ${JSON.stringify(email)}`);

    // Set the loading status to true
    this.log.debug(`${LOG_PREFIX} Setting the loading status to true`);
    this.loadingSubject$.next(true);

    // Make a HTTP POST Request to send the email
    this.log.debug(`${LOG_PREFIX} Making a HTTP POST Request to ${this.url} to send the email`);
    return this.http.post<EmailDispatchInfo>(`${this.url}/notification`, JSON.stringify(email), { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) })
      .pipe(

        tap((data: EmailDispatchInfo) => {

          // Email was sent successfully
          this.log.trace(`${LOG_PREFIX} Email was sent successfully`);
          this.log.debug(`${LOG_PREFIX} Dispatch Info = ${JSON.stringify(data)}`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

        }),

        catchError((error: any) => {

          // Email was not sent successfully
          this.log.trace(`${LOG_PREFIX} Email was not sent successfully`);
          this.log.debug(`${LOG_PREFIX} Error = ${JSON.stringify(error)}`);

          // Set the loading status to false
          this.log.debug(`${LOG_PREFIX} Setting the loading status to false`);
          this.loadingSubject$.next(false);

          throw new Error(error);

        }));
  }    


}
