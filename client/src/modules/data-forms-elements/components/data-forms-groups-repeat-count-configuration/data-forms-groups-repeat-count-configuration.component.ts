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
import { Observable, Subscription } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { DataFormElement } from '@modules/data-forms-elements/models/data-form-element.model';
import { DataFormsElementsSelectionDataService } from '@modules/data-forms-elements/services/data-forms-elements-selection-data.service';
import { TextUtilService } from '@common/services/text-util.service';
import { OptionsDataService } from '@modules/options/services/options-data.service';
import { DataFormsElementsTypesDataService } from '@modules/data-forms-elements-types/services/data-forms-elements-types-data.service';
import { OperatorsDataService } from '@modules/operators/services/operators-data.service';
import { RepeatabilityRule } from '@modules/data-forms-elements/models/repeatability-rule.model';

const LOG_PREFIX: string = "[Data Forms Groups Repeat Count Configuration Component]";

@Component({
    selector: 'sb-data-forms-groups-repeat-count-configuration',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './data-forms-groups-repeat-count-configuration.component.html',
    styleUrls: ['data-forms-groups-repeat-count-configuration.component.scss'],
})
export class DataFormsGroupsRepeatCountsConfigurationComponent implements OnInit, OnDestroy, AfterViewInit {

    // Allows the parent component to inject the unique identifier of the parent Context record
    @Input() public contextId: number | null | undefined;

    // Allows the parent component to inject the unique identifier of the parent Data Form record
    @Input() public dataFormId: number | null | undefined;

    // Allows the parent component to inject a previously configured repeatability rule
    @Input() public repeatabilityRule!: RepeatabilityRule;

    // Broadcasts selector windows open events
    @Output() public openedSelector: EventEmitter<void> = new EventEmitter<void>();

    // Broadcasts selector windows closed events
    @Output() public closedSelector: EventEmitter<void> = new EventEmitter<void>();

    // Keeps tabs of the processing errors
    public errors: Map<string, string> = new Map();

    // Keeps tabs of whether the page has been successfully initialised
    public initialised: boolean = false;

    // Keeps tabs of the currently visible content
    page: string = "repeatability";

    // Defines Repeatability Rule reactive form controls group
    public repeatabilityRuleForm = new FormGroup({
        field: new FormGroup({
            fieldId: new FormControl<number | null | undefined>(null),
            fieldTitle: new FormControl<string>("Select Field")
        })
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


                // Check in the target repeatability rule bean has been provided
                this.log.trace(`${LOG_PREFIX} Checking in the target repeatability rule bean has been provided`);
                if (this.repeatabilityRule) {

                    // The repeatability rule bean has been provided
                    this.log.trace(`${LOG_PREFIX} The repeatability rule bean has been provided`);

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

                    // The target repeatability rule bean has not been provided
                    this.log.error(`${LOG_PREFIX} The target repeatability rule bean has not been provided`);

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
     * Initialises the repeatability configuration form
     */
    private initialiseForm(callback: (() => void)): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseForm()`);

        this.getField()
            .subscribe({
                next: (field: DataFormElement | null) => {

                    // Initialise the field
                    this.log.trace(`${LOG_PREFIX} Intialising the field`);
                    this.repeatabilityRuleForm.get('field')?.setValue({
                        fieldId: field && field.id ? field.id : null,
                        fieldTitle: field && field.data.title ? field.data.title : "Select Field"
                    });

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

        this.repeatabilityRuleForm.get('field.fieldId')?.valueChanges.subscribe(val => {
            this.repeatabilityRule.fieldId = val;
            this.isFieldValid();
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

        // Set the desired page to 'repeatability'
        this.log.trace(`${LOG_PREFIX} Setting the desired page to 'repeatability'`);
        this.page = "repeatability";

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

        // Update the repeatability rule configuration form
        this.log.trace(`${LOG_PREFIX} Updating the repeatability rule configuration form`);
        this.repeatabilityRuleForm.get('field.fieldId')?.setValue((dataFormElement && dataFormElement.id) ? dataFormElement.id : null);
        this.repeatabilityRuleForm.get('field.fieldTitle')?.setValue((dataFormElement && dataFormElement.data.title) ? this.textUtilService.truncate(dataFormElement.data.title, [35, "..."]) : null);

        // Set the desired page to 'repeatability'
        this.log.trace(`${LOG_PREFIX} Setting the desired page to 'repeatability'`);
        this.page = "repeatability";

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

        // Update the repeatability rule configuration form
        this.log.trace(`${LOG_PREFIX} Updating the repeatability rule configuration form`);
        this.repeatabilityRuleForm.get('field')?.setValue({
            fieldId: null,
            fieldTitle: "Select Field"
        });

        // Redraw the UI
        this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
        this.cd.detectChanges();

    }


    /**
     * Gets the Data Form Field associated with the repeatability rule
     * @returns The Data Form Field or null if not found
     */
    private getField(): Observable<DataFormElement | null> {

        this.log.trace(`${LOG_PREFIX} Entering getField()`);

        return new Observable<DataFormElement | null>(obs => {

            // Check if a previously set repeatability rule has been provided 
            this.log.trace(`${LOG_PREFIX} Checking if a previously set repeatability rule has been provided `);

            if (this.repeatabilityRule) {

                // A previously set repeatability rule has been provided 
                this.log.trace(`${LOG_PREFIX} A previously set repeatability rule has been provided `);

                // Check if the previously set repeatability rule has its field id defined
                this.log.trace(`${LOG_PREFIX} Checking if the previously set repeatability rule has its field id defined`);

                if (this.repeatabilityRule.fieldId) {

                    // The previously set repeatability rule has its field id defined
                    this.log.trace(`${LOG_PREFIX} The previously set repeatability rule has its field id defined`);

                    // Retrieve the data form field with the specified id
                    this.log.trace(`${LOG_PREFIX} Retrieving the data form field with the specified id`);
                    this.dataFormsElementsDataService.getDataFormsElements({
                        searchTerm: null,
                        page: null,
                        pageSize: null,
                        sortColumn: null,
                        sortDirection: null,
                        id: this.repeatabilityRule.fieldId,
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

                    // The previously set repeatability rule does not have its field id defined
                    this.log.trace(`${LOG_PREFIX} The previously set repeatability rule does not have its field id defined`);

                    // Return result
                    this.log.trace(`${LOG_PREFIX} Returning the result`);
                    obs.next(null);

                }


            } else {

                // A previously set repeatability rule has not been provided 
                this.log.trace(`${LOG_PREFIX} A previously set repeatability rule has not been provided `);

                // Return result
                this.log.trace(`${LOG_PREFIX} Returning the result`);
                obs.next(null);

            }
        });

    }

    /**
     * Retrieves the id of the field upon which the repeatability is based
     * @returns the field id
     */
    public getRepeatabilityFieldId(): number | null | undefined {
        return this.repeatabilityRuleForm.get('field.fieldId')?.value
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
        const field: number | null | undefined = this.getRepeatabilityFieldId();

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


}

