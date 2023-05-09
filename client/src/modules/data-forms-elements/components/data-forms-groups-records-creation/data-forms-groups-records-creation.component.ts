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
  ViewChild
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FilterService } from '@app/app-filter.service';
import { TextUtilService } from '@common/services/text-util.service';
import { DataFormsElementsTypesDataService } from '@modules/data-forms-elements-types/services/data-forms-elements-types-data.service';
import { RelevancyRule } from '@modules/data-forms-elements/models';
import { DataFormElement } from '@modules/data-forms-elements/models/data-form-element.model';
import { DataFormsElementsDataService } from '@modules/data-forms-elements/services/data-forms-elements-data.service';
import { OperatorsDataService } from '@modules/operators/services/operators-data.service';
import { OptionsSelectionDataService } from '@modules/options/services/options-selection-data.service';
import { NGXLogger } from 'ngx-logger';
import { DataFormsElementsRelevanciesRulesConfigurationComponent } from '../data-forms-elements-relevancies-rules-configuration/data-forms-elements-relevancies-rules-configuration.component';
import { RepeatabilityRule } from '@modules/data-forms-elements/models/repeatability-rule.model';
import { DataFormsGroupsRepeatCountsConfigurationComponent } from '../data-forms-groups-repeat-count-configuration/data-forms-groups-repeat-count-configuration.component';

const LOG_PREFIX: string = "[Data Forms Groups Records Creation Component]";

@Component({
  selector: 'sb-data-forms-groups-records-creation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './data-forms-groups-records-creation.component.html',
  styleUrls: ['data-forms-groups-records-creation.component.scss'],
})
export class DataFormsGroupsRecordsCreationComponent implements OnInit, OnDestroy {

  // Allows the parent component to inject the unique identifier of the target contex record
  @Input() public contextId: number | null | undefined;

  // Allows the parent component to inject the unique identifier of the parent Data Form record
  @Input() public dataFormId: number | null | undefined;

  // Allows the parent component to inject the unique identifier of the parent Data Form Element record
  @Input() public parentId: number | null | undefined;

  // Broadcasts successful Data Form Groups creation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Data Form Groups creation events together with their error codes
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Broadcasts selector windows open events
  @Output() public openedFieldSelector: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts selector windows closed events
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

  // Keeps a local reference to the displayed repeatability rule configurer component.
  private _repeatabilityRuleConfigurer!: DataFormsGroupsRepeatCountsConfigurationComponent;

  // Keeps tabs of the relevancy rule
  public relevancyRule: RelevancyRule | null = null;

  // Keeps tabs of the repeatability rule
  public repeatabilityRule: RepeatabilityRule | null = null;

  // Keeps tabs of the currently visible content
  public page: string = "default";

  // Keeps tabs of the processing errors
  public errors: Map<string, string> = new Map();

  // Keeps tabs of whether the page has been successfully initialised
  public initialised: boolean = false;

  // Defines Data Form Groups reactive form controls group to gather the basic details
  public dataFormsGroupsForm = new FormGroup({
    titled: new FormControl<boolean>(true),
    title: new FormControl<string | null>(''),
    described: new FormControl<boolean>(false),
    description: new FormControl<string | null>(''),
    conditionallyRelevant: new FormControl<boolean>(false),
    repeated: new FormControl<boolean>(false),
    layoutId: new FormControl<number>(1),
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
   * Initialises the local reference to the displayed repeatability rule configurer component
   */
  @ViewChild(DataFormsGroupsRepeatCountsConfigurationComponent)
  public set repeatabilityRuleConfigurer(repeatabilityRuleConfigurer: DataFormsGroupsRepeatCountsConfigurationComponent) {

    this.log.trace(`${LOG_PREFIX} Entering setRepeatabilityRuleConfigurer()`);

    if (repeatabilityRuleConfigurer) {
      this._repeatabilityRuleConfigurer = repeatabilityRuleConfigurer;
    }
  }


  /**
   * Initialises the form changes listener
   */
  private initialiseFormChangesListener(callback: (() => void)): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseFormChangesListener()`);

    // Subscribe to flags that indicate whether or not the field should be conditionally relevant
    this.dataFormsGroupsForm.get('conditionallyRelevant')?.valueChanges.subscribe(conditional => {

      // If the field is conditionally relevant, then there will be a relevancy configuration page
      // This makes the default page the first page
      if (conditional) {
        this.loadedFirstPage.emit();
      } else {

        // If the element needs to be repeated, then there will be a repeat count configuration page
        // This still makes the default page the first page
        if (this.dataFormsGroupsForm.get('repeated')?.value) {
          this.loadedFirstPage.emit();
        } else {

          // If the field is not conditionally relevant & does not need validation, then the current page is a standalone page
          this.loadedStandalonePage.emit();
        }

      }
    });


    // Subscribe to flags that indicate whether or not the field should be repeated
    this.dataFormsGroupsForm.get('repeated')?.valueChanges.subscribe(repeated => {

      // If the element needs to be repeated, then there will be a repeat count configuration page
      // This makes the default page the first page
      if (repeated) {
        this.loadedFirstPage.emit();
      } else {

        // If the field is conditionally relevant, then there will be a relevancy configuration page
        // This still makes the default page the first page
        if (this.dataFormsGroupsForm.get('conditionallyRelevant')?.value) {
          this.loadedFirstPage.emit();
        } else {

          // If the field is not conditionally relevant & is not repeatable, then the current page is a standalone page
          this.loadedStandalonePage.emit();

        }
      }
    });


    // Subscribe to field title updates and check for errors
    this.dataFormsGroupsForm.get('title')?.valueChanges.subscribe(val => {
      this.isTitleValid();
    });

    // Subscribe to field description updates and check for errors
    this.dataFormsGroupsForm.get('description')?.valueChanges.subscribe(val => {
      this.isDescriptionValid();
    });

    // Transfer control to the callback function
    callback();


  }


  /**
   * Retrieves the title of the group
   * @returns the title
   */
  public getTitle(): string | null | undefined {
    return this.dataFormsGroupsForm.get('title')?.value
  }

  /**
   * Retrieves the layout id of the group
   * @returns the layout id
   */
  public getLayoutId(): number | null | undefined {
    return this.dataFormsGroupsForm.get('layoutId')?.value
  }


  /**
   * Retrieves the description of the field
   * @returns the description
   */
  public getDescription(): string | null | undefined {
    return this.dataFormsGroupsForm.get('description')?.value
  }


  /**
   * Checks whether the field is described
   * @returns True or False
   */
  public isDescribed(): boolean {

    this.log.trace(`${LOG_PREFIX} Entering isDescribed()`);

    if (this.dataFormsGroupsForm.get('described')?.value) {
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

    if (this.dataFormsGroupsForm.get('conditionallyRelevant')?.value) {
      return true;
    } else {
      return false;
    }

  }


  /**
   * Establishes whether the field should be repeated
   * @returns True or False
   */
  public isRepeated(): boolean {

    this.log.trace(`${LOG_PREFIX} Entering isRepeated()`);

    if (this.dataFormsGroupsForm.get('repeated')?.value) {
      return true;
    } else {
      return false;
    }

  }



  /**
   * Calls upon the relevancy rule configuration subcomponent to close its Fields Selector
   */
  public closeFieldSelector(): void {

    this.log.trace(`${LOG_PREFIX} Entering closeFieldSelector()`);


    switch (this.page) {

      case "relevancy":

        // Prompt the relevancy rule configurer to close the field selector
        this.log.trace(`${LOG_PREFIX} Prompting the relevancy rule configurer to close the field selector`);
        this._relevancyRuleConfigurer.onCloseFieldSelector();

        break;

      case "repeatability":

        // Prompt the repeatability rule configurer to close the field selector
        this.log.trace(`${LOG_PREFIX} Prompting the repeatability rule configurer to close the field selector`);
        this._repeatabilityRuleConfigurer.onCloseFieldSelector();

        break;
    }



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
  * Flags whether or not the field should be titled
  * @param e Switch event
  */
  public toggleTitleability(e: any): void {

    this.log.trace(`${LOG_PREFIX} Entering toggleTitleability()`);

    // Check if the switch has been checked
    this.log.trace(`${LOG_PREFIX} Checking if the switch has been checked`);
    if (e.target.checked) {

      // The switch has been checked
      this.log.trace(`${LOG_PREFIX} The switch has been checked`);

      // Update the form
      this.log.trace(`${LOG_PREFIX} Updating the form`);
      this.dataFormsGroupsForm.get('titled')?.setValue(true);


    } else {

      // The switch has been unchecked
      this.log.trace(`${LOG_PREFIX} The switch has been unchecked`);

      // Update the form
      this.log.trace(`${LOG_PREFIX} Updating the form`);
      this.dataFormsGroupsForm.get('titled')?.setValue(false);
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
      this.dataFormsGroupsForm.get('described')?.setValue(true);


    } else {

      // The switch has been unchecked
      this.log.trace(`${LOG_PREFIX} The switch has been unchecked`);

      // Update the form
      this.log.trace(`${LOG_PREFIX} Updating the form`);
      this.dataFormsGroupsForm.get('described')?.setValue(false);
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
      this.dataFormsGroupsForm.get('conditionallyRelevant')?.setValue(true);

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
      this.dataFormsGroupsForm.get('conditionallyRelevant')?.setValue(false);

      // Update the relevancy rule
      this.log.trace(`${LOG_PREFIX} Updating the relevancy rule`);
      this.relevancyRule = null;
    }

  }



  /**
   * Flags whether or not the field should be repeated
   * @param e Switch event
   */
  public toggleRepeatability(e: any): void {

    this.log.trace(`${LOG_PREFIX} Entering toggleRepeatability()`);

    // Check if the switch has been checked
    this.log.trace(`${LOG_PREFIX} Checking if the switch has been checked`);
    if (e.target.checked) {

      // The switch has been checked
      this.log.trace(`${LOG_PREFIX} The switch has been checked`);

      // Update the form
      this.log.trace(`${LOG_PREFIX} Updating the form`);
      this.dataFormsGroupsForm.get('repeated')?.setValue(true);

      // Update the repeatability rule
      this.log.trace(`${LOG_PREFIX} Updating the repeatability rule`);
      this.repeatabilityRule = new RepeatabilityRule({
        fieldId: null
      });

    } else {

      // The switch has been unchecked
      this.log.trace(`${LOG_PREFIX} The switch has been unchecked`);

      // Update the form
      this.log.trace(`${LOG_PREFIX} Updating the form`);
      this.dataFormsGroupsForm.get('repeated')?.setValue(false);

      // Update the repeatability rule
      this.log.trace(`${LOG_PREFIX} Updating the repeatability rule`);
      this.repeatabilityRule = null;
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

          // Check if the field is conditionally relevant
          this.log.trace(`${LOG_PREFIX} Checking if the field is conditionally relevant`);
          if (this.dataFormsGroupsForm.get('conditionallyRelevant')?.value) {

            // The field is conditionally relevant
            this.log.trace(`${LOG_PREFIX} The field is conditionally relevant`);

            // Load the relevancy configuration window
            this.log.trace(`${LOG_PREFIX} Loading the relevancy configuration window`);
            this.page = "relevancy";

            // Check if the element needs to be repeated
            this.log.trace(`${LOG_PREFIX} Checking if the element needs to be repeated`);
            if (this.dataFormsGroupsForm.get('repeated')?.value) {

              // The field needs to be repeated
              this.log.trace(`${LOG_PREFIX} The field needs to be repeated`);

              // Mark the current page as a nested page
              this.log.trace(`${LOG_PREFIX} Marking the current page as a nested page`);
              this.loadedNestedPage.emit(true);

            } else {

              // The field does not need to be repeated
              this.log.trace(`${LOG_PREFIX} The field does not need to be repeated`);

              // Mark the current page as the last page
              this.log.trace(`${LOG_PREFIX} Marking the current page as the last page`);
              this.loadedLastPage.emit(true);

            }

          } else {

            // The field is not conditionally relevant
            this.log.trace(`${LOG_PREFIX} The field is not conditionally relevant`);

            // Check if the element needs to be repeated
            this.log.trace(`${LOG_PREFIX} Checking if the element needs to be repeated`);
            if (this.dataFormsGroupsForm.get('repeated')?.value) {

              // The field needs to be repeated
              this.log.trace(`${LOG_PREFIX} The field needs to be repeated`);

              // Load repeatability configuration window
              this.log.trace(`${LOG_PREFIX} Loading the repeatability configuration window`);
              this.page = "repeatability";

              // Mark the current page as the last page
              this.log.trace(`${LOG_PREFIX} Marking the current page as the last page`);
              this.loadedLastPage.emit(true);

            } else {

              // The field does not need to be repeated
              this.log.trace(`${LOG_PREFIX} The field does not need to be repeated`);

              // Mark the wizard as having reached a premature end
              this.log.error(`${LOG_PREFIX} The wizard has reached a premature end`);

            }

          }


        }


        break;


      case "relevancy":

        // Move to the next page iff the current page is valid
        if (this.isConditionalRelevancyPageValid()) {

          // Check if the element needs to be repeated
          this.log.trace(`${LOG_PREFIX} Checking if the element needs to be repeated`);
          if (this.dataFormsGroupsForm.get('repeated')?.value) {

            // The field needs to be repeated
            this.log.trace(`${LOG_PREFIX} The field needs to be repeated`);

            // Load repeatability configuration window
            this.log.trace(`${LOG_PREFIX} Loading repeatability configuration window`);
            this.page = "repeatability";

            // Mark the current page as the last page
            this.log.trace(`${LOG_PREFIX} Marking the current page as the last page`);
            this.loadedLastPage.emit(true);

          } else {

            // The field does not need to be repeated
            this.log.trace(`${LOG_PREFIX} The field does not need to be repeated`);

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

      case "repeatability":

        // Check if the field is conditionally relevant
        this.log.trace(`${LOG_PREFIX} Checking if the field is conditionally relevant`);
        if (this.dataFormsGroupsForm.get('conditionallyRelevant')?.value) {

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

    // Validate the conditional relevancy page
    if (!this.isConditionalRelevancyPageValid()) {
      valid = false;
    }

    // Validate the repeatability rules
    if (!this.isRepeatabilityPageValid()) {
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

    // Validate description
    if (!this.isDescriptionValid()) {
      valid = false;
    }

    this.cd.detectChanges();

    return valid;
  }


  /**
   * Checks whether the group is titled
   * @returns True or False
   */
  public isTitled(): boolean {

    this.log.trace(`${LOG_PREFIX} Entering isTitled()`);

    if (this.dataFormsGroupsForm.get('titled')?.value) {
      return true;
    } else {
      return false;
    }

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
 * Checks whether the description is valid if its warranted
 * @returns True or False 
 */
  private isDescriptionValid(): boolean {

    let valid: boolean = true;

    // Check for errors only if its necessary
    if (this.dataFormsGroupsForm && this.isDescribed()) {

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
 * Checks whether the repeatability page's details have been fully and correctly specified
 * @returns True or False
 */
  private isRepeatabilityPageValid(): boolean {

    this.log.trace(`${LOG_PREFIX} Entering isRepeatabilityPageValid()`);

    let valid: boolean = true;


    // Check if the group needs to be repeated
    if (this.isRepeated()) {

      // The field needs 
      // Check if a validation rule has been initialised
      if (this.repeatabilityRule) {

        // Validate the field
        if (!this.repeatabilityRule.fieldId) {
          this.errors.set("repeatability", "Repeatability rule's field is required");
          valid = false;
        }


      } else {
        this.errors.set("repeatability", "Please specify the repeatability rule");
        valid = false;
      }

    } else {

      // The field does not need validating

    }

    // Clear previous errors if valid
    if (valid) {
      this.errors.delete("repeatability");
    }

    this.cd.detectChanges();

    return valid;
  }


  /**
   * Validates and saves a new Data Form Group Record.
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
            this.log.trace(`${LOG_PREFIX} Saving the Data Form Group`);
            this.dataFormsElementsDataService
              .createDataFormElement(
                new DataFormElement(
                  {
                    data: {
                      contextId: this.contextId,
                      dataFormId: this.dataFormId,
                      categoryId: 1,
                      typeId: this.isRepeated() ? 2 : 1,
                      parentId: this.parentId? this.parentId : null,
                      layoutId: this.getLayoutId(),
                      index: (res && res.data.index) ? res.data.index + 1 : 1,
                      code: null,
                      titled: this.isTitled(),
                      title: this.getTitle(),
                      described: this.isDescribed(),
                      description: this.isDescribed() ? this.getDescription() : null,
                      conditionallyRelevant: this.isConditional(),
                      conditionalRelevancyRule: this.isConditional() ? this.relevancyRule : null,
                      repeated: this.isRepeated(),
                      repeatabilityRule: this.repeatabilityRule,
                      validated: null,
                      validationRules: null,
                      reserved: null,
                      hidden: null,
                      required: null,
                      options: null
                    },
                    version: null
                  }))
              .subscribe({
                next: (response: DataFormElement) => {

                  // The Group was saved successfully
                  this.log.trace(`${LOG_PREFIX} Group was saved successfuly`);

                  // Reset window
                  this.reset();

                  // Emit a 'succeeded' event
                  this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
                  this.succeeded.emit();
                },
                error: (error: any) => {

                  // The Group was not saved successfully
                  this.log.trace(`${LOG_PREFIX} Group was not saved successfuly`);

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

        case "repeatability":
          this._repeatabilityRuleConfigurer.isValid();
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

    // Clear the repeatability rule
    this.repeatabilityRule = null;

    // Reset the visible content
    this.page = "default";


    // Reset the Data Form Groups
    this.dataFormsGroupsForm.get('title')?.setValue(null);
    this.dataFormsGroupsForm.get('described')?.setValue(false);
    this.dataFormsGroupsForm.get('description')?.setValue("");
    this.dataFormsGroupsForm.get('conditionallyRelevant')?.setValue(false);
    this.dataFormsGroupsForm.get('repeated')?.setValue(false);

    // Clear the processing errors
    this.errors.clear();
  }


}
