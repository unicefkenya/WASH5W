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
import { OrganisationType } from '@modules/organisations-types/models/organisation-type.model';
import { OrganisationsTypesDataService } from '@modules/organisations-types/services/organisations-types-data.service';
import { NGXLogger } from 'ngx-logger';
import { Observable, map, of } from 'rxjs';

const LOG_PREFIX: string = "[Organisations Types Records Updation Component]";

@Component({
  selector: 'sb-organisationsTypes-records-updation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './organisations-types-records-updation.component.html',
  styleUrls: ['organisations-types-records-updation.component.scss'],
})
export class OrganisationsTypesRecordsUpdationComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Organisation Type record
  @Input() public id!: number;

  // Broadcasts successful Organisations Types updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Organisations Types updation events together with their error plurals
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the target Organisation Type record
  public organisationType: OrganisationType | null | undefined = undefined;

  // Defines Organisations Types reactive form controls group
  public organisationsTypesForm = new FormGroup({

    name: new FormControl<string | null>('',
      [Validators.required, Validators.minLength(2), Validators.maxLength(250)],
      [this.singularNameExists()]),

    plural: new FormControl<string | null>('',
      [Validators.required, Validators.minLength(2), Validators.maxLength(250)],
      [this.pluralNameExists()]),

    abbreviation: new FormControl<string | null>('',
      [Validators.required, Validators.minLength(1), Validators.maxLength(50)],
      [this.abbreviatedNameExists()]),

    colourCode: new FormControl<string | null>('',
      [Validators.required, Validators.minLength(7), Validators.maxLength(7)],
      [this.colourCodeExists()])

  });



  constructor(
    private organisationsTypesDataService: OrganisationsTypesDataService,
    private log: NGXLogger) {

  }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Organisation Type field based on the passed in id
    this.initialiseOrganisationType(() => {

      // Initialise the Organisation Type updation form based on the target Organisation Type
      this.initialiseOrganisationTypeUpdationForm(() => {

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
   * Retrieves the Organisation Type with the injected id and sets it as the Organisation Type that needs to be updated
   * @param callback The function to call when done
   */
  private initialiseOrganisationType(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseOrganisationType()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveOrganisationTypeRecord(this.id, (organisationType: OrganisationType | null) => {

      // Set the target Organisation Type
      this.log.trace(`${LOG_PREFIX} Setting the target Organisation Type`);
      this.organisationType = organisationType;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }


  /**
   * Initialises the Organisation Type updation form
   * @param callback The function to call when done
   */
  private initialiseOrganisationTypeUpdationForm(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseOrganisationTypeUpdationForm()`);
    this.log.debug(`${LOG_PREFIX} Target Organisation Type Record = ${JSON.stringify(this.organisationType)}`);

    // Initialise the Organisation Type Records form fields
    this.log.trace(`${LOG_PREFIX} Initialising the Organisation Type Records form fields`);
    this.organisationsTypesForm.setValue({
      name: (this.organisationType && this.organisationType.data?.name) ? this.organisationType.data?.name : "",
      plural: (this.organisationType && this.organisationType.data?.plural) ? this.organisationType.data?.plural : "",
      abbreviation: (this.organisationType && this.organisationType.data?.abbreviation) ? this.organisationType.data?.abbreviation : "",
      colourCode: (this.organisationType && this.organisationType.data?.colourCode) ? this.organisationType.data?.colourCode : "",
    });

    // Return
    this.log.trace(`${LOG_PREFIX} Returning`);
    callback();

  }

  /**
   * Retrieves an Organisation Type record given its unique identifier synchronously
   * @param id The unique identifier of the Organisation Type
   * @param callback The function to call when done
   */
  private retrieveOrganisationTypeRecord(id: number, callback: (organisationType: OrganisationType | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveOrganisationTypeRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the organisationType id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the organisationType id has been specified`);
    if (id) {

      // The Organisation Type id has been specified
      this.log.trace(`${LOG_PREFIX} The Organisation Type id has been specified`);
      this.log.debug(`${LOG_PREFIX} Organisation Type Id = ${JSON.stringify(id)}`);

      // Try retrieving an Organisation Type Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve an Organisation Type Record with the passed in id`);
      const organisationType: OrganisationType | undefined = id ? this.organisationsTypesDataService.records.find(d => d.id == id) : undefined;

      // Check if the Organisation Type Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the Organisation Type Record was successfully retrieved`);
      if (organisationType) {

        // The Organisation Type Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Organisation Type Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} Organisation Type Record = ${JSON.stringify(this.organisationType)}`);

        // Return the Organisation Type
        this.log.warn(`${LOG_PREFIX} Returning the Organisation Type`);
        callback(organisationType);

      } else {

        // The Organisation Type Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Organisation Type Record was not successfully retrieved`);

        // Return null
        this.log.warn(`${LOG_PREFIX} Returning null`);
        callback(null);

      }


    } else {

      // The Organisation Type id has not been specified
      this.log.error(`${LOG_PREFIX} The Organisation Type id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }



  /**
   * Internal validator that checks whether a proposed Organisation Type's Singular Name already exists
   * @returns 
   */
  private singularNameExists(): AsyncValidatorFn {

    this.log.trace(`${LOG_PREFIX} Entering singularNameExists()`);

    return (control: AbstractControl): Observable<ValidationErrors | null> => {

      // Check if a Singular Name value has been provided
      this.log.trace(`${LOG_PREFIX} Check if a Singular Name value has been provided`);
      if (control.value) {

        // A Singular Name value has been provided
        this.log.trace(`${LOG_PREFIX} A Singular Name value has been provided`);

        // Attempt retrieving Organisations Types with the same Singular Name
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve Organisations Types with the same Singular Name`);
        return this.organisationsTypesDataService
          .getOrganisationsTypes(false, {
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            id: null,
            name: control.value.trim(),
            plural: null,
            abbreviation: null,
            colourCode: null
          })
          .pipe(
            map((organisationsTypes: OrganisationType[]) => {

              // Check if an Organisation Type record with the same Singular Name was found
              this.log.trace(`${LOG_PREFIX} Checking if an Organisation Type record with the same Singular Name was found`);

              if (organisationsTypes.length > 0) {

                // An Organisation Type record with the same Singular Name was found
                this.log.trace(`${LOG_PREFIX} An Organisation Type record with the same Singular Name was found`);

                // Retrieve the Organisation Type record with the specified Singular Name
                this.log.trace(`${LOG_PREFIX} Retrieving the Organisation Type record with the specified Singular Name`);
                const organisationType: OrganisationType | undefined = organisationsTypes.find(s => s.data.name?.toLowerCase() == control.value.toLowerCase());
                this.log.trace(`${LOG_PREFIX} Organisation Type record = ${JSON.stringify(organisationType)}`);

                // Check if the Organisation Type record's identity is different from the current Organisation Type record's identity
                this.log.trace(`${LOG_PREFIX} Checking if the Organisation Type record's identity is different from the current Organisation Type record's identity`);

                if (organisationType && organisationType.id != this.id) {

                  // The Organisation Type record's identity is different from the current Organisation Type record's identity
                  this.log.trace(`${LOG_PREFIX} The Organisation Type record's identity is different from the current Organisation Type record's identity`);

                  // Mark 'Singular Name Exists' as true
                  this.log.trace(`${LOG_PREFIX} Marking 'Singular Name Exists' as true`);
                  return { 'exists': true };

                } else {

                  // The Organisation Type record's identity is not different from the current Organisation Type record's identity
                  this.log.trace(`${LOG_PREFIX} The Organisation Type record's identity is not different from the current Organisation Type record's identity`);

                  // Mark 'Singular Name Exists' as false
                  this.log.trace(`${LOG_PREFIX} Marking 'Singular Name Exists' as false`);
                  return null;
                }


              } else {

                // An Organisation Type record with the same Singular Name was not found
                this.log.trace(`${LOG_PREFIX} An Organisation Type record with the same Singular Name was not found`);

                // Mark 'Singular Name exists' as false
                this.log.trace(`${LOG_PREFIX} Marking 'Singular Name exists' as false`);
                return null;

              }
            }

            )
          )

      } else {

        // A Singular Name value has not been provided
        this.log.trace(`${LOG_PREFIX} A Singular Name value has not been provided`);

        // Mark 'Singular Name Exists' as false
        this.log.trace(`${LOG_PREFIX} Marking 'Singular Name Exists' as false`);
        return of(null);
      }

    };

  }


  /**
   * Internal validator that checks whether a proposed Organisation Type's Plural Name already exists
   * @returns 
   */
  private pluralNameExists(): AsyncValidatorFn {

    this.log.trace(`${LOG_PREFIX} Entering pluralNameExists()`);

    return (control: AbstractControl): Observable<ValidationErrors | null> => {

      // Check if a Plural Name value has been provided
      this.log.trace(`${LOG_PREFIX} Check if a Plural Name value has been provided`);
      if (control.value) {

        // A Plural Name value has been provided
        this.log.trace(`${LOG_PREFIX} A Plural Name value has been provided`);

        // Attempt retrieving Organisations Types with the same Plural Name
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve Organisations Types with the same Plural Name`);
        return this.organisationsTypesDataService
          .getOrganisationsTypes(false, {
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            id: null,
            name: null,
            plural: control.value.trim(),
            abbreviation: null,
            colourCode: null
          })
          .pipe(
            map((organisationsTypes: OrganisationType[]) => {

              // Check if an Organisation Type record with the same Plural Name was found
              this.log.trace(`${LOG_PREFIX} Checking if an Organisation Type record with the same Plural Name was found`);

              if (organisationsTypes.length > 0) {

                // An Organisation Type record with the same Plural Name was found
                this.log.trace(`${LOG_PREFIX} An Organisation Type record with the same Plural Name was found`);

                // Retrieve the Organisation Type record with the specified Plural Name
                this.log.trace(`${LOG_PREFIX} Retrieving the Organisation Type record with the specified Plural Name`);
                const organisationType: OrganisationType | undefined = organisationsTypes.find(s => s.data.plural?.toLowerCase() == control.value.toLowerCase());
                this.log.trace(`${LOG_PREFIX} Organisation Type record = ${JSON.stringify(organisationType)}`);

                // Check if the Organisation Type record's identity is different from the current Organisation Type record's identity
                this.log.trace(`${LOG_PREFIX} Checking if the Organisation Type record's identity is different from the current Organisation Type record's identity`);

                if (organisationType && organisationType.id != this.id) {

                  // The Organisation Type record's identity is different from the current Organisation Type record's identity
                  this.log.trace(`${LOG_PREFIX} The Organisation Type record's identity is different from the current Organisation Type record's identity`);

                  // Mark 'Plural Name Exists' as true
                  this.log.trace(`${LOG_PREFIX} Marking 'Plural Name Exists' as true`);
                  return { 'exists': true };

                } else {

                  // The Organisation Type record's identity is not different from the current Organisation Type record's identity
                  this.log.trace(`${LOG_PREFIX} The Organisation Type record's identity is not different from the current Organisation Type record's identity`);

                  // Mark 'Plural Name Exists' as false
                  this.log.trace(`${LOG_PREFIX} Marking 'Plural Name Exists' as false`);
                  return null;
                }


              } else {

                // An Organisation Type record with the same Plural Name was not found
                this.log.trace(`${LOG_PREFIX} An Organisation Type record with the same Plural Name was not found`);

                // Mark 'Plural Name Exists' as false
                this.log.trace(`${LOG_PREFIX} Marking 'Plural Name Exists' as false`);
                return null;

              }

            }

            )
          )

      } else {

        // A Plural Name value has not been provided
        this.log.trace(`${LOG_PREFIX} A Plural Name value has not been provided`);

        // Mark 'Plural Name Exists' as false
        this.log.trace(`${LOG_PREFIX} Marking 'Plural Name Exists' as false`);
        return of(null);
      }

    };

  }


  /**
   * Internal validator that checks whether a proposed Organisation Type's Abbreviated Name already exists
   * @returns 
   */
  private abbreviatedNameExists(): AsyncValidatorFn {

    this.log.trace(`${LOG_PREFIX} Entering abbreviatedNameExists()`);

    return (control: AbstractControl): Observable<ValidationErrors | null> => {

      // Check if a Abbreviated Name value has been provided
      this.log.trace(`${LOG_PREFIX} Check if a Abbreviated Name value has been provided`);
      if (control.value) {

        // A Abbreviated Name value has been provided
        this.log.trace(`${LOG_PREFIX} A Abbreviated Name value has been provided`);

        // Attempt retrieving Organisations Types with the same Abbreviated Name
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve Organisations Types with the same Abbreviated Name`);
        return this.organisationsTypesDataService
          .getOrganisationsTypes(false, {
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            id: null,
            name: null,
            plural: null,
            abbreviation: control.value.trim(),
            colourCode: null
          })
          .pipe(
            map((organisationsTypes: OrganisationType[]) => {

              // Check if an Organisation Type record with the same Abbreviated Name was found
              this.log.trace(`${LOG_PREFIX} Checking if an Organisation Type record with the same Abbreviated Name was found`);

              if (organisationsTypes.length > 0) {

                // An Organisation Type record with the same Abbreviated Name was found
                this.log.trace(`${LOG_PREFIX} An Organisation Type record with the same Abbreviated Name was found`);

                // Retrieve the Organisation Type record with the specified Abbreviated Name
                this.log.trace(`${LOG_PREFIX} Retrieving the Organisation Type record with the specified Abbreviated Name`);
                const organisationType: OrganisationType | undefined = organisationsTypes.find(s => s.data.abbreviation?.toLowerCase() == control.value.toLowerCase());
                this.log.trace(`${LOG_PREFIX} Organisation Type record = ${JSON.stringify(organisationType)}`);

                // Check if the Organisation Type record's identity is different from the current Organisation Type record's identity
                this.log.trace(`${LOG_PREFIX} Checking if the Organisation Type record's identity is different from the current Organisation Type record's identity`);

                if (organisationType && organisationType.id != this.id) {

                  // The Organisation Type record's identity is different from the current Organisation Type record's identity
                  this.log.trace(`${LOG_PREFIX} The Organisation Type record's identity is different from the current Organisation Type record's identity`);

                  // Mark 'Abbreviated Name Exists' as true
                  this.log.trace(`${LOG_PREFIX} Marking 'Abbreviated Name Exists' as true`);
                  return { 'exists': true };

                } else {

                  // The Organisation Type record's identity is not different from the current Organisation Type record's identity
                  this.log.trace(`${LOG_PREFIX} The Organisation Type record's identity is not different from the current Organisation Type record's identity`);

                  // Mark 'Abbreviated Name Exists' as false
                  this.log.trace(`${LOG_PREFIX} Marking 'Abbreviated Name Exists' as false`);
                  return null;
                }


              } else {

                // An Organisation Type record with the same Abbreviated Name was not found
                this.log.trace(`${LOG_PREFIX} An Organisation Type record with the same Abbreviated Name was not found`);

                // Mark 'Abbreviated Name exists' as false
                this.log.trace(`${LOG_PREFIX} Marking 'Abbreviated Name exists' as false`);
                return null;

              }
            }

            )
          )

      } else {

        // A Abbreviated Name value has not been provided
        this.log.trace(`${LOG_PREFIX} A Abbreviated Name value has not been provided`);

        // Mark 'Abbreviated Name Exists' as false
        this.log.trace(`${LOG_PREFIX} Marking 'Abbreviated Name Exists' as false`);
        return of(null);
      }

    };

  }


  /**
   * Internal validator that checks whether a proposed Organisation Type's Colour Code already exists
   * @returns 
   */
  private colourCodeExists(): AsyncValidatorFn {

    this.log.trace(`${LOG_PREFIX} Entering colourCodeExists()`);

    return (control: AbstractControl): Observable<ValidationErrors | null> => {

      // Check if a Colour Code value has been provided
      this.log.trace(`${LOG_PREFIX} Check if a Colour Code value has been provided`);
      if (control.value) {

        // A Colour Code value has been provided
        this.log.trace(`${LOG_PREFIX} A Colour Code value has been provided`);

        // Attempt retrieving Organisations Types with the same Colour Code
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve Organisations Types with the same Colour Code`);
        return this.organisationsTypesDataService
          .getOrganisationsTypes(false, {
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            id: null,
            name: null,
            plural: null,
            abbreviation: null,
            colourCode: control.value.trim()
          })
          .pipe(
            map((organisationsTypes: OrganisationType[]) => {

              // Check if an Organisation Type record with the same Colour Code was found
              this.log.trace(`${LOG_PREFIX} Checking if an Organisation Type record with the same Colour Code was found`);

              if (organisationsTypes.length > 0) {

                // An Organisation Type record with the same Colour Code was found
                this.log.trace(`${LOG_PREFIX} An Organisation Type record with the same Colour Code was found`);

                // Retrieve the Organisation Type record with the specified Colour Code
                this.log.trace(`${LOG_PREFIX} Retrieving the Organisation Type record with the specified Colour Code`);
                const organisationType: OrganisationType | undefined = organisationsTypes.find(s => s.data.colourCode?.toLowerCase() == control.value.toLowerCase());
                this.log.trace(`${LOG_PREFIX} Organisation Type record = ${JSON.stringify(organisationType)}`);

                // Check if the Organisation Type record's identity is different from the current Organisation Type record's identity
                this.log.trace(`${LOG_PREFIX} Checking if the Organisation Type record's identity is different from the current Organisation Type record's identity`);

                if (organisationType && organisationType.id != this.id) {

                  // The Organisation Type record's identity is different from the current Organisation Type record's identity
                  this.log.trace(`${LOG_PREFIX} The Organisation Type record's identity is different from the current Organisation Type record's identity`);

                  // Mark 'Colour Code Exists' as true
                  this.log.trace(`${LOG_PREFIX} Marking 'Colour Code Exists' as true`);
                  return { 'exists': true };

                } else {

                  // The Organisation Type record's identity is not different from the current Organisation Type record's identity
                  this.log.trace(`${LOG_PREFIX} The Organisation Type record's identity is not different from the current Organisation Type record's identity`);

                  // Mark 'Colour Code Exists' as false
                  this.log.trace(`${LOG_PREFIX} Marking 'Colour Code Exists' as false`);
                  return null;
                }


              } else {

                // An Organisation Type record with the same Colour Code was not found
                this.log.trace(`${LOG_PREFIX} An Organisation Type record with the same Colour Code was not found`);

                // Mark 'Colour Code exists' as false
                this.log.trace(`${LOG_PREFIX} Marking 'Colour Code exists' as false`);
                return null;

              }
            }

            )
          )

      } else {

        // A Colour Code value has not been provided
        this.log.trace(`${LOG_PREFIX} A Colour Code value has not been provided`);

        // Mark 'Colour Code Exists' as false
        this.log.trace(`${LOG_PREFIX} Marking 'Colour Code Exists' as false`);
        return of(null);
      }

    };

  }




  /**
   * Validates and saves a new Organisation Type Record.
   * Emits a succeeded or failed event depending on whether the save request succeeded or failed respectively
   * Error 400 = Indicates that a user error was encountered
   * Error 500 = Indicates that a system error was encountered
   */
  public save(): void {

    this.log.trace(`${LOG_PREFIX} Entering save()`);

    // Check if the target Organisation Type record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Organisation Type record was successfully initialised()`);
    if (this.organisationType) {

      // The target Organisation Type record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Organisation Type record was successfully initialised()`);

      // Check if the data entry form is valid
      this.log.trace(`${LOG_PREFIX} Checking if the data entry form is valid`);
      if (this.organisationsTypesForm.valid) {

        // The data entry form is valid
        this.log.trace(`${LOG_PREFIX} The data entry form is valid`);

        // Read in the provided singular name
        this.log.trace(`${LOG_PREFIX} Reading in the provided singular name`);
        const name: string | null | undefined = this.organisationsTypesForm.get('name')?.value?.trim();
        this.log.debug(`${LOG_PREFIX} Organisation Type Singular Name = ${name}`);

        // Read in the provided plural name
        this.log.trace(`${LOG_PREFIX} Reading in the provided plural name`);
        const plural: string | null | undefined = this.organisationsTypesForm.get('plural')?.value?.trim();
        this.log.debug(`${LOG_PREFIX} Organisation Type Plural Name = ${plural}`);

        // Read in the provided abbreviated name
        this.log.trace(`${LOG_PREFIX} Reading in the provided abbreviated name`);
        const abbreviation: string | null | undefined = this.organisationsTypesForm.get('abbreviation')?.value?.trim();
        this.log.debug(`${LOG_PREFIX} Organisation Type Abbreviated Name = ${abbreviation}`);

        // Read in the provided colour code
        this.log.trace(`${LOG_PREFIX} Reading in the provided colour code`);
        const colourCode: string | null | undefined = this.organisationsTypesForm.get('colourCode')?.value?.trim();
        this.log.debug(`${LOG_PREFIX} Organisation Type Colour Code = ${colourCode}`);

        // Save the record
        this.log.trace(`${LOG_PREFIX} Saving the Organisation Type Record`);
        this.organisationsTypesDataService
          .updateOrganisationType(Object.assign(this.organisationType, { data: { name, plural, abbreviation, colourCode } }))
          .subscribe({
            next: (response: OrganisationType) => {

              // The Organisation Type Record was saved successfully
              this.log.trace(`${LOG_PREFIX} The Organisation Type Record was successfuly updated`);

              // Reset the form
              this.log.trace(`${LOG_PREFIX} Resetting the form`);
              this.organisationsTypesForm.reset();

              // Emit a 'succeeded' event
              this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
              this.succeeded.emit();
            },
            error: (error: any) => {

              // The Organisation Type Record was not saved successfully
              this.log.trace(`${LOG_PREFIX} The Organisation Type Record was not successfuly updated`);

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
        this.validateAllFormFields(this.organisationsTypesForm);

        // Emit an 'invalid' event
        this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
        this.failed.emit(400);

      }

    } else {
      // The target Organisation Type record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Organisation Type record was not successfully initialised()`);

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
