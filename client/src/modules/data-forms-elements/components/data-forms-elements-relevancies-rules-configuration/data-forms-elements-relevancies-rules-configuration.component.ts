import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    HostListener,
    Input,
    OnDestroy,
    OnInit,
    Output,
} from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { Observable, Subscription, of, map, first } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { DataFormElement } from '@modules/data-forms-elements/models/data-form-element.model';
import { RelevancyRule } from '@modules/data-forms-elements/models/relevancy-rule.model';
import { DataFormsElementsSelectionDataService } from '@modules/data-forms-elements/services/data-forms-elements-selection-data.service';
import { TextUtilService } from '@common/services/text-util.service';
import { OptionsDataService } from '@modules/options/services/options-data.service';
import { Option } from '@modules/options/models/option.model';
import { DataFormsElementsTypesDataService } from '@modules/data-forms-elements-types/services/data-forms-elements-types-data.service';
import { Operator } from '@modules/operators/models/operator.model';
import { DataFormElementType } from '@modules/data-forms-elements-types/models/data-form-element-type.model';
import { OperatorsDataService } from '@modules/operators/services/operators-data.service';

const LOG_PREFIX: string = "[Data Forms Elements Relevancies Component]";

@Component({
    selector: 'sb-data-forms-elements-relevancies-rules-configuration',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './data-forms-elements-relevancies-rules-configuration.component.html',
    styleUrls: ['data-forms-elements-relevancies-rules-configuration.component.scss'],
})
export class DataFormsElementsRelevanciesRulesConfigurationComponent implements OnInit, OnDestroy, AfterViewInit {

    // Allows the parent component to inject the unique identifier of the parent Context record
    @Input() public contextId: number | null | undefined;

    // Allows the parent component to inject the unique identifier of the parent Data Form record
    @Input() public dataFormId: number | null | undefined;

    // Allows the parent component to inject a previously configured relevancy rule
    @Input() public relevancyRule!: RelevancyRule;

    // Broadcasts selector windows open events
    @Output() public openedSelector: EventEmitter<void> = new EventEmitter<void>();

    // Broadcasts selector windows closed events
    @Output() public closedSelector: EventEmitter<void> = new EventEmitter<void>();

    // Keeps tabs of the processing errors
    public errors: Map<string, string> = new Map();

    // Keeps tabs of whether the page has been successfully initialised
    public initialised: boolean = false;

    // Keeps tabs of the currently visible content
    page: string = "relevancy";

    // Defines Relevancy Rule reactive form controls group
    public relevancyRuleForm = new FormGroup({
        field: new FormGroup({
            fieldId: new FormControl<number | null | undefined>(null),
            fieldTypeId: new FormControl<number | null | undefined>(null),
            fieldTitle: new FormControl<string>("Select Field"),
            fieldOptions: new FormControl<number[] | null>(null)
        }),
        operatorId: new FormControl<number | null | undefined>(null),
        value: new FormControl<number | null | undefined>(null)
    });



    // Central gathering point for all the component's subscriptions.
    // Makes it efficient to unsubscribe from all subscriptions when the component is destroyed.   
    private _subscriptions: Subscription[] = [];

    constructor(
        private cd: ChangeDetectorRef,
        public dataFormsElementsDataService: DataFormsElementsSelectionDataService,
        public dataFormsElementsTypesDataService: DataFormsElementsTypesDataService,
        public operatorsDataService: OperatorsDataService,
        public optionsDataService: OptionsDataService,
        public textUtilService: TextUtilService,
        private log: NGXLogger) {

    }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

        // Check in the context id has been provided
        this.log.trace(`${LOG_PREFIX} Checking in the context id has been provided`);
        if (this.contextId) {

            // Check in the data form id has been provided
            this.log.trace(`${LOG_PREFIX} Checking in the data form id has been provided`);
            if (this.dataFormId) {


                // Check in the target relevancy rule bean has been provided
                this.log.trace(`${LOG_PREFIX} Checking in the target relevancy rule bean has been provided`);
                if (this.relevancyRule) {

                    // The relevancy rule bean has been provided
                    this.log.trace(`${LOG_PREFIX} The relevancy rule bean has been provided`);

                    // Initialise the form
                    this.initialiseForm(() => {

                        // Initialise the form changes listener
                        this.initialiseFormChangesListener(() => {

                            // Mark Init as complete
                            this.log.trace(`${LOG_PREFIX} Init completed`);
                            this.initialised = true;

                            this.cd.detectChanges();

                        })
                    });


                } else {

                    // The target relevancy rule bean has not been provided
                    this.log.error(`${LOG_PREFIX} The target relevancy rule bean has not been provided`);

                }


            } else {

                // The data form id has not been provided
                this.log.error(`${LOG_PREFIX} The data form id has not been provided`);

            }


        } else {

            // The context id has not been provided
            this.log.error(`${LOG_PREFIX} The context id has not been provided`);

        }










    }


    ngAfterViewInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngAfterViewInit()`);


    }

    @HostListener('window:beforeunload')
    ngOnDestroy() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

        // Clear all subscriptions
        this.log.trace(`${LOG_PREFIX} Clearing all subscriptions`);
        this._subscriptions.forEach(s => s.unsubscribe());
    }


    /**
     * Initialises the relevancy configuration form
     */
    private initialiseForm(callback: (() => void)): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseForm()`);

        this.getField()
            .subscribe({
                next: (field: DataFormElement | null) => {

                    // Initialise the field
                    this.log.trace(`${LOG_PREFIX} Intialising the field`);
                    this.relevancyRuleForm.get('field')?.setValue({
                        fieldId: field && field.id ? field.id : null,
                        fieldTypeId: field && field.data.typeId ? field.data.typeId : null,
                        fieldTitle: field && field.data.title ? field.data.title : "Select Field",
                        fieldOptions: field && field.data.options ? field.data.options : null
                    });

                    // Initialise the operator
                    this.log.trace(`${LOG_PREFIX} Intialising the operator`);
                    this.relevancyRuleForm.get('operatorId')?.setValue(this.relevancyRule ? this.relevancyRule.operatorId : null);

                    // Initialise the value
                    this.log.trace(`${LOG_PREFIX} Intialising the value`);
                    this.relevancyRuleForm.get('value')?.setValue(this.relevancyRule ? this.relevancyRule.value : null);

                    // Transfer control to the callback function
                    callback();

                }
            });


    }


    /**
     * Initialises the form changes listener
     */
    private initialiseFormChangesListener(callback: (() => void)): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseFormChangesListener()`);

        this.relevancyRuleForm.get('field.fieldId')?.valueChanges.subscribe(val => {
            this.relevancyRule.fieldId = val;
            this.isFieldValid();
        });

        this.relevancyRuleForm.get('operatorId')?.valueChanges.subscribe(val => {
            this.relevancyRule.operatorId = val;
            this.isOperatorValid();
        });

        this.relevancyRuleForm.get('value')?.valueChanges.subscribe(val => {
            this.relevancyRule.value = val;
            this.isValueValid();
        });

        // Transfer control to the callback function
        callback();


    }


    /**
     * Handles Data Form Fields selector 'open events'
     */
    public onOpenFieldSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering onOpenFieldSelector()`);

        // Set the desired page to 'fields'
        this.log.trace(`${LOG_PREFIX} Setting the desired page to 'fields'`);
        this.page = "fields";

        // Emit a 'openedSelector' event
        this.log.trace(`${LOG_PREFIX} Emitting a 'openedSelector' event`);
        this.openedSelector.emit();

        // Redraw the UI
        this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
        this.cd.detectChanges();
    }


    /**
     * Handles Data Form Fields selector 'close events'
     */
    public onCloseFieldSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering onHideFieldSelector()`);

        // Set the desired page to 'relevancy'
        this.log.trace(`${LOG_PREFIX} Setting the desired page to 'relevancy'`);
        this.page = "relevancy";

        // Emit a 'closedSelector' event
        this.log.trace(`${LOG_PREFIX} Emitting a 'closedSelector' event`);
        this.closedSelector.emit();

        // Redraw the UI
        this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
        this.cd.detectChanges();
    }


    /** 
    * Handles Data Form Element Selection Events
    * @param dataFormElement The Selected Data Form Element
    */
    public onSelectDataFormElement(dataFormElement: DataFormElement): void {

        this.log.trace(`${LOG_PREFIX} Entering onSelectDataFormElement()`);
        this.log.debug(`${LOG_PREFIX} Selected Data Form Element = ${JSON.stringify(dataFormElement)}`);

        // Update the relevancy rule configuration form
        this.log.trace(`${LOG_PREFIX} Updating the relevancy rule configuration form`);
        this.relevancyRuleForm.get('field.fieldId')?.setValue((dataFormElement && dataFormElement.id) ? dataFormElement.id : null);
        this.relevancyRuleForm.get('field.fieldTypeId')?.setValue((dataFormElement && dataFormElement.data.typeId) ? dataFormElement.data.typeId : null);
        this.relevancyRuleForm.get('field.fieldTitle')?.setValue((dataFormElement && dataFormElement.data.title) ? this.textUtilService.truncate(dataFormElement.data.title, [35, "..."]) : null);
        this.relevancyRuleForm.get('field.fieldOptions')?.setValue((dataFormElement && dataFormElement.data.options) ? dataFormElement.data.options : null);
        this.relevancyRuleForm.get('operatorId')?.setValue(null);
        this.relevancyRuleForm.get('value')?.setValue(null);

        // Set the desired page to 'relevancy'
        this.log.trace(`${LOG_PREFIX} Setting the desired page to 'relevancy'`);
        this.page = "relevancy";

        // Emit a 'closedSelector' event
        this.log.trace(`${LOG_PREFIX} Emitting a 'closedSelector' event`);
        this.closedSelector.emit();

        // Validate
        this.isFieldValid();

        // Redraw the UI
        this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
        this.cd.detectChanges();

    }


    /**
     * Clears the currently selected Data Form Field & its related dependecies
     */
    public onClearDataFormField(): void {

        this.log.trace(`${LOG_PREFIX} Entering onClearDataFormField()`);

        // Update the relevancy rule configuration form
        this.log.trace(`${LOG_PREFIX} Updating the relevancy rule configuration form`);
        this.relevancyRuleForm.get('field')?.setValue({
            fieldId: null,
            fieldTypeId: null,
            fieldTitle: "Select Field",
            fieldOptions: null
        });
        this.relevancyRuleForm.get('operatorId')?.setValue(null);
        this.relevancyRuleForm.get('value')?.setValue(null);

        // Redraw the UI
        this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
        this.cd.detectChanges();

    }


    /**
     * Clears the currently set value given the change of the operator
     */
    public onRelevancyRuleOperatorChange(): void {

        this.log.trace(`${LOG_PREFIX} Entering onRelevancyRuleOperatorChange()`);

        // Update the relevancy rule configuration form
        this.log.trace(`${LOG_PREFIX} Updating the relevancy rule configuration form`);
        this.relevancyRuleForm.get('value')?.setValue(null);


    }


    /**
     * Gets the Data Form Field associated with the relevancy rule
     * @returns The Data Form Field or null if not found
     */
    private getField(): Observable<DataFormElement | null> {

        this.log.trace(`${LOG_PREFIX} Entering getField()`);

        return new Observable<DataFormElement | null>(obs => {

            // Check if a previously set relevancy rule has been provided 
            this.log.trace(`${LOG_PREFIX} Checking if a previously set relevancy rule has been provided `);

            if (this.relevancyRule) {

                // A previously set relevancy rule has been provided 
                this.log.trace(`${LOG_PREFIX} A previously set relevancy rule has been provided `);

                // Check if the previously set relevancy rule has its field id defined
                this.log.trace(`${LOG_PREFIX} Checking if the previously set relevancy rule has its field id defined`);

                if (this.relevancyRule.fieldId) {

                    // The previously set relevancy rule has its field id defined
                    this.log.trace(`${LOG_PREFIX} The previously set relevancy rule has its field id defined`);

                    // Retrieve the data form field with the specified id
                    this.log.trace(`${LOG_PREFIX} Retrieving the data form field with the specified id`);
                    this.dataFormsElementsDataService.getDataFormsElements({
                        searchTerm: null,
                        page: null,
                        pageSize: null,
                        sortColumn: null,
                        sortDirection: null,
                        id: this.relevancyRule.fieldId,
                        indexLTE: null,
                        indexGTE: null,
                        dataFormId: null,
                        categoryId: 2, // Fields
                        typeId: null,
                        parentId: null,
                        name: null
                    })
                        .subscribe({
                            next: (dataFormsElements: DataFormElement[]) => {

                                // Check if the data form element was successfully retrieved
                                this.log.trace(`${LOG_PREFIX} Checking if the data form element was successfully retrieved`);
                                if (dataFormsElements.length > 0) {

                                    // The data form element was successfully retrieved
                                    this.log.trace(`${LOG_PREFIX} The data form element was successfully retrieved`);

                                    // Return result
                                    this.log.trace(`${LOG_PREFIX} Returning the result`);
                                    obs.next(dataFormsElements[0]);


                                } else {

                                    // The data form element was not successfully retrieved
                                    this.log.trace(`${LOG_PREFIX} The data form element was not successfully retrieved`);

                                    // Return result
                                    this.log.trace(`${LOG_PREFIX} Returning the result`);
                                    obs.next(null);

                                }

                            }
                        })


                } else {

                    // The previously set relevancy rule does not have its field id defined
                    this.log.trace(`${LOG_PREFIX} The previously set relevancy rule does not have its field id defined`);

                    // Return result
                    this.log.trace(`${LOG_PREFIX} Returning the result`);
                    obs.next(null);

                }


            } else {

                // A previously set relevancy rule has not been provided 
                this.log.trace(`${LOG_PREFIX} A previously set relevancy rule has not been provided `);

                // Return result
                this.log.trace(`${LOG_PREFIX} Returning the result`);
                obs.next(null);

            }
        });

    }


    /**
     * Asynchronously retrieves the operators associated with a given data form element type
     * @param dataFormElementTypeId The data form element type
     * @returns The operators
     */
    public getOperators$(dataFormElementTypeId: number | null | undefined): Observable<Operator[]> {

        this.log.trace(`${LOG_PREFIX} Entering getOperators()`);
        this.log.debug(`${LOG_PREFIX} Data Form Element = ${JSON.stringify(dataFormElementTypeId)}`);

        // Check if Data Form Element Type's Id was specified
        this.log.trace(`${LOG_PREFIX} Checking if Data Form Element Type's Id was specified`);
        if (dataFormElementTypeId) {

            // The Data Form Element Type's Id was specified
            this.log.trace(`${LOG_PREFIX} The Data Form Element Type's Id was specified`);

            // Asynchronously get the Data Form Element Type's operators
            this.log.trace(`${LOG_PREFIX} Asynchronously getting the Data Form Element Type's operators`);
            return new Observable(obs => {

                // Get the Data Form Element's Data Form Element Type
                this.dataFormsElementsTypesDataService.getDataFormElementTypeById$(dataFormElementTypeId)
                    .pipe(first())
                    .subscribe({
                        next: (value: DataFormElementType) => {

                            // Get the operators associated with the Data Form Element Type
                            this.operatorsDataService.getOperatorsByIds$(value.data.operators)
                                .pipe(first())
                                .subscribe({
                                    next: (operators: Operator[]) => {

                                        this.log.debug(`${LOG_PREFIX} Operators = ${JSON.stringify(operators)}`);

                                        // Return the operators
                                        this.log.trace(`${LOG_PREFIX} Returning the operators`);
                                        obs.next(operators);

                                    }
                                });
                        }
                    });
            });

        } else {

            // The Data Form Element Type's Id was not specified
            this.log.trace(`${LOG_PREFIX} The Data Form Element Type's Id was not specified`);

            // Return an empty observable
            this.log.trace(`${LOG_PREFIX} Returning an empty observable`);
            return of([]);
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
    public getRelevancyFieldId(): number | null | undefined {
        return this.relevancyRuleForm.get('field.fieldId')?.value
    }


    /**
     * Retrieves the id of the data type upon which the relevancy is based
     * @returns the data type id
     */
    public getRelevancyFieldTypeId(): number | null | undefined {
        return this.relevancyRuleForm.get('field.fieldTypeId')?.value
    }


    /**
     * Retrieves the options of the field upon which the relevancy is based
     * @returns the field options
     */
    public getRelevancyFieldOptions(): number[] | null | undefined {
        return this.relevancyRuleForm.get('field.fieldOptions')?.value
    }


    /**
     * Retrieves the id of the operator upon which the relevancy is based
     * @returns the operator id
     */
    public getRelevancyOperatorId(): number | null | undefined {
        return this.relevancyRuleForm.get('operatorId')?.value
    }


    /**
     * Retrieves the value upon which the relevancy is based
     * @returns the value
     */
    public getValue(): number | null | undefined {
        return this.relevancyRuleForm.get('value')?.value
    }


    /**
     * Checks if the selected operator id is a member of the passed in array
     * @param array The array
     * @returns True or False
     */
    public operatorIdIsMemberOf(array: number[]): boolean {

        return array.some(a => a == this.getRelevancyOperatorId())

    }





    /**
     * Checks whether the conditional relevance page's details have been fully and correctly specified
     * @returns True or False
     */
    public isValid(): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isValid()`);

        let valid: boolean = true;

        // Validate field
        if (!this.isFieldValid()) {
            valid = false;
        }

        // Validate operator
        if (!this.isOperatorValid()) {
            valid = false;
        }

        // Validate value
        if (!this.isValueValid()) {
            valid = false;
        }

        this.cd.detectChanges();

        return valid;
    }


    /**
     * Checks whether the field is valid
     * @returns True or False 
     */
    private isFieldValid(): boolean {

        let valid: boolean = true;

        // Get the field
        const field: number | null | undefined = this.getRelevancyFieldId();

        // Validate the field
        if (!field) {
            this.errors.set("field", "Field is required");
            valid = false;
        }

        // Clear previous errors if valid
        if (valid) {
            this.errors.delete("field");
        }

        return valid;
    }


    /**
     * Checks whether the field operator is valid
     * @returns True or False 
     */
    private isOperatorValid(): boolean {

        let valid: boolean = true;

        // Get the operator
        const operator: number | null | undefined = this.getRelevancyOperatorId();

        // Validate the operator
        if (!operator) {
            this.errors.set("operator", "Condition is required");
            valid = false;
        }

        // Clear previous errors if valid
        if (valid) {
            this.errors.delete("operator");
        }

        return valid;

    }


    /**
   * Checks whether the value is valid if its warranted
   * @returns True or False 
   */
    private isValueValid(): boolean {

        let valid: boolean = true;

        // Get the value
        const value: number | null | undefined = this.getValue();

        // Validate the value
        if (!value) {
            this.errors.set("value", "Value is required");
            valid = false;
        }

        // Clear previous errors if valid
        if (valid) {
            this.errors.delete("value");
        }

        return valid;

    }

}

