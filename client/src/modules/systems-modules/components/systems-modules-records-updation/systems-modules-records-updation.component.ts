import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { SystemModule } from '@modules/systems-modules/models/system-module.model';
import { SystemsModulesDataService } from '@modules/systems-modules/services/systems-modules-data.service';
import { NGXLogger } from 'ngx-logger';
import { Observable, map, of } from 'rxjs';

const LOG_PREFIX: string = "[Systems Modules Records Updation Component]";

@Component({
  selector: 'sb-systemsModules-records-updation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './systems-modules-records-updation.component.html',
  styleUrls: ['systems-modules-records-updation.component.scss'],
})
export class SystemsModulesRecordsUpdationComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target System Module record
  @Input() public id!: number;

  // Broadcasts successful Systems Modules updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Systems Modules updation events together with their error plurals
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the target System Module record
  public systemModule: SystemModule | null | undefined = undefined;

  // Defines Systems Modules reactive form controls group
  public systemsModulesForm = new FormGroup({

    name: new FormControl<string | null>('',
      [Validators.required, Validators.minLength(2), Validators.maxLength(250)],
      [this.nameExists()]),
      enabled: new FormControl<boolean>(false),
      customisable: new FormControl<boolean>(false)
  });



  constructor(
    private systemsModulesDataService: SystemsModulesDataService,
    private log: NGXLogger) {

  }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the System Module field based on the passed in id
    this.initialiseSystemModule(() => {

      // Initialise the System Module updation form based on the target System Module
      this.initialiseSystemModuleUpdationForm(() => {

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
   * Retrieves the System Module with the injected id and sets it as the System Module that needs to be updated
   * @param callback The function to call when done
   */
  private initialiseSystemModule(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseSystemModule()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveSystemModuleRecord(this.id, (systemModule: SystemModule | null) => {

      // Set the target System Module
      this.log.trace(`${LOG_PREFIX} Setting the target System Module`);
      this.systemModule = systemModule;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }


  /**
   * Initialises the System Module updation form
   * @param callback The function to call when done
   */
  private initialiseSystemModuleUpdationForm(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseSystemModuleUpdationForm()`);
    this.log.debug(`${LOG_PREFIX} Target System Module Record = ${JSON.stringify(this.systemModule)}`);

    // Initialise the System Module Records form fields
    this.log.trace(`${LOG_PREFIX} Initialising the System Module Records form fields`);
    this.systemsModulesForm.setValue({
      name: (this.systemModule && this.systemModule.data?.name) ? this.systemModule.data.name : "",
      enabled: (this.systemModule && this.systemModule.data?.enabled) ? this.systemModule.data.enabled : false,
      customisable: (this.systemModule && this.systemModule.data?.customisable) ? this.systemModule.data.customisable : false,
    });

    // Return
    this.log.trace(`${LOG_PREFIX} Returning`);
    callback();

  }

  /**
   * Retrieves an System Module record given its unique identifier synchronously
   * @param id The unique identifier of the System Module
   * @param callback The function to call when done
   */
  private retrieveSystemModuleRecord(id: number, callback: (systemModule: SystemModule | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveSystemModuleRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the systemModule id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the systemModule id has been specified`);
    if (id) {

      // The System Module id has been specified
      this.log.trace(`${LOG_PREFIX} The System Module id has been specified`);
      this.log.debug(`${LOG_PREFIX} System Module Id = ${JSON.stringify(id)}`);

      // Try retrieving an System Module Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve an System Module Record with the passed in id`);
      const systemModule: SystemModule | undefined = id ? this.systemsModulesDataService.records.find(d => d.id == id) : undefined;

      // Check if the System Module Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the System Module Record was successfully retrieved`);
      if (systemModule) {

        // The System Module Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The System Module Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} System Module Record = ${JSON.stringify(this.systemModule)}`);

        // Return the System Module
        this.log.warn(`${LOG_PREFIX} Returning the System Module`);
        callback(systemModule);

      } else {

        // The System Module Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The System Module Record was not successfully retrieved`);

        // Return null
        this.log.warn(`${LOG_PREFIX} Returning null`);
        callback(null);

      }


    } else {

      // The System Module id has not been specified
      this.log.error(`${LOG_PREFIX} The System Module id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }



  /**
   *Establishes whether the field is enabled
   * @returns True or False
   */
   public isEnabled(): boolean {

    this.log.trace(`${LOG_PREFIX} Entering isEnabled()`);

    if (this.systemsModulesForm.get('enabled')?.value) {
      return true;
    } else {
      return false;
    }

  }



  /**
   * Establishes whether the field should be customisable
   * @returns True or False
   */
  public isCustomisable(): boolean {

    this.log.trace(`${LOG_PREFIX} Entering isCustomisable()`);

    if (this.systemsModulesForm.get('customisable')?.value) {
      return true;
    } else {
      return false;
    }

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
      this.systemsModulesForm.get('enabled')?.setValue(true);


    } else {

      // The switch has been unchecked
      this.log.trace(`${LOG_PREFIX} The switch has been unchecked`);

      // Update the form
      this.log.trace(`${LOG_PREFIX} Updating the form`);
      this.systemsModulesForm.get('enabled')?.setValue(false);
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
      this.systemsModulesForm.get('customisable')?.setValue(true);


    } else {

      // The switch has been unchecked
      this.log.trace(`${LOG_PREFIX} The switch has been unchecked`);

      // Update the form
      this.log.trace(`${LOG_PREFIX} Updating the form`);
      this.systemsModulesForm.get('customisable')?.setValue(false);

    }

  }


  /**
   * Internal validator that checks whether a proposed System Module's Name already exists
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

        // Attempt retrieving Systems Modules with the same Name
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve Systems Modules with the same Name`);
        return this.systemsModulesDataService
          .getSystemsModules(false, {
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            ids: null,
            name: control.value.trim(),
            enabled: null,
            customisable: null
          })
          .pipe(
            map((systemsModules: SystemModule[]) => {

              // Check if an System Module record with the same Name was found
              this.log.trace(`${LOG_PREFIX} Checking if an System Module record with the same Name was found`);

              if (systemsModules.length > 0) {

                // An System Module record with the same Name was found
                this.log.trace(`${LOG_PREFIX} An System Module record with the same Name was found`);

                // Retrieve the System Module record with the specified Name
                this.log.trace(`${LOG_PREFIX} Retrieving the System Module record with the specified Name`);
                const systemModule: SystemModule | undefined = systemsModules.find(s => s.data.name?.toLowerCase() == control.value.toLowerCase());
                this.log.trace(`${LOG_PREFIX} System Module record = ${JSON.stringify(systemModule)}`);

                // Check if the System Module record's identity is different from the current System Module record's identity
                this.log.trace(`${LOG_PREFIX} Checking if the System Module record's identity is different from the current System Module record's identity`);

                if (systemModule && systemModule.id != this.id) {

                  // The System Module record's identity is different from the current System Module record's identity
                  this.log.trace(`${LOG_PREFIX} The System Module record's identity is different from the current System Module record's identity`);

                  // Mark 'Name Exists' as true
                  this.log.trace(`${LOG_PREFIX} Marking 'Name Exists' as true`);
                  return { 'exists': true };

                } else {

                  // The System Module record's identity is not different from the current System Module record's identity
                  this.log.trace(`${LOG_PREFIX} The System Module record's identity is not different from the current System Module record's identity`);

                  // Mark 'Name Exists' as false
                  this.log.trace(`${LOG_PREFIX} Marking 'Name Exists' as false`);
                  return null;
                }


              } else {

                // An System Module record with the same Name was not found
                this.log.trace(`${LOG_PREFIX} An System Module record with the same Name was not found`);

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
   * Validates and saves a new System Module Record.
   * Emits a succeeded or failed event depending on whether the save request succeeded or failed respectively
   * Error 400 = Indicates that a user error was encountered
   * Error 500 = Indicates that a system error was encountered
   */
  public save(): void {

    this.log.trace(`${LOG_PREFIX} Entering save()`);

    // Check if the target System Module record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target System Module record was successfully initialised()`);
    if (this.systemModule) {

      // The target System Module record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target System Module record was successfully initialised()`);

      // Check if the data entry form is valid
      this.log.trace(`${LOG_PREFIX} Checking if the data entry form is valid`);
      if (this.systemsModulesForm.valid) {

        // The data entry form is valid
        this.log.trace(`${LOG_PREFIX} The data entry form is valid`);

        // Read in the provided name
        this.log.trace(`${LOG_PREFIX} Reading in the provided name`);
        const name: string | null | undefined = this.systemsModulesForm.get('name')?.value?.trim();
        this.log.debug(`${LOG_PREFIX} System Module Name = ${name}`);

        // Save the record
        this.log.trace(`${LOG_PREFIX} Saving the System Module Record`);
        this.systemsModulesDataService
          .updateSystemModule(Object.assign(this.systemModule, { 
            data: {
              name,
              enabled: this.isEnabled(),
              customisable: this.isCustomisable(),
            }
          }))
          .subscribe({
            next: (response: SystemModule) => {

              // The System Module Record was saved successfully
              this.log.trace(`${LOG_PREFIX} The System Module Record was successfuly updated`);

              // Reset the form
              this.log.trace(`${LOG_PREFIX} Resetting the form`);
              this.systemsModulesForm.reset();

              // Emit a 'succeeded' event
              this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
              this.succeeded.emit();
            },
            error: (error: any) => {

              // The System Module Record was not saved successfully
              this.log.trace(`${LOG_PREFIX} The System Module Record was not successfuly updated`);

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
        this.validateAllFormFields(this.systemsModulesForm);

        // Emit an 'invalid' event
        this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
        this.failed.emit(400);

      }

    } else {
      // The target System Module record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target System Module record was not successfully initialised()`);

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
