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
import { AdministrativeUnitType } from '@modules/administrative-units-types/models/administrative-unit-type.model';
import { AdministrativeUnitsTypesDataService } from '@modules/administrative-units-types/services/administrative-units-types-data.service';
import { NGXLogger } from 'ngx-logger';
import { Observable, map, of } from 'rxjs';

const LOG_PREFIX: string = "[Administrative Units Types Records Updation Component]";

@Component({
  selector: 'sb-administrativeUnitsTypes-records-updation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './administrative-units-types-records-updation.component.html',
  styleUrls: ['administrative-units-types-records-updation.component.scss'],
})
export class AdministrativeUnitsTypesRecordsUpdationComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Administrative Unit Type record
  @Input() public id!: number;

  // Broadcasts successful Administrative Units Types updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Administrative Units Types updation events together with their error plurals
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the target Administrative Unit Type record
  public administrativeUnitType: AdministrativeUnitType | null | undefined = undefined;

  // Defines Administrative Units Types reactive form controls group
  public administrativeUnitsTypesForm = new FormGroup({

    name: new FormControl<string | null>('', 
    [Validators.required, Validators.minLength(2), Validators.maxLength(250)],
    [this.nameExists()]),     

    plural: new FormControl<string | null>('', 
    [Validators.required, Validators.minLength(2), Validators.maxLength(250)],
    [this.pluralExists()]),    

  });



  constructor(
    private administrativeUnitsTypesDataService: AdministrativeUnitsTypesDataService,
    private log: NGXLogger) {

  }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Administrative Unit Type field based on the passed in id
    this.initialiseAdministrativeUnitType(() => {

      // Initialise the Administrative Unit Type updation form based on the target Administrative Unit Type
      this.initialiseAdministrativeUnitTypeUpdationForm(() => {

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
   * Retrieves the Administrative Unit Type with the injected id and sets it as the Administrative Unit Type that needs to be updated
   * @param callback The function to call when done
   */
  private initialiseAdministrativeUnitType(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseAdministrativeUnitType()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveAdministrativeUnitTypeRecord(this.id, (administrativeUnitType: AdministrativeUnitType | null) => {

      // Set the target Administrative Unit Type
      this.log.trace(`${LOG_PREFIX} Setting the target Administrative Unit Type`);
      this.administrativeUnitType = administrativeUnitType;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }


  /**
   * Initialises the Administrative Unit Type updation form
   * @param callback The function to call when done
   */
  private initialiseAdministrativeUnitTypeUpdationForm(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseAdministrativeUnitTypeUpdationForm()`);
    this.log.debug(`${LOG_PREFIX} Target Administrative Unit Type Record = ${JSON.stringify(this.administrativeUnitType)}`);

    // Initialise the Administrative Unit Type Records form fields
    this.log.trace(`${LOG_PREFIX} Initialising the Administrative Unit Type Records form fields`);
    this.administrativeUnitsTypesForm.setValue({
      name: (this.administrativeUnitType && this.administrativeUnitType.data?.name) ? this.administrativeUnitType.data?.name : "",
      plural: (this.administrativeUnitType && this.administrativeUnitType.data?.plural) ? this.administrativeUnitType.data?.plural : "",
    });

    // Return
    this.log.trace(`${LOG_PREFIX} Returning`);
    callback();

  }

  /**
   * Retrieves an Administrative Unit Type record given its unique identifier synchronously
   * @param id The unique identifier of the Administrative Unit Type
   * @param callback The function to call when done
   */
  private retrieveAdministrativeUnitTypeRecord(id: number, callback: (administrativeUnitType: AdministrativeUnitType | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveAdministrativeUnitTypeRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the administrativeUnitType id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the administrativeUnitType id has been specified`);
    if (id) {

      // The Administrative Unit Type id has been specified
      this.log.trace(`${LOG_PREFIX} The Administrative Unit Type id has been specified`);
      this.log.debug(`${LOG_PREFIX} Administrative Unit Type Id = ${JSON.stringify(id)}`);

      // Try retrieving an Administrative Unit Type Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve an Administrative Unit Type Record with the passed in id`);
      const administrativeUnitType: AdministrativeUnitType | undefined = id ? this.administrativeUnitsTypesDataService.records.find(d => d.id == id) : undefined;

      // Check if the Administrative Unit Type Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the Administrative Unit Type Record was successfully retrieved`);
      if (administrativeUnitType) {

        // The Administrative Unit Type Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Administrative Unit Type Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} Administrative Unit Type Record = ${JSON.stringify(this.administrativeUnitType)}`);

        // Return the Administrative Unit Type
        this.log.warn(`${LOG_PREFIX} Returning the Administrative Unit Type`);
        callback(administrativeUnitType);

      } else {

        // The Administrative Unit Type Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Administrative Unit Type Record was not successfully retrieved`);

        // Return null
        this.log.warn(`${LOG_PREFIX} Returning null`);
        callback(null);

      }


    } else {

      // The Administrative Unit Type id has not been specified
      this.log.error(`${LOG_PREFIX} The Administrative Unit Type id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }



  /**
   * Internal validator that checks whether a proposed AdministrativeUnitType's plural already exists
   * @returns 
   */
   private pluralExists(): AsyncValidatorFn {

    this.log.trace(`${LOG_PREFIX} Entering pluralExists()`);

    return (control: AbstractControl): Observable<ValidationErrors | null> => {

      // Check if a plural value has been provided
      this.log.trace(`${LOG_PREFIX} Check if a plural value has been provided`);
      if (control.value) {

        // A plural value has been provided
        this.log.trace(`${LOG_PREFIX} A plural value has been provided`);

        // Attempt retrieving Administrative Units Types with the same plural
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve Administrative Units Types with the same plural`);
        return this.administrativeUnitsTypesDataService
          .getAdministrativeUnitsTypes(false,{
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            id: null,
            plural: control.value,
            name: null
          })
          .pipe(
            map((administrativeUnitsTypes: AdministrativeUnitType[]) => {

              // Check if an Administrative Unit Type record with the same plural was found
              this.log.trace(`${LOG_PREFIX} Checking if an Administrative Unit Type record with the same plural was found`);

              if (administrativeUnitsTypes.length > 0) {

                // An Administrative Unit Type record with the same plural was found
                this.log.trace(`${LOG_PREFIX} An Administrative Unit Type record with the same plural was found`);

                // Retrieve the Administrative Unit Type record with the specified plural
                this.log.trace(`${LOG_PREFIX} Retrieving the Administrative Unit Type record with the specified plural`);
                const administrativeUnitType: AdministrativeUnitType | undefined = administrativeUnitsTypes.find(s => s.data.plural?.toLowerCase() == control.value.toLowerCase());
                this.log.trace(`${LOG_PREFIX} Administrative Unit Type record = ${JSON.stringify(administrativeUnitType)}`);

                // Check if the Administrative Unit Type record's identity is different from the current Administrative Unit Type record's identity
                this.log.trace(`${LOG_PREFIX} Checking if the Administrative Unit Type record's identity is different from the current Administrative Unit Type record's identity`);

                if (administrativeUnitType && administrativeUnitType.id != this.id) {

                  // The Administrative Unit Type record's identity is different from the current Administrative Unit Type record's identity
                  this.log.trace(`${LOG_PREFIX} The Administrative Unit Type record's identity is different from the current Administrative Unit Type record's identity`);

                  // Mark 'plural exists' as true
                  this.log.trace(`${LOG_PREFIX} Marking 'plural exists' as true`);
                  return { 'exists': true };

                } else {

                  // The Administrative Unit Type record's identity is not different from the current Administrative Unit Type record's identity
                  this.log.trace(`${LOG_PREFIX} The Administrative Unit Type record's identity is not different from the current Administrative Unit Type record's identity`);

                  // Mark 'plural exists' as false
                  this.log.trace(`${LOG_PREFIX} Marking 'plural exists' as false`);
                  return null;
                }


              } else {

                // An Administrative Unit Type record with the same plural was not found
                this.log.trace(`${LOG_PREFIX} An Administrative Unit Type record with the same plural was not found`);

                // Mark 'plural exists' as false
                this.log.trace(`${LOG_PREFIX} Marking 'plural exists' as false`);
                return null;

              }
            }

            )
          );

      } else {

        // A plural value has not been provided
        this.log.trace(`${LOG_PREFIX} A plural value has not been provided`);

        // Mark 'plural exists' as false
        this.log.trace(`${LOG_PREFIX} Marking 'plural exists' as false`);
        return of(null);
      }

    };

  }



  /**
   * Internal validator that checks whether a proposed AdministrativeUnitType's name already exists
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

        // Attempt retrieving Administrative Units Types with the same name
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve Administrative Units Types with the same name`);
        return this.administrativeUnitsTypesDataService
          .getAdministrativeUnitsTypes(false,{
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            id: null,
            plural: null,
            name: control.value?.trim()
          })
          .pipe(
            map((administrativeUnitsTypes: AdministrativeUnitType[]) => {

              // Check if an Administrative Unit Type record with the same name was found
              this.log.trace(`${LOG_PREFIX} Checking if an Administrative Unit Type record with the same name was found`);

              if (administrativeUnitsTypes.length > 0) {

                // An Administrative Unit Type record with the same name was found
                this.log.trace(`${LOG_PREFIX} An Administrative Unit Type record with the same name was found`);

                // Retrieve the Administrative Unit Type record with the specified name
                this.log.trace(`${LOG_PREFIX} Retrieving the Administrative Unit Type record with the specified name`);
                const administrativeUnitType: AdministrativeUnitType | undefined = administrativeUnitsTypes.find(s => s.data.name?.toLowerCase() == control.value.toLowerCase());
                this.log.trace(`${LOG_PREFIX} Administrative Unit Type record = ${JSON.stringify(administrativeUnitType)}`);

                // Check if the Administrative Unit Type record's identity is different from the current Administrative Unit Type record's identity
                this.log.trace(`${LOG_PREFIX} Checking if the Administrative Unit Type record's identity is different from the current Administrative Unit Type record's identity`);

                if (administrativeUnitType && administrativeUnitType.id != this.id) {

                  // The Administrative Unit Type record's identity is different from the current Administrative Unit Type record's identity
                  this.log.trace(`${LOG_PREFIX} The Administrative Unit Type record's identity is different from the current Administrative Unit Type record's identity`);

                  // Mark 'name exists' as true
                  this.log.trace(`${LOG_PREFIX} Marking 'name exists' as true`);
                  return { 'exists': true };

                } else {

                  // The Administrative Unit Type record's identity is not different from the current Administrative Unit Type record's identity
                  this.log.trace(`${LOG_PREFIX} The Administrative Unit Type record's identity is not different from the current Administrative Unit Type record's identity`);

                  // Mark 'name exists' as false
                  this.log.trace(`${LOG_PREFIX} Marking 'name exists' as false`);
                  return null;
                }


              } else {

                // An Administrative Unit Type record with the same name was not found
                this.log.trace(`${LOG_PREFIX} An Administrative Unit Type record with the same name was not found`);

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
   * Validates and saves a new Administrative Unit Type Record.
   * Emits a succeeded or failed event depending on whether the save request succeeded or failed respectively
   * Error 400 = Indicates that a user error was encountered
   * Error 500 = Indicates that a system error was encountered
   */
  public save(): void {

    this.log.trace(`${LOG_PREFIX} Entering save()`);

    // Check if the target Administrative Unit Type record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Administrative Unit Type record was successfully initialised()`);
    if (this.administrativeUnitType) {

      // The target Administrative Unit Type record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Administrative Unit Type record was successfully initialised()`);

      // Check if the data entry form is valid
      this.log.trace(`${LOG_PREFIX} Checking if the data entry form is valid`);
      if (this.administrativeUnitsTypesForm.valid) {

        // The data entry form is valid
        this.log.trace(`${LOG_PREFIX} The data entry form is valid`);

      // Read in the provided plural
      this.log.trace(`${LOG_PREFIX} Reading in the provided plural`);
      const plural: string | null | undefined = this.administrativeUnitsTypesForm.get('plural')?.value?.trim();
      this.log.debug(`${LOG_PREFIX} Administrative Unit Type Plural = ${plural}`);      

      // Read in the provided name
      this.log.trace(`${LOG_PREFIX} Reading in the provided name`);
      const name: string | null | undefined = this.administrativeUnitsTypesForm.get('name')?.value?.trim();
      this.log.debug(`${LOG_PREFIX} Administrative Unit Type Name = ${name}`);

        // Save the record
        this.log.trace(`${LOG_PREFIX} Saving the Administrative Unit Type Record`);
        this.administrativeUnitsTypesDataService
          .updateAdministrativeUnitType(Object.assign(this.administrativeUnitType, { data: { name, plural} }))
          .subscribe({
            next: (response: AdministrativeUnitType) => {

              // The Administrative Unit Type Record was saved successfully
              this.log.trace(`${LOG_PREFIX} The Administrative Unit Type Record was successfuly updated`);

              // Reset the form
              this.log.trace(`${LOG_PREFIX} Resetting the form`);
              this.administrativeUnitsTypesForm.reset();

              // Emit a 'succeeded' event
              this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
              this.succeeded.emit();
            },
            error: (error: any) => {

              // The Administrative Unit Type Record was not saved successfully
              this.log.trace(`${LOG_PREFIX} The Administrative Unit Type Record was not successfuly updated`);

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
        this.validateAllFormFields(this.administrativeUnitsTypesForm);

        // Emit an 'invalid' event
        this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
        this.failed.emit(400);

      }

    } else {
      // The target Administrative Unit Type record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Administrative Unit Type record was not successfully initialised()`);

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
