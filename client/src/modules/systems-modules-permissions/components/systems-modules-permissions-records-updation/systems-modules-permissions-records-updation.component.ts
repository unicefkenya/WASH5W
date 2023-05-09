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
import { SystemModulePermission } from '@modules/systems-modules-permissions/models/system-module-permission.model';
import { SystemsModulesPermissionsDataService } from '@modules/systems-modules-permissions/services/systems-modules-permissions-data.service';
import { SystemsModulesDataService } from '@modules/systems-modules/services/systems-modules-data.service';
import { NGXLogger } from 'ngx-logger';
import { Observable, map, of } from 'rxjs';
import { environment } from 'environments/environment';

const LOG_PREFIX: string = "[Systems Modules Permissions Records Updation Component]";

@Component({
  selector: 'sb-systems-modules-permissions-records-updation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './systems-modules-permissions-records-updation.component.html',
  styleUrls: ['systems-modules-permissions-records-updation.component.scss'],
})
export class SystemsModulesPermissionsRecordsUpdationComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target System Module Permission record
  @Input() public id!: number;

  // Broadcasts successful Systems Modules Permissions updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Systems Modules Permissions updation events together with their error codes
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the System Module Permission record with the passed in id
  public systemModulePermission: SystemModulePermission | null | undefined;

  // Defines Systems Modules Permissions reactive form controls group
  systemsModulesPermissionsForm = new FormGroup({

    systemModuleId: new FormControl<number | null>(null,
      [Validators.required]),

    code: new FormControl<string | null>('',
      [Validators.required, Validators.minLength(2), Validators.maxLength(250)],
      [this.codeExists()]),

    name: new FormControl<string | null>('',
      [Validators.required, Validators.minLength(2), Validators.maxLength(250)],
      [this.nameExists()]),

    custom: new FormControl<boolean>(false),

    description: new FormControl<string | null>('',
      [Validators.maxLength(500)])

  });

  constructor(
    public systemsModulesDataService: SystemsModulesDataService,
    private systemsModulesPermissionsDataService: SystemsModulesPermissionsDataService,
    private log: NGXLogger) {

  }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the System Module Permission field based on the passed in id
    this.initialiseSystemModulePermission(() => {

      // Initialise the System Module Permission updation form based on the target Context
      this.initialiseSystemModulePermissionUpdationForm(() => {

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
   * Retrieves the System Module Permission with the injected id and sets it as the System Module Permission that needs to be updated
   * @param callback The function to call when done
   */
  private initialiseSystemModulePermission(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseSystemModulePermission()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveSystemModulePermissionRecord(this.id, (systemModulePermission: SystemModulePermission | null) => {

      // Set the target System Module Permission
      this.log.trace(`${LOG_PREFIX} Setting the target System Module Permission`);
      this.systemModulePermission = systemModulePermission;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }


  /**
   * Initialises the System Module Permission updation form
   * @param callback The function to call when done
   */
  private initialiseSystemModulePermissionUpdationForm(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseSystemModulePermissionUpdationForm()`);
    this.log.debug(`${LOG_PREFIX} Target System Module Permission Record = ${JSON.stringify(this.systemModulePermission)}`);

    // Initialise the System Module Permission Records form fields
    this.log.trace(`${LOG_PREFIX} Initialising the System Module Permission Records form fields`);
    this.systemsModulesPermissionsForm.setValue({
      systemModuleId: this.systemModulePermission?.data.systemModuleId ? this.systemModulePermission.data.systemModuleId : null,
      code: this.systemModulePermission?.data.code ? this.systemModulePermission.data.code : null,
      name: this.systemModulePermission?.data.name ? this.systemModulePermission.data.name : null,
      custom: this.systemModulePermission?.data.custom ? this.systemModulePermission.data.custom : false,
      description: this.systemModulePermission?.data.description ? this.systemModulePermission.data.description : null
    });

    // Return
    this.log.trace(`${LOG_PREFIX} Returning`);
    callback();

  }

  public isProductionEnvironment(): boolean {
    return (environment.production);
  }

  public isDevelopmentEnvironment(): boolean {
    return !(environment.production);
  }


  /**
   * Retrieves an System Module Permission record given its unique identifier synchronously
   * @param id The unique identifier of the System Module Permission
   * @param callback The function to call when done
   */
  private retrieveSystemModulePermissionRecord(id: number, callback: (systemModulePermission: SystemModulePermission | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveSystemModulePermissionRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the System Module Id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the System Module Id has been specified`);
    if (id) {

      // The System Module Id has been specified
      this.log.trace(`${LOG_PREFIX} The System Module Id has been specified`);
      this.log.debug(`${LOG_PREFIX} System Module Permission Id = ${JSON.stringify(id)}`);

      // Try retrieving an System Module Permission Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve an System Module Permission Record with the passed in id`);
      const systemModulePermission: SystemModulePermission | undefined = id ? this.systemsModulesPermissionsDataService.records.find(d => d.id == id) : undefined;

      // Check if the System Module Permission Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the System Module Permission Record was successfully retrieved`);
      if (systemModulePermission) {

        // The System Module Permission Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The System Module Permission Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} System Module Permission Record = ${JSON.stringify(systemModulePermission)}`);

        // Return the System Module Permission
        this.log.trace(`${LOG_PREFIX} Returning the System Module Permission`);
        callback(systemModulePermission);

      } else {

        // The System Module Permission Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The System Module Permission Record was not successfully retrieved`);

        // Return null
        this.log.warn(`${LOG_PREFIX} Returning null`);
        callback(null);

      }


    } else {

      // The System Module Id has not been specified
      this.log.error(`${LOG_PREFIX} The System Module Id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }




  /**
   * Establishes whether the field is custom
   * @returns True or False
   */
  public isCustom(): boolean {

    this.log.trace(`${LOG_PREFIX} Entering isCustom()`);

    if (this.systemsModulesPermissionsForm.get('custom')?.value) {
      return true;
    } else {
      return false;
    }

  }


  /**
   * Flags whether or not the field is custom
   * @param e Switch event
   */
  public toggleCustomness(e: any): void {

    this.log.trace(`${LOG_PREFIX} Entering toggleCustomness()`);

    // Check if the switch has been checked
    this.log.trace(`${LOG_PREFIX} Checking if the switch has been checked`);
    if (e.target.checked) {

      // The switch has been checked
      this.log.trace(`${LOG_PREFIX} The switch has been checked`);

      // Update the form
      this.log.trace(`${LOG_PREFIX} Updating the form`);
      this.systemsModulesPermissionsForm.get('custom')?.setValue(true);


    } else {

      // The switch has been unchecked
      this.log.trace(`${LOG_PREFIX} The switch has been unchecked`);

      // Update the form
      this.log.trace(`${LOG_PREFIX} Updating the form`);
      this.systemsModulesPermissionsForm.get('custom')?.setValue(false);

    }

  }



  /**
   * Internal validator that checks whether a proposed System Module Permission's code already exists
   * @returns 
   */
  private codeExists(): AsyncValidatorFn {

    this.log.trace(`${LOG_PREFIX} Entering codeExists()`);

    return (control: AbstractControl): Observable<ValidationErrors | null> => {

      // Check if a code value has been provided
      this.log.trace(`${LOG_PREFIX} Check if a code value has been provided`);
      if (control.value) {

        // A code value has been provided
        this.log.trace(`${LOG_PREFIX} A code value has been provided`);

        // Attempt retrieving System Module Permissions with the same code
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve System Module Permissions with the same code`);
        return this.systemsModulesPermissionsDataService
          .getSystemsModulesPermissions(false, {
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            code: control.value
          })
          .pipe(
            map((systemModulePermissions: SystemModulePermission[]) => {

              // Check if a System Module Permission record with the same code was found
              this.log.trace(`${LOG_PREFIX} Checking if a System Module Permission record with the same code was found`);

              if (systemModulePermissions.length > 0) {

                // A System Module Permission record with the same code was found
                this.log.trace(`${LOG_PREFIX} A System Module Permission record with the same code was found`);

                // Retrieve the System Module Permission record with the specified code
                this.log.trace(`${LOG_PREFIX} Retrieving the System Module Permission record with the specified code`);
                const systemModulePermission: SystemModulePermission | undefined = systemModulePermissions.find(s => s.data.code?.toLowerCase() == control.value.toLowerCase());
                this.log.trace(`${LOG_PREFIX} System Module Permission record = ${JSON.stringify(systemModulePermission)}`);

                // Check if the System Module Permission record's identity is different from the current System Module Permission record's identity
                this.log.trace(`${LOG_PREFIX} Checking if the System Module Permission record's identity is different from the current System Module Permission record's identity`);

                if (systemModulePermission && systemModulePermission.id != this.id) {

                  // The System Module Permission record's identity is different from the current System Module Permission record's identity
                  this.log.trace(`${LOG_PREFIX} The System Module Permission record's identity is different from the current System Module Permission record's identity`);

                  // Mark 'code exists' as true
                  this.log.trace(`${LOG_PREFIX} Marking 'code exists' as true`);
                  return { 'exists': true };

                } else {

                  // The System Module Permission record's identity is not different from the current System Module Permission record's identity
                  this.log.trace(`${LOG_PREFIX} The System Module Permission record's identity is not different from the current System Module Permission record's identity`);

                  // Mark 'code exists' as false
                  this.log.trace(`${LOG_PREFIX} Marking 'code exists' as false`);
                  return null
                }


              } else {

                // A System Module Permission record with the same code was not found
                this.log.trace(`${LOG_PREFIX} A System Module Permission record with the same code was not found`);

                // Mark 'code exists' as false
                this.log.trace(`${LOG_PREFIX} Marking 'code exists' as false`);
                return null

              }
            }

            )
          );

      } else {

        // A code value has not been provided
        this.log.trace(`${LOG_PREFIX} A code value has not been provided`);

        // Mark 'code exists' as false
        this.log.trace(`${LOG_PREFIX} Marking 'code exists' as false`);
        return of(null)
      }

    };

  }


  /**
   * Internal validator that checks whether a proposed System Module Permission's name already exists
   * @returns 
   */
  private nameExists(): AsyncValidatorFn {

    this.log.trace(`${LOG_PREFIX} Entering nameExists()`);

    return (control: AbstractControl): Observable<ValidationErrors | null> => {

      // Check if a name value has been provided
      this.log.trace(`${LOG_PREFIX} Check if a name value has been provided`);
      if (control.value) {

        // A name value has been provided
        this.log.trace(`${LOG_PREFIX} A name value has been provided`);

        // Attempt retrieving System Module Permissions with the same name
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve System Module Permissions with the same name`);
        return this.systemsModulesPermissionsDataService
          .getSystemsModulesPermissions(false, {
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            name: control.value
          })
          .pipe(
            map((systemModulePermissions: SystemModulePermission[]) => {

              // Check if a System Module Permission record with the same name was found
              this.log.trace(`${LOG_PREFIX} Checking if a System Module Permission record with the same name was found`);

              if (systemModulePermissions.length > 0) {

                // A System Module Permission record with the same name was found
                this.log.trace(`${LOG_PREFIX} A System Module Permission record with the same name was found`);

                // Retrieve the System Module Permission record with the specified name
                this.log.trace(`${LOG_PREFIX} Retrieving the System Module Permission record with the specified name`);
                const systemModulePermission: SystemModulePermission | undefined = systemModulePermissions.find(s => s.data.name?.toLowerCase() == control.value.toLowerCase());
                this.log.trace(`${LOG_PREFIX} System Module Permission record = ${JSON.stringify(systemModulePermission)}`);

                // Check if the System Module Permission record's identity is different from the current System Module Permission record's identity
                this.log.trace(`${LOG_PREFIX} Checking if the System Module Permission record's identity is different from the current System Module Permission record's identity`);

                if (systemModulePermission && systemModulePermission.id != this.id) {

                  // The System Module Permission record's identity is different from the current System Module Permission record's identity
                  this.log.trace(`${LOG_PREFIX} The System Module Permission record's identity is different from the current System Module Permission record's identity`);

                  // Mark 'code exists' as true
                  this.log.trace(`${LOG_PREFIX} Marking 'code exists' as true`);
                  return { 'exists': true };

                } else {

                  // The System Module Permission record's identity is not different from the current System Module Permission record's identity
                  this.log.trace(`${LOG_PREFIX} The System Module Permission record's identity is not different from the current System Module Permission record's identity`);

                  // Mark 'name exists' as false
                  this.log.trace(`${LOG_PREFIX} Marking 'name exists' as false`);
                  return null
                }


              } else {

                // A System Module Permission record with the same name was not found
                this.log.trace(`${LOG_PREFIX} A System Module Permission record with the same name was not found`);

                // Mark 'name exists' as false
                this.log.trace(`${LOG_PREFIX} Marking 'name exists' as false`);
                return null

              }
            }

            )
          );

      } else {

        // A name value has not been provided
        this.log.trace(`${LOG_PREFIX} A name value has not been provided`);

        // Mark 'name exists' as false
        this.log.trace(`${LOG_PREFIX} Marking 'name exists' as false`);
        return of(null)
      }

    };

  }


  /**
   * Validates and saves the updated System Module Permission Record.
   * Emits a succeeded or failed event in response to whether or not the updation exercise was successful.
   * Error 400 = Indicates an invalid Form Control Entry was supplied.
   * Error 500 = Indicates something unexpected happened at the server side
   */
  public save(): void {


    this.log.trace(`${LOG_PREFIX} Entering save()`);

    // Check if the target System Module Permission record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target System Module Permission record was successfully initialised()`);
    if (this.systemModulePermission) {

      // The target System Module Permission record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target System Module Permission record was successfully initialised()`);

      // Check if the data entry form is valid
      this.log.trace(`${LOG_PREFIX} Checking if the data entry form is valid`);
      if (this.systemsModulesPermissionsForm.valid) {

        // The data entry form is valid
        this.log.trace(`${LOG_PREFIX} The data entry form is valid`);

        // Read in the provided parent system module id
        this.log.trace(`${LOG_PREFIX} Reading in the provided parent system module id`);
        const systemModuleId: number | null | undefined = this.systemsModulesPermissionsForm.get('systemModuleId')?.value;
        this.log.debug(`${LOG_PREFIX} Parent System Module Id = ${systemModuleId}`);

        // Read in the provided code
        this.log.trace(`${LOG_PREFIX} Reading in the provided code`);
        const code: string | null | undefined = this.systemsModulesPermissionsForm.get('code')?.value;
        this.log.debug(`${LOG_PREFIX} System Module Permission Code = ${code}`);

        // Read in the provided name
        this.log.trace(`${LOG_PREFIX} Reading in the provided name`);
        const name: string | null | undefined = this.systemsModulesPermissionsForm.get('name')?.value;
        this.log.debug(`${LOG_PREFIX} System Module Permission Name = ${name}`);

        // Read in the provided description
        this.log.trace(`${LOG_PREFIX} Reading in the provided description`);
        const description: string | null | undefined = this.systemsModulesPermissionsForm.get('description')?.value;
        this.log.debug(`${LOG_PREFIX} System Module Permission Description = ${description}`);

        // Save the record
        this.log.trace(`${LOG_PREFIX} Saving the System Module Permissions Record`);
        this.systemsModulesPermissionsDataService
          .updateSystemModulePermission(Object.assign(this.systemModulePermission, {
            data: {
              systemModuleId: systemModuleId,
              code,
              name,
              custom: this.isCustom(),
              description
            }
          }))
          .subscribe({
            next: (response: SystemModulePermission) => {

              // The System Module Permission Record was saved successfully
              this.log.trace(`${LOG_PREFIX} System Module Permission Record was saved successfuly`);

              // Reset the form
              this.log.trace(`${LOG_PREFIX} Resetting the form`);
              this.systemsModulesPermissionsForm.reset();

              // Emit a 'succeeded' event
              this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
              this.succeeded.emit();
            },
            error: (error: any) => {

              // The System Module Permission Record was not saved successfully
              this.log.trace(`${LOG_PREFIX} System Module Permission Record was not saved successfuly`);

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
        this.validateAllFormFields(this.systemsModulesPermissionsForm);

        // Emit an 'invalid' event
        this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
        this.failed.emit(400);
      }


    } else {
      // The target System Module Permission record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target System Module Permission record was not successfully initialised()`);

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
