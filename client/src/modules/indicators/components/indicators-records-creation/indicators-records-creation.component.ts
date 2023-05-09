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
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { FilterService } from '@app/app-filter.service';
import { TextUtilService } from '@common/services/text-util.service';
import { ContextsDataService } from '@modules/contexts/services/contexts-data.service';
import { DataFormElement } from '@modules/data-forms-elements/models/data-form-element.model';
import { DataForm } from '@modules/data-forms/models/data-form.model';
import { DataFormsDataService } from '@modules/data-forms/services/data-forms-data.service';
import { Indicator } from '@modules/indicators/models/indicator.model';
import { IndicatorsDataService } from '@modules/indicators/services/indicators-data.service';
import { LogicalHierarchy } from '@modules/logical-hierarchies/models/logical-hierarchy.model';
import { OptionsDataService } from '@modules/options/services/options-data.service';
import { Unit } from '@modules/units/models/unit.model';
import { UnitsDataService } from '@modules/units/services/units-data.service';
import { NGXLogger } from 'ngx-logger';
import { Observable, of, first, map } from 'rxjs';
import { Option } from '@modules/options/models/option.model';
import { AggregationsDataService } from '@modules/aggregations/services/aggregation-data.service';
import { Aggregation } from '@modules/aggregations/models/aggregation.model';
import { LogicalElement } from '@modules/logical-elements/models/logical-element.model';
import { LogicalElementsDataService } from '@modules/logical-elements/services/logical-elements-data.service';

const LOG_PREFIX: string = "[Indicators Records Creation Component]";

@Component({
  selector: 'sb-indicators-records-creation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './indicators-records-creation.component.html',
  styleUrls: ['indicators-records-creation.component.scss'],
})
export class IndicatorsRecordsCreationComponent implements OnInit, OnDestroy {

  // Allows the parent component to inject the unique identifier of the parent Context record
  @Input() public contextId!: number;

  // Allows the parent component to state whether the indicators should be associated with a logical strategy
  @Input() public logical: boolean = false;

  // Allows the parent component to state whether the indicators should be explicitly numbered
  @Input() public numbered: boolean = false;

  // Broadcasts selector windows open / close events
  @Output() public openedLogicalElementSelector: EventEmitter<void> = new EventEmitter<void>();
  @Output() public closedLogicalElementSelector: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts successful Indicators creation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Indicators creation events together with their error abbreviations
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Broadcasts standalone page window open events
  @Output() loadedStandalonePage: EventEmitter<boolean> = new EventEmitter<boolean>();

  // Broadcasts first window open events
  @Output() loadedFirstPage: EventEmitter<boolean> = new EventEmitter<boolean>();

  // Broadcasts nested window open events
  @Output() loadedNestedPage: EventEmitter<boolean> = new EventEmitter<boolean>();

  // Broadcasts last window open events
  @Output() loadedLastPage: EventEmitter<boolean> = new EventEmitter<boolean>();

  // Keep tabs on the selected subindicators
  public subindicators: Indicator[] = [];

  // Keep tabs on the selected form field
  public formField: DataFormElement | null = null;

  // Defines the default page reactive form controls group
  public defaultForm = new FormGroup({

    logicalElement: new FormGroup({
      logicalElementId: new FormControl<number | null | undefined>(null, [this.isLogicalParentRequired()]),
      logicalElementName: new FormControl<string>("Optionally choose logical parent"),
      truncatedLogicalElementName: new FormControl<string>("Optionally choose logical parent")
    }),

    no: new FormControl<string | null>('',
      [this.isNoRequired(), this.doesNoViolateMinimumLengthConstraint(), this.doesNoViolateMaximumLengthConstraint()],
      [this.doesNoViolateUniquenessConstraint()]),

    name: new FormControl<string | null>('',
      [this.isNameRequired(), this.doesNameViolateMinimumLengthConstraint(), this.doesNameViolateMaximumLengthConstraint()],
      [this.doesNameViolateUniquenessConstraint()]),

    unit: new FormGroup({
      unitId: new FormControl<number | null | undefined>(null, this.isUnitRequired()),
      unitAbbreviation: new FormControl<string>("")
    }),

    subindicatorsFilled: new FormControl<boolean>(false),

    formFilled: new FormControl<boolean>(false),

    aggregationId: new FormControl<number | null>(null),

    optionId: new FormControl<number | null>(null),

    cumulative: new FormControl<boolean>(false)

  });


  // Defines the rules page reactive form controls group
  public rulesForm = new FormGroup({

    aggregationId: new FormControl<number | null>(null, [this.isAggregationSpecificationRequired()]),

    optionId: new FormControl<number | null>(null, [this.isOptionSpecificationRequired()])

  });


  // Keeps tabs of the currently visible content
  page: string = "default";

  // Keeps tabs of the processing errors
  public errors: Map<string, string> = new Map();

  constructor(
    public contextsDataService: ContextsDataService,
    public indicatorsDataService: IndicatorsDataService,
    public unitsDataService: UnitsDataService,
    public dataFormsDataService: DataFormsDataService,
    public optionsDataService: OptionsDataService,
    public aggregationsDataService: AggregationsDataService,
    public textUtilService: TextUtilService,
    public logicalElementsDataService: LogicalElementsDataService,
    public filterService: FilterService,
    private cd: ChangeDetectorRef,
    private log: NGXLogger) {

  }


  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise form group
    this.initialiseFormGroup(() => {

      // Mark Init as complete
      this.log.trace(`${LOG_PREFIX} Init completed`);

    });




  }


  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }


  /**
 * Presets default values in the data creation form
 * @param callback The function to call when done
 */
  private initialiseFormGroup(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseFormGroup()`);

    // Get the selected logical element
    this.log.trace(`${LOG_PREFIX} Getting the selected logical element`);
    const selectedLogicalHierarchy: LogicalHierarchy | null | undefined = this.filterService.filter.selectedLogicalHierarchy;

    this.retrieveLogicalElementRecord(selectedLogicalHierarchy?.data?.responsible?.id, (logicalParent: LogicalElement | null) => {

      // Update the form
      this.log.trace(`${LOG_PREFIX} Updating the form`);
      this.defaultForm.get('logicalElement.logicalElementId')?.setValue(logicalParent?.id);
      this.defaultForm.get('logicalElement.logicalElementName')?.setValue(logicalParent?.data.name ? logicalParent?.data.name : "Optionally choose logical parent");
      this.defaultForm.get('logicalElement.truncatedLogicalElementName')?.setValue(this.truncate(logicalParent?.data.name ? logicalParent?.data.name : "Optionally choose logical parent"));

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });


    // Return
    this.log.trace(`${LOG_PREFIX} Returning`);
    callback();

  }



  /**
  * Retrieves a Logical Element Record given its unique identifier synchronously
  * @param id The unique identifier of the LogicalElement
  * @param callback The function to call when done
  */
  private retrieveLogicalElementRecord(id: number | null | undefined, callback: (entity: LogicalElement | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveLogicalElementRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the Logical Element Id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the Logical Element Id has been specified`);
    if (id) {

      // The Logical Element Id has been specified
      this.log.trace(`${LOG_PREFIX} The Logical Element Id has been specified`);
      this.log.debug(`${LOG_PREFIX} Logical Element Id = ${JSON.stringify(id)}`);

      // Try retrieving a Logical Element Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve a Logical Element Record with the passed in id`);
      this.logicalElementsDataService
        .getLogicalElements(false, {
          page: null,
          pageSize: null,
          searchTerm: null,
          sortColumn: null,
          sortDirection: null,
          id: id,
          contextId: this.contextId,
          typesIds: null,
          no: null,
          name: null
        })
        .subscribe({
          next: (logicalElements: LogicalElement[]) => {

            // Check if a Logical Element Record with the given id was found
            this.log.trace(`${LOG_PREFIX} Checking if a Logical Element Record with the given id was found`);
            if (logicalElements.length > 0) {

              //A Logical Element Record with the given id was found
              this.log.trace(`${LOG_PREFIX} A Logical Element Record with the given id was found`);

              // Return the Logical Element Record
              this.log.trace(`${LOG_PREFIX} Returning the Logical Element Record`);
              callback(logicalElements[0]);


            } else {

              //A Logical Element Record with the given id was not found
              this.log.trace(`${LOG_PREFIX} A Logical Element Record with the given id was not found`);

              // Return null
              this.log.warn(`${LOG_PREFIX} Return null`);
              callback(null);

            }
          }
        });


    } else {

      // The Logical Element Id has not been specified
      this.log.error(`${LOG_PREFIX} The Logical Element Id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }


  /**
   * Retrieves the context id of the Logical Element
   * @returns the id
   */
  public getContextId(): number | null | undefined {
    return this.contextId;
  }

  /**
   * Retrieves the id of the LogicalElement
   * @returns the id
   */
  public getLogicalElementId(): number | null | undefined {
    return this.defaultForm.get('logicalElement.logicalElementId')?.value
  }

  /**
   * Retrieves the name of the logicalElement
   * @returns the name
   */
  public getLogicalElementName(): string | null | undefined {
    return this.defaultForm.get('logicalElement.logicalElementName')?.value
  }

  /**
   * Retrieves the no. of the Logical Element
   * @returns the no.
   */
  public getNo(): string | null | undefined {
    return this.defaultForm.get('no')?.value
  }


  /**
   * Retrieves the name of the Logical Element
   * @returns the name
   */
  public getName(): string | null | undefined {
    return this.defaultForm.get('name')?.value
  }

  /**
   * Retrieves the id of the LogicalElement
   * @returns the id
   */
  public getUnitId(): number | null | undefined {
    return this.defaultForm.get('unit.unitId')?.value
  }

  /**
   * Retrieves the abbreviation of the unit
   * @returns the abbreviation
   */
  public getUnitAbbreviation(): string | null | undefined {
    return this.defaultForm.get('unit.unitAbbreviation')?.value
  }


  /**
   * Retrieves the id of the target form field
   * @returns the id
   */
  public getFormFieldId(): number | null | undefined {

    this.log.trace(`${LOG_PREFIX} Entering getFormFieldId()`);

    return this.formField?.id;
  }

  /**
   * Retrieves the title of the target form field
   * @returns the title
   */
  public getFormFieldTitle(): String | null | undefined {

    this.log.trace(`${LOG_PREFIX} Entering getFormFieldTitle()`);

    return this.formField?.data.title;
  }


  /**
   * Retrieves the type id of the target form field
   * @returns the type id
   */
  public getFormFieldTypeId(): number | null | undefined {

    this.log.trace(`${LOG_PREFIX} Entering getFormFieldTypeId()`);

    return this.formField?.data.typeId;
  }


  /**
   * Retrieves the option ids of the target form field
   * @returns the option ids
   */
  public getFormFieldOptionIds(): number[] | null | undefined {

    this.log.trace(`${LOG_PREFIX} Entering getFormFieldOptionIds()`);

    return this.formField?.data.options;
  }


  /**
   * Retrieves the ids of the selected subindicators
   * @returns the ids
   */
  public getSelectedSubindicatorsIds(): number[] {

    this.log.trace(`${LOG_PREFIX} Entering getSelectedSubindicatorsIds()`);

    const ids: number[] = [];
    for (let s of this.subindicators) {
      if (s.id) {
        ids.push(s.id);
      }
    }

    this.log.debug(`${LOG_PREFIX} Selected Subindicators Ids = ${ids}`);

    return ids;
  }


  /**
   * Retrieves the ids of the selected form fields
   * @returns the ids
   */
  public getSelectedFormFields(): DataFormElement[] {

    this.log.trace(`${LOG_PREFIX} Entering getSelectedFormFields()`);

    const fields: DataFormElement[] = [];
    if (this.formField) {
      fields.push(this.formField);
    }

    this.log.debug(`${LOG_PREFIX} Selected Form Fields = ${JSON.stringify(fields)}`);

    return fields;
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
 * Asynchronously retrieves the aggregations associated with given unique identifiers
 * @param aggregationsIds The aggregations unique ids
 * @returns The aggregations
 */
  public getAggregations$(): Observable<Aggregation[]> {

    this.log.trace(`${LOG_PREFIX} Entering getAggregations()`);


    // Asynchronously get the corresponding Aggregations
    this.log.trace(`${LOG_PREFIX} Asynchronously getting the corresponding Aggregations`);
    return new Observable(obs => {

      // Get all the aggregations
      this.aggregationsDataService.getAggregations$()
        .subscribe({
          next: (aggregations: Aggregation[]) => {

            // Return the relevant aggregations
            this.log.trace(`${LOG_PREFIX} Returning the relevant aggregations`);
            obs.next(aggregations);
          }
        });
    });



  }



  /**
     * Establishes whether the indicator has subindicators
     * @returns True or False
     */
  public subindicatorsFilled(): boolean {

    this.log.trace(`${LOG_PREFIX} Entering subindicatorsFilled()`);

    if (this.defaultForm.get('subindicatorsFilled')?.value) {
      return true;
    } else {
      return false;
    }

  }


  /**
     * Establishes whether the indicator is form filled
     * @returns True or False
     */
  public formFilled(): boolean {

    this.log.trace(`${LOG_PREFIX} Entering formFilled()`);

    if (this.defaultForm.get('formFilled')?.value) {
      return true;
    } else {
      return false;
    }

  }

    /**
     * Establishes whether the values entered for the indicator are cumulative
     * @returns True or False
     */
    public isCumulative(): boolean {

      this.log.trace(`${LOG_PREFIX} Entering isCumulative()`);
  
      if (this.defaultForm.get('cumulative')?.value) {
        return true;
      } else {
        return false;
      }
  
    }


  /**
   * Opens the LogicalElement Selector
   */
  public openLogicalElementSelector(): void {

    this.log.trace(`${LOG_PREFIX} Entering openLogicalElementSelector()`);

    // Set the desired page to 'logicalElements'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'logicalElements'`);
    this.page = "logicalElements";

    // Emit an 'openedLogicalElementSelector' event
    this.log.trace(`${LOG_PREFIX} Emitting an 'openedLogicalElementSelector' event`);
    this.openedLogicalElementSelector.emit();

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();
  }



  /**
   * Closes the LogicalElement Selector
   */
  public closeLogicalElementSelector(): void {

    this.log.trace(`${LOG_PREFIX} Entering closeLogicalElementSelector()`);

    // Set the desired page to 'default'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'default'`);
    this.page = "default";

    // Emit a 'closedLogicalElementSelector' event
    this.log.trace(`${LOG_PREFIX} Emitting a 'closedLogicalElementSelector' event`);
    this.closedLogicalElementSelector.emit();

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();
  }




  /**
   * Sets the selected logicalElement details and close the logicalElement selector
   * @param element Sets 
   */
  onSelectLogicalHierarchyElement(element: LogicalHierarchy) {

    // Update the forms
    this.log.trace(`${LOG_PREFIX} Updating the forms`);
    this.defaultForm.get('logicalElement.logicalElementId')?.setValue((element && element.data.responsible?.id) ? element.data.responsible.id : null);
    this.defaultForm.get('logicalElement.logicalElementName')?.setValue((element && element.data.responsible?.name) ? element.data.responsible.name : "Optionally choose logical parent");
    this.defaultForm.get('logicalElement.truncatedLogicalElementName')?.setValue((element && element.data.responsible?.name) ? this.truncate(element.data.responsible.name) : "Optionally choose logical parent");

    // Set the desired page to 'default'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'default'`);
    this.page = "default";

    // Emit a 'closedLogicalElementSelector' event
    this.log.trace(`${LOG_PREFIX} Emitting a 'closedLogicalElementSelector' event`);
    this.closedLogicalElementSelector.emit();

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();
  }


  /**
   * Sets the selected unit details and close the unit selector
   * @param unit Sets 
   */
  onSelectUnit(unit: Unit) {

    // Update the forms
    this.log.trace(`${LOG_PREFIX} Updating the forms`);
    this.defaultForm.get('unit.unitId')?.setValue((unit && unit.id) ? unit.id : null);
    this.defaultForm.get('unit.unitAbbreviation')?.setValue((unit && unit.data.abbreviation) ? unit.data.abbreviation : "");

  }



  /**
   * Handles Unit change events
   */
  public onUnitChange(): void {

    this.log.trace(`${LOG_PREFIX} Entering onUnitChange()`);


    // Get the selected unit id
    this.log.trace(`${LOG_PREFIX} Getting the selected Unit Id`);
    const unitId: number | null | undefined = this.defaultForm.get('unit.unitId')?.value
    this.log.debug(`${LOG_PREFIX} Unit Id = ${unitId}`);

    // Get the unit with the specified id
    this.log.trace(`${LOG_PREFIX} Getting the Unit with the specified Id`);
    const unit: Unit | undefined = this.unitsDataService.records.find(c => c.id == unitId);

    // Update the forms
    this.log.trace(`${LOG_PREFIX} Updating the forms`);
    this.defaultForm.get('unit.unitAbbreviation')?.setValue((unit && unit.data.abbreviation) ? unit.data.abbreviation : "");

  }


  /**
  * Flags whether or not the indicator is filled through subindicators
  * @param e Switch event
  */
  public toggleIsFilledThroughSubindicators(e: any): void {

    this.log.trace(`${LOG_PREFIX} Entering toggleIsFilledThroughSubindicators()`);

    // Check if the switch has been checked
    this.log.trace(`${LOG_PREFIX} Checking if the switch has been checked`);
    if (e.target.checked) {

      // The switch has been checked
      this.log.trace(`${LOG_PREFIX} The switch has been checked`);

      // Update the forms
      this.log.trace(`${LOG_PREFIX} Updating the forms`);
      this.defaultForm.get('subindicatorsFilled')?.setValue(true);
      this.defaultForm.get('formFilled')?.setValue(false);
      this.rulesForm.get('aggregationId')?.setValue(null);
      this.rulesForm.get('optionId')?.setValue(null);

      // Clear any previously selected form fields
      this.log.trace(`${LOG_PREFIX} Clearing any previously selected form fields`);
      this.formField = null;

      // Mark the current page as the first page
      this.log.trace(`${LOG_PREFIX} Marking the current page as the first page`);
      this.loadedFirstPage.emit();


    } else {

      // The switch has been unchecked
      this.log.trace(`${LOG_PREFIX} The switch has been unchecked`);

      // Update the forms
      this.log.trace(`${LOG_PREFIX} Updating the forms`);
      this.defaultForm.get('subindicatorsFilled')?.setValue(false);
      this.rulesForm.get('aggregationId')?.setValue(null);
      this.rulesForm.get('optionId')?.setValue(null);

      // Clear any previously selected subindicators
      this.log.trace(`${LOG_PREFIX} Clearing any previously selected subindicators`);
      this.subindicators.length = 0;

      // Mark the current page as a standalone page
      this.log.trace(`${LOG_PREFIX} Marking the current page as a standalone page`);
      this.loadedStandalonePage.emit();

    }

  }


  /**
  * Flags whether or not the indicator is filled through form fields
  * @param e Switch event
  */
  public toggleIsFilledThroughFormFields(e: any): void {

    this.log.trace(`${LOG_PREFIX} Entering toggleIsFilledThroughFormFields()`);

    // Check if the switch has been checked
    this.log.trace(`${LOG_PREFIX} Checking if the switch has been checked`);
    if (e.target.checked) {

      // The switch has been checked
      this.log.trace(`${LOG_PREFIX} The switch has been checked`);

      // Try retrieving the first data form
      this.log.trace(`${LOG_PREFIX} Trying to retrieve the first data form`);
      const dataForm: DataForm | null = this.dataFormsDataService.records.length > 0 ? this.dataFormsDataService.records[0] : null;

      // Check if the data form was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the data form was successfully retrieved`);
      if (dataForm) {

        // The data form was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The data form was successfully retrieved`);

        // Update the forms
        this.log.trace(`${LOG_PREFIX} Updating the forms`);
        this.defaultForm.get('formFilled')?.setValue(true);
        this.defaultForm.get('subindicatorsFilled')?.setValue(false);
        this.rulesForm.get('aggregationId')?.setValue(null);
        this.rulesForm.get('optionId')?.setValue(null);

      } else {

        // The data form was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The data form was not successfully retrieved`);

        // Throw an error
        this.errors.set("formFields", "No form affiliated with the current context was found");

        // Update the forms
        this.log.trace(`${LOG_PREFIX} Updating the forms`);
        this.defaultForm.get('formFilled')?.setValue(true);
        this.defaultForm.get('subindicatorsFilled')?.setValue(false);
        this.rulesForm.get('aggregationId')?.setValue(null);
        this.rulesForm.get('optionId')?.setValue(null);

        // Update the class fields
        this.log.trace(`${LOG_PREFIX} Updating the class fields`);
        this.formField = null;
      }

      // Clear any previously selected subindicators
      this.log.trace(`${LOG_PREFIX} Clearing any previously selected subindicators`);
      this.subindicators.length = 0;

      // Mark the current page as the first page
      this.log.trace(`${LOG_PREFIX} Marking the current page as the first page`);
      this.loadedFirstPage.emit();

    } else {

      // The switch has been unchecked
      this.log.trace(`${LOG_PREFIX} The switch has been unchecked`);

      // Update the forms
      this.log.trace(`${LOG_PREFIX} Updating the forms`);
      this.defaultForm.get('formFilled')?.setValue(false);
      this.rulesForm.get('aggregationId')?.setValue(null);
      this.rulesForm.get('optionId')?.setValue(null);

      // Clear any previously selected form fields
      this.log.trace(`${LOG_PREFIX} Clearing any previously selected form fields`);
      this.formField = null;

      // Mark the current page as a standalone page
      this.log.trace(`${LOG_PREFIX} Marking the current page as a standalone page`);
      this.loadedStandalonePage.emit();
    }

  }

/**
  * Flags whether or not the indicator's values are cumulative
  * @param e Switch event
  */
public toggleIsCumulative(e: any): void {

  this.log.trace(`${LOG_PREFIX} Entering toggleIsCumulative()`);

  // Check if the switch has been checked
  this.log.trace(`${LOG_PREFIX} Checking if the switch has been checked`);
  if (e.target.checked) {

    // The switch has been checked
    this.log.trace(`${LOG_PREFIX} The switch has been checked`);

    // Update the forms
    this.log.trace(`${LOG_PREFIX} Updating the forms`);
    this.defaultForm.get('cumulative')?.setValue(true);


  } else {

    // The switch has been unchecked
    this.log.trace(`${LOG_PREFIX} The switch has been unchecked`);

    // Update the forms
    this.log.trace(`${LOG_PREFIX} Updating the forms`);
    this.defaultForm.get('cumulative')?.setValue(false);


  }

}  

  /** 
  * Handles subindicators Selections Events
  * @param subindicator The selected subindicator
  */
  onSelectSubindicator(subindicator: Indicator) {

    this.log.trace(`${LOG_PREFIX} Entering onSelectSubindicator()`);
    this.log.trace(`${LOG_PREFIX} Selected subindicator = ${JSON.stringify(subindicator)}`);

    // Insert the newly selected subindicator into the form fields array - if its nonexistent
    if (subindicator && this.subindicators.findIndex(o => o.id == subindicator.id) == -1) {

      // Add the form field to the form fields array
      this.subindicators.push(subindicator);

      // Validate
      this.isSubindicatorsSpecificationValid();
    }

  }


  /** 
  * Handles subindicators Deselection Events
  * @param indicator The deselected subindicator
  */
  onDeselectSubindicator(indicator: Indicator) {

    this.log.trace(`${LOG_PREFIX} Entering onDeselectSubindicator()`);
    this.log.trace(`${LOG_PREFIX} Deselected subindicator: ${JSON.stringify(indicator)}`);

    // Removes the newly Unchecked subindicator from the Selected subindicators array - if in existence
    let index = indicator ? this.subindicators.findIndex(o => o.id == indicator.id) : -1;
    if (index != -1) {

      // Remove subindicator from subindicators array
      this.subindicators.splice(index, 1);

      // Validate
      this.isSubindicatorsSpecificationValid();
    }
  }


  /** 
  * Handles Form Fields Selections Events
  * @param formField The selected Form Field
  */
  onSelectFormField(formField: DataFormElement) {

    this.log.trace(`${LOG_PREFIX} Entering onSelectFormField()`);
    this.log.trace(`${LOG_PREFIX} Selected Form Field = ${JSON.stringify(formField)}`);

    // Set the passed in form field as the selected form field
    this.log.trace(`${LOG_PREFIX} Setting the passed in form field as the selected form field`);
    this.formField = formField;

    // Update the forms
    this.log.trace(`${LOG_PREFIX} Updating the forms`);
    this.rulesForm.get('aggregationId')?.setValue(null);
    this.rulesForm.get('optionId')?.setValue(null);

    // Validate
    this.isFormFieldSpecificationValid();

  }

  /**
   * Loads the next page
   */
  public showNextPage() {

    this.log.trace(`${LOG_PREFIX} Entering showNextPage()`);

    switch (this.page) {

      case "default":

        // Move to the next page iff the current page is valid
        if (this.defaultForm.valid) {

          // Check if the indicator is autofilled from subindicator values
          this.log.trace(`${LOG_PREFIX} Checking if the indicator is autofilled from subindicator values`);
          if (this.subindicatorsFilled()) {


            // The indicator is autofilled from subindicator values
            this.log.trace(`${LOG_PREFIX} The indicator is autofilled from subindicator values`);

            // Load the subindicators selection window
            this.log.trace(`${LOG_PREFIX} Loading the subindicators selection window`);
            this.page = "subindicators";

            // Mark the current page as a nested page
            this.log.trace(`${LOG_PREFIX} Marking the current page as a nested page`);
            this.loadedNestedPage.emit(true);

          } else {


            // The indicator is not autofilled from subindicator values
            this.log.trace(`${LOG_PREFIX} The indicator is not autofilled from subindicator values`);

            // Check if the indicator is autofilled from form field values
            this.log.trace(`${LOG_PREFIX} Checking if the indicator is autofilled from form field values`);
            if (this.formFilled()) {

              // The indicator is autofilled from form field values
              this.log.trace(`${LOG_PREFIX} The indicator is autofilled from form field values`);

              // Load the form field selection window
              this.log.trace(`${LOG_PREFIX} Loading the form field selection window`);
              this.page = "formFields";

              // Mark the current page as a nested page
              this.log.trace(`${LOG_PREFIX} Marking the current page as a nested page`);
              this.loadedNestedPage.emit(true);

            } else {

              // The indicator is not autofilled from form field values
              this.log.trace(`${LOG_PREFIX} The indicator is not autofilled from form field values`);

              // Mark the wizard as having reached a premature end
              this.log.error(`${LOG_PREFIX} The wizard has reached a premature end`);



            }

          }


        } else {

          // The default page is invalid
          this.log.trace(`${LOG_PREFIX} The default page is invalid`);

          // Run the form fields validation request to validate all fields and display the error message(s)
          this.log.trace(`${LOG_PREFIX} Running the form fields validation request to validate all fields and display the error message(s)`);
          this.validateAllFormFields(this.defaultForm);
        }


        break;

      case "subindicators":

        // Move to the next page iff the current page is valid
        if (this.isSubindicatorsSpecificationValid()) {
          // Load the auto filling rules specification window
          this.log.trace(`${LOG_PREFIX} Loading the auto filling rules specification window`);
          this.page = "autoFillingRule";

          // Mark the current page as the last page
          this.log.trace(`${LOG_PREFIX} Marking the current page as the last page`);
          this.loadedLastPage.emit(true);
        }

        break;

      case "formFields":

        // Move to the next page iff the current page is valid
        if (this.isFormFieldSpecificationValid()) {
          // Load the auto filling rules specification window
          this.log.trace(`${LOG_PREFIX} Loading the auto filling rules specification window`);
          this.page = "autoFillingRule";

          // Mark the current page as the last page
          this.log.trace(`${LOG_PREFIX} Marking the current page as the last page`);
          this.loadedLastPage.emit(true);
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

      case "autoFillingRule":

        // Check if the indicator is autofilled from subindicator values
        this.log.trace(`${LOG_PREFIX} Checking if the indicator is autofilled from subindicator values`);
        if (this.subindicatorsFilled()) {


          // The indicator is autofilled from subindicator values
          this.log.trace(`${LOG_PREFIX} The indicator is autofilled from subindicator values`);

          // Load the subindicators selection window
          this.log.trace(`${LOG_PREFIX} Loading the subindicators selection window`);
          this.page = "subindicators";

          // Mark the current page as a nested page
          this.log.trace(`${LOG_PREFIX} Marking the current page as a nested page`);
          this.loadedNestedPage.emit(true);

        } else {

          // The indicator is not autofilled from subindicator values
          this.log.trace(`${LOG_PREFIX} The indicator is not autofilled from subindicator values`);

          // Check if the indicator is autofilled from form field values
          this.log.trace(`${LOG_PREFIX} Checking if the indicator is autofilled from form field values`);
          if (this.formFilled()) {

            // The indicator is autofilled from form field values
            this.log.trace(`${LOG_PREFIX} The indicator is autofilled from form field values`);

            // Load the form field selection window
            this.log.trace(`${LOG_PREFIX} Loading the form field selection window`);
            this.page = "formFields";

            // Mark the current page as a nested page
            this.log.trace(`${LOG_PREFIX} Marking the current page as a nested page`);
            this.loadedNestedPage.emit(true);

          } else {

            // The indicator is not autofilled from form field values
            this.log.trace(`${LOG_PREFIX} The indicator is not autofilled from form field values`);

            // Load the default page
            this.log.trace(`${LOG_PREFIX} Loading the default page`);
            this.page = "default";

            // Mark the current page as the first page
            this.log.trace(`${LOG_PREFIX} Marking the current page as the first page`);
            this.loadedFirstPage.emit(true);
          }

        }

        break;

      case "subindicators":

        this.log.trace(`${LOG_PREFIX} Loading the default window`);
        this.page = "default";

        // Mark the current page as the first page
        this.log.trace(`${LOG_PREFIX} Marking the current page as the first page`);
        this.loadedFirstPage.emit(true);

        break;


      case "formFields":

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
   * Internal validator that checks whether the logical parent is required
   * @returns 
   */
  private isLogicalParentRequired(): ValidatorFn {

    this.log.trace(`${LOG_PREFIX} Entering isLogicalParentRequired()`);

    return (control: AbstractControl): ValidationErrors | null => {

      // Check if the indicator is part of a logical hierarchy
      this.log.trace(`${LOG_PREFIX} Checking if the indicator is part of a logical hierarchy`);
      if (this.logical) {

        // The indicator is part of a logical hierarchy
        this.log.trace(`${LOG_PREFIX} The indicator is part of a logical hierarchy`);

        // Check if a logical parent has been specified
        this.log.trace(`${LOG_PREFIX} Checking if a logical parent has been specified`);
        if (control.value) {

          // A logical parent has been specified
          this.log.trace(`${LOG_PREFIX} A logical parent has been specified`);

          // Considering the requirement constraint as upheld
          this.log.trace(`${LOG_PREFIX} Considering the requirement constraint as upheld`);

          // Return null
          return null;

        } else {

          // A logical parent has not been specified
          this.log.trace(`${LOG_PREFIX} A logical parent has not been specified`);

          // Considering the requirement constraint as violated
          this.log.trace(`${LOG_PREFIX} Considering the requirement constraint as violated`);

          return { 'required': true };

        }

      } else {

        // The indicator is not part of a logical hierarchy
        this.log.trace(`${LOG_PREFIX} The indicator is not part of a logical hierarchy`);

        // Return null
        return null;

      }

    }

  }





  /**
   * Checks whether the number is required
   * @returns 
   */
  private isNoRequired(): ValidatorFn {

    this.log.trace(`${LOG_PREFIX} Entering isNoRequired()`);

    return (control: AbstractControl): ValidationErrors | null => {

      // Check if the indicator requires explicit numbering
      this.log.trace(`${LOG_PREFIX} Checking if the indicator requires explicit numbering`);
      if (this.numbered) {

        // The indicator requires explicit numbering
        this.log.trace(`${LOG_PREFIX} The indicator requires explicit numbering`);

        // Check if a no has been specified
        this.log.trace(`${LOG_PREFIX} Checking if a no has been specified`);
        if (control.value) {

          // A no has been specified
          this.log.trace(`${LOG_PREFIX} A no has been specified`);

          // Considering the requirement constraint as upheld
          this.log.trace(`${LOG_PREFIX} Considering the requirement constraint as upheld`);

          // Return null
          return null;

        } else {

          // A no has not been specified
          this.log.trace(`${LOG_PREFIX} A no has not been specified`);

          // Considering the requirement constraint as violated
          this.log.trace(`${LOG_PREFIX} Considering the requirement constraint as violated`);

          return { 'required': true };

        }

      } else {

        // The indicator does not require explicit numbering
        this.log.trace(`${LOG_PREFIX} The indicator does not require explicit numbering`);

        // Ignore validation
        this.log.trace(`${LOG_PREFIX} Ignoring validation`);

        // Return null
        return null;

      }

    }

  }


  /**
   * Checks whether the number violates the miminum length constraint
   * @returns 
   */
  private doesNoViolateMinimumLengthConstraint(): ValidatorFn {

    this.log.trace(`${LOG_PREFIX} Entering doesNoViolateMinimumLengthConstraint()`);

    return (control: AbstractControl): ValidationErrors | null => {

      // Check if the indicator requires explicit numbering
      this.log.trace(`${LOG_PREFIX} Checking if the indicator requires explicit numbering`);
      if (this.numbered) {

        // The indicator requires explicit numbering
        this.log.trace(`${LOG_PREFIX} The indicator requires explicit numbering`);

        // Check if a no has been specified
        this.log.trace(`${LOG_PREFIX} Checking if a no has been specified`);
        if (control.value) {

          // A no has been specified
          this.log.trace(`${LOG_PREFIX} A no has been specified`);

          // Check if the no is outside the minimum length threshold
          this.log.trace(`${LOG_PREFIX} Checking if the no is outside the minimum length threshold`);

          if (control.value.trim().length < 1) {

            // The no is outside the minimum length threshold
            this.log.trace(`${LOG_PREFIX} The no is outside the minimum length threshold`);

            // Considering the minimum length constraint as violated
            this.log.trace(`${LOG_PREFIX} Considering the mimimum length constraint as violated`);

            return { 'minlength': true };

          } else {

            // The no is within the minimum length threshold
            this.log.trace(`${LOG_PREFIX} The no is within the minimum length threshold`);

            // Considering the minimum length constraint as upheld
            this.log.trace(`${LOG_PREFIX} Considering the mimimum length constraint as upheld`);

            // Return null
            return null;

          }

        } else {

          // A no has not been specified
          this.log.trace(`${LOG_PREFIX} A no has not been specified`);

          // Ignore validation
          this.log.trace(`${LOG_PREFIX} Ignoring validation`);

          // Return null
          return null;

        }

      } else {

        // The indicator does not require explicit numbering
        this.log.trace(`${LOG_PREFIX} The indicator does not require explicit numbering`);

        // Ignore validation
        this.log.trace(`${LOG_PREFIX} Ignoring validation`);

        // Return null
        return null;

      }

    }

  }


  /**
   * Checks whether the number violates the maximum length constraint
   * @returns 
   */
  private doesNoViolateMaximumLengthConstraint(): ValidatorFn {

    this.log.trace(`${LOG_PREFIX} Entering doesNoViolateMaximumLengthConstraint()`);

    return (control: AbstractControl): ValidationErrors | null => {

      // Check if the indicator requires explicit numbering
      this.log.trace(`${LOG_PREFIX} Checking if the indicator requires explicit numbering`);
      if (this.numbered) {

        // The indicator requires explicit numbering
        this.log.trace(`${LOG_PREFIX} The indicator requires explicit numbering`);

        // Check if a no has been specified
        this.log.trace(`${LOG_PREFIX} Checking if a no has been specified`);
        if (control.value) {

          // A no has been specified
          this.log.trace(`${LOG_PREFIX} A no has been specified`);

          // Check if the no is outside the maximum length threshold
          this.log.trace(`${LOG_PREFIX} Checking if the no is outside the maximum length threshold`);

          if (control.value.trim().length > 50) {

            // The no is outside the maximum length threshold
            this.log.trace(`${LOG_PREFIX} The no is outside the maximum length threshold`);

            // Considering the maximum length constraint as violated
            this.log.trace(`${LOG_PREFIX} Considering the maximum length constraint as violated`);

            return { 'maxlength': true };

          } else {

            // The no is within the maximum length threshold
            this.log.trace(`${LOG_PREFIX} The no is within the maximum length threshold`);

            // Considering the maximum length constraint as upheld
            this.log.trace(`${LOG_PREFIX} Considering the maximum length constraint as upheld`);

            // Return null
            return null;

          }

        } else {

          // A no has not been specified
          this.log.trace(`${LOG_PREFIX} A no has not been specified`);

          // Ignore validation
          this.log.trace(`${LOG_PREFIX} Ignoring validation`);

          // Return null
          return null;

        }

      } else {

        // The indicator does not require explicit numbering
        this.log.trace(`${LOG_PREFIX} The indicator does not require explicit numbering`);

        // Ignore validation
        this.log.trace(`${LOG_PREFIX} Ignoring validation`);

        // Return null
        return null;

      }

    }

  }


  /**
   * Internal validator that checks whether a proposed no already exists
   * @returns 
   */
  private doesNoViolateUniquenessConstraint(): AsyncValidatorFn {

    this.log.trace(`${LOG_PREFIX} Entering doesNoViolateUniquenessConstraint()`);

    return (control: AbstractControl): Observable<ValidationErrors | null> => {

      // Check if the indicator requires explicit numbering
      this.log.trace(`${LOG_PREFIX} Checking if the indicator requires explicit numbering`);
      if (this.numbered) {

        // The indicator requires explicit numbering
        this.log.trace(`${LOG_PREFIX} The indicator requires explicit numbering`);

        // Check if a no has been specified
        this.log.trace(`${LOG_PREFIX} Checking if a no has been specified`);
        if (control.value) {

          // A no value has been provided
          this.log.trace(`${LOG_PREFIX} A no value has been provided`);

          // Attempt retrieving Indicators with the same no
          this.log.trace(`${LOG_PREFIX} Attempting to retrieve Indicators with the same no`);
          return this.indicatorsDataService
            .getIndicators(false, {
              page: null,
              pageSize: null,
              searchTerm: null,
              sortColumn: null,
              sortDirection: null,
              ids: null,
              contextId: this.contextId,
              no: control.value.trim(),
              name: null,
              logicalParentId: null
            })
            .pipe(
              map((indicators: Indicator[]) => {

                // Check if an Indicator record with the same no was found
                this.log.trace(`${LOG_PREFIX} Checking if an Indicator record with the same no was found`);
                if (indicators.length > 0) {

                  // An Indicator record with the same no was found
                  this.log.trace(`${LOG_PREFIX} An Indicator record with the same no was found`);

                  // Considering the uniqueness constraint as violated
                  this.log.trace(`${LOG_PREFIX} Considering the uniqueness constraint as violated`);
                  return { 'exists': true };

                } else {

                  // An Indicator record with the same no was not found
                  this.log.trace(`${LOG_PREFIX} An Indicator record with the same no was not found`);

                  // Considering the uniqueness constraint as upheld
                  this.log.trace(`${LOG_PREFIX} Considering the uniqueness constraint as upheld`);

                  return null;

                }
              }

              )
            )

        } else {

          // A no has not been specified
          this.log.trace(`${LOG_PREFIX} A no has not been specified`);

          // Ignore validation
          this.log.trace(`${LOG_PREFIX} Ignoring validation`);

          return of(null);
        }
      } else {

        // The indicator does not require explicit numbering
        this.log.trace(`${LOG_PREFIX} The indicator does not require explicit numbering`);

        // Ignore validation
        this.log.trace(`${LOG_PREFIX} Ignoring validation`);

        return of(null);
      }

    };

  }


  /**
   * Checks whether the name is required
   * @returns 
   */
  private isNameRequired(): ValidatorFn {

    this.log.trace(`${LOG_PREFIX} Entering isNameRequired()`);

    return (control: AbstractControl): ValidationErrors | null => {

      // Check if a name has been specified
      this.log.trace(`${LOG_PREFIX} Checking if a name has been specified`);
      if (control.value) {

        // A name has been specified
        this.log.trace(`${LOG_PREFIX} A name has been specified`);

        // Considering the requirement constraint as upheld
        this.log.trace(`${LOG_PREFIX} Considering the requirement constraint as upheld`);

        // Return null
        return null;

      } else {

        // A name has not been specified
        this.log.trace(`${LOG_PREFIX} A name has not been specified`);

        // Considering the requirement constraint as violated
        this.log.trace(`${LOG_PREFIX} Considering the requirement constraint as violated`);

        return { 'required': true };

      }

    }

  }


  /**
   * Checks whether the name violates the miminum length constraint
   * @returns 
   */
  private doesNameViolateMinimumLengthConstraint(): ValidatorFn {

    this.log.trace(`${LOG_PREFIX} Entering doesNameViolateMinimumLengthConstraint()`);

    return (control: AbstractControl): ValidationErrors | null => {

      // Check if a name has been specified
      this.log.trace(`${LOG_PREFIX} Checking if a name has been specified`);
      if (control.value) {

        // A name has been specified
        this.log.trace(`${LOG_PREFIX} A name has been specified`);

        // Check if the name is outside the minimum length threshold
        this.log.trace(`${LOG_PREFIX} Checking if the name is outside the minimum length threshold`);

        if (control.value.trim().length < 2) {

          // The name is outside the minimum length threshold
          this.log.trace(`${LOG_PREFIX} The name is outside the minimum length threshold`);

          // Considering the minimum length constraint as violated
          this.log.trace(`${LOG_PREFIX} Considering the mimimum length constraint as violated`);

          return { 'minlength': true };

        } else {

          // The name is within the minimum length threshold
          this.log.trace(`${LOG_PREFIX} The name is within the minimum length threshold`);

          // Considering the minimum length constraint as upheld
          this.log.trace(`${LOG_PREFIX} Considering the mimimum length constraint as upheld`);

          // Return null
          return null;

        }

      } else {

        // A name has not been specified
        this.log.trace(`${LOG_PREFIX} A name has not been specified`);

        // Ignamere validation
        this.log.trace(`${LOG_PREFIX} Ignoring validation`);

        // Return null
        return null;

      }

    }

  }


  /**
   * Checks whether the name violates the maximum length constraint
   * @returns 
   */
  private doesNameViolateMaximumLengthConstraint(): ValidatorFn {

    this.log.trace(`${LOG_PREFIX} Entering doesNameViolateMaximumLengthConstraint()`);

    return (control: AbstractControl): ValidationErrors | null => {

      // Check if a name has been specified
      this.log.trace(`${LOG_PREFIX} Checking if a name has been specified`);
      if (control.value) {

        // A name has been specified
        this.log.trace(`${LOG_PREFIX} A name has been specified`);

        // Check if the name is outside the maximum length threshold
        this.log.trace(`${LOG_PREFIX} Checking if the name is outside the maximum length threshold`);

        if (control.value.trim().length > 250) {

          // The name is outside the maximum length threshold
          this.log.trace(`${LOG_PREFIX} The name is outside the maximum length threshold`);

          // Considering the maximum length constraint as violated
          this.log.trace(`${LOG_PREFIX} Considering the maximum length constraint as violated`);

          return { 'maxlength': true };

        } else {

          // The name is within the maximum length threshold
          this.log.trace(`${LOG_PREFIX} The name is within the maximum length threshold`);

          // Considering the maximum length constraint as upheld
          this.log.trace(`${LOG_PREFIX} Considering the maximum length constraint as upheld`);

          // Return null
          return null;

        }

      } else {

        // A name has not been specified
        this.log.trace(`${LOG_PREFIX} A name has not been specified`);

        // Ignamere validation
        this.log.trace(`${LOG_PREFIX} Ignoring validation`);

        // Return null
        return null;

      }

    }

  }


  /**
   * Internal validator that checks whether a proposed name already exists
   * @returns 
   */
  private doesNameViolateUniquenessConstraint(): AsyncValidatorFn {

    this.log.trace(`${LOG_PREFIX} Entering doesNameViolateUniquenessConstraint()`);

    return (control: AbstractControl): Observable<ValidationErrors | null> => {

      // Check if a name has been specified
      this.log.trace(`${LOG_PREFIX} Checking if a name has been specified`);
      if (control.value) {

        // A name value has been provided
        this.log.trace(`${LOG_PREFIX} A name value has been provided`);

        // Attempt retrieving Indicators with the same name
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve Indicators with the same name`);
        return this.indicatorsDataService
          .getIndicators(false, {
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            ids: null,
            contextId: this.contextId,
            no: null,
            name: control.value.trim(),
            logicalParentId: null
          })
          .pipe(
            map((indicators: Indicator[]) => {

              // Check if an Indicator record with the same name was found
              this.log.trace(`${LOG_PREFIX} Checking if an Indicator record with the same name was found`);
              if (indicators.length > 0) {

                // An Indicator record with the same name was found
                this.log.trace(`${LOG_PREFIX} An Indicator record with the same name was found`);

                // Considering the uniqueness constraint as violated
                this.log.trace(`${LOG_PREFIX} Considering the uniqueness constraint as violated`);
                return { 'exists': true };

              } else {

                // An Indicator record with the same name was not found
                this.log.trace(`${LOG_PREFIX} An Indicator record with the same name was not found`);

                // Considering the uniqueness constraint as upheld
                this.log.trace(`${LOG_PREFIX} Considering the uniqueness constraint as upheld`);

                return null;

              }
            }

            )
          )

      } else {

        // A name has not been specified
        this.log.trace(`${LOG_PREFIX} A name has not been specified`);

        // Ignamere validation
        this.log.trace(`${LOG_PREFIX} Ignoring validation`);

        return of(null);
      }


    };

  }


  /**
   * Checks whether the unit is required
   * @returns 
   */
  private isUnitRequired(): ValidatorFn {

    this.log.trace(`${LOG_PREFIX} Entering isUnitRequired()`);

    return (control: AbstractControl): ValidationErrors | null => {

      // Check if a unit has been specified
      this.log.trace(`${LOG_PREFIX} Checking if a unit has been specified`);
      if (control.value) {

        // A unit has been specified
        this.log.trace(`${LOG_PREFIX} A unit has been specified`);

        // Considering the requirement constraint as upheld
        this.log.trace(`${LOG_PREFIX} Considering the requirement constraint as upheld`);

        // Return null
        return null;

      } else {

        // A unit has not been specified
        this.log.trace(`${LOG_PREFIX} A unit has not been specified`);

        // Considering the requirement constraint as violated
        this.log.trace(`${LOG_PREFIX} Considering the requirement constraint as violated`);

        return { 'required': true };

      }

    }

  }


  /**
   * Checks whether the aggregation specification is required
   * @returns 
   */
  private isAggregationSpecificationRequired(): ValidatorFn {

    this.log.trace(`${LOG_PREFIX} Entering isAggregationSpecificationRequired()`);

    return (control: AbstractControl): ValidationErrors | null => {

      // Check if the indicator value is autofilled from subindicators or a form field 
      this.log.trace(`${LOG_PREFIX} Checking if the indicator value is autofilled from subindicators or a form field `);
      if (this.defaultForm.get('subindicatorsFilled')?.value || this.defaultForm.get('formFilled')?.value) {

        // The indicator value is autofilled from subindicators or a form field
        this.log.trace(`${LOG_PREFIX} The indicator value is autofilled from subindicators or a form field`);

        // Check if an aggregation specification has been made
        this.log.trace(`${LOG_PREFIX} Checking if an aggregation specification has been made`);
        if (control.value) {

          // An aggregation specification has been made
          this.log.trace(`${LOG_PREFIX} An aggregation specification has been made`);

          // Considering the requirement constraint as upheld
          this.log.trace(`${LOG_PREFIX} Considering the requirement constraint as upheld`);

          // Return null
          return null;

        } else {

          // An aggregation specification has not been made
          this.log.trace(`${LOG_PREFIX} An aggregation specification has not been made`);

          // Considering the requirement constraint as violated
          this.log.trace(`${LOG_PREFIX} Considering the requirement constraint as violated`);

          return { 'required': true };

        }

      } else {

        // The indicator value is not autofilled from subindicators or a form field
        this.log.trace(`${LOG_PREFIX} The indicator value is not autofilled from subindicators or a form field`);

        // Ignore validation
        this.log.trace(`${LOG_PREFIX} Ignoring validation`);

        return null;
      }

    }

  }



  /**
   * Checks whether the option specification is required
   * @returns 
   */
  private isOptionSpecificationRequired(): ValidatorFn {

    this.log.trace(`${LOG_PREFIX} Entering isOptionSpecificationRequired()`);

    return (control: AbstractControl): ValidationErrors | null => {

      // Check if the indicator value is autofilled from subindicators or a form field 
      this.log.trace(`${LOG_PREFIX} Checking if the indicator value is autofilled from subindicators or a form field `);
      if (this.defaultForm.get('subindicatorsFilled')?.value || this.defaultForm.get('formFilled')?.value) {

        // The indicator value is autofilled from subindicators or a form field
        this.log.trace(`${LOG_PREFIX} The indicator value is autofilled from subindicators or a form field`);

        // Check if an option specification has been made
        this.log.trace(`${LOG_PREFIX} Checking if an option specification has been made`);
        if (control.value) {

          // An option specification has been made
          this.log.trace(`${LOG_PREFIX} An option specification has been made`);

          // Considering the requirement constraint as upheld
          this.log.trace(`${LOG_PREFIX} Considering the requirement constraint as upheld`);

          // Return null
          return null;

        } else {

          // An option specification has not been made
          this.log.trace(`${LOG_PREFIX} An option specification has not been made`);

          // Check if the indicator value is autofilled from subindicators or a numerical form field 
          this.log.trace(`${LOG_PREFIX} Checking if the indicator value is autofilled from subindicators or a numerical form field `);
          if (this.defaultForm.get('subindicatorsFilled')?.value || this.formField?.data.typeId == 3 || this.formField?.data.typeId == 4) {

            // The indicator value is autofilled from subindicators or a numerical form field 
            this.log.trace(`${LOG_PREFIX} The indicator value is autofilled from subindicators or a numerical form field `);

            // Considering the requirement constraint as upheld
            this.log.trace(`${LOG_PREFIX} Considering the requirement constraint as upheld`);

            // Return null
            return null;

          } else {

            // The indicator value is not autofilled from subindicators or a numerical form field 
            this.log.trace(`${LOG_PREFIX} The indicator value is not autofilled from subindicators or a numerical form field `);

            // Considering the requirement constraint as violated
            this.log.trace(`${LOG_PREFIX} Considering the requirement constraint as violated`);

            return { 'required': true };
          }

        }

      } else {

        // The indicator value is not autofilled from subindicators or a form field
        this.log.trace(`${LOG_PREFIX} The indicator value is not autofilled from subindicators or a form field`);

        // Ignore validation
        this.log.trace(`${LOG_PREFIX} Ignoring validation`);

        return null;
      }

    }

  }



  /**
   * Checks whether the subindicator details have been fully and correctly specified
   * @returns True or False
   */
  private isSubindicatorsSpecificationValid(): boolean {

    this.log.trace(`${LOG_PREFIX} Entering isSubindicatorsSelectionValid()`);

    let valid: boolean = true;

    // Check if the subindicators are needed
    this.log.trace(`${LOG_PREFIX} Checking if the subindicators are needed`);
    if (this.defaultForm && this.defaultForm.get('subindicatorsFilled')?.value) {

      // The subindicators are needed
      this.log.trace(`${LOG_PREFIX} The subindicators are needed`);

      // Check if the subindicators have been provided
      this.log.trace(`${LOG_PREFIX} Checking if the subindicators have been provided`);
      if (this.subindicators.length > 0) {

        // The subindicators have been provided
        this.log.trace(`${LOG_PREFIX} The subindicators have been provided`);

        // Get the subindicators units ids
        this.log.trace(`${LOG_PREFIX} Getting the subindicators units ids`);
        const unitIds: Set<number> = new Set();
        for (let subindicator of this.subindicators) {
          if (subindicator.data.unitId) {
            unitIds.add(subindicator.data.unitId);
          }
        }

        // Check if all the subindicators are of the same unit
        this.log.trace(`${LOG_PREFIX} Checking if all the subindicators are of the same unit`);
        if (unitIds.size == 1) {

          // The subindicators are of the same unit
          this.log.trace(`${LOG_PREFIX} The subindicators are of the same unit`);

          // Check if the subindicators unit is the same as the indicator's unit
          this.log.trace(`${LOG_PREFIX} Checking if the subindicators unit is the same as the indicator's unit`);
          if (this.getUnitId() == [...unitIds][0]) {

            // The subindicators unit is the same as the indicator's unit
            this.log.trace(`${LOG_PREFIX} The subindicators unit is the same as the indicator's unit`);

          } else {

            // The subindicators unit is not the same as the indicator's unit
            this.log.trace(`${LOG_PREFIX} The subindicators unit is not the same as the indicator's unit`);

            // Mark the subindicators specification as erratic
            this.log.trace(`${LOG_PREFIX} Marking the subindicators specification as erratic`);
            this.errors.set("subindicators", "Subindicators units should match the indicator's unit");
            valid = false;

          }

        } else {

          // The subindicators are not of the same unit
          this.log.trace(`${LOG_PREFIX} The subindicators are not of the same unit`);

          // Mark the subindicators specification as erratic
          this.log.trace(`${LOG_PREFIX} Marking the subindicators specification as erratic`);
          this.errors.set("subindicators", "Subindicators units should all match");
          valid = false;
        }

      } else {

        // The subindicators have not been provided
        this.log.trace(`${LOG_PREFIX} The subindicators have not been provided`);

        // Mark the subindicators specification as erratic
        this.log.trace(`${LOG_PREFIX} Marking the subindicators specification as erratic`);
        this.errors.set("subindicators", "Please select one or more subindicators");
        valid = false;
      }

    } else {

      // The subindicators are not needed
      this.log.trace(`${LOG_PREFIX} The subindicators are not needed`);

    }

    if (valid) {

      // Mark the subindicators specification as valid
      this.log.trace(`${LOG_PREFIX} Marking the subindicators specification as valid`);

      // Clear previous subindicators errors if any
      this.log.trace(`${LOG_PREFIX} Clearing previous subindicators errors if any`);
      this.errors.delete("subindicators");
    }

    this.cd.detectChanges();

    return valid;
  }



  /**
   * Checks whether the Form Field detail have been fully and correctly specified
   * @returns True or False
   */
  private isFormFieldSpecificationValid(): boolean {

    this.log.trace(`${LOG_PREFIX} Entering isFormFieldSelectionValid()`);

    let valid: boolean = true;

    // Check if a target form field is needed
    this.log.trace(`${LOG_PREFIX} Checking if a target form field is needed`);

    if (this.defaultForm && this.defaultForm.get('formFilled')?.value) {

      // A target form field is needed
      this.log.trace(`${LOG_PREFIX} A target form field is needed`);

      // Check if the target form field has been provided
      this.log.trace(`${LOG_PREFIX} Checking if the target form field has been provided`);

      if (this.formField) {

        // The target form field has been provided
        this.log.trace(`${LOG_PREFIX} The target form field has been provided`);

        // Check if the form field is of a supported type
        this.log.trace(`${LOG_PREFIX} Checking if the form field is of a supported type`);
        switch (this.formField.data.typeId) {

          case 3: // Integer
          case 4: // Decimal
          case 8: // Single Selection
          case 9: // Multi Selection
          case 10: // Dropdown

            // The form field is of a supported type
            this.log.trace(`${LOG_PREFIX} The form field is of a supported type`);
            break;

          default:

            // The form field is not of a supported type
            this.log.trace(`${LOG_PREFIX} The form field is not of a supported type`);

            // Mark the form fields specification as erratic
            this.log.trace(`${LOG_PREFIX} Marking the form fields specification as erratic`);

            this.errors.set("formFields", "The selected Form Field is not aggregatable");
            valid = false;
        }


      } else {

        // The target form field has not been provided
        this.log.trace(`${LOG_PREFIX} The target form field has not been provided`);

        // Mark the form fields specification as erratic
        this.log.trace(`${LOG_PREFIX} Marking the form fields specification as erratic`);

        this.errors.set("formFields", "Please select the target Form Field");
        valid = false;
      }

    } else {

      // A target form field is not needed
      this.log.trace(`${LOG_PREFIX} A target form field is not needed`);

    }


    if (valid) {

      // Mark the form fields specification as valid
      this.log.trace(`${LOG_PREFIX} Marking the form fields specification as valid`);

      // Clear previous form fields errors if any
      this.log.trace(`${LOG_PREFIX} Clearing previous form fields errors if any`);
      this.errors.delete("formFields");
    }

    this.cd.detectChanges();

    return valid;
  }




  /**
   * Validates and saves a new Indicator Record.
   * Emits a succeeded or failed event depending on whether the save request succeeded or failed respectively
   * Error 400 = Indicates that a user error was encountered
   * Error 500 = Indicates that a system error was encountered
   */
  public save(): void {

    this.log.trace(`${LOG_PREFIX} Entering save()`);

    // Check if the default form is valid
    this.log.trace(`${LOG_PREFIX} Checking if the default form is valid`);
    if (this.defaultForm.valid) {

      // The default form is valid
      this.log.trace(`${LOG_PREFIX} The default form is valid`);

      // Check if the subindicators specification is valid
      this.log.trace(`${LOG_PREFIX} Checking if the subindicators specification is valid`);
      if (this.isSubindicatorsSpecificationValid()) {

        // The subindicators specification is valid
        this.log.trace(`${LOG_PREFIX} The subindicators specification is valid`);

        // Check if the form field specification is valid
        this.log.trace(`${LOG_PREFIX} Checking if the form field specification is valid`);
        if (this.isFormFieldSpecificationValid()) {

          // The form field specification is valid
          this.log.trace(`${LOG_PREFIX} The form field specification is valid`);

          // Check if the rule form is valid
          this.log.trace(`${LOG_PREFIX} Checking if the rule form is valid`);
          if (this.rulesForm.valid) {

            // The rule form is valid
            this.log.trace(`${LOG_PREFIX} The rule form is valid`);


            // Read in the provided logical parent
            this.log.trace(`${LOG_PREFIX} Reading in the provided logical parent`);
            const logicalParent: { id: number | null | undefined; name: string | null | undefined; } | null = this.logical ? { id: this.getLogicalElementId(), name: this.getLogicalElementId() ? this.getLogicalElementName() : null } : null;
            this.log.debug(`${LOG_PREFIX} Logical Parent = ${JSON.stringify(logicalParent)}`);

            // Read in the provided no
            this.log.trace(`${LOG_PREFIX} Reading in the provided no`);
            const no: string | null | undefined = this.numbered ? this.defaultForm.get('no')?.value?.trim() : null;
            this.log.debug(`${LOG_PREFIX} Indicator No = ${no}`);

            // Read in the provided name
            this.log.trace(`${LOG_PREFIX} Reading in the provided name`);
            const name: string | null | undefined = this.defaultForm.get('name')?.value?.trim();
            this.log.debug(`${LOG_PREFIX} Indicator Name = ${name}`);

            // Read in the provided unit
            this.log.trace(`${LOG_PREFIX} Reading in the provided unit`);
            const unit: { id: number | null | undefined; abbreviation: string | null | undefined; } = { id: this.getUnitId(), abbreviation: this.getUnitAbbreviation() };
            this.log.debug(`${LOG_PREFIX} Logical Parent = ${JSON.stringify(logicalParent)}`);

            // Read in the provided aggregation id
            this.log.trace(`${LOG_PREFIX} Reading in the provided aggregation id`);
            const aggregationId: number | null | undefined = this.rulesForm.get('aggregationId')?.value;
            this.log.debug(`${LOG_PREFIX} Aggregation Id = ${aggregationId}`);

            // Read in the provided aggregation option id
            this.log.trace(`${LOG_PREFIX} Reading in the provided agregation option id`);
            const optionId: number | null | undefined = this.rulesForm.get('optionId')?.value;
            this.log.debug(`${LOG_PREFIX} Aggregation Option Id = ${optionId}`);

            // Save the record
            this.log.trace(`${LOG_PREFIX} Saving the Indicator Record`);
            this.indicatorsDataService
              .createIndicator(new Indicator({
                data: {
                  contextId: this.contextId,
                  no: no,
                  name: name,
                  logicalParentId: logicalParent?.id,
                  unitId: unit.id,
                  subindicatorsFilled: this.subindicatorsFilled(),
                  subindicatorsIds: this.subindicatorsFilled() ? this.getSelectedSubindicatorsIds() : [],
                  formFilled: this.formFilled(),
                  formFieldId: this.formFilled() ? (this.formField ? this.formField.id : null) : null,
                  autoFillingRule: (this.subindicatorsFilled() || this.formFilled()) ? { aggregationId: aggregationId, optionId: optionId } : null,
                  cumulative: this.isCumulative()
                },
                version: null
              }))
              .subscribe({
                next: (response: Indicator) => {

                  // The Indicator Record was saved successfully
                  this.log.trace(`${LOG_PREFIX} Indicator Record was saved successfuly`);

                  // Return the page to the default page in case the user elects to continue adding records
                  this.log.trace(`${LOG_PREFIX} Returning the page to the default page in case the user elects to continue adding records`);
                  this.page = "default";

                  // Reset the forms
                  this.log.trace(`${LOG_PREFIX} Resetting the forms`);
                  this.defaultForm.controls['no'].reset();
                  this.defaultForm.controls['name'].reset();
                  this.defaultForm.controls['unit'].reset();
                  this.defaultForm.controls['subindicatorsFilled'].reset();
                  this.defaultForm.controls['formFilled'].reset();
                  this.rulesForm.controls['aggregationId'].reset();
                  this.rulesForm.controls['optionId'].reset();

                  this.subindicators.length = 0;
                  this.formField = null;

                  // Emit a 'succeeded' event
                  this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
                  this.succeeded.emit();

                },
                error: (error: any) => {

                  // The Indicator Record was not saved successfully
                  this.log.trace(`${LOG_PREFIX} Indicator Record was not saved successfuly`);

                  // Emit a 'failed' event
                  this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
                  this.failed.emit(500);
                }
              });

          } else {

            // The rule form is invalid
            this.log.trace(`${LOG_PREFIX} The rule form is invalid`);

            // Run the rules form validation request to validate all fields and display the error message(s)
            this.log.trace(`${LOG_PREFIX} Running the rules form validation request to validate all fields and display the error message(s)`);
            this.validateAllFormFields(this.rulesForm);

            // Emit an 'invalid' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
            this.failed.emit(400);

          }

        } else {

          // The form field selection is invalid
          this.log.trace(`${LOG_PREFIX} The form field selection is invalid`);

          // Emit an 'invalid' event
          this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
          this.failed.emit(400);

        }

      } else {

        // The subindicators selection is invalid
        this.log.trace(`${LOG_PREFIX} The subindicators selection is invalid`);

        // Emit an 'invalid' event
        this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
        this.failed.emit(400);

      }

    } else {

      // The default form is invalid
      this.log.trace(`${LOG_PREFIX} The default form is invalid`);

      // Run the form fields validation request to validate all fields and display the error message(s)
      this.log.trace(`${LOG_PREFIX} Running the form fields validation request to validate all fields and display the error message(s)`);
      this.validateAllFormFields(this.defaultForm);

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



  private untouchAllFormFields(formGroup: FormGroup): void {

    this.log.trace(`${LOG_PREFIX} Entering untouchAllFormFields()`);

    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsUntouched({ onlySelf: true });
      }
    });
  }

  public truncate(text: string): string {
    return this.textUtilService.truncate(text, [35, "..."])
  }

}
