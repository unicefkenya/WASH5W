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
import { LogicalElementsDataService } from '@modules/logical-elements/services/logical-elements-data.service';
import { FormControl, FormGroup } from '@angular/forms';
import { LogicalElementsTypesDataService } from '@modules/logical-elements-types/services/logical-elements-types-data.service';
import { FilterService } from '@app/app-filter.service';
import { LogicalElement, LogicalElementState } from '@modules/logical-elements/models';
import { LogicalElementType } from '@modules/logical-elements-types/models/logical-element-type.model';
import { ContextsDataService } from '@modules/contexts/services/contexts-data.service';
import { Context } from '@modules/contexts/models/context.model';

const LOG_PREFIX: string = "[Logical Elements Records Selection Component]";

@Component({
    selector: 'sb-logical-elements-records-selection',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './logical-elements-records-selection.component.html',
    styleUrls: ['logical-elements-records-selection.component.scss'],
})
export class LogicalElementsRecordsSelectionComponent implements OnInit, OnDestroy, AfterViewInit {

    // Allows the parent component to inject the desired selection mode: single or multi
    @Input() public selectionMode: string = "single";

    // Allows the parent component to inject the desired Logical Element Types
    @Input() public desiredTypes!: number[];

    // Allows the parent component to inject the desired Logical Element
    @Input() public desired: number[] = [];

    // Allows the parent component to inject the undesired Logical Elements
    // Ignored if the desired Logical Elements has been specified
    @Input() public undesired: number[] = [];

    // Allows the parent component to inject the previously selected Logical Elements
    @Input() public selected: number[] = [];

    // Broadcasts radio buttons selection events
    @Output() public select: EventEmitter<LogicalElement> = new EventEmitter<LogicalElement>();

    // Broadcasts checkboxes check events
    @Output() public check: EventEmitter<LogicalElement> = new EventEmitter<LogicalElement>();

    // Broadcasts checkboxes uncheck events
    @Output() public uncheck: EventEmitter<LogicalElement> = new EventEmitter<LogicalElement>();

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
    private stateSubject$ = new BehaviorSubject<LogicalElementState>({
        page: 1,
        pageSize: 5,
        searchTerm: null,
        sortColumn: 'name',
        sortDirection: 'asc',
        id: null,
        contextId: null,
        typesIds: null,
        no: null,
        name: null
    });
    readonly state$ = this.stateSubject$.asObservable();

    // Central gathering point for all the component's subscriptions.
    // Makes it efficient to unsubscribe from all subscriptions when the component is destroyed.   
    private _subscriptions: Subscription[] = [];

    // Instantitate a new reactive Form Group
    // This will allow us to define and enforce the validation rules for all the form controls.
    logicalElementsForm = new FormGroup({       
        typeId: new FormControl<number | null>(null, [
        ]),
    });

    constructor(
        private cd: ChangeDetectorRef,
        public contextsDataService: ContextsDataService,
        public logicalElementsTypesDataService: LogicalElementsTypesDataService,
        public logicalElementsDataService: LogicalElementsDataService,
        private filterService: FilterService,
        private log: NGXLogger) {

    }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

                // Retrieve and cache Logical Elements Types locally
                this.initialiseLogicalElementsTypes(() => {

                    // Set the default active Logical Element Type if not set
                    this.initialiseActiveLogicalElementType(() => {

                        // Set the default active Logical Element Type's id as the typeId in the desired records state
                        this.initialiseDesiredRecordsState(() => {

                            // Preselect the active Logical Element Type in the data tabulation form
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
     * Initialises the local reference to the displayed loading animation component
     */
    @ViewChild(LoadingAnimationComponent)
    public set animation(animation: LoadingAnimationComponent) {

        this.log.trace(`${LOG_PREFIX} Entering setAnimation()`);

        if (animation) {

            this._animation = animation;

            // Monitor & react to loading status changes
            this.initialiseLoadingStatusChangesHandler(() => {

                // Mark loading animation init as complete
                this.log.trace(`${LOG_PREFIX} Loading animation init completed`);

            });
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

            // Set the initial page size
            this.initialisePaginationPageSize(() => {

                // Monitor & react to total record counts changes
                this.initialiseTotalRecordCountsChangesHandler(() => {

                    // Mark pagination init as complete
                    this.log.trace(`${LOG_PREFIX} Pagination init completed`);

                });
            });

        }
    }

    /**
     * Retrieves and caches Logical Elements Types records
     * @param callback The function to call when done
     */
    private initialiseLogicalElementsTypes(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseLogicalElementsTypes()`);

        // Retrieve and cache all the Logical Elements Types records
        this.log.trace(`${LOG_PREFIX} Retrieving and caching all the Logical Elements Types records`);
        this.logicalElementsTypesDataService
            .getLogicalElementsTypes(true, {
                searchTerm: null,
                page: null,
                pageSize: null,
                sortColumn: 'name',
                sortDirection: 'asc',
                name: null,
                plural: null
            })
            .pipe(first()) // This will automatically complete (and therefore unsubscribe) after the first value has been emitted.
            .subscribe({
                next: (logicalElementsTypes: LogicalElementType[]) => {

                    // Logical Elements Types successfully retrieved and cached
                    this.log.debug(`${LOG_PREFIX} ${logicalElementsTypes.length} Logical Elements Types(s) retrieved and cached`);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                },

                error: (err: any) => {

                    // Logical Elements Types retrieval failed
                    this.log.error(`${LOG_PREFIX} Logical Elements Types retrieval failed`);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                }
            });

    }


    /**
     * Sets the active Logical Element Type if it has not been set in the global filter
     * @param callback The function to call when done
     */
    private initialiseActiveLogicalElementType(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseActiveLogicalElementType()`);

        // Check if the active Logical Element Type has been set in the global filter
        this.log.trace(`${LOG_PREFIX} Checking if the active Logical Element Type has been set in the global filter`);
        if (this.filterService.filter.activeLogicalElementType) {

            // The active Logical Element Type has been set in the global filter
            this.log.trace(`${LOG_PREFIX} The active Logical Element Type has been set in the global filter`);

            // Check if the active Logical Element Type record exists in the cache
            this.log.trace(`${LOG_PREFIX} Checking if the active Logical Element Type record exists in the cache`);
            if (this.logicalElementsTypesDataService.records.some(a => a.id == this.filterService.filter.activeLogicalElementType?.id)) {

                // The active Logical Element Type record exists in the cache
                this.log.trace(`${LOG_PREFIX} The active Logical Element Type record exists in the cache`);

                // Initialisation is valid
                this.log.trace(`${LOG_PREFIX} Initialisation is valid`);

            } else {

                // Initialisation is invalid
                this.log.trace(`${LOG_PREFIX} Initialisation is invalid`);

                // Get the first Logical Element Type record
                this.log.trace(`${LOG_PREFIX} Get the first Logical Element Type record`);
                const logicalElementType: LogicalElementType | null = this.logicalElementsTypesDataService.records.length > 0 ? this.logicalElementsTypesDataService.records[0] : null;
                this.log.trace(`${LOG_PREFIX} First Logical Element Type record = ${JSON.stringify(logicalElementType)}`);

                // Update the global filter
                this.log.trace(`${LOG_PREFIX} Updating the global filter`);
                this.filterService.update({ activeLogicalElementType: logicalElementType });

            }

            // Return
            this.log.trace(`${LOG_PREFIX} Returning`);
            callback();

        } else {

            // The active Logical Element Type has not been set in the global filter
            this.log.trace(`${LOG_PREFIX} The active Logical Element Type has not been set in the global filter`);

            // Get the first Logical Element Type record
            this.log.trace(`${LOG_PREFIX} Get the first Logical Element Type record`);
            const logicalElementType: LogicalElementType | null = this.logicalElementsTypesDataService.records.length > 0 ? this.logicalElementsTypesDataService.records[0] : null;
            this.log.trace(`${LOG_PREFIX} First Logical Element Type record = ${JSON.stringify(logicalElementType)}`);

            // Update the global filter
            this.log.trace(`${LOG_PREFIX} Updating the global filter`);
            this.filterService.update({ activeLogicalElementType: logicalElementType });

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

        // Get the globally active context
        this.log.trace(`${LOG_PREFIX} Getting the globally active context`);
        const activeContext: Context | null | undefined = this.filterService.filter.activeContext;
        this.log.debug(`${LOG_PREFIX} Active Context = ${JSON.stringify(activeContext)}`);
         
        // Get the globally active logical element type
        this.log.trace(`${LOG_PREFIX} Getting the globally active logical element type`);
        const activeLogicalElementType: LogicalElementType | null | undefined =  this.filterService.filter.activeLogicalElementType;
        this.log.debug(`${LOG_PREFIX} Active Logical Element Type = ${JSON.stringify(activeLogicalElementType)}`);

        // Make a copy of the desired records state
        this.log.trace(`${LOG_PREFIX} Making a copy of the desired records state`);
        let copy: LogicalElementState = Object.assign({}, this.stateSubject$.value);

        // Update the copied state's contextId and typesIds details
        this.log.trace(`${LOG_PREFIX} Updating the copied state's contextId and typesIds details`);
        Object.assign(copy, { contextId: activeContext?.id, typesIds: (this.desiredTypes?.length > 0 )? this.desiredTypes : (activeLogicalElementType && activeLogicalElementType.id ? [activeLogicalElementType.id] : null) });

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

        this.log.trace(`${LOG_PREFIX} Get the Active Logical Element Type`);
        const activeLogicalElementType: LogicalElementType | null | undefined = this.filterService.filter.activeLogicalElementType;
        this.log.debug(`${LOG_PREFIX} Active Logical Element Type = ${JSON.stringify(activeLogicalElementType)}`);

        // Select the active Logical Element Type
        this.log.trace(`${LOG_PREFIX} Selecting the active Logical Element Type`);
        this.logicalElementsForm.get('typeId')?.setValue((activeLogicalElementType && activeLogicalElementType.id) ? activeLogicalElementType.id : null);

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

                        // Retrieve the Logical Elements records corresponding to the passed in state
                        this.log.trace(`${LOG_PREFIX} Retrieving the Logical Elements records corresponding to the passed in state`);
                        this.logicalElementsDataService
                            .getLogicalElements(true, state)
                            .pipe(first())
                            .subscribe({
                                next: (s: LogicalElement[]) => {

                                    // Logical Elements records retrieved
                                    this.log.trace(`${LOG_PREFIX} Logical Elements records retrieved`);
                                    this.log.debug(`${LOG_PREFIX} Logical Elements records = ${JSON.stringify(s)}`);

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
            this.logicalElementsDataService.loading$
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
            this.logicalElementsDataService.totalRecords$.subscribe(
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
     * Handles Logical Element Type change events
     */
    public onLogicalElementTypeChange(): void {

        this.log.trace(`${LOG_PREFIX} Entering onLogicalElementTypeChange()`);


        // Get the selected Logical Element Type Id
        this.log.trace(`${LOG_PREFIX} Getting the selected Logical Element Type Id`);
        const typeId: number | null | undefined = this.logicalElementsForm.get('typeId')?.value
        this.log.debug(`${LOG_PREFIX} Logical Element Type Id = ${typeId}`);

        // Check if the specified Logical Element Type is different from the current Logical Element Type
        this.log.trace(`${LOG_PREFIX} Check if the specified Logical Element Type is different from the current Logical Element Type`);

        if (!(this.stateSubject$.value.typesIds && this.stateSubject$.value.typesIds?.some(t => t == typeId))) {

            // The specified Logical Element Type is different from the current Logical Element Type
            this.log.trace(`${LOG_PREFIX} The specified Logical Element Type is different from the current Logical Element Type`);

            // Make a copy of the desired records state
            this.log.trace(`${LOG_PREFIX} Making a copy of the desired records state`);
            let copy: LogicalElementState = Object.assign({}, this.stateSubject$.value);

            // Update the copy of the desired records state
            this.log.trace(`${LOG_PREFIX} Updating the copy of the desired records state`);
            Object.assign(copy, { typesIds: [typeId] });

            // Broadcast the newly desired record state
            this.log.trace(`${LOG_PREFIX} Broadcasting the newly desired record state`);
            this.stateSubject$.next(copy);

        } else {

            // The specified Logical Element Type is not different from the current Logical Element Type
            this.log.trace(`${LOG_PREFIX} The specified Logical Element Type is not different from the current Logical Element Type`);

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
            let copy: LogicalElementState = Object.assign({}, this.stateSubject$.value);

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
            let copy: LogicalElementState = Object.assign({}, this.stateSubject$.value);

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
            let copy: LogicalElementState = Object.assign({}, this.stateSubject$.value);

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
    * Handles Logical Element Selection Events
    * @param logicalElement The Selected Logical Element
    */
    onSelect(logicalElement: LogicalElement) {

        this.log.trace(`${LOG_PREFIX} Entering onSelect()`);
        this.log.debug(`${LOG_PREFIX} Selected Logical Element = ${JSON.stringify(logicalElement)}`);

        // Broadcast the selected Logical Element
        this.log.trace(`${LOG_PREFIX} Broadcasting the selected Logical Element`);
        this.select.emit(logicalElement);
    }


    /** 
    * Handles Logical Elements Checkboxes Check Events
    * @param logicalElement The Checked Logical Element
    */
    onCheck(logicalElement: LogicalElement) {

        this.log.trace(`${LOG_PREFIX} Entering onCheck()`);
        this.log.debug(`${LOG_PREFIX} Checked Logical Element = ${JSON.stringify(logicalElement)}`);

        // Broadcast the checked Logical Element
        this.log.trace(`${LOG_PREFIX} Broadcasting the checked Logical Element`);
        this.check.emit(logicalElement);
    }


    /** 
    * Handles Logical Elements Checkboxes Uncheck Events
    * @param logicalElement The Unchecked Logical Element
    */
    onUncheck(logicalElement: LogicalElement) {

        this.log.trace(`${LOG_PREFIX} Entering onUncheck()`);
        this.log.debug(`${LOG_PREFIX} Unchecked Logical Element = ${JSON.stringify(logicalElement)}`);

        // Broadcast the unchecked Logical Element
        this.log.trace(`${LOG_PREFIX} Broadcasting the unchecked Logical Element`);
        this.uncheck.emit(logicalElement);

    }

    /**
     * Checks whether a Logical Element record is currently selected
     * @param logicalElement The target Logical Element
     * @returns True or false depending on whether the Logical Element is currently selected or not respectively
     */
    isSelected(logicalElement: LogicalElement): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isSelected()`);
        this.log.debug(`${LOG_PREFIX} Target Logical Element = ${JSON.stringify(logicalElement)}`);

        // Check whether the Logical Element is currently selected
        this.log.trace(`${LOG_PREFIX} Checking whether the Logical Element is currently selected`);
        const selected: boolean = this.selected.some(id => id == logicalElement.id);
        this.log.debug(`${LOG_PREFIX} Selected = ${selected}`);

        return selected;
    }


    /**
     * Checks whether a Logical Element record is currently checked
     * @param logicalElement The target Logical Element
     * @returns True or false depending on whether the Logical Element is currently checked or not respectively
     */
    isChecked(logicalElement: LogicalElement): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isChecked()`);
        this.log.debug(`${LOG_PREFIX} Target Logical Element = ${JSON.stringify(logicalElement)}`);

        // Check whether the Logical Element is currently checked
        this.log.trace(`${LOG_PREFIX} Checking whether the Logical Element is currently checked`);
        const checked: boolean = this.selected.some(id => id == logicalElement.id);
        this.log.debug(`${LOG_PREFIX} Checked = ${checked}`);

        return checked;
    }

    /**
     * Checks whether a Logical Element record is desired
     * @param logicalElement The target Logical Element
     * @returns True or false depending on whether the Logical Element is desired or not respectively
     */
    isDesired(logicalElement: LogicalElement): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isDesired()`);
        this.log.debug(`${LOG_PREFIX} Target Logical Element = ${JSON.stringify(logicalElement)}`);

        // Check whether the Logical Element is currently desired
        this.log.trace(`${LOG_PREFIX} Checking whether the Logical Element is currently desired`);
        const desired: boolean = this.desired.some(id => id == logicalElement.id);
        this.log.debug(`${LOG_PREFIX} Desired = ${desired}`);

        return desired;
    }

    /**
     * Checks whether a Logical Element record is undesired
     * @param logicalElement The target Logical Element
     * @returns True or false depending on whether the Logical Element is undesired or not respectively
     */
    isUndesired(logicalElement: LogicalElement): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isUndesired()`);
        this.log.debug(`${LOG_PREFIX} Target Logical Element = ${JSON.stringify(logicalElement)}`);

        // Check whether the Logical Element is currently undesired
        this.log.trace(`${LOG_PREFIX} Checking whether the Logical Element is currently undesired`);
        const undesired: boolean = this.undesired.some(id => id == logicalElement.id);
        this.log.debug(`${LOG_PREFIX} Undesired = ${undesired}`);

        return undesired;
    }



}
