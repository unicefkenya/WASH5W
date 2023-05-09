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
import { Subscription, first, BehaviorSubject, Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IndicatorsRecordsCreationModalComponent } from '@modules/indicators/containers/indicators-records-creation-modal/indicators-records-creation-modal.component';
import { IndicatorsRecordsDeletionModalComponent } from '@modules/indicators/containers/indicators-records-deletion-modal/indicators-records-deletion-modal.component';
import { IndicatorsRecordsUpdationModalComponent } from '@modules/indicators/containers/indicators-records-updation-modal/indicators-records-updation-modal.component';
import { IndicatorsDataService } from '@modules/indicators/services/indicators-data.service';
import { IndicatorState } from '@modules/indicators/models/indicator-state.model';
import { FormControl, FormGroup } from '@angular/forms';
import { FilterService } from '@app/app-filter.service';
import { ContextsDataService } from '@modules/contexts/services/contexts-data.service';
import { Context } from '@modules/contexts/models/context.model';
import { UnitsDataService } from '@modules/units/services/units-data.service';
import { Unit } from '@modules/units/models/unit.model';
import { LogicalHierarchiesRecordsSelectionModalComponent } from '@modules/logical-hierarchies/containers/logical-hierarchies-records-selection-modal/logical-hierarchies-records-selection-modal.component';
import { environment } from 'environments/environment';
import { LogicalHierarchy } from '@modules/logical-hierarchies/models/logical-hierarchy.model';
import { TextUtilService } from '@common/services/text-util.service';
import { Indicator } from '@modules/indicators/models/indicator.model';
import { DataFormsDataService } from '@modules/data-forms/services/data-forms-data.service';
import { DataForm } from '@modules/data-forms/models/data-form.model';
import { OptionsDataService } from '@modules/options/services/options-data.service';
import { Option } from '@modules/options/models/option.model';
import { DataFormsElementsDataService } from '@modules/data-forms-elements/services/data-forms-elements-data.service';
import { DataFormElement } from '@modules/data-forms-elements/models/data-form-element.model';
import { LogicalElementsDataService } from '@modules/logical-elements/services/logical-elements-data.service';
import { LogicalElement } from '@modules/logical-elements/models/logical-element.model';
import { TimePeriod } from '@modules/time-periods/models/time-period.model';
import { TimePeriodsDataService } from '@modules/time-periods/services/time-periods-data.service';

const LOG_PREFIX: string = "[Indicators Records Tabulation Component]";

export interface PageTab {
    id: number;
    title: string;
}

@Component({
    selector: 'sb-indicators-records-tabulation',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './indicators-records-tabulation.component.html',
    styleUrls: ['indicators-records-tabulation.component.scss'],
})
export class IndicatorsRecordsTabulationComponent implements OnInit, OnDestroy, AfterViewInit {

    // Keeps a local reference of the currently active context
    private activeContext: Context | null | undefined = null;

    // Keeps a local reference to the displayed loading animation component.
    // Makes it possible to trigger the loading animation when a slow background service is invoked.
    private _animation!: LoadingAnimationComponent;

    // Keeps a local reference to the displayed pagination component.
    // Makes it possible to initialise / update the pagination component when the total number of records changes.
    private _pagination!: PaginationComponent;

    // Keeps tabs on the records skipped due to pagination
    public paginationOffset: number = 0;

    // Flags whether the indicators are associated with a logical strategy
    public logical: boolean = environment.indicators.logical;

    // Flags whether the indicators are explicitly numbered
    public numbered: boolean = environment.indicators.numbered;

    // Holds the required records state
    // Makes it possible to supply the filter, sort or search criteria that should be applied to records on retrieval.
    private stateSubject$ = new BehaviorSubject<IndicatorState>({
        searchTerm: null,
        page: 1,
        pageSize: 10,
        sortColumn: 'id',
        sortDirection: 'asc',
        ids: null,
        contextId: null,
        no: null,
        name: null,
        logicalParentId: null
    });
    readonly state$ = this.stateSubject$.asObservable();

    // Holds subindicators
    private subindicatorsSubject$ = new BehaviorSubject<Indicator[]>([]);
    readonly subindicators$ = this.subindicatorsSubject$.asObservable();

    // Holds form fields
    private formFieldSubject$ = new BehaviorSubject<DataFormElement | null>(null);
    readonly formField$ = this.formFieldSubject$.asObservable();

    // Holds a copy of the currently expanded indicator
    private indicator: Indicator | null = null;

    // Instantitate a new reactive Form Group
    // This will allow us to define and enforce the validation rules for all the form controls.
    defaultForm = new FormGroup({
        logicalElement: new FormGroup({
            logicalElementId: new FormControl<number | null | undefined>(null),
            logicalElementName: new FormControl<string>("Optionally choose logical parent"),
            truncatedLogicalElementName: new FormControl<string>("Optionally choose logical parent")
        }),
    });



    // Init the tab options
    public pageTabs: PageTab[] = [
        {
            id: 1,
            title: "Targets"
        },
        {
            id: 2,
            title: "Results"
        }
    ];

    // Keeps tabs on the active tab
    public activePageTab: PageTab = {
        id: 2,
        title: "Actuals"
    };  
    
    // Keep tabs on whether a tab is ready for display
    ready: boolean = true;

    // Central gathering point for all the component's subscriptions.
    // Makes it efficient to unsubscribe from all subscriptions when the component is destroyed.   
    private _subscriptions: Subscription[] = [];

    constructor(
        public contextsDataService: ContextsDataService,
        public indicatorsDataService: IndicatorsDataService,
        public unitsDataService: UnitsDataService,
        public dataFormsDataService: DataFormsDataService,
        public logicalElementsDataService: LogicalElementsDataService,
        public dataFormsElementsDataService: DataFormsElementsDataService,
        public optionsDataService: OptionsDataService,
        public timePeriodsDataService: TimePeriodsDataService,
        public filterService: FilterService,
        public textUtilService: TextUtilService,
        private modalService: NgbModal,
        private cd: ChangeDetectorRef,
        private log: NGXLogger) {

    }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

        // Initialise the active Context from the global filter
        this.initialiseActiveContext(() => {

            // Listen to and react to global context changes
            this.initialiseActiveContextChangesHandler(() => {

                // Retrieve and cache Units locally
                this.initialiseUnits(() => {

                    // Retrieve and cache Data Forms locally
                    this.initialiseDataForms(() => {

                        // Retrieve and cache Options locally
                        this.initialiseOptions(() => {

                            // Retrieve and cache time periods locally
                            this.initialiseTimePeriods(() => {

                                // Set the default active time period
                                this.initialiseActiveTimePeriod(() => {

                                    // Set the default active Context's id as the contextId in the desired records state
                                    this.initialiseDesiredRecordsState(() => {

                                        // Preselect the active Context in the data tabulation form
                                        this.initialiseFormGroup(() => {

                                            // Monitor & react to desired global filter changes
                                            this.initialiseGlobalFilterChangesHandler(() => {

                                                // Monitor & react to desired records state changes
                                                this.initialiseDesiredRecordsStateChangesHandler(() => {

                                                    // Mark Init as complete
                                                    this.log.trace(`${LOG_PREFIX} Init completed`);

                                                });
                                            });

                                        });

                                    });

                                })
                            })

                        })


                    })


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
        this.filterService.filter.expandedIndicators.length = 0;
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
                            let copy: IndicatorState = Object.assign({}, this.stateSubject$.value);

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
     * Retrieves and caches Units records
     * @param callback The function to call when done
     */
    private initialiseUnits(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseUnits()`);

        // Retrieve and cache all the Units records
        this.log.trace(`${LOG_PREFIX} Retrieving and caching all the Units records`);
        this.unitsDataService
            .getUnits(true, {
                searchTerm: null,
                page: null,
                pageSize: null,
                sortColumn: 'name',
                sortDirection: 'asc',
                id: null,
                abbreviation: null,
                name: null
            })
            .pipe(first()) // This will automatically complete (and therefore unsubscribe) after the first value has been emitted.
            .subscribe({
                next: (units: Unit[]) => {

                    // Units successfully retrieved and cached
                    this.log.debug(`${LOG_PREFIX} ${units.length} Unit(s) retrieved and cached`);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                },

                error: (err: any) => {

                    // Units retrieval failed
                    this.log.error(`${LOG_PREFIX} Units retrieval failed`);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                }
            });

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
     * Retrieves and caches Time Periods records
     * @param callback The function to call when done
     */
    private initialiseTimePeriods(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseTimePeriods()`);

        // Retrieve and cache the context's Time Periods records
        this.log.trace(`${LOG_PREFIX} Retrieving and caching the context's Time Periods records`);
        this.timePeriodsDataService
            .getTimePeriods(true, {
                page: null,
                pageSize: null,
                searchTerm: null,
                sortColumn: 'name',
                sortDirection: 'asc',
                contextId: this.filterService.filter.activeContext?.id,
                open: null,
                id: null 
            })
            .pipe(first()) // This will automatically complete (and therefore unsubscribe) after the first value has been emitted.
            .subscribe({
                next: (timePeriods: TimePeriod[]) => {

                    // Time Periods successfully retrieved and cached
                    this.log.debug(`${LOG_PREFIX} ${timePeriods.length} TimePeriod(s) retrieved and cached`);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                },

                error: (err: any) => {

                    // Time Periods retrieval failed
                    this.log.error(`${LOG_PREFIX} Time Periods retrieval failed`);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                }
            });


    }


    /**
     * Sets the active TimePeriod if it has not been set in the global filter
     * @param callback The function to call when done
     */
    private initialiseActiveTimePeriod(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseActiveTimePeriod()`);

        // Check if the active TimePeriod has been set in the global filter
        this.log.trace(`${LOG_PREFIX} Checking if the active TimePeriod has been set in the global filter`);
        if (this.filterService.filter.expandedTimePeriods.length > 0) {

            // The active TimePeriod has been set in the global filter
            this.log.trace(`${LOG_PREFIX} The active TimePeriod has been set in the global filter`);

            // Check if the active Time Period record exists in the cache
            this.log.trace(`${LOG_PREFIX} Checking if the active Time Period record exists in the cache`);
            if (this.timePeriodsDataService.records.some(a => a.id == this.filterService.filter.expandedTimePeriods[0]?.id)) {

                // The active Time Period record exists in the cache
                this.log.trace(`${LOG_PREFIX} The active Time Period record exists in the cache`);

                // Initialisation is valid
                this.log.trace(`${LOG_PREFIX} Initialisation is valid`);

            } else {

                // Initialisation is invalid
                this.log.trace(`${LOG_PREFIX} Initialisation is invalid`);

                // Get the open Time Period record
                this.log.trace(`${LOG_PREFIX} Get the open Time Period record`);
                const timePeriod: TimePeriod | null | undefined = this.timePeriodsDataService.records.length > 0 ? this.timePeriodsDataService.records.find(t => t.data.open) : null;
                this.log.trace(`${LOG_PREFIX} Open Time Period record = ${JSON.stringify(timePeriod)}`);

                // Update the global filter
                this.log.trace(`${LOG_PREFIX} Updating the global filter`);
                this.filterService.filter.expandedTimePeriods.length = 0;
                if (timePeriod) {
                    this.filterService.filter.expandedTimePeriods.push(timePeriod);
                }
            }

            // Return
            this.log.trace(`${LOG_PREFIX} Returning`);
            callback();

        } else {

            // The active TimePeriod has not been set in the global filter
            this.log.trace(`${LOG_PREFIX} The active TimePeriod has not been set in the global filter`);

            // Get the open Time Period record
            this.log.trace(`${LOG_PREFIX} Get the open Time Period record`);
            const timePeriod: TimePeriod | null | undefined = this.timePeriodsDataService.records.length > 0 ? this.timePeriodsDataService.records.find(t => t.data.open) : null;
            this.log.trace(`${LOG_PREFIX} Open Time Period record = ${JSON.stringify(timePeriod)}`);

            // Update the global filter
            this.log.trace(`${LOG_PREFIX} Updating the global filter`);
            this.filterService.filter.expandedTimePeriods.length = 0;
            if (timePeriod) {
                this.filterService.filter.expandedTimePeriods.push(timePeriod);
            }

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
        let copy: IndicatorState = Object.assign({}, this.stateSubject$.value);

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
     * Subscribe and react to global filter changes
     * @param callback The function to call when done
     */
    private initialiseGlobalFilterChangesHandler(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseGlobalFilterChangesHandler()`);

        // Subscribe to global filter changes and react to them
        this.log.trace(`${LOG_PREFIX} Subscribing to global filter changes and react to them`);
        this._subscriptions.push(
            this.filterService
                .currentFilter$
                .subscribe({
                    next: (filter) => {

                        // The global filter was updated
                        this.log.trace(`${LOG_PREFIX} The global filter was updated`);

                        // Check if the parent logical element was changed
                        this.log.trace(`${LOG_PREFIX} Checking if the parent logical element was changed`);
                        if (filter.selectedLogicalHierarchy?.data.responsible?.id != this.stateSubject$.value.logicalParentId) {

                            // The parent logical element was changed
                            this.log.trace(`${LOG_PREFIX} The parent logical element was changed`);
                            const selectedLogicalHierarchy: LogicalHierarchy | null | undefined = filter.selectedLogicalHierarchy;

                            this.retrieveLogicalElementRecord(selectedLogicalHierarchy?.data?.responsible?.id, (logicalParent: LogicalElement | null) => {

                                // Make a copy of the desired records state
                                this.log.trace(`${LOG_PREFIX} Making a copy of the desired records state`);
                                let copy: IndicatorState = Object.assign({}, this.stateSubject$.value);

                                // Update the copy of the desired records state
                                this.log.trace(`${LOG_PREFIX} Updating the copy of the desired records state`);

                                Object.assign(copy, { logicalParentId: selectedLogicalHierarchy ? selectedLogicalHierarchy.data.responsible?.id : null });

                                // Broadcast the newly desired record state
                                this.log.trace(`${LOG_PREFIX} Broadcasting the newly desired record state`);
                                this.stateSubject$.next(copy);

                                // Update the form
                                this.log.trace(`${LOG_PREFIX} Updating the form`);
                                this.defaultForm.get('logicalElement.logicalElementId')?.setValue(logicalParent?.id);
                                this.defaultForm.get('logicalElement.logicalElementName')?.setValue(logicalParent?.data.name ? (logicalParent?.data.no ? logicalParent?.data.no + ". " + logicalParent?.data.name : logicalParent?.data.name) : "Optionally choose logical parent");
                                this.defaultForm.get('logicalElement.truncatedLogicalElementName')?.setValue(this.truncate(logicalParent?.data.name ? (logicalParent?.data.no ? logicalParent?.data.no + ". " + logicalParent?.data.name : logicalParent?.data.name) : "Optionally choose logical parent"));

                            });


                        } else {

                            // The parent logical element was not changed
                            this.log.trace(`${LOG_PREFIX} The parent logical element was not changed`);

                            // Ignore the update
                            this.log.trace(`${LOG_PREFIX} Ignoring the update`);

                        }


                    }
                })
        );

        // Transfer control to the callback function
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

                        // Retrieve the Indicator records corresponding to the passed in state
                        this.log.trace(`${LOG_PREFIX} Retrieving the Indicator records corresponding to the passed in state`);
                        this.indicatorsDataService
                            .getIndicators(true, state)
                            .subscribe();

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
     * Presets default values in the data tabulation form
     * @param callback The function to call when done
     */
    private initialiseFormGroup(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseFormGroup()`);

        // Get the selected logical element
        this.log.trace(`${LOG_PREFIX} Getting the selected logical element`);
        const selectedLogicalHierarchy: LogicalHierarchy | null | undefined = this.filterService.filter.selectedLogicalHierarchy;

        this.retrieveLogicalElementRecord(selectedLogicalHierarchy?.data?.responsible?.id, (logicalParent: LogicalElement | null) => {

            // Make a copy of the desired records state
            this.log.trace(`${LOG_PREFIX} Making a copy of the desired records state`);
            let copy: IndicatorState = Object.assign({}, this.stateSubject$.value);

            // Update the copy of the desired records state
            this.log.trace(`${LOG_PREFIX} Updating the copy of the desired records state`);

            Object.assign(copy, { logicalParentId: selectedLogicalHierarchy ? selectedLogicalHierarchy.data.responsible?.id : null });

            // Broadcast the newly desired record state
            this.log.trace(`${LOG_PREFIX} Broadcasting the newly desired record state`);
            this.stateSubject$.next(copy);

            // Update the form
            this.log.trace(`${LOG_PREFIX} Updating the form`);
            this.defaultForm.get('logicalElement.logicalElementId')?.setValue(logicalParent?.id);
            this.defaultForm.get('logicalElement.logicalElementName')?.setValue(logicalParent?.data.name ? (logicalParent?.data.no ? logicalParent?.data.no + ". " + logicalParent?.data.name : logicalParent?.data.name) : "Optionally choose logical parent");
            this.defaultForm.get('logicalElement.truncatedLogicalElementName')?.setValue(this.truncate(logicalParent?.data.name ? (logicalParent?.data.no ? logicalParent?.data.no + ". " + logicalParent?.data.name : logicalParent?.data.name) : "Optionally choose logical parent"));

            // Return
            this.log.trace(`${LOG_PREFIX} Returning`);
            callback();

        });


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
            this.indicatorsDataService.loading$
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
            this.indicatorsDataService.totalRecords$.subscribe(
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
    * Retrieves a Logical Element Record given its unique identifier synchronously
    * @param id The unique identifier of the LogicalElement
    * @param callback The function to call when done
    */
    private retrieveLogicalElementRecord(id: number | null | undefined, callback: (entity: LogicalElement | null) => void): void {

        this.log.trace(`${LOG_PREFIX} Entering retrieveLogicalElementRecord()`);
        this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

        // Check if the Logical Element Id has been specified
        this.log.trace(`${LOG_PREFIX} Checking if the Logical Element Id has been specified`);
        if (id) {

            // The Logical Element Id has been specified
            this.log.trace(`${LOG_PREFIX} The Logical Element Id has been specified`);
            this.log.debug(`${LOG_PREFIX} Logical Element Id = ${JSON.stringify(id)}`);

            // Try retrieving a Logical Element Record with the passed in id
            this.log.trace(`${LOG_PREFIX} Trying to retrieve a Logical Element Record with the passed in id`);
            this.logicalElementsDataService
                .getLogicalElements(false, {
                    page: null,
                    pageSize: null,
                    searchTerm: null,
                    sortColumn: null,
                    sortDirection: null,
                    id: id,
                    contextId: null,
                    typesIds: null,
                    no: null,
                    name: null
                })
                .subscribe({
                    next: (logicalElements: LogicalElement[]) => {

                        // Check if a Logical Element Record with the given id was found
                        this.log.trace(`${LOG_PREFIX} Checking if a Logical Element Record with the given id was found`);
                        if (logicalElements.length > 0) {

                            //A Logical Element Record with the given id was found
                            this.log.trace(`${LOG_PREFIX} A Logical Element Record with the given id was found`);

                            // Return the Logical Element Record
                            this.log.trace(`${LOG_PREFIX} Returning the Logical Element Record`);
                            callback(logicalElements[0]);


                        } else {

                            //A Logical Element Record with the given id was not found
                            this.log.trace(`${LOG_PREFIX} A Logical Element Record with the given id was not found`);

                            // Return null
                            this.log.warn(`${LOG_PREFIX} Return null`);
                            callback(null);

                        }
                    }
                });


        } else {

            // The Logical Element Id has not been specified
            this.log.error(`${LOG_PREFIX} The Logical Element Id has not been specified`);

            // Return null
            this.log.warn(`${LOG_PREFIX} Return null`);
            callback(null);

        }
    }




    /**
     * Retrieves the id of the LogicalElement
     * @returns the id
     */
    public getLogicalElementId(): number | null | undefined {
        return this.defaultForm.get('logicalElement.logicalElementId')?.value
    }

    /**
     * Gets the name of an aggregation operation given its id
     * @param id the aggregation operation's id
     * @returns the name
     */
    public getAggregationName(id: number | null | undefined): string | null {
        if (id) {
            switch (id) {
                case 1:
                    return "Sum";
                case 2:
                    return "Count";
                case 3:
                    return "Average";
                case 4:
                    return "Percentage Average";
                default:
                    return null;

            }
        } else {
            return null;
        }

    }

    /**
     * Gets the name of an option given its id
     * @param id the option's id
     * @returns the name
     */
    public getOptionName(id: number | null | undefined): string | null | undefined {

        if (id) {

            const option: Option | undefined = id ? this.optionsDataService.records.find(d => d.id == id) : undefined;

            if (option) {

                return option.data.name;

            } else {

                return null;

            }

        } else {
            return "All";
        }
    }



    /**
     * Retrieves the unit record given its unique identifier
     * @param unitId The unique identifier of the unit record
     * @return the subindicators records
     */
    public getUnit(unitId: number): Unit | undefined {

        this.log.trace(`${LOG_PREFIX} Entering getUnitRecord()`);
        this.log.debug(`${LOG_PREFIX} Unit Id = ${JSON.stringify(unitId)}`);

        return this.unitsDataService.records.find(u => u.id == unitId);
    }



    /**
     * Retrieves the subindicators records given their unique identifier
     * @param subindicatorsIds The unique identifiers of the subindicators
     * @return the subindicators records
     */
    public getSubindicators(ids: number[] | null | undefined): Observable<Indicator[] | null> {

        this.log.trace(`${LOG_PREFIX} Entering getSubindicators()`);
        this.log.debug(`${LOG_PREFIX} Subindicators Ids = ${JSON.stringify(ids)}`);

        return new Observable(obs => {

            // Check if the indicators ids have been specified
            this.log.trace(`${LOG_PREFIX} Checking if the indicators ids have been specified`);
            if (ids && ids.length > 0) {

                // The indicator ids have been specified
                this.log.trace(`${LOG_PREFIX} The indicator ids have been specified`);
                this.log.debug(`${LOG_PREFIX} Indicator Ids = ${JSON.stringify(ids)}`);

                // Try retrieving the indicators records with the passed in id
                this.log.trace(`${LOG_PREFIX} Trying to retrieve the indicators record with the passed in id`);
                this.indicatorsDataService
                    .getIndicators(false, {
                        searchTerm: null,
                        page: null,
                        pageSize: null,
                        sortColumn: null,
                        sortDirection: null,
                        ids: ids,
                        contextId: null,
                        no: null,
                        name: null,
                        logicalParentId: null
                    })
                    .subscribe({
                        next: (indicators: Indicator[]) => {

                            // Check if indicator records were found
                            this.log.trace(`${LOG_PREFIX} Checking if Indicator records were found`);
                            if (indicators.length > 0) {

                                //Indicators records were found
                                this.log.trace(`${LOG_PREFIX} Indicators records were found`);

                                // Return the indicators records
                                this.log.trace(`${LOG_PREFIX} Returning the indicators record`);
                                obs.next(indicators);


                            } else {

                                //Indicators records were no found
                                this.log.trace(`${LOG_PREFIX} Indicators records were not found`);

                                // Return null
                                this.log.warn(`${LOG_PREFIX} Return null`);
                                obs.next(null);

                            }
                        }
                    });


            } else {

                // The Indicators Ids have not been specified
                this.log.error(`${LOG_PREFIX} The Indicators Ids have not been specified`);

                // Return null
                this.log.warn(`${LOG_PREFIX} Return null`);
                obs.next(null);

            }
        })


    }


    /**
     * Retrieves a form field field given its unique identifier
     * @param id The unique identifier of the Data Form Element
     * @param callback The function to call when done
     */
    public getFormField(id: number | null | undefined): Observable<DataFormElement | null> {

        this.log.trace(`${LOG_PREFIX} Entering getFormField()`);

        // Asynchronously get the corresponding Form Field
        this.log.trace(`${LOG_PREFIX} Asynchronously getting the corresponding Form Field`);
        return new Observable(obs => {
            // Check if the Data Form Element id has been specified
            this.log.trace(`${LOG_PREFIX} Checking if the Data Form Element id has been specified`);
            if (id) {

                // The Data Form Element id has been specified
                this.log.trace(`${LOG_PREFIX} The Data Form Element id has been specified`);
                this.log.debug(`${LOG_PREFIX} Data Form Element Id = ${JSON.stringify(id)}`);

                // Try retrieving a Data Form Element record with the passed in id
                this.log.trace(`${LOG_PREFIX} Trying to retrieve a Data Form Element record with the passed in id`);
                this.dataFormsElementsDataService
                    .getDataFormsElements(false, {
                        searchTerm: null,
                        page: null,
                        pageSize: null,
                        sortColumn: null,
                        sortDirection: null,
                        id: id,
                        indexLTE: null,
                        indexGTE: null,
                        dataFormId: null,
                        categoryId: null,
                        typeId: null,
                        parentId: null,
                        name: null
                    })
                    .pipe(first()) // This will automatically complete (and therefore unsubscribe) after the first value has been emitted.
                    .subscribe({
                        next: (dataFormElements: DataFormElement[]) => {

                            // Data Forms successfully retrieved
                            this.log.debug(`${LOG_PREFIX} ${dataFormElements.length} DataForm(s) retrieved`);

                            // Return
                            if (dataFormElements.length > 0) {

                                // The Data Form Element record was successfully retrieved
                                this.log.trace(`${LOG_PREFIX} The Data Form Element record was successfully retrieved`);
                                this.log.debug(`${LOG_PREFIX} Data Form Element record = ${JSON.stringify(dataFormElements[0])}`);

                                obs.next(dataFormElements[0])


                            } else {

                                // The Data Form Element record was not successfully retrieved
                                this.log.trace(`${LOG_PREFIX} The Data Form Element record was not successfully retrieved`);

                                obs.next(null);

                            }


                        },

                        error: (err: any) => {

                            // Data Forms retrieval failed
                            this.log.error(`${LOG_PREFIX} Data Forms retrieval failed`);

                            obs.next(null);
                        }
                    });

            } else {

                // The Data Form Element id has not been specified
                this.log.error(`${LOG_PREFIX} The Data Form Element id has not been specified`);

                obs.next(null);

            }

        });


    }

    public getTimePeriodId(): number | null {
        return this.filterService.filter.expandedTimePeriods.length > 0 ? this.filterService.filter.expandedTimePeriods[0].id : null
    }

    public getPhenomenonTypeId(): number | null {
        return this.indicator ? this.indicator.id : null;
    }


    public getUnitId(): number | null {
        return this.indicator && this.indicator.data.unitId ? this.indicator.data.unitId : null;
    }


    public getObservationTypeId(): number | null {
        return this.activePageTab.id;
    }


    public onChangeTab(tab: PageTab): void {

        this.ready = false;
        this.cd.detectChanges();

        this.activePageTab = tab;

        this.ready = true;
        this.cd.detectChanges();

    }    

    /**
     * Opens the Logical Element Selector
     */
    public onOpenLogicalElementSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering onOpenLogicalElementSelector()`);
        this.modalService.open(LogicalHierarchiesRecordsSelectionModalComponent, { centered: true, backdrop: 'static' });

    }

    /**
     * Clears the selected Logical Element Selector
     */
    public onClearLogicalElementSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering onClearLogicalElementSelector()`);
        this.filterService.update({ selectedLogicalHierarchy: null });

    }



    /**
     * Handles search events
     * @param searchTerm The term to search by
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
            let copy: IndicatorState = Object.assign({}, this.stateSubject$.value);

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
        this.log.debug(`${LOG_PREFIX} Page = ${page}`);

        // Check if the specified page is different from the current page
        this.log.trace(`${LOG_PREFIX} Check if the specified page is different from the current page`);

        if (page != this.stateSubject$.value.page) {

            // The specified page is different from the current page
            this.log.trace(`${LOG_PREFIX} The specified page is different from the current page`);

            // Make a copy of the desired records state
            this.log.trace(`${LOG_PREFIX} Making a copy of the desired records state`);
            let copy: IndicatorState = Object.assign({}, this.stateSubject$.value);

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
        this.log.debug(`${LOG_PREFIX} Page Size = ${pageSize}`);

        // Check if the specified page size is different from the current page size
        this.log.trace(`${LOG_PREFIX} Check if the specified page size is different from the current page size`);

        if (pageSize != this.stateSubject$.value.pageSize) {

            // The specified page size is different from the current page size
            this.log.trace(`${LOG_PREFIX} The specified page size is different from the current page size`);

            // Make a copy of the desired records state
            this.log.trace(`${LOG_PREFIX} Making a copy of the desired records state`);
            let copy: IndicatorState = Object.assign({}, this.stateSubject$.value);

            // Update the copy of the desired records state
            this.log.trace(`${LOG_PREFIX} Updating the copy of the desired records state`);
            Object.assign(copy, { pageSize: pageSize });

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
     * Handles Indicators Records Addition Requests
     */
    public onAddIndicator(): void {

        this.log.trace(`${LOG_PREFIX} Entering onAddIndicator()`);

        const modalRef = this.modalService.open(IndicatorsRecordsCreationModalComponent, { centered: true, backdrop: 'static' });
        modalRef.componentInstance.contextId = this.stateSubject$.value.contextId;
        modalRef.componentInstance.logical = this.logical;
        modalRef.componentInstance.numbered = this.numbered;
    }

    /**
     * Handles Indicators Records Updation Requests
     */
    public onUpdateIndicator(id: number): void {

        this.log.trace(`${LOG_PREFIX} Entering onUpdateIndicator()`);
        this.log.debug(`${LOG_PREFIX} Indicator Id = ${id}`);

        const modalRef = this.modalService.open(IndicatorsRecordsUpdationModalComponent, { centered: true, backdrop: 'static' });
        modalRef.componentInstance.id = id;
        modalRef.componentInstance.logical = this.logical;
        modalRef.componentInstance.numbered = this.numbered;

    }

    /**
     * Handles Indicators Records Deletion Requests
     */
    public onDeleteIndicator(id: number): void {

        this.log.trace(`${LOG_PREFIX} Entering onDeleteIndicator()`);
        this.log.debug(`${LOG_PREFIX} Indicator Id = ${id}`);

        const modalRef = this.modalService.open(IndicatorsRecordsDeletionModalComponent, { centered: true, backdrop: 'static' });
        modalRef.componentInstance.id = id;
    }


    /**
     * Calculates the number of records that have been skipped because of pagination
     * @returns The number of records that have been skipped because of pagination
     */
    private calculatePaginationOffset(): number {

        this.log.trace(`${LOG_PREFIX} Entering calculatePaginationOffset()`);

        if (this.stateSubject$.value.page && this.stateSubject$.value.pageSize) {
            return (this.stateSubject$.value.page - 1) * this.stateSubject$.value.pageSize
        } else {
            return 0;
        }

    }

    public truncate(text: string): string {
        return this.textUtilService.truncate(text, [200, "..."])
    }


    /**
     * Checks whether an Indicator record is currently expanded
     * @param indicator The unique identifier of the target Indicator
     * @returns True or false depending on whether the Indicator is currently expanded or not respectively
     */
    public isExpanded(indicator: Indicator | null | undefined): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isExpanded()`);
        this.log.debug(`${LOG_PREFIX} Target Indicator Id = ${JSON.stringify(indicator)}`);

        // Check if an indicator was passed in
        this.log.trace(`${LOG_PREFIX} Checking if an indicator was passed in`);
        if (indicator) {

            // A indicator was passed in
            this.log.trace(`${LOG_PREFIX} A indicator was passed in`);

            // Check whether the Indicator is currently expanded
            this.log.trace(`${LOG_PREFIX} Checking whether the Indicator is currently expanded`);
            const expanded: boolean = this.filterService.filter.expandedIndicators.some(element => element.id == indicator.id);
            this.log.debug(`${LOG_PREFIX} Expanded = ${expanded}`);

            return expanded;

        } else {


            // A indicator was not passed in
            this.log.warn(`${LOG_PREFIX} A indicator was not passed in`);

            // Return false by default
            this.log.warn(`${LOG_PREFIX} Returning false by default`);

            return false;
        }


    }


    /**
     * Checks whether an Indicator record is currently collapsed
     * @param indicator The unique identifier of the target Indicator
     * @returns True or false depending on whether the Indicator is currently collapsed or not respectively
     */
    public isCollapsed(indicator: Indicator | null | undefined): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isCollapsed()`);
        this.log.debug(`${LOG_PREFIX} Target Indicator = ${JSON.stringify(indicator)}`);

        // Check if an indicator was passed in
        this.log.trace(`${LOG_PREFIX} Checking if an indicator was passed in`);
        if (indicator) {

            // A indicator was passed in
            this.log.trace(`${LOG_PREFIX} A indicator was passed in`);

            // Check whether the Indicator is currently collapsed
            this.log.trace(`${LOG_PREFIX} Checking whether the Indicator is currently collapsed`);
            const collapsed: boolean = !(this.filterService.filter.expandedIndicators.some(element => element.id == indicator.id));
            this.log.debug(`${LOG_PREFIX} Collapsed = ${collapsed}`);

            return collapsed;

        } else {


            // A indicator was not passed in
            this.log.warn(`${LOG_PREFIX} A indicator was not passed in`);

            // Return false by default
            this.log.warn(`${LOG_PREFIX} Returning false by default`);

            return false;
        }

    }


    /**
     * Expands records
     */
    public onExpand(indicator: Indicator | null | undefined): void {

        this.log.trace(`${LOG_PREFIX} Entering onExpand()`);
        this.log.debug(`${LOG_PREFIX} Indicator = ${JSON.stringify(indicator)}`);

        // Check if an indicator was passed in
        this.log.trace(`${LOG_PREFIX} Checking if an indicator was passed in`);
        if (indicator) {

            // Clear any currently expanded indicator record
            this.log.trace(`${LOG_PREFIX} Clearing any currently expanded indicator record`);
            this.filterService.filter.expandedIndicators.length = 0;

            // Add the Indicator into the array of expanded Indicators records
            this.log.trace(`${LOG_PREFIX} Add the Indicator into the array of expanded Indicators records`);
            if (!(this.filterService.filter.expandedIndicators.some(d => d.id == indicator.id))) {
                this.filterService.filter.expandedIndicators.push(indicator);
            }

            // Reinitialise the subindicators
            this.getSubindicators(indicator.data.subindicatorsIds)
                .pipe(first()) // This will automatically complete (and therefore unsubscribe) after the first value has been emitted.
                .subscribe({
                    next: (subindicators: Indicator[] | null) => {
                        if (subindicators) {
                            this.subindicatorsSubject$.next(subindicators);
                        } else {
                            this.subindicatorsSubject$.next([]);
                        }
                    }
                });

            // Reinitialise the form field
            this.getFormField(indicator.data.formFieldId)
                .pipe(first()) // This will automatically complete (and therefore unsubscribe) after the first value has been emitted.
                .subscribe({
                    next: (formField: DataFormElement | null) => {
                        if (formField) {
                            this.formFieldSubject$.next(formField);
                        } else {
                            this.formFieldSubject$.next(null);
                        }
                    }
                });

            // Keep a local reference to the expanded indicator
            this.indicator = indicator;

            this.cd.detectChanges();

        } else {


            // A indicator was not passed in
            this.log.warn(`${LOG_PREFIX} A indicator was not passed in`);

        }

    }


    /**
     * Collapses records
     */
    public onCollapse(indicator: Indicator | null | undefined): void {

        this.log.trace(`${LOG_PREFIX} Entering onCollapse()`);
        this.log.debug(`${LOG_PREFIX} Indicator Id = ${JSON.stringify(indicator)}`);

        // Check if an indicator was passed in
        this.log.trace(`${LOG_PREFIX} Checking if an indicator was passed in`);
        if (indicator) {

            // A indicator was passed in
            this.log.trace(`${LOG_PREFIX} A indicator was passed in`);

            // Remove the Indicator from the array of expanded Indicators
            this.log.trace(`${LOG_PREFIX} Remove the Indicator from the array of expanded Indicators`);
            let index: number = this.filterService.filter.expandedIndicators.findIndex(d => d.id == indicator.id)
            if (index != -1) {
                this.filterService.filter.expandedIndicators.splice(index, 1);
            }

            // Clear the local reference to the expanded indicator
            this.indicator = null;

            this.cd.detectChanges();

        } else {


            // A indicator was not passed in
            this.log.warn(`${LOG_PREFIX} A indicator was not passed in`);

        }

    }

}
