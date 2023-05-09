import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { SystemRole } from '@modules/systems-roles/models/system-role.model';
import { SystemsRolesDataService } from '@modules/systems-roles/services/systems-roles-data.service';
import { NGXLogger } from 'ngx-logger';
import { Observable, map, of } from 'rxjs';
import { environment } from 'environments/environment';

const LOG_PREFIX: string = "[Systems Roles Records Updation Component]";

@Component({
  selector: 'sb-systemsRoles-records-updation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './systems-roles-records-updation.component.html',
  styleUrls: ['systems-roles-records-updation.component.scss'],
})
export class SystemsRolesRecordsUpdationComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target System Role record
  @Input() public id!: number;

  // Broadcasts successful Systems Roles updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Systems Roles updation events together with their error plurals
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the target System Role record
  public systemRole: SystemRole | null | undefined = undefined;

  // Defines Systems Roles reactive form controls group
  public systemsRolesForm = new FormGroup({

    code: new FormControl<string | null>('',
      [Validators.required, Validators.minLength(2), Validators.maxLength(250)],
      [this.codeExists()]),

    name: new FormControl<string | null>('',
      [Validators.required, Validators.minLength(2), Validators.maxLength(250)],
      [this.nameExists()]),

    description: new FormControl<string | null>('',
      [Validators.maxLength(500)]),

    homeId: new FormControl<number>(1,
      [Validators.required]),

    customisable: new FormControl<boolean>(true)

  });



  constructor(
    private systemsRolesDataService: SystemsRolesDataService,
    private log: NGXLogger) {

  }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the System Role field based on the passed in id
    this.initialiseSystemRole(() => {

      // Initialise the System Role updation form based on the target System Role
      this.initialiseSystemRoleUpdationForm(() => {

        // Mark Init as complete
        this.log.trace(`${LOG_PREFIX} Init completed`);

      });
    });

  }

  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }

  /**
   * Retrieves the System Role with the injected id and sets it as the System Role that needs to be updated
   * @param callback The function to call when done
   */
  private initialiseSystemRole(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseSystemRole()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveSystemRoleRecord(this.id, (systemRole: SystemRole | null) => {

      // Set the target System Role
      this.log.trace(`${LOG_PREFIX} Setting the target System Role`);
      this.systemRole = systemRole;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }


  /**
   * Initialises the System Role updation form
   * @param callback The function to call when done
   */
  private initialiseSystemRoleUpdationForm(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseSystemRoleUpdationForm()`);
    this.log.debug(`${LOG_PREFIX} Target System Role Record = ${JSON.stringify(this.systemRole)}`);

    // Initialise the System Role Records form fields
    this.log.trace(`${LOG_PREFIX} Initialising the System Role Records form fields`);
    this.systemsRolesForm.setValue({
      code: (this.systemRole && this.systemRole.data?.code) ? this.systemRole.data.code : "",
      name: (this.systemRole && this.systemRole.data?.name) ? this.systemRole.data.name : "",
      description: (this.systemRole && this.systemRole.data?.description) ? this.systemRole.data.description : "",
      homeId: (this.systemRole && this.systemRole.data?.homeId) ? this.systemRole.data.homeId : null,
      customisable: (this.systemRole && this.systemRole.data?.customisable) ? this.systemRole.data.customisable : false
    });

    // Return
    this.log.trace(`${LOG_PREFIX} Returning`);
    callback();

  }

  /**
   * Retrieves an System Role record given its unique identifier synchronously
   * @param id The unique identifier of the System Role
   * @param callback The function to call when done
   */
  private retrieveSystemRoleRecord(id: number, callback: (systemRole: SystemRole | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveSystemRoleRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the systemRole id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the systemRole id has been specified`);
    if (id) {

      // The System Role id has been specified
      this.log.trace(`${LOG_PREFIX} The System Role id has been specified`);
      this.log.debug(`${LOG_PREFIX} System Role Id = ${JSON.stringify(id)}`);

      // Try retrieving an System Role Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve an System Role Record with the passed in id`);
      const systemRole: SystemRole | undefined = id ? this.systemsRolesDataService.records.find(d => d.id == id) : undefined;

      // Check if the System Role Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the System Role Record was successfully retrieved`);
      if (systemRole) {

        // The System Role Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The System Role Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} System Role Record = ${JSON.stringify(this.systemRole)}`);

        // Return the System Role
        this.log.warn(`${LOG_PREFIX} Returning the System Role`);
        callback(systemRole);

      } else {

        // The System Role Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The System Role Record was not successfully retrieved`);

        // Return null
        this.log.warn(`${LOG_PREFIX} Returning null`);
        callback(null);

      }


    } else {

      // The System Role id has not been specified
      this.log.error(`${LOG_PREFIX} The System Role id has not been specified`);

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
   * Establishes whether the field should be customisable
   * @returns True or False
   */
  public isCustomisable(): boolean {

    this.log.trace(`${LOG_PREFIX} Entering isCustomisable()`);

    if (this.systemsRolesForm.get('customisable')?.value) {
      return true;
    } else {
      return false;
    }

  }


  /**
   * Flags whether or not the field should be customisable
   * @param e Switch event
   */
  public toggleCustomisability(e: any): void {

    this.log.trace(`${LOG_PREFIX} Entering toggleCustomisability()`);

    // Check if the switch has been checked
    this.log.trace(`${LOG_PREFIX} Checking if the switch has been checked`);
    if (e.target.checked) {

      // The switch has been checked
      this.log.trace(`${LOG_PREFIX} The switch has been checked`);

      // Update the form
      this.log.trace(`${LOG_PREFIX} Updating the form`);
      this.systemsRolesForm.get('customisable')?.setValue(true);


    } else {

      // The switch has been unchecked
      this.log.trace(`${LOG_PREFIX} The switch has been unchecked`);

      // Update the form
      this.log.trace(`${LOG_PREFIX} Updating the form`);
      this.systemsRolesForm.get('customisable')?.setValue(false);

    }

  }


  /**
   * Internal validator that checks whether a proposed System Role's Code already exists
   * @returns 
   */
  private codeExists(): AsyncValidatorFn {

    this.log.trace(`${LOG_PREFIX} Entering codeExists()`);

    return (control: AbstractControl): Observable<ValidationErrors | null> => {

      // Check if a Code value has been provided
      this.log.trace(`${LOG_PREFIX} Check if a Code value has been provided`);
      if (control.value) {

        // A Code value has been provided
        this.log.trace(`${LOG_PREFIX} A Code value has been provided`);

        // Attempt retrieving Systems Roles with the same Code
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve Systems Roles with the same Code`);
        return this.systemsRolesDataService
          .getSystemsRoles(false, {
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            ids: null,
            code: control.value.trim(),
            name: null
          })
          .pipe(
            map((systemsRoles: SystemRole[]) => {

              // Check if an System Role record with the same Code was found
              this.log.trace(`${LOG_PREFIX} Checking if an System Role record with the same Code was found`);

              if (systemsRoles.length > 0) {

                // An System Role record with the same Code was found
                this.log.trace(`${LOG_PREFIX} An System Role record with the same Code was found`);

                // Retrieve the System Role record with the specified Code
                this.log.trace(`${LOG_PREFIX} Retrieving the System Role record with the specified Code`);
                const systemRole: SystemRole | undefined = systemsRoles.find(s => s.data.code?.toLowerCase() == control.value.toLowerCase());
                this.log.trace(`${LOG_PREFIX} System Role record = ${JSON.stringify(systemRole)}`);

                // Check if the System Role record's identity is different from the current System Role record's identity
                this.log.trace(`${LOG_PREFIX} Checking if the System Role record's identity is different from the current System Role record's identity`);

                if (systemRole && systemRole.id != this.id) {

                  // The System Role record's identity is different from the current System Role record's identity
                  this.log.trace(`${LOG_PREFIX} The System Role record's identity is different from the current System Role record's identity`);

                  // Mark 'Code Exists' as true
                  this.log.trace(`${LOG_PREFIX} Marking 'Code Exists' as true`);
                  return { 'exists': true };

                } else {

                  // The System Role record's identity is not different from the current System Role record's identity
                  this.log.trace(`${LOG_PREFIX} The System Role record's identity is not different from the current System Role record's identity`);

                  // Mark 'Code Exists' as false
                  this.log.trace(`${LOG_PREFIX} Marking 'Code Exists' as false`);
                  return null;
                }


              } else {

                // An System Role record with the same Code was not found
                this.log.trace(`${LOG_PREFIX} An System Role record with the same Code was not found`);

                // Mark 'Code exists' as false
                this.log.trace(`${LOG_PREFIX} Marking 'Code exists' as false`);
                return null;

              }
            }

            )
          )

      } else {

        // A Code value has not been provided
        this.log.trace(`${LOG_PREFIX} A Code value has not been provided`);

        // Mark 'Code Exists' as false
        this.log.trace(`${LOG_PREFIX} Marking 'Code Exists' as false`);
        return of(null);
      }

    };

  }


  /**
   * Internal validator that checks whether a proposed System Role's Name already exists
   * @returns 
   */
  private nameExists(): AsyncValidatorFn {

    this.log.trace(`${LOG_PREFIX} Entering nameExists()`);

    return (control: AbstractControl): Observable<ValidationErrors | null> => {

      // Check if a Name value has been provided
      this.log.trace(`${LOG_PREFIX} Check if a Name value has been provided`);
      if (control.value) {

        // A Name value has been provided
        this.log.trace(`${LOG_PREFIX} A Name value has been provided`);

        // Attempt retrieving Systems Roles with the same Name
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve Systems Roles with the same Name`);
        return this.systemsRolesDataService
          .getSystemsRoles(false, {
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            ids: null,
            code: null,
            name: control.value.trim()
          })
          .pipe(
            map((systemsRoles: SystemRole[]) => {

              // Check if an System Role record with the same Name was found
              this.log.trace(`${LOG_PREFIX} Checking if an System Role record with the same Name was found`);

              if (systemsRoles.length > 0) {

                // An System Role record with the same Name was found
                this.log.trace(`${LOG_PREFIX} An System Role record with the same Name was found`);

                // Retrieve the System Role record with the specified Name
                this.log.trace(`${LOG_PREFIX} Retrieving the System Role record with the specified Name`);
                const systemRole: SystemRole | undefined = systemsRoles.find(s => s.data.name?.toLowerCase() == control.value.toLowerCase());
                this.log.trace(`${LOG_PREFIX} System Role record = ${JSON.stringify(systemRole)}`);

                // Check if the System Role record's identity is different from the current System Role record's identity
                this.log.trace(`${LOG_PREFIX} Checking if the System Role record's identity is different from the current System Role record's identity`);

                if (systemRole && systemRole.id != this.id) {

                  // The System Role record's identity is different from the current System Role record's identity
                  this.log.trace(`${LOG_PREFIX} The System Role record's identity is different from the current System Role record's identity`);

                  // Mark 'Name Exists' as true
                  this.log.trace(`${LOG_PREFIX} Marking 'Name Exists' as true`);
                  return { 'exists': true };

                } else {

                  // The System Role record's identity is not different from the current System Role record's identity
                  this.log.trace(`${LOG_PREFIX} The System Role record's identity is not different from the current System Role record's identity`);

                  // Mark 'Name Exists' as false
                  this.log.trace(`${LOG_PREFIX} Marking 'Name Exists' as false`);
                  return null;
                }


              } else {

                // An System Role record with the same Name was not found
                this.log.trace(`${LOG_PREFIX} An System Role record with the same Name was not found`);

                // Mark 'Name exists' as false
                this.log.trace(`${LOG_PREFIX} Marking 'Name exists' as false`);
                return null;

              }
            }

            )
          )

      } else {

        // A Name value has not been provided
        this.log.trace(`${LOG_PREFIX} A Name value has not been provided`);

        // Mark 'Name Exists' as false
        this.log.trace(`${LOG_PREFIX} Marking 'Name Exists' as false`);
        return of(null);
      }

    };

  }

  /**
   * Validates and saves a new System Role Record.
   * Emits a succeeded or failed event depending on whether the save request succeeded or failed respectively
   * Error 400 = Indicates that a user error was encountered
   * Error 500 = Indicates that a system error was encountered
   */
  public save(): void {

    this.log.trace(`${LOG_PREFIX} Entering save()`);

    // Check if the target System Role record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target System Role record was successfully initialised()`);
    if (this.systemRole) {

      // The target System Role record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target System Role record was successfully initialised()`);

      // Check if the data entry form is valid
      this.log.trace(`${LOG_PREFIX} Checking if the data entry form is valid`);
      if (this.systemsRolesForm.valid) {

        // The data entry form is valid
        this.log.trace(`${LOG_PREFIX} The data entry form is valid`);

        // Read in the provided code
        this.log.trace(`${LOG_PREFIX} Reading in the provided code`);
        const code: string | null | undefined = this.systemsRolesForm.get('code')?.value?.trim();
        this.log.debug(`${LOG_PREFIX} System Role Code = ${code}`);

        // Read in the provided name
        this.log.trace(`${LOG_PREFIX} Reading in the provided name`);
        const name: string | null | undefined = this.systemsRolesForm.get('name')?.value?.trim();
        this.log.debug(`${LOG_PREFIX} System Role Name = ${name}`);

        // Read in the provided description
        this.log.trace(`${LOG_PREFIX} Reading in the provided description`);
        const description: string | null | undefined = this.systemsRolesForm.get('description')?.value?.trim();
        this.log.debug(`${LOG_PREFIX} System Role Description = ${description}`);

              // Read in the provided home id
      this.log.trace(`${LOG_PREFIX} Reading in the provided home id`);
      const homeId: number | null | undefined = this.systemsRolesForm.get('homeId')?.value;
      this.log.debug(`${LOG_PREFIX} System Role Home Page Id = ${code}`);  

        // Save the record
        this.log.trace(`${LOG_PREFIX} Saving the System Role Record`);
        this.systemsRolesDataService
          .updateSystemRole(Object.assign(this.systemRole, {
            data: {
              code,
              name,
              description,
              homeId,
              customisable: this.isCustomisable()
            }
          }))
          .subscribe({
            next: (response: SystemRole) => {

              // The System Role Record was saved successfully
              this.log.trace(`${LOG_PREFIX} The System Role Record was successfuly updated`);

              // Reset the form
              this.log.trace(`${LOG_PREFIX} Resetting the form`);
              this.systemsRolesForm.reset();

              // Emit a 'succeeded' event
              this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
              this.succeeded.emit();
            },
            error: (error: any) => {

              // The System Role Record was not saved successfully
              this.log.trace(`${LOG_PREFIX} The System Role Record was not successfuly updated`);

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
        this.validateAllFormFields(this.systemsRolesForm);

        // Emit an 'invalid' event
        this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
        this.failed.emit(400);

      }

    } else {
      // The target System Role record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target System Role record was not successfully initialised()`);

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
