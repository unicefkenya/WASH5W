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
import { Observable, first, of, map } from 'rxjs';

const LOG_PREFIX: string = "[Data Forms Fields Records Updation Component]";

@Component({
  selector: 'sb-data-forms-fields-records-updation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './data-forms-fields-records-updation.component.html',
  styleUrls: ['data-forms-fields-records-updation.component.scss'],
})
export class DataFormsFieldsRecordsUpdationComponent implements OnInit, OnDestroy {

  // Allows the parent component to inject the unique identifier of the target record
  @Input() public id!: number;

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

  // Holds the Data Form  Element record with the passed in id
  public dataFormField: DataFormElement | null | undefined;

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
    description: new FormControl<string | null>(''),
    conditionallyRelevant: new FormControl<boolean>(false),
    required: new FormControl<boolean>(false),
    validated: new FormControl<boolean>(false),
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



  }


  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    this.initialiseDataFormField(() => {

      this.initialiseRelevancyRule(() => {

        this.initialiseValidationRules(() => {

          this.initialiseOptions(() => {

            this.initialiseDataFormsFieldsForm(() => {

              this.initialiseDataFormsFieldsFormChangesListener(() => {

                this.broadcastPageType(() => {

                  // Mark Init as complete
                  this.log.trace(`${LOG_PREFIX} Init completed`);
                  this.initialised = true;
                  this.cd.detectChanges();

                })

              })
            })
          })
        })
      })


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
   * Retrieves the Data Form Field with the injected id and sets it as the Data Form Field that needs to be updated
   * @param callback The function to call when done
   */
  private initialiseDataFormField(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseDataFormField()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    // Get the data form field corresponding to the passed in id
    this.log.trace(`${LOG_PREFIX} Getting the data form field corresponding to the passed in id`);
    this.getDataFormField$(this.id)
      .subscribe({
        next: (dataFormField: DataFormElement | null) => {

          // Set the target Data Form Field
          this.log.trace(`${LOG_PREFIX} Setting the target Data Form Field`);
          this.dataFormField = dataFormField;

          // Transfer control to the callback function
          this.log.trace(`${LOG_PREFIX} Returning`);
          callback();

        }
      })

  }


  /**
   * Creates a local copy of the relevancy rule fashioned after the previously saved details in the target Data Form Field
   * @param callback The function to call when done
   */
  private initialiseRelevancyRule(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseRelevancyRule()`);

    // Initialise the relevancy rule
    this.log.trace(`${LOG_PREFIX} Initialise the relevancy rule`);
    this.relevancyRule = this.dataFormField ? Object.assign({}, this.dataFormField?.data.conditionalRelevancyRule) : null;

    // Transfer control to the callback function
    this.log.trace(`${LOG_PREFIX} Returning`);
    callback();

  }



  /**
   * Creates a local copy of the validation rules fashioned after the previously saved details in the target Data Form Field
   * @param callback The function to call when done
   */
  private initialiseValidationRules(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseValidationRules()`);

    // Initialise the validation rules
    this.log.trace(`${LOG_PREFIX} Initialise the validation rules`);
    this.validationRules = this.dataFormField ? Object.assign([], this.dataFormField?.data.validationRules) : [];

    // Transfer control to the callback function
    this.log.trace(`${LOG_PREFIX} Returning`);
    callback();

  }


  /**
   * Creates a local copy of selected option records fashioned after the previously saved option ids in the target Data Form Field
   * @param callback The function to call when done
   */
  private initialiseOptions(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseOptions()`);

    // Check if the field is optionable
    this.log.trace(`${LOG_PREFIX} Checking if the field is optionable`);
    if (this.dataFormField && this.isOptionable(this.dataFormField.data.typeId)) {

      // The field is optionable
      this.log.trace(`${LOG_PREFIX} The field is optionable`);

      // Get the options corresponding to the data form field
      this.log.trace(`${LOG_PREFIX} Getting the options corresponding to the data form field`);
      this.getOptions$(this.dataFormField.data.options)
        .subscribe({
          next: (options: Option[]) => {

            // Initialise the options
            this.log.trace(`${LOG_PREFIX} Initialising the options`);
            this.options = options;

            // Transfer control to the callback function
            this.log.trace(`${LOG_PREFIX} Returning`);
            callback();

          }
        });

    } else {

      // The field is not optionable
      this.log.trace(`${LOG_PREFIX} The field is not optionable`);

      // Initialise options to an empty array
      this.log.trace(`${LOG_PREFIX} Initialising options to an empty array`);
      this.options = [];

      // Transfer control to the callback function
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    }

  }

  /**
  * Initialises the data field updation reactive form
  * @param callback The function to call once the initialisation is complete 
  */
  private initialiseDataFormsFieldsForm(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseDataFormsFieldsForm()`);

    // Get the target field type
    this.log.trace(`${LOG_PREFIX} Getting the target field type`);
    this.getDataFormFieldType$(this.dataFormField?.data.typeId)
      .subscribe({
        next: (fieldType: DataFormElementType | null) => {

          this.log.debug(`${LOG_PREFIX} Data Form Element Type = ${fieldType}`);

          // Update the form
          this.log.trace(`${LOG_PREFIX} Updating the form`);
          this.dataFormsFieldsForm.get('type.typeId')?.setValue((fieldType && fieldType.id) ? fieldType.id : null);
          this.dataFormsFieldsForm.get('type.typeTitle')?.setValue((fieldType && fieldType.data.name) ? this.textUtilService.truncate(fieldType.data.name, [35, "..."]) : null);
          this.dataFormsFieldsForm.get('title')?.setValue(this.dataFormField?.data.title ? this.dataFormField?.data.title : null);
          this.dataFormsFieldsForm.get('described')?.setValue(this.dataFormField?.data.described ? this.dataFormField?.data.described : false);
          this.dataFormsFieldsForm.get('description')?.setValue(this.dataFormField?.data.description ? this.dataFormField?.data.description : null);
          this.dataFormsFieldsForm.get('conditionallyRelevant')?.setValue(this.dataFormField?.data.conditionallyRelevant ? this.dataFormField?.data.conditionallyRelevant : false);
          this.dataFormsFieldsForm.get('required')?.setValue(this.dataFormField?.data.required ? this.dataFormField?.data.required : false);
          this.dataFormsFieldsForm.get('validated')?.setValue(this.dataFormField?.data.validated ? this.dataFormField?.data.validated : false);

          // Transfer control to the callback function
          this.log.trace(`${LOG_PREFIX} Returning`);
          callback();

        }
      })
  }



  /**
   * Initialises the form changes listener
   */
  private initialiseDataFormsFieldsFormChangesListener(callback: (() => void)): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseDataFormsFieldsFormChangesListener()`);

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
    this.log.trace(`${LOG_PREFIX} Returning`);
    callback();


  }



  /**
   * Broadcasts the current page type - first or standalone
   */
  private broadcastPageType(callback: (() => void)): void {

    this.log.trace(`${LOG_PREFIX} Entering broadcastPageType()`);

    if (this.isConditionallyRelevant() || this.isValidated() || this.isOptionable(this.dataFormField?.data.typeId)) {

      // Mark the page as the first page
      this.log.trace(`${LOG_PREFIX} Marking the page as the first page`);
      this.loadedFirstPage.emit();


    } else {

      // Mark the page as a standalone page
      this.log.trace(`${LOG_PREFIX} Marking the page as a standalone page`);
      this.loadedStandalonePage.emit();
    }


    // Transfer control to the callback function
    this.log.trace(`${LOG_PREFIX} Returning`);
    callback();

  }


  /**
  * Retrieves a Data Form Field record given its unique identifier synchronously
  * @param id The unique identifier of the Data Form Field
  */
  public getDataFormField$(id: number | null | undefined): Observable<DataFormElement | null> {

    this.log.trace(`${LOG_PREFIX} Entering getDataFormField$()`);

    // Check if the Data Form Field's Id was specified
    this.log.trace(`${LOG_PREFIX} Checking if the Data Form Field's Id was specified`);
    if (id) {

      // The Data Form Field's Id was specified
      this.log.trace(`${LOG_PREFIX} The Data Form Field's Id was specified`);
      this.log.debug(`${LOG_PREFIX} Data Form Field = ${JSON.stringify(id)}`);

      // Asynchronously get and return the Data Form Field
      return new Observable(obs => {

        // Try retrieving a Data Form Field Record with the passed in id
        this.log.trace(`${LOG_PREFIX} Trying to retrieve a Data Form Field Record with the passed in id`);
        const dataFormField: DataFormElement | undefined = id ? this.dataFormsElementsDataService.records.find(d => d.id == id) : undefined;

        // Check if the Data Form Field Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} Checking if the Data Form Field Record was successfully retrieved`);
        if (dataFormField) {

          // The Data Form Field Record was successfully retrieved
          this.log.trace(`${LOG_PREFIX} The Data Form Field Record was successfully retrieved`);
          this.log.debug(`${LOG_PREFIX} Data Form Field Record = ${JSON.stringify(dataFormField)}`);

          // Return the Data Form Field
          this.log.trace(`${LOG_PREFIX} Returning the Data Form Field`);
          obs.next(dataFormField);

        } else {

          // The Data Form Field Record was not successfully retrieved
          this.log.trace(`${LOG_PREFIX} The Data Form Field Record was not successfully retrieved`);

          // Return null
          this.log.warn(`${LOG_PREFIX} Returning null`);
          obs.next(null);

        }

      });

    } else {

      // The Data Form Field's Id was not specified
      this.log.trace(`${LOG_PREFIX} The Data Form Field's Id was not specified`);

      // Return an empty observable
      this.log.trace(`${LOG_PREFIX} Returning an empty observable`);
      return of(null);
    }


  }



  /**
  * Retrieves a Data Form Field Type record given its unique identifier synchronously
  * @param id The unique identifier of the Data Form Field Type
  */
  public getDataFormFieldType$(id: number | null | undefined): Observable<DataFormElementType | null> {

    this.log.trace(`${LOG_PREFIX} Entering getDataFormFieldType$()`);

    // Check if Data Form Field Type's Id was specified
    this.log.trace(`${LOG_PREFIX} Checking if Data Form Field Type's Id was specified`);
    if (id) {

      // The Data Form Field Type's Id was specified
      this.log.trace(`${LOG_PREFIX} The Data Form Field Type's Id was specified`);
      this.log.debug(`${LOG_PREFIX} Data Form Field Type = ${JSON.stringify(id)}`);

      // Asynchronously get the Data Form Field Type's operators
      this.log.trace(`${LOG_PREFIX} Asynchronously getting the Data Form Field Type's operators`);
      return new Observable(obs => {

        // Get the Data Form Field's Data Form Field Type
        this.dataFormsElementsTypesDataService.getDataFormElementTypeById$(id)
          .pipe(first())
          .subscribe({
            next: (value: DataFormElementType) => {

              // Return the operators
              this.log.trace(`${LOG_PREFIX} Returning the operators`);
              obs.next(value);
            }
          });
      });

    } else {

      // The Data Form Field Type's Id was not specified
      this.log.trace(`${LOG_PREFIX} The Data Form Field Type's Id was not specified`);

      // Return an empty observable
      this.log.trace(`${LOG_PREFIX} Returning an empty observable`);
      return of(null);
    }


  }


  /**
   * Asynchronously retrieves the options associated with given unique identifiers
   * @param optionsIds The options unique ids
   * @returns The options
   */
  public getOptions$(optionsIds: number[] | null | undefined): Observable<Option[]> {

    this.log.trace(`${LOG_PREFIX} Entering getOptions()`);
    this.log.debug(`${LOG_PREFIX} Option Ids = ${JSON.stringify(optionsIds)}`);

    // Check if the Option Ids were specified
    this.log.trace(`${LOG_PREFIX} Checking if the Option Ids were specified`);
    if (optionsIds && optionsIds.length > 0) {

      // The Option Ids were specified
      this.log.trace(`${LOG_PREFIX} The Option Ids were specified`);

      // Asynchronously get the corresponding Options
      this.log.trace(`${LOG_PREFIX} Asynchronously getting the corresponding Options`);
      return new Observable(obs => {

        // Get all the options
        this.optionsDataService.getOptions(true, {
          searchTerm: null,
          page: null,
          pageSize: null,
          sortColumn: 'id',
          sortDirection: 'asc',
          ids: null,
          typeId: null,          
          name: null
        })
          .pipe(
            first(),
            map((options: Option[]) => {
              return options.filter(o => o.id && optionsIds.includes(o.id));
            }))
          .subscribe({
            next: (options: Option[]) => {

              // Return the relevant options
              this.log.trace(`${LOG_PREFIX} Returning the relevant options`);
              obs.next(options);
            }
          });
      });

    } else {

      // The Option Ids were not specified
      this.log.trace(`${LOG_PREFIX} The Option Ids were not specified`);

      // Return an empty observable
      this.log.trace(`${LOG_PREFIX} Returning an empty observable`);
      return of([]);
    }


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
    this.options ? this.options.forEach(o => {
      if (o.id) {
        optionsIds.push(o.id);
      }
    }) : [];
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
  public isConditionallyRelevant(): boolean {

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

    // Check if the field is optionalable
    this.log.trace(`${LOG_PREFIX} Checking if the field is optionalable`);
    if (this.isOptionable(this.getFieldTypeId())) {

      // Field is optionalable
      this.log.trace(`${LOG_PREFIX} Field is optionalable`);

      // Mark the current page as the first page
      this.log.trace(`${LOG_PREFIX} Marking the current page as the first page`);
      this.loadedFirstPage.emit(true);

    } else {

      // Field is not optionalable
      this.log.trace(`${LOG_PREFIX} Field is not optionalable`);

      // Clear any previously selected options
      this.options.length = 0;

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
    if (this.isConditionallyRelevant()) {

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
    if (this.isValid()) {

      // The provided details are valid
      this.log.trace(`${LOG_PREFIX} The provided details are valid`);

      // Save the record
      this.log.trace(`${LOG_PREFIX} Saving the Data Form Field`);
      this.dataFormsElementsDataService
        .updateDataFormElement(
          new DataFormElement(
            {
              id: this.dataFormField?.id,
              data: {
                contextId: this.dataFormField?.data.contextId,
                dataFormId: this.dataFormField?.data.dataFormId,
                categoryId: 2,
                typeId: this.getFieldTypeId(),
                parentId: this.dataFormField?.data.parentId,
                layoutId: null,
                index: this.dataFormField?.data.index,
                code: null,
                titled: null,
                title: this.getTitle(),
                described: this.isDescribed(),
                description: this.isDescribed() ? this.getDescription() : null,
                conditionallyRelevant: this.isConditionallyRelevant(),
                conditionalRelevancyRule: this.isConditionallyRelevant() ? this.relevancyRule : null,
                repeated: null,
                repeatabilityRule: null,
                validated: this.isValidated(),
                validationRules: this.isValidated() ? this.validationRules : null,
                reserved: null,
                hidden: null,
                required: this.isRequired(),
                options: this.isOptionable(this.getFieldTypeId()) ? this.getOptionsIds() : null
              },
              version: this.dataFormField?.version
            }))
        .subscribe({
          next: (response: DataFormElement) => {

            // The Field was updated successfully
            this.log.trace(`${LOG_PREFIX} Field was updated successfuly`);

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The Field was not updated successfully
            this.log.trace(`${LOG_PREFIX} Field was not updated successfuly`);

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

}
