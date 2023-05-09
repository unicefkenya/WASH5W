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
import { FilterService } from '@app/app-filter.service';
import { WorkflowTransition } from '@modules/workflow-transitions/models/workflow-transition.model';
import { WorkflowTransitionState } from '@modules/workflow-transitions/models/workflow-transition-state.model';
import { WorkflowStatusesDataService } from '@modules/workflow-statuses/services/workflow-statuses-data.service';
import { WorkflowTransitionsDataService } from '@modules/workflow-transitions/services/workflow-transitions-data.service';
import { WorkflowsDataService } from '@modules/workflows/services/workflows-data.service';
import { Workflow } from '@modules/workflows/models/workflow.model';
import { WorkflowStatus } from '@modules/workflow-statuses/models/workflow-status.model';


const LOG_PREFIX: string = "[Workflow Transitions Records Selection Component]";

@Component({
    selector: 'sb-workflow-transitions-records-selection',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './workflow-transitions-records-selection.component.html',
    styleUrls: ['workflow-transitions-records-selection.component.scss'],
})
export class WorkflowTransitionsRecordsSelectionComponent implements OnInit, OnDestroy, AfterViewInit {

    // Allows the from component to inject the desired selection mode: single or multi
    @Input() public selectionMode: string = "single";

    // Allows the from component to inject the desired Workflow Transition
    @Input() public desired: WorkflowTransition[] = [];    

    // Allows the from component to inject the undesired Workflow Transitions
    // Ignored if the desired Workflow Transitions has been specified
    @Input() public undesired: WorkflowTransition[] = [];

    // Allows the from component to inject the previously selected Workflow Transitions
    @Input() public selected: WorkflowTransition[] = [];

    // Broadcasts radio buttons selection events
    @Output() public select: EventEmitter<WorkflowTransition> = new EventEmitter<WorkflowTransition>();

    // Broadcasts checkboxes check events
    @Output() public check: EventEmitter<WorkflowTransition> = new EventEmitter<WorkflowTransition>();

    // Broadcasts checkboxes uncheck events
    @Output() public uncheck: EventEmitter<WorkflowTransition> = new EventEmitter<WorkflowTransition>();     

    // Keeps a local reference to the displayed loading animation component.
    // Makes it possible to trigger the loading animation when a slow background service is invoked.
    private _animation!: LoadingAnimationComponent;

    // Keeps a local reference to the displayed pagination component.
    // Makes it possible to initialise / update the pagination component when the total number of records changes.
    private _pagination!: PaginationComponent;

    // Holds the required records state
    // Makes it possible to supply the filter, sort or search criteria that should be applied to records on retrieval.
    private stateSubject$ = new BehaviorSubject<WorkflowTransitionState>({
        page: 1,
        pageSize: 20,
        searchTerm: null,
        sortColumn: 'id',
        sortDirection: 'asc',
        workflowId: null,
        fromStateId: null,
        fromStateName: null,
        toStateId: null,
        toStateName: null,
        permissionId: null,
        permissionName: null,
        verb: null
    });
    readonly state$ = this.stateSubject$.asObservable();

    // Keeps tabs of whether the component has been successfully initialised
    public initialised: boolean = false;

    // Instantitate a new reactive Form Group
    // This will allow us to define and enforce the validation rules for all the form controls.
    workflowTransitionsForm = new FormGroup({
        workflowId: new FormControl<number | null>(null, [
        ]),
    });    

    // Central gathering point for all the component's subscriptions.
    // Makes it efficient to unsubscribe from all subscriptions when the component is destroyed.   
    private _subscriptions: Subscription[] = [];

    constructor(
        private cd: ChangeDetectorRef,
        public workflowStatusesDataService: WorkflowStatusesDataService,
        public workflowsDataService: WorkflowsDataService,
        public workflowTransitionsDataService: WorkflowTransitionsDataService,
        private filterService: FilterService,
        private log: NGXLogger) {

    }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

        // Retrieve and cache Workflow Transitions Types locally
        this.initialiseWorkflows(() => {

            // Set the default active Workflow if not set
            this.initialiseActiveWorkflow(() => {

                // Retrieve and cache Workflow Statuses locally
                this.initialiseWorkflowStatuses(() => {

                    // Set the default active Workflow's id as the workflowId in the desired records state
                    this.initialiseDesiredRecordsState(() => {

                        // Preselect the active Workflow in the data tabulation form
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
     * Retrieves and caches Workflow Transitions Types records
     * @param callback The function to call when done
     */
    private initialiseWorkflows(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseWorkflows()`);

        // Retrieve and cache all the Workflow Transitions Types records
        this.log.trace(`${LOG_PREFIX} Retrieving and caching all the Workflow Transitions Types records`);
        this.workflowsDataService
            .getWorkflows(true, {
                searchTerm: null,
                page: null,
                pageSize: null,
                sortColumn: 'name',
                sortDirection: 'asc',
                name: null
            })
            .pipe(first()) // This will automatically complete (and therefore unsubscribe) after the first value has been emitted.
            .subscribe({
                next: (workflows: Workflow[]) => {

                    // Workflow Transitions Types successfully retrieved and cached
                    this.log.debug(`${LOG_PREFIX} ${workflows.length} Workflow Transitions Types(s) retrieved and cached`);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                },

                error: (err: any) => {

                    // Workflow Transitions Types retrieval failed
                    this.log.error(`${LOG_PREFIX} Workflow Transitions Types retrieval failed`);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                }
            });

    }



    /**
     * Sets the active Workflow if it has not been set in the global filter
     * @param callback The function to call when done
     */
    private initialiseActiveWorkflow(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseActiveWorkflow()`);

        // Check if the active Workflow has been set in the global filter
        this.log.trace(`${LOG_PREFIX} Checking if the active Workflow has been set in the global filter`);
        if (this.filterService.filter.activeWorkflow) {

            // The active Workflow has been set in the global filter
            this.log.trace(`${LOG_PREFIX} The active Workflow has been set in the global filter`);

            // Check if the active Workflow record exists in the cache
            this.log.trace(`${LOG_PREFIX} Checking if the active Workflow record exists in the cache`);
            if (this.workflowsDataService.records.some(a => a.id == this.filterService.filter.activeWorkflow?.id)) {

                // The active Workflow record exists in the cache
                this.log.trace(`${LOG_PREFIX} The active Workflow record exists in the cache`);

                // Initialisation is valid
                this.log.trace(`${LOG_PREFIX} Initialisation is valid`);

            } else {

                // Initialisation is invalid
                this.log.trace(`${LOG_PREFIX} Initialisation is invalid`);

                // Get the first Workflow record
                this.log.trace(`${LOG_PREFIX} Get the first Workflow record`);
                const workflow: Workflow | null = this.workflowsDataService.records.length > 0 ? this.workflowsDataService.records[0] : null;
                this.log.trace(`${LOG_PREFIX} First Workflow record = ${JSON.stringify(workflow)}`);

                // Update the global filter
                this.log.trace(`${LOG_PREFIX} Updating the global filter`);
                this.filterService.update({ activeWorkflow: workflow });

            }

            // Return
            this.log.trace(`${LOG_PREFIX} Returning`);
            callback();

        } else {

            // The active Workflow has not been set in the global filter
            this.log.trace(`${LOG_PREFIX} The active Workflow has not been set in the global filter`);

            // Get the first Workflow record
            this.log.trace(`${LOG_PREFIX} Get the first Workflow record`);
            const workflow: Workflow | null = this.workflowsDataService.records.length > 0 ? this.workflowsDataService.records[0] : null;
            this.log.trace(`${LOG_PREFIX} First Workflow record = ${JSON.stringify(workflow)}`);

            // Update the global filter
            this.log.trace(`${LOG_PREFIX} Updating the global filter`);
            this.filterService.update({ activeWorkflow: workflow });

            // Return
            this.log.trace(`${LOG_PREFIX} Returning`);
            callback();

        }
    }

    /**
     * Retrieves and caches Workflow Statuses records
     * @param callback The function to call when done
     */
     private initialiseWorkflowStatuses(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseWorkflowStatuses()`);

        // Retrieve and cache all the Workflow Statuses records
        this.log.trace(`${LOG_PREFIX} Retrieving and caching all the Workflow Statuses records`);
        this.workflowStatusesDataService
            .getWorkflowStatuses(true, {
                searchTerm: null,
                page: null,
                pageSize: null,
                sortColumn: 'name',
                sortDirection: 'asc',
                name: null
            })
            .pipe(first()) // This will automatically complete (and therefore unsubscribe) after the first value has been emitted.
            .subscribe({
                next: (workflowStatuses: WorkflowStatus[]) => {

                    // Workflow Statuses successfully retrieved and cached
                    this.log.debug(`${LOG_PREFIX} ${workflowStatuses.length} Workflow Statuses(s) retrieved and cached`);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                },

                error: (err: any) => {

                    // Workflow Statuses retrieval failed
                    this.log.error(`${LOG_PREFIX} Workflow Statuses retrieval failed`);

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

        this.log.trace(`${LOG_PREFIX} Get the Active Workflow`);
        const activeWorkflow: Workflow | null | undefined = this.filterService.filter.activeWorkflow;
        this.log.debug(`${LOG_PREFIX} Active Workflow = ${JSON.stringify(activeWorkflow)}`);

        // Make a copy of the desired records state
        this.log.trace(`${LOG_PREFIX} Making a copy of the desired records state`);
        let copy: WorkflowTransitionState = Object.assign({}, this.stateSubject$.value);

        // Set the active Workflow as the desired Workflow
        this.log.trace(`${LOG_PREFIX} Setting the active Workflow as the desired Workflow`);
        copy.workflowId = activeWorkflow?.id;

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

        this.log.trace(`${LOG_PREFIX} Get the Active Workflow`);
        const activeWorkflow: Workflow | null | undefined = this.filterService.filter.activeWorkflow;
        this.log.debug(`${LOG_PREFIX} Active Workflow = ${JSON.stringify(activeWorkflow)}`);

        // Select the active Workflow
        this.log.trace(`${LOG_PREFIX} Selecting the active Workflow`);
        this.workflowTransitionsForm.get('workflowId')?.setValue((activeWorkflow && activeWorkflow.id) ? activeWorkflow.id : null);


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

                        // Retrieve the Workflow Transitions records corresponding to the passed in state
                        this.log.trace(`${LOG_PREFIX} Retrieving the Workflow Transitions records corresponding to the passed in state`);
                        this.workflowTransitionsDataService
                            .getWorkflowTransitions(true, state)
                            .pipe(first())
                            .subscribe({
                                next: (s: WorkflowTransition[]) => {

                                    // Workflow Transitions records retrieved
                                    this.log.trace(`${LOG_PREFIX} Workflow Transitions records retrieved`);
                                    this.log.debug(`${LOG_PREFIX} Workflow Transitions records = ${JSON.stringify(s)}`);

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
            this.workflowTransitionsDataService.loading$
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
            this.workflowTransitionsDataService.totalRecords$.subscribe(
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
     * Handles Workflow change events
     */
    public onWorkflowChange(): void {

        this.log.trace(`${LOG_PREFIX} Entering onWorkflowChange()`);


        // Get the selected Workflow Id
        this.log.trace(`${LOG_PREFIX} Getting the selected Workflow Id`);
        const workflowId: number | null | undefined = this.workflowTransitionsForm.get('workflowId')?.value
        this.log.debug(`${LOG_PREFIX} Workflow Id = ${workflowId}`);

        // Check if the specified Workflow is different from the current Workflow
        this.log.trace(`${LOG_PREFIX} Check if the specified Workflow is different from the current Workflow`);

        if (workflowId != this.stateSubject$.value.fromStateId) {

            // The specified Workflow is different from the current Workflow
            this.log.trace(`${LOG_PREFIX} The specified Workflow is different from the current Workflow`);

            // Make a copy of the desired records state
            this.log.trace(`${LOG_PREFIX} Making a copy of the desired records state`);
            let copy: WorkflowTransitionState = Object.assign({}, this.stateSubject$.value);

            // Update the copy of the desired records state
            this.log.trace(`${LOG_PREFIX} Updating the copy of the desired records state`);
            Object.assign(copy, { workflowId: workflowId, page: 1 });

            // Broadcast the newly desired record state
            this.log.trace(`${LOG_PREFIX} Broadcasting the newly desired record state`);
            this.stateSubject$.next(copy);

        } else {

            // The specified Workflow is not different from the current Workflow
            this.log.trace(`${LOG_PREFIX} The specified Workflow is not different from the current Workflow`);

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
            let copy: WorkflowTransitionState = Object.assign({}, this.stateSubject$.value);

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
            let copy: WorkflowTransitionState = Object.assign({}, this.stateSubject$.value);

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
            let copy: WorkflowTransitionState = Object.assign({}, this.stateSubject$.value);

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
    * Handles Workflow Transition Selection Events
    * @param workflowTransition The Selected Workflow Transition
    */
     onSelect(workflowTransition: WorkflowTransition) {

        this.log.trace(`${LOG_PREFIX} Entering onSelect()`);
        this.log.debug(`${LOG_PREFIX} Selected Workflow Transition = ${JSON.stringify(workflowTransition)}`);

        // Broadcast the selected Workflow Transition
        this.log.trace(`${LOG_PREFIX} Broadcasting the selected Workflow Transition`);
        this.select.emit(workflowTransition);
    }


    /** 
    * Handles Workflow Transitions Checkboxes Check Events
    * @param workflowTransition The Checked Workflow Transition
    */
    onCheck(workflowTransition: WorkflowTransition) {

        this.log.trace(`${LOG_PREFIX} Entering onCheck()`);
        this.log.debug(`${LOG_PREFIX} Checked Workflow Transition = ${JSON.stringify(workflowTransition)}`);

        // Broadcast the checked Workflow Transition
        this.log.trace(`${LOG_PREFIX} Broadcasting the checked Workflow Transition`);
        this.check.emit(workflowTransition);
    }


    /** 
    * Handles Workflow Transitions Checkboxes Uncheck Events
    * @param workflowTransition The Unchecked Workflow Transition
    */
    onUncheck(workflowTransition: WorkflowTransition) {

        this.log.trace(`${LOG_PREFIX} Entering onUncheck()`);
        this.log.debug(`${LOG_PREFIX} Unchecked Workflow Transition = ${JSON.stringify(workflowTransition)}`);

        // Broadcast the unchecked Workflow Transition
        this.log.trace(`${LOG_PREFIX} Broadcasting the unchecked Workflow Transition`);
        this.uncheck.emit(workflowTransition);

    }

    /**
     * Checks whether a Workflow Transition record is currently selected
     * @param workflowTransition The target Workflow Transition
     * @returns True or false depending on whether the Workflow Transition is currently selected or not respectively
     */
    isSelected(workflowTransition: WorkflowTransition): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isSelected()`);
        this.log.debug(`${LOG_PREFIX} Target Workflow Transition = ${JSON.stringify(workflowTransition)}`);

        // Check whether the Workflow Transition is currently selected
        this.log.trace(`${LOG_PREFIX} Checking whether the Workflow Transition is currently selected`);
        const selected: boolean = this.selected.some(a => a.id == workflowTransition.id);
        this.log.debug(`${LOG_PREFIX} Selected = ${selected}`);

        return selected;
    }


    /**
     * Checks whether a Workflow Transition record is currently checked
     * @param workflowTransition The target Workflow Transition
     * @returns True or false depending on whether the Workflow Transition is currently checked or not respectively
     */    
    isChecked(workflowTransition: WorkflowTransition): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isChecked()`);
        this.log.debug(`${LOG_PREFIX} Target Workflow Transition = ${JSON.stringify(workflowTransition)}`);

        // Check whether the Workflow Transition is currently checked
        this.log.trace(`${LOG_PREFIX} Checking whether the Workflow Transition is currently checked`);
        const checked: boolean = this.selected.some(a => a.id == workflowTransition.id);
        this.log.debug(`${LOG_PREFIX} Checked = ${checked}`);

        return checked;
    }

    /**
     * Checks whether a Workflow Transition record is desired
     * @param workflowTransition The target Workflow Transition
     * @returns True or false depending on whether the Workflow Transition is desired or not respectively
     */
     isDesired(workflowTransition: WorkflowTransition): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isDesired()`);
        this.log.debug(`${LOG_PREFIX} Target Workflow Transition = ${JSON.stringify(workflowTransition)}`);

        // Check whether the Workflow Transition is currently desired
        this.log.trace(`${LOG_PREFIX} Checking whether the Workflow Transition is currently desired`);
        const desired: boolean = this.desired.some(a => a.id == workflowTransition.id);
        this.log.debug(`${LOG_PREFIX} Desired = ${desired}`);

        return desired;
    }    

    /**
     * Checks whether a Workflow Transition record is undesired
     * @param workflowTransition The target Workflow Transition
     * @returns True or false depending on whether the Workflow Transition is undesired or not respectively
     */
     isUndesired(workflowTransition: WorkflowTransition): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isUndesired()`);
        this.log.debug(`${LOG_PREFIX} Target Workflow Transition = ${JSON.stringify(workflowTransition)}`);

        // Check whether the Workflow Transition is currently undesired
        this.log.trace(`${LOG_PREFIX} Checking whether the Workflow Transition is currently undesired`);
        const undesired: boolean = this.undesired.some(a => a.id == workflowTransition.id);
        this.log.debug(`${LOG_PREFIX} Undesired = ${undesired}`);

        return undesired;
    }    


    
}
