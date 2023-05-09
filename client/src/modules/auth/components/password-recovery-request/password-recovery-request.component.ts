import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FilterService } from '@app/app-filter.service';
import { SignInResponse } from '@modules/auth/models/sign-in-response';
import { AuthService } from '@modules/auth/services/auth.service';
import { ContextsDataService } from '@modules/contexts/services/contexts-data.service';
import { EmailDispatchInfo } from '@modules/emails/models/email-dispatch-info.model';
import { PasswordRecoveryEmail } from '@modules/emails/models/password-recovery-email.model';
import { EmailsService } from '@modules/emails/services/emails.service';
import { TokensService } from '@modules/tokens/services/tokens.service';
import { VisualisationsContainersDataService } from '@modules/visualisations-containers/services/visualisations-containers-data.service';
import { NGXLogger } from 'ngx-logger';
import { timer } from 'rxjs';

const LOG_PREFIX: string = "[Login Component]";

@Component({
    selector: 'sb-password-recovery-request',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './password-recovery-request.component.html',
    styleUrls: ['password-recovery-request.component.scss'],
})
export class PasswordRecoveryRequestComponent implements OnInit {

    // Keep tabs on the currently visible page (default, sending, suceeded, failed)
    public page: string = "default";

    // Keep tabs of errors and error resolution suggestions
    public error: { message: string; suggestion: string; retryable: boolean } = { message: "", suggestion: "", retryable: false };

    // Defines Login reactive form controls group
    passwordResetRequestForm = new FormGroup({
        email: new FormControl<string>('', [Validators.required, this.validateEmail()])
    });

    constructor(
        public authService: AuthService,
        public tokensService: TokensService,
        public contextsDataService: ContextsDataService,
        public visualisationsContainersDataService: VisualisationsContainersDataService,
        public filterService: FilterService,
        public emailsService: EmailsService,
        private cd: ChangeDetectorRef,
        private router: Router,
        private route: ActivatedRoute,
        private log: NGXLogger) { }

    ngOnInit() { }


    /**
     * Sends a recovery link to the users email
     */
    public reset(): void {

        this.log.trace(`${LOG_PREFIX} Entering save()`);

        // Check if the password reset details have been fully provided
        this.log.trace(`${LOG_PREFIX} Checking if the password reset details have been fully provided`);
        if (this.passwordResetRequestForm.valid) {

            // The password reset details have been fully provided
            this.log.trace(`${LOG_PREFIX} The password reset details have been fully provided`);

            // Set the page to 'sending'
            this.log.trace(`${LOG_PREFIX} Setting the page to 'sending'`);
            this.page = "sending";
            this.cd.detectChanges();

            // Read in the provided email
            this.log.trace(`${LOG_PREFIX} Reading in the provided email`);
            const email: string | null | undefined = this.passwordResetRequestForm.get('email')?.value?.trim();
            this.log.debug(`${LOG_PREFIX} System User Email = ${email}`);

            // Get the recovery authorisation token
            this.log.trace(`${LOG_PREFIX} Getting the recovery authorisation token`);
            this.authService
                .passwordRecoveryRequest({ email: email })
                .subscribe({
                    next: (response: SignInResponse) => {

                        // The recovery authorisation token was successfully retrieved
                        this.log.trace(`${LOG_PREFIX} The recovery authorisation token was successfully retrieved`);

                        // Send the password recovery link
                        this.log.trace(`${LOG_PREFIX} Sending the password recovery link`);
                        this.emailsService.sendPasswordRecoveryEmail(new PasswordRecoveryEmail({
                            to: email,
                            token: response.token
                        })).subscribe({
                            next: (confirmation: EmailDispatchInfo) => {

                                // The password recovery link was successfully dispatched
                                this.log.trace(`${LOG_PREFIX} The password recovery link was successfully dispatched`);

                                // Load the success message display window
                                this.log.trace(`${LOG_PREFIX} Loading the success message display window`);
                                this.suceeded();

                            },
                            error: (error: any) => {

                                // The password recovery link was not successfully dispatched
                                this.log.trace(`${LOG_PREFIX} The password recovery link was not successfully dispatched`);

                                // Load the failure message display window
                                this.log.trace(`${LOG_PREFIX} Loading the failure message display window`);
                                this.failed({
                                    message: "We are sorry we cannot dispatch your account recovery email",
                                    suggestion: "Please contact the system administrator for assistance",
                                    retryable: false
                                });

                            }

                        })


                    },
                    error: (error: Error) => {

                        // The recovery authorisation token was not successfully retrieved
                        this.log.trace(`${LOG_PREFIX} The recovery authorisation token was not successfully retrieved`);

                        // Load the failure message display window
                        this.log.trace(`${LOG_PREFIX} Loading the failure message display window`);
                        switch (error.message) {

                            case "Invalid Email":
                                this.failed({
                                    message: "No user account with the given email was found",
                                    suggestion: "Please enter the email that was used to create the acount",
                                    retryable: true
                                });
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


            // The password reset details have not been fully provided
            this.log.trace(`${LOG_PREFIX} The password reset details have not been fully provided`);

            // Run the form fields validation request to validate all fields and display the error message(s)
            this.log.trace(`${LOG_PREFIX} Running the form fields validation request to validate all fields and display the error message(s)`);
            this.validateAllFormFields(this.passwordResetRequestForm);

        }
    }


    private suceeded(): void {

        // Set the page to 'suceeded'
        this.log.trace(`${LOG_PREFIX} Setting the page to 'suceeded'`);
        this.page = "suceeded";
        this.cd.detectChanges();


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

    public retry(): void {

        // Set the page to the default page 'default'
        this.log.trace(`${LOG_PREFIX} Setting the page to the 'default' page`);
        this.page = "default";

        // Reset the error message
        this.log.trace(`${LOG_PREFIX} Resetting the error message`);
        this.error = { message: "", suggestion: "", retryable: false };

        // Notify angular of the changes
        this.cd.detectChanges();

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
