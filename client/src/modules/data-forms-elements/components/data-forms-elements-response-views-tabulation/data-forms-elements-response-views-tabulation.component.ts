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
    ViewChild,
} from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { Subscription, first, BehaviorSubject, debounce, interval } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataFormsDataService } from '@modules/data-forms/services/data-forms-data.service';
import { FormControl, FormGroup } from '@angular/forms';
import { ContextsDataService } from '@modules/contexts/services/contexts-data.service';
import { Context } from '@modules/contexts/models';
import { FilterService } from '@app/app-filter.service';
import { DataForm } from '@modules/data-forms/models/data-form.model';
import { Router } from '@angular/router';
import { DataFormElementState } from '@modules/data-forms-elements/models/data-form-element-state.model';
import { DataFormsElementsDataService } from '@modules/data-forms-elements/services/data-forms-elements-data.service';
import { DataFormElement } from '@modules/data-forms-elements/models/data-form-element.model';
import { DataFormFieldResponse, RelevancyRule } from '@modules/data-forms-elements/models';
import { DataFormsFieldsResponsesService } from '@modules/data-forms-elements/services/data-forms-fields-responses.service';


const LOG_PREFIX: string = "[Data Forms Elements Response Views Tabulation Component]";

@Component({
    selector: 'sb-data-forms-elements-response-views-tabulation',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './data-forms-elements-response-views-tabulation.component.html',
    styleUrls: ['data-forms-elements-response-views-tabulation.component.scss'],
})
export class DataFormsElementsResponseViewsTabulationComponent implements OnInit, OnDestroy, AfterViewInit {

    // Allows the parent component to specify mode of working
    @Input() public mode: string = "mock"; // mock, actual

    // Allows the parent component to specify whether the form fields should be disabled
    @Input() public disabled: boolean = false;

    // Allows the parent component to inject any previously saved set of responses
    @Input() public initialDataFormFieldsResponses: DataFormFieldResponse[] = [];

    // Allows the child component to notify the parent of recently updated responses
    @Output() public updatedDataFormFieldsResponses: EventEmitter<DataFormFieldResponse[]> = new EventEmitter<DataFormFieldResponse[]>();

    // Keeps a local reference of the currently active context
    private activeContext: Context | null | undefined = null;

    // Holds the component's initialisation status.
    // Makes it possible to display the most appropriate content based on whether the initialisation was a success or not.
    initialised: boolean | undefined;

    // Holds the required records state
    // Makes it possible to supply the filter, sort or search criteria that should be applied to records on retrieval.
    private stateSubject$ = new BehaviorSubject<DataFormElementState>({
        searchTerm: null,
        page: null,
        pageSize: null,
        sortColumn: "index",
        sortDirection: "asc",
        id: null,
        indexLTE: null,
        indexGTE: null,
        dataFormId: null,
        categoryId: null,
        typeId: null,
        parentId: null,
        name: null
    });
    readonly state$ = this.stateSubject$.asObservable();

    // Central gathering point for all the component's subscriptions.
    // Makes it efficient to unsubscribe from all subscriptions when the component is destroyed.   
    private _subscriptions: Subscription[] = [];

    // Instantitate a new reactive Form Group
    // This will allow us to define and enforce the validation rules for all the form controls.
    dataFormElementsForm = new FormGroup({
        contextId: new FormControl<number | null>(null, [
        ]),
        dataFormId: new FormControl<number | null>(null, [
        ]),
    });

    constructor(
        private cd: ChangeDetectorRef,
        public contextsDataService: ContextsDataService,
        public dataFormsDataService: DataFormsDataService,
        public dataFormsElementsDataService: DataFormsElementsDataService,
        public dataFormsFieldsResponsesService: DataFormsFieldsResponsesService,
        public filterService: FilterService,
        public modalService: NgbModal,
        public router: Router,
        private log: NGXLogger) {


    }


    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

        // Initialise the active Context from the global filter
        this.initialiseActiveContext(() => {

            // Listen to and react to global context changes
            this.initialiseActiveContextChangesHandler(() => {

                // Retrieve and cache Data Forms locally
                this.initialiseDataForms(() => {

                    // Set the default active Data Form if not set
                    this.initialiseActiveDataForm(() => {

                        // Set the default active Context's id as the contextId in the desired records state
                        this.initialiseDesiredRecordsState(() => {

                            // Preselect the active Context in the data tabulation form
                            this.initialiseFormGroup(() => {

                                // Monitor & react to desired records state changes
                                this.initialiseDesiredRecordsStateChangesHandler(() => {

                                    // Initialise Data Form Fields Responses In case we are editing
                                    this.initialiseDataFormFieldsResponses(() => {

                                        // Monitor and react to Data Form Fields Responses changes
                                        this.initialiseDataFormFieldsResponsesChangesHandler(() => {

                                            // Mark Init as complete
                                            this.log.trace(`${LOG_PREFIX} Init completed`);
                                            this.initialised = true;

                                            this.cd.detectChanges();

                                        })
                                    })



                                });
                            });

                        });

                    });
                })


            });
        });


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
     * Initialise the active context
     * @param callback 
     */
    private initialiseActiveContext(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Initialise the Active Context`);
        this.activeContext = this.filterService.filter.activeContext;
        this.log.debug(`${LOG_PREFIX} Active Context = ${JSON.stringify(this.activeContext)}`);

        // Return
        this.log.trace(`${LOG_PREFIX} Returning`);
        callback();
    }

    /**
     * Subscribe and react to Context changes
     * @param callback The function to call when done
     */
    private initialiseActiveContextChangesHandler(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseActiveContextChangesHandler()`);

        // Subscribe to filtering criteria updates and react to them if the Context is changed
        this.log.trace(`${LOG_PREFIX} Subscribing to filtering criteria updates and reacting to them if the Context is changed`);
        this._subscriptions.push(
            this.filterService.currentFilter$
                .subscribe({
                    next: (filter) => {

                        if ((JSON.stringify(this.activeContext) !== JSON.stringify(filter.activeContext))) {

                            // Active context changed
                            this.log.trace(`${LOG_PREFIX} Active context changed`);

                            // Keep a local reference to the location / temporal filters
                            this.activeContext = filter.activeContext;

                            this.initialiseDataForms(() => {

                                this.initialiseActiveDataForm(() => {

                                    // Make a copy of the desired records state
                                    this.log.trace(`${LOG_PREFIX} Making a copy of the desired records state`);
                                    let copy: DataFormElementState = Object.assign({}, this.stateSubject$.value);

                                    // Update the copy of the desired records state
                                    this.log.trace(`${LOG_PREFIX} Updating the copy of the desired records state`);
                                    Object.assign(copy, { dataFormId: this.filterService.filter.activeDataForm?.id });

                                    // Broadcast the newly desired record state
                                    this.log.trace(`${LOG_PREFIX} Broadcasting the newly desired record state`);
                                    this.stateSubject$.next(copy);

                                    this.log.trace(`${LOG_PREFIX} Preselecting the item on the form`);
                                    this.dataFormElementsForm.get('dataFormId')?.setValue(this.filterService.filter.activeDataForm?.id ? this.filterService.filter.activeDataForm?.id : null);

                                })
                            });

                        }
                    }
                })
        );

        // Transfer control to the callback function
        callback();

    }


    /**
     * Retrieves and caches Data Forms records
     * @param callback The function to call when done
     */
    private initialiseDataForms(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseDataForms()`);

        // Retrieve and cache the context's Data Forms records
        this.log.trace(`${LOG_PREFIX} Retrieving and caching the context's Data Forms records`);
        this.dataFormsDataService
            .getDataForms(true, {
                page: null,
                pageSize: null,
                searchTerm: null,
                sortColumn: 'name',
                sortDirection: 'asc',
                contextId: this.filterService.filter.activeContext?.id,
                name: null
            })
            .pipe(first()) // This will automatically complete (and therefore unsubscribe) after the first value has been emitted.
            .subscribe({
                next: (dataForms: DataForm[]) => {

                    // Data Forms successfully retrieved and cached
                    this.log.debug(`${LOG_PREFIX} ${dataForms.length} DataForm(s) retrieved and cached`);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                },

                error: (err: any) => {

                    // Data Forms retrieval failed
                    this.log.error(`${LOG_PREFIX} Data Forms retrieval failed`);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                }
            });


    }


    /**
     * Sets the active DataForm if it has not been set in the global filter
     * @param callback The function to call when done
     */
    private initialiseActiveDataForm(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseActiveDataForm()`);

        // Check if the active DataForm has been set in the global filter
        this.log.trace(`${LOG_PREFIX} Checking if the active DataForm has been set in the global filter`);
        if (this.filterService.filter.activeDataForm) {

            // The active DataForm has been set in the global filter
            this.log.trace(`${LOG_PREFIX} The active DataForm has been set in the global filter`);

            // Check if the active Data Form record exists in the cache
            this.log.trace(`${LOG_PREFIX} Checking if the active Data Form record exists in the cache`);
            if (this.dataFormsDataService.records.some(a => a.id == this.filterService.filter.activeDataForm?.id)) {

                // The active Data Form record exists in the cache
                this.log.trace(`${LOG_PREFIX} The active Data Form record exists in the cache`);

                // Initialisation is valid
                this.log.trace(`${LOG_PREFIX} Initialisation is valid`);

            } else {

                // Initialisation is invalid
                this.log.trace(`${LOG_PREFIX} Initialisation is invalid`);

                // Get the first Data Form record
                this.log.trace(`${LOG_PREFIX} Get the first Data Form record`);
                const dataForm: DataForm | null = this.dataFormsDataService.records.length > 0 ? this.dataFormsDataService.records[0] : null;
                this.log.trace(`${LOG_PREFIX} First Data Form record = ${JSON.stringify(dataForm)}`);

                // Update the global filter
                this.log.trace(`${LOG_PREFIX} Updating the global filter`);
                this.filterService.update({ activeDataForm: dataForm });

            }

            // Return
            this.log.trace(`${LOG_PREFIX} Returning`);
            callback();

        } else {

            // The active DataForm has not been set in the global filter
            this.log.trace(`${LOG_PREFIX} The active DataForm has not been set in the global filter`);

            // Get the first Data Form record
            this.log.trace(`${LOG_PREFIX} Get the first Data Form record`);
            const dataForm: DataForm | null = this.dataFormsDataService.records.length > 0 ? this.dataFormsDataService.records[0] : null;
            this.log.trace(`${LOG_PREFIX} First Data Form record = ${JSON.stringify(dataForm)}`);

            // Update the global filter
            this.log.trace(`${LOG_PREFIX} Updating the global filter`);
            this.filterService.update({ activeDataForm: dataForm });

            // Return
            this.log.trace(`${LOG_PREFIX} Returning`);
            callback();

        }

    }


    /**
     * Presets default values in the desired records state bean
     * @param callback The function to call when done
     */
    private initialiseDesiredRecordsState(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseDesiredRecordsState()`);

        this.log.trace(`${LOG_PREFIX} Get the Active Context`);
        const activeContext: Context | null | undefined = this.filterService.filter.activeContext;
        this.log.debug(`${LOG_PREFIX} Active Context = ${JSON.stringify(activeContext)}`);

        this.log.trace(`${LOG_PREFIX} Get the Active DataForm`);
        const activeDataForm: DataForm | null | undefined = this.filterService.filter.activeDataForm;
        this.log.debug(`${LOG_PREFIX} Active DataForm = ${JSON.stringify(activeDataForm)}`);

        // Make a copy of the desired records state
        this.log.trace(`${LOG_PREFIX} Making a copy of the desired records state`);
        let copy: DataFormElementState = Object.assign({}, this.stateSubject$.value);

        // Set the active Context as the desired Context
        this.log.trace(`${LOG_PREFIX} Setting the active Context as the desired Context`);
        Object.assign(copy, { contextId: activeContext?.id, dataFormId: activeDataForm?.id });

        // Broadcast the newly desired record state
        this.log.trace(`${LOG_PREFIX} Broadcasting the newly desired record state`);
        this.stateSubject$.next(copy);

        // Return
        this.log.trace(`${LOG_PREFIX} Returning`);
        callback();

    }


    /**
     * Presets default values in the data tabulation form
     * @param callback The function to call when done
     */
    private initialiseFormGroup(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseFormGroup()`);


        // Set the default Context
        this.log.trace(`${LOG_PREFIX} Setting the default Context`);
        const activeContext: Context | null | undefined = this.filterService.filter.activeContext;
        this.dataFormElementsForm.get('contextId')?.setValue((activeContext && activeContext.id) ? activeContext.id : null);


        // Set the default DataForm
        this.log.trace(`${LOG_PREFIX} Setting the default Data Form`);
        const activeDataForm: DataForm | null | undefined = this.filterService.filter.activeDataForm;
        this.dataFormElementsForm.get('dataFormId')?.setValue((activeDataForm && activeDataForm.id) ? activeDataForm.id : null);

        // Return
        this.log.trace(`${LOG_PREFIX} Returning`);
        callback();




    }


    /**
     * Subscribe and react to desired records state changes
     * @param callback The function to call when done
     */
    private initialiseDesiredRecordsStateChangesHandler(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseDesiredRecordsStateChangesHandler()`);

        // Subscribe to desired record states changes and react to them
        this.log.trace(`${LOG_PREFIX} Subscribing to desired record states changes`);
        this._subscriptions.push(
            this.stateSubject$
                .subscribe({
                    next: (state) => {

                        // Desired records state changed
                        this.log.trace(`${LOG_PREFIX} Desired records state changed`);
                        this.log.debug(`${LOG_PREFIX} Desired records state = ${state}`);

                        // Retrieve the Data Form Element records corresponding to the passed in state
                        this.log.trace(`${LOG_PREFIX} Retrieving the Data Form Element records corresponding to the passed in state`);
                        this.dataFormsElementsDataService
                            .getDataFormsElements(true, state)
                            .subscribe({
                                next: (s: DataFormElement[]) => {

                                    // Data Form Element records retrieved
                                    this.log.trace(`${LOG_PREFIX} Data Form Element records retrieved`);

                                    if (this.initialised) {
                                        this.cd.markForCheck();
                                    } else {
                                        callback();
                                    }


                                }
                            });

                    }
                })
        );



    }



    /**
     * Initialise data form fields responses
     * @param callback The function to call when done
     */
    private initialiseDataFormFieldsResponses(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseDataFormFieldsResponses()`);

        this.dataFormsFieldsResponsesService.init(this.initialDataFormFieldsResponses);

        // Transfer control to the callback function
        callback();

    }




    /**
     * Subscribe and react to data form fields responses changes after a little delay
     * @param callback The function to call when done
     */
    private initialiseDataFormFieldsResponsesChangesHandler(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseDataFormFieldsResponsesChangesHandler()`);

        this._subscriptions.push(
            this.dataFormsFieldsResponsesService.responseUpdated$
                .pipe(debounce(() => interval(500)))
                .subscribe({
                    next: () => {
                        if (this.mode == "actual") {
                            this.updatedDataFormFieldsResponses.emit(this.getCleanResponses());
                        }
                    }
                })
        )


        // Transfer control to the callback function
        callback();

    }



    /**
     * Retrieves the data form elements that belong to the parent with the specified id
     * @param parentId the parent id
     * @returns the data form elements
     */
    public getNestedDataFormElements(parentId: number): DataFormElement[] | undefined {
        return this.dataFormsElementsDataService.nestedDataFormElements.get(parentId);
    }


    /**
     * Handles DataForm change events
     */
    public onDataFormChange(): void {

        this.log.trace(`${LOG_PREFIX} Entering onDataFormChange()`);


        // Get the selected Data Form id
        this.log.trace(`${LOG_PREFIX} Getting the selected Data Form Id`);
        const dataFormId: number | null | undefined = this.dataFormElementsForm.get('dataFormId')?.value
        this.log.debug(`${LOG_PREFIX} Data Form Id = ${dataFormId}`);

        // Check if the specified Data Form is different from the current dataForm
        this.log.trace(`${LOG_PREFIX} Check if the specified Data Form is different from the current dataForm`);

        if (dataFormId != this.stateSubject$.value.dataFormId) {

            // The specified Data Form is different from the current dataForm
            this.log.trace(`${LOG_PREFIX} The specified Data Form is different from the current dataForm`);

            // Get the Data Form record corresponding to the passed in id
            this.log.trace(`${LOG_PREFIX} Getting the Data Form record corresponding to the passed in id`);
            const dataForm: DataForm | undefined = this.dataFormsDataService.records.find(o => o.id == dataFormId);

            // Update the global filter
            this.log.trace(`${LOG_PREFIX} Updating the global filter`);
            this.filterService.update({ activeDataForm: dataForm });

            // Make a copy of the desired records state
            this.log.trace(`${LOG_PREFIX} Making a copy of the desired records state`);
            let copy: DataFormElementState = Object.assign({}, this.stateSubject$.value);

            // Update the copy of the desired records state
            this.log.trace(`${LOG_PREFIX} Updating the copy of the desired records state`);
            Object.assign(copy, { dataFormId: dataFormId });

            // Broadcast the newly desired record state
            this.log.trace(`${LOG_PREFIX} Broadcasting the newly desired record state`);
            this.stateSubject$.next(copy);

        } else {

            // The specified Data Form is not different from the current dataForm
            this.log.trace(`${LOG_PREFIX} The specified Data Form is not different from the current dataForm`);

            // Ignore the event
            this.log.trace(`${LOG_PREFIX} Ignoring the change event`);

        }

    }



    /**
     * Handles search term changes events
     * @param searchTerm The updated search term
     */
    public onSearchTermChange(searchTerm: string): void {

        this.log.trace(`${LOG_PREFIX} Entering onSearchTermChange()`);
        this.log.debug(`${LOG_PREFIX} Search Term = ${searchTerm}`);

        // Check if the specified search term is different from the current search term
        this.log.trace(`${LOG_PREFIX} Check if the specified search term is different from the current search term`);

        if (searchTerm != this.stateSubject$.value.searchTerm) {

            // The specified search term is different from the current search
            this.log.trace(`${LOG_PREFIX} The specified search term is different from the current search`);

            // Make a copy of the desired records state
            this.log.trace(`${LOG_PREFIX} Making a copy of the desired records state`);
            let copy: DataFormElementState = Object.assign({}, this.stateSubject$.value);

            // Update the copy of the desired records state
            this.log.trace(`${LOG_PREFIX} Updating the copy of the desired records state`);
            Object.assign(copy, { searchTerm: searchTerm });

            // Broadcast the newly desired record state
            this.log.trace(`${LOG_PREFIX} Broadcasting the newly desired record state`);
            this.stateSubject$.next(copy);

        } else {

            // The specified search term is not different from the current search
            this.log.trace(`${LOG_PREFIX} The specified search term is not different from the current search term`);

            // Ignore the event
            this.log.trace(`${LOG_PREFIX} Ignoring the change event`);

        }

    }

    /**
     * Handles page change events
     * @param page The page to load
     */
    public onPageChange(page: number): void {

        this.log.trace(`${LOG_PREFIX} Entering onPageChange()`);
        this.log.debug(`${LOG_PREFIX} Search = ${page}`);

        // Check if the specified page is different from the current page
        this.log.trace(`${LOG_PREFIX} Check if the specified page is different from the current page`);

        if (page != this.stateSubject$.value.page) {

            // The specified page is different from the current page
            this.log.trace(`${LOG_PREFIX} The specified page is different from the current page`);

            // Make a copy of the desired records state
            this.log.trace(`${LOG_PREFIX} Making a copy of the desired records state`);
            let copy: DataFormElementState = Object.assign({}, this.stateSubject$.value);

            // Update the copy of the desired records state
            this.log.trace(`${LOG_PREFIX} Updating the copy of the desired records state`);
            Object.assign(copy, { page: page });

            // Broadcast the newly desired record state
            this.log.trace(`${LOG_PREFIX} Broadcasting the newly desired record state`);
            this.stateSubject$.next(copy);

        } else {

            // The specified page is not different from the current page
            this.log.trace(`${LOG_PREFIX} The specified page is not different from the current page`);

            // Ignore the event
            this.log.trace(`${LOG_PREFIX} Ignoring the change event`);

        }

    }

    /**
     * Handles page size change events
     * @param pageSize The page size to use
     */
    public onPageSizeChange(pageSize: number): void {

        this.log.trace(`${LOG_PREFIX} Entering onPageSizeChange()`);
        this.log.debug(`${LOG_PREFIX} Search = ${pageSize}`);

        // Check if the specified page size is different from the current page size
        this.log.trace(`${LOG_PREFIX} Check if the specified page size is different from the current page size`);

        if (pageSize != this.stateSubject$.value.pageSize) {

            // The specified page size is different from the current page size
            this.log.trace(`${LOG_PREFIX} The specified page size is different from the current page size`);

            // Make a copy of the desired records state
            this.log.trace(`${LOG_PREFIX} Making a copy of the desired records state`);
            let copy: DataFormElementState = Object.assign({}, this.stateSubject$.value);

            // Update the copy of the desired records state
            this.log.trace(`${LOG_PREFIX} Updating the copy of the desired records state`);
            Object.assign(copy, { pageSize: pageSize, page: 1 });

            // Broadcast the newly desired record state
            this.log.trace(`${LOG_PREFIX} Broadcasting the newly desired record state`);
            this.stateSubject$.next(copy);

        } else {

            // The specified page size is not different from the current page size
            this.log.trace(`${LOG_PREFIX} The specified page size is not different from the current page size`);

            // Ignore the event
            this.log.trace(`${LOG_PREFIX} Ignoring the change event`);

        }

    }




    /**
     * Get the clean fields responses in the currently active data form
     * @returns the clean data form field responses
     */
    public getCleanResponses(): DataFormFieldResponse[] {

        let clean: DataFormFieldResponse[] = [];

        // Loop through the top level data form's elements
        this.log.trace(`${LOG_PREFIX} Looping through the top levels data form's elements`);
        for (let element of this.dataFormsElementsDataService.records.filter(d => d.data.parentId == null)) {

            this.log.debug(`${LOG_PREFIX} Element = ${JSON.stringify(element)}`);

            // Check if the element's id and type have been specified
            this.log.trace(`${LOG_PREFIX} Checking if the element's id and type have been specified`);

            if (element.id && element.data.typeId) {

                // The element's id and type have been specified
                this.log.trace(`${LOG_PREFIX} The element's id and type have been specified`);

                // Get the clean fields responses associated with the passed in non-repeatable group element
                switch (element.data.typeId) {

                    case 1: // Non-repeatable group

                        // Get the clean non-repeatable group's responses
                        this.log.trace(`${LOG_PREFIX} Getting the clean non-repeatable group's responses`);
                        clean = clean.concat(this.getCleanNonRepeatableGroupFieldResponses(element));

                        break;

                    case 2: // Repeatable group

                        // Get the clean repeatable group's responses
                        this.log.trace(`${LOG_PREFIX} Getting the clean repeatable group's responses`);
                        clean = clean.concat(this.getCleanRepeatableGroupFieldResponses(element));

                        break;

                    default: // Fields

                        // Get the clean field's responses
                        this.log.trace(`${LOG_PREFIX} Getting the clean field's responses`);
                        clean = clean.concat(this.getCleanFieldResponses(element));


                }


            } else {

                // The element's id and type have not been specified
                this.log.warn(`${LOG_PREFIX} The element's id and type have not been specified`);
                this.log.warn(`${LOG_PREFIX} Ignoring the element's responses`);

            }

        }

        return clean.filter(c => c.value);
    }




    /**
     * Get the clean fields responses associated with the passed in field element
     * @param field the field element
     * @param index the index of the field element for multi-response fields
     * @returns the clean field responses
     */
    private getCleanFieldResponses(field: DataFormElement, index?: number): DataFormFieldResponse[] {

        this.log.trace(`${LOG_PREFIX} Entering getCleanFieldResponses()`);

        let clean: DataFormFieldResponse[] = [];

        // Check if the element's id and type have been specified
        this.log.trace(`${LOG_PREFIX} Checking if the element's id and type have been specified`);

        if (field.id && field.data.typeId) {

            // The element's id and type have been specified
            this.log.trace(`${LOG_PREFIX} The element's id and type have been specified`);

            // Ascertain that the element is a field
            this.log.trace(`${LOG_PREFIX} Ascertaining that the element is a field`);
            if (field.data.typeId > 2) {

                // The element is a field
                this.log.trace(`${LOG_PREFIX} The element is a field`);

                // Check if the element is conditionally irrelevant
                this.log.trace(`${LOG_PREFIX} Checking if the element is conditionally irrelevant`);
                if (field.data.conditionallyRelevant && !(this.dataFormsFieldsResponsesService.isRelevant(field.data.conditionalRelevancyRule))) {

                    // The element is conditionally irrelevant
                    this.log.trace(`${LOG_PREFIX} The element is conditionally irrelevant`);
                    this.log.trace(`${LOG_PREFIX} Ignoring the element's responses`);

                } else {


                    // The element is relevant
                    this.log.trace(`${LOG_PREFIX} The element is relevant`);

                    // Get the element's response
                    this.log.trace(`${LOG_PREFIX} Get the element's response`);
                    const response: DataFormFieldResponse = this.dataFormsFieldsResponsesService.getResponse(field.id, index ? index : 0);
                    this.log.debug(`${LOG_PREFIX} Nested Element Response = ${JSON.stringify(response)}`);

                    // Check if the response is erratic
                    this.log.trace(`${LOG_PREFIX} Checking if the response is erratic`);
                    if (this.dataFormsFieldsResponsesService.getErrors(field, response.value)) {

                        // The response is erratic
                        this.log.trace(`${LOG_PREFIX} The response is erratic`);

                        // Ignore the response
                        this.log.trace(`${LOG_PREFIX} Ignoring the response`);

                    } else {

                        // The response is not erratic
                        this.log.trace(`${LOG_PREFIX} The response is not erratic`);

                        // Add the response to the list of clean responses
                        this.log.trace(`${LOG_PREFIX} Adding the response to the list of clean responses`);
                        clean.push(response)

                    }

                }

            } else {

                // The element is not a field
                this.log.warn(`${LOG_PREFIX} The element is a field`);
                this.log.warn(`${LOG_PREFIX} Ignoring the element's responses`);

            }

        } else {

            // The element's id and type have not been specified
            this.log.warn(`${LOG_PREFIX} The element's id and type have not been specified`);
            this.log.warn(`${LOG_PREFIX} Ignoring the element's responses`);
        }

        return clean;
    }





    /**
     * Get the clean fields responses associated with the passed in non-repeatable group element
     * @param group the non-repeatable group element
     * @returns the clean field responses
     */
    private getCleanNonRepeatableGroupFieldResponses(group: DataFormElement): DataFormFieldResponse[] {

        this.log.trace(`${LOG_PREFIX} Entering getCleanNonRepeatableGroupFieldResponses()`);

        let clean: DataFormFieldResponse[] = [];

        // Check if the element's id and type have been specified
        this.log.trace(`${LOG_PREFIX} Checking if the element's id and type have been specified`);

        if (group.id && group.data.typeId) {

            // The element's id and type have been specified
            this.log.trace(`${LOG_PREFIX} The element's id and type have been specified`);

            // Ascertain that the element is a non-repeatable group
            this.log.trace(`${LOG_PREFIX} Ascertaining that the element is a non-repeatable group`);
            if (group.data.typeId == 1) {

                // The element is a non-repeatable group
                this.log.trace(`${LOG_PREFIX} The element is a non-repeatable group`);

                // Check if the element is conditionally irrelevant
                this.log.trace(`${LOG_PREFIX} Checking if the element is conditionally irrelevant`);
                if (group.data.conditionallyRelevant && !(this.dataFormsFieldsResponsesService.isRelevant(group.data.conditionalRelevancyRule))) {

                    // The element is conditionally irrelevant
                    this.log.trace(`${LOG_PREFIX} The element is conditionally irrelevant`);
                    this.log.trace(`${LOG_PREFIX} Ignoring the element's responses`);

                } else {

                    // The element is relevant
                    this.log.trace(`${LOG_PREFIX} The element is relevant`);

                    // Loop through the group's nested elements and extract the clean responses
                    this.log.trace(`${LOG_PREFIX} Looping through the group's nested elements and extracting the clean responses`);
                    for (let nestedElement of this.dataFormsElementsDataService.records.filter(d => d.data.parentId == group.id)) {

                        this.log.debug(`${LOG_PREFIX} Nested element = ${JSON.stringify(nestedElement)}`);

                        // Check if the nested element's id and type have been specified
                        this.log.trace(`${LOG_PREFIX} Checking if the nested element's id and type have been specified`);

                        if (nestedElement.id && nestedElement.data.typeId) {

                            // The nested element's id and type have been specified
                            this.log.trace(`${LOG_PREFIX} The nested element's id and type have been specified`);

                            // Get the clean fields responses associated with the passed in non-repeatable group element
                            switch (nestedElement.data.typeId) {

                                case 1: // Non-repeatable group

                                    // Get the clean non-repeatable group's responses
                                    this.log.trace(`${LOG_PREFIX} Getting the clean non-repeatable group's responses`);
                                    clean = clean.concat(this.getCleanNonRepeatableGroupFieldResponses(nestedElement));

                                    break;

                                case 2: // Repeatable group

                                    // Get the clean repeatable group's responses
                                    this.log.trace(`${LOG_PREFIX} Getting the clean repeatable group's responses`);
                                    clean = clean.concat(this.getCleanRepeatableGroupFieldResponses(nestedElement));

                                    break;

                                default: // Fields

                                    // Get the clean field's responses
                                    this.log.trace(`${LOG_PREFIX} Getting the clean field's responses`);
                                    clean = clean.concat(this.getCleanFieldResponses(nestedElement));


                            }


                        } else {

                            // The nested element's id and type have not been specified
                            this.log.warn(`${LOG_PREFIX} The nested element's id and type have not been specified`);
                            this.log.warn(`${LOG_PREFIX} Ignoring the element's responses`);

                        }

                    }

                }

            } else {

                // The element is not a non-repeatable group
                this.log.warn(`${LOG_PREFIX} The element is not a non-repeatable group`);
                this.log.warn(`${LOG_PREFIX} Ignoring the element's responses`);

            }

        } else {

            // The element's id and type have not been specified
            this.log.warn(`${LOG_PREFIX} The element's id and type have not been specified`);
            this.log.warn(`${LOG_PREFIX} Ignoring the element's responses`);
        }

        return clean;
    }





    /**
     * Get the clean fields responses associated with the passed in repeatable group element
     * @param group the repeatable group element
     * @returns the clean field responses
     */
    private getCleanRepeatableGroupFieldResponses(group: DataFormElement): DataFormFieldResponse[] {

        this.log.trace(`${LOG_PREFIX} Entering getCleanRepeatableGroupFieldResponses()`);

        let clean: DataFormFieldResponse[] = [];

        // Check if the element's id and type have been specified
        this.log.trace(`${LOG_PREFIX} Checking if the element's id and type have been specified`);

        if (group.id && group.data.typeId) {

            // The element's id and type have been specified
            this.log.trace(`${LOG_PREFIX} The element's id and type have been specified`);

            // Ascertain that the element is a repeatable group
            this.log.trace(`${LOG_PREFIX} Ascertaining that the element is a repeatable group`);
            if (group.data.typeId == 2) {

                // The element is a repeatable group
                this.log.trace(`${LOG_PREFIX} The element is a repeatable group`);

                // Check if the element is conditionally irrelevant
                this.log.trace(`${LOG_PREFIX} Checking if the element is conditionally irrelevant`);
                if (group.data.conditionallyRelevant && !(this.dataFormsFieldsResponsesService.isRelevant(group.data.conditionalRelevancyRule))) {

                    // The element is conditionally irrelevant
                    this.log.trace(`${LOG_PREFIX} The element is conditionally irrelevant`);
                    this.log.trace(`${LOG_PREFIX} Ignoring the element's responses`);

                } else {

                    // The element is relevant
                    this.log.trace(`${LOG_PREFIX} The element is relevant`);

                    // Try retrieving the response upon which the repetition is based
                    this.log.trace(`${LOG_PREFIX} Trying to retrieve the response upon which the repetition is based`);
                    const repeatCountFieldResponse: DataFormFieldResponse | null | undefined =
                        group.data.repeatabilityRule?.fieldId ? this.dataFormsFieldsResponsesService.getResponse(group.data.repeatabilityRule.fieldId) : null;

                    // Check if the response upon which the repetition is based was successfully retrieved
                    this.log.trace(`${LOG_PREFIX} Checking if the response upon which the repetition is based was successfully retrieved`);
                    if (repeatCountFieldResponse) {

                        // The response upon which the repetition is based was successfully retrieved
                        this.log.trace(`${LOG_PREFIX} The response upon which the repetition is based was successfully retrieved`);
                        this.log.debug(`${LOG_PREFIX} Repetition Basis  = ${JSON.stringify(repeatCountFieldResponse)}`);

                        // Loop through the group's nested elements and extract the clean responses
                        this.log.trace(`${LOG_PREFIX} Looping through the group's nested elements and extracting the clean responses`);
                        for (let nestedElement of this.dataFormsElementsDataService.records.filter(d => d.data.parentId == group.id)) {

                            // Check if the nested element's id and type have been specified
                            this.log.trace(`${LOG_PREFIX} Checking if the nested element's id and type have been specified`);

                            if (nestedElement.id && nestedElement.data.typeId) {

                                // The nested element's id and type have been specified
                                this.log.trace(`${LOG_PREFIX} The nested element's id and type have been specified`);

                                for (let i = 0; i < repeatCountFieldResponse.value; i++) {

                                    this.log.debug(`${LOG_PREFIX} Nested element = ${JSON.stringify(nestedElement)}`);
                                    this.log.debug(`${LOG_PREFIX} Index = ${i}`);


                                    // Get the clean fields responses associated with the passed in non-repeatable group element
                                    switch (nestedElement.data.typeId) {

                                        case 1: // Non-repeatable group

                                            // Get the clean non-repeatable group's responses
                                            this.log.trace(`${LOG_PREFIX} Getting the clean non-repeatable group's responses`);
                                            clean = clean.concat(this.getCleanNonRepeatableGroupFieldResponses(nestedElement));

                                            break;

                                        case 2: // Repeatable group

                                            // Get the clean repeatable group's responses
                                            this.log.trace(`${LOG_PREFIX} Getting the clean repeatable group's responses`);
                                            clean = clean.concat(this.getCleanRepeatableGroupFieldResponses(nestedElement));

                                            break;

                                        default: // Fields

                                            // Get the clean field's responses
                                            this.log.trace(`${LOG_PREFIX} Getting the clean field's responses`);
                                            clean = clean.concat(this.getCleanFieldResponses(nestedElement, i));


                                    }

                                }


                            } else {

                                // The nested element's id and type have not been specified
                                this.log.warn(`${LOG_PREFIX} The nested element's id and type have not been specified`);
                                this.log.warn(`${LOG_PREFIX} Ignoring the element's responses`);

                            }


                        }


                    } else {

                        // The response upon which the repetition is based was not successfully retrieved
                        this.log.trace(`${LOG_PREFIX} The response upon which the repetition is based was not successfully retrieved`);
                        this.log.trace(`${LOG_PREFIX} Ignoring the element's responses`);

                    }

                }

            } else {

                // The element is not a repeatable group
                this.log.warn(`${LOG_PREFIX} The element is not a repeatable group`);
                this.log.warn(`${LOG_PREFIX} Ignoring the element's responses`);

            }

        } else {

            // The element's id and type have not been specified
            this.log.warn(`${LOG_PREFIX} The element's id and type have not been specified`);
            this.log.warn(`${LOG_PREFIX} Ignoring the element's responses`);
        }

        return clean;
    }





    public counter(i: any): any[] {
        return new Array(parseInt(i));
    }





}
