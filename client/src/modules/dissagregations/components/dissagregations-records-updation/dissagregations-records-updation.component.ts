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
import { Dissagregation } from '@modules/dissagregations/models/dissagregation.model';
import { DissagregationsDataService } from '@modules/dissagregations/services/dissagregations-data.service';
import { DissagregationsTypesDataService } from '@modules/dissagregations-types/services/dissagregations-types-data.service';
import { NGXLogger } from 'ngx-logger';
import { Observable, map, of } from 'rxjs';

const LOG_PREFIX: string = "[Dissagregations Records Updation Component]";

@Component({
  selector: 'sb-dissagregations-records-updation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dissagregations-records-updation.component.html',
  styleUrls: ['dissagregations-records-updation.component.scss'],
})
export class DissagregationsRecordsUpdationComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Dissagregation record
  @Input() public id!: number;

  // Broadcasts successful Dissagregations updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Dissagregations updation events together with their error codes
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the Dissagregation record with the passed in id
  public dissagregation: Dissagregation | null | undefined;

  // Defines Dissagregations reactive form controls group
  dissagregationsForm = new FormGroup({

    typeId: new FormControl<number | null>(null,
      [Validators.required]),

    name: new FormControl<string | null>('',
      [Validators.required, Validators.minLength(2), Validators.maxLength(250)],
      [this.nameExists()])

  });

  constructor(
    public dissagregationsTypesDataService: DissagregationsTypesDataService,
    private dissagregationsDataService: DissagregationsDataService,
    private log: NGXLogger) {

  }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Dissagregation field based on the passed in id
    this.initialiseDissagregation(() => {

      // Initialise the Dissagregation updation form based on the target Context
      this.initialiseDissagregationUpdationForm(() => {

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
   * Retrieves the Dissagregation with the injected id and sets it as the Dissagregation that needs to be updated
   * @param callback The function to call when done
   */
  private initialiseDissagregation(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseDissagregation()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveDissagregationRecord(this.id, (dissagregation: Dissagregation | null) => {

      // Set the target Dissagregation
      this.log.trace(`${LOG_PREFIX} Setting the target Dissagregation`);
      this.dissagregation = dissagregation;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }


  /**
   * Initialises the Dissagregation updation form
   * @param callback The function to call when done
   */
  private initialiseDissagregationUpdationForm(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseDissagregationUpdationForm()`);
    this.log.debug(`${LOG_PREFIX} Target Dissagregation Record = ${JSON.stringify(this.dissagregation)}`);

    // Initialise the Dissagregation Records form fields
    this.log.trace(`${LOG_PREFIX} Initialising the Dissagregation Records form fields`);
    this.dissagregationsForm.setValue({
      typeId: this.dissagregation?.data.typeId ? this.dissagregation.data.typeId : null,
      name: this.dissagregation?.data.name ? this.dissagregation.data.name : null
    });

    // Return
    this.log.trace(`${LOG_PREFIX} Returning`);
    callback();

  }

  /**
   * Retrieves an Dissagregation record given its unique identifier synchronously
   * @param id The unique identifier of the Dissagregation
   * @param callback The function to call when done
   */
  private retrieveDissagregationRecord(id: number, callback: (dissagregation: Dissagregation | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveDissagregationRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the Dissagregation Type Id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the Dissagregation Type Id has been specified`);
    if (id) {

      // The Dissagregation Type Id has been specified
      this.log.trace(`${LOG_PREFIX} The Dissagregation Type Id has been specified`);
      this.log.debug(`${LOG_PREFIX} Dissagregation Id = ${JSON.stringify(id)}`);

      // Try retrieving an Dissagregation Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve an Dissagregation Record with the passed in id`);
      const dissagregation: Dissagregation | undefined = id ? this.dissagregationsDataService.records.find(d => d.id == id) : undefined;

      // Check if the Dissagregation Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the Dissagregation Record was successfully retrieved`);
      if (dissagregation) {

        // The Dissagregation Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Dissagregation Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} Dissagregation Record = ${JSON.stringify(dissagregation)}`);

        // Return the Dissagregation
        this.log.trace(`${LOG_PREFIX} Returning the Dissagregation`);
        callback(dissagregation);

      } else {

        // The Dissagregation Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Dissagregation Record was not successfully retrieved`);

        // Return null
        this.log.warn(`${LOG_PREFIX} Returning null`);
        callback(null);

      }


    } else {

      // The Dissagregation Type Id has not been specified
      this.log.error(`${LOG_PREFIX} The Dissagregation Type Id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }


  /**
   * Internal validator that checks whether a proposed Dissagregation's name already exists
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

        // Attempt retrieving Dissagregations with the same name
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve Dissagregations with the same name`);
        return this.dissagregationsDataService
          .getDissagregations(false,{
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            ids: null,
            typeId: this.dissagregationsForm.get('typeId')?.value? this.dissagregationsForm.get('typeId')?.value as number : null,
            name: control.value?.trim()
          })
          .pipe(
            map((dissagregations: Dissagregation[]) => {

              // Check if an Dissagregation record with the same name was found
              this.log.trace(`${LOG_PREFIX} Checking if an Dissagregation record with the same name was found`);

              if (dissagregations.length > 0) {

                // A Dissagregation record with the same name was found
                this.log.trace(`${LOG_PREFIX} A Dissagregation record with the same name was found`);

                // Retrieve the Dissagregation record with the specified name
                this.log.trace(`${LOG_PREFIX} Retrieving the Dissagregation record with the specified name`);
                const dissagregation: Dissagregation | undefined = dissagregations.find(s => s.data.name?.toLowerCase() == control.value.toLowerCase());
                this.log.trace(`${LOG_PREFIX} Dissagregation record = ${JSON.stringify(dissagregation)}`);

                // Check if the Dissagregation record's identity is different from the current Dissagregation record's identity
                this.log.trace(`${LOG_PREFIX} Checking if the Dissagregation record's identity is different from the current Dissagregation record's identity`);

                if (dissagregation && dissagregation.id != this.id) {

                  // The Dissagregation record's identity is different from the current Dissagregation record's identity
                  this.log.trace(`${LOG_PREFIX} The Dissagregation record's identity is different from the current Dissagregation record's identity`);

                  // Mark 'code exists' as true
                  this.log.trace(`${LOG_PREFIX} Marking 'code exists' as true`);
                  return { 'exists': true };

                } else {

                  // The Dissagregation record's identity is not different from the current Dissagregation record's identity
                  this.log.trace(`${LOG_PREFIX} The Dissagregation record's identity is not different from the current Dissagregation record's identity`);

                  // Mark 'name exists' as false
                  this.log.trace(`${LOG_PREFIX} Marking 'name exists' as false`);
                  return null
                }


              } else {

                // A Dissagregation record with the same name was not found
                this.log.trace(`${LOG_PREFIX} A Dissagregation record with the same name was not found`);

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
   * Validates and saves the updated Dissagregation Record.
   * Emits a succeeded or failed event in response to whether or not the updation exercise was successful.
   * Error 400 = Indicates an invalid Form Control Entry was supplied.
   * Error 500 = Indicates something unexpected happened at the server side
   */
  public save(): void {


    this.log.trace(`${LOG_PREFIX} Entering save()`);

    // Check if the target Dissagregation record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Dissagregation record was successfully initialised()`);
    if (this.dissagregation) {

      // The target Dissagregation record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Dissagregation record was successfully initialised()`);

      // Check if the data entry form is valid
      this.log.trace(`${LOG_PREFIX} Checking if the data entry form is valid`);
      if (this.dissagregationsForm.valid) {

        // The data entry form is valid
        this.log.trace(`${LOG_PREFIX} The data entry form is valid`);

      // Read in the provided parent Dissagregation Type Id
      this.log.trace(`${LOG_PREFIX} Reading in the provided parent Dissagregation Type Id`);
      const typeId: number | null | undefined = this.dissagregationsForm.get('typeId')?.value;
      this.log.debug(`${LOG_PREFIX} Parent Dissagregation Type Id = ${typeId}`);

      // Read in the provided name
      this.log.trace(`${LOG_PREFIX} Reading in the provided name`);
      const name: string | null | undefined = this.dissagregationsForm.get('name')?.value?.trim();
      this.log.debug(`${LOG_PREFIX} Dissagregation Name = ${name}`);

        // Save the record
        this.log.trace(`${LOG_PREFIX} Saving the Dissagregations Record`);
        this.dissagregationsDataService
          .updateDissagregation(Object.assign(this.dissagregation, {
            data: {
              typeId,
              name
            }
          }))
          .subscribe({
            next: (response: Dissagregation) => {

              // The Dissagregation Record was saved successfully
              this.log.trace(`${LOG_PREFIX} Dissagregation Record was saved successfuly`);

              // Reset the form
              this.log.trace(`${LOG_PREFIX} Resetting the form`);
              this.dissagregationsForm.reset();

              // Emit a 'succeeded' event
              this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
              this.succeeded.emit();
            },
            error: (error: any) => {

              // The Dissagregation Record was not saved successfully
              this.log.trace(`${LOG_PREFIX} Dissagregation Record was not saved successfuly`);

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
        this.validateAllFormFields(this.dissagregationsForm);

        // Emit an 'invalid' event
        this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
        this.failed.emit(400);
      }


    } else {
      // The target Dissagregation record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Dissagregation record was not successfully initialised()`);

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
