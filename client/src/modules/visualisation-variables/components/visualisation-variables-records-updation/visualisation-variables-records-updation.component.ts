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
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { TextUtilService } from '@common/services/text-util.service';
import { Indicator } from '@modules/indicators/models/indicator.model';
import { IndicatorsDataService } from '@modules/indicators/services/indicators-data.service';
import { VisualisationVariable } from '@modules/visualisation-variables/models/visualisation-variable.model';
import { VisualisationVariablesDataService } from '@modules/visualisation-variables/services/visualisation-variables-data.service';
import { VisualisationsVariablesMessagesService } from '@modules/visualisation-variables/services/visualisations-variables-message.service';
import { VisualisationsDataService } from '@modules/visualisations/services/visualisations-data.service';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Visualisation Variables Records Updation Component]";

@Component({
  selector: 'sb-visualisation-variables-records-updation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './visualisation-variables-records-updation.component.html',
  styleUrls: ['visualisation-variables-records-updation.component.scss'],
})
export class VisualisationVariablesRecordsUpdationComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Visualisation Variable record
  @Input() public id!: number;

  // Broadcasts successful Visualisation Variables updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Visualisation Variables updation events together with their error codes
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Broadcasts selector windows open events
  @Output() public openedIndicatorSelector: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts selector windows close events
  @Output() public closedIndicatorSelector: EventEmitter<void> = new EventEmitter<void>();

  // Defines Visualisation Variables reactive form controls group
  visualisationVariablesForm = new FormGroup({

    label: new FormControl<string | null>('',
      [Validators.required, Validators.minLength(1), Validators.maxLength(250)]),

    category: new FormControl<string | null>('',
      [Validators.maxLength(250)]),

    colourCode: new FormControl<string | null>('',
      [Validators.required, Validators.minLength(7), Validators.maxLength(7)]),

    indicator: new FormGroup({
      indicatorId: new FormControl<number | null | undefined>(null, this.indicatorIsValid()),
      indicatorName: new FormControl<string | null | undefined>("Choose Indicator")
    }),


  });


  // Holds the Visualisation Variable record with the passed in id
  public visualisationVariable: VisualisationVariable | null | undefined;

  // Keeps tabs of the currently visible content
  public page: string = "default";

  // Keeps tabs of whether the component has been successfully initialised
  public initialised: boolean = false;

  constructor(
    public visualisationsDataService: VisualisationsDataService,
    private visualisationsVariablesDataService: VisualisationVariablesDataService,
    public visualisationsVariablesMessagesService: VisualisationsVariablesMessagesService,
    private textUtilService: TextUtilService,
    public indicatorsDataService: IndicatorsDataService,
    private cd: ChangeDetectorRef,
    private log: NGXLogger) {

  }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Visualisation Variable field based on the passed in id
    this.initialiseVisualisationVariable(() => {

      // Initialise the Visualisation Variable updation form based on the target Context
      this.initialiseVisualisationVariableUpdationForm(() => {

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
   * Retrieves the Visualisation Variable with the injected id and sets it as the Visualisation Variable that needs to be updated
   * @param callback The function to call when done
   */
  private initialiseVisualisationVariable(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseVisualisationVariable()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveVisualisationVariableRecord(this.id, (visualisationVariable: VisualisationVariable | null) => {

      // Set the target Visualisation Variable
      this.log.trace(`${LOG_PREFIX} Setting the target Visualisation Variable`);
      this.visualisationVariable = visualisationVariable;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }


  /**
   * Initialises the Visualisation Variable updation form
   * @param callback The function to call when done
   */
  private initialiseVisualisationVariableUpdationForm(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseVisualisationVariableUpdationForm()`);
    this.log.debug(`${LOG_PREFIX} Target Visualisation Variable Record = ${JSON.stringify(this.visualisationVariable)}`);

    this.retrieveIndicatorRecord(this.visualisationVariable?.data.indicatorId, (indicator: Indicator | null) => {

      // Update the form fields
      this.log.trace(`${LOG_PREFIX} Updating the form fields`);
      this.visualisationVariablesForm.setValue({
        label: this.visualisationVariable?.data.label ? this.visualisationVariable.data.label : null,
        category: this.visualisationVariable?.data.dimension ? this.visualisationVariable.data.dimension : null,
        colourCode: this.visualisationVariable?.data.color ? this.visualisationVariable.data.color : null,
        indicator: { indicatorId: indicator?.id ? indicator.id : null, indicatorName: indicator?.data.name ? indicator.data.name : "Choose indicator" }
      });

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    })



  }

  /**
   * Retrieves an Visualisation Variable record given its unique identifier synchronously
   * @param id The unique identifier of the Visualisation Variable
   * @param callback The function to call when done
   */
  private retrieveVisualisationVariableRecord(id: number, callback: (visualisationVariable: VisualisationVariable | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveVisualisationVariableRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the Visualisation Id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the Visualisation Id has been specified`);
    if (id) {

      // The Visualisation Id has been specified
      this.log.trace(`${LOG_PREFIX} The Visualisation Id has been specified`);
      this.log.debug(`${LOG_PREFIX} Visualisation Variable Id = ${JSON.stringify(id)}`);

      // Try retrieving an Visualisation Variable Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve an Visualisation Variable Record with the passed in id`);
      this.visualisationsVariablesDataService
        .getVisualisationsVariables(false, {
          searchTerm: null,
          page: null,
          pageSize: null,
          sortColumn: null,
          sortDirection: null,
          id: id,
          visualisationId: null,
          indicatorId: null,
          roleId: null
        })
        .subscribe({
          next: (visualisationsVariables: VisualisationVariable[]) => {

            // Check if an Visualisation Variable record with the given id was found
            this.log.trace(`${LOG_PREFIX} Checking if an Visualisation Variable record with the given id was found`);
            if (visualisationsVariables.length > 0) {

              //An Visualisation Variable record with the given id was found
              this.log.trace(`${LOG_PREFIX} An Visualisation Variable record with the given id was found`);

              // Return the Visualisation Variable record
              this.log.trace(`${LOG_PREFIX} Returning the Visualisation Variable record`);
              callback(visualisationsVariables[0]);


            } else {

              //An Visualisation Variable record with the given id was not found
              this.log.trace(`${LOG_PREFIX} An Visualisation Variable record with the given id was not found`);

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
   * Retrieves an Indicator record given its unique identifier synchronously
   * @param id The unique identifier of the Indicator
   * @param callback The function to call when done
   */
  private retrieveIndicatorRecord(id: number | null | undefined, callback: (indicator: Indicator | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveIndicatorRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the Indicator Id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the Indicator Id has been specified`);
    if (id) {

      // The Indicator Id has been specified
      this.log.trace(`${LOG_PREFIX} The Indicator Id has been specified`);
      this.log.debug(`${LOG_PREFIX} Indicator Id = ${JSON.stringify(id)}`);

      // Try retrieving an Indicator Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve an Indicator Record with the passed in id`);
      this.indicatorsDataService
        .getIndicators(false, {
          searchTerm: null,
          page: null,
          pageSize: null,
          sortColumn: null,
          sortDirection: null,
          ids: [id],
          contextId: null,
          no: null,
          name: null,
          logicalParentId: null
        })
        .subscribe({
          next: (indicators: Indicator[]) => {

            // Check if an Indicator record with the given id was found
            this.log.trace(`${LOG_PREFIX} Checking if an Indicator record with the given id was found`);
            if (indicators.length > 0) {

              //An Indicator record with the given id was found
              this.log.trace(`${LOG_PREFIX} An Indicator record with the given id was found`);

              // Return the Indicator record
              this.log.trace(`${LOG_PREFIX} Returning the Indicator record`);
              callback(indicators[0]);


            } else {

              //An Indicator record with the given id was not found
              this.log.trace(`${LOG_PREFIX} An Indicator record with the given id was not found`);

              // Return null
              this.log.warn(`${LOG_PREFIX} Return null`);
              callback(null);

            }
          }
        });


    } else {

      // The Indicator Id has not been specified
      this.log.error(`${LOG_PREFIX} The Indicator Id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }


  /**
   * Retrieves the id of the indicator
   * @returns the field id
   */
  public getIndicatorId(): number | null | undefined {
    return this.visualisationVariablesForm.get('indicator.indicatorId')?.value
  }

  /**
   * Get the selected entity indicator for preselection purposes
   * @returns 
   */
  public getSelectedIndicators(): number[] {
    if (this.getIndicatorId()) {
      return [this.getIndicatorId() as number];
    } else {
      return [];
    }
  }


  /**
   * Closes the Entity Indicators Selector
   */
  public closeIndicatorSelector(): void {

    this.log.trace(`${LOG_PREFIX} Entering closeIndicatorSelector()`);

    // Set the desired page to 'default'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'default'`);
    this.page = "default";

    // Emit a 'closedIndicatorSelector' event
    this.log.trace(`${LOG_PREFIX} Emitting a 'closedIndicatorSelector' event`);
    this.closedIndicatorSelector.emit();

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();
  }


  /**
   * Opens the Indicator Selector
   */
  public openIndicatorSelector(): void {

    this.log.trace(`${LOG_PREFIX} Entering openIndicatorSelector()`);

    // Set the desired page to 'indicators'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'indicators'`);
    this.page = "indicators";

    // Emit an 'openedIndicatorSelector' event
    this.log.trace(`${LOG_PREFIX} Emitting an 'openedIndicatorSelector' event`);
    this.openedIndicatorSelector.emit();

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();
  }


  /**
   * Sets the selected indicator details and close the indicator selector
   * @param element Sets 
   */
  onSelectIndicator(element: Indicator) {

    // Update the form
    this.log.trace(`${LOG_PREFIX} Updating the form`);
    this.visualisationVariablesForm.get('indicator.indicatorId')?.setValue((element && element.id) ? element.id : null);
    this.visualisationVariablesForm.get('indicator.indicatorName')?.setValue((element && element.data?.name) ? this.textUtilService.truncate(element.data.name, [35, "..."]) : null);

    // Set the desired page to 'default'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'default'`);
    this.page = "default";

    // Emit a 'closedIndicatorSelector' event
    this.log.trace(`${LOG_PREFIX} Emitting a 'closedIndicatorSelector' event`);
    this.closedIndicatorSelector.emit();

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();

  }



  /**
   * Internal validator that checks whether a indicator has been specified
   * @returns 
   */
  private indicatorIsValid(): ValidatorFn {

    return (control: AbstractControl): ValidationErrors | null => {

      if (control.value) {
        return null;
      } else {
        return { 'required': true }
      }

    }
  }



  /**
   * Validates and saves the updated Visualisation Variable Record.
   * Emits a succeeded or failed event in response to whether or not the updation exercise was successful.
   * Error 400 = Indicates an invalid Form Control Entry was supplied.
   * Error 500 = Indicates something unexpected happened at the server side
   */
  public save(): void {


    this.log.trace(`${LOG_PREFIX} Entering save()`);

    // Check if the target Visualisation Variable record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Visualisation Variable record was successfully initialised()`);
    if (this.visualisationVariable) {

      // The target Visualisation Variable record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Visualisation Variable record was successfully initialised()`);

      // Check if the data entry form is valid
      this.log.trace(`${LOG_PREFIX} Checking if the data entry form is valid`);
      if (this.visualisationVariablesForm.valid) {

        // The data entry form is valid
        this.log.trace(`${LOG_PREFIX} The data entry form is valid`);

        // Read in the provided label
        this.log.trace(`${LOG_PREFIX} Reading in the provided label`);
        const label: string | null | undefined = this.visualisationVariablesForm.get('label')?.value?.trim();
        this.log.debug(`${LOG_PREFIX} Visualisation Variable Lable = ${label}`);

        // Read in the provided category
        this.log.trace(`${LOG_PREFIX} Reading in the provided category`);
        const category: string | null | undefined = this.visualisationVariablesForm.get('category')?.value?.trim();
        this.log.debug(`${LOG_PREFIX} Visualisation Variable Category = ${category}`);

        // Read in the provided colour code
        this.log.trace(`${LOG_PREFIX} Reading in the provided colour code`);
        const colourCode: string | null | undefined = this.visualisationVariablesForm.get('colourCode')?.value?.trim();
        this.log.debug(`${LOG_PREFIX} Visualisation Variable Colour Code = ${colourCode}`);

        // Read in the provided Indicator Id
        this.log.trace(`${LOG_PREFIX} Reading in the provided Indicator Id`);
        const indicatorId: number | null | undefined = this.visualisationVariablesForm.get('indicator.indicatorId')?.value;
        this.log.debug(`${LOG_PREFIX} Indicator Id = ${indicatorId}`);

        // Save the record
        this.log.trace(`${LOG_PREFIX} Saving the Visualisation Variables Record`);
        this.visualisationsVariablesDataService
          .updateVisualisationVariable(
            new VisualisationVariable({
              id: this.visualisationVariable.id,
              data: {
                visualisationId: this.visualisationVariable.data.visualisationId,
                indicatorId: indicatorId,
                roleId: this.visualisationVariable.data.roleId,
                labelIdx: this.visualisationVariable.data.labelIdx,
                label: label,
                dimensionIdx: this.visualisationVariable.data.dimensionIdx,
                dimension: category,
                color: colourCode
              },
              version: this.visualisationVariable.version
            }))
          .subscribe({
            next: (response: VisualisationVariable) => {

              // The Visualisation Variable Record was saved successfully
              this.log.trace(`${LOG_PREFIX} Visualisation Variable Record was saved successfuly`);
              this.visualisationsVariablesMessagesService.broadcastVisualisationVariableModificationMessage();

              // Reset the form
              this.log.trace(`${LOG_PREFIX} Resetting the form`);
              this.visualisationVariablesForm.reset();

              // Emit a 'succeeded' event
              this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
              this.succeeded.emit();
            },
            error: (error: any) => {

              // The Visualisation Variable Record was not saved successfully
              this.log.trace(`${LOG_PREFIX} Visualisation Variable Record was not saved successfuly`);

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
        this.validateAllFormFields(this.visualisationVariablesForm);

        // Emit an 'invalid' event
        this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
        this.failed.emit(400);
      }


    } else {
      // The target Visualisation Variable record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Visualisation Variable record was not successfully initialised()`);

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
