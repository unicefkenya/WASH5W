import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { SystemUser } from '@modules/systems-users/models/system-user.model';
import { SystemsUsersDataService } from '@modules/systems-users/services/systems-users-data.service';
import { NGXLogger } from 'ngx-logger';
import { Observable, map, of } from 'rxjs';
import { environment } from 'environments/environment';

const LOG_PREFIX: string = "[Systems Users Records Updation Component]";

@Component({
  selector: 'sb-systemsUsers-records-updation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './systems-users-records-updation.component.html',
  styleUrls: ['systems-users-records-updation.component.scss'],
})
export class SystemsUsersRecordsUpdationComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target System User record
  @Input() public id!: number;

  // Allow the parent component to set the mode of operation (self or administered)
  @Input() mode: string = "self";

  // Broadcasts successful Systems Users updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Systems Users updation events together with their error plurals
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the target System User record
  public systemUser: SystemUser | null | undefined = undefined;

  // Defines Systems Users reactive form controls group
  public systemsUsersForm = new FormGroup({

    name: new FormControl<string | null>(''),

    email: new FormControl<string | null>(''),

    password: new FormControl<string | null>(''),

    enabled: new FormControl<boolean>(false),

    confirmed: new FormControl<boolean>(false)

  });

  // Keeps tabs of whether the component has been successfully initialised
  public initialised: boolean = false;

  constructor(
    private systemsUsersDataService: SystemsUsersDataService,
    private cd: ChangeDetectorRef,
    private log: NGXLogger) {

  }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the System User field based on the passed in id
    this.initialiseSystemUser(() => {

      // Initialise the System User updation form based on the target System User
      this.initialiseSystemUserUpdationForm(() => {

        // Mark Init as complete
        this.log.trace(`${LOG_PREFIX} Init completed`);
        this.initialised = true;
        this.cd.markForCheck();

      });
    });

  }

  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }

  /**
   * Retrieves the System User with the injected id and sets it as the System User that needs to be updated
   * @param callback The function to call when done
   */
  private initialiseSystemUser(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseSystemUser()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveSystemUserRecord(this.id, (systemUser: SystemUser | null) => {

      // Set the target System User
      this.log.trace(`${LOG_PREFIX} Setting the target System User`);
      this.systemUser = systemUser;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }


  /**
   * Initialises the System User updation form
   * @param callback The function to call when done
   */
  private initialiseSystemUserUpdationForm(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseSystemUserUpdationForm()`);
    this.log.debug(`${LOG_PREFIX} Target System User Record = ${JSON.stringify(this.systemUser)}`);

    // Initialise the System User Records form fields
    this.log.trace(`${LOG_PREFIX} Initialising the System User Records form fields`);
    this.systemsUsersForm.setValue({
      name: (this.systemUser && this.systemUser.data?.name) ? this.systemUser.data.name : "",
      email: (this.systemUser && this.systemUser.data?.email) ? this.systemUser.data.email : "",
      password: (this.systemUser && this.systemUser.data?.password) ? this.systemUser.data.password : "",
      enabled: (this.systemUser && this.systemUser.data?.enabled == true) ? true : false,
      confirmed: (this.systemUser && this.systemUser.data?.confirmed == true) ? true : false,
    });

    if (this.isEditingDisabled()) {
      this.systemsUsersForm.get('name')?.disable();
      this.systemsUsersForm.get('email')?.disable();
      this.systemsUsersForm.get('password')?.disable();
    }

    // Return
    this.log.trace(`${LOG_PREFIX} Returning`);
    callback();

  }

  /**
   * Retrieves an System User record given its unique identifier synchronously
   * @param id The unique identifier of the System User
   * @param callback The function to call when done
   */
  private retrieveSystemUserRecord(id: number, callback: (systemUser: SystemUser | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveSystemUserRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the systemUser id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the systemUser id has been specified`);
    if (id) {

      // The System User id has been specified
      this.log.trace(`${LOG_PREFIX} The System User id has been specified`);
      this.log.debug(`${LOG_PREFIX} System User Id = ${JSON.stringify(id)}`);

      // Try retrieving an System User Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve an System User Record with the passed in id`);
      const systemUser: SystemUser | undefined = id ? this.systemsUsersDataService.records.find(d => d.id == id) : undefined;

      // Check if the System User Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the System User Record was successfully retrieved`);
      if (systemUser) {

        // The System User Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The System User Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} System User Record = ${JSON.stringify(this.systemUser)}`);

        // Return the System User
        this.log.warn(`${LOG_PREFIX} Returning the System User`);
        callback(systemUser);

      } else {

        // The System User Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The System User Record was not successfully retrieved`);

        // Return null
        this.log.warn(`${LOG_PREFIX} Returning null`);
        callback(null);

      }


    } else {

      // The System User id has not been specified
      this.log.error(`${LOG_PREFIX} The System User id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }

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

    if (this.systemsUsersForm.get('enabled')?.value == true) {
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

    if (this.systemsUsersForm.get('confirmed')?.value == true) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Establishes whether editing of fields is disabled by virtue of the user being in production mode and working as an admin
   * @returns 
   */
  isEditingDisabled(): boolean {
    return this.isProductionEnvironment() && this.mode == 'administered';
  }




  /**
   * Flags whether or not the field should be enabled
   * @param e Switch event
   */
  public toggleEnablement(e: any): void {

    this.log.trace(`${LOG_PREFIX} Entering toggleEnablement()`);

    // Check if the switch has been checked
    this.log.trace(`${LOG_PREFIX} Checking if the switch has been checked`);
    if (e.target.checked) {

      // The switch has been checked
      this.log.trace(`${LOG_PREFIX} The switch has been checked`);

      // Update the form
      this.log.trace(`${LOG_PREFIX} Updating the form`);
      this.systemsUsersForm.get('enabled')?.setValue(true);


    } else {

      // The switch has been unchecked
      this.log.trace(`${LOG_PREFIX} The switch has been unchecked`);

      // Update the form
      this.log.trace(`${LOG_PREFIX} Updating the form`);
      this.systemsUsersForm.get('enabled')?.setValue(false);
    }

  }



  /**
   * Flags whether or not the field should be confirmed
   * @param e Switch event
   */
  public toggleConfirmation(e: any): void {

    this.log.trace(`${LOG_PREFIX} Entering toggleConfirmation()`);

    // Check if the switch has been checked
    this.log.trace(`${LOG_PREFIX} Checking if the switch has been checked`);
    if (e.target.checked) {

      // The switch has been checked
      this.log.trace(`${LOG_PREFIX} The switch has been checked`);

      // Update the form
      this.log.trace(`${LOG_PREFIX} Updating the form`);
      this.systemsUsersForm.get('confirmed')?.setValue(true);


    } else {

      // The switch has been unchecked
      this.log.trace(`${LOG_PREFIX} The switch has been unchecked`);

      // Update the form
      this.log.trace(`${LOG_PREFIX} Updating the form`);
      this.systemsUsersForm.get('confirmed')?.setValue(false);

    }

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

                // Retrieve the System User record with the specified Email
                this.log.trace(`${LOG_PREFIX} Retrieving the System User record with the specified Email`);
                const systemUser: SystemUser | undefined = systemsUsers.find(s => s.data.email?.toLowerCase() == control.value.toLowerCase());
                this.log.trace(`${LOG_PREFIX} System User record = ${JSON.stringify(systemUser)}`);

                // Check if the System User record's identity is different from the current System User record's identity
                this.log.trace(`${LOG_PREFIX} Checking if the System User record's identity is different from the current System User record's identity`);

                if (systemUser && systemUser.id != this.id) {

                  // The System User record's identity is different from the current System User record's identity
                  this.log.trace(`${LOG_PREFIX} The System User record's identity is different from the current System User record's identity`);

                  // Mark 'Email Exists' as true
                  this.log.trace(`${LOG_PREFIX} Marking 'Email Exists' as true`);
                  return { 'exists': true };

                } else {

                  // The System User record's identity is not different from the current System User record's identity
                  this.log.trace(`${LOG_PREFIX} The System User record's identity is not different from the current System User record's identity`);

                  // Mark 'Email Exists' as false
                  this.log.trace(`${LOG_PREFIX} Marking 'Email Exists' as false`);
                  return null;
                }


              } else {

                // An System User record with the same Email was not found
                this.log.trace(`${LOG_PREFIX} An System User record with the same Email was not found`);

                // Mark 'Email exists' as false
                this.log.trace(`${LOG_PREFIX} Marking 'Email exists' as false`);
                return null;

              }
            }

            )
          )

      } else {

        // A Email value has not been provided
        this.log.trace(`${LOG_PREFIX} A Email value has not been provided`);

        // Mark 'Email Exists' as false
        this.log.trace(`${LOG_PREFIX} Marking 'Email Exists' as false`);
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

    // Check if the target System User record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target System User record was successfully initialised()`);
    if (this.systemUser) {

      // The target System User record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target System User record was successfully initialised()`);

      // Check if the data entry form is valid
      this.log.trace(`${LOG_PREFIX} Checking if the data entry form is valid`);
      if (this.systemsUsersForm.valid) {

        // The data entry form is valid
        this.log.trace(`${LOG_PREFIX} The data entry form is valid`);

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
        this.systemsUsersDataService
          .updateSystemUser(Object.assign(this.systemUser, {
            data: {
              name,
              email,
              password,
              enabled: this.isEnabled(),
              confirmed: this.isConfirmed(),
            }
          }))
          .subscribe({
            next: (response: SystemUser) => {

              // The System User Record was saved successfully
              this.log.trace(`${LOG_PREFIX} The System User Record was successfuly updated`);

              // Reset the form
              this.log.trace(`${LOG_PREFIX} Resetting the form`);
              this.systemsUsersForm.reset();

              // Emit a 'succeeded' event
              this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
              this.succeeded.emit();
            },
            error: (error: any) => {

              // The System User Record was not saved successfully
              this.log.trace(`${LOG_PREFIX} The System User Record was not successfuly updated`);

              // Emit a 'failed' event
              this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
              this.failed.emit(500);

            }
          });

      } else {

        // The data entry form is invalid
        this.log.trace(`${LOG_PREFIX} The data entry form is invalid`);

        // Run the form fields validation request to validate all fields and display the error message(s)
        this.log.trace(`${LOG_PREFIX} Running the form fields validation request to validate all fields and display the error message(s)`);
        this.validateAllFormFields(this.systemsUsersForm);

        // Emit an 'invalid' event
        this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
        this.failed.emit(400);

      }

    } else {
      // The target System User record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target System User record was not successfully initialised()`);

      // Emit an 'invalid' event
      this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
      this.failed.emit(500);

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


}
