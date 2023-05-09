import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { AuthService } from '@modules/auth/services/auth.service';
import { RegistrationConfirmationResponse } from '@modules/auth/models';

const LOG_PREFIX: string = "[Registration Confirmation Component]";

@Component({
    selector: 'sb-registration-confirmation',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './registration-confirmation.component.html',
    styleUrls: ['registration-confirmation.component.scss'],
})
export class RegistrationConfirmationComponent implements OnInit, AfterViewInit {

    // Allow the parent component to inject the registration confirmation token
    @Input() public token!: string | null;

    // Keep tabs on the currently visible page (confirming, confirmed, failed)
    public page: string = "confirming";

    // Keep tabs of errors and error resolution suggestions
    public error: { message: string; suggestion: string; retryable: boolean } = { message: "", suggestion: "", retryable: false };


    constructor(
        private authService: AuthService,
        private router: Router,
        private cd: ChangeDetectorRef,
        private log: NGXLogger) {

    }

    ngOnInit() { }


    ngAfterViewInit(): void {
        this.confirm();
    }


    /**
     * Confirms a user account
     */
    public confirm(): void {

        this.log.trace(`${LOG_PREFIX} Entering confirm()`);

        // Check if the confirmation token was passed in
        this.log.trace(`${LOG_PREFIX} Checking if the confirmation token was passed in`);
        if (this.token) {

            // The confirmation token was passed in
            this.log.trace(`${LOG_PREFIX} The confirmation token was passed in`);

            // Set the page to 'confirming'
            this.log.trace(`${LOG_PREFIX} Setting the page to 'confirming'`);
            this.page = "confirming";
            this.cd.detectChanges();

            // Confirm the account registration
            this.log.trace(`${LOG_PREFIX} Confirming the account registration`);
            this.authService
                .confirmAccountRegistration({ token: this.token })
                .subscribe({
                    next: (response: RegistrationConfirmationResponse) => {

                        // The account registration was successfully confirmed
                        this.log.trace(`${LOG_PREFIX} The account registration was successfully confirmed`);

                        // Load the confirmed message display window
                        this.log.trace(`${LOG_PREFIX} Loading the confirmed message display window`);
                        this.confirmed();

                    },
                    error: (error: Error) => {

                        // The account registration was not successfully confirmed
                        this.log.trace(`${LOG_PREFIX} The account registration was not successfully confirmed`);

                        // Load the failure message display window
                        this.log.trace(`${LOG_PREFIX} Loading the failure message display window`);
                        switch (error.message) {

                            case "Invalid Token":

                                this.failed({
                                    message: "Your registration confirmation token is no longer valid",
                                    suggestion: "Please contact the system administrator for assistance",
                                    retryable: false
                                });

                                break;

                            case "Invalid UID":

                                this.failed({
                                    message: "Your user account identifier seems to be improperly configured",
                                    suggestion: "Please contact the system administrator for assistance",
                                    retryable: false
                                });

                                break;

                            case "Invalid Account":

                                this.failed({
                                    message: "You user account seems to me missing",
                                    suggestion: "Please contact the system administrator for assistance",
                                    retryable: false
                                });

                                break;

                            default:

                                this.failed({
                                    message: "We are sorry we cannot successfully confirm your registration",
                                    suggestion: "Please contact the system administrator for assistance",
                                    retryable: false
                                });

                        }

                    }
                });

        } else {

            // The confirmation token was not passed in
            this.log.trace(`${LOG_PREFIX} The confirmation token was not passed in`);

            // Load the failure message display window
            this.log.trace(`${LOG_PREFIX} Loading the failure message display window`);

            this.failed({
                message: "Your registration confirmation token was not successfully retrieved",
                suggestion: "Please contact the system administrator for assistance",
                retryable: false
            });

        }

    }

    /**
     * See: https://loiane.com/2017/08/angular-reactive-forms-trigger-validation-on-submit
     * @param formGroup 
     */
    private validateAllFormFields(formGroup: FormGroup): void {

        this.log.trace(`${LOG_PREFIX} Entering validateAllFormFields()`);

        Object.keys(formGroup.controls).forEach(field => {
            const control = formGroup.get(field);
            if (control instanceof FormControl) {
                control.markAsTouched({ onlySelf: true });
            } else if (control instanceof FormGroup) {
                this.validateAllFormFields(control);
            }
        });
    }

    private confirmed(): void {

        // Set the page to 'confirmed'
        this.log.trace(`${LOG_PREFIX} Setting the page to 'confirmed'`);
        this.page = "confirmed";
        this.cd.detectChanges();

    }


    private failed(error: { message: string; suggestion: string; retryable: boolean }): void {

        // Update the error message / resolution suggestion
        this.log.trace(`${LOG_PREFIX} Updating the error message / error resolution suggestion`);
        this.error = error;

        // Set the page to 'failed'
        this.log.trace(`${LOG_PREFIX} Setting the page to 'failed'`);
        this.page = "failed";
        this.cd.detectChanges();

    }

    public quit(): void {

        // Return the user to the home page
        this.log.trace(`${LOG_PREFIX} Returning the user to the home page`);
        this.router.navigate(['/home']);

        // Reset the page to the default page 'confirming'
        this.log.trace(`${LOG_PREFIX} Resetting the page to the 'confirming' page`);
        this.page = "confirming";

        // Reset the error message
        this.log.trace(`${LOG_PREFIX} Resetting the error message`);
        this.error = { message: "", suggestion: "", retryable: false };


    }


    public login(): void {

        // Redirect the user to the login page
        this.log.trace(`${LOG_PREFIX} Redirecting the user to the login page`);
        this.router.navigate(['/auth/login']);

        // Reset the page to the default page 'confirming'
        this.log.trace(`${LOG_PREFIX} Resetting the page to the 'confirming' page`);
        this.page = "confirming";


    }

}
