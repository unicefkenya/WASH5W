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
import { EntitiesDataService } from '@modules/entities/services/entities-data.service';
import { FormControl, FormGroup } from '@angular/forms';
import { EntitiesTypesDataService } from '@modules/entities-types/services/entities-types-data.service';
import { FilterService } from '@app/app-filter.service';
import { Entity, EntityState } from '@modules/entities/models';
import { EntityType } from '@modules/entities-types/models/entity-type.model';

const LOG_PREFIX: string = "[Entities Records Selection Component]";

@Component({
    selector: 'sb-entities-records-selection',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './entities-records-selection.component.html',
    styleUrls: ['entities-records-selection.component.scss'],
})
export class EntitiesRecordsSelectionComponent implements OnInit, OnDestroy, AfterViewInit {

    // Allows the parent component to inject the desired selection mode: single or multi
    @Input() public selectionMode: string = "single";

    // Allows the parent component to inject the desired Entity Types
    @Input() public desiredTypes!: number[];

    // Allows the parent component to inject the desired Entity
    @Input() public desired: number[] = [];

    // Allows the parent component to inject the undesired Entities
    // Ignored if the desired Entities has been specified
    @Input() public undesired: number[] = [];

    // Allows the parent component to inject the previously selected Entities
    @Input() public selected: number[] = [];

    // Broadcasts radio buttons selection events
    @Output() public select: EventEmitter<Entity> = new EventEmitter<Entity>();

    // Broadcasts checkboxes check events
    @Output() public check: EventEmitter<Entity> = new EventEmitter<Entity>();

    // Broadcasts checkboxes uncheck events
    @Output() public uncheck: EventEmitter<Entity> = new EventEmitter<Entity>();

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
    private stateSubject$ = new BehaviorSubject<EntityState>({
        page: 1,
        pageSize: 5,
        searchTerm: null,
        sortColumn: 'name',
        sortDirection: 'asc',
        id: null,
        typeId: null,
        locationId: null,
        name: null
    });
    readonly state$ = this.stateSubject$.asObservable();

    // Central gathering point for all the component's subscriptions.
    // Makes it efficient to unsubscribe from all subscriptions when the component is destroyed.   
    private _subscriptions: Subscription[] = [];

    // Instantitate a new reactive Form Group
    // This will allow us to define and enforce the validation rules for all the form controls.
    entitiesForm = new FormGroup({
        typeId: new FormControl<number | null>(null, [
        ]),
    });

    constructor(
        private cd: ChangeDetectorRef,
        public entitiesTypesDataService: EntitiesTypesDataService,
        public entitiesDataService: EntitiesDataService,
        private filterService: FilterService,
        private log: NGXLogger) {

    }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

        // Retrieve and cache Entities Types locally
        this.initialiseEntitiesTypes(() => {

            // Set the default active Entity Type if not set
            this.initialiseActiveEntityType(() => {

                // Set the default active Entity Type's id as the typeId in the desired records state
                this.initialiseDesiredRecordsState(() => {

                    // Preselect the active Entity Type in the data tabulation form
                    this.initialiseFormGroup(() => {

                        // Monitor & react to desired records state changes
                        this.initialiseDesiredRecordsStateChangesHandler(() => {

                            // Mark Init as complete
                            this.log.trace(`${LOG_PREFIX} Init completed`);
                            this.initialised = true;

                            this.cd.detectChanges();
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
     * Retrieves and caches Entities Types records
     * @param callback The function to call when done
     */
    private initialiseEntitiesTypes(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseEntitiesTypes()`);

        // Retrieve and cache all the Entities Types records
        this.log.trace(`${LOG_PREFIX} Retrieving and caching all the Entities Types records`);
        this.entitiesTypesDataService
            .getEntitiesTypes(true, {
                page: null,
                pageSize: null,
                searchTerm: null,
                sortColumn: 'name',
                sortDirection: 'asc',
                id: null,
                contextId: null,
                name: null,
                plural: null 
            })
            .pipe(first()) // This will automatically complete (and therefore unsubscribe) after the first value has been emitted.
            .subscribe({
                next: (entitiesTypes: EntityType[]) => {

                    // Entities Types successfully retrieved and cached
                    this.log.debug(`${LOG_PREFIX} ${entitiesTypes.length} Entities Types(s) retrieved and cached`);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                },

                error: (err: any) => {

                    // Entities Types retrieval failed
                    this.log.error(`${LOG_PREFIX} Entities Types retrieval failed`);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                }
            });

    }


    /**
     * Sets the active Entity Type if it has not been set in the global filter
     * @param callback The function to call when done
     */
    private initialiseActiveEntityType(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseActiveEntityType()`);

        // Check if the active Entity Type has been set in the global filter
        this.log.trace(`${LOG_PREFIX} Checking if the active Entity Type has been set in the global filter`);
        if (this.filterService.filter.activeEntityType) {

            // The active Entity Type has been set in the global filter
            this.log.trace(`${LOG_PREFIX} The active Entity Type has been set in the global filter`);

            // Check if the active Entity Type record exists in the cache
            this.log.trace(`${LOG_PREFIX} Checking if the active Entity Type record exists in the cache`);
            if (this.entitiesTypesDataService.records.some(a => a.id == this.filterService.filter.activeEntityType?.id)) {

                // The active Entity Type record exists in the cache
                this.log.trace(`${LOG_PREFIX} The active Entity Type record exists in the cache`);

                // Initialisation is valid
                this.log.trace(`${LOG_PREFIX} Initialisation is valid`);

            } else {

                // Initialisation is invalid
                this.log.trace(`${LOG_PREFIX} Initialisation is invalid`);

                // Get the first Entity Type record
                this.log.trace(`${LOG_PREFIX} Get the first Entity Type record`);
                const entityType: EntityType | null = this.entitiesTypesDataService.records.length > 0 ? this.entitiesTypesDataService.records[0] : null;
                this.log.trace(`${LOG_PREFIX} First Entity Type record = ${JSON.stringify(entityType)}`);

                // Update the global filter
                this.log.trace(`${LOG_PREFIX} Updating the global filter`);
                this.filterService.update({ activeEntityType: entityType });

            }

            // Return
            this.log.trace(`${LOG_PREFIX} Returning`);
            callback();

        } else {

            // The active Entity Type has not been set in the global filter
            this.log.trace(`${LOG_PREFIX} The active Entity Type has not been set in the global filter`);

            // Get the first Entity Type record
            this.log.trace(`${LOG_PREFIX} Get the first Entity Type record`);
            const entityType: EntityType | null = this.entitiesTypesDataService.records.length > 0 ? this.entitiesTypesDataService.records[0] : null;
            this.log.trace(`${LOG_PREFIX} First Entity Type record = ${JSON.stringify(entityType)}`);

            // Update the global filter
            this.log.trace(`${LOG_PREFIX} Updating the global filter`);
            this.filterService.update({ activeEntityType: entityType });

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

        // Make a copy of the desired records state
        this.log.trace(`${LOG_PREFIX} Making a copy of the desired records state`);
        let copy: EntityState = Object.assign({}, this.stateSubject$.value);

        // Set the active target Entity Types based on whether the window has been previously initialised
        this.log.trace(`${LOG_PREFIX} Setting the active target Entity Types based on whether the window has been previously initialised`);
        if (this.initialised) {

            this.log.trace(`${LOG_PREFIX} Get the Active Entity Type`);
            const activeEntityType: EntityType | null | undefined = this.filterService.filter.activeEntityType;
            this.log.debug(`${LOG_PREFIX} Active Entity Type = ${JSON.stringify(activeEntityType)}`);

            Object.assign(copy, { typeId: activeEntityType && activeEntityType.id ? [activeEntityType.id] : null });

        } else {

            if (this.desiredTypes) {
                Object.assign(copy, { typeId: this.desiredTypes });
            }
        }


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

        this.log.trace(`${LOG_PREFIX} Get the Active Entity Type`);
        const activeEntityType: EntityType | null | undefined = this.filterService.filter.activeEntityType;
        this.log.debug(`${LOG_PREFIX} Active Entity Type = ${JSON.stringify(activeEntityType)}`);

        // Select the active Entity Type
        this.log.trace(`${LOG_PREFIX} Selecting the active Entity Type`);
        this.entitiesForm.get('typeId')?.setValue((activeEntityType && activeEntityType.id) ? activeEntityType.id : null);


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

                        // Retrieve the Entities records corresponding to the passed in state
                        this.log.trace(`${LOG_PREFIX} Retrieving the Entities records corresponding to the passed in state`);
                        this.entitiesDataService
                            .getEntities(true, state)
                            .pipe(first())
                            .subscribe({
                                next: (s: Entity[]) => {

                                    // Entities records retrieved
                                    this.log.trace(`${LOG_PREFIX} Entities records retrieved`);
                                    this.log.debug(`${LOG_PREFIX} Entities records = ${JSON.stringify(s)}`);

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
            this.entitiesDataService.loading$
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
            this.entitiesDataService.totalRecords$.subscribe(
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
     * Handles Entity Type change events
     */
     public onEntityTypeChange(): void {

        this.log.trace(`${LOG_PREFIX} Entering onEntityTypeChange()`);


        // Get the selected Entity Type Id
        this.log.trace(`${LOG_PREFIX} Getting the selected Entity Type Id`);
        const typeId: number | null | undefined = this.entitiesForm.get('typeId')?.value
        this.log.debug(`${LOG_PREFIX} Entity Type Id = ${typeId}`);

        // Check if the specified Entity Type is different from the current Entity Type
        this.log.trace(`${LOG_PREFIX} Check if the specified Entity Type is different from the current Entity Type`);

        if (this.stateSubject$.value.typeId != typeId) {

            // The specified Entity Type is different from the current Entity Type
            this.log.trace(`${LOG_PREFIX} The specified Entity Type is different from the current Entity Type`);

            // Update the global filter
            this.log.trace(`${LOG_PREFIX} Updating the global filter`);
            this.filterService.update({ activeEntityType: this.entitiesTypesDataService.records.find(a => a.id == typeId) });

            // Make a copy of the desired records state
            this.log.trace(`${LOG_PREFIX} Making a copy of the desired records state`);
            let copy: EntityState = Object.assign({}, this.stateSubject$.value);

            // Update the copy of the desired records state
            this.log.trace(`${LOG_PREFIX} Updating the copy of the desired records state`);
            Object.assign(copy, { typeId: typeId, page: 1 });

            // Broadcast the newly desired record state
            this.log.trace(`${LOG_PREFIX} Broadcasting the newly desired record state`);
            this.stateSubject$.next(copy);

        } else {

            // The specified Entity Type is not different from the current Entity Type
            this.log.trace(`${LOG_PREFIX} The specified Entity Type is not different from the current Entity Type`);

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
            let copy: EntityState = Object.assign({}, this.stateSubject$.value);

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
            let copy: EntityState = Object.assign({}, this.stateSubject$.value);

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
            let copy: EntityState = Object.assign({}, this.stateSubject$.value);

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
    * Handles Entity Selection Events
    * @param entity The Selected Entity
    */
    onSelect(entity: Entity) {

        this.log.trace(`${LOG_PREFIX} Entering onSelect()`);
        this.log.debug(`${LOG_PREFIX} Selected Entity = ${JSON.stringify(entity)}`);

        // Broadcast the selected Entity
        this.log.trace(`${LOG_PREFIX} Broadcasting the selected Entity`);
        this.select.emit(entity);
    }


    /** 
    * Handles Entities Checkboxes Check Events
    * @param entity The Checked Entity
    */
    onCheck(entity: Entity) {

        this.log.trace(`${LOG_PREFIX} Entering onCheck()`);
        this.log.debug(`${LOG_PREFIX} Checked Entity = ${JSON.stringify(entity)}`);

        // Broadcast the checked Entity
        this.log.trace(`${LOG_PREFIX} Broadcasting the checked Entity`);
        this.check.emit(entity);
    }


    /** 
    * Handles Entities Checkboxes Uncheck Events
    * @param entity The Unchecked Entity
    */
    onUncheck(entity: Entity) {

        this.log.trace(`${LOG_PREFIX} Entering onUncheck()`);
        this.log.debug(`${LOG_PREFIX} Unchecked Entity = ${JSON.stringify(entity)}`);

        // Broadcast the unchecked Entity
        this.log.trace(`${LOG_PREFIX} Broadcasting the unchecked Entity`);
        this.uncheck.emit(entity);

    }

    /**
     * Checks whether an Entity record is currently selected
     * @param entity The target Entity
     * @returns True or false depending on whether the Entity is currently selected or not respectively
     */
    isSelected(entity: Entity): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isSelected()`);
        this.log.debug(`${LOG_PREFIX} Target Entity = ${JSON.stringify(entity)}`);

        // Check whether the Entity is currently selected
        this.log.trace(`${LOG_PREFIX} Checking whether the Entity is currently selected`);
        const selected: boolean = this.selected.some(id => id == entity.id);
        this.log.debug(`${LOG_PREFIX} Selected = ${selected}`);

        return selected;
    }


    /**
     * Checks whether an Entity record is currently checked
     * @param entity The target Entity
     * @returns True or false depending on whether the Entity is currently checked or not respectively
     */
    isChecked(entity: Entity): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isChecked()`);
        this.log.debug(`${LOG_PREFIX} Target Entity = ${JSON.stringify(entity)}`);

        // Check whether the Entity is currently checked
        this.log.trace(`${LOG_PREFIX} Checking whether the Entity is currently checked`);
        const checked: boolean = this.selected.some(id => id == entity.id);
        this.log.debug(`${LOG_PREFIX} Checked = ${checked}`);

        return checked;
    }

    /**
     * Checks whether an Entity record is desired
     * @param entity The target Entity
     * @returns True or false depending on whether the Entity is desired or not respectively
     */
    isDesired(entity: Entity): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isDesired()`);
        this.log.debug(`${LOG_PREFIX} Target Entity = ${JSON.stringify(entity)}`);

        // Check whether the Entity is currently desired
        this.log.trace(`${LOG_PREFIX} Checking whether the Entity is currently desired`);
        const desired: boolean = this.desired.some(id => id == entity.id);
        this.log.debug(`${LOG_PREFIX} Desired = ${desired}`);

        return desired;
    }

    /**
     * Checks whether an Entity record is undesired
     * @param entity The target Entity
     * @returns True or false depending on whether the Entity is undesired or not respectively
     */
    isUndesired(entity: Entity): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isUndesired()`);
        this.log.debug(`${LOG_PREFIX} Target Entity = ${JSON.stringify(entity)}`);

        // Check whether the Entity is currently undesired
        this.log.trace(`${LOG_PREFIX} Checking whether the Entity is currently undesired`);
        const undesired: boolean = this.undesired.some(id => id == entity.id);
        this.log.debug(`${LOG_PREFIX} Undesired = ${undesired}`);

        return undesired;
    }



}
