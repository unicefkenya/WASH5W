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
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { VisualisationAxis } from '@modules/visualisation-axes/models/visualisation-axis.model';
import { VisualisationsAxesDataService } from '@modules/visualisation-axes/services/visualisations-axes-data.service';
import { VisualisationsDataTypesDataService } from '@modules/visualisation-data-types/services/visualisation-data-types-data.service';
import { VisualisationsFormatsDataService } from '@modules/visualisations-formats/services/visualisations-formats-data.service';
import { VisualisationsTypesDataService } from '@modules/visualisations-types/services/visualisation-types-data.service';
import { Visualisation } from '@modules/visualisations/models/visualisation.model';
import { VisualisationsDataService } from '@modules/visualisations/services/visualisations-data.service';
import { VisualisationsMessagesService } from '@modules/visualisations/services/visualisations-message.service';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Visualisations Records Creation Component]";

@Component({
  selector: 'sb-visualisations-records-creation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './visualisations-records-creation.component.html',
  styleUrls: ['visualisations-records-creation.component.scss'],
})
export class VisualisationsRecordsCreationComponent implements OnInit, OnDestroy {

  // Allows the parent component to inject the unique identifier of the parent Container record
  @Input() public containerId!: number;

  // Broadcasts successful Visualisations creation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Visualisations creation events together with their error codes
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Defines Visualisations reactive form controls group
  visualisationsForm = new FormGroup({

    formatId: new FormControl<number | null>(null,
      [Validators.required]),

    typeId: new FormControl<number | null>(null,
      [Validators.required]),

    dataTypeId: new FormControl<number | null>(null,
      [Validators.required]),

    name: new FormControl<string | null>('',
      [Validators.required, Validators.minLength(2), Validators.maxLength(250)])

  });


  constructor(
    public visualisationsFormatsDataService: VisualisationsFormatsDataService,
    public visualisationsTypesDataService: VisualisationsTypesDataService,
    public visualisationsDataTypesDataService: VisualisationsDataTypesDataService,
    private visualisationsDataService: VisualisationsDataService,
    public visualisationsMessagesService: VisualisationsMessagesService,
    public visualisationsAxesDataService: VisualisationsAxesDataService,
    private log: NGXLogger) {

  }


  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Mark Init as complete
    this.log.trace(`${LOG_PREFIX} Init completed`);

  }



  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy`);

  }

  public getVisualisationFormatId(): number | null | undefined {
    return this.visualisationsForm.get('formatId')?.value;
  }


  /**
   * Validates and saves a new Visualisations Record.
   * Emits a succeeded or failed event depending on whether the save request succeeded or failed respectively
   * Error 400 = Indicates that a user error was encountered
   * Error 500 = Indicates that a system error was encountered
   */
  public save(): void {

    this.log.trace(`${LOG_PREFIX} Entering save()`);

    // Check if the data entry form is valid
    this.log.trace(`${LOG_PREFIX} Checking if the data entry form is valid`);
    if (this.visualisationsForm.valid) {

      // The data entry form is valid
      this.log.trace(`${LOG_PREFIX} The data entry form is valid`);

      // Read in the provided Type Id
      this.log.trace(`${LOG_PREFIX} Reading in the provided type Id`);
      const typeId: number | null | undefined = this.visualisationsForm.get('typeId')?.value;
      this.log.debug(`${LOG_PREFIX} Type Id = ${typeId}`);

      // Read in the provided Data Type Id
      this.log.trace(`${LOG_PREFIX} Reading in the provided data type Id`);
      const dataTypeId: number | null | undefined = this.visualisationsForm.get('dataTypeId')?.value;
      this.log.debug(`${LOG_PREFIX} Data Type Id = ${dataTypeId}`);

      // Read in the provided name
      this.log.trace(`${LOG_PREFIX} Reading in the provided name`);
      const name: string | null | undefined = this.visualisationsForm.get('name')?.value?.trim();
      this.log.debug(`${LOG_PREFIX} Visualisation Name = ${name}`);

      // Save the record
      this.log.trace(`${LOG_PREFIX} Saving the Visualisations Record`);
      this.visualisationsDataService
        .createVisualisation(
          new Visualisation({
            data: {
              visualisationContainerId: this.containerId,
              visualisationTypeId: typeId,
              visualisationDataTypeId: dataTypeId,
              name: name,
              entityTypeId: null
            },
            version: null
          }))
        .subscribe({
          next: (response: Visualisation) => {

            // The Visualisation Record was saved successfully
            this.log.trace(`${LOG_PREFIX} Visualisation Record was saved successfuly`);

            switch (response.data.visualisationTypeId) {
              case 1:
              case 2:
              case 3:
              case 4:
              case 5:

                this.createAxis(response.id, 1, "X", () => {
                  this.createAxis(response.id, 2, "Y", () => {

                    // Broadcast
                    this.visualisationsMessagesService.broadcastVisualisationModificationMessage();

                    // Reset the forms
                    this.log.trace(`${LOG_PREFIX} Resetting the forms`);
                    this.visualisationsForm.controls['name'].reset();
                    this.visualisationsForm.controls['dataTypeId'].reset();
                    this.visualisationsForm.controls['typeId'].reset();
                    this.visualisationsForm.controls['formatId'].reset();

                    // Emit a 'succeeded' event
                    this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
                    this.succeeded.emit();
                  })
                })
                
                break;

              default:
                // Broadcast
                this.visualisationsMessagesService.broadcastVisualisationModificationMessage();

                // Reset the forms
                this.log.trace(`${LOG_PREFIX} Resetting the forms`);
                this.visualisationsForm.controls['name'].reset();
                this.visualisationsForm.controls['dataTypeId'].reset();
                this.visualisationsForm.controls['typeId'].reset();
                this.visualisationsForm.controls['formatId'].reset();

                // Emit a 'succeeded' event
                this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
                this.succeeded.emit();
            }


          },
          error: (error: any) => {

            // The Visualisation Record was not saved successfully
            this.log.trace(`${LOG_PREFIX} Visualisation Record was not saved successfuly`);

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
      this.validateAllFormFields(this.visualisationsForm);

      // Emit an 'invalid' event
      this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
      this.failed.emit(400);
    }

  }

  private createAxis(visualisationId: number | null | undefined, axisId: number, label: string, callback: () => void): void {
    callback();
    /*this.visualisationsAxesDataService
      .createVisualisationAxis({
        id: null,
        data: {
          visualisationId: visualisationId,
          axisId: axisId,
          label: label
        },
        version: null
      })
      .subscribe({
        next: (response: VisualisationAxis) => {

          // The Visualisation Axis Record was saved successfully
          this.log.trace(`${LOG_PREFIX} Visualisation Axis Record was saved successfuly`);
          callback();
        },
        error: (error: any) => {

          // The Visualisation Axis Record was not saved successfully
          this.log.error(`${LOG_PREFIX} Visualisation Axis Record was not saved successfuly`);
          callback();
        }
      });*/
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
