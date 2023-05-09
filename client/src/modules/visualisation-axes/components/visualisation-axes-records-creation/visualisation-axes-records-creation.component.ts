import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { VisualisationAxis } from '@modules/visualisation-axes/models/visualisation-axis.model';
import { VisualisationsAxesDataService } from '@modules/visualisation-axes/services/visualisations-axes-data.service';
import { VisualisationsAxesMessagesService } from '@modules/visualisation-axes/services/visualisations-axes-message.service';
import { VisualisationsAxesTypesDataService } from '@modules/visualisations-axes-types/services/visualisations-axes-types-data.service';
import { NGXLogger } from 'ngx-logger';
import { Observable, map, of } from 'rxjs';

const LOG_PREFIX: string = "[Visualisation Axes Records Creation Component]";

@Component({
  selector: 'sb-visualisation-axes-records-creation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './visualisation-axes-records-creation.component.html',
  styleUrls: ['visualisation-axes-records-creation.component.scss'],
})
export class VisualisationAxesRecordsCreationComponent implements OnInit, OnDestroy {

  // Allows the parent component to inject the unique identifier of the parent visualisation record
  @Input() public visualisationId!: number;

  // Broadcasts successful Visualisation Axes creation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Visualisation Axes creation events together with their error codes
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Defines Visualisation Axes reactive form controls group
  visualisationAxesForm = new FormGroup({

    typeId: new FormControl<number | null>(null,
      [Validators.required],
      [this.typeExists()]),

    label: new FormControl<string | null>('',
      [Validators.required, Validators.minLength(1), Validators.maxLength(250)],
      [this.labelExists()])

  });


  constructor(
    public visualisationsAxesTypesDataService: VisualisationsAxesTypesDataService,
    private visualisationsAxesDataService: VisualisationsAxesDataService,
    private visualisationsAxesMessagesService: VisualisationsAxesMessagesService,
    private log: NGXLogger) {

  }


  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Preselect the active Context in the data tabulation form
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

    // Return
    this.log.trace(`${LOG_PREFIX} Returning`);
    callback();

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
            visualisationId: this.visualisationId,
            axisId: control.value,
            label: null
          })
          .pipe(
            map((visualisationAxes: VisualisationAxis[]) => {

              // Check if an Visualisation Axis record with the same type was found
              this.log.trace(`${LOG_PREFIX} Checking if an Visualisation Axis record with the same type was found`);
              if (visualisationAxes.length > 0) {

                // A Visualisation Axis record with the same type was found
                this.log.trace(`${LOG_PREFIX} A Visualisation Axis record with the same type was found`);

                // Mark 'code exists' as true
                this.log.trace(`${LOG_PREFIX} Marking 'code exists' as true`);
                return { 'exists': true };


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
            visualisationId: this.visualisationId,
            axisId: null,
            label: control.value
          })
          .pipe(
            map((visualisationAxes: VisualisationAxis[]) => {

              // Check if an Visualisation Axis record with the same label was found
              this.log.trace(`${LOG_PREFIX} Checking if an Visualisation Axis record with the same label was found`);
              if (visualisationAxes.length > 0) {

                // A Visualisation Axis record with the same label was found
                this.log.trace(`${LOG_PREFIX} A Visualisation Axis record with the same label was found`);

                // Mark 'code exists' as true
                this.log.trace(`${LOG_PREFIX} Marking 'code exists' as true`);
                return { 'exists': true };


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
   * Validates and saves a new Visualisation Axes Record.
   * Emits a succeeded or failed event depending on whether the save request succeeded or failed respectively
   * Error 400 = Indicates that a user error was encountered
   * Error 500 = Indicates that a system error was encountered
   */
  public save(): void {

    this.log.trace(`${LOG_PREFIX} Entering save()`);

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
        .createVisualisationAxis(
          new VisualisationAxis({
            data: {
              visualisationId: this.visualisationId,
              axisId: typeId,
              label: label
            },
            version: null
          }))
        .subscribe({
          next: (response: VisualisationAxis) => {

            // The Visualisation Axis Record was saved successfully
            this.log.trace(`${LOG_PREFIX} Visualisation Axis Record was saved successfuly`);
            this.visualisationsAxesMessagesService.broadcastVisualisationAxisModificationMessage();

            // Reset the forms
            this.log.trace(`${LOG_PREFIX} Resetting the forms`);
            this.visualisationAxesForm.controls['typeId'].reset();
            this.visualisationAxesForm.controls['label'].reset();

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
