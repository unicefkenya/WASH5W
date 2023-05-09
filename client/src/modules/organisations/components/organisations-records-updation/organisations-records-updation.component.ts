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
import { Organisation } from '@modules/organisations/models/organisation.model';
import { OrganisationsDataService } from '@modules/organisations/services/organisations-data.service';
import { OrganisationsTypesDataService } from '@modules/organisations-types/services/organisations-types-data.service';
import { NGXLogger } from 'ngx-logger';
import { Observable, map, of } from 'rxjs';

const LOG_PREFIX: string = "[Organisations Records Updation Component]";

@Component({
  selector: 'sb-organisations-records-updation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './organisations-records-updation.component.html',
  styleUrls: ['organisations-records-updation.component.scss'],
})
export class OrganisationsRecordsUpdationComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Organisation record
  @Input() public id!: number;

  // Broadcasts successful Organisations updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Organisations updation events together with their error codes
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the Organisation record with the passed in id
  public organisation: Organisation | null | undefined;

  // Defines Organisations reactive form controls group
  organisationsForm = new FormGroup({

    typeId: new FormControl<number | null>(null,
      [Validators.required]),

    name: new FormControl<string | null>('',
      [Validators.required, Validators.minLength(2), Validators.maxLength(250)],
      [this.nameExists()]),

    abbreviation: new FormControl<string | null>('',
      [Validators.maxLength(50)],
      [this.abbreviationExists()]),

    website: new FormControl<string | null>('',
      [Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')])

  });

  constructor(
    public organisationsTypesDataService: OrganisationsTypesDataService,
    private organisationsDataService: OrganisationsDataService,
    private log: NGXLogger) {

  }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Organisation field based on the passed in id
    this.initialiseOrganisation(() => {

      // Initialise the Organisation updation form based on the target Context
      this.initialiseOrganisationUpdationForm(() => {

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
   * Retrieves the Organisation with the injected id and sets it as the Organisation that needs to be updated
   * @param callback The function to call when done
   */
  private initialiseOrganisation(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseOrganisation()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveOrganisationRecord(this.id, (organisation: Organisation | null) => {

      // Set the target Organisation
      this.log.trace(`${LOG_PREFIX} Setting the target Organisation`);
      this.organisation = organisation;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }


  /**
   * Initialises the Organisation updation form
   * @param callback The function to call when done
   */
  private initialiseOrganisationUpdationForm(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseOrganisationUpdationForm()`);
    this.log.debug(`${LOG_PREFIX} Target Organisation Record = ${JSON.stringify(this.organisation)}`);

    // Initialise the Organisation Records form fields
    this.log.trace(`${LOG_PREFIX} Initialising the Organisation Records form fields`);
    this.organisationsForm.setValue({
      typeId: this.organisation?.data.typeId ? this.organisation.data.typeId : null,
      name: this.organisation?.data.name ? this.organisation.data.name : null,
      abbreviation: this.organisation?.data.abbreviation ? this.organisation.data.abbreviation : null,
      website: this.organisation?.data.website ? this.organisation.data.website : null
    });

    // Return
    this.log.trace(`${LOG_PREFIX} Returning`);
    callback();

  }

  /**
   * Retrieves an Organisation record given its unique identifier synchronously
   * @param id The unique identifier of the Organisation
   * @param callback The function to call when done
   */
  private retrieveOrganisationRecord(id: number, callback: (organisation: Organisation | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveOrganisationRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the Organisation Type Id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the Organisation Type Id has been specified`);
    if (id) {

      // The Organisation Type Id has been specified
      this.log.trace(`${LOG_PREFIX} The Organisation Type Id has been specified`);
      this.log.debug(`${LOG_PREFIX} Organisation Id = ${JSON.stringify(id)}`);

      // Try retrieving an Organisation Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve an Organisation Record with the passed in id`);
      const organisation: Organisation | undefined = id ? this.organisationsDataService.records.find(d => d.id == id) : undefined;

      // Check if the Organisation Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the Organisation Record was successfully retrieved`);
      if (organisation) {

        // The Organisation Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Organisation Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} Organisation Record = ${JSON.stringify(organisation)}`);

        // Return the Organisation
        this.log.trace(`${LOG_PREFIX} Returning the Organisation`);
        callback(organisation);

      } else {

        // The Organisation Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Organisation Record was not successfully retrieved`);

        // Return null
        this.log.warn(`${LOG_PREFIX} Returning null`);
        callback(null);

      }


    } else {

      // The Organisation Type Id has not been specified
      this.log.error(`${LOG_PREFIX} The Organisation Type Id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }


  /**
   * Internal validator that checks whether a proposed Organisation's name already exists
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

        // Attempt retrieving Organisations with the same name
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve Organisations with the same name`);
        return this.organisationsDataService
          .getOrganisations(false, {
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            id: null,
            typeId: this.organisationsForm.get('typeId')?.value ? this.organisationsForm.get('typeId')?.value as number : null,
            name: control.value?.trim(),
            abbreviation: null
          })
          .pipe(
            map((organisations: Organisation[]) => {

              // Check if an Organisation record with the same name was found
              this.log.trace(`${LOG_PREFIX} Checking if an Organisation record with the same name was found`);

              if (organisations.length > 0) {

                // An Organisation record with the same name was found
                this.log.trace(`${LOG_PREFIX} An Organisation record with the same name was found`);

                // Retrieve the Organisation record with the specified name
                this.log.trace(`${LOG_PREFIX} Retrieving the Organisation record with the specified name`);
                const organisation: Organisation | undefined = organisations.find(s => s.data.name?.toLowerCase() == control.value.toLowerCase());
                this.log.trace(`${LOG_PREFIX} Organisation record = ${JSON.stringify(organisation)}`);

                // Check if the Organisation record's identity is different from the current Organisation record's identity
                this.log.trace(`${LOG_PREFIX} Checking if the Organisation record's identity is different from the current Organisation record's identity`);

                if (organisation && organisation.id != this.id) {

                  // The Organisation record's identity is different from the current Organisation record's identity
                  this.log.trace(`${LOG_PREFIX} The Organisation record's identity is different from the current Organisation record's identity`);

                  // Mark 'code exists' as true
                  this.log.trace(`${LOG_PREFIX} Marking 'code exists' as true`);
                  return { 'exists': true };

                } else {

                  // The Organisation record's identity is not different from the current Organisation record's identity
                  this.log.trace(`${LOG_PREFIX} The Organisation record's identity is not different from the current Organisation record's identity`);

                  // Mark 'name exists' as false
                  this.log.trace(`${LOG_PREFIX} Marking 'name exists' as false`);
                  return null
                }


              } else {

                // An Organisation record with the same name was not found
                this.log.trace(`${LOG_PREFIX} An Organisation record with the same name was not found`);

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
   * Internal validator that checks whether a proposed Organisation's abbreviation already exists
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

        // Attempt retrieving Organisations with the same abbreviation
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve Organisations with the same abbreviation`);
        return this.organisationsDataService
          .getOrganisations(false, {
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            id: null,
            typeId: this.organisationsForm.get('typeId')?.value ? this.organisationsForm.get('typeId')?.value as number : null,
            name: null,
            abbreviation: control.value?.trim()
          })
          .pipe(
            map((organisations: Organisation[]) => {

              // Check if an Organisation record with the same abbreviation was found
              this.log.trace(`${LOG_PREFIX} Checking if an Organisation record with the same abbreviation was found`);

              if (organisations.length > 0) {

                // An Organisation record with the same abbreviation was found
                this.log.trace(`${LOG_PREFIX} An Organisation record with the same abbreviation was found`);

                // Retrieve the Organisation record with the specified abbreviation
                this.log.trace(`${LOG_PREFIX} Retrieving the Organisation record with the specified abbreviation`);
                const organisation: Organisation | undefined = organisations.find(s => s.data.abbreviation?.toLowerCase() == control.value.toLowerCase());
                this.log.trace(`${LOG_PREFIX} Organisation record = ${JSON.stringify(organisation)}`);

                // Check if the Organisation record's identity is different from the current Organisation record's identity
                this.log.trace(`${LOG_PREFIX} Checking if the Organisation record's identity is different from the current Organisation record's identity`);

                if (organisation && organisation.id != this.id) {

                  // The Organisation record's identity is different from the current Organisation record's identity
                  this.log.trace(`${LOG_PREFIX} The Organisation record's identity is different from the current Organisation record's identity`);

                  // Mark 'code exists' as true
                  this.log.trace(`${LOG_PREFIX} Marking 'code exists' as true`);
                  return { 'exists': true };

                } else {

                  // The Organisation record's identity is not different from the current Organisation record's identity
                  this.log.trace(`${LOG_PREFIX} The Organisation record's identity is not different from the current Organisation record's identity`);

                  // Mark 'abbreviation exists' as false
                  this.log.trace(`${LOG_PREFIX} Marking 'abbreviation exists' as false`);
                  return null
                }


              } else {

                // An Organisation record with the same abbreviation was not found
                this.log.trace(`${LOG_PREFIX} An Organisation record with the same abbreviation was not found`);

                // Mark 'abbreviation exists' as false
                this.log.trace(`${LOG_PREFIX} Marking 'abbreviation exists' as false`);
                return null

              }
            }

            )
          );

      } else {

        // An abbreviation value has not been provided
        this.log.trace(`${LOG_PREFIX} An abbreviation value has not been provided`);

        // Mark 'abbreviation exists' as false
        this.log.trace(`${LOG_PREFIX} Marking 'abbreviation exists' as false`);
        return of(null)
      }

    };

  }




  /**
   * Validates and saves the updated Organisation Record.
   * Emits a succeeded or failed event in response to whether or not the updation exercise was successful.
   * Error 400 = Indicates an invalid Form Control Entry was supplied.
   * Error 500 = Indicates something unexpected happened at the server side
   */
  public save(): void {


    this.log.trace(`${LOG_PREFIX} Entering save()`);

    // Check if the target Organisation record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Organisation record was successfully initialised()`);
    if (this.organisation) {

      // The target Organisation record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Organisation record was successfully initialised()`);

      // Check if the data entry form is valid
      this.log.trace(`${LOG_PREFIX} Checking if the data entry form is valid`);
      if (this.organisationsForm.valid) {

        // The data entry form is valid
        this.log.trace(`${LOG_PREFIX} The data entry form is valid`);

        // Read in the provided parent Organisation Type Id
        this.log.trace(`${LOG_PREFIX} Reading in the provided parent Organisation Type Id`);
        const typeId: number | null | undefined = this.organisationsForm.get('typeId')?.value;
        this.log.debug(`${LOG_PREFIX} Parent Organisation Type Id = ${typeId}`);

        // Read in the provided name
        this.log.trace(`${LOG_PREFIX} Reading in the provided name`);
        const name: string | null | undefined = this.organisationsForm.get('name')?.value?.trim();
        this.log.debug(`${LOG_PREFIX} Organisation Name = ${name}`);

        // Read in the provided abbreviation
        this.log.trace(`${LOG_PREFIX} Reading in the provided abbreviation`);
        const abbreviation: string | null | undefined = this.organisationsForm.get('abbreviation')?.value?.trim();
        this.log.debug(`${LOG_PREFIX} Organisation Abbreviation = ${abbreviation}`);

        // Read in the provided website
        this.log.trace(`${LOG_PREFIX} Reading in the provided website`);
        const website: string | null | undefined = this.organisationsForm.get('website')?.value?.trim();
        this.log.debug(`${LOG_PREFIX} Organisation Website = ${website}`);

        // Save the record
        this.log.trace(`${LOG_PREFIX} Saving the Organisations Record`);
        this.organisationsDataService
          .updateOrganisation(Object.assign(this.organisation, {
            data: {
              typeId,
              name,
              abbreviation,
              website
            }
          }))
          .subscribe({
            next: (response: Organisation) => {

              // The Organisation Record was saved successfully
              this.log.trace(`${LOG_PREFIX} Organisation Record was saved successfuly`);

              // Reset the forms
              this.log.trace(`${LOG_PREFIX} Resetting the forms`);
              this.organisationsForm.controls['name'].reset();
              this.organisationsForm.controls['abbreviation'].reset();
              this.organisationsForm.controls['website'].reset();

              // Emit a 'succeeded' event
              this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
              this.succeeded.emit();
            },
            error: (error: any) => {

              // The Organisation Record was not saved successfully
              this.log.trace(`${LOG_PREFIX} Organisation Record was not saved successfuly`);

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
        this.validateAllFormFields(this.organisationsForm);

        // Emit an 'invalid' event
        this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
        this.failed.emit(400);
      }


    } else {
      // The target Organisation record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Organisation record was not successfully initialised()`);

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
