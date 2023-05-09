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
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { VisualisationsDataTypesDataService } from '@modules/visualisation-data-types/services/visualisation-data-types-data.service';
import { VisualisationsFormatsDataService } from '@modules/visualisations-formats/services/visualisations-formats-data.service';
import { VisualisationType } from '@modules/visualisations-types/models/visualisation-type.model';
import { VisualisationsTypesDataService } from '@modules/visualisations-types/services/visualisation-types-data.service';
import { Visualisation } from '@modules/visualisations/models/visualisation.model';
import { VisualisationsDataService } from '@modules/visualisations/services/visualisations-data.service';
import { VisualisationsMessagesService } from '@modules/visualisations/services/visualisations-message.service';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Visualisations Records Updation Component]";

@Component({
  selector: 'sb-visualisations-records-updation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './visualisations-records-updation.component.html',
  styleUrls: ['visualisations-records-updation.component.scss'],
})
export class VisualisationsRecordsUpdationComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Visualisation record
  @Input() public id!: number;

  // Broadcasts successful Visualisations updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Visualisations updation events together with their error codes
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the Visualisation record with the passed in id
  public visualisation: Visualisation | null | undefined;

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

  // Keeps tabs of whether the component has been successfully initialised
  public initialised: boolean = false;

  constructor(
    private cd: ChangeDetectorRef,
    public visualisationsFormatsDataService: VisualisationsFormatsDataService,
    public visualisationsTypesDataService: VisualisationsTypesDataService,
    public visualisationsDataTypesDataService: VisualisationsDataTypesDataService,
    private visualisationsDataService: VisualisationsDataService,
    public visualisationsMessagesService: VisualisationsMessagesService,
    private log: NGXLogger) {

  }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Visualisation field based on the passed in id
    this.initialiseVisualisation(() => {

      // Initialise the Visualisation updation form based on the target Context
      this.initialiseVisualisationUpdationForm(() => {

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

  public getVisualisationFormatId(): number | null | undefined {
    return this.visualisationsForm.get('formatId')?.value;
  }


  /**
   * Retrieves the Visualisation with the injected id and sets it as the Visualisation that needs to be updated
   * @param callback The function to call when done
   */
  private initialiseVisualisation(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseVisualisation()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveVisualisationRecord(this.id, (visualisation: Visualisation | null) => {

      // Set the target Visualisation
      this.log.trace(`${LOG_PREFIX} Setting the target Visualisation`);
      this.visualisation = visualisation;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }


  /**
   * Initialises the Visualisation updation form
   * @param callback The function to call when done
   */
  private initialiseVisualisationUpdationForm(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseVisualisationUpdationForm()`);
    this.log.debug(`${LOG_PREFIX} Target Visualisation Record = ${JSON.stringify(this.visualisation)}`);

    // Initialise the Visualisation Records form fields
    this.log.trace(`${LOG_PREFIX} Initialising the Visualisation Records form fields`);
    if (this.visualisation?.data.visualisationTypeId) {
      this.visualisationsTypesDataService.getVisualisationTypeById$(this.visualisation?.data.visualisationTypeId).subscribe({
        next: (visualisationType: VisualisationType) => {
          this.visualisationsForm.setValue({
            formatId: visualisationType.data.parentId ? visualisationType.data.parentId : null,
            typeId: this.visualisation?.data.visualisationTypeId ? this.visualisation?.data.visualisationTypeId : null,
            dataTypeId: this.visualisation?.data.visualisationDataTypeId ? this.visualisation.data.visualisationDataTypeId : null,
            name: this.visualisation?.data.name ? this.visualisation.data.name : null
          });
        }
      })

    } else {
      this.visualisationsForm.setValue({
        formatId: null,
        typeId: this.visualisation?.data.visualisationTypeId ? this.visualisation?.data.visualisationTypeId : null,
        dataTypeId: this.visualisation?.data.visualisationDataTypeId ? this.visualisation.data.visualisationDataTypeId : null,
        name: this.visualisation?.data.name ? this.visualisation.data.name : null
      });
    }

    // Return
    this.log.trace(`${LOG_PREFIX} Returning`);
    callback();

  }

  /**
   * Retrieves an Visualisation record given its unique identifier synchronously
   * @param id The unique identifier of the Visualisation
   * @param callback The function to call when done
   */
  private retrieveVisualisationRecord(id: number, callback: (visualisation: Visualisation | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveVisualisationRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the Visualisation Type Id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the Visualisation Type Id has been specified`);
    if (id) {

      // The Visualisation Type Id has been specified
      this.log.trace(`${LOG_PREFIX} The Visualisation Type Id has been specified`);
      this.log.debug(`${LOG_PREFIX} Visualisation Id = ${JSON.stringify(id)}`);

      // Try retrieving an Visualisation Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve an Visualisation Record with the passed in id`);
      this.visualisationsDataService
      .getVisualisations(false, {
          searchTerm: null,
          page: null,
          pageSize: null,
          sortColumn: null,
          sortDirection: null,
          id: id,
          visualisationContainerId: null,
          visualisationTypeId: null,
          visualisationDataTypeId: null,
          name: null
      })
      .subscribe({
          next: (visualisations: Visualisation[]) => {
              if(visualisations.length > 0) {
                callback(visualisations[0]);
              } else {
                callback(null);
              }
          },
          error: (err: Error) => {
              callback(null);
          }
      });

    } else {

      // The Visualisation Type Id has not been specified
      this.log.error(`${LOG_PREFIX} The Visualisation Type Id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }


  /**
   * Validates and saves the updated Visualisation Record.
   * Emits a succeeded or failed event in response to whether or not the updation exercise was successful.
   * Error 400 = Indicates an invalid Form Control Entry was supplied.
   * Error 500 = Indicates something unexpected happened at the server side
   */
  public save(): void {


    this.log.trace(`${LOG_PREFIX} Entering save()`);

    // Check if the target Visualisation record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Visualisation record was successfully initialised()`);
    if (this.visualisation) {

      // The target Visualisation record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Visualisation record was successfully initialised()`);

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
          .updateVisualisation({
            id: this.visualisation.id,
            data: {
              visualisationContainerId: this.visualisation.data.visualisationContainerId,
              visualisationTypeId: typeId,
              visualisationDataTypeId: dataTypeId,
              name: name,
              entityTypeId: null
            },
            version: this.visualisation.version
          })
          .subscribe({
            next: (response: Visualisation) => {

              // The Visualisation Record was saved successfully
              this.log.trace(`${LOG_PREFIX} Visualisation Record was saved successfuly`);

              this.visualisationsMessagesService.broadcastVisualisationModificationMessage();

              // Reset the form
              this.log.trace(`${LOG_PREFIX} Resetting the form`);
              this.visualisationsForm.reset();

              // Emit a 'succeeded' event
              this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
              this.succeeded.emit();
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


    } else {
      // The target Visualisation record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Visualisation record was not successfully initialised()`);

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
