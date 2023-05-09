import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Route, Router, RouterEvent } from '@angular/router';
import { FilterService } from '@app/app-filter.service';
import { ConnectivityStatusService } from '@common/services';
import { DateUtilService } from '@common/services/date-util.service';
import { Context } from '@modules/contexts/models/context.model';
import { ContextsDataService } from '@modules/contexts/services/contexts-data.service';
import { EntitiesTypesDataService } from '@modules/entities-types/services/entities-types-data.service';
import { TimestepEnum } from '@modules/timesteps/models/timestep.enum';
import { VisualisationContainer } from '@modules/visualisations-containers/models/visualisation-container.model';
import { VisualisationsContainersDataService } from '@modules/visualisations-containers/services/visualisations-containers-data.service';
import { VisualisationsFormatsDataService } from '@modules/visualisations-formats/services/visualisations-formats-data.service';
import { Visualisation } from '@modules/visualisations/models/visualisation.model';
import { VisualisationsDataService } from '@modules/visualisations/services/visualisations-data.service';
import { NGXLogger } from 'ngx-logger';
import { Subscription, first, BehaviorSubject, filter, takeUntil } from 'rxjs';

const LOG_PREFIX: string = "[Dashboards Home Page]";

@Component({
    selector: 'sb-dashboard-home-page',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './dashboard-home-page.component.html',
    styleUrls: ['dashboard-home-page.component.scss'],
})
export class DashboardHomePageComponent implements OnInit {

    // Keeps tab of the page title
    private titleSubject$ = new BehaviorSubject<String | null>(null);
    readonly title$ = this.titleSubject$.asObservable();

    // Keeps tab of the page subtitle
    private subtitleSubject$ = new BehaviorSubject<String | null>(null);
    readonly subtitle$ = this.subtitleSubject$.asObservable();

    // Keeps tabs of the active visualisation page
    public page!: VisualisationContainer | null;

    // Keeps tabs of the page's tabs if tabbed
    public pageTabs: VisualisationContainer[] = [];

    // Keeps tabs on the active tab
    public activePageTab: VisualisationContainer | null = null;

    // Keep tabs on the currently active visualisations
    //private visualisationsSubject$ = new BehaviorSubject<Visualisation[]>([]);
    //readonly visualisations$ = this.visualisationsSubject$.asObservable();
    public visualisations: Visualisation[] = [];

    // Keep tabs of visualisations mapped against the rows within which they should be displayed
    //private visualisationsMappingSubject$ = new BehaviorSubject<Map<number, Visualisation[]>>(new Map());
    //readonly visualisationsMapping$ = this.visualisationsMappingSubject$.asObservable();
    public visualisationsMapping: Map<number, Visualisation[]> = new Map();

    // Keep tabs on the id of the currently active context
    contextId: number | null | undefined = null;

    // Keep tabs of the currently active administrative unit
    administrativeUnitId: number | null | undefined = null;

    // Instantiate a central gathering point for all the component's subscriptions.
    // Makes it easier to unsubscribe from all subscriptions when the component is destroyed.   
    private _subscriptions: Subscription[] = [];

    // Keeps tabs of whether the page has been successfully initialised
    public initialised: boolean = false;

    // Keeps tabs of whether the dashboard is a placeholder
    public placeholder: boolean = false;
    
    constructor(
        public contextsDataService: ContextsDataService,
        public connectivityStatusService: ConnectivityStatusService,
        public filterService: FilterService,
        public entitiesTypesDataService: EntitiesTypesDataService,
        public visualisationsFormatsDataService: VisualisationsFormatsDataService,
        public visualisationsContainersDataService: VisualisationsContainersDataService,
        public visualisationsDataService: VisualisationsDataService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private cd: ChangeDetectorRef,
        private log: NGXLogger) { }


    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Initialising Component`);

        this._subscriptions.push(

            this.activatedRoute.paramMap.subscribe(params => {

                const _visualisationContainerId: string | null = params.get('containerId');
                const visualisationContainerId: number = _visualisationContainerId ? parseInt(_visualisationContainerId) : 0;

                if (visualisationContainerId == -1) {

                    this.titleSubject$.next("Dashboard");
                    this.subtitleSubject$.next("Placeholder");
                    this.placeholder = true;
                    this.initialised = true;
                    this.cd.detectChanges();

                } else {

                    // Retrieve and cache Contexts locally
                    this.initialiseContexts(() => {

                        // Initialise the context corresponding to the passed in id
                        this.initialiseActiveContext(params.get('contextId'), () => {

                            // Set the active Visualisation Container to the Visualisation Container with the selected id
                            this.initialiseActiveVisualisationContainer(params.get('containerId'), () => {

                                // Set the active Visualisation Container tabs
                                this.initialiseActiveVisualisationContainerTabs(() => {

                                    // Set the active Visualisations
                                    this.initialiseActiveVisualisations(() => {

                                        // Monitor and react to administrative units changes
                                        this.initialiseAdministrativeUnitsChangesHandler(() => {
                                            // Mark Init as complete
                                            this.log.trace(`${LOG_PREFIX} Init completed`);
                                            this.placeholder = false;
                                            this.initialised = true;
                                            this.cd.detectChanges();
                                        })

                                    });

                                })

                            });

                        })


                    })
                }



            }));


    }

    @HostListener('window:beforeunload')
    ngOnDestroy() {

        this.log.trace(`${LOG_PREFIX} Destroying Component`);

        // Clear all subscriptions
        this.log.trace(`${LOG_PREFIX} Clearing all subscriptions`);
        this._subscriptions.forEach(s => s.unsubscribe());
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
                abbreviation: null
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
     * Sets the active Context to the context with the passed in id
     * @param callback The function to call when done
     */
    private initialiseActiveContext(_contextId: string | null, callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseActiveContext()`);

        // Check if the Active Context id was passed in
        this.log.trace(`${LOG_PREFIX} Checking if the Active Context id was passed in`);
        if (_contextId != null) {

            // The Active Context id was passed in
            this.log.trace(`${LOG_PREFIX} The Active Context id was passed in`);
            const contextId: number = parseInt(_contextId);
            this.log.trace(`${LOG_PREFIX} Context Id = ${contextId}`);

            // Get the context corresponding to the active container
            const ctxt: Context | undefined = this.contextsDataService.records.find(c => c.id == contextId);

            // Check if the active Context has been set in the global filter
            this.log.trace(`${LOG_PREFIX} Checking if the active Context has been set in the global filter`);
            if (this.filterService.filter.activeContext) {

                // The active Context has been set in the global filter
                this.log.trace(`${LOG_PREFIX} The active Context has been set in the global filter`);

                // Check if the active Context corresponds to the active page's context
                this.log.trace(`${LOG_PREFIX} Checking if the active Context corresponds to the active page's context`);
                if (JSON.stringify(ctxt) !== JSON.stringify(this.filterService.filter.activeContext)) {

                    // Update the global filter
                    this.log.trace(`${LOG_PREFIX} Updating the global filter`);
                    this.filterService.update({ activeContext: ctxt });

                }

                // Return
                this.log.trace(`${LOG_PREFIX} Returning`);
                callback();

            } else {

                // The active Context has not been set in the global filter
                this.log.trace(`${LOG_PREFIX} The active Context has not been set in the global filter`);

                // Update the global filter
                this.log.trace(`${LOG_PREFIX} Updating the global filter`);
                this.filterService.update({ activeContext: ctxt });

                // Return
                this.log.trace(`${LOG_PREFIX} Returning`);
                callback();

            }

        } else {


            // The Active Context id was not passed in
            this.log.trace(`${LOG_PREFIX} The Active Context id was not passed in`);

            // Update the global filter
            this.log.trace(`${LOG_PREFIX} Updating the global filter`);
            this.filterService.update({ activeContext: null });

            // Return
            this.log.trace(`${LOG_PREFIX} Returning`);
            callback();

        }


    }

    /**
     * Sets the selected Visualisation Container  as the active Visualisation Container in the global filter
     * @param visualisationContainerId The id of the selected Visualisation Container
     * @param callback The function to call when done
     */
    private initialiseActiveVisualisationContainer(_visualisationContainerId: string | null, callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseActiveVisualisationContainer()`);

        // Check if the active Visualisation Container id was passed in
        this.log.trace(`${LOG_PREFIX} Checking if the active Visualisation Container id was passed in`);
        if (_visualisationContainerId != null) {

            // The active Visualisation Container id was passed in
            this.log.trace(`${LOG_PREFIX} The active Visualisation Container id was passed in`);

            const visualisationContainerId: number = parseInt(_visualisationContainerId);


            // Retrieve the Visualisations Containers records corresponding to the passed in id
            this.log.trace(`${LOG_PREFIX} Retrieving the Visualisations Containers records corresponding to the passed in id`);
            this.visualisationsContainersDataService
                .getVisualisationsContainers(false, {
                    page: null,
                    pageSize: null,
                    searchTerm: null,
                    sortColumn: null,
                    sortDirection: null,
                    id: visualisationContainerId,
                    contextId: null,
                    typesIds: null,
                    parentId: null,
                    navTitle: null,
                    pageTitle: null
                })
                .pipe(first())
                .subscribe({
                    next: (containers: VisualisationContainer[]) => {

                        // Active Visualisation Container retrieved
                        this.log.trace(`${LOG_PREFIX} Active Visualisation Container retrieved`);
                        this.log.debug(`${LOG_PREFIX} Visualisation Container = ${JSON.stringify(containers)}`);

                        // Set the Active Visualisation Container retrieved
                        this.log.trace(`${LOG_PREFIX} Set the Active Visualisation Container retrieved`);
                        if (containers.length > 0) {
                            this.page = containers[0];
                            this.titleSubject$.next(this.getTitle());
                            this.subtitleSubject$.next(this.getSubtitle());
                        } else {
                            this.page = null;
                            this.titleSubject$.next(null);
                            this.subtitleSubject$.next(null);
                        }

                        // Return
                        this.log.trace(`${LOG_PREFIX} Returning`);
                        callback();


                    }
                });

        } else {


            // The active Visualisation Container id was not passed in
            this.log.trace(`${LOG_PREFIX} The active Visualisation Container id was not passed in`);

            // Set the active Visualisation Container to null
            this.log.trace(`${LOG_PREFIX} Setting the active Visualisation Container to null`);
            this.page = null;

            // Return
            this.log.trace(`${LOG_PREFIX} Returning`);
            callback();

        }


    }


    /**
     * Sets the tabs of the active Visualisation Container if any
     * @param callback The function to call when done
     */
    private initialiseActiveVisualisationContainerTabs(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseActiveVisualisationContainerTabs()`);

        if (this.page?.id) {

            // Retrieve the Visualisations Containers records corresponding to the passed in state
            this.log.trace(`${LOG_PREFIX} Retrieving the Visualisations Containers records corresponding to the passed in state`);
            this.visualisationsContainersDataService
                .getVisualisationsContainers(false, {
                    page: null,
                    pageSize: null,
                    searchTerm: null,
                    sortColumn: 'id',
                    sortDirection: 'asc',
                    id: null,
                    contextId: this.filterService.filter.activeContext?.id,
                    typesIds: [3], // Tabs
                    parentId: this.page?.id,
                    navTitle: null,
                    pageTitle: null
                })
                .pipe(first())
                .subscribe({
                    next: (containers: VisualisationContainer[]) => {

                        // Active Visualisations Containers tabs retrieved
                        this.log.trace(`${LOG_PREFIX} Active Visualisation Container tabs retrieved`);
                        this.log.debug(`${LOG_PREFIX} Active Visualisation Container tabs = ${JSON.stringify(containers)}`);


                        // Set the Active Visualisations Containers tabs retrieved
                        this.log.trace(`${LOG_PREFIX} Setting the Active Visualisation Container tabs retrieved`);
                        if (containers.length > 0) {
                            this.pageTabs = containers;
                            this.activePageTab = containers[0];

                        } else {
                            this.pageTabs.length = 0;
                            this.activePageTab = null;
                        }

                        // Return
                        this.log.trace(`${LOG_PREFIX} Returning`);
                        callback();


                    }
                });

        } else {

            // Clear the tabs
            this.pageTabs.length = 0;

            // Return
            this.log.trace(`${LOG_PREFIX} Returning`);
            callback();
        }

    }

    /**
     * Sets the tabs of the active Visualisations if any
     * @param callback The function to call when done
     */
    private initialiseActiveVisualisations(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseActiveVisualisations()`);

        // Clear the current visualisations
        this.visualisations.length = 0;
        this.visualisationsMapping.clear();

        // Check if the visualisation is tab-based
        this.log.trace(`${LOG_PREFIX} Checking if the visualisation is tab-based`);
        if (this.pageTabs.length > 0) {

            // The visualisation is tab-based
            this.log.trace(`${LOG_PREFIX} The visualisation is tab-based`);

            if (this.activePageTab?.id) {

                this.initialiseVisualisations(this.activePageTab.id, () => {

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();

                });

            } else {

                // Return
                this.log.trace(`${LOG_PREFIX} Returning`);
                callback();
            }

        } else {

            // The visualisation is page-based
            this.log.trace(`${LOG_PREFIX} The visualisation is page-based`);

            if (this.page?.id) {

                this.initialiseVisualisations(this.page.id, () => {

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();

                });

            } else {

                // Return
                this.log.trace(`${LOG_PREFIX} Returning`);
                callback();
            }

        }





    }



    /**
     * Subscribe and react to administrative unit changes
     * @param callback The function to call when done
     */
    private initialiseAdministrativeUnitsChangesHandler(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseAdministrativeUnitsChangesHandler()`);

        // Subscribe to desired administrative unit changes and react to them
        this.log.trace(`${LOG_PREFIX} Subscribing to desired administrative units changes and reacting to them`);
        this._subscriptions.push(
            this.filterService.currentFilter$
                .subscribe({
                    next: (filter) => {

                        if (filter.activeAdministrativeUnit?.id != this.administrativeUnitId) {

                            // Active administrative unit changed
                            this.log.trace(`${LOG_PREFIX} Active administrative unit changed`);

                            // Keep a local reference to the active administrative unit id for comparison purposes
                            this.administrativeUnitId = filter.activeAdministrativeUnit?.id;

                            this.subtitleSubject$.next(this.getSubtitle());

                            this.cd.detectChanges();

                        }
                    }
                })
        );

        // Transfer control to the callback function
        callback();

    }

    public initialiseVisualisations(containerId: number, callback: () => void): void {

        // Retrieve the Visualisations that should be displayed in the active container
        this.log.trace(`${LOG_PREFIX} Retrieving the Visualisations that should be displayed in the active container`);
        this.visualisationsDataService
            .getVisualisations(false, {
                page: null,
                pageSize: null,
                searchTerm: null,
                sortColumn: 'id',
                sortDirection: 'asc',
                id: null,
                visualisationContainerId: containerId,
                visualisationTypeId: null,
                visualisationDataTypeId: null,
                name: null
            })
            .pipe(first())
            .subscribe({
                next: (visualisations: Visualisation[]) => {

                    // Visualisations retrieved
                    this.log.trace(`${LOG_PREFIX} Visualisations retrieved`);
                    this.log.debug(`${LOG_PREFIX} Visualisations = ${JSON.stringify(visualisations)}`);

                    if (visualisations.length > 0) {

                        // Initialise the ungrouped visualisations container
                        this.log.trace(`${LOG_PREFIX} Initialising the ungrouped visualisations container`);
                        this.visualisations = visualisations;

                        // Set the Visualisations against the rows that they should be displayed
                        this.log.trace(`${LOG_PREFIX} Setting the Visualisations against the rows that they should be displayed`);
                        let row: number = 1;
                        for (let visualisation of visualisations) {

                            let temp: Visualisation[] | undefined = this.visualisationsMapping.get(row);

                            switch (visualisation.data.visualisationTypeId) {

                                case 1: // Basic Line Chart
                                case 2: // Basic Column Chart
                                case 3: // Stacked Column Chart
                                case 4: // Basic Bar Chart
                                case 5: // Stacked Bar Chart
                                case 6: // Pie Chart
                                case 7: // Semi Circle Donut

                                    // Display two per row
                                    if (temp) {
                                        if (temp.length == 2) {
                                            row += 1;
                                            this.visualisationsMapping.set(row, [visualisation]);
                                        } else {
                                            temp.push(visualisation);
                                        }
                                    } else {
                                        this.visualisationsMapping.set(row, [visualisation]);
                                    }

                                    break;

                                case 8: // Choropleth Map

                                    // Display one per row
                                    if (temp) {
                                        if (temp.length > 0) {
                                            row += 1;
                                            this.visualisationsMapping.set(row, [visualisation]);
                                        } else {
                                            temp.push(visualisation);
                                        }
                                    } else {
                                        this.visualisationsMapping.set(row, [visualisation]);
                                    }

                                    break;

                                case 9: // Basic Table

                                    // Display one per row
                                    if (temp) {
                                        if (temp.length > 0) {
                                            row += 1;
                                            this.visualisationsMapping.set(row, [visualisation]);
                                        } else {
                                            temp.push(visualisation);
                                        }
                                    } else {
                                        this.visualisationsMapping.set(row, [visualisation]);
                                    }

                                    break;

                                case 10: // Count Card

                                    // Display four per row
                                    if (temp) {
                                        if (temp.length == 4) {
                                            row += 1;
                                            this.visualisationsMapping.set(row, [visualisation]);
                                        } else {
                                            temp.push(visualisation);
                                        }
                                    } else {
                                        this.visualisationsMapping.set(row, [visualisation]);
                                    }

                                    break;

                            }


                        }

                    }


                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();


                }
            });
    }

    public getTitle(): string {
        return `${this.page?.data.pageTitle ? this.page.data.pageTitle : "Dashboard"}`;


    }

    public getSubtitle(): string {
        return `${this.page?.data.navTitle ? this.page.data.navTitle : ""} ${this.filterService.filter.activeAdministrativeUnit?.data.name ? " | " + this.filterService.filter.activeAdministrativeUnit?.data.name : ""}`;

    }

    public isChart(visualisation: Visualisation): boolean {
        switch (visualisation.data.visualisationTypeId) {
            case 1: // Basic Line Chart
            case 2: // Basic Column Chart
            case 3: // Stacked Column Chart
            case 4: // Basic Bar Chart
            case 5: // Stacked Bar Chart
            case 6: // Pie Chart
            case 7: // Semi Circle Donut
                return true;
            default:
                return false;
        }
    }


    public isMap(visualisation: Visualisation): boolean {
        switch (visualisation.data.visualisationTypeId) {
            case 8: // Choropleth Map
                return true;
            default:
                return false;
        }
    }

    public isTable(visualisation: Visualisation): boolean {
        switch (visualisation.data.visualisationTypeId) {
            case 9: // Basic Table
                return true;
            default:
                return false;
        }
    }

    public isCard(visualisation: Visualisation): boolean {
        switch (visualisation.data.visualisationTypeId) {
            case 10: // Count Card
                return true;
            default:
                return false;
        }
    }


    public onChangeTab(tab: VisualisationContainer): void {
        this.activePageTab = tab;
        //this.titleSubject$.next(this.getTitle(this.activeTab));
        this.initialiseActiveVisualisations(() => {
            this.cd.detectChanges();
        });


    }




}
