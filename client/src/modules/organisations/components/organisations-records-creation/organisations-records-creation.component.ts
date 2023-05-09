import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { OrganisationType } from '@modules/organisations-types/models/organisation-type.model';
import { OrganisationsTypesDataService } from '@modules/organisations-types/services/organisations-types-data.service';
import { Organisation } from '@modules/organisations/models/organisation.model';
import { OrganisationsDataService } from '@modules/organisations/services/organisations-data.service';
import { NGXLogger } from 'ngx-logger';
import { Observable, map, of, first, BehaviorSubject } from 'rxjs';

const LOG_PREFIX: string = "[Organisations Records Creation Component]";

@Component({
  selector: 'sb-organisations-records-creation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './organisations-records-creation.component.html',
  styleUrls: ['organisations-records-creation.component.scss'],
})
export class OrganisationsRecordsCreationComponent implements OnInit, OnDestroy {

  // Allows the parent component to inject the unique identifier of the parent Context record
  @Input() public typeId: number | null = null;

  // Broadcasts successful Organisations creation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Organisations creation events together with their error codes
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

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
    private cd: ChangeDetectorRef,
    private log: NGXLogger) {

  }


  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    this.initialiseFormGroup(() => {

      // Mark Init as complete
      this.log.trace(`${LOG_PREFIX} Init completed`);

    });


  }

  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy`);

  }

  /**
   * Presets default values in the data creation form
   * @param callback The function to call when done
   */
  private initialiseFormGroup(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseFormGroup()`);

    // Preselect the active Type
    this.log.trace(`${LOG_PREFIX} Preselecting the active Type`);
    this.log.trace(`${LOG_PREFIX} Active Type = ${this.typeId}`);
    this.organisationsForm.get('typeId')?.setValue(this.typeId ? Number(this.typeId): null);

    // Return
    this.log.trace(`${LOG_PREFIX} Returning`);
    callback();

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

                // Mark 'code exists' as true
                this.log.trace(`${LOG_PREFIX} Marking 'code exists' as true`);
                return { 'exists': true };


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

                // Mark 'code exists' as true
                this.log.trace(`${LOG_PREFIX} Marking 'code exists' as true`);
                return { 'exists': true };


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
   * Validates and saves a new Organisations Record.
   * Emits a succeeded or failed event depending on whether the save request succeeded or failed respectively
   * Error 400 = Indicates that a user error was encountered
   * Error 500 = Indicates that a system error was encountered
   */
  public save(): void {

    this.log.trace(`${LOG_PREFIX} Entering save()`);

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
        .createOrganisation(
          new Organisation({
            data: {
              typeId,
              name,
              abbreviation,
              website
            },
            version: null
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
