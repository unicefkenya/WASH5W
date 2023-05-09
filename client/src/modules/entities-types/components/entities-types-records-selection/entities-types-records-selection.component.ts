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
import { EntityType, EntityTypeState } from '@modules/entities-types/models';
import { EntitiesTypesSelectionDataService } from '@modules/entities-types/services/entities-types-selection-data.service';

const LOG_PREFIX: string = "[Entities Types Records Selection Component]";

@Component({
    selector: 'sb-entities-types-records-selection',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './entities-types-records-selection.component.html',
    styleUrls: ['entities-types-records-selection.component.scss'],
})
export class EntitiesTypesRecordsSelectionComponent implements OnInit, OnDestroy, AfterViewInit {

    // Allows the parent component to inject the desired selection mode: single or multi
    @Input() public selectionMode: string = "single";

    // Allows the parent component to inject the desired Contexts
    @Input() public desired: EntityType[] = [];    

    // Allows the parent component to inject the undesired Contexts
    // Ignored if the desired Contexts has been specified
    @Input() public undesired: EntityType[] = [];

    // Allows the parent component to inject the previously selected Contexts
    @Input() public selected: EntityType[] = [];

    // Broadcasts radio buttons selection events
    @Output() public select: EventEmitter<EntityType> = new EventEmitter<EntityType>();

    // Broadcasts checkboxes check events
    @Output() public check: EventEmitter<EntityType> = new EventEmitter<EntityType>();

    // Broadcasts checkboxes uncheck events
    @Output() public uncheck: EventEmitter<EntityType> = new EventEmitter<EntityType>();     

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
    private stateSubject$ = new BehaviorSubject<EntityTypeState>({
        page: 1,
        pageSize: 10,
        searchTerm: null,
        sortColumn: 'name',
        sortDirection: 'asc',
        id: null,
        contextId: null,
        name: null,
        plural: null
      });
    readonly state$ = this.stateSubject$.asObservable();

    // Central gathering point for all the component's subscriptions.
    // Makes it efficient to unsubscribe from all subscriptions when the component is destroyed.   
    private _subscriptions: Subscription[] = [];

    // Instantitate a new reactive Form Group
    // This will allow us to define and enforce the validation rules for all the form controls.
    entitiesTypesForm = new FormGroup({
        contextId: new FormControl<number | null>(null, [
        ]),
    });

    constructor(
        private cd: ChangeDetectorRef,
        public contextsDataService: ContextsDataService,
        public entitiesTypesDataService: EntitiesTypesSelectionDataService,
        private filterService: FilterService,
        private log: NGXLogger) {

    }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

        // Retrieve and cache Contexts locally
        this.initialiseContexts(() => {

            // Set the default active Context if not set
            this.initialiseActiveContext(() => {

                // Set the default active Context's id as the contextId in the desired records state
                this.initialiseDesiredRecordsState(() => {

                    // Preselect the active Context in the data tabulation form
                    this.initialiseFormGroup(() => {

                        // Monitor & react to desired records state changes
                        this.initialiseDesiredRecordsStateChangesHandler(() => {

                            // Mark Init as complete
                            this.log.trace(`${LOG_PREFIX} Init completed`);
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
     * Retrieves and caches Contexts records
     * @param callback The function to call when done
     */
    private initialiseContexts(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseContexts()`);

        // Retrieve and cache all the Contexts records
        this.log.trace(`${LOG_PREFIX} Retrieving and caching all the Contexts records`);
        this.contextsDataService
            .getContexts(true, {
                searchTerm: null,
                page: null,
                pageSize: null,
                sortColumn: 'name',
                sortDirection: 'asc',
                ids: null,
                name: null,
                abbreviation: null,
              })
            .pipe(first()) // This will automatically complete (and therefore unsubscribe) after the first value has been emitted.
            .subscribe({
                next: (contexts: Context[]) => {

                    // Contexts successfully retrieved and cached
                    this.log.debug(`${LOG_PREFIX} ${contexts.length} Context(s) retrieved and cached`);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                },

                error: (err: any) => {

                    // Contexts retrieval failed
                    this.log.error(`${LOG_PREFIX} Contexts retrieval failed`);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                }
            });

    }


    /**
     * Sets the active Context if it has not been set in the global filter
     * @param callback The function to call when done
     */
    private initialiseActiveContext(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseActiveContext()`);

        // Check if the active Context has been set in the global filter
        this.log.trace(`${LOG_PREFIX} Checking if the active Context has been set in the global filter`);
        if (this.filterService.filter.activeContext) {

            // The active Context has been set in the global filter
            this.log.trace(`${LOG_PREFIX} The active Context has been set in the global filter`);

            // Check if the active Context record exists in the cache
            this.log.trace(`${LOG_PREFIX} Checking if the active Context record exists in the cache`);
            if (this.contextsDataService.records.some(a => a.id == this.filterService.filter.activeContext?.id)) {

                // The active Context record exists in the cache
                this.log.trace(`${LOG_PREFIX} The active Context record exists in the cache`);

                // Initialisation is valid
                this.log.trace(`${LOG_PREFIX} Initialisation is valid`);

            } else {

                // Initialisation is invalid
                this.log.trace(`${LOG_PREFIX} Initialisation is invalid`);

                // Get the first Context record
                this.log.trace(`${LOG_PREFIX} Get the first Context record`);
                const context: Context | null = this.contextsDataService.records.length > 0 ? this.contextsDataService.records[0] : null;
                this.log.trace(`${LOG_PREFIX} First Context record = ${JSON.stringify(context)}`);

                // Update the global filter
                this.log.trace(`${LOG_PREFIX} Updating the global filter`);
                this.filterService.update({ activeContext: context });

            }

            // Return
            this.log.trace(`${LOG_PREFIX} Returning`);
            callback();

        } else {

            // The active Context has not been set in the global filter
            this.log.trace(`${LOG_PREFIX} The active Context has not been set in the global filter`);

            // Get the first Context record
            this.log.trace(`${LOG_PREFIX} Get the first Context record`);
            const context: Context | null = this.contextsDataService.records.length > 0 ? this.contextsDataService.records[0] : null;
            this.log.trace(`${LOG_PREFIX} First Context record = ${JSON.stringify(context)}`);

            // Update the global filter
            this.log.trace(`${LOG_PREFIX} Updating the global filter`);
            this.filterService.update({ activeContext: context });

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

        // Make a copy of the desired records state
        this.log.trace(`${LOG_PREFIX} Making a copy of the desired records state`);
        let copy: EntityTypeState = Object.assign({}, this.stateSubject$.value);

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
        this.entitiesTypesForm.get('contextId')?.setValue((activeContext && activeContext.id) ? activeContext.id : null);


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

                        // Retrieve the Entities Types records corresponding to the passed in state
                        this.log.trace(`${LOG_PREFIX} Retrieving the Entities Types records corresponding to the passed in state`);
                        this.entitiesTypesDataService
                            .getEntitiesTypes(true,state)
                            .pipe(first())
                            .subscribe({
                                next: (s: EntityType[]) => {

                                    // Entities Types records retrieved
                                    this.log.trace(`${LOG_PREFIX} Entities Types records retrieved`);
                                    this.log.debug(`${LOG_PREFIX} Entities Types records = ${JSON.stringify(s)}`);

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
            this.entitiesTypesDataService.loading$
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
            this.entitiesTypesDataService.totalRecords$.subscribe(
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
            let copy: EntityTypeState = Object.assign({}, this.stateSubject$.value);

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
            let copy: EntityTypeState = Object.assign({}, this.stateSubject$.value);

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
            let copy: EntityTypeState = Object.assign({}, this.stateSubject$.value);

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
    * Handles Entity Type Selection Events
    * @param entityType The Selected Entity Type
    */
     onSelect(entityType: EntityType) {

        this.log.trace(`${LOG_PREFIX} Entering onSelect()`);
        this.log.debug(`${LOG_PREFIX} Selected Entity Type = ${JSON.stringify(entityType)}`);

        // Broadcast the selected Entity Type
        this.log.trace(`${LOG_PREFIX} Broadcasting the selected Entity Type`);
        this.select.emit(entityType);
    }


    /** 
    * Handles Contexts Checkboxes Check Events
    * @param entityType The Checked Entity Type
    */
    onCheck(entityType: EntityType) {

        this.log.trace(`${LOG_PREFIX} Entering onCheck()`);
        this.log.debug(`${LOG_PREFIX} Checked Entity Type = ${JSON.stringify(entityType)}`);

        // Broadcast the checked Entity Type
        this.log.trace(`${LOG_PREFIX} Broadcasting the checked Entity Type`);
        this.check.emit(entityType);
    }


    /** 
    * Handles Contexts Checkboxes Uncheck Events
    * @param entityType The Unchecked Entity Type
    */
    onUncheck(entityType: EntityType) {

        this.log.trace(`${LOG_PREFIX} Entering onUncheck()`);
        this.log.debug(`${LOG_PREFIX} Unchecked Entity Type = ${JSON.stringify(entityType)}`);

        // Broadcast the unchecked Entity Type
        this.log.trace(`${LOG_PREFIX} Broadcasting the unchecked Entity Type`);
        this.uncheck.emit(entityType);

    }

    /**
     * Checks whether a Entity Type record is currently selected
     * @param entityType The target Entity Type
     * @returns True or false depending on whether the Entity Type is currently selected or not respectively
     */
    isSelected(entityType: EntityType): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isSelected()`);
        this.log.debug(`${LOG_PREFIX} Target Entity Type = ${JSON.stringify(entityType)}`);

        // Check whether the Entity Type is currently selected
        this.log.trace(`${LOG_PREFIX} Checking whether the Entity Type is currently selected`);
        const selected: boolean = this.selected.some(a => a.id == entityType.id);
        this.log.debug(`${LOG_PREFIX} Selected = ${selected}`);

        return selected;
    }


    /**
     * Checks whether a Entity Type record is currently checked
     * @param entityType The target Entity Type
     * @returns True or false depending on whether the Entity Type is currently checked or not respectively
     */    
    isChecked(entityType: EntityType): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isChecked()`);
        this.log.debug(`${LOG_PREFIX} Target Entity Type = ${JSON.stringify(entityType)}`);

        // Check whether the Entity Type is currently checked
        this.log.trace(`${LOG_PREFIX} Checking whether the Entity Type is currently checked`);
        const checked: boolean = this.selected.some(a => a.id == entityType.id);
        this.log.debug(`${LOG_PREFIX} Checked = ${checked}`);

        return checked;
    }

    /**
     * Checks whether a Entity Type record is desired
     * @param entityType The target Entity Type
     * @returns True or false depending on whether the Entity Type is desired or not respectively
     */
     isDesired(entityType: EntityType): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isDesired()`);
        this.log.debug(`${LOG_PREFIX} Target Entity Type = ${JSON.stringify(entityType)}`);

        // Check whether the Entity Type is currently desired
        this.log.trace(`${LOG_PREFIX} Checking whether the Entity Type is currently desired`);
        const desired: boolean = this.desired.some(a => a.id == entityType.id);
        this.log.debug(`${LOG_PREFIX} Desired = ${desired}`);

        return desired;
    }    

    /**
     * Checks whether a Entity Type record is undesired
     * @param entityType The target Entity Type
     * @returns True or false depending on whether the Entity Type is undesired or not respectively
     */
     isUndesired(entityType: EntityType): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isUndesired()`);
        this.log.debug(`${LOG_PREFIX} Target Entity Type = ${JSON.stringify(entityType)}`);

        // Check whether the Entity Type is currently undesired
        this.log.trace(`${LOG_PREFIX} Checking whether the Entity Type is currently undesired`);
        const undesired: boolean = this.undesired.some(a => a.id == entityType.id);
        this.log.debug(`${LOG_PREFIX} Undesired = ${undesired}`);

        return undesired;
    }    


    /**
     * Get the form field's value given the form field's name
     * @param fieldName The form field's name
     * @returns The form field's value or an empty string
     */
    private readFormValue(fieldName: string): string {
        return (this.entitiesTypesForm.get(fieldName) && this.entitiesTypesForm.get(fieldName)?.value) ? this.entitiesTypesForm.get(fieldName)?.value : "";
    }
    
}
