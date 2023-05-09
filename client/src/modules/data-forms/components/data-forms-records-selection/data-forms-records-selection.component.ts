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
import { BehaviorSubject, Subscription, first } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { ContextsDataService } from '@modules/contexts/services/contexts-data.service';
import { Context } from '@modules/contexts/models/context.model';
import { FilterService } from '@app/app-filter.service';
import { DataForm, DataFormState } from '@modules/data-forms/models';
import { DataFormsSelectionDataService } from '@modules/data-forms/services/data-forms-selection-data.service';

const LOG_PREFIX: string = "[Data Forms Records Selection Component]";

@Component({
    selector: 'sb-data-forms-records-selection',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './data-forms-records-selection.component.html',
    styleUrls: ['data-forms-records-selection.component.scss'],
})
export class DataFormsRecordsSelectionComponent implements OnInit, OnDestroy, AfterViewInit {

    // Allows the parent component to inject the desired selection mode: single or multi
    @Input() public selectionMode: string = "single";

    // Allows the parent component to inject the desired Contexts
    @Input() public desired: DataForm[] = [];

    // Allows the parent component to inject the undesired Contexts
    // Ignored if the desired Contexts has been specified
    @Input() public undesired: DataForm[] = [];

    // Allows the parent component to inject the previously selected Contexts
    @Input() public selected: DataForm[] = [];

    // Broadcasts radio buttons selection events
    @Output() public select: EventEmitter<DataForm> = new EventEmitter<DataForm>();

    // Broadcasts checkboxes check events
    @Output() public check: EventEmitter<DataForm> = new EventEmitter<DataForm>();

    // Broadcasts checkboxes uncheck events
    @Output() public uncheck: EventEmitter<DataForm> = new EventEmitter<DataForm>();

    // Keeps a local reference of the currently active context
    private activeContext: Context | null | undefined = null;

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
    private stateSubject$ = new BehaviorSubject<DataFormState>({
        page: 1,
        pageSize: 5,
        searchTerm: null,
        sortColumn: 'name',
        sortDirection: 'asc',
        contextId: null,
        name: null
    });
    readonly state$ = this.stateSubject$.asObservable();

    // Central gathering point for all the component's subscriptions.
    // Makes it efficient to unsubscribe from all subscriptions when the component is destroyed.   
    private _subscriptions: Subscription[] = [];

    // Instantitate a new reactive Form Group
    // This will allow us to define and enforce the validation rules for all the form controls.
    dataFormsForm = new FormGroup({
        contextId: new FormControl<number | null>(null, [
        ]),
    });

    constructor(
        private cd: ChangeDetectorRef,
        public contextsDataService: ContextsDataService,
        public dataFormsDataService: DataFormsSelectionDataService,
        private filterService: FilterService,
        private log: NGXLogger) {

    }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

        // Initialise the active Context from the global filter
        this.initialiseActiveContext(() => {

            // Listen to and react to global context changes
            this.initialiseActiveContextChangesHandler(() => {

                // Preselect the globally selected data form
                this.initialiseSelectedDataForm(() => {

                    // Set the default active Context's id as the contextId in the desired records state
                    this.initialiseDesiredRecordsState(() => {

                        // Preselect the active Context in the data tabulation form
                        this.initialiseFormGroup(() => {

                            // Monitor & react to desired records state changes
                            this.initialiseDesiredRecordsStateChangesHandler(() => {

                                this.log.trace(`${LOG_PREFIX} Get the Active Data Form`);
                                const activeDataForm: DataForm | null | undefined = this.filterService.filter.activeDataForm;
                                this.log.debug(`${LOG_PREFIX} Active Data Form = ${JSON.stringify(activeDataForm)}`);

                                // Mark Init as complete
                                this.log.trace(`${LOG_PREFIX} Init completed`);
                            });
                        });

                    });

                });

            });
        });


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

                            // Make a copy of the desired records state
                            this.log.trace(`${LOG_PREFIX} Making a copy of the desired records state`);
                            let copy: DataFormState = Object.assign({}, this.stateSubject$.value);

                            // Set the active Context as the desired Context
                            this.log.trace(`${LOG_PREFIX} Setting the active Context as the desired Context`);
                            Object.assign(copy, { contextId: this.activeContext?.id });

                            // Broadcast the newly desired record state
                            this.log.trace(`${LOG_PREFIX} Broadcasting the newly desired record state`);
                            this.stateSubject$.next(copy);

                        }
                    }
                })
        );

        // Transfer control to the callback function
        callback();

    }

    /**
     * Presets default selected data form
     * @param callback The function to call when done
     */
    private initialiseSelectedDataForm(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseSelectedDataForm()`);

        // Get the currently active Data Form
        this.log.trace(`${LOG_PREFIX} Getting the currently Active Data Form`);
        const activeDataForm: DataForm | null | undefined = this.filterService.filter.activeDataForm;
        this.log.debug(`${LOG_PREFIX} Active Data Form = ${JSON.stringify(activeDataForm)}`);

        // Preselect the currently active Data Form
        this.log.trace(`${LOG_PREFIX} Preselecting the currently active Data Form`);
        if (activeDataForm && this.selected?.length == 0) {
            this.selected = [activeDataForm]
        }


        // Return
        this.log.trace(`${LOG_PREFIX} Returning`);
        callback();

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

        // Make a copy of the desired records state
        this.log.trace(`${LOG_PREFIX} Making a copy of the desired records state`);
        let copy: DataFormState = Object.assign({}, this.stateSubject$.value);

        // Set the active Context as the desired Context
        this.log.trace(`${LOG_PREFIX} Setting the active Context as the desired Context`);
        Object.assign(copy, { contextId: activeContext?.id });

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

        this.log.trace(`${LOG_PREFIX} Get the Active Context`);
        const activeContext: Context | null | undefined = this.filterService.filter.activeContext;
        this.log.debug(`${LOG_PREFIX} Active Context = ${JSON.stringify(activeContext)}`);

        // Select the active Context
        this.log.trace(`${LOG_PREFIX} Selecting the active Context`);
        this.dataFormsForm.get('contextId')?.setValue((activeContext && activeContext.id) ? activeContext.id : null);


        // Return
        this.log.trace(`${LOG_PREFIX} Returning`);
        callback();

    }




    /**
     * Initialises the pagination component's initial page size based on the value set in the desired records state
     * @param callback The function to call when done
     */
    private initialisePaginationPageSize(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialisePaginationPageSize()`);

        // Set the initial page size
        this.log.trace(`${LOG_PREFIX} Setting the initial page size`);
        this._pagination.pageSize = this.stateSubject$.value.pageSize ? this.stateSubject$.value.pageSize : 20;

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
                        this.log.debug(`${LOG_PREFIX} Desired records state = ${JSON.stringify(state)}`);

                        // Retrieve the Data Forms records corresponding to the passed in state
                        this.log.trace(`${LOG_PREFIX} Retrieving the Data Forms records corresponding to the passed in state`);
                        this.dataFormsDataService
                            .getDataForms(true, state)
                            .pipe(first())
                            .subscribe({
                                next: (s: DataForm[]) => {

                                    // Data Forms records retrieved
                                    this.log.trace(`${LOG_PREFIX} Data Forms records retrieved`);
                                    this.log.debug(`${LOG_PREFIX} Data Forms records = ${JSON.stringify(s)}`);

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
            this.dataFormsDataService.loading$
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
            this.dataFormsDataService.totalRecords$.subscribe(
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
            let copy: DataFormState = Object.assign({}, this.stateSubject$.value);

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
            let copy: DataFormState = Object.assign({}, this.stateSubject$.value);

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
            let copy: DataFormState = Object.assign({}, this.stateSubject$.value);

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
    * @param dataForm The Selected Data Form
    */
    onSelect(dataForm: DataForm) {

        this.log.trace(`${LOG_PREFIX} Entering onSelect()`);
        this.log.debug(`${LOG_PREFIX} Selected Data Form = ${JSON.stringify(dataForm)}`);

        // Broadcast the selected Data Form
        this.log.trace(`${LOG_PREFIX} Broadcasting the selected Data Form`);
        this.select.emit(dataForm);
    }


    /** 
    * Handles Contexts Checkboxes Check Events
    * @param dataForm The Checked Data Form
    */
    onCheck(dataForm: DataForm) {

        this.log.trace(`${LOG_PREFIX} Entering onCheck()`);
        this.log.debug(`${LOG_PREFIX} Checked Data Form = ${JSON.stringify(dataForm)}`);

        // Broadcast the checked Data Form
        this.log.trace(`${LOG_PREFIX} Broadcasting the checked Data Form`);
        this.check.emit(dataForm);
    }


    /** 
    * Handles Contexts Checkboxes Uncheck Events
    * @param dataForm The Unchecked Data Form
    */
    onUncheck(dataForm: DataForm) {

        this.log.trace(`${LOG_PREFIX} Entering onUncheck()`);
        this.log.debug(`${LOG_PREFIX} Unchecked Data Form = ${JSON.stringify(dataForm)}`);

        // Broadcast the unchecked Data Form
        this.log.trace(`${LOG_PREFIX} Broadcasting the unchecked Data Form`);
        this.uncheck.emit(dataForm);

    }

    /**
     * Checks whether a Data Form record is currently selected
     * @param dataForm The target Data Form
     * @returns True or false depending on whether the Data Form is currently selected or not respectively
     */
    isSelected(dataForm: DataForm): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isSelected()`);
        this.log.debug(`${LOG_PREFIX} Target Data Form = ${JSON.stringify(dataForm)}`);

        // Check whether the Data Form is currently selected
        this.log.trace(`${LOG_PREFIX} Checking whether the Data Form is currently selected`);
        const selected: boolean = this.selected.some(a => a.id == dataForm.id);
        this.log.debug(`${LOG_PREFIX} Selected = ${selected}`);

        return selected;
    }


    /**
     * Checks whether a Data Form record is currently checked
     * @param dataForm The target Data Form
     * @returns True or false depending on whether the Data Form is currently checked or not respectively
     */
    isChecked(dataForm: DataForm): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isChecked()`);
        this.log.debug(`${LOG_PREFIX} Target Data Form = ${JSON.stringify(dataForm)}`);

        // Check whether the Data Form is currently checked
        this.log.trace(`${LOG_PREFIX} Checking whether the Data Form is currently checked`);
        const checked: boolean = this.selected.some(a => a.id == dataForm.id);
        this.log.debug(`${LOG_PREFIX} Checked = ${checked}`);

        return checked;
    }

    /**
     * Checks whether a Data Form record is desired
     * @param dataForm The target Data Form
     * @returns True or false depending on whether the Data Form is desired or not respectively
     */
    isDesired(dataForm: DataForm): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isDesired()`);
        this.log.debug(`${LOG_PREFIX} Target Data Form = ${JSON.stringify(dataForm)}`);

        // Check whether the Data Form is currently desired
        this.log.trace(`${LOG_PREFIX} Checking whether the Data Form is currently desired`);
        const desired: boolean = this.desired.some(a => a.id == dataForm.id);
        this.log.debug(`${LOG_PREFIX} Desired = ${desired}`);

        return desired;
    }

    /**
     * Checks whether a Data Form record is undesired
     * @param dataForm The target Data Form
     * @returns True or false depending on whether the Data Form is undesired or not respectively
     */
    isUndesired(dataForm: DataForm): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isUndesired()`);
        this.log.debug(`${LOG_PREFIX} Target Data Form = ${JSON.stringify(dataForm)}`);

        // Check whether the Data Form is currently undesired
        this.log.trace(`${LOG_PREFIX} Checking whether the Data Form is currently undesired`);
        const undesired: boolean = this.undesired.some(a => a.id == dataForm.id);
        this.log.debug(`${LOG_PREFIX} Undesired = ${undesired}`);

        return undesired;
    }


    /**
     * Get the form field's value given the form field's name
     * @param fieldName The form field's name
     * @returns The form field's value or an empty string
     */
    private readFormValue(fieldName: string): string {
        return (this.dataFormsForm.get(fieldName) && this.dataFormsForm.get(fieldName)?.value) ? this.dataFormsForm.get(fieldName)?.value : "";
    }

}
