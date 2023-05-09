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
import { LogicalElementsRecordsCreationModalComponent } from '@modules/logical-elements/containers/logical-elements-records-creation-modal/logical-elements-records-creation-modal.component';
import { LogicalElementsRecordsDeletionModalComponent } from '@modules/logical-elements/containers/logical-elements-records-deletion-modal/logical-elements-records-deletion-modal.component';
import { LogicalElementsRecordsUpdationModalComponent } from '@modules/logical-elements/containers/logical-elements-records-updation-modal/logical-elements-records-updation-modal.component';
import { LogicalElementsDataService } from '@modules/logical-elements/services/logical-elements-data.service';
import { FormControl, FormGroup } from '@angular/forms';
import { LogicalElementsTypesDataService } from '@modules/logical-elements-types/services/logical-elements-types-data.service';
import { LogicalElementType } from '@modules/logical-elements-types/models';
import { FilterService } from '@app/app-filter.service';
import { LogicalElement } from '@modules/logical-elements/models/logical-element.model';
import { LogicalElementState } from '@modules/logical-elements/models/logical-element-state.model';
import { OperatorsDataService } from '@modules/operators/services/operators-data.service';
import { ContextsDataService } from '@modules/contexts/services/contexts-data.service';
import { Context } from '@modules/contexts/models/context.model';

const LOG_PREFIX: string = "[Logical Elements Records Tabulation Component]";

@Component({
    selector: 'sb-logical-elements-records-tabulation',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './logical-elements-records-tabulation.component.html',
    styleUrls: ['logical-elements-records-tabulation.component.scss'],
})
export class LogicalElementsRecordsTabulationComponent implements OnInit, OnDestroy, AfterViewInit {

    // Keeps a local reference of the currently active context
    private activeContext: Context | null | undefined = null;

    // Keeps a local reference to the displayed loading animation component.
    // Makes it possible to trigger the loading animation when a slow background service is invoked.
    private _animation!: LoadingAnimationComponent;

    // Keeps a local reference to the displayed pagination component.
    // Makes it possible to initialise / update the pagination component when the total number of records changes.
    private _pagination!: PaginationComponent;

    // Holds the required records state
    // Makes it possible to supply the filter, sort or search criteria that should be applied to records on retrieval.
    private stateSubject$ = new BehaviorSubject<LogicalElementState>({
        page: 1,
        pageSize: 20,
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

    // Keeps tabs on the records skipped due to pagination
    paginationOffset: number = 0;

    // Keeps tabs of whether the component has been successfully initialised
    public initialised: boolean = false;

    // Central gathering point for all the component's subscriptions.
    // Makes it efficient to unsubscribe from all subscriptions when the component is destroyed.   
    private _subscriptions: Subscription[] = [];

    // Instantitate a new reactive Form Group
    // This will allow us to define and enforce the validation rules for all the form controls.
    logicalElementsForm = new FormGroup({
        contextId: new FormControl<number | null>(null, [
        ]),
        typeId: new FormControl<number | null>(null, [
        ]),
    });

    constructor(
        private cd: ChangeDetectorRef,
        public contextsDataService: ContextsDataService,
        public logicalElementsTypesDataService: LogicalElementsTypesDataService,
        public logicalElementsDataService: LogicalElementsDataService,
        public operatorsDataService: OperatorsDataService,
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

                            // Make a copy of the desired records state
                            this.log.trace(`${LOG_PREFIX} Making a copy of the desired records state`);
                            let copy: LogicalElementState = Object.assign({}, this.stateSubject$.value);

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

        this.log.trace(`${LOG_PREFIX} Get the Active Context`);
        const activeContext: Context | null | undefined = this.filterService.filter.activeContext;
        this.log.debug(`${LOG_PREFIX} Active Context = ${JSON.stringify(activeContext)}`);

        this.log.trace(`${LOG_PREFIX} Get the Active Logical Element Type`);
        const activeLogicalElementType: LogicalElementType | null | undefined = this.filterService.filter.activeLogicalElementType;
        this.log.debug(`${LOG_PREFIX} Active Logical Element Type = ${JSON.stringify(activeLogicalElementType)}`);

        // Make a copy of the desired records state
        this.log.trace(`${LOG_PREFIX} Making a copy of the desired records state`);
        let copy: LogicalElementState = Object.assign({}, this.stateSubject$.value);

        // Set the active Logical Element Type as the desired Logical Element Type
        this.log.trace(`${LOG_PREFIX} Setting the active Logical Element Type as the desired Logical Element Type`);
        Object.assign(copy, { contextId: activeContext?.id, typesIds: activeLogicalElementType && activeLogicalElementType.id ? [activeLogicalElementType.id] : null });

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
        this.logicalElementsForm.get('contextId')?.setValue((activeContext && activeContext.id) ? activeContext.id : null);

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

        if (!(this.stateSubject$.value.typesIds && this.stateSubject$.value.typesIds.some(t => t == typeId))) {

            // The specified Logical Element Type is different from the current Logical Element Type
            this.log.trace(`${LOG_PREFIX} The specified Logical Element Type is different from the current Logical Element Type`);

            // Update the global filter
            this.log.trace(`${LOG_PREFIX} Updating the global filter`);
            this.filterService.update({ activeLogicalElementType: this.logicalElementsTypesDataService.records.find(a => a.id == typeId) });

            // Make a copy of the desired records state
            this.log.trace(`${LOG_PREFIX} Making a copy of the desired records state`);
            let copy: LogicalElementState = Object.assign({}, this.stateSubject$.value);

            // Update the copy of the desired records state
            this.log.trace(`${LOG_PREFIX} Updating the copy of the desired records state`);
            Object.assign(copy, { typesIds: [typeId], page: 1 });

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
     * Handles Logical Elements Records Addition Requests
     */
    public onAddLogicalElement(): void {

        this.log.trace(`${LOG_PREFIX} Entering onAddLogicalElement()`);
        const modalRef = this.modalService.open(LogicalElementsRecordsCreationModalComponent, { centered: true, backdrop: 'static' });
        modalRef.componentInstance.contextId = this.stateSubject$.value.contextId;
        modalRef.componentInstance.typeId = this.stateSubject$.value.typesIds && this.stateSubject$.value.typesIds.length > 0 ? this.stateSubject$.value.typesIds[0] : null;
    }

    /**
     * Handles Logical Elements Records Updation Requests
     * @param id The unique identifier of the Logical Element record to update
     */
    public onUpdateLogicalElement(id: number): void {

        this.log.trace(`${LOG_PREFIX} Entering onUpdateLogicalElement()`);
        this.log.debug(`${LOG_PREFIX} Logical Element Record Id = ${id}`);
        const modalRef = this.modalService.open(LogicalElementsRecordsUpdationModalComponent, { centered: true, backdrop: 'static' });
        modalRef.componentInstance.id = id;

    }

    /**
     * Handles Logical Elements Records Deletion Requests
     * * @param id The unique identifier of the Logical Element record to delete
     */
    public onDeleteLogicalElement(id: number): void {

        this.log.trace(`${LOG_PREFIX} Entering onDeleteLogicalElement()`);
        this.log.debug(`${LOG_PREFIX} Logical Element Record Id = ${id}`);
        const modalRef = this.modalService.open(LogicalElementsRecordsDeletionModalComponent, { centered: true, backdrop: 'static' });
        modalRef.componentInstance.id = id;
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
