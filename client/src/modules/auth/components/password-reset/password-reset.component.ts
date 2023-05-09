import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SystemUser } from '@modules/systems-users/models';
import { SystemsUsersDataService } from '@modules/systems-users/services/systems-users-data.service';
import { NGXLogger } from 'ngx-logger';
import { environment } from 'environments/environment';
import { EmailsService } from '@modules/emails/services/emails.service';
import { AuthService } from '@modules/auth/services/auth.service';
import { TokensService } from '@modules/tokens/services/tokens.service';
import { Claims, TokenValidity } from '@modules/tokens/models';

const LOG_PREFIX: string = "[Password Reset Component]";

@Component({
    selector: 'sb-password-reset',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './password-reset.component.html',
    styleUrls: ['password-reset.component.scss'],
})
export class PasswordResetComponent implements OnInit {

    // Allow the parent component to inject the registration confirmation token
    @Input() public token!: string | null;

    // Keep tabs on the currently visible page (default, saving, suceeded, failed)
    public page: string = "default";

    // Keep tabs of errors and error resolution suggestions
    public error: { message: string; suggestion: string; resetable: boolean } = { message: "", suggestion: "", resetable: false };

    // Defines Systems Users reactive form controls group
    public systemsUsersForm = new FormGroup({

        password: new FormControl<string | null>('',
            [
                Validators.required,
                Validators.minLength(8),
                Validators.maxLength(250),
                this.hasNoDigit(),
                this.hasNoLowerCaseLetter(),
                this.hasNoUpperCaseLetter(),
                this.hasNoSpecialCharacter(),
            ])
    });


    constructor(
        private authService: AuthService,
        private systemsUsersDataService: SystemsUsersDataService,
        private emailService: EmailsService,
        private tokensService: TokensService,
        private router: Router,
        private cd: ChangeDetectorRef,
        private log: NGXLogger) {

    }

    ngOnInit() { }


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
     * Saves the password update
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

            // Read in the provided password
            this.log.trace(`${LOG_PREFIX} Reading in the provided password`);
            const password: string | null | undefined = this.systemsUsersForm.get('password')?.value?.trim();
            this.log.debug(`${LOG_PREFIX} System User Password = ${password}`);

            // Check if the recovery token was passed in
            this.log.trace(`${LOG_PREFIX} Checking if the recovery token was passed in`);
            if (this.token) {

                // The recovery token was passed in
                this.log.trace(`${LOG_PREFIX} The recovery token was passed in`);

                // Verify the token
                this.verifyToken(this.token, (tokenValidity: TokenValidity) => {

                    // Check if the verification marks the token as valid
                    this.log.trace(`${LOG_PREFIX} Checking if the verification marks the token as valid`);
                    if (tokenValidity.valid) {

                    // The verification marks the token as valid
                    this.log.trace(`${LOG_PREFIX} The verification marks the token as valid`);

                        // Decode the token
                        this.decodeToken(this.token as string, (claims: Claims) => {

                            // Check if the user id was included in the decoded claims
                            this.log.trace(`${LOG_PREFIX} Check if the user id was included in the decoded claims`);
                            if (claims.uid) {

                                // Retrieve the user with the given id
                                this.retrieveUser(claims.uid, (systemUser: SystemUser) => {

                                    // Update the user's password
                                    const user: SystemUser = Object.assign(systemUser, { data: Object.assign(systemUser.data, { password: environment.production ? password : window.btoa(password as string) }) });

                                    // Save the update
                                    this.updateUser(user, () => {

                                        // Load the success message display window
                                        this.log.trace(`${LOG_PREFIX} Loading the success message display window`);
                                        this.suceeded();

                                    });

                                });


                            } else {

                                // The user id was not included in the decoded claims
                                this.log.trace(`${LOG_PREFIX} The user id was not included in the decoded claims`);

                                // Load the failure message display window
                                this.log.trace(`${LOG_PREFIX} Loading the failure message display window`);
                                this.failed({
                                    message: "Your user account identifier seems to be improperly configured",
                                    suggestion: "Please contact the system administrator for assistance",
                                    resetable: false
                                });

                            }
                        });


                    } else {

                    // The verification marks the token as invalid
                    this.log.trace(`${LOG_PREFIX} The verification marks the token as invalid`);

                        // Load the failure message display window
                        this.log.trace(`${LOG_PREFIX} Loading the failure message display window`);

                        this.failed({
                            message: "Your password reset token is no longer valid",
                            suggestion: "Please request a new one",
                            resetable: true
                        });

                    }
                });

            } else {

                // The recovery token was not passed in
                this.log.trace(`${LOG_PREFIX} The recovery token was not passed in`);

                this.failed({
                    message: "Your password reset token was not successfully retrieved",
                    suggestion: "Please contact the system administrator for assistance",
                    resetable: false
                });

            }

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

    private verifyToken(token: string, callback: (tokenValidity: TokenValidity) => void) {

        // Verify the password recovery token
        this.log.trace(`${LOG_PREFIX} Verifying the password recovery token`);
        this.tokensService
            .verifyToken(token)
            .subscribe({
                next: (tokenValidity: TokenValidity) => {

                    // Password recovery token successfully verified
                    this.log.trace(`${LOG_PREFIX} Password recovery token successfully verified`);

                    callback(tokenValidity);

                },
                error: (err: Error) => {

                    // Password recovery token verification failed
                    this.log.trace(`${LOG_PREFIX} Password recovery token verification failed`);

                    // Load the failure message display window
                    this.log.trace(`${LOG_PREFIX} Loading the failure message display window`);
                    this.failed({
                        message: "Your password recovery token could not be successfully verified",
                        suggestion: "Please contact the system administrator for assistance",
                        resetable: false
                    });
                }
            });
    }


    private decodeToken(token: string, callback: (claims: Claims) => void) {

        // Decode the token
        this.log.trace(`${LOG_PREFIX} Decoding the token`);
        this.tokensService
            .decodeToken(this.token as string)
            .subscribe({
                next: (claims: Claims) => {

                    // Token successfully decoded
                    this.log.trace(`${LOG_PREFIX} Token successfully decoded`);

                    callback(claims);

                },
                error: (err: Error) => {

                    // Token decoding failed
                    this.log.trace(`${LOG_PREFIX} Token decoding failed`);

                    // Load the failure message display window
                    this.log.trace(`${LOG_PREFIX} Loading the failure message display window`);
                    this.failed({
                        message: "Your password recovery token could not be read successfully",
                        suggestion: "Please contact the system administrator for assistance",
                        resetable: false
                    });

                }
            });
    }


    private retrieveUser(uid: number, callback: (systemUser: SystemUser) => void) {

        // Retrieve the user with the given id
        this.log.trace(`${LOG_PREFIX} Retrieving the user with the given id`);
        this.systemsUsersDataService
            .getSystemsUsers(false, {
                page: null,
                pageSize: null,
                searchTerm: null,
                sortColumn: null,
                sortDirection: null,
                id: uid,
                name: null,
                email: null,
                password: null
            })
            .subscribe({
                next: (systemUsers: SystemUser[]) => {

                    if (systemUsers.length == 1) {

                        callback(systemUsers[0]);

                    } else {

                        // The user account is missing
                        this.log.trace(`${LOG_PREFIX} The user account is missing`);

                        // Load the failure message display window
                        this.log.trace(`${LOG_PREFIX} Loading the failure message display window`);
                        this.failed({
                            message: "Your user account seems to me missing",
                            suggestion: "Please contact the system administrator for assistance",
                            resetable: false
                        });

                    }

                },
                error: (err: Error) => {

                    // The user account could not be successfully retrieved
                    this.log.trace(`${LOG_PREFIX} The user account could not be successfully retrieved`);

                    // Load the failure message display window
                    this.log.trace(`${LOG_PREFIX} Loading the failure message display window`);
                    this.failed({
                        message: "Your user account could not be successfully retrieved",
                        suggestion: "Please contact the system administrator for assistance",
                        resetable: false
                    });


                }
            });
    }


    private updateUser(user: SystemUser, callback: () => void) {

        this.systemsUsersDataService
            .updateSystemUser(user)
            .subscribe({
                next: (systemUser: SystemUser) => {

                    // The user account was successfully updated
                    this.log.trace(`${LOG_PREFIX} The user account was successfully updated`);

                    callback();

                },
                error: (err: Error) => {

                    // The user account could not be successfully updated
                    this.log.trace(`${LOG_PREFIX} The user account could not be successfully updated`);

                    // Load the failure message display window
                    this.log.trace(`${LOG_PREFIX} Loading the failure message display window`);
                    this.failed({
                        message: "Your user account could not be successfully updated",
                        suggestion: "Please contact the system administrator for assistance",
                        resetable: false
                    });

                }
            })
    }

    private suceeded(): void {

        // Set the page to 'suceeded'
        this.log.trace(`${LOG_PREFIX} Setting the page to 'suceeded'`);
        this.page = "suceeded";
        this.cd.detectChanges();

    }


    private failed(error: { message: string; suggestion: string; resetable: boolean }): void {

        // Update the error message / resolution suggestion
        this.log.trace(`${LOG_PREFIX} Updating the error message / error resolution suggestion`);
        this.error = error;

        // Set the page to 'failed'
        this.log.trace(`${LOG_PREFIX} Setting the page to 'failed'`);
        this.page = "failed";
        this.cd.detectChanges();

    }

    public requestNewToken(): void {

        // Return the user to the password recovery request page
        this.log.trace(`${LOG_PREFIX} Returning the user to the password recovery request page`);
        this.router.navigate(['/auth/forgot-password']);

        // Reset the page to the default page 'default'
        this.log.trace(`${LOG_PREFIX} Resetting the page to the 'default' page`);
        this.page = "default";

        // Reset the error message
        this.log.trace(`${LOG_PREFIX} Resetting the error message`);
        this.error = { message: "", suggestion: "", resetable: false };

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
        this.error = { message: "", suggestion: "", resetable: false };


    }

    public login(): void {

        // Return the user to the login page
        this.log.trace(`${LOG_PREFIX} Returning the user to the login page`);
        this.router.navigate(['/auth/login']);

        // Reset the page to the default page 'default'
        this.log.trace(`${LOG_PREFIX} Resetting the page to the 'default' page`);
        this.page = "default";

        // Reset the error message
        this.log.trace(`${LOG_PREFIX} Resetting the error message`);
        this.error = { message: "", suggestion: "", resetable: false };


    }

}
