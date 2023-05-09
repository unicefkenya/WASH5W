import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostListener,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core';
import { LoadingAnimationComponent, PaginationComponent } from '@common/components';
import { NGXLogger } from 'ngx-logger';
import { Subscription, first, BehaviorSubject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EntitiesRecordsCreationModalComponent } from '@modules/entities/containers/entities-records-creation-modal/entities-records-creation-modal.component';
import { EntitiesRecordsDeletionModalComponent } from '@modules/entities/containers/entities-records-deletion-modal/entities-records-deletion-modal.component';
import { EntitiesRecordsUpdationModalComponent } from '@modules/entities/containers/entities-records-updation-modal/entities-records-updation-modal.component';
import { EntitiesDataService } from '@modules/entities/services/entities-data.service';
import { FormControl, FormGroup } from '@angular/forms';
import { EntitiesTypesDataService } from '@modules/entities-types/services/entities-types-data.service';
import { EntityType } from '@modules/entities-types/models';
import { Filter, FilterService } from '@app/app-filter.service';
import { Entity } from '@modules/entities/models/entity.model';
import { EntityState } from '@modules/entities/models/entity-state.model';
import { OperatorsDataService } from '@modules/operators/services/operators-data.service';
import { ContextsDataService } from '@modules/contexts/services/contexts-data.service';
import { Context } from '@modules/contexts/models/context.model';
import { AdministrativeHierarchiesRecordsSelectionModalComponent } from '@modules/administrative-hierarchies/containers/administrative-hierarchies-records-selection-modal/administrative-hierarchies-records-selection-modal.component';
import { AdministrativeUnit } from '@modules/administrative-units/models/administrative-unit.model';
import { OptionType } from '@modules/options-types/models/option-type.model';
import { Option } from '@modules/options/models/option.model';
import { OptionsTypesDataService } from '@modules/options-types/services/options-types-data.service';
import { OptionsDataService } from '@modules/options/services/options-data.service';

const LOG_PREFIX: string = "[Entities Records Tabulation Component]";

@Component({
    selector: 'sb-entities-records-tabulation',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './entities-records-tabulation.component.html',
    styleUrls: ['entities-records-tabulation.component.scss'],
})
export class EntitiesRecordsTabulationComponent implements OnInit, OnDestroy, AfterViewInit {

    // Keep a local reference of the currently active context
    private activeContext: Context | null | undefined = null;

    // Keeps a local reference to the displayed loading animation component.
    // Makes it possible to trigger the loading animation when a slow background service is invoked.
    private _animation!: LoadingAnimationComponent;

    // Keeps a local reference to the displayed pagination component.
    // Makes it possible to initialise / update the pagination component when the total number of records changes.
    private _pagination!: PaginationComponent;

    // Holds the required records state
    // Makes it possible to supply the filter, sort or search criteria that should be applied to records on retrieval.
    private stateSubject$ = new BehaviorSubject<EntityState>({
        page: 1,
        pageSize: 20,
        searchTerm: null,
        sortColumn: 'name',
        sortDirection: 'asc',
        id: null,
        typeId: null,
        locationId: null,
        name: null
    });
    readonly state$ = this.stateSubject$.asObservable();

    // Keeps tabs on the records skipped due to pagination
    paginationOffset: number = 0;

    // Central gathering point for all the component's subscriptions.
    // Makes it efficient to unsubscribe from all subscriptions when the component is destroyed.   
    private _subscriptions: Subscription[] = [];

    // Instantitate a new reactive Form Group
    // This will allow us to define and enforce the validation rules for all the form controls.
    entitiesForm = new FormGroup({
        typeId: new FormControl<number | null>(null, []),
        location: new FormGroup({
            locationId: new FormControl<number | null | undefined>(null),
            locationName: new FormControl<string | null | undefined>("Choose Location")
        }),
    });

    // Keeps tabs of whether the component has been successfully initialised
    public initialised: boolean = false;

    constructor(
        private cd: ChangeDetectorRef,
        public contextsDataService: ContextsDataService,
        public entitiesTypesDataService: EntitiesTypesDataService,
        public entitiesDataService: EntitiesDataService,
        public operatorsDataService: OperatorsDataService,
        public optionsTypesDataService: OptionsTypesDataService,
        public optionsDataService: OptionsDataService,
        private filterService: FilterService,
        private modalService: NgbModal,
        private log: NGXLogger) {

    }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

        // Initialise the active Context from the global filter
        this.initialiseActiveContext(() => {

            // Listen to and react to global context changes
            this.initialiseActiveContextChangesHandler(() => {

                // Retrieve and cache Entities Types locally
                this.initialiseEntitiesTypes(() => {

                    // Set the default active Entity Type if not set
                    this.initialiseActiveEntityType(() => {

                        // Retrieve and cache Options Types locally
                        this.initialiseOptionsTypes(() => {

                            // Retrieve and cache Options locally
                            this.initialiseOptions(() => {

                                // Set the default active Entity Type's id as the typeId in the desired records state
                                this.initialiseDesiredRecordsState(() => {

                                    // Preselect the active Entity Type in the data tabulation form
                                    this.initialiseFormGroup(() => {

                                        // Monitor & react to desired records state changes
                                        this.initialiseDesiredRecordsStateChangesHandler(() => {

                                            // Monitor & react to location changes
                                            this.initialiseAdministrativeUnitChangesListener(() => {

                                                // Mark Init as complete
                                                this.log.trace(`${LOG_PREFIX} Init completed`);
                                                this.initialised = true;
                                                this.cd.markForCheck();

                                            });

                                        });
                                    });

                                });

                            });

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

                            // Initialise the selected context's entities types
                            this.initialiseEntitiesTypes(() => {

                                // Initialise the selected context's active entities type
                                this.initialiseActiveEntityType(() => {

                                    // Get the Active Entity Type
                                    this.log.trace(`${LOG_PREFIX} Get the Active Entity Type`);
                                    const activeEntityType: EntityType | null | undefined = this.filterService.filter.activeEntityType;
                                    this.log.debug(`${LOG_PREFIX} Active Entity Type = ${JSON.stringify(activeEntityType)}`);

                                    // Preselect the Active Entity Type in the data collection form
                                    this.log.trace(`${LOG_PREFIX} Preselecting the Active Entity Type in the data collection form`);
                                    this.entitiesForm.get('typeId')?.setValue((activeEntityType && activeEntityType.id) ? activeEntityType.id : null);

                                    // Make a copy of the desired records state
                                    this.log.trace(`${LOG_PREFIX} Making a copy of the desired records state`);
                                    let copy: EntityState = Object.assign({}, this.stateSubject$.value);

                                    // Update the copy of the desired records state
                                    this.log.trace(`${LOG_PREFIX} Updating the copy of the desired records state`);
                                    Object.assign(copy, { typeId: this.filterService.filter.activeEntityType?.id, page: 1 });

                                    // Broadcast the newly desired record state
                                    this.log.trace(`${LOG_PREFIX} Broadcasting the newly desired record state`);
                                    this.stateSubject$.next(copy);

                                });
                            
                            });

                        }
                    }

                })
        );

        // Transfer control to the callback function
        callback();

    }




    /**
     * Retrieves and caches the active context's Entities Types records
     * @param callback The function to call when done
     */
    private initialiseEntitiesTypes(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseEntitiesTypes()`);

        // Retrieve and cache all the Entities Types records
        this.log.trace(`${LOG_PREFIX} Retrieving and caching all the Entities Types records`);
        this.entitiesTypesDataService
            .getEntitiesTypes(true, {
                searchTerm: null,
                page: null,
                pageSize: null,
                sortColumn: 'name',
                sortDirection: 'asc',
                id: null,
                contextId: this.filterService.filter.activeContext?.id,
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
     * Retrieves and caches the active context's Options Types records
     * @param callback The function to call when done
     */
    private initialiseOptionsTypes(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseOptionsTypes()`);

        // Retrieve and cache all the Options Types records
        this.log.trace(`${LOG_PREFIX} Retrieving and caching all the Options Types records`);
        this.optionsTypesDataService
            .getOptionsTypes(true, {
                searchTerm: null,
                page: null,
                pageSize: null,
                sortColumn: 'name',
                sortDirection: 'asc',
                ids: null,
                name: null
            })
            .pipe(first()) // This will automatically complete (and therefore unsubscribe) after the first value has been emitted.
            .subscribe({
                next: (optionsTypes: OptionType[]) => {

                    // Options Types successfully retrieved and cached
                    this.log.debug(`${LOG_PREFIX} ${optionsTypes.length} Options Types(s) retrieved and cached`);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                },

                error: (err: any) => {

                    // Options Types retrieval failed
                    this.log.error(`${LOG_PREFIX} Options Types retrieval failed`);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                }
            });

    }




    /**
     * Retrieves and caches Options records
     * @param callback The function to call when done
     */
    private initialiseOptions(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseOptions()`);

        // Retrieve and cache all the Options records
        this.log.trace(`${LOG_PREFIX} Retrieving and caching all the Options records`);
        this.optionsDataService
            .getOptions(true, {
                searchTerm: null,
                page: null,
                pageSize: null,
                sortColumn: 'name',
                sortDirection: 'asc',
                ids: null,
                typeId: null,
                name: null
            })
            .pipe(first()) // This will automatically complete (and therefore unsubscribe) after the first value has been emitted.
            .subscribe({
                next: (options: Option[]) => {

                    // Options successfully retrieved and cached
                    this.log.debug(`${LOG_PREFIX} ${options.length} Option(s) retrieved and cached`);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                },

                error: (err: any) => {

                    // Options retrieval failed
                    this.log.error(`${LOG_PREFIX} Options retrieval failed`);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                }
            });

    }



    /**
     * Presets default values in the desired records state bean
     * @param callback The function to call when done
     */
    private initialiseDesiredRecordsState(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseDesiredRecordsState()`);

        // Get the Active Entity Type
        this.log.trace(`${LOG_PREFIX} Get the Active Entity Type`);
        const activeEntityType: EntityType | null | undefined = this.filterService.filter.activeEntityType;
        this.log.debug(`${LOG_PREFIX} Active Entity Type = ${JSON.stringify(activeEntityType)}`);

        // Get the active Administrative Unit
        this.log.trace(`${LOG_PREFIX} Getting the active Administrative Unit`);
        const activeAdministrativeUnit: AdministrativeUnit | null | undefined = this.filterService.filter.activeAdministrativeUnit;
        this.log.debug(`${LOG_PREFIX} Active administrative unit = ${JSON.stringify(activeAdministrativeUnit)}`);

        // Make a copy of the desired records state
        this.log.trace(`${LOG_PREFIX} Making a copy of the desired records state`);
        let copy: EntityState = Object.assign({}, this.stateSubject$.value);

        // Set the active Entity Type as the desired Entity Type
        this.log.trace(`${LOG_PREFIX} Setting the active Entity Type as the desired Entity Type`);
        Object.assign(copy, {
            typeId: activeEntityType && activeEntityType.id ? activeEntityType.id : null,
            locationId: activeAdministrativeUnit && activeAdministrativeUnit.id ? activeAdministrativeUnit.id : null
        });

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

        // Get the Active Entity Type
        this.log.trace(`${LOG_PREFIX} Get the Active Entity Type`);
        const activeEntityType: EntityType | null | undefined = this.filterService.filter.activeEntityType;
        this.log.debug(`${LOG_PREFIX} Active Entity Type = ${JSON.stringify(activeEntityType)}`);

        // Preselect the Active Entity Type
        this.log.trace(`${LOG_PREFIX} Preselecting the Active Entity Type`);
        this.entitiesForm.get('typeId')?.setValue((activeEntityType && activeEntityType.id) ? activeEntityType.id : null);

        // Get the active Administrative Unit
        this.log.trace(`${LOG_PREFIX} Getting the active Administrative Unit`);
        const activeAdministrativeUnit: AdministrativeUnit | null | undefined = this.filterService.filter.activeAdministrativeUnit;
        this.log.debug(`${LOG_PREFIX} Active administrative unit = ${JSON.stringify(activeAdministrativeUnit)}`);

        // Preselect the active Administrative Unit
        this.log.trace(`${LOG_PREFIX} Preselecting the active Administrative Unit`);
        if (activeAdministrativeUnit) {
            this.entitiesForm.get('location.locationId')?.setValue(activeAdministrativeUnit ? activeAdministrativeUnit.id : null);
            this.entitiesForm.get('location.locationName')?.setValue(activeAdministrativeUnit ? activeAdministrativeUnit.data.name : "Choose location");
        }

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

                        // Update the offset due to pagination
                        this.log.trace(`${LOG_PREFIX} Updating the offset due to pagination`);
                        this.paginationOffset = this.calculatePaginationOffset();
                        this.log.debug(`${LOG_PREFIX} Pagination Offset = ${this.paginationOffset}`);

                    }
                })
        );

        // Transfer control to the callback function
        callback();

    }




    /**
     * Initialises administrative units changes listener
     * @param callback The function to call when done
     */
    private initialiseAdministrativeUnitChangesListener(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseAdministrativeUnitChangesListener()`);

        this._subscriptions.push(
            this.filterService.currentFilter$.subscribe({
                next: (filter: Filter) => {

                    // Check if a different Administrative Unit has been selected
                    this.log.trace(`${LOG_PREFIX} Checking if a different Administrative Unit has been selected`);

                    if (filter.activeAdministrativeUnit?.id != this.stateSubject$.value.locationId) {

                        // A different Administrative Unit has been selected
                        this.log.trace(`${LOG_PREFIX} A different Administrative Unit has been selected`);

                        // Make a copy of the desired records state
                        this.log.trace(`${LOG_PREFIX} Making a copy of the desired records state`);
                        let copy: EntityState = Object.assign({}, this.stateSubject$.value);

                        // Update the copy of the desired records state
                        this.log.trace(`${LOG_PREFIX} Updating the copy of the desired records state`);
                        Object.assign(copy, { locationId: filter.activeAdministrativeUnit?.id });

                        // Broadcast the newly desired record state
                        this.log.trace(`${LOG_PREFIX} Broadcasting the newly desired record state`);
                        this.stateSubject$.next(copy);




                    } else {

                        // A different Administrative Unit has not been selected
                        this.log.trace(`${LOG_PREFIX} A different Administrative Unit has not been selected`);

                        // Ignore the update
                        this.log.trace(`${LOG_PREFIX} Ignoring the update`);

                    }

                    // Preselect the active Administrative Unit
                    this.log.trace(`${LOG_PREFIX} Preselecting the active Administrative Unit`);
                    this.entitiesForm.get('location.locationId')?.setValue(filter.activeAdministrativeUnit ? filter.activeAdministrativeUnit.id : null);
                    this.entitiesForm.get('location.locationName')?.setValue(filter.activeAdministrativeUnit ? filter.activeAdministrativeUnit.data.name : "Choose location");

                }
            })
        )

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
            Object.assign(copy, { typeId: this.filterService.filter.activeEntityType?.id, page: 1 });

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
            Object.assign(copy, { searchTerm: searchTerm, page: 1 });

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
     * Handles Entities Records Addition Requests
     */
    public onAddEntity(): void {

        this.log.trace(`${LOG_PREFIX} Entering onAddEntity()`);
        const modalRef = this.modalService.open(EntitiesRecordsCreationModalComponent, { centered: true, backdrop: 'static' });
        modalRef.componentInstance.contextId = this.filterService.filter.activeContext?.id;
        modalRef.componentInstance.typeId = this.filterService.filter.activeEntityType?.id
    }

    /**
     * Handles Entities Records Updation Requests
     * @param id The unique identifier of the Entity record to update
     */
    public onUpdateEntity(id: number): void {

        this.log.trace(`${LOG_PREFIX} Entering onUpdateEntity()`);
        this.log.debug(`${LOG_PREFIX} Entity Record Id = ${id}`);
        const modalRef = this.modalService.open(EntitiesRecordsUpdationModalComponent, { centered: true, backdrop: 'static' });
        modalRef.componentInstance.id = id;

    }

    /**
     * Handles Entities Records Deletion Requests
     * * @param id The unique identifier of the Entity record to delete
     */
    public onDeleteEntity(id: number): void {

        this.log.trace(`${LOG_PREFIX} Entering onDeleteEntity()`);
        this.log.debug(`${LOG_PREFIX} Entity Record Id = ${id}`);
        const modalRef = this.modalService.open(EntitiesRecordsDeletionModalComponent, { centered: true, backdrop: 'static' });
        modalRef.componentInstance.id = id;
    }


    /**
     * Handles Entities Location Selection Requests
     */
    openLocationSelector(): void {
        this.log.trace(`${LOG_PREFIX} Entering openLocationSelector()`);
        const modalRef = this.modalService.open(AdministrativeHierarchiesRecordsSelectionModalComponent, { centered: true, backdrop: 'static' });
        modalRef.componentInstance.selected = this.stateSubject$.value.locationId ? [this.stateSubject$.value.locationId] : [];
    }


    /**
     * Get the records offset due to pagination
     * @returns The offset
     */
    private calculatePaginationOffset(): number {

        if (this.stateSubject$.value.page && this.stateSubject$.value.pageSize) {
            return (this.stateSubject$.value.page - 1) * this.stateSubject$.value.pageSize
        } else {
            return 0;
        }

    }

}
