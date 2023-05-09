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
import { DissagregationScheme } from '@modules/dissagregations-schemes/models/dissagregation-scheme.model';
import { DissagregationsSchemesDataService } from '@modules/dissagregations-schemes/services/dissagregations-schemes-data.service';
import { NGXLogger } from 'ngx-logger';
import { Observable, map, of } from 'rxjs';

const LOG_PREFIX: string = "[Dissagregations Schemes Records Updation Component]";

@Component({
  selector: 'sb-dissagregationsSchemes-records-updation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dissagregations-schemes-records-updation.component.html',
  styleUrls: ['dissagregations-schemes-records-updation.component.scss'],
})
export class DissagregationsSchemesRecordsUpdationComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Dissagregation Scheme record
  @Input() public id!: number;

  // Broadcasts successful Dissagregations Schemes updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Dissagregations Schemes updation events together with their error plurals
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the target Dissagregation Scheme record
  public dissagregationScheme: DissagregationScheme | null | undefined = undefined;

  // Defines Dissagregations Schemes reactive form controls group
  public dissagregationsSchemesForm = new FormGroup({

    name: new FormControl<string | null>('',
      [Validators.required, Validators.minLength(2), Validators.maxLength(250)],
      [this.nameExists()])

  });



  constructor(
    private dissagregationsSchemesDataService: DissagregationsSchemesDataService,
    private log: NGXLogger) {

  }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Dissagregation Scheme field based on the passed in id
    this.initialiseDissagregationScheme(() => {

      // Initialise the Dissagregation Scheme updation form based on the target Dissagregation Scheme
      this.initialiseDissagregationSchemeUpdationForm(() => {

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
   * Retrieves the Dissagregation Scheme with the injected id and sets it as the Dissagregation Scheme that needs to be updated
   * @param callback The function to call when done
   */
  private initialiseDissagregationScheme(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseDissagregationScheme()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveDissagregationSchemeRecord(this.id, (dissagregationScheme: DissagregationScheme | null) => {

      // Set the target Dissagregation Scheme
      this.log.trace(`${LOG_PREFIX} Setting the target Dissagregation Scheme`);
      this.dissagregationScheme = dissagregationScheme;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }


  /**
   * Initialises the Dissagregation Scheme updation form
   * @param callback The function to call when done
   */
  private initialiseDissagregationSchemeUpdationForm(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseDissagregationSchemeUpdationForm()`);
    this.log.debug(`${LOG_PREFIX} Target Dissagregation Scheme Record = ${JSON.stringify(this.dissagregationScheme)}`);

    // Initialise the Dissagregation Scheme Records form fields
    this.log.trace(`${LOG_PREFIX} Initialising the Dissagregation Scheme Records form fields`);
    this.dissagregationsSchemesForm.setValue({
      name: (this.dissagregationScheme && this.dissagregationScheme.data?.name) ? this.dissagregationScheme.data?.name : ""
    });

    // Return
    this.log.trace(`${LOG_PREFIX} Returning`);
    callback();

  }

  /**
   * Retrieves an Dissagregation Scheme record given its unique identifier synchronously
   * @param id The unique identifier of the Dissagregation Scheme
   * @param callback The function to call when done
   */
  private retrieveDissagregationSchemeRecord(id: number, callback: (dissagregationScheme: DissagregationScheme | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveDissagregationSchemeRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the dissagregationScheme id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the dissagregationScheme id has been specified`);
    if (id) {

      // The Dissagregation Scheme id has been specified
      this.log.trace(`${LOG_PREFIX} The Dissagregation Scheme id has been specified`);
      this.log.debug(`${LOG_PREFIX} Dissagregation Scheme Id = ${JSON.stringify(id)}`);

      // Try retrieving an Dissagregation Scheme Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve an Dissagregation Scheme Record with the passed in id`);
      const dissagregationScheme: DissagregationScheme | undefined = id ? this.dissagregationsSchemesDataService.records.find(d => d.id == id) : undefined;

      // Check if the Dissagregation Scheme Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the Dissagregation Scheme Record was successfully retrieved`);
      if (dissagregationScheme) {

        // The Dissagregation Scheme Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Dissagregation Scheme Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} Dissagregation Scheme Record = ${JSON.stringify(this.dissagregationScheme)}`);

        // Return the Dissagregation Scheme
        this.log.warn(`${LOG_PREFIX} Returning the Dissagregation Scheme`);
        callback(dissagregationScheme);

      } else {

        // The Dissagregation Scheme Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Dissagregation Scheme Record was not successfully retrieved`);

        // Return null
        this.log.warn(`${LOG_PREFIX} Returning null`);
        callback(null);

      }


    } else {

      // The Dissagregation Scheme id has not been specified
      this.log.error(`${LOG_PREFIX} The Dissagregation Scheme id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }



  /**
   * Internal validator that checks whether a proposed Dissagregation Scheme's Name already exists
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

        // Attempt retrieving Dissagregations Schemes with the same Name
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve Dissagregations Schemes with the same Name`);
        return this.dissagregationsSchemesDataService
          .getDissagregationsSchemes(false, {
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            ids: null,
            name: control.value.trim()
          })
          .pipe(
            map((dissagregationsSchemes: DissagregationScheme[]) => {

              // Check if an Dissagregation Scheme record with the same Name was found
              this.log.trace(`${LOG_PREFIX} Checking if an Dissagregation Scheme record with the same Name was found`);

              if (dissagregationsSchemes.length > 0) {

                // An Dissagregation Scheme record with the same Name was found
                this.log.trace(`${LOG_PREFIX} An Dissagregation Scheme record with the same Name was found`);

                // Retrieve the Dissagregation Scheme record with the specified Name
                this.log.trace(`${LOG_PREFIX} Retrieving the Dissagregation Scheme record with the specified Name`);
                const dissagregationScheme: DissagregationScheme | undefined = dissagregationsSchemes.find(s => s.data.name?.toLowerCase() == control.value.toLowerCase());
                this.log.trace(`${LOG_PREFIX} Dissagregation Scheme record = ${JSON.stringify(dissagregationScheme)}`);

                // Check if the Dissagregation Scheme record's identity is different from the current Dissagregation Scheme record's identity
                this.log.trace(`${LOG_PREFIX} Checking if the Dissagregation Scheme record's identity is different from the current Dissagregation Scheme record's identity`);

                if (dissagregationScheme && dissagregationScheme.id != this.id) {

                  // The Dissagregation Scheme record's identity is different from the current Dissagregation Scheme record's identity
                  this.log.trace(`${LOG_PREFIX} The Dissagregation Scheme record's identity is different from the current Dissagregation Scheme record's identity`);

                  // Mark 'Name Exists' as true
                  this.log.trace(`${LOG_PREFIX} Marking 'Name Exists' as true`);
                  return { 'exists': true };

                } else {

                  // The Dissagregation Scheme record's identity is not different from the current Dissagregation Scheme record's identity
                  this.log.trace(`${LOG_PREFIX} The Dissagregation Scheme record's identity is not different from the current Dissagregation Scheme record's identity`);

                  // Mark 'Name Exists' as false
                  this.log.trace(`${LOG_PREFIX} Marking 'Name Exists' as false`);
                  return null;
                }


              } else {

                // An Dissagregation Scheme record with the same Name was not found
                this.log.trace(`${LOG_PREFIX} An Dissagregation Scheme record with the same Name was not found`);

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
   * Validates and saves a new Dissagregation Scheme Record.
   * Emits a succeeded or failed event depending on whether the save request succeeded or failed respectively
   * Error 400 = Indicates that a user error was encountered
   * Error 500 = Indicates that a system error was encountered
   */
  public save(): void {

    this.log.trace(`${LOG_PREFIX} Entering save()`);

    // Check if the target Dissagregation Scheme record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Dissagregation Scheme record was successfully initialised()`);
    if (this.dissagregationScheme) {

      // The target Dissagregation Scheme record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Dissagregation Scheme record was successfully initialised()`);

      // Check if the data entry form is valid
      this.log.trace(`${LOG_PREFIX} Checking if the data entry form is valid`);
      if (this.dissagregationsSchemesForm.valid) {

        // The data entry form is valid
        this.log.trace(`${LOG_PREFIX} The data entry form is valid`);

        // Read in the provided name
        this.log.trace(`${LOG_PREFIX} Reading in the provided name`);
        const name: string | null | undefined = this.dissagregationsSchemesForm.get('name')?.value?.trim();
        this.log.debug(`${LOG_PREFIX} Dissagregation Scheme Name = ${name}`);

        // Save the record
        this.log.trace(`${LOG_PREFIX} Saving the Dissagregation Scheme Record`);
        this.dissagregationsSchemesDataService
          .updateDissagregationScheme(Object.assign(this.dissagregationScheme, { data: { name } }))
          .subscribe({
            next: (response: DissagregationScheme) => {

              // The Dissagregation Scheme Record was saved successfully
              this.log.trace(`${LOG_PREFIX} The Dissagregation Scheme Record was successfuly updated`);

              // Reset the form
              this.log.trace(`${LOG_PREFIX} Resetting the form`);
              this.dissagregationsSchemesForm.reset();

              // Emit a 'succeeded' event
              this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
              this.succeeded.emit();
            },
            error: (error: any) => {

              // The Dissagregation Scheme Record was not saved successfully
              this.log.trace(`${LOG_PREFIX} The Dissagregation Scheme Record was not successfuly updated`);

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
        this.validateAllFormFields(this.dissagregationsSchemesForm);

        // Emit an 'invalid' event
        this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
        this.failed.emit(400);

      }

    } else {
      // The target Dissagregation Scheme record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Dissagregation Scheme record was not successfully initialised()`);

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
