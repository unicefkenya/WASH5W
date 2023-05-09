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
import { Subscription, first, BehaviorSubject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LogicalHierarchiesDataService } from '@modules/logical-hierarchies/services/logical-hierarchies-data.service';
import { FormControl, FormGroup } from '@angular/forms';
import { LogicalSchemesDataService } from '@modules/logical-schemes/services/logical-schemes-data.service';
import { FilterService } from '@app/app-filter.service';
import { LogicalHierarchy } from '@modules/logical-hierarchies/models/logical-hierarchy.model';
import { LogicalHierarchyState } from '@modules/logical-hierarchies/models/logical-hierarchy-state.model';
import { OperatorsDataService } from '@modules/operators/services/operators-data.service';
import { LogicalElementsTypesDataService } from '@modules/logical-elements-types/services/logical-elements-types-data.service';
import { LogicalStructuresDataService } from '@modules/logical-structures/services/logical-structures-data.service';
import { LogicalStructure } from '@modules/logical-structures/models/logical-structure.model';
import { LogicalHierarchiesRecordsCreationModalComponent } from '@modules/logical-hierarchies/containers/logical-hierarchies-records-creation-modal/logical-hierarchies-records-creation-modal.component';
import { LogicalHierarchiesRecordsDeletionModalComponent } from '@modules/logical-hierarchies/containers/logical-hierarchies-records-deletion-modal/logical-hierarchies-records-deletion-modal.component';
import { ContextsDataService } from '@modules/contexts/services/contexts-data.service';
import { Context } from '@modules/contexts/models/context.model';
import { TextUtilService } from '@common/services/text-util.service';

const LOG_PREFIX: string = "[Logical Hierarchies Records Selection Component]";

@Component({
    selector: 'sb-logical-hierarchies-records-selection',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './logical-hierarchies-records-selection.component.html',
    styleUrls: ['logical-hierarchies-records-selection.component.scss'],
})
export class LogicalHierarchiesRecordsSelectionComponent implements OnInit, OnDestroy, AfterViewInit {

    // Allows the parent component to inject the desired selection mode: single or multi
    @Input() public selectionMode: string = "single";

    // Allows the parent component to inject the desired Logical Hierarchy
    @Input() public desired: LogicalHierarchy[] = [];

    // Allows the parent component to inject the undesired Logical Hierarchies
    // Ignored if the desired Logical Hierarchies has been specified
    @Input() public undesired: LogicalHierarchy[] = [];

    // Allows the parent component to inject the previously selected Logical Hierarchies
    @Input() public selected: LogicalHierarchy[] = [];

    // Broadcasts radio buttons selection events
    @Output() public select: EventEmitter<LogicalHierarchy> = new EventEmitter<LogicalHierarchy>();

    // Broadcasts checkboxes check events
    @Output() public check: EventEmitter<LogicalHierarchy> = new EventEmitter<LogicalHierarchy>();

    // Broadcasts checkboxes uncheck events
    @Output() public uncheck: EventEmitter<LogicalHierarchy> = new EventEmitter<LogicalHierarchy>();


    // Keeps a local reference to the displayed loading animation component.
    // Makes it possible to trigger the loading animation when a slow background service is invoked.
    private _animation!: LoadingAnimationComponent;

    // Keeps a local reference to the displayed pagination component.
    // Makes it possible to initialise / update the pagination component when the total number of records changes.
    private _pagination!: PaginationComponent;

    // Holds the required records state
    // Makes it possible to supply the filter, sort or search criteria that should be applied to records on retrieval.
    private stateSubject$ = new BehaviorSubject<LogicalHierarchyState>({
        page: 1,
        pageSize: 3,
        searchTerm: null,
        sortColumn: 'id',
        sortDirection: 'asc',
        contextId: null,
        typesIds: null,
        commissionerId: null,
        commissionerName: null,
        responsibleId: null,
        responsibleName: null
    });
    readonly state$ = this.stateSubject$.asObservable();

    // Keeps tabs on the records skipped due to pagination
    paginationOffset: number = 0;

    // Keeps tabs of whether the component has been successfully initialised
    public initialised: boolean = false;

    // Instantitate a new reactive Form Group
    // This will allow us to define and enforce the validation rules for all the form controls.
    logicalHierarchiesForm = new FormGroup({

    });

    // Central gathering point for all the component's subscriptions.
    // Makes it efficient to unsubscribe from all subscriptions when the component is destroyed.   
    private _subscriptions: Subscription[] = [];

    constructor(
        private cd: ChangeDetectorRef,
        public contextsDataService: ContextsDataService,
        public logicalElementsTypesDataService: LogicalElementsTypesDataService,
        public logicalSchemesDataService: LogicalSchemesDataService,
        public logicalStructuresDataService: LogicalStructuresDataService,
        public logicalHierarchiesDataService: LogicalHierarchiesDataService,
        public operatorsDataService: OperatorsDataService,
        public filterService: FilterService,
        public textUtilService: TextUtilService,
        private modalService: NgbModal,
        private log: NGXLogger) {

    }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

        // Retrieve and cache Logical Structures locally
        this.initialiseLogicalStructures(() => {

            // Set the default active Logical Structures if not set
            this.initialiseActiveLogicalStructures(() => {

                // Set the default active Logical Structures ids as the typesIds in the desired records state
                this.initialiseDesiredRecordsState(() => {

                    // Preselect the active Logical Scheme in the data tabulation form
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
     * Retrieves and caches Logical Structures records
     * @param callback The function to call when done
     */
    private initialiseLogicalStructures(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseLogicalStructures()`);

        // Retrieve and cache all the Logical Structures records
        this.log.trace(`${LOG_PREFIX} Retrieving and caching all the Logical Structures records`);
        this.logicalStructuresDataService
            .getLogicalStructures(true, {
                searchTerm: null,
                page: null,
                pageSize: null,
                sortColumn: 'id',
                sortDirection: 'asc',
                hierarchyId: this.filterService.filter.activeContext?.data.schemeId,
                hierarchyName: null,
                commissionerId: null,
                commissionerName: null,
                responsibleId: null,
                responsibleName: null
            })
            .pipe(first()) // This will automatically complete (and therefore unsubscribe) after the first value has been emitted.
            .subscribe({
                next: (logicalStructures: LogicalStructure[]) => {

                    // Logical Structures successfully retrieved and cached
                    this.log.debug(`${LOG_PREFIX} ${logicalStructures.length} Logical Structures retrieved and cached`);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                },

                error: (err: any) => {

                    // Logical Structures retrieval failed
                    this.log.error(`${LOG_PREFIX} Logical Structures retrieval failed`);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                }
            });

    }




    /**
     * Sets the active Logical Structures if they have not been set in the global filter
     * @param callback The function to call when done
     */
    private initialiseActiveLogicalStructures(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseActiveLogicalStructures()`);

        // Check if the active Logical Structures have been set in the global filter
        this.log.trace(`${LOG_PREFIX} Checking if the active Logical Structures have been set in the global filter`);
        if (this.filterService.filter.activeLogicalStructures.length == 0) {

            // The active Logical Structures have not been set in the global filter
            this.log.trace(`${LOG_PREFIX} The active Logical Structures have not been set in the global filter`);

            // Get the top level Logical Structures records
            this.log.trace(`${LOG_PREFIX} Get the top level Logical Structures records`);
            const logicalStructures: LogicalStructure[] = this.logicalStructuresDataService.records.filter(a => a.data?.commissioner?.id == null);
            this.log.trace(`${LOG_PREFIX} Top level Logical Structures records = ${JSON.stringify(logicalStructures)}`);

            // Update the global filter
            this.log.trace(`${LOG_PREFIX} Updating the global filter`);
            this.filterService.update({ activeLogicalStructures: logicalStructures });

        } else {

            // The active Logical Structures have been set in the global filter
            this.log.trace(`${LOG_PREFIX} The active Logical Structures have been set in the global filter`);

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
        let copy: LogicalHierarchyState = Object.assign({}, this.stateSubject$.value);

        // Set the active Logical Structures as the desired Logical Structures
        this.log.trace(`${LOG_PREFIX} Setting the active Logical Structures as the desired Logical Structures`);
        const temp: number[] = [];
        for (let logicalStructure of this.filterService.filter.activeLogicalStructures) {
            if (logicalStructure.id) {
                temp.push(logicalStructure.id);
            }
        }
        copy.contextId = activeContext?.id;
        copy.typesIds = temp;
        copy.commissionerId = this.getLastOpenedLogicalHierarchyRecord() ? this.getLastOpenedLogicalHierarchyRecord()?.data?.responsible?.id : null;

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

                        // Retrieve the Logical Hierarchies records corresponding to the passed in state
                        this.log.trace(`${LOG_PREFIX} Retrieving the Logical Hierarchies records corresponding to the passed in state`);
                        this.logicalHierarchiesDataService
                            .getLogicalHierarchies(true, state)
                            .pipe(first())
                            .subscribe({
                                next: (s: LogicalHierarchy[]) => {

                                    // Logical Hierarchies records retrieved
                                    this.log.trace(`${LOG_PREFIX} Logical Hierarchies records retrieved`);
                                    this.log.debug(`${LOG_PREFIX} Logical Hierarchies records = ${JSON.stringify(s)}`);

                                    // Check if the active Logical Hierarchy has been set
                                    this.log.trace(`${LOG_PREFIX} Check if the active Logical Hierarchy has been set`);
                                    if (this.filterService.filter.activeLogicalHierarchy) {

                                        // The active Logical Hierarchy has been set
                                        this.log.trace(`${LOG_PREFIX} The active Logical Hierarchy has been set`);

                                    } else {

                                        // The active Logical Hierarchy has not been set
                                        this.log.trace(`${LOG_PREFIX} The active Logical Hierarchy has not been set`);

                                        // Set the first Logical Hierarchy record as the default active Logical Hierarchy
                                        this.log.trace(`${LOG_PREFIX} Setting the first Logical Hierarchy record as the default active Logical Hierarchy`);
                                        this.filterService.update({ activeLogicalHierarchy: s.length > 0 ? s[0] : null });

                                    }



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
            this.logicalHierarchiesDataService.loading$
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
            this.logicalHierarchiesDataService.totalRecords$.subscribe(
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
     * Retrieves the logical structure that has the passed in type as a responsible
     * @param logicalElementTypeId The target commissioner
     * @returns the parent logical structure
     */
    public getParentLogicalStructure(logicalElementTypeId: number): LogicalStructure[] {

        this.log.trace(`${LOG_PREFIX} Entering getSubsidiaryLogicalStructures()`);

        return this.logicalStructuresDataService.records.filter(a => a.data?.commissioner?.id == logicalElementTypeId);

    }


    /**
     * Retrieves all the logical structures that have have the passed in type as a commissioner
     * @param administrativestructureId The target logical structure
     * @returns the subsidiary logical structures
     */
    public getSubsidiaryLogicalStructures(administrativestructureId: number | null | undefined): LogicalStructure[] {

        this.log.trace(`${LOG_PREFIX} Entering getSubsidiaryLogicalStructures()`);

        // Retrieve the logical structure with the specified id
        this.log.trace(`${LOG_PREFIX} Retrieving the logical structure with the specified id`);
        const logicalStructure: LogicalStructure | undefined = this.logicalStructuresDataService.records.find(a => a.id == administrativestructureId);

        // Check if the admininistrative structure was successfully retrieved
        this.log.trace(`${LOG_PREFIX} Checking if the admininistrative structure was successfully retrieved`);
        if (logicalStructure) {

            // The admininistrative structure was successfully retrieved
            this.log.trace(`${LOG_PREFIX} The admininistrative structure was successfully retrieved`);

            // Return the logical structure's subsidiaries
            this.log.warn(`${LOG_PREFIX} Returning the logical structure's subsidiaries`);
            return this.logicalStructuresDataService.records.filter(a => a.data?.commissioner?.id == logicalStructure.data?.responsible?.id);

        } else {

            // The admininistrative structure was not successfully retrieved
            this.log.warn(`${LOG_PREFIX} The admininistrative structure was not successfully retrieved`);

            // Return an empty list
            this.log.warn(`${LOG_PREFIX} Returning an empty list`);
            return [];


        }



    }


    /**
     * Check if an logical hierarchy record was the last one opened
     * @param logicalHierarchyId The target logical hierarchy record
     * @returns true or false
     */
    public isLastSelected(logicalHierarchyId: number): boolean {
        return this.filterService.filter.openedLogicalHierarchies.length > 0 ?
            this.filterService.filter.openedLogicalHierarchies[this.filterService.filter.openedLogicalHierarchies.length - 1]?.id == logicalHierarchyId : false
    }

    /**
     * Retrieves the last opened logical hierarchy record
     * @returns the last opened logical hierarchy record if any
     */
    public getLastOpenedLogicalHierarchyRecord(): LogicalHierarchy | null {
        return this.filterService.filter.openedLogicalHierarchies.length > 0 ?
            this.filterService.filter.openedLogicalHierarchies[this.filterService.filter.openedLogicalHierarchies.length - 1] :
            null;
    }

    /**
     * Creates a commissioner entity given an logical hierarchy
     * @param activeLogicalHierarchy the target logical hierarchy
     * @returns the commissioner entity
     */
    private getCommissioner(activeLogicalHierarchy: LogicalHierarchy | null): { id: number | null | undefined; name: string | null | undefined; } | null | undefined {

        // Check if the Logical Hierarchy was successfully retrieved
        this.log.trace(`${LOG_PREFIX} Checking if the Logical Hierarchy was successfully retrieved`);
        if (activeLogicalHierarchy) {

            // The Logical Hierarchy was successfully retrieved
            this.log.trace(`${LOG_PREFIX} The Logical Hierarchy was successfully retrieved`);

            // Return the Logical Hierarchy's Responsible as the commissioner
            this.log.trace(`${LOG_PREFIX} Returning the Logical Hierarchy's Responsible as the commissioner`);
            return {
                id: activeLogicalHierarchy.data.responsible?.id,
                name: activeLogicalHierarchy.data.responsible?.name
            }

        } else {

            // Return null as the commissioner
            this.log.trace(`${LOG_PREFIX} Returning null as the commissioner`);
            return null;
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
            let copy: LogicalHierarchyState = Object.assign({}, this.stateSubject$.value);

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
            let copy: LogicalHierarchyState = Object.assign({}, this.stateSubject$.value);

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
            let copy: LogicalHierarchyState = Object.assign({}, this.stateSubject$.value);

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
     * Handles Logical Hierarchies Records Drill Down Requests
     * @param logicalHierarchy The target the Logical Hierarchy record to drill down to
     */
    onDrillDown(logicalHierarchy: LogicalHierarchy) {

        this.log.trace(`${LOG_PREFIX} Entering onDrillDown()`);
        this.log.debug(`${LOG_PREFIX} Logical Hierarchy Record = ${JSON.stringify(logicalHierarchy)}`);

        // Update the global filter
        this.log.trace(`${LOG_PREFIX} Updating the global filter`);
        this.filterService.update({
            openedLogicalHierarchies: Object.assign([], this.filterService.filter.openedLogicalHierarchies.concat([logicalHierarchy])),
            activeLogicalStructures: this.getSubsidiaryLogicalStructures(logicalHierarchy.data.type?.id)
        });

        // Set the default active Logical Structures ids as the typesIds in the desired records state
        this.initialiseDesiredRecordsState(() => {

        });

    }


    /**
     * Handles Logical Hierarchies Records Drill Up Requests
     * @param logicalHierarchy The target the Logical Hierarchy record to drill up to
     */
    onDrillUp(logicalHierarchy: LogicalHierarchy | null) {

        this.log.trace(`${LOG_PREFIX} Entering onDrillDown()`);
        this.log.debug(`${LOG_PREFIX} Logical Hierarchy Record = ${JSON.stringify(logicalHierarchy)}`);


        // Update the global filter
        this.log.trace(`${LOG_PREFIX} Updating the global filter`);
        if (logicalHierarchy) {

            // Get the index of the logical hierarchy in the opened logical hierarchies
            const index: number = this.filterService.filter.openedLogicalHierarchies.findIndex(o => o.id == logicalHierarchy.id);

            this.filterService.update({
                openedLogicalHierarchies: Object.assign([], this.filterService.filter.openedLogicalHierarchies.slice(0, index + 1)),
                activeLogicalStructures: this.getSubsidiaryLogicalStructures(logicalHierarchy.data.type?.id)
            });

        } else {
            this.filterService.update({
                openedLogicalHierarchies: [],
                activeLogicalStructures: this.logicalStructuresDataService.records.filter(a => a.data?.commissioner?.id == null)
            });
        }

        // Set the default active Logical Structures ids as the typesIds in the desired records state
        this.initialiseDesiredRecordsState(() => {

        });

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


    public truncate(text: string): string {
        return this.textUtilService.truncate(text, [35, "..."])
    }


    /** 
    * Handles Logical Hierarchy Selection Events
    * @param logicalHierarchy The Selected Logical Hierarchy
    */
    onSelect(logicalHierarchy: LogicalHierarchy) {

        this.log.trace(`${LOG_PREFIX} Entering onSelect()`);
        this.log.debug(`${LOG_PREFIX} Selected Logical Hierarchy = ${JSON.stringify(logicalHierarchy)}`);

        // Broadcast the selected Logical Hierarchy
        this.log.trace(`${LOG_PREFIX} Broadcasting the selected Logical Hierarchy`);
        this.select.emit(logicalHierarchy);
    }


    /** 
    * Handles Logical Hierarchies Checkboxes Check Events
    * @param logicalHierarchy The Checked Logical Hierarchy
    */
    onCheck(logicalHierarchy: LogicalHierarchy) {

        this.log.trace(`${LOG_PREFIX} Entering onCheck()`);
        this.log.debug(`${LOG_PREFIX} Checked Logical Hierarchy = ${JSON.stringify(logicalHierarchy)}`);

        // Broadcast the checked Logical Hierarchy
        this.log.trace(`${LOG_PREFIX} Broadcasting the checked Logical Hierarchy`);
        this.check.emit(logicalHierarchy);
    }


    /** 
    * Handles Logical Hierarchies Checkboxes Uncheck Events
    * @param logicalHierarchy The Unchecked Logical Hierarchy
    */
    onUncheck(logicalHierarchy: LogicalHierarchy) {

        this.log.trace(`${LOG_PREFIX} Entering onUncheck()`);
        this.log.debug(`${LOG_PREFIX} Unchecked Logical Hierarchy = ${JSON.stringify(logicalHierarchy)}`);

        // Broadcast the unchecked Logical Hierarchy
        this.log.trace(`${LOG_PREFIX} Broadcasting the unchecked Logical Hierarchy`);
        this.uncheck.emit(logicalHierarchy);

    }

    /**
     * Checks whether a Logical Hierarchy record is currently selected
     * @param logicalHierarchy The target Logical Hierarchy
     * @returns True or false depending on whether the Logical Hierarchy is currently selected or not respectively
     */
    isSelected(logicalHierarchy: LogicalHierarchy): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isSelected()`);
        this.log.debug(`${LOG_PREFIX} Target Logical Hierarchy = ${JSON.stringify(logicalHierarchy)}`);

        // Check whether the Logical Hierarchy is currently selected
        this.log.trace(`${LOG_PREFIX} Checking whether the Logical Hierarchy is currently selected`);
        const selected: boolean = this.selected.some(a => a.id == logicalHierarchy.id);
        this.log.debug(`${LOG_PREFIX} Selected = ${selected}`);

        return selected;
    }


    /**
     * Checks whether a Logical Hierarchy record is currently checked
     * @param logicalHierarchy The target Logical Hierarchy
     * @returns True or false depending on whether the Logical Hierarchy is currently checked or not respectively
     */
    isChecked(logicalHierarchy: LogicalHierarchy): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isChecked()`);
        this.log.debug(`${LOG_PREFIX} Target Logical Hierarchy = ${JSON.stringify(logicalHierarchy)}`);

        // Check whether the Logical Hierarchy is currently checked
        this.log.trace(`${LOG_PREFIX} Checking whether the Logical Hierarchy is currently checked`);
        const checked: boolean = this.selected.some(a => a.id == logicalHierarchy.id);
        this.log.debug(`${LOG_PREFIX} Checked = ${checked}`);

        return checked;
    }

    /**
     * Checks whether a Logical Hierarchy record is desired
     * @param logicalHierarchy The target Logical Hierarchy
     * @returns True or false depending on whether the Logical Hierarchy is desired or not respectively
     */
    isDesired(logicalHierarchy: LogicalHierarchy): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isDesired()`);
        this.log.debug(`${LOG_PREFIX} Target Logical Hierarchy = ${JSON.stringify(logicalHierarchy)}`);

        // Check whether the Logical Hierarchy is currently desired
        this.log.trace(`${LOG_PREFIX} Checking whether the Logical Hierarchy is currently desired`);
        const desired: boolean = this.desired.some(a => a.id == logicalHierarchy.id);
        this.log.debug(`${LOG_PREFIX} Desired = ${desired}`);

        return desired;
    }

    /**
     * Checks whether a Logical Hierarchy record is undesired
     * @param logicalHierarchy The target Logical Hierarchy
     * @returns True or false depending on whether the Logical Hierarchy is undesired or not respectively
     */
    isUndesired(logicalHierarchy: LogicalHierarchy): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isUndesired()`);
        this.log.debug(`${LOG_PREFIX} Target Logical Hierarchy = ${JSON.stringify(logicalHierarchy)}`);

        // Check whether the Logical Hierarchy is currently undesired
        this.log.trace(`${LOG_PREFIX} Checking whether the Logical Hierarchy is currently undesired`);
        const undesired: boolean = this.undesired.some(a => a.id == logicalHierarchy.id);
        this.log.debug(`${LOG_PREFIX} Undesired = ${undesired}`);

        return undesired;
    }



}
