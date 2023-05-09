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
import { AdministrativeUnit } from '@modules/administrative-units/models/administrative-unit.model';
import { AdministrativeUnitsDataService } from '@modules/administrative-units/services/administrative-units-data.service';
import { AdministrativeUnitsTypesDataService } from '@modules/administrative-units-types/services/administrative-units-types-data.service';
import { NGXLogger } from 'ngx-logger';
import { Observable, map, of } from 'rxjs';

const LOG_PREFIX: string = "[Administrative Units Records Updation Component]";

@Component({
  selector: 'sb-administrative-units-records-updation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './administrative-units-records-updation.component.html',
  styleUrls: ['administrative-units-records-updation.component.scss'],
})
export class AdministrativeUnitsRecordsUpdationComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Administrative Unit record
  @Input() public id!: number;

  // Broadcasts successful Administrative Units updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Administrative Units updation events together with their error codes
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the Administrative Unit record with the passed in id
  public administrativeUnit: AdministrativeUnit | null | undefined;

  // Defines Administrative Units reactive form controls group
  administrativeUnitsForm = new FormGroup({

    typeId: new FormControl<number | null>(null,
      [Validators.required]),

    name: new FormControl<string | null>('',
      [Validators.required, Validators.minLength(2), Validators.maxLength(250)],
      [this.nameExists()])

  });

  constructor(
    public administrativeUnitsTypesDataService: AdministrativeUnitsTypesDataService,
    private administrativeUnitsDataService: AdministrativeUnitsDataService,
    private log: NGXLogger) {

  }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Administrative Unit field based on the passed in id
    this.initialiseAdministrativeUnit(() => {

      // Initialise the Administrative Unit updation form based on the target Context
      this.initialiseAdministrativeUnitUpdationForm(() => {

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
   * Retrieves the Administrative Unit with the injected id and sets it as the Administrative Unit that needs to be updated
   * @param callback The function to call when done
   */
  private initialiseAdministrativeUnit(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseAdministrativeUnit()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveAdministrativeUnitRecord(this.id, (administrativeUnit: AdministrativeUnit | null) => {

      // Set the target Administrative Unit
      this.log.trace(`${LOG_PREFIX} Setting the target Administrative Unit`);
      this.administrativeUnit = administrativeUnit;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }


  /**
   * Initialises the Administrative Unit updation form
   * @param callback The function to call when done
   */
  private initialiseAdministrativeUnitUpdationForm(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseAdministrativeUnitUpdationForm()`);
    this.log.debug(`${LOG_PREFIX} Target Administrative Unit Record = ${JSON.stringify(this.administrativeUnit)}`);

    // Initialise the Administrative Unit Records form fields
    this.log.trace(`${LOG_PREFIX} Initialising the Administrative Unit Records form fields`);
    this.administrativeUnitsForm.setValue({
      typeId: this.administrativeUnit?.data.typeId ? this.administrativeUnit.data.typeId : null,
      name: this.administrativeUnit?.data.name ? this.administrativeUnit.data.name : null
    });

    // Return
    this.log.trace(`${LOG_PREFIX} Returning`);
    callback();

  }

  /**
   * Retrieves an Administrative Unit record given its unique identifier synchronously
   * @param id The unique identifier of the Administrative Unit
   * @param callback The function to call when done
   */
  private retrieveAdministrativeUnitRecord(id: number, callback: (administrativeUnit: AdministrativeUnit | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveAdministrativeUnitRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the Administrative Unit Type Id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the Administrative Unit Type Id has been specified`);
    if (id) {

      // The Administrative Unit Type Id has been specified
      this.log.trace(`${LOG_PREFIX} The Administrative Unit Type Id has been specified`);
      this.log.debug(`${LOG_PREFIX} Administrative Unit Id = ${JSON.stringify(id)}`);

      // Try retrieving an Administrative Unit Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve an Administrative Unit Record with the passed in id`);
      const administrativeUnit: AdministrativeUnit | undefined = id ? this.administrativeUnitsDataService.records.find(d => d.id == id) : undefined;

      // Check if the Administrative Unit Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the Administrative Unit Record was successfully retrieved`);
      if (administrativeUnit) {

        // The Administrative Unit Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Administrative Unit Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} Administrative Unit Record = ${JSON.stringify(administrativeUnit)}`);

        // Return the Administrative Unit
        this.log.trace(`${LOG_PREFIX} Returning the Administrative Unit`);
        callback(administrativeUnit);

      } else {

        // The Administrative Unit Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Administrative Unit Record was not successfully retrieved`);

        // Return null
        this.log.warn(`${LOG_PREFIX} Returning null`);
        callback(null);

      }


    } else {

      // The Administrative Unit Type Id has not been specified
      this.log.error(`${LOG_PREFIX} The Administrative Unit Type Id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }


  /**
   * Internal validator that checks whether a proposed Administrative Unit's name already exists
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

        // Attempt retrieving Administrative Units with the same name
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve Administrative Units with the same name`);
        return this.administrativeUnitsDataService
          .getAdministrativeUnits(false,{
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            id: null,
            typesIds: this.administrativeUnitsForm.get('typeId')?.value? [this.administrativeUnitsForm.get('typeId')?.value as number] : null,
            name: control.value?.trim()
          })
          .pipe(
            map((administrativeUnits: AdministrativeUnit[]) => {

              // Check if an Administrative Unit record with the same name was found
              this.log.trace(`${LOG_PREFIX} Checking if an Administrative Unit record with the same name was found`);

              if (administrativeUnits.length > 0) {

                // A Administrative Unit record with the same name was found
                this.log.trace(`${LOG_PREFIX} A Administrative Unit record with the same name was found`);

                // Retrieve the Administrative Unit record with the specified name
                this.log.trace(`${LOG_PREFIX} Retrieving the Administrative Unit record with the specified name`);
                const administrativeUnit: AdministrativeUnit | undefined = administrativeUnits.find(s => s.data.name?.toLowerCase() == control.value.toLowerCase());
                this.log.trace(`${LOG_PREFIX} Administrative Unit record = ${JSON.stringify(administrativeUnit)}`);

                // Check if the Administrative Unit record's identity is different from the current Administrative Unit record's identity
                this.log.trace(`${LOG_PREFIX} Checking if the Administrative Unit record's identity is different from the current Administrative Unit record's identity`);

                if (administrativeUnit && administrativeUnit.id != this.id) {

                  // The Administrative Unit record's identity is different from the current Administrative Unit record's identity
                  this.log.trace(`${LOG_PREFIX} The Administrative Unit record's identity is different from the current Administrative Unit record's identity`);

                  // Mark 'code exists' as true
                  this.log.trace(`${LOG_PREFIX} Marking 'code exists' as true`);
                  return { 'exists': true };

                } else {

                  // The Administrative Unit record's identity is not different from the current Administrative Unit record's identity
                  this.log.trace(`${LOG_PREFIX} The Administrative Unit record's identity is not different from the current Administrative Unit record's identity`);

                  // Mark 'name exists' as false
                  this.log.trace(`${LOG_PREFIX} Marking 'name exists' as false`);
                  return null
                }


              } else {

                // A Administrative Unit record with the same name was not found
                this.log.trace(`${LOG_PREFIX} A Administrative Unit record with the same name was not found`);

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
   * Validates and saves the updated Administrative Unit Record.
   * Emits a succeeded or failed event in response to whether or not the updation exercise was successful.
   * Error 400 = Indicates an invalid Form Control Entry was supplied.
   * Error 500 = Indicates something unexpected happened at the server side
   */
  public save(): void {


    this.log.trace(`${LOG_PREFIX} Entering save()`);

    // Check if the target Administrative Unit record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Administrative Unit record was successfully initialised()`);
    if (this.administrativeUnit) {

      // The target Administrative Unit record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Administrative Unit record was successfully initialised()`);

      // Check if the data entry form is valid
      this.log.trace(`${LOG_PREFIX} Checking if the data entry form is valid`);
      if (this.administrativeUnitsForm.valid) {

        // The data entry form is valid
        this.log.trace(`${LOG_PREFIX} The data entry form is valid`);

        // Read in the provided parent Administrative Unit Type Id
        this.log.trace(`${LOG_PREFIX} Reading in the provided parent Administrative Unit Type Id`);
        const typeId: number | null | undefined = this.administrativeUnitsForm.get('typeId')?.value;
        this.log.debug(`${LOG_PREFIX} Parent Administrative Unit Type Id = ${typeId}`);

        // Read in the provided name
        this.log.trace(`${LOG_PREFIX} Reading in the provided name`);
        const name: string | null | undefined = this.administrativeUnitsForm.get('name')?.value?.trim();
        this.log.debug(`${LOG_PREFIX} Administrative Unit Name = ${name}`);

        // Save the record
        this.log.trace(`${LOG_PREFIX} Saving the Administrative Units Record`);
        this.administrativeUnitsDataService
          .updateAdministrativeUnit(Object.assign(this.administrativeUnit, {
            data: {
              typeId,
              name
            }
          }))
          .subscribe({
            next: (response: AdministrativeUnit) => {

              // The Administrative Unit Record was saved successfully
              this.log.trace(`${LOG_PREFIX} Administrative Unit Record was saved successfuly`);

              // Reset the form
              this.log.trace(`${LOG_PREFIX} Resetting the form`);
              this.administrativeUnitsForm.reset();

              // Emit a 'succeeded' event
              this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
              this.succeeded.emit();
            },
            error: (error: any) => {

              // The Administrative Unit Record was not saved successfully
              this.log.trace(`${LOG_PREFIX} Administrative Unit Record was not saved successfuly`);

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
        this.validateAllFormFields(this.administrativeUnitsForm);

        // Emit an 'invalid' event
        this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
        this.failed.emit(400);
      }


    } else {
      // The target Administrative Unit record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Administrative Unit record was not successfully initialised()`);

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
