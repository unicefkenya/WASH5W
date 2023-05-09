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
import { AdministrativeSystem } from '@modules/administrative-systems/models/administrative-system.model';
import { AdministrativeSystemsDataService } from '@modules/administrative-systems/services/administrative-systems-data.service';
import { NGXLogger } from 'ngx-logger';
import { Observable, map, of } from 'rxjs';

const LOG_PREFIX: string = "[Administrative Systems Records Updation Component]";

@Component({
  selector: 'sb-administrative-systems-records-updation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './administrative-systems-records-updation.component.html',
  styleUrls: ['administrative-systems-records-updation.component.scss'],
})
export class AdministrativeSystemsRecordsUpdationComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Administrative System record
  @Input() public id!: number;

  // Broadcasts successful Administrative Systems updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Administrative Systems updation events together with their error plurals
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the target Administrative System record
  public administrativeSystem: AdministrativeSystem | null | undefined = undefined;

  // Defines Administrative Systems reactive form controls group
  public administrativeSystemsForm = new FormGroup({

    name: new FormControl<string | null>('', 
    [Validators.required, Validators.minLength(2), Validators.maxLength(250)],
    [this.nameExists()]), 

  });



  constructor(
    private administrativeSystemsDataService: AdministrativeSystemsDataService,
    private log: NGXLogger) {

  }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Administrative System field based on the passed in id
    this.initialiseAdministrativeSystem(() => {

      // Initialise the Administrative System updation form based on the target Administrative System
      this.initialiseAdministrativeSystemUpdationForm(() => {

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
   * Retrieves the Administrative System with the injected id and sets it as the Administrative System that needs to be updated
   * @param callback The function to call when done
   */
  private initialiseAdministrativeSystem(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseAdministrativeSystem()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveAdministrativeSystemRecord(this.id, (administrativeSystem: AdministrativeSystem | null) => {

      // Set the target Administrative System
      this.log.trace(`${LOG_PREFIX} Setting the target Administrative System`);
      this.administrativeSystem = administrativeSystem;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }


  /**
   * Initialises the Administrative System updation form
   * @param callback The function to call when done
   */
  private initialiseAdministrativeSystemUpdationForm(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseAdministrativeSystemUpdationForm()`);
    this.log.debug(`${LOG_PREFIX} Target Administrative System Record = ${JSON.stringify(this.administrativeSystem)}`);

    // Initialise the Administrative System Records form fields
    this.log.trace(`${LOG_PREFIX} Initialising the Administrative System Records form fields`);
    this.administrativeSystemsForm.setValue({
      name: (this.administrativeSystem && this.administrativeSystem.data?.name) ? this.administrativeSystem.data?.name : ""
    });

    // Return
    this.log.trace(`${LOG_PREFIX} Returning`);
    callback();

  }

  /**
   * Retrieves an Administrative System record given its unique identifier synchronously
   * @param id The unique identifier of the Administrative System
   * @param callback The function to call when done
   */
  private retrieveAdministrativeSystemRecord(id: number, callback: (administrativeSystem: AdministrativeSystem | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveAdministrativeSystemRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the administrativeSystem id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the administrativeSystem id has been specified`);
    if (id) {

      // The Administrative System id has been specified
      this.log.trace(`${LOG_PREFIX} The Administrative System id has been specified`);
      this.log.debug(`${LOG_PREFIX} Administrative System Id = ${JSON.stringify(id)}`);

      // Try retrieving an Administrative System Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve an Administrative System Record with the passed in id`);
      const administrativeSystem: AdministrativeSystem | undefined = id ? this.administrativeSystemsDataService.records.find(d => d.id == id) : undefined;

      // Check if the Administrative System Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the Administrative System Record was successfully retrieved`);
      if (administrativeSystem) {

        // The Administrative System Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Administrative System Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} Administrative System Record = ${JSON.stringify(this.administrativeSystem)}`);

        // Return the Administrative System
        this.log.warn(`${LOG_PREFIX} Returning the Administrative System`);
        callback(administrativeSystem);

      } else {

        // The Administrative System Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Administrative System Record was not successfully retrieved`);

        // Return null
        this.log.warn(`${LOG_PREFIX} Returning null`);
        callback(null);

      }


    } else {

      // The Administrative System id has not been specified
      this.log.error(`${LOG_PREFIX} The Administrative System id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }


  /**
   * Internal validator that checks whether a proposed AdministrativeSystem's name already exists
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

        // Attempt retrieving Administrative Systems with the same name
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve Administrative Systems with the same name`);
        return this.administrativeSystemsDataService
          .getAdministrativeSystems(false,{
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            name: control.value?.trim(),
            id: null
          })
          .pipe(
            map((administrativeSystems: AdministrativeSystem[]) => {

              // Check if an Administrative System record with the same name was found
              this.log.trace(`${LOG_PREFIX} Checking if an Administrative System record with the same name was found`);

              if (administrativeSystems.length > 0) {

                // An Administrative System record with the same name was found
                this.log.trace(`${LOG_PREFIX} An Administrative System record with the same name was found`);

                // Retrieve the Administrative System record with the specified name
                this.log.trace(`${LOG_PREFIX} Retrieving the Administrative System record with the specified name`);
                const administrativeSystem: AdministrativeSystem | undefined = administrativeSystems.find(s => s.data.name?.toLowerCase() == control.value.toLowerCase());
                this.log.trace(`${LOG_PREFIX} Administrative System record = ${JSON.stringify(administrativeSystem)}`);

                // Check if the Administrative System record's identity is different from the current Administrative System record's identity
                this.log.trace(`${LOG_PREFIX} Checking if the Administrative System record's identity is different from the current Administrative System record's identity`);

                if (administrativeSystem && administrativeSystem.id != this.id) {

                  // The Administrative System record's identity is different from the current Administrative System record's identity
                  this.log.trace(`${LOG_PREFIX} The Administrative System record's identity is different from the current Administrative System record's identity`);

                  // Mark 'name exists' as true
                  this.log.trace(`${LOG_PREFIX} Marking 'name exists' as true`);
                  return { 'exists': true };

                } else {

                  // The Administrative System record's identity is not different from the current Administrative System record's identity
                  this.log.trace(`${LOG_PREFIX} The Administrative System record's identity is not different from the current Administrative System record's identity`);

                  // Mark 'name exists' as false
                  this.log.trace(`${LOG_PREFIX} Marking 'name exists' as false`);
                  return null;
                }


              } else {

                // An Administrative System record with the same name was not found
                this.log.trace(`${LOG_PREFIX} An Administrative System record with the same name was not found`);

                // Mark 'name exists' as false
                this.log.trace(`${LOG_PREFIX} Marking 'name exists' as false`);
                return null;

              }
            }

            )
          );

      } else {

        // A name value has not been provided
        this.log.trace(`${LOG_PREFIX} A name value has not been provided`);

        // Mark 'name exists' as false
        this.log.trace(`${LOG_PREFIX} Marking 'name exists' as false`);
        return of(null);
      }

    };

  }




  /**
   * Validates and saves a new Administrative System Record.
   * Emits a succeeded or failed event depending on whether the save request succeeded or failed respectively
   * Error 400 = Indicates that a user error was encountered
   * Error 500 = Indicates that a system error was encountered
   */
  public save(): void {

    this.log.trace(`${LOG_PREFIX} Entering save()`);

    // Check if the target Administrative System record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Administrative System record was successfully initialised()`);
    if (this.administrativeSystem) {

      // The target Administrative System record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Administrative System record was successfully initialised()`);

      // Check if the data entry form is valid
      this.log.trace(`${LOG_PREFIX} Checking if the data entry form is valid`);
      if (this.administrativeSystemsForm.valid) {

        // The data entry form is valid
        this.log.trace(`${LOG_PREFIX} The data entry form is valid`);    

      // Read in the provided name
      this.log.trace(`${LOG_PREFIX} Reading in the provided name`);
      const name: string | null | undefined = this.administrativeSystemsForm.get('name')?.value?.trim();
      this.log.debug(`${LOG_PREFIX} Administrative System Name = ${name}`);

        // Save the record
        this.log.trace(`${LOG_PREFIX} Saving the Administrative System Record`);
        this.administrativeSystemsDataService
          .updateAdministrativeSystem(Object.assign(this.administrativeSystem, { data: { name} }))
          .subscribe({
            next: (response: AdministrativeSystem) => {

              // The Administrative System Record was saved successfully
              this.log.trace(`${LOG_PREFIX} The Administrative System Record was successfuly updated`);

              // Reset the form
              this.log.trace(`${LOG_PREFIX} Resetting the form`);
              this.administrativeSystemsForm.reset();

              // Emit a 'succeeded' event
              this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
              this.succeeded.emit();
            },
            error: (error: any) => {

              // The Administrative System Record was not saved successfully
              this.log.trace(`${LOG_PREFIX} The Administrative System Record was not successfuly updated`);

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
        this.validateAllFormFields(this.administrativeSystemsForm);

        // Emit an 'invalid' event
        this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
        this.failed.emit(400);

      }

    } else {
      // The target Administrative System record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Administrative System record was not successfully initialised()`);

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
