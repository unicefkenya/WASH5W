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
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { TextUtilService } from '@common/services/text-util.service';
import { Indicator } from '@modules/indicators/models/indicator.model';
import { VisualisationVariable } from '@modules/visualisation-variables/models/visualisation-variable.model';
import { VisualisationVariablesDataService } from '@modules/visualisation-variables/services/visualisation-variables-data.service';
import { VisualisationsVariablesMessagesService } from '@modules/visualisation-variables/services/visualisations-variables-message.service';
import { VisualisationsDataService } from '@modules/visualisations/services/visualisations-data.service';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Visualisation Variables Records Creation Component]";

@Component({
  selector: 'sb-visualisation-variables-records-creation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './visualisation-variables-records-creation.component.html',
  styleUrls: ['visualisation-variables-records-creation.component.scss'],
})
export class VisualisationVariablesRecordsCreationComponent implements OnInit, OnDestroy {

  // Allows the parent component to inject the unique identifier of the parent visualisation
  @Input() public visualisationId!: number;

  // Broadcasts successful Visualisation Variables creation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Visualisation Variables creation events together with their error codes
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


  // Keeps tabs of the currently visible content
  public page: string = "default";

  // Keeps tabs of whether the component has been successfully initialised
  public initialised: boolean = false;

  constructor(
    public visualisationsDataService: VisualisationsDataService,
    private visualisationVariablesDataService: VisualisationVariablesDataService,
    public visualisationsVariablesMessagesService: VisualisationsVariablesMessagesService,
    private textUtilService: TextUtilService,
    private cd: ChangeDetectorRef,
    private log: NGXLogger) {

  }


  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);


    // Mark Init as complete
    this.log.trace(`${LOG_PREFIX} Init completed`);
    this.initialised = true;
    this.cd.detectChanges();

  }



  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy`);

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
   * Validates and saves a new Visualisation Variables Record.
   * Emits a succeeded or failed event depending on whether the save request succeeded or failed respectively
   * Error 400 = Indicates that a user error was encountered
   * Error 500 = Indicates that a system error was encountered
   */
  public save(): void {

    this.log.trace(`${LOG_PREFIX} Entering save()`);

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
      this.visualisationVariablesDataService
        .createVisualisationVariable(
          new VisualisationVariable({
            data: {
              visualisationId: this.visualisationId,
              indicatorId: indicatorId,
              roleId: 1,
              labelIdx: 1,
              label: label,
              dimensionIdx: 1,
              dimension: category,
              color: colourCode
            },
            version: null
          }))
        .subscribe({
          next: (response: VisualisationVariable) => {

            // The Visualisation Variable Record was saved successfully
            this.log.trace(`${LOG_PREFIX} Visualisation Variable Record was saved successfuly`);
            this.visualisationsVariablesMessagesService.broadcastVisualisationVariableModificationMessage();

            // Reset the forms
            this.log.trace(`${LOG_PREFIX} Resetting the forms`);
            this.visualisationVariablesForm.controls['label'].reset();
            this.visualisationVariablesForm.controls['category'].reset();
            this.visualisationVariablesForm.controls['colourCode'].reset();

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
