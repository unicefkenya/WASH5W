import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostListener,
    Input,
    OnDestroy,
    OnInit,
} from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { Observable, Subscription, of, map, first, BehaviorSubject } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { ValidationRule } from '@modules/data-forms-elements/models/validation-rule.model';
import { DataFormsElementsSelectionDataService } from '@modules/data-forms-elements/services/data-forms-elements-selection-data.service';
import { TextUtilService } from '@common/services/text-util.service';
import { OptionsDataService } from '@modules/options/services/options-data.service';
import { Option } from '@modules/options/models/option.model';
import { DataFormsElementsTypesDataService } from '@modules/data-forms-elements-types/services/data-forms-elements-types-data.service';
import { Operator } from '@modules/operators/models/operator.model';
import { DataFormElementType } from '@modules/data-forms-elements-types/models/data-form-element-type.model';
import { OperatorsDataService } from '@modules/operators/services/operators-data.service';
import { DataFormElementsValidationMessagesService } from '@modules/data-forms-elements/services/data-form-elements-validation-errors.service';

const LOG_PREFIX: string = "[Data Forms Elements Validations Component]";

@Component({
    selector: 'sb-data-forms-fields-validations-rules-configuration',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './data-forms-fields-validations-rules-configuration.component.html',
    styleUrls: ['data-forms-fields-validations-rules-configuration.component.scss'],
})
export class DataFormsFieldsValidationsRulesConfigurationComponent implements OnInit, OnDestroy, AfterViewInit {

    // Allows the parent component to inject the unique identifier of the Data Form Field Type record
    @Input() public dataFormFieldTypeId!: number;

    // Allows the parent component to inject a previously configured validation rule
    @Input() public validationRule!: ValidationRule;

    // Holds the operator id
    private _operatorSubject$ = new BehaviorSubject<number | null>(null);
    readonly operator$ = this._operatorSubject$.asObservable();

    // Keeps tabs of whether the page has been successfully initialised
    public initialised: boolean = false;

    // Keeps tabs of the currently visible content
    page: string = "validity";

    // Keeps tabs of the processing errors
    public errors: Map<string, string> = new Map();

    // Defines Validation Rule reactive form controls group
    public validationRuleForm = new FormGroup({
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
        public dataFormElementsValidationMessagesService: DataFormElementsValidationMessagesService,
        public textUtilService: TextUtilService,
        private log: NGXLogger) {

    }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

        // Check in the field type id has been provided
        this.log.trace(`${LOG_PREFIX} Checking in the field type id has been provided`);
        if (this.dataFormFieldTypeId) {

            // Check in the target validation rule bean has been provided
            this.log.trace(`${LOG_PREFIX} Checking in the target validation rule bean has been provided`);
            if (this.validationRule) {

                // The validation rule bean has been provided
                this.log.trace(`${LOG_PREFIX} The validation rule bean has been provided`);

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

                // The target validation rule bean has not been provided
                this.log.error(`${LOG_PREFIX} The target validation rule bean has not been provided`);

            }


        } else {

            // The field id has not been provided
            this.log.error(`${LOG_PREFIX} The field id has not been provided`);

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
     * Initialises the validation configuration form
     */
    private initialiseForm(callback: (() => void)): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseForm()`);

        // Initialise the operator
        this.log.trace(`${LOG_PREFIX} Intialising the operator`);
        this.validationRuleForm.get('operatorId')?.setValue(this.validationRule ? this.validationRule.operatorId : null);

        // Initialise the value
        this.log.trace(`${LOG_PREFIX} Intialising the value`);
        this.validationRuleForm.get('value')?.setValue(this.validationRule ? this.validationRule.value : null);

        // Transfer control to the callback function
        callback();


    }


    /**
     * Initialises the form changes listener
     */
    private initialiseFormChangesListener(callback: (() => void)): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseFormChangesListener()`);

        this.validationRuleForm.get('operatorId')?.valueChanges.subscribe(val => {
            this.validationRule.operatorId = val;
            this.isOperatorValid();
        });

        this.validationRuleForm.get('value')?.valueChanges.subscribe(val => {
            this.validationRule.value = val;
            this.isValueValid();
        });

        this.validationRuleForm.get('message')?.valueChanges.subscribe(val => {
            this.validationRule.message = val;
        });

        // Transfer control to the callback function
        callback();


    }



    /**
     * Clears the currently set value given the change of the operator
     */
    public onValidationRuleOperatorChange(): void {

        this.log.trace(`${LOG_PREFIX} Entering onValidationRuleOperatorChange()`);


        // Read in the selected operator
        this.log.trace(`${LOG_PREFIX} Reading in the selected operator`);
        const operatorId: number | null | undefined = this.validationRuleForm.get('operatorId')?.value;
        this.log.debug(`${LOG_PREFIX} Operator = ${operatorId}`);

        // Update the operator observable 
        this._operatorSubject$.next(operatorId ? operatorId : null)

        // Update the validation rule configuration form
        this.log.trace(`${LOG_PREFIX} Updating the validation rule configuration form`);
        //this.validationRuleForm.get('operatorId')?.setValue(operatorId ? operatorId : null);
        this.validationRuleForm.get('value')?.setValue(null);
    }


    /**
     * Asynchronously retrieves the operators associated with a given data form element type
     * @param dataFormFieldTypeId The data form element type
     * @returns The operators
     */
    public getOperators$(): Observable<Operator[]> {

        this.log.trace(`${LOG_PREFIX} Entering getOperators()`);
        this.log.debug(`${LOG_PREFIX} Data Form Element = ${JSON.stringify(this.dataFormFieldTypeId)}`);

        // Check if Data Form Element Type's Id was specified
        this.log.trace(`${LOG_PREFIX} Checking if Data Form Element Type's Id was specified`);
        if (this.dataFormFieldTypeId) {

            // The Data Form Element Type's Id was specified
            this.log.trace(`${LOG_PREFIX} The Data Form Element Type's Id was specified`);

            // Asynchronously get the Data Form Element Type's operators
            this.log.trace(`${LOG_PREFIX} Asynchronously getting the Data Form Element Type's operators`);
            return new Observable(obs => {

                // Get the Data Form Element's Data Form Element Type
                this.dataFormsElementsTypesDataService.getDataFormElementTypeById$(this.dataFormFieldTypeId)
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
     * Retrieves the id of the operator upon which the validation is based
     * @returns the operator id
     */
    public getValidationOperatorId(): number | null | undefined {
        return this.validationRuleForm.get('operatorId')?.value
    }

    /**
     * Retrieves the value upon which the relevancy is based
     * @returns the value
     */
     public getValue(): number | null | undefined {
        return this.validationRuleForm.get('value')?.value
    }


    /**
     * Checks if the passed in data form field type id is a member of the passed in array
     * @param array The array
     * @returns True or False
     */
    public dataFormFieldTypeIdIsMemberOf(array: number[]): boolean {

        return array.some(a => a == this.dataFormFieldTypeId)

    }

    /**
     * Checks if the selected operator id is a member of the passed in array
     * @param array The array
     * @returns True or False
     */
    public operatorIdIsMemberOf(array: number[]): boolean {

        return array.some(a => a == this.getValidationOperatorId())

    }

    /**
     * Checks whether the conditional relevance page's details have been fully and correctly specified
     * @returns True or False
     */
    public isValid(): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isValid()`);

        let valid: boolean = true;


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
     * Checks whether the field operator is valid
     * @returns True or False 
     */
    private isOperatorValid(): boolean {

        let valid: boolean = true;

        // Get the operator
        const operator: number | null | undefined = this.getValidationOperatorId();

        // Validate the operator
        if (!operator) {
            this.errors.set("operator", "Constraint is required");
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
