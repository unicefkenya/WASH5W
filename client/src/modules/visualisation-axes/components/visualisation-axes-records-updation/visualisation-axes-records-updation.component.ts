import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { VisualisationAxis } from '@modules/visualisation-axes/models/visualisation-axis.model';
import { VisualisationsAxesDataService } from '@modules/visualisation-axes/services/visualisations-axes-data.service';
import { VisualisationsAxesMessagesService } from '@modules/visualisation-axes/services/visualisations-axes-message.service';
import { VisualisationsAxesTypesDataService } from '@modules/visualisations-axes-types/services/visualisations-axes-types-data.service';
import { NGXLogger } from 'ngx-logger';
import { map, Observable, of } from 'rxjs';

const LOG_PREFIX: string = "[Visualisation Axes Records Updation Component]";

@Component({
  selector: 'sb-visualisation-axes-records-updation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './visualisation-axes-records-updation.component.html',
  styleUrls: ['visualisation-axes-records-updation.component.scss'],
})
export class VisualisationAxesRecordsUpdationComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Visualisation Axis record
  @Input() public id!: number;

  // Broadcasts successful Visualisation Axes updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Visualisation Axes updation events together with their error codes
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the Visualisation Axis record with the passed in id
  public visualisationAxis: VisualisationAxis | null | undefined;

  // Defines Visualisation Axes reactive form controls group
  visualisationAxesForm = new FormGroup({

    typeId: new FormControl<number | null>(null,
      [Validators.required],
      [this.typeExists()]),

    label: new FormControl<string | null>('',
      [Validators.required, Validators.minLength(1), Validators.maxLength(250)],
      [this.labelExists()])

  });

  // Keeps tabs of whether the component has been successfully initialised
  public initialised: boolean = false;


  constructor(
    public visualisationsAxesTypesDataService: VisualisationsAxesTypesDataService,
    private visualisationsAxesDataService: VisualisationsAxesDataService,
    private visualisationsAxesMessagesService: VisualisationsAxesMessagesService,
    private cd: ChangeDetectorRef,
    private log: NGXLogger) {

  }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Visualisation Axis field based on the passed in id
    this.initialiseVisualisationAxis(() => {

      // Initialise the Visualisation Axis updation form based on the target Context
      this.initialiseVisualisationAxisUpdationForm(() => {

        // Mark Init as complete
        this.log.trace(`${LOG_PREFIX} Init completed`);
        this.initialised = true;
        this.cd.markForCheck();

      });
    });

  }


  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }


  /**
   * Retrieves the Visualisation Axis with the injected id and sets it as the Visualisation Axis that needs to be updated
   * @param callback The function to call when done
   */
  private initialiseVisualisationAxis(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseVisualisationAxis()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveVisualisationAxisRecord(this.id, (visualisationAxis: VisualisationAxis | null) => {

      // Set the target Visualisation Axis
      this.log.trace(`${LOG_PREFIX} Setting the target Visualisation Axis`);
      this.visualisationAxis = visualisationAxis;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }


  /**
   * Initialises the Visualisation Axis updation form
   * @param callback The function to call when done
   */
  private initialiseVisualisationAxisUpdationForm(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseVisualisationAxisUpdationForm()`);
    this.log.debug(`${LOG_PREFIX} Target Visualisation Axis Record = ${JSON.stringify(this.visualisationAxis)}`);

    // Initialise the Visualisation Axis Records form fields
    this.log.trace(`${LOG_PREFIX} Initialising the Visualisation Axis Records form fields`);
    this.visualisationAxesForm.setValue({
      typeId: this.visualisationAxis?.data.axisId ? this.visualisationAxis.data.axisId : null,
      label: this.visualisationAxis?.data.label ? this.visualisationAxis.data.label : null
    });

    // Return
    this.log.trace(`${LOG_PREFIX} Returning`);
    callback();

  }


  /**
   * Retrieves an Visualisation Axis record given its unique identifier synchronously
   * @param id The unique identifier of the Visualisation Axis
   * @param callback The function to call when done
   */
  private retrieveVisualisationAxisRecord(id: number, callback: (visualisationAxis: VisualisationAxis | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveVisualisationAxisRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the Visualisation Id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the Visualisation Id has been specified`);
    if (id) {

      // The Visualisation Id has been specified
      this.log.trace(`${LOG_PREFIX} The Visualisation Id has been specified`);
      this.log.debug(`${LOG_PREFIX} Visualisation Axis Id = ${JSON.stringify(id)}`);

      // Try retrieving an Visualisation Axis Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve an Visualisation Axis Record with the passed in id`);
      this.visualisationsAxesDataService
        .getVisualisationsAxes(false, {
          page: null,
          pageSize: null,
          searchTerm: null,
          sortColumn: null,
          sortDirection: null,
          id: id,
          visualisationId: null,
          axisId: null,
          label: null
        })
        .subscribe({
          next: (visualisationsAxes: VisualisationAxis[]) => {

            // Check if an Visualisation Axis record with the given id was found
            this.log.trace(`${LOG_PREFIX} Checking if an Visualisation Axis record with the given id was found`);
            if (visualisationsAxes.length > 0) {

              //An Visualisation Axis record with the given id was found
              this.log.trace(`${LOG_PREFIX} A Visualisation Axis record with the given id was found`);

              // Return the Visualisation Axis record
              this.log.trace(`${LOG_PREFIX} Returning the Visualisation Axis record`);
              callback(visualisationsAxes[0]);


            } else {

              //An Visualisation Axis record with the given id was not found
              this.log.trace(`${LOG_PREFIX} An Visualisation Axis record with the given id was not found`);

              // Return null
              this.log.warn(`${LOG_PREFIX} Return null`);
              callback(null);

            }
          },
          error: (err: Error) => {
            // Return null
            this.log.warn(`${LOG_PREFIX} Return null`);
            callback(null);
          }
        });


    } else {

      // The Visualisation Id has not been specified
      this.log.error(`${LOG_PREFIX} The Visualisation Id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }



  /**
   * Internal validator that checks whether a proposed Visualisation Axis's type already exists
   * @returns 
   */
  private typeExists(): AsyncValidatorFn {

    this.log.trace(`${LOG_PREFIX} Entering typeExists()`);

    return (control: AbstractControl): Observable<ValidationErrors | null> => {

      // Check if a type value has been provided
      this.log.trace(`${LOG_PREFIX} Check if a type value has been provided`);
      if (control.value) {

        // A type value has been provided
        this.log.trace(`${LOG_PREFIX} A type value has been provided`);

        // Attempt retrieving Visualisation Axes with the same type
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve Visualisation Axes with the same type`);
        return this.visualisationsAxesDataService
          .getVisualisationsAxes(false, {
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            id: null,
            visualisationId: this.visualisationAxis?.data.visualisationId,
            axisId: control.value,
            label: null
          })
          .pipe(
            map((visualisationsAxes: VisualisationAxis[]) => {

              // Check if an Visualisation Axis record with the same type was found
              this.log.trace(`${LOG_PREFIX} Checking if an Visualisation Axis record with the same type was found`);
              if (visualisationsAxes.length > 0) {

                // An Visualisation Axis record with the same axis was found
                this.log.trace(`${LOG_PREFIX} An Visualisation Axis record with the same axis was found`);

                // Retrieve the Visualisation Axis record with the specified axis
                this.log.trace(`${LOG_PREFIX} Retrieving the Visualisation Axis record with the specified axis`);
                const visualisationAxis: VisualisationAxis | undefined = visualisationsAxes.find(s => s.data.axisId == control.value);
                this.log.trace(`${LOG_PREFIX} Visualisation Axis record = ${JSON.stringify(visualisationAxis)}`);

                // Check if the Visualisation Axis record's identity is different from the current Visualisation Axis record's identity
                this.log.trace(`${LOG_PREFIX} Checking if the Visualisation Axis record's identity is different from the current Visualisation Axis record's identity`);

                if (visualisationAxis && visualisationAxis.id != this.id) {

                  // The Visualisation Axis record's identity is different from the current Visualisation Axis record's identity
                  this.log.trace(`${LOG_PREFIX} The Visualisation Axis record's identity is different from the current Visualisation Axis record's identity`);

                  // Mark 'axis exists' as true
                  this.log.trace(`${LOG_PREFIX} Marking 'axis exists' as true`);
                  return { 'exists': true };

                } else {

                  // The Visualisation Axis record's identity is not different from the current Visualisation Axis record's identity
                  this.log.trace(`${LOG_PREFIX} The Visualisation Axis record's identity is not different from the current Visualisation Axis record's identity`);

                  // Mark 'axis exists' as false
                  this.log.trace(`${LOG_PREFIX} Marking 'axis exists' as false`);
                  return null;
                }

              } else {

                // A Visualisation Axis record with the same type was not found
                this.log.trace(`${LOG_PREFIX} A Visualisation Axis record with the same type was not found`);

                // Mark 'type exists' as false
                this.log.trace(`${LOG_PREFIX} Marking 'type exists' as false`);
                return null

              }
            }

            )
          );

      } else {

        // A type value has not been provided
        this.log.trace(`${LOG_PREFIX} A type value has not been provided`);

        // Mark 'type exists' as false
        this.log.trace(`${LOG_PREFIX} Marking 'type exists' as false`);
        return of(null)
      }

    };

  }


  /**
   * Internal validator that checks whether a proposed Visualisation Axis's label already exists
   * @returns 
   */
  private labelExists(): AsyncValidatorFn {

    this.log.trace(`${LOG_PREFIX} Entering labelExists()`);

    return (control: AbstractControl): Observable<ValidationErrors | null> => {

      // Check if a label value has been provided
      this.log.trace(`${LOG_PREFIX} Check if a label value has been provided`);
      if (control.value) {

        // A label value has been provided
        this.log.trace(`${LOG_PREFIX} A label value has been provided`);

        // Attempt retrieving Visualisation Axes with the same label
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve Visualisation Axes with the same label`);
        return this.visualisationsAxesDataService
          .getVisualisationsAxes(false, {
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            id: null,
            visualisationId: this.visualisationAxis?.data.visualisationId,
            axisId: null,
            label: control.value
          })
          .pipe(
            map((visualisationsAxes: VisualisationAxis[]) => {

              // Check if an Visualisation Axis record with the same label was found
              this.log.trace(`${LOG_PREFIX} Checking if an Visualisation Axis record with the same label was found`);
              if (visualisationsAxes.length > 0) {

                // An Visualisation Axis record with the same axis was found
                this.log.trace(`${LOG_PREFIX} An Visualisation Axis record with the same axis was found`);

                // Retrieve the Visualisation Axis record with the specified axis
                this.log.trace(`${LOG_PREFIX} Retrieving the Visualisation Axis record with the specified axis`);
                const visualisationAxis: VisualisationAxis | undefined = visualisationsAxes.find(s => s.data.label?.toLowerCase() == control.value.toLowerCase());
                this.log.trace(`${LOG_PREFIX} Visualisation Axis record = ${JSON.stringify(visualisationAxis)}`);

                // Check if the Visualisation Axis record's identity is different from the current Visualisation Axis record's identity
                this.log.trace(`${LOG_PREFIX} Checking if the Visualisation Axis record's identity is different from the current Visualisation Axis record's identity`);

                if (visualisationAxis && visualisationAxis.id != this.id) {

                  // The Visualisation Axis record's identity is different from the current Visualisation Axis record's identity
                  this.log.trace(`${LOG_PREFIX} The Visualisation Axis record's identity is different from the current Visualisation Axis record's identity`);

                  // Mark 'axis exists' as true
                  this.log.trace(`${LOG_PREFIX} Marking 'label exists' as true`);
                  return { 'exists': true };

                } else {

                  // The Visualisation Axis record's identity is not different from the current Visualisation Axis record's identity
                  this.log.trace(`${LOG_PREFIX} The Visualisation Axis record's identity is not different from the current Visualisation Axis record's identity`);

                  // Mark 'axis exists' as false
                  this.log.trace(`${LOG_PREFIX} Marking 'label exists' as false`);
                  return null;
                }

              } else {

                // A Visualisation Axis record with the same label was not found
                this.log.trace(`${LOG_PREFIX} A Visualisation Axis record with the same label was not found`);

                // Mark 'label exists' as false
                this.log.trace(`${LOG_PREFIX} Marking 'label exists' as false`);
                return null

              }
            }

            )
          );

      } else {

        // A label value has not been provided
        this.log.trace(`${LOG_PREFIX} A label value has not been provided`);

        // Mark 'label exists' as false
        this.log.trace(`${LOG_PREFIX} Marking 'label exists' as false`);
        return of(null)
      }

    };

  }



  /**
   * Validates and saves the updated Visualisation Axis Record.
   * Emits a succeeded or failed event in response to whether or not the updation exercise was successful.
   * Error 400 = Indicates an invalid Form Control Entry was supplied.
   * Error 500 = Indicates something unexpected happened at the server side
   */
  public save(): void {


    this.log.trace(`${LOG_PREFIX} Entering save()`);

    // Check if the target Visualisation Axis record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Visualisation Axis record was successfully initialised()`);
    if (this.visualisationAxis) {

      // The target Visualisation Axis record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Visualisation Axis record was successfully initialised()`);

      // Check if the data entry form is valid
      this.log.trace(`${LOG_PREFIX} Checking if the data entry form is valid`);
      if (this.visualisationAxesForm.valid) {

        // The data entry form is valid
        this.log.trace(`${LOG_PREFIX} The data entry form is valid`);

        // Read in the provided Visualisation Axis Type Id
        this.log.trace(`${LOG_PREFIX} Reading in the provided Visualisation Axis Type Id`);
        const typeId: number | null | undefined = this.visualisationAxesForm.get('typeId')?.value;
        this.log.debug(`${LOG_PREFIX} Visualisation Axis Type Id = ${typeId}`);

        // Read in the provided label
        this.log.trace(`${LOG_PREFIX} Reading in the provided label`);
        const label: string | null | undefined = this.visualisationAxesForm.get('label')?.value?.trim();
        this.log.debug(`${LOG_PREFIX} Visualisation Axis Label = ${label}`);

        // Save the record
        this.log.trace(`${LOG_PREFIX} Saving the Visualisation Axis Record`);
        this.visualisationsAxesDataService
          .updateVisualisationAxis({
            id: this.visualisationAxis.id,
            data: {
              visualisationId: this.visualisationAxis.data.visualisationId,
              axisId: typeId,
              label: label
            },
            version: this.visualisationAxis.version
          })
          .subscribe({
            next: (response: VisualisationAxis) => {

              // The Visualisation Axis Record was saved successfully
              this.log.trace(`${LOG_PREFIX} Visualisation Axis Record was saved successfuly`);
              this.visualisationsAxesMessagesService.broadcastVisualisationAxisModificationMessage();

              // Reset the form
              this.log.trace(`${LOG_PREFIX} Resetting the form`);
              this.visualisationAxesForm.reset();

              // Emit a 'succeeded' event
              this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
              this.succeeded.emit();
            },
            error: (error: any) => {

              // The Visualisation Axis Record was not saved successfully
              this.log.trace(`${LOG_PREFIX} Visualisation Axis Record was not saved successfuly`);

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
        this.validateAllFormFields(this.visualisationAxesForm);

        // Emit an 'invalid' event
        this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
        this.failed.emit(400);
      }


    } else {
      // The target Visualisation Axis record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Visualisation Axis record was not successfully initialised()`);

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
