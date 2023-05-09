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
import { Unit } from '@modules/units/models/unit.model';
import { UnitsDataService } from '@modules/units/services/units-data.service';
import { NGXLogger } from 'ngx-logger';
import { Observable, map, of } from 'rxjs';

const LOG_PREFIX: string = "[Units Records Updation Component]";

@Component({
  selector: 'sb-units-records-updation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './units-records-updation.component.html',
  styleUrls: ['units-records-updation.component.scss'],
})
export class UnitsRecordsUpdationComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Unit record
  @Input() public id!: number;

  // Broadcasts successful Units updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Units updation events together with their error abbreviations
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the target Unit record
  public unit: Unit | null | undefined = undefined;

  // Defines Units reactive form controls group
  public unitsForm = new FormGroup({

    name: new FormControl<string | null>('', 
    [Validators.required, Validators.minLength(2), Validators.maxLength(250)],
    [this.nameExists()]),     

    abbreviation: new FormControl<string | null>('', 
    [Validators.required, Validators.minLength(1), Validators.maxLength(50)],
    [this.abbreviationExists()]),    

  });



  constructor(
    private unitsDataService: UnitsDataService,
    private log: NGXLogger) {

  }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Unit field based on the passed in id
    this.initialiseUnit(() => {

      // Initialise the Unit updation form based on the target Unit
      this.initialiseUnitUpdationForm(() => {

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
   * Retrieves the Unit with the injected id and sets it as the Unit that needs to be updated
   * @param callback The function to call when done
   */
  private initialiseUnit(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseUnit()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveUnitRecord(this.id, (unit: Unit | null) => {

      // Set the target Unit
      this.log.trace(`${LOG_PREFIX} Setting the target Unit`);
      this.unit = unit;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }


  /**
   * Initialises the Unit updation form
   * @param callback The function to call when done
   */
  private initialiseUnitUpdationForm(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseUnitUpdationForm()`);
    this.log.debug(`${LOG_PREFIX} Target Unit Record = ${JSON.stringify(this.unit)}`);

    // Initialise the Unit Records form fields
    this.log.trace(`${LOG_PREFIX} Initialising the Unit Records form fields`);
    this.unitsForm.setValue({
      name: (this.unit && this.unit.data?.name) ? this.unit.data?.name : "",
      abbreviation: (this.unit && this.unit.data?.abbreviation) ? this.unit.data?.abbreviation : "",
    });

    // Return
    this.log.trace(`${LOG_PREFIX} Returning`);
    callback();

  }

  /**
   * Retrieves a Unit record given its unique identifier synchronously
   * @param id The unique identifier of the Unit
   * @param callback The function to call when done
   */
  private retrieveUnitRecord(id: number, callback: (unit: Unit | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveUnitRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the unit id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the unit id has been specified`);
    if (id) {

      // The Unit id has been specified
      this.log.trace(`${LOG_PREFIX} The Unit id has been specified`);
      this.log.debug(`${LOG_PREFIX} Unit Id = ${JSON.stringify(id)}`);

      // Try retrieving a Unit Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve a Unit Record with the passed in id`);
      const unit: Unit | undefined = id ? this.unitsDataService.records.find(d => d.id == id) : undefined;

      // Check if the Unit Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the Unit Record was successfully retrieved`);
      if (unit) {

        // The Unit Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Unit Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} Unit Record = ${JSON.stringify(this.unit)}`);

        // Return the Unit
        this.log.warn(`${LOG_PREFIX} Returning the Unit`);
        callback(unit);

      } else {

        // The Unit Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Unit Record was not successfully retrieved`);

        // Return null
        this.log.warn(`${LOG_PREFIX} Returning null`);
        callback(null);

      }


    } else {

      // The Unit id has not been specified
      this.log.error(`${LOG_PREFIX} The Unit id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }



  /**
   * Internal validator that checks whether a proposed Unit's abbreviation already exists
   * @returns 
   */
   private abbreviationExists(): AsyncValidatorFn {

    this.log.trace(`${LOG_PREFIX} Entering abbreviationExists()`);

    return (control: AbstractControl): Observable<ValidationErrors | null> => {

      // Check if an abbreviation value has been provided
      this.log.trace(`${LOG_PREFIX} Check if an abbreviation value has been provided`);
      if (control.value) {

        // An abbreviation value has been provided
        this.log.trace(`${LOG_PREFIX} An abbreviation value has been provided`);

        // Attempt retrieving Units with the same abbreviation
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve Units with the same abbreviation`);
        return this.unitsDataService
          .getUnits(false,{
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            id: null,
            abbreviation: control.value,
            name: null
          })
          .pipe(
            map((units: Unit[]) => {

              // Check if a Unit record with the same abbreviation was found
              this.log.trace(`${LOG_PREFIX} Checking if a Unit record with the same abbreviation was found`);

              if (units.length > 0) {

                // An Unit record with the same abbreviation was found
                this.log.trace(`${LOG_PREFIX} An Unit record with the same abbreviation was found`);

                // Retrieve the Unit record with the specified abbreviation
                this.log.trace(`${LOG_PREFIX} Retrieving the Unit record with the specified abbreviation`);
                const unit: Unit | undefined = units.find(s => s.data.abbreviation?.toLowerCase() == control.value.toLowerCase());
                this.log.trace(`${LOG_PREFIX} Unit record = ${JSON.stringify(unit)}`);

                // Check if the Unit record's identity is different from the current Unit record's identity
                this.log.trace(`${LOG_PREFIX} Checking if the Unit record's identity is different from the current Unit record's identity`);

                if (unit && unit.id != this.id) {

                  // The Unit record's identity is different from the current Unit record's identity
                  this.log.trace(`${LOG_PREFIX} The Unit record's identity is different from the current Unit record's identity`);

                  // Mark 'abbreviation exists' as true
                  this.log.trace(`${LOG_PREFIX} Marking 'abbreviation exists' as true`);
                  return { 'exists': true };

                } else {

                  // The Unit record's identity is not different from the current Unit record's identity
                  this.log.trace(`${LOG_PREFIX} The Unit record's identity is not different from the current Unit record's identity`);

                  // Mark 'abbreviation exists' as false
                  this.log.trace(`${LOG_PREFIX} Marking 'abbreviation exists' as false`);
                  return null;
                }


              } else {

                // An Unit record with the same abbreviation was not found
                this.log.trace(`${LOG_PREFIX} An Unit record with the same abbreviation was not found`);

                // Mark 'abbreviation exists' as false
                this.log.trace(`${LOG_PREFIX} Marking 'abbreviation exists' as false`);
                return null;

              }
            }

            )
          );

      } else {

        // An abbreviation value has not been provided
        this.log.trace(`${LOG_PREFIX} An abbreviation value has not been provided`);

        // Mark 'abbreviation exists' as false
        this.log.trace(`${LOG_PREFIX} Marking 'abbreviation exists' as false`);
        return of(null);
      }

    };

  }



  /**
   * Internal validator that checks whether a proposed Unit's name already exists
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

        // Attempt retrieving Units with the same name
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve Units with the same name`);
        return this.unitsDataService
          .getUnits(false,{
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            id: null,
            abbreviation: null,
            name: control.value?.trim()
          })
          .pipe(
            map((units: Unit[]) => {

              // Check if a Unit record with the same name was found
              this.log.trace(`${LOG_PREFIX} Checking if a Unit record with the same name was found`);

              if (units.length > 0) {

                // An Unit record with the same name was found
                this.log.trace(`${LOG_PREFIX} An Unit record with the same name was found`);

                // Retrieve the Unit record with the specified name
                this.log.trace(`${LOG_PREFIX} Retrieving the Unit record with the specified name`);
                const unit: Unit | undefined = units.find(s => s.data.name?.toLowerCase() == control.value.toLowerCase());
                this.log.trace(`${LOG_PREFIX} Unit record = ${JSON.stringify(unit)}`);

                // Check if the Unit record's identity is different from the current Unit record's identity
                this.log.trace(`${LOG_PREFIX} Checking if the Unit record's identity is different from the current Unit record's identity`);

                if (unit && unit.id != this.id) {

                  // The Unit record's identity is different from the current Unit record's identity
                  this.log.trace(`${LOG_PREFIX} The Unit record's identity is different from the current Unit record's identity`);

                  // Mark 'name exists' as true
                  this.log.trace(`${LOG_PREFIX} Marking 'name exists' as true`);
                  return { 'exists': true };

                } else {

                  // The Unit record's identity is not different from the current Unit record's identity
                  this.log.trace(`${LOG_PREFIX} The Unit record's identity is not different from the current Unit record's identity`);

                  // Mark 'name exists' as false
                  this.log.trace(`${LOG_PREFIX} Marking 'name exists' as false`);
                  return null;
                }


              } else {

                // An Unit record with the same name was not found
                this.log.trace(`${LOG_PREFIX} An Unit record with the same name was not found`);

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
   * Validates and saves a new Unit Record.
   * Emits a succeeded or failed event depending on whether the save request succeeded or failed respectively
   * Error 400 = Indicates that a user error was encountered
   * Error 500 = Indicates that a system error was encountered
   */
  public save(): void {

    this.log.trace(`${LOG_PREFIX} Entering save()`);

    // Check if the target Unit record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Unit record was successfully initialised()`);
    if (this.unit) {

      // The target Unit record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Unit record was successfully initialised()`);

      // Check if the data entry form is valid
      this.log.trace(`${LOG_PREFIX} Checking if the data entry form is valid`);
      if (this.unitsForm.valid) {

        // The data entry form is valid
        this.log.trace(`${LOG_PREFIX} The data entry form is valid`);

      // Read in the provided abbreviation
      this.log.trace(`${LOG_PREFIX} Reading in the provided abbreviation`);
      const abbreviation: string | null | undefined = this.unitsForm.get('abbreviation')?.value?.trim();
      this.log.debug(`${LOG_PREFIX} Unit Abbreviation = ${abbreviation}`);      

      // Read in the provided name
      this.log.trace(`${LOG_PREFIX} Reading in the provided name`);
      const name: string | null | undefined = this.unitsForm.get('name')?.value?.trim();
      this.log.debug(`${LOG_PREFIX} Unit Name = ${name}`);

        // Save the record
        this.log.trace(`${LOG_PREFIX} Saving the Unit Record`);
        this.unitsDataService
          .updateUnit(Object.assign(this.unit, { data: { name, abbreviation} }))
          .subscribe({
            next: (response: Unit) => {

              // The Unit Record was saved successfully
              this.log.trace(`${LOG_PREFIX} The Unit Record was successfuly updated`);

              // Reset the form
              this.log.trace(`${LOG_PREFIX} Resetting the form`);
              this.unitsForm.reset();

              // Emit a 'succeeded' event
              this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
              this.succeeded.emit();
            },
            error: (error: any) => {

              // The Unit Record was not saved successfully
              this.log.trace(`${LOG_PREFIX} The Unit Record was not successfuly updated`);

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
        this.validateAllFormFields(this.unitsForm);

        // Emit an 'invalid' event
        this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
        this.failed.emit(400);

      }

    } else {
      // The target Unit record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Unit record was not successfully initialised()`);

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
