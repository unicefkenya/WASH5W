/**
 * See: https://github.com/AlexKhymenko/ngx-permissions
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { NGXLogger } from 'ngx-logger';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { RegistrationConfirmationRequest, RegistrationConfirmationResponse, SignInRequest, SignInResponse, SignUpRequest, SignUpResponse } from '../models';
import { environment } from 'environments/environment';
import { catchError, first, map, switchMap, tap } from 'rxjs/operators';
import { SystemsUsersDataService } from '@modules/systems-users/services/systems-users-data.service';
import { SystemUser } from '@modules/systems-users/models/system-user.model';
import { TokensService } from '@modules/tokens/services/tokens.service';
import { Claims, EncodedToken, TokenValidity } from '@modules/tokens/models';
import { PasswordRecoveryRequestResponse } from '../models/password-recovery-response';
import { PasswordRecoveryRequest } from '../models/password-recovery-request';
import { SystemsUsersRightsDataService } from '@modules/systems-users-rights/services/systems-users-rights-data.service';
import { SystemUserRight } from '@modules/systems-users-rights/models/system-user-right.model';
import { SystemRole } from '@modules/systems-roles/models/system-role.model';
import { FilterService } from '@app/app-filter.service';
import { SystemsRolesDataService } from '@modules/systems-roles/services/systems-roles-data.service';
import { Context } from '@modules/contexts/models';


const LOG_PREFIX: string = "[Auth Service]";

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    // Keeps tabs of the default url string
    private url: string = environment.production ?
        `${environment.urls.api}/api/v1/auth` : ``;

    // Keeps tabs of the loading status
    private loadingSubject$ = new BehaviorSubject<boolean>(false);
    readonly loading$ = this.loadingSubject$.asObservable();

    constructor(
        private systemsUsersDataService: SystemsUsersDataService,
        private systemsUsersRightsDataService: SystemsUsersRightsDataService,
        private systemsRolesDataService: SystemsRolesDataService,
        private tokensService: TokensService,
        private filterService: FilterService,
        private http: HttpClient,
        private log: NGXLogger) {

    }

    /**
     * Signs in a user
     * 
     * @param request the sign in request - containing the username & password
     * @returns the sign in response - containing the jwt token
     */
    public signIn(request: SignInRequest): Observable<SignInResponse> {

        return environment.production ? this.productionSignIn(request) : this.developmentSignIn(request);
    }

    /**
     * Signs in a user in a production environmanet
     * 
     * @param request the sign in request - containing the username & password
     * @returns the sign in response - containing the jwt token
     */
    private productionSignIn(request: SignInRequest): Observable<SignInResponse> {

        this.log.trace(`${LOG_PREFIX} Entering productionSignIn()`);

        // Set the loading status to true
        this.log.trace(`${LOG_PREFIX} Setting the loading status to true`);
        this.loadingSubject$.next(true);

        // Make a HTTP POST Request to sign in the user
        this.log.debug(`${LOG_PREFIX} Making a HTTP POST Request to ${this.url}/signIn to sign in the user`);
        return this.http.post<SignInResponse>(`${this.url}/signIn`, JSON.stringify(request), { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) })
            .pipe(

                tap((data: SignInResponse) => {

                    // Sign in was successful
                    this.log.trace(`${LOG_PREFIX} Sign in was successful`);

                    // Set the loading status to false
                    this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
                    this.loadingSubject$.next(false);

                }),

                catchError((error: Error) => {

                    // Sign in was unsuccessful
                    this.log.error(`${LOG_PREFIX} Sign in was unsuccessful: ${error.message || "See Server Logs for more details"}`);

                    // Set the loading status to false
                    this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
                    this.loadingSubject$.next(false);

                    throw new Error(error.message);

                }));

    }

    /**
     * Signs in a user in a development environmanet
     * 
     * @param request the sign in request - containing the username & password
     * @returns the sign in response - containing the jwt token
     */
    private developmentSignIn(request: SignInRequest): Observable<SignInResponse> {

        this.log.trace(`${LOG_PREFIX} Entering developmentSignIn()`);

        // Set the loading status to true
        this.log.trace(`${LOG_PREFIX} Setting the loading status to true`);
        this.loadingSubject$.next(true);

        return this.systemsUsersDataService
            .getSystemsUsers(false, {
                page: null,
                pageSize: null,
                searchTerm: null,
                sortColumn: null,
                sortDirection: null,
                id: null,
                name: null,
                email: request.username,
                password: window.btoa(request.password as string)
            })
            .pipe(

                switchMap((systemUsers: SystemUser[]) => {

                    if (systemUsers.length == 1) {

                        return this.systemsUsersRightsDataService
                            .getSystemsUsersRights(false, {
                                searchTerm: null,
                                page: null,
                                pageSize: null,
                                sortColumn: null,
                                sortDirection: null,
                                id: null,
                                systemUserId: systemUsers[0].id,
                                contextId: null
                            })
                            .pipe(

                                switchMap((systemUserRights: SystemUserRight[]) => {

                                    if (systemUserRights.length >= 1) {

                                        return this.tokensService
                                            .encodeToken(new Claims({
                                                sub: "Account Confirmation",
                                                uid: systemUsers[0].id,
                                                name: systemUsers[0].data.name,
                                                email: systemUsers[0].data.email,
                                                confirmed: systemUsers[0].data.confirmed,
                                                enabled: systemUsers[0].data.enabled,
                                                rights: systemUserRights
                                            }))

                                    } else {
                                        throw new Error("Rights Unassigned");
                                    }
                                })
                            )

                    } else {
                        throw new Error("Invalid Login Credentials");
                    }
                }),

                map((token: EncodedToken) => ({ token: token.token })),

                tap((data: SignInResponse) => {

                    // Sign in was successful
                    this.log.trace(`${LOG_PREFIX} Sign in was successful`);

                    // Set the loading status to false
                    this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
                    this.loadingSubject$.next(false);

                }),

                catchError((error: Error) => {

                    // Sign in was unsuccessful
                    this.log.error(`${LOG_PREFIX} Sign in was unsuccessful: ${error.message || "See Server Logs for more details"}`);

                    // Set the loading status to false
                    this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
                    this.loadingSubject$.next(false);

                    throw new Error(error.message);

                })
            );

    }

    /**
    * Signs in a user
    * 
    * @param request the sign up request - containing the username & password
    * @returns the sign up response - containing the jwt token
    */
    public signUp(request: SignUpRequest): Observable<SignUpResponse> {

        return environment.production ? this.productionSignUp(request) : this.developmentSignUp(request);
    }

    /**
     * Signs up a user in a production environmanet
     * 
     * @param request the sign up request - containing the username & password
     * @returns the sign up response -this.productionSignUp(request) containing the jwt token
     */
    private productionSignUp(request: SignUpRequest): Observable<SignUpResponse> {

        this.log.trace(`${LOG_PREFIX} Entering productionSignUp()`);

        // Set the loading status to true
        this.log.trace(`${LOG_PREFIX} Setting the loading status to true`);
        this.loadingSubject$.next(true);

        // Make a HTTP POST Request to sign up the user
        this.log.debug(`${LOG_PREFIX} Making a HTTP POST Request to ${this.url}/signUp to sign up the user`);
        return this.http.post<SignUpResponse>(`${this.url}/signUp`, JSON.stringify(request), { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) })
            .pipe(

                tap((data: SignUpResponse) => {

                    // Sign in was successful
                    this.log.trace(`${LOG_PREFIX} Sign up was successful`);

                    // Set the loading status to false
                    this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
                    this.loadingSubject$.next(false);

                }),

                catchError((error: Error) => {

                    // Sign in was unsuccessful
                    this.log.error(`${LOG_PREFIX} Sign up was unsuccessful: ${error.message || "See Server Logs for more details"}`);

                    // Set the loading status to false
                    this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
                    this.loadingSubject$.next(false);

                    throw new Error(error.message);

                }));

    }

    /**
     * Signs up a user in a development environmanet
     * 
     * @param request the sign up request - containing the username & password
     * @returns the sign up response - containing the jwt token
     */
    private developmentSignUp(request: SignUpRequest): Observable<SignUpResponse> {

        this.log.trace(`${LOG_PREFIX} Entering developmentSignUp()`);

        // Set the loading status to true
        this.log.trace(`${LOG_PREFIX} Setting the loading status to true`);
        this.loadingSubject$.next(true);


        return this.systemsUsersDataService
            .createSystemUser(new SystemUser({
                data: {
                    name: request.name,
                    email: request.email,
                    password: request.password,
                    enabled: false,
                    confirmed: false,
                },
                version: null
            }))
            .pipe(

                switchMap((systemUser: SystemUser) => this.tokensService
                    .encodeToken(new Claims({
                        sub: "Account Confirmation",
                        uid: systemUser.id,
                        name: systemUser.data.name,
                        email: systemUser.data.email,
                        confirmed: systemUser.data.confirmed,
                        enabled: systemUser.data.enabled,
                        rights: []
                    }))),

                map((token: EncodedToken) => ({ token: token.token })),

                tap((data: SignUpResponse) => {

                    // Sign up was successful
                    this.log.trace(`${LOG_PREFIX} Sign up was successful`);

                    // Set the loading status to false
                    this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
                    this.loadingSubject$.next(false);

                }),

                catchError((error: Error) => {

                    // Sign up was unsuccessful
                    this.log.error(`${LOG_PREFIX} Sign up was unsuccessful: ${error.message || "See Server Logs for more details"}`);

                    // Set the loading status to false
                    this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
                    this.loadingSubject$.next(false);

                    throw new Error(error.message);

                })
            );

    }


    /**
    * Confirms a user account registration
    * 
    * @param request the registration confirmation request - containing the jwt token
    * @returns the registration confirmation response - containing the confirmation status
    */
    public confirmAccountRegistration(request: RegistrationConfirmationRequest): Observable<RegistrationConfirmationResponse> {

        return environment.production ? this.productionRegistrationConfirmation(request) : this.developmentRegistrationConfirmation(request);
    }

    /**
     * Signs in a user in a production environmanet
     * 
     * @param request the registration confirmation request - containing the jwt token
     * @returns the registration confirmation response - containing the confirmation status
     */
    private productionRegistrationConfirmation(request: RegistrationConfirmationRequest): Observable<RegistrationConfirmationResponse> {

        this.log.trace(`${LOG_PREFIX} Entering productionRegistrationConfirmation()`);

        // Set the loading status to true
        this.log.trace(`${LOG_PREFIX} Setting the loading status to true`);
        this.loadingSubject$.next(true);

        // Make a HTTP POST Request to registration confirmation the user
        this.log.debug(`${LOG_PREFIX} Making a HTTP POST Request to ${this.url}/confirmation to registration confirmation the user`);
        return this.http.post<RegistrationConfirmationResponse>(`${this.url}/confirmation`, JSON.stringify(request), { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) })
            .pipe(

                tap((data: RegistrationConfirmationResponse) => {

                    // Registration Confirmation was successful
                    this.log.trace(`${LOG_PREFIX} Registration Confirmation was successful`);

                    // Set the loading status to false
                    this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
                    this.loadingSubject$.next(false);

                }),

                catchError((error: Error) => {

                    // Registration Confirmation was unsuccessful
                    this.log.error(`${LOG_PREFIX} Registration Confirmation was unsuccessful: ${error.message || "See Server Logs for more details"}`);

                    // Set the loading status to false
                    this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
                    this.loadingSubject$.next(false);

                    throw new Error(error.message);

                }));

    }

    /**
     * Signs in a user in a development environmanet
     * 
     * @param request the registration confirmation request - containing the jwt token
     * @returns the registration confirmation response - containing the confirmation status
     */
    private developmentRegistrationConfirmation(request: RegistrationConfirmationRequest): Observable<RegistrationConfirmationResponse> {

        this.log.trace(`${LOG_PREFIX} Entering developmentRegistrationConfirmation()`);

        // Set the loading status to true
        this.log.trace(`${LOG_PREFIX} Setting the loading status to true`);
        this.loadingSubject$.next(true);

        return this.tokensService
            .verifyToken(request.token)
            .pipe(

                // Validate the token
                switchMap((validity: TokenValidity) => {

                    if (validity.valid) {
                        return this.tokensService.decodeToken(request.token);
                    } else {
                        throw new Error("Invalid Token");
                    }
                }),

                // Retrieve the user details given the user id in the claims
                switchMap((claims: Claims) => {

                    if (claims.uid) {
                        return this.systemsUsersDataService
                            .getSystemsUsers(false, {
                                page: null,
                                pageSize: null,
                                searchTerm: null,
                                sortColumn: null,
                                sortDirection: null,
                                id: claims.uid,
                                name: null,
                                email: null,
                                password: null
                            });
                    } else {
                        throw new Error("Invalid UID");
                    }
                }),

                // Update the user details
                switchMap((systemUsers: SystemUser[]) => {

                    if (systemUsers.length == 1) {

                        //const user: SystemUser = Object.assign(systemUsers[0], { data: Object.assign(systemUsers[0].data, { confirmed: true }) });

                        const user: SystemUser = systemUsers[0];
                        user.data.confirmed = true;

                        return this.systemsUsersDataService
                            .updateSystemUser(user)
                    } else {
                        throw new Error("Invalid Account");
                    }

                }),

                // Return
                map((systemUser: SystemUser) => ({ confirmed: true })),

                tap((data: RegistrationConfirmationResponse) => {

                    // Registration Confirmation was successful
                    this.log.trace(`${LOG_PREFIX} Registration Confirmation was successful`);

                    // Set the loading status to false
                    this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
                    this.loadingSubject$.next(false);

                }),

                catchError((error: Error) => {

                    // Registration Confirmation was unsuccessful
                    this.log.error(`${LOG_PREFIX} Registration Confirmation was unsuccessful: ${error.message || "See Server Logs for more details"}`);

                    // Set the loading status to false
                    this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
                    this.loadingSubject$.next(false);

                    throw new Error(error.message);

                })
            );

    }



    /**
    * Request a user account's password reset
    * 
    * @param request the password recovery request request - containing the user's email
    * @returns the password recovery request response - containing the authorising jwt token
    */
    public passwordRecoveryRequest(request: PasswordRecoveryRequest): Observable<PasswordRecoveryRequestResponse> {

        return environment.production ? this.productionPasswordRecoveryRequest(request) : this.developmentPasswordRecoveryRequest(request);
    }

    /**
     * Request a user's password reset in a production environmanet
     * 
    * @param request the password recovery request request - containing the user's email
    * @returns the password recovery request response - containing the authorising jwt token
     */
    private productionPasswordRecoveryRequest(request: PasswordRecoveryRequest): Observable<PasswordRecoveryRequestResponse> {

        this.log.trace(`${LOG_PREFIX} Entering productionPasswordRecoveryRequest()`);

        // Set the loading status to true
        this.log.trace(`${LOG_PREFIX} Setting the loading status to true`);
        this.loadingSubject$.next(true);

        // Make a HTTP POST Request to password recovery request the user
        this.log.debug(`${LOG_PREFIX} Making a HTTP POST Request to ${this.url}/recovery to password recovery request the user`);
        return this.http.post<PasswordRecoveryRequestResponse>(`${this.url}/recovery`, JSON.stringify(request), { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) })
            .pipe(

                tap((data: PasswordRecoveryRequestResponse) => {

                    // Password recovery  in was successful
                    this.log.trace(`${LOG_PREFIX} Password recovery was successful`);

                    // Set the loading status to false
                    this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
                    this.loadingSubject$.next(false);

                }),

                catchError((error: Error) => {

                    // Password recovery  was unsuccessful
                    this.log.error(`${LOG_PREFIX} Password recovery  was unsuccessful: ${error.message || "See Server Logs for more details"}`);

                    // Set the loading status to false
                    this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
                    this.loadingSubject$.next(false);

                    throw new Error(error.message);

                }));

    }

    /**
     * Request a user's password reset in a development environmanet
     * 
    * @param request the password recovery request request - containing the user's email
    * @returns the password recovery request response - containing the authorising jwt token
     */
    private developmentPasswordRecoveryRequest(request: PasswordRecoveryRequest): Observable<PasswordRecoveryRequestResponse> {

        this.log.trace(`${LOG_PREFIX} Entering developmentPasswordRecoveryRequest()`);

        // Set the loading status to true
        this.log.trace(`${LOG_PREFIX} Setting the loading status to true`);
        this.loadingSubject$.next(true);


        return this.systemsUsersDataService
            .getSystemsUsers(false, {
                page: null,
                pageSize: null,
                searchTerm: null,
                sortColumn: null,
                sortDirection: null,
                id: null,
                name: null,
                email: request.email,
                password: null
            })
            .pipe(

                switchMap((systemUsers: SystemUser[]) => {

                    if (systemUsers.length == 1) {

                        return this.tokensService
                            .encodeToken(new Claims({
                                sub: "Password Recovery",
                                uid: systemUsers[0].id,
                                name: systemUsers[0].data.name,
                                email: systemUsers[0].data.email,
                                confirmed: systemUsers[0].data.confirmed,
                                enabled: systemUsers[0].data.enabled,
                                rights: []
                            }))

                    } else {
                        throw new Error("Invalid Email");
                    }
                }),

                map((token: EncodedToken) => ({ token: token.token })),

                tap((data: PasswordRecoveryRequestResponse) => {

                    // Password reset request was successful
                    this.log.trace(`${LOG_PREFIX} Password reset request was successful`);

                    // Set the loading status to false
                    this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
                    this.loadingSubject$.next(false);

                }),

                catchError((error: Error) => {

                    // Password reset request was unsuccessful
                    this.log.error(`${LOG_PREFIX} Password reset request was unsuccessful: ${error.message || "See Server Logs for more details"}`);

                    // Set the loading status to false
                    this.log.trace(`${LOG_PREFIX} Setting the loading status to false`);
                    this.loadingSubject$.next(false);

                    throw new Error(error.message);

                })
            );

    }


    /**
     * Retrieves the active user's role in the currently active context
     */
     public retrieveActiveUsersContextRole(activeSystemUser: SystemUser | null | undefined, context: Context | null | undefined): Observable<SystemRole | null> {

        this.log.trace(`${LOG_PREFIX} Entering retrieveActiveUsersContextRole()`);

        return new Observable((observer) => {

            // Check if the active user has been initialised
            this.log.trace(`${LOG_PREFIX} Checking if the active user has been initialised`);
            if (activeSystemUser?.data.rights) {

                // The active user has been initialised
                this.log.trace(`${LOG_PREFIX} The active user has been initialised`);

                // Check if the target context has been specified
                this.log.trace(`${LOG_PREFIX} Checking if the target context has been specified`);
                if (context?.id) {

                    // The target context has been specified
                    this.log.trace(`${LOG_PREFIX} The target context has been specified`);

                    // Try retrieving the user's right in the target context
                    this.log.trace(`${LOG_PREFIX} Trying to retrieve the user's right in the target context`);
                    const right: SystemUserRight | undefined = activeSystemUser.data.rights.find(r => r.data.context?.id == context.id);

                    // Check if the user's right was successfully retrieved
                    this.log.trace(`${LOG_PREFIX} Checking if the user's right was successfully retrieved`);
                    if (right) {

                        // The user's right was successfully retrieved
                        this.log.trace(`${LOG_PREFIX} The user's right was successfully retrieved`);

                        // Check if the user's role was correctly identified within the right
                        this.log.trace(`${LOG_PREFIX} Checking if the user's role was correctly identified within the right`);
                        if (right.data.role?.id) {

                            // The user's role was correctly identified within the right
                            this.log.trace(`${LOG_PREFIX} The user's role was correctly identified within the right`);

                            // Try retrieving the details of the identified user role
                            this.log.trace(`${LOG_PREFIX} Trying to retrieve the details of the identified user role`);
                            this.systemsRolesDataService
                                .getSystemsRoles(false, {
                                    searchTerm: null,
                                    page: null,
                                    pageSize: null,
                                    sortColumn: null,
                                    sortDirection: null,
                                    ids: [right.data.role.id],
                                    code: null,
                                    name: null,
                                })
                                .pipe(first()) // This will automatically complete (and therefore unsubscribe) after the first value has been emitted.
                                .subscribe({
                                    next: (systemRoles: SystemRole[]) => {

                                        // Check if the identified system role was successfully retrieved
                                        this.log.trace(`${LOG_PREFIX} Checking if the identified system role was successfully retrieved`);
                                        if (systemRoles.length == 1) {

                                            // The identified system role was successfully retrieved
                                            this.log.trace(`${LOG_PREFIX} The identified system role was successfully retrieved`);

                                            // Return the system role
                                            this.log.trace(`${LOG_PREFIX} Returning ${JSON.stringify(systemRoles[0])}`);
                                            observer.next(systemRoles[0]);
                                            observer.complete();

                                        } else {

                                            // The identified system role was not successfully retrieved
                                            this.log.error(`${LOG_PREFIX} ${systemRoles.length > 1 ? "The identified system role could not be uniquely retrieved" : "The identified system role could not be successfully retrieved"} `);

                                            // Return null in place of system role
                                            this.log.warn(`${LOG_PREFIX} Returning null in place of system role`);
                                            observer.next(null);
                                            observer.complete();

                                        }
                                    },

                                    error: (err: any) => {

                                        // The logged in user's rights could not be successfully retrieved
                                        this.log.error(`${LOG_PREFIX} The logged in user's rights could not be successfully retrieved`);

                                        // Return null in place of system role
                                        this.log.warn(`${LOG_PREFIX} Returning null in place of system role`);
                                        observer.next(null);
                                        observer.complete();


                                    }
                                });

                        } else {

                            // The user's role was not correctly identified within the right
                            this.log.error(`${LOG_PREFIX} The user's role was not correctly identified within the right`);

                            // Return null in place of system role
                            this.log.warn(`${LOG_PREFIX} Returning null in place of system role`);
                            observer.next(null);
                            observer.complete();


                        }

                    } else {

                        // The user's right was not successfully retrieved
                        this.log.error(`${LOG_PREFIX} The user's right was not successfully retrieved`);

                        // Return null in place of system role
                        this.log.warn(`${LOG_PREFIX} Returning null in place of system role`);
                        observer.next(null);
                        observer.complete();
                    }

                } else {

                    // The target context has not been specified
                    this.log.error(`${LOG_PREFIX} The target context has not been specified`);

                    // Return null in place of system role
                    this.log.warn(`${LOG_PREFIX} Returning null in place of system role`);
                    observer.next(null);
                    observer.complete();

                }

            } else {

                // The active user has not been initialised
                this.log.error(`${LOG_PREFIX} The active user has not been initialised`);

                // Return null in place of system role
                this.log.warn(`${LOG_PREFIX} Returning null in place of system role`);
                observer.next(null);
                observer.complete();
            }
        });




    }

}
