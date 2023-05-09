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
import { LoadingAnimationComponent, PaginationComponent } from '@common/components';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject, Subscription, debounceTime, first } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { ContextsDataService } from '@modules/contexts/services/contexts-data.service';
import { Context } from '@modules/contexts/models/context.model';
import { FilterService } from '@app/app-filter.service';
import { DataFormsDataService } from '@modules/data-forms/services/data-forms-data.service';
import { DataFormElement } from '@modules/data-forms-elements/models/data-form-element.model';
import { DataFormElementState } from '@modules/data-forms-elements/models/data-form-element-state.model';
import { DataFormsElementsSelectionDataService } from '@modules/data-forms-elements/services/data-forms-elements-selection-data.service';
import { DataForm } from '@modules/data-forms/models/data-form.model';

const LOG_PREFIX: string = "[Data Forms Fields Records Selection Component]";

@Component({
    selector: 'sb-data-forms-fields-records-selection',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './data-forms-fields-records-selection.component.html',
    styleUrls: ['data-forms-fields-records-selection.component.scss'],
})
export class DataFormElementsFieldsRecordsSelectionComponent implements OnInit, OnDestroy, AfterViewInit {

    // Allows the parent component to inject the desired Context
    @Input() public contextId: number | null = null;

    // Allows the parent component to inject the desired Data Form
    @Input() public dataFormId: number | null = null;

    // Allows the parent component to inject the desired Data Form Element Type
    @Input() public dataFormElementTypeId: number | null = null;

    // Allows the parent component to inject the desired selection mode: single or multi
    @Input() public selectionMode: string = "single";

    // Allows the parent component to inject the desired Contexts
    @Input() public desired: DataFormElement[] = [];

    // Allows the parent component to inject the undesired Contexts
    // Ignored if the desired Contexts has been specified
    @Input() public undesired: DataFormElement[] = [];

    // Allows the parent component to inject the previously selected Contexts
    @Input() public selected: DataFormElement[] = [];

    // Broadcasts radio buttons selection events
    @Output() public select: EventEmitter<DataFormElement> = new EventEmitter<DataFormElement>();

    // Broadcasts checkboxes check events
    @Output() public check: EventEmitter<DataFormElement> = new EventEmitter<DataFormElement>();

    // Broadcasts checkboxes uncheck events
    @Output() public uncheck: EventEmitter<DataFormElement> = new EventEmitter<DataFormElement>();

    // Keeps a local reference to the displayed loading animation component.
    // Makes it possible to trigger the loading animation when a slow background service is invoked.
    private _animation!: LoadingAnimationComponent;

    // Keeps a local reference to the displayed pagination component.
    // Makes it possible to initialise / update the pagination component when the total number of records changes.
    private _pagination!: PaginationComponent;

    // Holds the component's initialisation status.
    // Makes it possible to display the most appropriate content based on whether the initialisation was a success or not.
    initialised: boolean | undefined;

    // Holds the required records state
    // Makes it possible to supply the filter, sort or search criteria that should be applied to records on retrieval.
    private stateSubject$ = new BehaviorSubject<DataFormElementState>({
        searchTerm: null,
        page: 1,
        pageSize: 3,
        sortColumn: "id",
        sortDirection: "asc",
        id: null,
        indexLTE: null,
        indexGTE: null,
        dataFormId: null,
        categoryId: 2,  // Fields 
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
        dataFormId: new FormControl<number | null>(null, [
        ]),
    });

    constructor(
        private cd: ChangeDetectorRef,
        public contextsDataService: ContextsDataService,
        public dataFormsDataService: DataFormsDataService,
        public dataFormsElementsDataService: DataFormsElementsSelectionDataService,
        private filterService: FilterService,
        private log: NGXLogger) {

    }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

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

                            // Mark Init as complete
                            this.log.trace(`${LOG_PREFIX} Init completed`);
                            this.initialised = true;
                            this.cd.markForCheck();
                        });
                    });

                });

            });
        })

    }




    ngAfterViewInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngAfterViewInit()`);

        // Set the initial page size
        this.initialisePaginationPageSize(() => {

            // Monitor & react to total record counts changes
            this.initialiseTotalRecordCountsChangesHandler(() => {

                // Monitor & react to loading status changes
                this.initialiseLoadingStatusChangesHandler(() => {

                    // Mark After-View-Init as complete
                    this.log.trace(`${LOG_PREFIX} After-View-Init completed`);
                });
            });
        });

    }

    @HostListener('window:beforeunload')
    ngOnDestroy() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

        // Clear all subscriptions
        this.log.trace(`${LOG_PREFIX} Clearing all subscriptions`);
        this._subscriptions.forEach(s => s.unsubscribe());
    }


    /**
     * Initialises the local reference to the displayed loading animation component
     */
    @ViewChild(LoadingAnimationComponent)
    public set animation(animation: LoadingAnimationComponent) {

        this.log.trace(`${LOG_PREFIX} Entering setAnimation()`);

        if (animation) {
            this._animation = animation;
        }
    }

    /**
     * Initialises the local reference to the displayed pagination component
     */
    @ViewChild(PaginationComponent)
    public set pagination(pagination: PaginationComponent) {

        this.log.trace(`${LOG_PREFIX} Entering setPagination()`);

        if (pagination) {
            this._pagination = pagination;
        }
    }

    /**
     * Retrieves and caches Data Forms records
     * @param callback The function to call when done
     */
    private initialiseDataForms(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseDataForms()`);

        // Check if there's a need to initialise the data forms
        this.log.trace(`${LOG_PREFIX} Checking if there's a need to initialise the data forms`);
        if (!this.dataFormId) {

            // There's a need to initialise the data forms
            this.log.trace(`${LOG_PREFIX} There's a need to initialise the data forms`);

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

        } else {

            // There's no need to initialise the data forms
            this.log.trace(`${LOG_PREFIX} There's no need to initialise the data forms`);

            // Return
            this.log.trace(`${LOG_PREFIX} Returning`);
            callback();

        }

    }


    /**
     * Sets the active DataForm if it has not been set in the global filter
     * @param callback The function to call when done
     */
    private initialiseActiveDataForm(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseActiveDataForm()`);

        // Check if there's a need to initialise the active data form
        this.log.trace(`${LOG_PREFIX} Checking if there's a need to initialise the active data form`);
        if (!this.dataFormId) {

            // There's a need to initialise the active data form
            this.log.trace(`${LOG_PREFIX} There's a need to initialise the active data form`);

            // Check if the active DataForm has been set in the global filter
            this.log.trace(`${LOG_PREFIX} Checking if the active DataForm has been set in the global filter`);
            if (this.filterService.filter.activeDataForm) {

                // The active DataForm has been set in the global filter
                this.log.trace(`${LOG_PREFIX} The active DataForm has been set in the global filter`);

                // Check if the active DataForm record exists in the cache
                this.log.trace(`${LOG_PREFIX} Checking if the active DataForm record exists in the cache`);
                if (this.dataFormsDataService.records.some(a => a.id == this.filterService.filter.activeDataForm?.id)) {

                    // The active DataForm record exists in the cache
                    this.log.trace(`${LOG_PREFIX} The active DataForm record exists in the cache`);

                    // Initialisation is valid
                    this.log.trace(`${LOG_PREFIX} Initialisation is valid`);

                } else {

                    // Initialisation is invalid
                    this.log.trace(`${LOG_PREFIX} Initialisation is invalid`);

                    // Get the first DataForm record
                    this.log.trace(`${LOG_PREFIX} Get the first DataForm record`);
                    const dataForm: DataForm | null = this.dataFormsDataService.records.length > 0 ? this.dataFormsDataService.records[0] : null;
                    this.log.trace(`${LOG_PREFIX} First DataForm record = ${JSON.stringify(dataForm)}`);

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

                // Get the first DataForm record
                this.log.trace(`${LOG_PREFIX} Get the first DataForm record`);
                const dataForm: DataForm | null = this.dataFormsDataService.records.length > 0 ? this.dataFormsDataService.records[0] : null;
                this.log.trace(`${LOG_PREFIX} First DataForm record = ${JSON.stringify(dataForm)}`);

                // Update the global filter
                this.log.trace(`${LOG_PREFIX} Updating the global filter`);
                this.filterService.update({ activeDataForm: dataForm });

                // Return
                this.log.trace(`${LOG_PREFIX} Returning`);
                callback();

            }

        } else {

            // There's no need to initialise the active data form
            this.log.trace(`${LOG_PREFIX} There's no need to initialise the active data form`);

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
        copy = Object.assign(copy, { contextId: activeContext?.id, dataFormId: activeDataForm?.id, typeId: this.dataFormElementTypeId });

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

        // Check if there's a need to initialise the form group
        this.log.trace(`${LOG_PREFIX} Checking if there's a need to initialise the form group`);
        if (this.contextId == null || this.dataFormId == null) {

            // There's a need to initialise the form group
            this.log.trace(`${LOG_PREFIX} There's a need to initialise the form group`);

            // Set the default DataForm
            this.log.trace(`${LOG_PREFIX} Setting the default Data Form`);
            if (this.dataFormId) {
                this.dataFormElementsForm.get('dataFormId')?.setValue(this.dataFormId);
            } else {
                const activeDataForm: DataForm | null | undefined = this.filterService.filter.activeDataForm;
                this.dataFormElementsForm.get('dataFormId')?.setValue((activeDataForm && activeDataForm.id) ? activeDataForm.id : null);
            }

            // Return
            this.log.trace(`${LOG_PREFIX} Returning`);
            callback();

        } else {

            // There's no need to initialise the form group
            this.log.trace(`${LOG_PREFIX} There's no need to initialise the form group`);

            // Return
            this.log.trace(`${LOG_PREFIX} Returning`);
            callback();

        }



    }

    /**
     * Initialises the pagination component's initial page size based on the value set in the desired records state
     * @param callback The function to call when done
     */
    private initialisePaginationPageSize(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialisePaginationPageSize()`);

        // Set the initial page size
        this.log.trace(`${LOG_PREFIX} Setting the initial page size`);
        this._pagination.pageSize = this.stateSubject$.value.pageSize ? this.stateSubject$.value.pageSize : 5;

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

                        // Retrieve the Data Form Element Element records corresponding to the passed in state
                        this.log.trace(`${LOG_PREFIX} Retrieving the Data Form Element Element records corresponding to the passed in state`);
                        this.dataFormsElementsDataService
                            .getDataFormsElements(state)
                            .subscribe({
                                next: (s: DataFormElement[]) => {

                                    // Data Form Element records retrieved
                                    this.log.trace(`${LOG_PREFIX} Data Form Element records retrieved`);

                                    this.cd.markForCheck();

                                }
                            });

                    }
                })
        );

        // Transfer control to the callback function
        callback();

    }


    /**
     * Subscribe and react to loading status changes
     * @param callback The function to call when done
     */
    private initialiseLoadingStatusChangesHandler(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseLoadingStatusChangesHandler()`);

        // Subscribe to loading events and propagate them to the loading component.
        this.log.trace(`${LOG_PREFIX} Subscribing to loading status changes`);
        this._subscriptions.push(
            this.contextsDataService.loading$
                .subscribe(
                    (loading) => {

                        // Loading status changed
                        this.log.trace(`${LOG_PREFIX} Loading status changed`);
                        this.log.debug(`${LOG_PREFIX} Loading status = ${loading}`);

                        // Propagate the loading status to the loading animation component
                        this.log.trace(`${LOG_PREFIX} Propagating the loading status to the loading animation component`);
                        this._animation.loading = loading;

                        // Mark the UI as needing to be checked for changes
                        this.log.trace(`${LOG_PREFIX} Marking the UI as needing to be checked for changes`);
                        this.cd.markForCheck();

                    }));



        // Transfer control to the callback function
        callback();

    }


    /**
     * Subscribe and react to total record count changes
     * @param callback The function to call when done
     */
    private initialiseTotalRecordCountsChangesHandler(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseTotalRecordCountsChangesHandler()`);

        // Subscribe to the total record count changes
        this.log.trace(`${LOG_PREFIX} Subscribing to total record counts changes`);
        this._subscriptions.push(
            this.dataFormsElementsDataService.totalRecords$.subscribe(
                (total) => {

                    // Total record count changed
                    this.log.trace(`${LOG_PREFIX} Total record count changed`);
                    this.log.debug(`${LOG_PREFIX} Total record count = ${total}`);

                    // Propagate the total record count to the pagination component
                    this.log.trace(`${LOG_PREFIX} Propagating the total record count to the pagination component`);
                    this._pagination.total = total;
                    this.log.debug(`${LOG_PREFIX} Total Records = ${this._pagination.total}`);

                }));

        // Transfer control to the callback function
        callback();

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

            // Get the Data Form Element record corresponding to the passed in id
            this.log.trace(`${LOG_PREFIX} Getting the Data Form Element record corresponding to the passed in id`);
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
    * Handles Data Form Selection Events
    * @param dataFormElement The Selected Data Form
    */
    onSelect(dataFormElement: DataFormElement) {

        this.log.trace(`${LOG_PREFIX} Entering onSelect()`);
        this.log.debug(`${LOG_PREFIX} Selected Data Form = ${JSON.stringify(dataFormElement)}`);

        // Broadcast the selected Data Form
        this.log.trace(`${LOG_PREFIX} Broadcasting the selected Data Form`);
        this.select.emit(dataFormElement);
    }


    /** 
    * Handles Contexts Checkboxes Check Events
    * @param dataFormElement The Checked Data Form
    */
    onCheck(dataFormElement: DataFormElement) {

        this.log.trace(`${LOG_PREFIX} Entering onCheck()`);
        this.log.debug(`${LOG_PREFIX} Checked Data Form = ${JSON.stringify(dataFormElement)}`);

        // Broadcast the checked Data Form
        this.log.trace(`${LOG_PREFIX} Broadcasting the checked Data Form`);
        this.check.emit(dataFormElement);
    }


    /** 
    * Handles Contexts Checkboxes Uncheck Events
    * @param dataFormElement The Unchecked Data Form
    */
    onUncheck(dataFormElement: DataFormElement) {

        this.log.trace(`${LOG_PREFIX} Entering onUncheck()`);
        this.log.debug(`${LOG_PREFIX} Unchecked Data Form = ${JSON.stringify(dataFormElement)}`);

        // Broadcast the unchecked Data Form
        this.log.trace(`${LOG_PREFIX} Broadcasting the unchecked Data Form`);
        this.uncheck.emit(dataFormElement);

    }

    /**
     * Checks whether a Data Form record is currently selected
     * @param dataFormElement The target Data Form
     * @returns True or false depending on whether the Data Form Element is currently selected or not respectively
     */
    isSelected(dataFormElement: DataFormElement): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isSelected()`);
        this.log.debug(`${LOG_PREFIX} Target Data Form Element = ${JSON.stringify(dataFormElement)}`);

        // Check whether the Data Form Element is currently selected
        const selected: boolean = this.selected.some(a => a.id == dataFormElement.id);
        this.log.debug(`${LOG_PREFIX} Selected = ${selected}`);

        return selected;
    }


    /**
     * Checks whether a Data Form record is currently checked
     * @param dataFormElement The target Data Form
     * @returns True or false depending on whether the Data Form Element is currently checked or not respectively
     */
    isChecked(dataFormElement: DataFormElement): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isChecked()`);
        this.log.debug(`${LOG_PREFIX} Target Data Form Element = ${JSON.stringify(dataFormElement)}`);

        // Check whether the Data Form Element is currently checked
        this.log.trace(`${LOG_PREFIX} Checking whether the Data Form Element is currently checked`);
        const checked: boolean = this.selected.some(a => a.id == dataFormElement.id);
        this.log.debug(`${LOG_PREFIX} Checked = ${checked}`);

        return checked;
    }

    /**
     * Checks whether a Data Form record is desired
     * @param dataFormElement The target Data Form
     * @returns True or false depending on whether the Data Form Element is desired or not respectively
     */
    isDesired(dataFormElement: DataFormElement): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isDesired()`);
        this.log.debug(`${LOG_PREFIX} Target Data Form Element = ${JSON.stringify(dataFormElement)}`);

        // Check whether the Data Form Element is currently desired
        this.log.trace(`${LOG_PREFIX} Checking whether the Data Form Element is currently desired`);
        const desired: boolean = this.desired.some(a => a.id == dataFormElement.id);
        this.log.debug(`${LOG_PREFIX} Desired = ${desired}`);

        return desired;
    }

    /**
     * Checks whether a Data Form record is undesired
     * @param dataFormElement The target Data Form
     * @returns True or false depending on whether the Data Form Element is undesired or not respectively
     */
    isUndesired(dataFormElement: DataFormElement): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isUndesired()`);
        this.log.debug(`${LOG_PREFIX} Target Data Form Element = ${JSON.stringify(dataFormElement)}`);

        // Check whether the Data Form Element is currently undesired
        this.log.trace(`${LOG_PREFIX} Checking whether the Data Form Element is currently undesired`);
        const undesired: boolean = this.undesired.some(a => a.id == dataFormElement.id);
        this.log.debug(`${LOG_PREFIX} Undesired = ${undesired}`);

        return undesired;
    }


    /**
     * Get the form field's value given the form field's name
     * @param fieldName The form field's name
     * @returns The form field's value or an empty string
     */
    private readFormValue(fieldName: string): string {
        return (this.dataFormElementsForm.get(fieldName) && this.dataFormElementsForm.get(fieldName)?.value) ? this.dataFormElementsForm.get(fieldName)?.value : "";
    }

}
