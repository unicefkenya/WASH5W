import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SystemUser } from '@modules/systems-users/models';
import { SystemsUsersDataService } from '@modules/systems-users/services/systems-users-data.service';
import { NGXLogger } from 'ngx-logger';
import { Observable, map, of, timer } from 'rxjs';
import { environment } from 'environments/environment';
import { EmailsService } from '@modules/emails/services/emails.service';
import { AuthService } from '@modules/auth/services/auth.service';
import { SignUpResponse } from '@modules/auth/models/sign-up-response';
import { EmailDispatchInfo, RegistrationConfirmationEmail } from '@modules/emails/models';

const LOG_PREFIX: string = "[Registration Component]";

@Component({
    selector: 'sb-registration',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './registration.component.html',
    styleUrls: ['registration.component.scss'],
})
export class RegistrationComponent implements OnInit {

    // Keep tabs on the currently visible page (default, saving, suceeded, failed)
    public page: string = "default";

    // Keep tabs of errors and error resolution suggestions
    public error: { message: string; suggestion: string; retryable: boolean } = { message: "", suggestion: "", retryable: false };

    // Defines Systems Users reactive form controls group
    public systemsUsersForm = new FormGroup({

        name: new FormControl<string | null>('',
            [
                Validators.required,
                Validators.minLength(2),
                Validators.maxLength(250)
            ]),

        email: new FormControl<string | null>('',
            [
                Validators.required,
                Validators.maxLength(320),
                this.validateEmail()],
            [this.emailExists()]),

        password: new FormControl<string | null>('',
            [
                Validators.required,
                Validators.minLength(8),
                Validators.maxLength(250),
                this.hasNoDigit(),
                this.hasNoLowerCaseLetter(),
                this.hasNoUpperCaseLetter(),
                this.hasNoSpecialCharacter(),
            ]),

        enabled: new FormControl<boolean>(false),

        confirmed: new FormControl<boolean>(false)

    });


    constructor(
        private authService: AuthService,
        private systemsUsersDataService: SystemsUsersDataService,
        private emailService: EmailsService,
        private router: Router,
        private cd: ChangeDetectorRef,
        private log: NGXLogger) {

    }

    ngOnInit() { }


    public isProductionEnvironment(): boolean {
        return (environment.production);
    }

    public isDevelopmentEnvironment(): boolean {
        return !(environment.production);
    }

    /**
     *Establishes whether the field is enabled
     * @returns True or False
     */
    public isEnabled(): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isEnabled()`);

        if (this.systemsUsersForm.get('enabled')?.value) {
            return true;
        } else {
            return false;
        }

    }

    /**
     * Establishes whether the field should be confirmed
     * @returns True or False
     */
    public isConfirmed(): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isConfirmed()`);

        if (this.systemsUsersForm.get('confirmed')?.value) {
            return true;
        } else {
            return false;
        }

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
     * Internal validator that checks whether a proposed System User's Email already exists
     * @returns 
     */
    private emailExists(): AsyncValidatorFn {

        this.log.trace(`${LOG_PREFIX} Entering emailExists()`);

        return (control: AbstractControl): Observable<ValidationErrors | null> => {

            // Check if an Email value has been provided
            this.log.trace(`${LOG_PREFIX} Check if an Email value has been provided`);
            if (control.value) {

                // A Email value has been provided
                this.log.trace(`${LOG_PREFIX} A Email value has been provided`);

                // Attempt retrieving Systems Users with the same Email
                this.log.trace(`${LOG_PREFIX} Attempting to retrieve Systems Users with the same Email`);
                return this.systemsUsersDataService
                    .getSystemsUsers(false, {
                        page: null,
                        pageSize: null,
                        searchTerm: null,
                        sortColumn: null,
                        sortDirection: null,
                        id: null,
                        name: null,
                        email: control.value.trim(),
                        password: null
                    })
                    .pipe(
                        map((systemsUsers: SystemUser[]) => {

                            // Check if an System User record with the same Email was found
                            this.log.trace(`${LOG_PREFIX} Checking if an System User record with the same Email was found`);
                            if (systemsUsers.length > 0) {

                                // An System User record with the same Email was found
                                this.log.trace(`${LOG_PREFIX} An System User record with the same Email was found`);

                                // Mark 'Email Exists' as true
                                this.log.trace(`${LOG_PREFIX} Marking 'Email Exists' as true`);
                                return { 'exists': true };

                            } else {

                                // An System User record with the same Email was not found
                                this.log.trace(`${LOG_PREFIX} An System User record with the same Email was not found`);

                                // Mark 'Email Exists' as false
                                this.log.trace(`${LOG_PREFIX} Marking 'Email Exists' as false`);
                                return null;

                            }
                        }

                        )
                    )

            } else {

                // A Email value has not been provided
                this.log.trace(`${LOG_PREFIX} A Email value has not been provided`);

                // Mark the 'Email Exists' check as irrelevant
                this.log.trace(`${LOG_PREFIX} Marking the 'Email Exists' check as irrelevant`);
                return of(null);
            }

        };

    }


    /**
     * Internal validator that checks whether a proposed password has no Digit
     * @returns 
     */
    private hasNoDigit(): ValidatorFn {

        this.log.trace(`${LOG_PREFIX} Entering hasNoDigit()`);

        return (control: AbstractControl): ValidationErrors | null => {

            // Check if a password value has been provided
            this.log.trace(`${LOG_PREFIX} Check if a password value has been provided`);
            if (control.value) {

                // A password value has been provided
                this.log.trace(`${LOG_PREFIX} A password value has been provided`);

                // Check if the password contains a digit
                this.log.trace(`${LOG_PREFIX} Checking if the password contains a digit`);
                if (/\d/.test(control.value)) {

                    // The password contains a digit
                    this.log.trace(`${LOG_PREFIX} The password contains a digit`);

                    // Mark 'Has No Digit' as false
                    this.log.trace(`${LOG_PREFIX} Marking 'Has No Digit' as false`);
                    return null;

                } else {

                    // The password does not contain a digit
                    this.log.trace(`${LOG_PREFIX} The password does not contain a digit`);

                    // Mark 'Has No Digit' as true
                    this.log.trace(`${LOG_PREFIX} Marking 'Has No Digit' as true`);
                    return { 'hasNoDigit': true };

                }

            } else {

                // A password value has not been provided
                this.log.trace(`${LOG_PREFIX} A password value has not been provided`);

                // Mark the 'Has Digit' check as irrelevant
                this.log.trace(`${LOG_PREFIX} Marking the 'Has Digit' check as irrelevant`);
                return null;
            }

        };

    }



    /**
     * Internal validator that checks whether a proposed password has no Lower Case Letter
     * @returns 
     */
    private hasNoLowerCaseLetter(): ValidatorFn {

        this.log.trace(`${LOG_PREFIX} Entering hasNoLowerCaseLetter()`);

        return (control: AbstractControl): ValidationErrors | null => {

            // Check if a password value has been provided
            this.log.trace(`${LOG_PREFIX} Check if a password value has been provided`);
            if (control.value) {

                // A password value has been provided
                this.log.trace(`${LOG_PREFIX} A password value has been provided`);

                // Check if the password contains a Lower Case Letter
                this.log.trace(`${LOG_PREFIX} Checking if the password contains a Lower Case Letter`);
                if (/[a-z]/.test(control.value)) {

                    // The password contains a Lower Case Letter
                    this.log.trace(`${LOG_PREFIX} The password contains a Lower Case Letter`);

                    // Mark 'Has No Lower Case Letter' as false
                    this.log.trace(`${LOG_PREFIX} Marking 'Has No Lower Case Letter' as false`);
                    return null;

                } else {

                    // The password does not contain a Lower Case Letter
                    this.log.trace(`${LOG_PREFIX} The password does not contain a Lower Case Letter`);

                    // Mark 'Has No Lower Case Letter' as true
                    this.log.trace(`${LOG_PREFIX} Marking 'Has No Lower Case Letter' as true`);
                    return { 'hasNoLowerCaseLetter': true };

                }

            } else {

                // A password value has not been provided
                this.log.trace(`${LOG_PREFIX} A password value has not been provided`);

                // Mark the 'Has Lower Case Letter' check as irrelevant
                this.log.trace(`${LOG_PREFIX} Marking the 'Has Lower Case Letter' check as irrelevant`);
                return null;
            }

        };

    }

    /**
     * Internal validator that checks whether a proposed password has no Upper Case Letter
     * @returns 
     */
    private hasNoUpperCaseLetter(): ValidatorFn {

        this.log.trace(`${LOG_PREFIX} Entering hasNoUpperCaseLetter()`);

        return (control: AbstractControl): ValidationErrors | null => {

            // Check if a password value has been provided
            this.log.trace(`${LOG_PREFIX} Check if a password value has been provided`);
            if (control.value) {

                // A password value has been provided
                this.log.trace(`${LOG_PREFIX} A password value has been provided`);

                // Check if the password contains a Upper Case Letter
                this.log.trace(`${LOG_PREFIX} Checking if the password contains a Upper Case Letter`);
                if (/[A-Z]/.test(control.value)) {

                    // The password contains a Upper Case Letter
                    this.log.trace(`${LOG_PREFIX} The password contains a Upper Case Letter`);

                    // Mark 'Has No Upper Case Letter' as false
                    this.log.trace(`${LOG_PREFIX} Marking 'Has No Upper Case Letter' as false`);
                    return null;

                } else {

                    // The password does not contain a Upper Case Letter
                    this.log.trace(`${LOG_PREFIX} The password does not contain a Upper Case Letter`);

                    // Mark 'Has No Upper Case Letter' as true
                    this.log.trace(`${LOG_PREFIX} Marking 'Has No Upper Case Letter' as true`);
                    return { 'hasNoUpperCaseLetter': true };

                }

            } else {

                // A password value has not been provided
                this.log.trace(`${LOG_PREFIX} A password value has not been provided`);

                // Mark the 'Has Upper Case Letter' check as irrelevant
                this.log.trace(`${LOG_PREFIX} Marking the 'Has Upper Case Letter' check as irrelevant`);
                return null;
            }

        };

    }


    /**
     * Internal validator that checks whether a proposed password has no Special Character
     * @returns 
     */
    private hasNoSpecialCharacter(): ValidatorFn {

        this.log.trace(`${LOG_PREFIX} Entering hasNoSpecialCharacter()`);

        return (control: AbstractControl): ValidationErrors | null => {

            // Check if a password value has been provided
            this.log.trace(`${LOG_PREFIX} Check if a password value has been provided`);
            if (control.value) {

                // A password value has been provided
                this.log.trace(`${LOG_PREFIX} A password value has been provided`);

                // Check if the password contains a Special Character
                this.log.trace(`${LOG_PREFIX} Checking if the password contains a Special Character`);
                if (/[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(control.value)) {

                    // The password contains a Special Character
                    this.log.trace(`${LOG_PREFIX} The password contains a Special Character`);

                    // Mark 'Has No Special Character' as false
                    this.log.trace(`${LOG_PREFIX} Marking 'Has No Special Character' as false`);
                    return null;

                } else {

                    // The password does not contain a Special Character
                    this.log.trace(`${LOG_PREFIX} The password does not contain a Special Character`);

                    // Mark 'Has No Special Character' as true
                    this.log.trace(`${LOG_PREFIX} Marking 'Has No Special Character' as true`);
                    return { 'hasNoSpecialCharacter': true };

                }

            } else {

                // A password value has not been provided
                this.log.trace(`${LOG_PREFIX} A password value has not been provided`);

                // Mark the 'Has Special Character' check as irrelevant
                this.log.trace(`${LOG_PREFIX} Marking the 'Has Special Character' check as irrelevant`);
                return null;
            }

        };

    }

    /**
     * Validates and saves a new System User Record.
     * Emits a succeeded or failed event depending on whether the save request succeeded or failed respectively
     * Error 400 = Indicates that a user error was encountered
     * Error 500 = Indicates that a system error was encountered
     */
    public save(): void {

        this.log.trace(`${LOG_PREFIX} Entering save()`);

        // Check if the data entry form is valid
        this.log.trace(`${LOG_PREFIX} Checking if the data entry form is valid`);
        if (this.systemsUsersForm.valid) {

            // The data entry form is valid
            this.log.trace(`${LOG_PREFIX} The data entry form is valid`);

            // Set the page to 'saving'
            this.log.trace(`${LOG_PREFIX} Setting the page to 'saving'`);
            this.page = "saving";
            this.cd.detectChanges();

            // Read in the provided name
            this.log.trace(`${LOG_PREFIX} Reading in the provided name`);
            const name: string | null | undefined = this.systemsUsersForm.get('name')?.value?.trim();
            this.log.debug(`${LOG_PREFIX} System User Name = ${name}`);

            // Read in the provided email
            this.log.trace(`${LOG_PREFIX} Reading in the provided email`);
            const email: string | null | undefined = this.systemsUsersForm.get('email')?.value?.trim();
            this.log.debug(`${LOG_PREFIX} System User Email = ${email}`);

            // Read in the provided password
            this.log.trace(`${LOG_PREFIX} Reading in the provided password`);
            const password: string | null | undefined = this.systemsUsersForm.get('password')?.value?.trim();
            this.log.debug(`${LOG_PREFIX} System User Password = ${password}`);

            // Save the record
            this.log.trace(`${LOG_PREFIX} Saving the System User Record`);
            this.authService
                .signUp({ name, email, password })
                .subscribe({
                    next: (response: SignUpResponse) => {

                        // The System User Record was saved successfully
                        this.log.trace(`${LOG_PREFIX} System User Record was saved successfuly`);


                        // Dispatch the registration confirmation email
                        this.log.trace(`${LOG_PREFIX} Dispatching the registration confirmation email`);
                        this.emailService.sendRegistrationConfirmationEmail(new RegistrationConfirmationEmail({
                            to: email,
                            token: response.token
                        })).subscribe({
                            next: (confirmation: EmailDispatchInfo) => {

                                // The email was successfully dispatched
                                this.log.trace(`${LOG_PREFIX} The email was successfully dispatched`);

                                // Load the success message display window
                                this.log.trace(`${LOG_PREFIX} Loading the success message display window`);
                                this.suceeded();

                            },
                            error: (error: any) => {

                                // The email was not successfully dispatched
                                this.log.trace(`${LOG_PREFIX} The email was not successfully dispatched`);

                                // Load the failure message display window
                                this.log.trace(`${LOG_PREFIX} Loading the failure message display window`);
                                this.failed({
                                    message: "We are sorry we cannot dispatch your account confirmation email",
                                    suggestion: "Please contact the system administrator for assistance",
                                    retryable: false
                                });

                            }

                        })

                    },
                    error: (error: any) => {

                        // The System User Record was not saved successfully
                        this.log.error(`${LOG_PREFIX} System User Record was not saved successfuly`);

                        // Load the failure message display window
                        this.log.trace(`${LOG_PREFIX} Loading the failure message display window`);
                        this.failed({
                            message: "We are sorry we cannot successfully register your account at the moment",
                            suggestion: "Please try again later or contact the system administrator for assistance",
                            retryable: true
                        });


                    }
                });
        } else {

            // The data entry form is invalid
            this.log.trace(`${LOG_PREFIX} The data entry form is invalid`);

            // Run the form fields validation request to validate all fields and display the error message(s)
            this.log.trace(`${LOG_PREFIX} Running the form fields validation request to validate all fields and display the error message(s)`);
            this.validateAllFormFields(this.systemsUsersForm);

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

        // Set the page to 'failed'
        this.log.trace(`${LOG_PREFIX} Setting the page to 'failed'`);
        this.page = "failed";
        this.cd.detectChanges();

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

}
