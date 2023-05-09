import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { Filter, FilterService } from '@app/app-filter.service';
import { AdministrativeHierarchiesDataService } from '@modules/administrative-hierarchies/services/administrative-hierarchies-data.service';
import { AdministrativeStructuresDataService } from '@modules/administrative-structures/services/administrative-structures-data.service';
import { AdministrativeSystemsDataService } from '@modules/administrative-systems/services/administrative-systems-data.service';
import { AdministrativeUnitsTypesDataService } from '@modules/administrative-units-types/services/administrative-units-types-data.service';
import { AdministrativeUnitsDataService } from '@modules/administrative-units/services/administrative-units-data.service';
import { SignInResponse } from '@modules/auth/models/sign-in-response';
import { AuthService } from '@modules/auth/services/auth.service';
import { ContextsDataService } from '@modules/contexts/services/contexts-data.service';
import { SystemsUsersAccountsService } from '@modules/systems-users-accounts/services/systems-users-accounts.service';
import { SystemUser } from '@modules/systems-users/models/system-user.model';
import { Claims } from '@modules/tokens/models';
import { TokensService } from '@modules/tokens/services/tokens.service';
import { VisualisationContainer } from '@modules/visualisations-containers/models';
import { VisualisationsContainersDataService } from '@modules/visualisations-containers/services/visualisations-containers-data.service';
import { NGXLogger } from 'ngx-logger';
import { first, timer } from 'rxjs';

const LOG_PREFIX: string = "[Login Component]";

@Component({
    selector: 'sb-login',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './login.component.html',
    styleUrls: ['login.component.scss'],
})
export class LoginComponent implements OnInit {

    // Keep tabs on the currently visible page (default, loging-in, suceeded, failed)
    public page: string = "default";

    // Keep tabs of errors and error resolution suggestions
    public error: { message: string; suggestion: string; retryable: boolean } = { message: "", suggestion: "", retryable: false };

    // Defines Login reactive form controls group
    loginForm = new FormGroup({
        email: new FormControl<string>('', [Validators.required, this.validateEmail()]),
        password: new FormControl<string>('', [Validators.required])
    });

    public username: string | null | undefined;

    constructor(
        public authService: AuthService,
        public tokensService: TokensService,
        public administrativeUnitsTypesDataService: AdministrativeUnitsTypesDataService,
        public administrativeUnitsDataService: AdministrativeUnitsDataService,
        public administrativeSystemsDataService: AdministrativeSystemsDataService,
        public administrativeStructuresDataService: AdministrativeStructuresDataService,
        public administrativeHierarchiesDataService: AdministrativeHierarchiesDataService,
        public contextsDataService: ContextsDataService,
        public visualisationsContainersDataService: VisualisationsContainersDataService,
        public systemsUsersAccountsService: SystemsUsersAccountsService,
        public filterService: FilterService,
        private cd: ChangeDetectorRef,
        private router: Router,
        private log: NGXLogger) { }

    ngOnInit() { }

    /**
     * Returns the username of the user post login in
     */
    public getUserName(): string | null | undefined {
        return this.username;
    }


    /**
     * Logs in System User Record
     */
    public login(): void {

        this.log.trace(`${LOG_PREFIX} Entering save()`);

        // Check if the loging-in details have been fully provided
        this.log.trace(`${LOG_PREFIX} Checking if the loging-in details have been fully provided`);
        if (this.loginForm.valid) {

            // The loging-in details have been fully provided
            this.log.trace(`${LOG_PREFIX} The loging-in details have been fully provided`);

            // Set the page to 'loging-in'
            this.log.trace(`${LOG_PREFIX} Setting the page to 'loging-in'`);
            this.page = "loging-in";
            this.cd.detectChanges();

            // Read in the provided email
            this.log.trace(`${LOG_PREFIX} Reading in the provided email`);
            const email: string | null | undefined = this.loginForm.get('email')?.value?.trim();
            this.log.debug(`${LOG_PREFIX} System User Email = ${email}`);

            // Read in the provided password
            this.log.trace(`${LOG_PREFIX} Reading in the provided password`);
            const password: string | null | undefined = this.loginForm.get('password')?.value?.trim();
            this.log.debug(`${LOG_PREFIX} System User Password = ${password}`);

            // Sign in the System User
            this.log.trace(`${LOG_PREFIX} Signing in the System User`);
            this.authService
                .signIn({ username: email, password: password })
                .subscribe({
                    next: (response: SignInResponse) => {

                        // The System User was successfully signed in
                        this.log.trace(`${LOG_PREFIX} The System User was successfully signed in`);

                        // Decode the System User's claims
                        this.log.trace(`${LOG_PREFIX} Decoding the System User's claims`);
                        this.tokensService.decodeToken(response.token).subscribe({
                            next: (claims: Claims) => {

                                // System User's claims were successfully decoded
                                this.log.trace(`${LOG_PREFIX} System User's claims were successfully decoded`);

                                // Check if the user account has been confirmed
                                this.log.trace(`${LOG_PREFIX} Checking if the user account has been confirmed`);
                                if (claims.confirmed) {

                                    // The user account has been confirmed
                                    this.log.trace(`${LOG_PREFIX} The user account has been confirmed`);

                                    // Check if the user account has been enabled
                                    this.log.trace(`${LOG_PREFIX} Checking if the user account has been enabled`);
                                    if (claims.enabled) {

                                        // The user account has been enabled
                                        this.log.trace(`${LOG_PREFIX} The user account has been enabled`);


                                        // Check if the user account has been assigned rights
                                        this.log.trace(`${LOG_PREFIX} Checking if the user account has been assigned rights`);
                                        if (claims.rights && claims.rights.length >= 1) {

                                            // The user account has been assigned rights
                                            this.log.trace(`${LOG_PREFIX} The user account has been assigned rights`);

                                            // Load the succeeded message display window and initialise the account
                                            this.log.trace(`${LOG_PREFIX} Loading the succeeded message display window and initialising the account`);
                                            this.suceeded({
                                                id: claims.uid,
                                                data: {
                                                    email: claims.email,
                                                    name: claims.name,
                                                    enabled: claims.enabled,
                                                    confirmed: claims.confirmed,
                                                    rights: claims.rights
                                                },
                                                version: 1
                                            });

                                        } else {

                                            // The user account has not been assigned rights
                                            this.log.trace(`${LOG_PREFIX} The user account has not been assigned rights`);

                                            // Show rights error
                                            this.showRightsErrorPage();

                                        }

                                    } else {

                                        // The user account has not been enabled
                                        this.log.trace(`${LOG_PREFIX} The user account has not been enabled`);

                                        // Show enablement error
                                        this.showEnablementErrorPage();

                                    }


                                } else {

                                    // The user account has not been confirmed
                                    this.log.trace(`${LOG_PREFIX} The user account has not been confirmed`);

                                    // Show confirmation error
                                    this.showConfirmationErrorPage();

                                }



                            },
                            error: (error: any) => {

                                // System User's claims were not successfully decoded
                                this.log.trace(`${LOG_PREFIX} System User's claims were not successfully decoded`);

                                // Load the failure message display window
                                this.log.trace(`${LOG_PREFIX} Loading the failure message display window`);
                                this.failed({
                                    message: "We are sorry we cannot log you in at the moment",
                                    suggestion: "Please try again later or contact the system administrator for assistance",
                                    retryable: false
                                });

                            }
                        })


                    },
                    error: (error: Error) => {

                        // The System User was not successfully signed in
                        this.log.trace(`${LOG_PREFIX} The System User was not successfully signed in`);

                        // Load the failure message display window
                        this.log.trace(`${LOG_PREFIX} Loading the failure message display window`);
                        switch (error.message) {

                            case "Invalid Login Credentials":
                                this.failed({
                                    message: "Invalid login credentials",
                                    suggestion: "Please try again",
                                    retryable: true
                                });
                                break;

                            case "Rights Unassigned":

                                // The user account has not been assigned rights
                                this.log.trace(`${LOG_PREFIX} The user account has not been assigned rights`);

                                // Show rights error
                                this.showRightsErrorPage();

                                break;

                            default:
                                this.failed({
                                    message: "We are sorry we cannot log you in at the moment",
                                    suggestion: "Please try again later or contact the system administrator for assistance",
                                    retryable: false
                                });
                        }

                    }
                });
        } else {

            // The login details have not been fully provided
            this.log.trace(`${LOG_PREFIX} The login details have not been fully provided`);

            // Run the form fields validation request to validate all fields and display the error message(s)
            this.log.trace(`${LOG_PREFIX} Running the form fields validation request to validate all fields and display the error message(s)`);
            this.validateAllFormFields(this.loginForm);

        }
    }


    private suceeded(activeSystemUser: SystemUser): void {

        // Update the username
        this.username = activeSystemUser.data.name;

        // Set the page to 'suceeded'
        this.log.trace(`${LOG_PREFIX} Setting the page to 'suceeded'`);
        this.page = "suceeded";
        this.cd.detectChanges();

        // Force a little delay for the user to read the message
        this.log.trace(`${LOG_PREFIX} Forcing a little delay for the user to read the message`);
        timer(500).subscribe(x => {

            // Initialise the account
            this.log.trace(`${LOG_PREFIX} Initialising the account`);
            const filter: Filter = new Filter();

            // Add the logged in user's details to the filter
            this.log.trace(`${LOG_PREFIX} Adding the logged in user's details to the filter`);
            filter.activeSystemUser = activeSystemUser;


            // Prepare the logged in user's account
            this.log.trace(`${LOG_PREFIX} Preparing the logged in user's account`);
            this.systemsUsersAccountsService.prepareUserAccountAfterSignIn(filter, () => {

                // Update the global filter
                this.log.trace(`${LOG_PREFIX} Updating the global filter`);
                this.filterService.update(filter);

                // Load the default page
                this.log.trace(`${LOG_PREFIX} Loading the default page`);
                if (filter.activeSystemUserContextSystemRole?.data.homeId) {

                    switch (filter.activeSystemUserContextSystemRole.data.homeId) {
                        case 2:
                            this.showReportsPage();
                            break;
                        default:
                            this.showDefaultDashboardPage()
                    }

                } else {
                    this.showDefaultDashboardPage();
                }
            })

        })




    }


    private failed(error: { message: string; suggestion: string; retryable: boolean }): void {

        // Update the error message / resolution suggestion
        this.log.trace(`${LOG_PREFIX} Updating the error message / error resolution suggestion`);
        this.error = error;

        // Check if a retry is possible
        this.log.trace(`${LOG_PREFIX} Checking if a retry is possible`);
        if (error.retryable) {

            // A retry is possible
            this.log.trace(`${LOG_PREFIX} A retry is possible`);

            // Set the page to default
            this.log.trace(`${LOG_PREFIX} Set the page to default`);
            this.page = "default";
            this.cd.detectChanges();

            // Force a little delay for the user to read the message
            this.log.trace(`${LOG_PREFIX} Forcing a little delay for the user to read the message`);
            timer(5000).subscribe(x => {

                // Reset the error message
                this.log.trace(`${LOG_PREFIX} Resetting the error message`);
                this.error = { message: "", suggestion: "", retryable: false };
                this.cd.detectChanges();

            });

        } else {

            // Set the page to failed
            this.log.trace(`${LOG_PREFIX} Set the page to failed`);
            this.page = "failed";
            this.cd.detectChanges();

        }



    }


    public getDefaultVisualisationContainer(callback: (container: VisualisationContainer | null) => void): void {

        // Retrieve the Visualisations Containers records corresponding to the passed in state
        this.log.trace(`${LOG_PREFIX} Retrieving the Visualisations Containers records corresponding to the passed in state`);
        this.visualisationsContainersDataService
            .getVisualisationsContainers(false, {
                page: null,
                pageSize: null,
                searchTerm: null,
                sortColumn: 'id',
                sortDirection: 'asc',
                id: null,
                contextId: this.filterService.filter.activeContext?.id,
                typesIds: [2], // Pages
                parentId: null,
                navTitle: null,
                pageTitle: null
            })
            .pipe(first())
            .subscribe({
                next: (pages: VisualisationContainer[]) => {

                    // Visualisations Containers records retrieved
                    this.log.trace(`${LOG_PREFIX} Visualisations Containers records retrieved`);
                    this.log.debug(`${LOG_PREFIX} Visualisations Containers records = ${JSON.stringify(pages)}`);

                    if (pages.length > 0) {
                        callback(pages[0]);
                    } else {
                        callback(null)
                    }
                }
            });

    }


    public quit(): void {

        // Return the user to the home page
        this.log.trace(`${LOG_PREFIX} Returning the user to the home page`);
        this.router.navigate(['/home']);

        // Reset the page to the default page 'default'
        this.log.trace(`${LOG_PREFIX} Resetting the page to the 'default' page`);
        this.page = "default";

        // Reset the error message
        this.log.trace(`${LOG_PREFIX} Resetting the error message`);
        this.error = { message: "", suggestion: "", retryable: false };


    }

    public showConfirmationErrorPage(): void {

        // Show the unconfirmed account error page
        this.log.trace(`${LOG_PREFIX} Showing the unconfirmed account error page`);
        this.router.navigate(['/error/403/confirmation']);

    }

    public showEnablementErrorPage(): void {

        // Show the unenabled account error page
        this.log.trace(`${LOG_PREFIX} Showing the unenabled account error page`);
        this.router.navigate(['/error/403/enablement']);

    }

    public showRightsErrorPage(): void {

        // Show the missing rights error page
        this.log.trace(`${LOG_PREFIX} Showing the missing rights error page`);
        this.router.navigate(['/error/403/rights']);

    }


    public showSystemErrorPage(): void {

        // Show the system error page
        this.log.trace(`${LOG_PREFIX} Showing the system error page`);
        this.router.navigate(['/error/500']);

    }

    private showDefaultDashboardPage(): void {

        // Set the default visualisation container if not set
        this.getDefaultVisualisationContainer((container: VisualisationContainer | null) => {

            if (container) {
                this.router.navigate([`/contents/dashboards/${this.filterService.filter.activeContext?.id}/${container.id}`, { outlets: { content: [] } }]);
            } else {
                this.router.navigate([`/contents/dashboards/${this.filterService.filter.activeContext?.id}/${-1}`, { outlets: { content: [] } }]);
            }

        });
    }


    public showReportsPage(): void {

        // Show the reports error page
        this.log.trace(`${LOG_PREFIX} Showing the reports page`);
        this.router.navigate(['/contents/data_forms_responses']);

    }

    /**
     * Internal validator that checks whether a proposed email is syntactically valid
     * @returns 
     */    
    private validateEmail(): ValidatorFn {

        this.log.trace(`${LOG_PREFIX} Entering validateEmail()`);
    
        return (control: AbstractControl): ValidationErrors | null => {
    
            // Check if an email value has been provided
            this.log.trace(`${LOG_PREFIX} Check if an email value has been provided`);
            if (control.value) {
    
                // An email value has been provided
                this.log.trace(`${LOG_PREFIX} An email value has been provided`);
    
                // Check if the email is in a valid format
                this.log.trace(`${LOG_PREFIX} Checking if the email is in a valid format`);
                const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
                if (emailRegex.test(control.value)) {
    
                    // The email is in a valid format
                    this.log.trace(`${LOG_PREFIX} The email is in a valid format`);
    
                    return null;
    
                } else {
    
                    // The email is not in a valid format
                    this.log.trace(`${LOG_PREFIX} The email is not in a valid format`);
    
                    // Mark email as invalid
                    this.log.trace(`${LOG_PREFIX} Marking email as invalid`);
                    return { 'email': true };
    
                }
    
            } else {
    
                // An email value has not been provided
                this.log.trace(`${LOG_PREFIX} An email value has not been provided`);
    
                return null;
            }
    
        };
    
    }    




    /**
     * See: https://loiane.com/2017/08/angular-reactive-forms-trigger-validation-on-submit
     * @param formGroup 
     */
    private validateAllFormFields(formGroup: FormGroup): void {

        Object.keys(formGroup.controls).forEach(field => {
            const control = formGroup.get(field);
            if (control instanceof FormControl) {
                control.markAsTouched({ onlySelf: true });
            } else if (control instanceof FormGroup) {
                this.validateAllFormFields(control);
            }
        });
    }


}