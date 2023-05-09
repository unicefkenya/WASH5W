import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FilterService } from '@app/app-filter.service';
import { TextUtilService } from '@common/services/text-util.service';
import { DataFormElementType } from '@modules/data-forms-elements-types/models/data-form-element-type.model';
import { DataFormsElementsTypesDataService } from '@modules/data-forms-elements-types/services/data-forms-elements-types-data.service';
import { RelevancyRule, ValidationRule } from '@modules/data-forms-elements/models';
import { DataFormElement } from '@modules/data-forms-elements/models/data-form-element.model';
import { DataFormsElementsDataService } from '@modules/data-forms-elements/services/data-forms-elements-data.service';
import { OperatorsDataService } from '@modules/operators/services/operators-data.service';
import { OptionsSelectionDataService } from '@modules/options/services/options-selection-data.service';
import { Option } from '@modules/options/models/option.model';
import { NGXLogger } from 'ngx-logger';
import { DataFormsElementsRelevanciesRulesConfigurationComponent } from '../data-forms-elements-relevancies-rules-configuration/data-forms-elements-relevancies-rules-configuration.component';
import { DataFormsFieldsValidationsRulesConfigurationComponent } from '../data-forms-fields-validations-rules-configuration/data-forms-fields-validations-rules-configuration.component';

const LOG_PREFIX: string = "[Data Forms Fields Records Creation Component]";

@Component({
  selector: 'sb-data-forms-fields-records-creation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './data-forms-fields-records-creation.component.html',
  styleUrls: ['data-forms-fields-records-creation.component.scss'],
})
export class DataFormsFieldsRecordsCreationComponent implements OnInit, OnDestroy {

  // Allows the parent component to inject the unique identifier of the target context record
  @Input() public contextId: number | null | undefined;

  // Allows the parent component to inject the unique identifier of the parent Data Form record
  @Input() public dataFormId: number | null | undefined;

  // Allows the parent component to inject the unique identifier of the parent Data Form Element record
  @Input() public parentId: number | null | undefined;

  // Broadcasts successful Data Form Fields creation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Data Form Fields creation events together with their error codes
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Broadcasts selector windows open events
  @Output() public openedFieldTypeSelector: EventEmitter<void> = new EventEmitter<void>();
  @Output() public openedFieldSelector: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts selector windows closed events
  @Output() public closedFieldTypeSelector: EventEmitter<void> = new EventEmitter<void>();
  @Output() public closedFieldSelector: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts standalone page window open events
  @Output() loadedStandalonePage: EventEmitter<boolean> = new EventEmitter<boolean>();

  // Broadcasts first window open events
  @Output() loadedFirstPage: EventEmitter<boolean> = new EventEmitter<boolean>();

  // Broadcasts nested window open events
  @Output() loadedNestedPage: EventEmitter<boolean> = new EventEmitter<boolean>();

  // Broadcasts last window open events
  @Output() loadedLastPage: EventEmitter<boolean> = new EventEmitter<boolean>();

  // Keeps a local reference to the displayed relevancy rule configurer component.
  private _relevancyRuleConfigurer!: DataFormsElementsRelevanciesRulesConfigurationComponent;

  // Keeps a local reference to the displayed validation rules configurers components
  private _validationRulesConfigurers!: QueryList<DataFormsFieldsValidationsRulesConfigurationComponent>;

  // Keeps tabs of the relevancy rule
  public relevancyRule: RelevancyRule | null = null;

  // Keeps tabs of the validation rules
  public validationRules: ValidationRule[] = [];

  // Keeps tabs of the options
  public options: Option[] = [];

  // Keeps tabs of the currently visible content
  page: string = "default";

  // Keeps tabs of the processing errors
  public errors: Map<string, string> = new Map();

  // Keeps tabs of whether the page has been successfully initialised
  public initialised: boolean = false;

  // Defines Data Form Fields reactive form controls group to gather the basic details
  public dataFormsFieldsForm = new FormGroup({
    type: new FormGroup({
      typeId: new FormControl<number | null | undefined>(null),
      typeTitle: new FormControl<string>("Select Type")
    }),
    title: new FormControl<string | null>(''),
    described: new FormControl<boolean>(false),
    conditionallyRelevant: new FormControl<boolean>(false),
    required: new FormControl<boolean>(false),
    validated: new FormControl<boolean>(false),
    description: new FormControl<string | null>(''),
  });


  constructor(
    public dataFormsElementsDataService: DataFormsElementsDataService,
    public dataFormsElementsTypesDataService: DataFormsElementsTypesDataService,
    public operatorsDataService: OperatorsDataService,
    public optionsDataService: OptionsSelectionDataService,
    public filterService: FilterService,
    public textUtilService: TextUtilService,
    private cd: ChangeDetectorRef,
    private log: NGXLogger) {

    new FormGroup({
      relevancyRuleField: new FormControl<DataFormElement | null>(null),
      relevancyRuleOperatorId: new FormControl<number | null>(null),
      relevancyRuleOperatorValue: new FormControl<number | null>(null)
    })

  }


  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    this.initialiseFormChangesListener(() => {

      // Mark Init as complete
      this.log.trace(`${LOG_PREFIX} Init completed`);
      this.initialised = true;
      this.cd.detectChanges();

    });


  }


  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }


  /**
   * Initialises the local reference to the displayed relevancy rule configurer component
   */
  @ViewChild(DataFormsElementsRelevanciesRulesConfigurationComponent)
  public set relevancyRuleConfigurer(relevancyRuleConfigurer: DataFormsElementsRelevanciesRulesConfigurationComponent) {

    this.log.trace(`${LOG_PREFIX} Entering setRelevancyRuleConfigurer()`);

    if (relevancyRuleConfigurer) {
      this._relevancyRuleConfigurer = relevancyRuleConfigurer;
    }
  }



  /**
   * Initialises the local reference to the displayed validation rules configurers component
   */
  @ViewChildren(DataFormsFieldsValidationsRulesConfigurationComponent)
  public set validationRulesConfigurers(validationRulesConfigurers: QueryList<DataFormsFieldsValidationsRulesConfigurationComponent>) {

    this.log.trace(`${LOG_PREFIX} Entering setValidationRulesConfigurers()`);

    if (validationRulesConfigurers && validationRulesConfigurers.length > 0) {
      this._validationRulesConfigurers = validationRulesConfigurers;
    }
  }


  /**
   * Initialises the form changes listener
   */
  private initialiseFormChangesListener(callback: (() => void)): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseFormChangesListener()`);

    // Subscribe to flags that indicate whether or not the field should be conditionally relevant
    this.dataFormsFieldsForm.get('conditionallyRelevant')?.valueChanges.subscribe(conditional => {

      // If the field is conditionally relevant, then there will be a relevancy configuration page
      // This makes the default page the first page
      if (conditional) {
        this.loadedFirstPage.emit();
      } else {

        // If the element needs to be validated, then there will be a validity configuration page
        // This still makes the default page the first page
        if (this.dataFormsFieldsForm.get('validated')?.value) {
          this.loadedFirstPage.emit();
        } else {

          // If the field is not conditionally relevant & does not need validation, then the current page is a standalone page
          this.loadedStandalonePage.emit();
        }

      }
    });


    // Subscribe to flags that indicate whether or not the field should be validate
    this.dataFormsFieldsForm.get('validated')?.valueChanges.subscribe(validated => {

      // If the element needs to be validated, then there will be a validity configuration page
      // This makes the default page the first page
      if (validated) {
        this.loadedFirstPage.emit();
      } else {

        // If the field is conditionally relevant, then there will be a relevancy configuration page
        // This still makes the default page the first page
        if (this.dataFormsFieldsForm.get('conditionallyRelevant')?.value) {
          this.loadedFirstPage.emit();
        } else {

          // If the field is not conditionally relevant & does not need validation, then the current page is a standalone page
          this.loadedStandalonePage.emit();

        }
      }
    });


    // Subscribe to field types updates and check for errors
    this.dataFormsFieldsForm.get('type.typeId')?.valueChanges.subscribe(val => {
      this.isTypeValid();
    });

    // Subscribe to field title updates and check for errors
    this.dataFormsFieldsForm.get('title')?.valueChanges.subscribe(val => {
      this.isTitleValid();
    });

    // Subscribe to field description updates and check for errors
    this.dataFormsFieldsForm.get('description')?.valueChanges.subscribe(val => {
      this.isDescriptionValid();
    });

    // Transfer control to the callback function
    callback();


  }


  /**
   * Retrieves the id of the field upon which the relevancy is based
   * @returns the field id
   */
  public getFieldTypeId(): number | null | undefined {
    return this.dataFormsFieldsForm.get('type.typeId')?.value
  }


  /**
   * Retrieves the title of the field
   * @returns the title
   */
  public getTitle(): string | null | undefined {
    return this.dataFormsFieldsForm.get('title')?.value
  }


  /**
   * Retrieves the description of the field
   * @returns the description
   */
  public getDescription(): string | null | undefined {
    return this.dataFormsFieldsForm.get('description')?.value
  }



  /**
   * Retrieves the ids of the selected options
   * @returns an array of numbers
   */
  public getOptionsIds(): number[] {
    const optionsIds: number[] = [];
    this.options.forEach(o => {
      if (o.id) {
        optionsIds.push(o.id);
      }
    })
    return optionsIds;
  }


  /**
   * Checks whether the field is described
   * @returns True or False
   */
  public isDescribed(): boolean {

    this.log.trace(`${LOG_PREFIX} Entering isDescribed()`);

    if (this.dataFormsFieldsForm.get('described')?.value) {
      return true;
    } else {
      return false;
    }

  }


  /**
   * Establishes whether the field is conditionally relevant
   * @returns True or False
   */
  public isConditional(): boolean {

    this.log.trace(`${LOG_PREFIX} Entering isConditional()`);

    if (this.dataFormsFieldsForm.get('conditionallyRelevant')?.value) {
      return true;
    } else {
      return false;
    }

  }


  /**
   *Establishes whether the field is required
   * @returns True or False
   */
  public isRequired(): boolean {

    this.log.trace(`${LOG_PREFIX} Entering isRequired()`);

    if (this.dataFormsFieldsForm.get('required')?.value) {
      return true;
    } else {
      return false;
    }

  }



  /**
   * Establishes whether the field should be validated
   * @returns True or False
   */
  public isValidated(): boolean {

    this.log.trace(`${LOG_PREFIX} Entering isValidated()`);

    if (this.dataFormsFieldsForm.get('validated')?.value) {
      return true;
    } else {
      return false;
    }

  }


  /**
   * Establishes whether a field, based on its type, should have optional values
   * @param fieldTypeId The field type's id
   * @returns 
   */
  public isOptionable(fieldTypeId: number | null | undefined) {
    return fieldTypeId ? ([8, 9, 10].includes(fieldTypeId)) : false;
  }


  /**
   * Opens the Field Type Selector
   */
  public openFieldTypeSelector(): void {

    this.log.trace(`${LOG_PREFIX} Entering openFieldTypeSelector()`);

    // Set the desired page to 'types'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'types'`);
    this.page = "types";

    // Emit an 'openedTypeSelector' event
    this.log.trace(`${LOG_PREFIX} Emitting an 'openedTypeSelector' event`);
    this.openedFieldTypeSelector.emit();

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();
  }


  /**
   * Closes the Field Types Selector
   */
  public closeFieldTypeSelector(): void {

    this.log.trace(`${LOG_PREFIX} Entering closeFieldTypeSelector()`);

    // Set the desired page to 'default'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'default'`);
    this.page = "default";

    // Emit a 'closedTypeSelector' event
    this.log.trace(`${LOG_PREFIX} Emitting a 'closedTypeSelector' event`);
    this.closedFieldTypeSelector.emit();

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();
  }




  /** 
  * Handles Field Type Selection Events
  * @param fieldType The Selected Field Type
  */
  public onSelectFieldType(fieldType: DataFormElementType): void {

    this.log.trace(`${LOG_PREFIX} Entering onSelectDataFormElementType()`);
    this.log.debug(`${LOG_PREFIX} Selected Field Type = ${JSON.stringify(fieldType)}`);

    // Update the form
    this.log.trace(`${LOG_PREFIX} Updating the form`);
    this.dataFormsFieldsForm.get('type.typeId')?.setValue((fieldType && fieldType.id) ? fieldType.id : null);
    this.dataFormsFieldsForm.get('type.typeTitle')?.setValue((fieldType && fieldType.data.name) ? this.textUtilService.truncate(fieldType.data.name, [35, "..."]) : null);
    if ([8, 9, 10].some(id => id == fieldType.id)) { // If selected type is single choice, multiple choices or dropdown
      this.dataFormsFieldsForm.get('validated')?.setValue(false);
    }

    // Set the desired page to 'default'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'default'`);
    this.page = "default";

    // Emit a 'closedTypeSelector' event
    this.log.trace(`${LOG_PREFIX} Emitting a 'closedTypeSelector' event`);
    this.closedFieldTypeSelector.emit();

    // Establish whether the page is or has become a first page
    this.log.trace(`${LOG_PREFIX} Establishing whether the page is or has become a first page`);
    if (this.isOptionable(this.getFieldTypeId()) || this.isConditional() || this.isValidated()) {

      // The page is or has become a first page
      this.log.trace(`${LOG_PREFIX} The page is or has become a first page`);

      // Assert the page as the first page
      this.log.trace(`${LOG_PREFIX} Asserting the page as the first page`);
      this.loadedFirstPage.emit(true);

    } else {

      // The page is or has become a standalone page
      this.log.trace(`${LOG_PREFIX} The page is or has become a standalone page`);

      // Clear any previously selected options
      this.options.length = 0;

      // Assert the page as the standalone page
      this.log.trace(`${LOG_PREFIX} Asserting the page as the standalone page`);
      this.loadedStandalonePage.emit(true);

    }

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();

  }




  /**
   * Calls upon the relevancy rule configuration subcomponent to close its Fields Selector
   */
  public closeFieldSelector(): void {

    this.log.trace(`${LOG_PREFIX} Entering closeFieldSelector()`);

    // Prompt the relevancy rule configurer to close the field selector
    this.log.trace(`${LOG_PREFIX} Prompting the relevancy rule configurer to close the field selector`);
    this._relevancyRuleConfigurer.onCloseFieldSelector();

  }


  /**
   * Propagates Fields Selector Open Events as received from the relevancy rule configuration subcomponent
   */
  onOpenFieldSelector() {

    this.log.trace(`${LOG_PREFIX} Entering onOpenFieldSelector()`);

    // Emit a 'openedSelector' event
    this.log.trace(`${LOG_PREFIX} Emitting a 'openedSelector' event`);
    this.openedFieldSelector.emit();

  }



  /**
   * Propagates Fields Selector Close Events as received from the relevancy rule configuration subcomponent
   */
  public onCloseFieldSelector(): void {

    this.log.trace(`${LOG_PREFIX} Entering onCloseFieldSelector()`);

    // Emit a 'closedSelector' event
    this.log.trace(`${LOG_PREFIX} Emitting a 'closedSelector' event`);
    this.closedFieldSelector.emit();

  }



  /**
   * Adds a new validation rule
   */
  public onAddValidationRule(): void {

    this.log.trace(`${LOG_PREFIX} Entering onAddValidationRule()`);

    this.validationRules.push({
      operatorId: null,
      value: null,
      message: null
    });

    this.cd.detectChanges();
  }


  /**
   * Removes a previously added validation rule
   * @param index The index of the previously added validation rule
   */
  onDeleteValidationRule(index: number) {

    this.log.trace(`${LOG_PREFIX} Entering onDeleteValidationRule()`);

    this.validationRules.splice(index, 1);
  }



  /** 
  * Handles Options Selections Events
  * @param option The selected Option
  */
  onSelectOption(option: Option) {

    this.log.trace(`${LOG_PREFIX} Entering onSelectOption()`);
    this.log.trace(`${LOG_PREFIX} Selected Option = ${JSON.stringify(option)}`);

    // Insert the newly selected Option into the options array - if its nonexistent
    if (option && this.options.findIndex(o => o.id == option.id) == -1) {

      // Add option to options array
      this.options.push(option);

      // Validate
      this.isOptionsPageValid();
    }

  }


  /** 
  * Handles Options Deselection Events
  * @param option The deselected option
  */
  onDeselectOption(option: Option) {

    this.log.trace(`${LOG_PREFIX} Entering onDeselectOption()`);
    this.log.trace(`${LOG_PREFIX} Deselected Option: ${JSON.stringify(option)}`);

    // Removes the newly Unchecked Option from the Selected Options array - if in existence
    let index = option ? this.options.findIndex(o => o.id == option.id) : -1;
    if (index != -1) {

      // Remove option from options array
      this.options.splice(index, 1);

      // Validate
      this.isOptionsPageValid();
    }
  }


  /**
  * Flags whether or not the field should be described
  * @param e Switch event
  */
  public toggleDescribability(e: any): void {

    this.log.trace(`${LOG_PREFIX} Entering toggleDescribability()`);

    // Check if the switch has been checked
    this.log.trace(`${LOG_PREFIX} Checking if the switch has been checked`);
    if (e.target.checked) {

      // The switch has been checked
      this.log.trace(`${LOG_PREFIX} The switch has been checked`);

      // Update the form
      this.log.trace(`${LOG_PREFIX} Updating the form`);
      this.dataFormsFieldsForm.get('described')?.setValue(true);


    } else {

      // The switch has been unchecked
      this.log.trace(`${LOG_PREFIX} The switch has been unchecked`);

      // Update the form
      this.log.trace(`${LOG_PREFIX} Updating the form`);
      this.dataFormsFieldsForm.get('described')?.setValue(false);
    }

  }


  /**
   * Flags whether or not the field should be conditionally relevant
   * @param e Switch event
   */
  public toggleConditionality(e: any): void {

    this.log.trace(`${LOG_PREFIX} Entering toggleConditionality()`);

    // Check if the switch has been checked
    this.log.trace(`${LOG_PREFIX} Checking if the switch has been checked`);
    if (e.target.checked) {

      // The switch has been checked
      this.log.trace(`${LOG_PREFIX} The switch has been checked`);

      // Update the form
      this.log.trace(`${LOG_PREFIX} Updating the form`);
      this.dataFormsFieldsForm.get('conditionallyRelevant')?.setValue(true);

      // Update the relevancy rule
      this.log.trace(`${LOG_PREFIX} Updating the relevancy rule`);
      this.relevancyRule = new RelevancyRule({
        fieldId: null,
        operatorId: null,
        value: null
      });

    } else {

      // The switch has been unchecked
      this.log.trace(`${LOG_PREFIX} The switch has been unchecked`);

      // Update the form
      this.log.trace(`${LOG_PREFIX} Updating the form`);
      this.dataFormsFieldsForm.get('conditionallyRelevant')?.setValue(false);

      // Update the relevancy rule
      this.log.trace(`${LOG_PREFIX} Updating the relevancy rule`);
      this.relevancyRule = null;
    }

  }



  /**
   * Flags whether or not the field should be required
   * @param e Switch event
   */
  public toggleRequireability(e: any): void {

    this.log.trace(`${LOG_PREFIX} Entering toggleRequireability()`);

    // Check if the switch has been checked
    this.log.trace(`${LOG_PREFIX} Checking if the switch has been checked`);
    if (e.target.checked) {

      // The switch has been checked
      this.log.trace(`${LOG_PREFIX} The switch has been checked`);

      // Update the form
      this.log.trace(`${LOG_PREFIX} Updating the form`);
      this.dataFormsFieldsForm.get('required')?.setValue(true);


    } else {

      // The switch has been unchecked
      this.log.trace(`${LOG_PREFIX} The switch has been unchecked`);

      // Update the form
      this.log.trace(`${LOG_PREFIX} Updating the form`);
      this.dataFormsFieldsForm.get('required')?.setValue(false);
    }

  }



  /**
   * Flags whether or not the field should be validated
   * @param e Switch event
   */
  public toggleValidability(e: any): void {

    this.log.trace(`${LOG_PREFIX} Entering toggleValidability()`);

    // Check if the switch has been checked
    this.log.trace(`${LOG_PREFIX} Checking if the switch has been checked`);
    if (e.target.checked) {

      // The switch has been checked
      this.log.trace(`${LOG_PREFIX} The switch has been checked`);

      // Update the form
      this.log.trace(`${LOG_PREFIX} Updating the form`);
      this.dataFormsFieldsForm.get('validated')?.setValue(true);

      // Update the validation rules
      this.log.trace(`${LOG_PREFIX} Updating the validation rules`);
      this.validationRules.push({
        operatorId: null,
        value: null,
        message: null
      });

    } else {

      // The switch has been unchecked
      this.log.trace(`${LOG_PREFIX} The switch has been unchecked`);

      // Update the form
      this.log.trace(`${LOG_PREFIX} Updating the form`);
      this.dataFormsFieldsForm.get('validated')?.setValue(false);

      // Update the rules
      this.log.trace(`${LOG_PREFIX} Updating the validation rules`);
      this.validationRules.length = 0;
    }

  }



  /**
   * Loads the next page
   */
  public showNextPage() {

    this.log.trace(`${LOG_PREFIX} Entering showNextPage()`);

    switch (this.page) {

      case "default":

        // Move to the next page iff the current page is valid
        if (this.isDefaultPageValid()) {

          // Check if the field is optionalable
          this.log.trace(`${LOG_PREFIX} Checking if the field is optionalable`);
          if (this.isOptionable(this.getFieldTypeId())) {

            // Field is optionalable
            this.log.trace(`${LOG_PREFIX} Field is optionalable`);

            // Load the options selection window
            this.log.trace(`${LOG_PREFIX} Loading the options selection window`);
            this.page = "options";

            // Check if the field is conditionally relevant or needs to be validated
            this.log.trace(`${LOG_PREFIX} Checking if the field is conditionally relevant or needs to be validated`);
            if ((this.dataFormsFieldsForm.get('conditionallyRelevant')?.value) || (this.dataFormsFieldsForm.get('validated')?.value)) {

              // The field is conditionally relevant or needs to be validated
              this.log.trace(`${LOG_PREFIX} The field is conditionally relevant or needs to be validated`);

              // Mark the current page as a nested page
              this.log.trace(`${LOG_PREFIX} Marking the current page as a nested page`);
              this.loadedNestedPage.emit(true);

            } else {

              // The field is neither conditionally relevant nor needs to be validated
              this.log.trace(`${LOG_PREFIX} The field is neither conditionally relevant nor needs to be validated`);

              // Mark the current page as the last page
              this.log.trace(`${LOG_PREFIX} Marking the current page as the last page`);
              this.loadedLastPage.emit(true);
            }

          } else {

            // Field is not optionalable
            this.log.trace(`${LOG_PREFIX} Field is not optionalable`);

            // Check if the field is conditionally relevant
            this.log.trace(`${LOG_PREFIX} Checking if the field is conditionally relevant`);
            if (this.dataFormsFieldsForm.get('conditionallyRelevant')?.value) {

              // The field is conditionally relevant
              this.log.trace(`${LOG_PREFIX} The field is conditionally relevant`);

              // Load the relevancy configuration window
              this.log.trace(`${LOG_PREFIX} Loading the relevancy configuration window`);
              this.page = "relevancy";

              // Check if the element needs to be validated
              this.log.trace(`${LOG_PREFIX} Checking if the element needs to be validated`);
              if (this.dataFormsFieldsForm.get('validated')?.value) {

                // The field needs to be validated
                this.log.trace(`${LOG_PREFIX} The field needs to be validated`);

                // Mark the current page as a nested page
                this.log.trace(`${LOG_PREFIX} Marking the current page as a nested page`);
                this.loadedNestedPage.emit(true);

              } else {

                // The field does not need to be validated
                this.log.trace(`${LOG_PREFIX} The field does not need to be validated`);

                // Mark the current page as the last page
                this.log.trace(`${LOG_PREFIX} Marking the current page as the last page`);
                this.loadedLastPage.emit(true);

              }

            } else {

              // The field is not conditionally relevant
              this.log.trace(`${LOG_PREFIX} The field is not conditionally relevant`);

              // Check if the element needs to be validated
              this.log.trace(`${LOG_PREFIX} Checking if the element needs to be validated`);
              if (this.dataFormsFieldsForm.get('validated')?.value) {

                // The field needs to be validated
                this.log.trace(`${LOG_PREFIX} The field needs to be validated`);

                // Load validations configuration window
                this.log.trace(`${LOG_PREFIX} Loading validations configuration window`);
                this.page = "validity";

                // Mark the current page as the last page
                this.log.trace(`${LOG_PREFIX} Marking the current page as the last page`);
                this.loadedLastPage.emit(true);

              } else {

                // The field does not need to be validated
                this.log.trace(`${LOG_PREFIX} The field does not need to be validated`);

                // Mark the wizard as having reached a premature end
                this.log.error(`${LOG_PREFIX} The wizard has reached a premature end`);

              }

            }

          }


        }


        break;

      case "options":

        // Move to the next page iff the current page is valid
        if (this.isOptionsPageValid()) {

          // Check if the field is conditionally relevant
          this.log.trace(`${LOG_PREFIX} Checking if the field is conditionally relevant`);
          if (this.dataFormsFieldsForm.get('conditionallyRelevant')?.value) {

            // The field is conditionally relevant
            this.log.trace(`${LOG_PREFIX} The field is conditionally relevant`);

            // Load the relevancy configuration window
            this.log.trace(`${LOG_PREFIX} Loading the relevancy configuration window`);
            this.page = "relevancy";

            // Check if the element needs to be validated
            this.log.trace(`${LOG_PREFIX} Checking if the element needs to be validated`);
            if (this.dataFormsFieldsForm.get('validated')?.value) {

              // The field needs to be validated
              this.log.trace(`${LOG_PREFIX} The field needs to be validated`);

              // Mark the current page as a nested page
              this.log.trace(`${LOG_PREFIX} Marking the current page as a nested page`);
              this.loadedNestedPage.emit(true);

            } else {

              // The field does not need to be validated
              this.log.trace(`${LOG_PREFIX} The field does not need to be validated`);

              // Mark the current page as the last page
              this.log.trace(`${LOG_PREFIX} Marking the current page as the last page`);
              this.loadedLastPage.emit(true);

            }

          } else {

            // The field is not conditionally relevant
            this.log.trace(`${LOG_PREFIX} The field is not conditionally relevant`);

            // Check if the element needs to be validated
            this.log.trace(`${LOG_PREFIX} Checking if the element needs to be validated`);
            if (this.dataFormsFieldsForm.get('validated')?.value) {

              // The field needs to be validated
              this.log.trace(`${LOG_PREFIX} The field needs to be validated`);

              // Load validations configuration window
              this.log.trace(`${LOG_PREFIX} Loading validations configuration window`);
              this.page = "validity";

              // Mark the current page as the last page
              this.log.trace(`${LOG_PREFIX} Marking the current page as the last page`);
              this.loadedLastPage.emit(true);

            } else {

              // The field does not need to be validated
              this.log.trace(`${LOG_PREFIX} The field does not need to be validated`);

              // Mark the wizard as having reached a premature end
              this.log.error(`${LOG_PREFIX} The wizard has reached a premature end`);

            }

          }

        }

        break;

      case "relevancy":

        // Move to the next page iff the current page is valid
        if (this.isConditionalRelevancyPageValid()) {

          // Check if the element needs to be validated
          this.log.trace(`${LOG_PREFIX} Checking if the element needs to be validated`);
          if (this.dataFormsFieldsForm.get('validated')?.value) {

            // The field needs to be validated
            this.log.trace(`${LOG_PREFIX} The field needs to be validated`);

            // Load validations configuration window
            this.log.trace(`${LOG_PREFIX} Loading validations configuration window`);
            this.page = "validity";

            // Mark the current page as the last page
            this.log.trace(`${LOG_PREFIX} Marking the current page as the last page`);
            this.loadedLastPage.emit(true);

          } else {

            // The field does not need to be validated
            this.log.trace(`${LOG_PREFIX} The field does not need to be validated`);

            // Mark the wizard as having reached a premature end
            this.log.error(`${LOG_PREFIX} The wizard has reached a premature end`);

          }

        } else {

          // Show the error messages
          this._relevancyRuleConfigurer.isValid();
        }

        break;

      default:

        // Mark the wizard as having reached a premature end
        this.log.error(`${LOG_PREFIX} The wizard has reached a premature end`);


    }

    this.cd.detectChanges();

  }


  /**
  * Load the previous page
  */
  public showPreviousPage() {

    this.log.trace(`${LOG_PREFIX} Entering showPreviousPage()`);

    switch (this.page) {

      case "validity":

        // Check if the field is conditionally relevant
        this.log.trace(`${LOG_PREFIX} Checking if the field is conditionally relevant`);
        if (this.dataFormsFieldsForm.get('conditionallyRelevant')?.value) {

          // The field is conditionally relevant
          this.log.trace(`${LOG_PREFIX} The field is conditionally relevant`);

          // Load the relevancy configuration window
          this.log.trace(`${LOG_PREFIX} Loading the relevancy configuration window`);
          this.page = "relevancy";

          // Mark the current page as a nested page
          this.log.trace(`${LOG_PREFIX} Marking the current page as a nested page`);
          this.loadedNestedPage.emit(true);

        } else {

          // The field is not conditionally relevant
          this.log.trace(`${LOG_PREFIX} The field is not conditionally relevant`);

          // Load the default window
          this.log.trace(`${LOG_PREFIX} Loading the default window`);
          this.page = "default";

          // Mark the current page as the first page
          this.log.trace(`${LOG_PREFIX} Marking the current page as the first page`);
          this.loadedFirstPage.emit(true);

        }

        break;

      case "relevancy":

        // Check if the field is optionalable
        this.log.trace(`${LOG_PREFIX} Checking if the field is optionalable`);
        if (this.isOptionable(this.getFieldTypeId())) {

          // Field is optionalable
          this.log.trace(`${LOG_PREFIX} Field is optionalable`);

          // Load the options selection window
          this.log.trace(`${LOG_PREFIX} Loading the options selection window`);
          this.page = "options";

          // Mark the current page as a nested page
          this.log.trace(`${LOG_PREFIX} Marking the current page as a nested page`);
          this.loadedNestedPage.emit(true);

        } else {

          // Load the default window
          this.log.trace(`${LOG_PREFIX} Loading the default window`);
          this.page = "default";

          // Mark the current page as the first page
          this.log.trace(`${LOG_PREFIX} Marking the current page as the first page`);
          this.loadedFirstPage.emit(true);

        }

        break;


      case "options":

        this.log.trace(`${LOG_PREFIX} Loading the default window`);
        this.page = "default";

        // Mark the current page as the first page
        this.log.trace(`${LOG_PREFIX} Marking the current page as the first page`);
        this.loadedFirstPage.emit(true);

        break;
    }

    this.cd.detectChanges();

  }



  /**
   * Checks whether all the required inputs have been provided correctly
   * @returns True or False 
   */
  private isValid(): boolean {

    this.log.trace(`${LOG_PREFIX} Entering isValid()`);

    let valid: boolean = true;

    // Validate the default page
    if (!this.isDefaultPageValid()) {
      valid = false;
    }

    // Validate the options page
    if (!this.isOptionsPageValid()) {
      valid = false;
    }

    // Validate the conditional relevancy page
    if (!this.isConditionalRelevancyPageValid()) {
      valid = false;
    }

    // Validate the validation rules
    if (!this.isValidationPageValid()) {
      valid = false;
    }

    return valid;
  }


  /**
   * Checks whether the default page's details have been fully and correctly specified
   * @returns True or False
   */
  private isDefaultPageValid(): boolean {

    this.log.trace(`${LOG_PREFIX} Entering isDefaultPageValid()`);

    let valid: boolean = true;

    // Validate title
    if (!this.isTitleValid()) {
      valid = false;
    }

    // Validate type
    if (!this.isTypeValid()) {
      valid = false;
    }

    // Validate description
    if (!this.isDescriptionValid()) {
      valid = false;
    }

    this.cd.detectChanges();

    return valid;
  }


  /**
   * Checks whether the title is valid
   * @returns True or False 
   */
  private isTitleValid(): boolean {

    let valid: boolean = true;

    // Get the title
    const title: string | null | undefined = this.getTitle();

    // Validate the title
    if (title) {

      if (title.trim().length < 2) {
        this.errors.set("title", "Title should be at least 2 characters long");
        valid = false;
      }

      if (title.trim().length > 250) {
        this.errors.set("title", "Title should not be more than 250 characters long");
        valid = false;
      }

    } else {
      this.errors.set("title", "Title is required");
      valid = false;
    }

    // Clear previous errors if valid
    if (valid) {
      this.errors.delete("title");
    }

    return valid;
  }


  /**
   * Checks whether the field type is valid
   * @returns True or False 
   */
  private isTypeValid(): boolean {

    let valid: boolean = true;

    // Validate the type
    if (!this.getFieldTypeId()) {

      this.errors.set("type", "Field Type is required");
      valid = false;

    }

    // Clear previous errors if valid
    if (valid) {
      this.errors.delete("type");
    }

    return valid;
  }


  /**
 * Checks whether the description is valid if its warranted
 * @returns True or False 
 */
  private isDescriptionValid(): boolean {

    let valid: boolean = true;

    // Check for errors only if its necessary
    if (this.dataFormsFieldsForm && this.isDescribed()) {

      // Get the description
      const description: string | null | undefined = this.getDescription();

      // Validate the description
      if (description) {

        if (description.trim().length < 2) {
          this.errors.set("description", "Description should be at least 2 characters long");
          valid = false;
        }

        if (description.trim().length > 500) {
          this.errors.set("description", "Description cannot be more than 500 characters long");
          valid = false;
        }

      } else {
        this.errors.set("description", "Description is required");
        valid = false;
      }
    }

    // Clear previous errors if valid
    if (valid) {
      this.errors.delete("description");
    }

    return valid;
  }



  /**
 * Checks whether the option page's details have been fully and correctly specified
 * @returns True or False
 */
  private isOptionsPageValid(): boolean {

    this.log.trace(`${LOG_PREFIX} Entering isOptionsPageValid()`);

    let valid: boolean = true;

    // Check if options are needed
    if (this.isOptionable(this.getFieldTypeId())) {

      // Options are needed
      // Check if options have been provided
      if (!(this.options.length > 0)) {
        this.errors.set("options", "Please select one or more options from the above list");
        valid = false;
      }

    } else {

      // Options are not needed

    }

    // Clear previous errors if valid
    if (valid) {
      this.errors.delete("options");
    }

    this.cd.detectChanges();

    return valid;
  }



  /**
 * Checks whether the conditional relevancy page's details have been fully and correctly specified
 * @returns True or False
 */
  private isConditionalRelevancyPageValid(): boolean {

    this.log.trace(`${LOG_PREFIX} Entering isConditionalRelevancyPageValid()`);

    let valid: boolean = true;


    // Check if the field is conditionally relevant
    if (this.isConditional()) {

      // The field is conditionally relevant
      // Check if the relevancy rule has been initialised
      if (this.relevancyRule) {

        // Validate the field
        if (!this.relevancyRule.fieldId) {
          this.errors.set("relevancy", "Relevancy rule's field is required");
          valid = false;
        }

        // Validate the operator
        if (!this.relevancyRule.operatorId) {
          this.errors.set("relevancy", "Relevancy rule's operator is required");
          valid = false;
        }

        // Validate the value
        if (!this.relevancyRule.value) {
          this.errors.set("relevancy", "Relevancy rule's value is required");
          valid = false;
        }


      } else {
        this.errors.set("relevancy", "Please specify the relevancy rule");
        valid = false;
      }

    } else {

      // The field is unconditionally relevant

    }

    // Clear previous errors if valid
    if (valid) {
      this.errors.delete("relevancy");
    }

    this.cd.detectChanges();

    return valid;
  }



  /**
 * Checks whether the validation page's details have been fully and correctly specified
 * @returns True or False
 */
  private isValidationPageValid(): boolean {

    this.log.trace(`${LOG_PREFIX} Entering isValidationPageValid()`);

    let valid: boolean = true;


    // Check if the field needs validating
    if (this.isValidated()) {

      // The field needs validating
      // Check if a validation rule has been initialised
      if (this.validationRules.length > 0) {

        // Validate all provided rules
        this.validationRules.forEach(v => {

          // Validate the operator
          if (!v.operatorId) {
            this.errors.set("validation", "Each relevancy rule's operator is required");
            valid = false;
          }

          // Validate the value
          if (!v.value) {
            this.errors.set("relevancy", "Each relevancy rule's value is required");
            valid = false;
          }

        });


      } else {
        this.errors.set("validation", "Please specify the validation rules");
        valid = false;
      }

    } else {

      // The field does not need validating

    }

    // Clear previous errors if valid
    if (valid) {
      this.errors.delete("relevancy");
    }

    this.cd.detectChanges();

    return valid;
  }


  /**
   * Validates and saves a new Data Form Field Record.
   * Emits a succeeded or failed event depending on whether the save request succeeded or failed respectively
   * Error 400 = Indicates that a user error was encountered
   * Error 500 = Indicates that a system error was encountered
   */
  public save(): void {

    this.log.trace(`${LOG_PREFIX} Entering save()`);

    // Check if the provided details are valid
    this.log.trace(`${LOG_PREFIX} Checking if the provided details are valid`);
    if (this.dataFormId && this.isValid()) {

      // The provided details are valid
      this.log.trace(`${LOG_PREFIX} The provided details are valid`);

      // Get the incoming data form element's predecessor
      this.log.trace(`${LOG_PREFIX} Getting the incoming data form element's predecessor`);
      this.dataFormsElementsDataService
        .getLastDataFormElement(this.dataFormId, this.parentId)
        .subscribe({
          next: (res: DataFormElement | null) => {

            // Save the record
            this.log.trace(`${LOG_PREFIX} Saving the Data Form Field`);
            this.dataFormsElementsDataService
              .createDataFormElement(
                new DataFormElement(
                  {
                    data: {
                      contextId: this.contextId,
                      dataFormId: this.dataFormId,
                      categoryId: 2,
                      typeId: this.getFieldTypeId(),
                      parentId: this.parentId? this.parentId : null,
                      layoutId: null,
                      index: (res && res.data.index) ? res.data.index + 1 : 1,
                      code: null,
                      titled: null,
                      title: this.getTitle(),
                      described: this.isDescribed(),
                      description: this.isDescribed() ? this.getDescription() : null,
                      conditionallyRelevant: this.isConditional(),
                      conditionalRelevancyRule: this.isConditional() ? this.relevancyRule : null,
                      repeated: null,
                      repeatabilityRule: null,
                      validated: this.isValidated(),
                      validationRules: this.isValidated() ? this.validationRules : null,
                      reserved: null,
                      hidden: null,
                      required: this.isRequired(),
                      options: this.isOptionable(this.getFieldTypeId()) ? this.getOptionsIds() : null
                    },
                    version: null
                  }))
              .subscribe({
                next: (response: DataFormElement) => {

                  // The Field was saved successfully
                  this.log.trace(`${LOG_PREFIX} Field was saved successfuly`);

                  // Reset window
                  this.reset();

                  // Emit a 'succeeded' event
                  this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
                  this.succeeded.emit();
                },
                error: (error: any) => {

                  // The Field was not saved successfully
                  this.log.trace(`${LOG_PREFIX} Field was not saved successfuly`);

                  // Emit a 'failed' event
                  this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
                  this.failed.emit(500);
                }
              });

          },
          error: (err: any) => {

            // Incoming data form element's predecessor retrieval failed
            this.log.trace(`${LOG_PREFIX} Incoming data form element's predecessor retrieval failed`);

            // Emit a 'failed' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
            this.failed.emit(500);
          }
        });



    } else {

      // The provided details are not valid
      this.log.trace(`${LOG_PREFIX} The provided details are not valid`);

      // Invoke the childrens validator to display the errors in case the error lies in the children components
      switch (this.page) {

        case "relevancy":
          this._relevancyRuleConfigurer.isValid();
          break;

        case "validity":
          this._validationRulesConfigurers.forEach(v => {
            v.isValid()
          });
          break;
      }

      // Emit an 'invalid' event
      this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
      this.failed.emit(400);
    }

  }


  /**
   * Resets the window
   */
  private reset() {

    this.log.trace(`${LOG_PREFIX} reset`);

    // Clear the relevancy rule
    this.relevancyRule = null;

    // Clear the validation rules
    this.validationRules = [];

    // Clear the options
    this.options = [];

    // Reset the visible content
    this.page = "default";


    // Reset the Data Form Fields
    this.dataFormsFieldsForm.get('type.typeId')?.setValue(null);
    this.dataFormsFieldsForm.get('type.typeTitle')?.setValue("Select Type");
    this.dataFormsFieldsForm.get('title')?.setValue(null);
    this.dataFormsFieldsForm.get('described')?.setValue(false);
    this.dataFormsFieldsForm.get('conditionallyRelevant')?.setValue(false);
    this.dataFormsFieldsForm.get('required')?.setValue(false);
    this.dataFormsFieldsForm.get('validated')?.setValue(false);
    this.dataFormsFieldsForm.get('description')?.setValue("");

    // Clear the processing errors
    this.errors.clear();
  }


}
