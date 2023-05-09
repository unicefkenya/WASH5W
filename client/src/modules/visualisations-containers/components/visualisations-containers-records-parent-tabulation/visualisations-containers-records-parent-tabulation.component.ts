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
import { Subscription, BehaviorSubject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { VisualisationsContainersRecordsCreationModalComponent } from '@modules/visualisations-containers/containers/visualisations-containers-records-creation-modal/visualisations-containers-records-creation-modal.component';
import { VisualisationsContainersRecordsDeletionModalComponent } from '@modules/visualisations-containers/containers/visualisations-containers-records-deletion-modal/visualisations-containers-records-deletion-modal.component';
import { VisualisationsContainersRecordsUpdationModalComponent } from '@modules/visualisations-containers/containers/visualisations-containers-records-updation-modal/visualisations-containers-records-updation-modal.component';
import { VisualisationsContainersDataService } from '@modules/visualisations-containers/services/visualisations-containers-data.service';
import { VisualisationContainerState } from '@modules/visualisations-containers/models/visualisation-container-state.model';
import { VisualisationContainer } from '@modules/visualisations-containers/models/visualisation-container.model';
import { FilterService } from '@app/app-filter.service';
import { Context } from '@modules/contexts/models/context.model';

const LOG_PREFIX: string = "[Visualisations Containers Records Parent Tabulation Component]";

@Component({
    selector: 'sb-visualisations-containers-records-parent-tabulation',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './visualisations-containers-records-parent-tabulation.component.html',
    styleUrls: ['visualisations-containers-records-parent-tabulation.component.scss'],
})
export class VisualisationsContainersRecordsParentTabulationComponent implements OnInit, OnDestroy, AfterViewInit {

    // Keep a local reference of the currently active context
    private activeContext: Context | null | undefined = null;

    // Keeps a local reference to the displayed loading animation component.
    // Makes it possible to trigger the loading animation when a slow background service is invoked.
    private _animation!: LoadingAnimationComponent;

    // Keeps a local reference to the displayed pagination component.
    // Makes it possible to initialise / update the pagination component when the total number of records changes.
    private _pagination!: PaginationComponent;

    // Keeps tabs on the records skipped due to pagination
    public paginationOffset: number = 0;

    // Holds the required records state
    // Makes it possible to supply the filter, sort or search criteria that should be applied to records on retrieval.
    private stateSubject$ = new BehaviorSubject<VisualisationContainerState>({
        page: null,
        pageSize: null,
        searchTerm: null,
        sortColumn: 'id',
        sortDirection: 'asc',
        id: null,
        contextId: null,
        typesIds: null,
        parentId: null,
        navTitle: null,
        pageTitle: null
    });
    readonly state$ = this.stateSubject$.asObservable();

    // Central gathering point for all the component's subscriptions.
    // Makes it efficient to unsubscribe from all subscriptions when the component is destroyed.   
    private _subscriptions: Subscription[] = [];

    // Keeps tabs of whether the component has been successfully initialised
    public initialised: boolean = false;

    constructor(
        private filterService: FilterService,
        private cd: ChangeDetectorRef,
        public visualisationsContainersDataService: VisualisationsContainersDataService,
        private modalService: NgbModal,
        private log: NGXLogger) {

    }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

        // Initialise the active Context from the global filter
        this.initialiseActiveContext(() => {

            // Listen to and react to global context changes
            this.initialiseActiveContextChangesHandler(() => {

                // Set the default active Context's id as the contextId in the desired records state
                this.initialiseDesiredRecordsState(() => {

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

                // Mark After-View-Init as complete
                this.log.trace(`${LOG_PREFIX} After-View-Init completed`);
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

                            // Make a copy of the desired records state
                            this.log.trace(`${LOG_PREFIX} Making a copy of the desired records state`);
                            let copy: VisualisationContainerState = Object.assign({}, this.stateSubject$.value);

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
     * Presets default values in the desired records state bean
     * @param callback The function to call when done
     */
    private initialiseDesiredRecordsState(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseDesiredRecordsState()`);

        // Make a copy of the desired records state
        this.log.trace(`${LOG_PREFIX} Making a copy of the desired records state`);
        let copy: VisualisationContainerState = Object.assign({}, this.stateSubject$.value);

        // Set the active Context as the desired Context
        this.log.trace(`${LOG_PREFIX} Setting the active Context as the desired Context`);
        Object.assign(copy, { contextId: this.activeContext?.id });

        // Broadcast the newly desired record state
        this.log.trace(`${LOG_PREFIX} Broadcasting the newly desired record state`);
        this.stateSubject$.next(copy);

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

                        // Retrieve the Visualisation Container records corresponding to the passed in state
                        this.log.trace(`${LOG_PREFIX} Retrieving the Visualisation Container records corresponding to the passed in state`);
                        this.visualisationsContainersDataService
                            .getVisualisationsContainers(true, state)
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
            this.visualisationsContainersDataService.loading$
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
            this.visualisationsContainersDataService.totalRecords$.subscribe(
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
     * Retrieves the visualisations containers that belong to the parent with the specified id
     * @param parentId the parent id
     * @returns the visualisations containers
     */
    public getNestedVisualisationContainers(parentId: number): VisualisationContainer[] {
        const temp: VisualisationContainer[] | undefined = this.visualisationsContainersDataService.nestedVisualisationContainers.get(parentId);
        return temp? temp : [];
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
            let copy: VisualisationContainerState = Object.assign({}, this.stateSubject$.value);

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
            let copy: VisualisationContainerState = Object.assign({}, this.stateSubject$.value);

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
            let copy: VisualisationContainerState = Object.assign({}, this.stateSubject$.value);

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
     * Handles Visualisations Containers Rights Records Addition Requests
     */
    public onAddVisualisationContainer(typeId: number): void {

        this.log.trace(`${LOG_PREFIX} Entering onAddVisualisationContainer()`);

        const modalRef = this.modalService.open(VisualisationsContainersRecordsCreationModalComponent, { centered: true, backdrop: 'static' });
        modalRef.componentInstance.contextId = this.filterService.filter.activeContext?.id;
        modalRef.componentInstance.typeId = typeId;
        modalRef.componentInstance.parentId = null;

    }


    /**
     * Handles Visualisations Containers Records Updation Requests
     */
    public onUpdateVisualisationContainer(id: number): void {

        this.log.trace(`${LOG_PREFIX} Entering onUpdateVisualisationContainer()`);
        this.log.debug(`${LOG_PREFIX} Visualisation Container Id = ${id}`);

        const modalRef = this.modalService.open(VisualisationsContainersRecordsUpdationModalComponent, { centered: true, backdrop: 'static' });
        modalRef.componentInstance.id = id;

    }

    /**
     * Handles Visualisations Containers Records Deletion Requests
     */
    public onDeleteVisualisationContainer(id: number): void {

        this.log.trace(`${LOG_PREFIX} Entering onDeleteVisualisationContainer()`);
        this.log.debug(`${LOG_PREFIX} Visualisation Container Id = ${id}`);

        const modalRef = this.modalService.open(VisualisationsContainersRecordsDeletionModalComponent, { centered: true, backdrop: 'static' });
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

}
