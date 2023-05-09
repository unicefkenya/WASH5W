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
import { WorkflowStatus } from '@modules/workflow-statuses/models/workflow-status.model';
import { WorkflowStatusState } from '@modules/workflow-statuses/models/workflow-status-state.model';
import { WorkflowStatusesSelectionDataService } from '@modules/workflow-statuses/services/workflow-statuses-selection-data.service';

const LOG_PREFIX: string = "[Workflow Statuses Records Selection Component]";

@Component({
    selector: 'sb-workflow-statuses-records-selection',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './workflow-statuses-records-selection.component.html',
    styleUrls: ['workflow-statuses-records-selection.component.scss'],
})
export class WorkflowStatusesRecordsSelectionComponent implements OnInit, OnDestroy, AfterViewInit {

    // Allows the parent component to inject the desired selection mode: single or multi
    @Input() public selectionMode: string = "single";

    // Allows the parent component to inject the desired Workflow Statuses
    @Input() public desired: number[] = [];

    // Allows the parent component to inject the undesired Workflow Statuses
    // Ignored if the desired Workflow Statuses has been specified
    @Input() public undesired: number[] = [];

    // Allows the parent component to inject the previously selected Workflow Statuses
    @Input() public selected: number[] = [];

    // Broadcasts radio buttons selection events
    @Output() public select: EventEmitter<WorkflowStatus> = new EventEmitter<WorkflowStatus>();

    // Broadcasts checkboxes check events
    @Output() public check: EventEmitter<WorkflowStatus> = new EventEmitter<WorkflowStatus>();

    // Broadcasts checkboxes uncheck events
    @Output() public uncheck: EventEmitter<WorkflowStatus> = new EventEmitter<WorkflowStatus>();

    // Keeps a local reference to the displayed loading animation component.
    // Makes it possible to trigger the loading animation when a slow background service is invoked.
    private _animation!: LoadingAnimationComponent;

    // Keeps a local reference to the displayed pagination component.
    // Makes it possible to initialise / update the pagination component when the total number of records changes.
    private _pagination!: PaginationComponent;

    // Holds the required records state
    // Makes it possible to supply the filter, sort or search criteria that should be applied to records on retrieval.
    private stateSubject$ = new BehaviorSubject<WorkflowStatusState>({
        searchTerm: null,
        page: 1,
        pageSize: 10,
        sortColumn: 'name',
        sortDirection: 'asc',
        name: null
    });
    readonly state$ = this.stateSubject$.asObservable();

    // Keeps tabs of whether the component has been successfully initialised
    public initialised: boolean = false;     

    // Central gathering point for all the component's subscriptions.
    // Makes it efficient to unsubscribe from all subscriptions when the component is destroyed.   
    private _subscriptions: Subscription[] = [];

    constructor(
        private cd: ChangeDetectorRef,
        public workflowStatusesDataService: WorkflowStatusesSelectionDataService,
        private log: NGXLogger) {

    }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

        // Monitor & react to desired records state changes
        this.initialiseDesiredRecordsStateChangesHandler(() => {

            // Mark Init as complete
            this.log.trace(`${LOG_PREFIX} Init completed`);
            this.initialised = true;
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
                        this.log.debug(`${LOG_PREFIX} Desired records state = ${state}`);

                        // Retrieve the Workflow Status records corresponding to the passed in state
                        this.log.trace(`${LOG_PREFIX} Retrieving the Workflow Status records corresponding to the passed in state`);
                        this.workflowStatusesDataService
                            .getWorkflowStatuses(true,state)
                            .pipe(first())
                            .subscribe();

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
            this.workflowStatusesDataService.loading$
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
            this.workflowStatusesDataService.totalRecords$.subscribe(
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
            let copy: WorkflowStatusState = Object.assign({}, this.stateSubject$.value);

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
            let copy: WorkflowStatusState = Object.assign({}, this.stateSubject$.value);

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
            let copy: WorkflowStatusState = Object.assign({}, this.stateSubject$.value);

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
    * Handles WorkflowStatus Selection Events
    * @param workflowStatus The Selected WorkflowStatus
    */
    public onSelect(workflowStatus: WorkflowStatus): void {

        this.log.trace(`${LOG_PREFIX} Entering onSelect()`);
        this.log.debug(`${LOG_PREFIX} Selected Workflow Status = ${JSON.stringify(workflowStatus)}`);

        // Broadcast the selected WorkflowStatus
        this.log.trace(`${LOG_PREFIX} Broadcasting the selected Workflow Status`);
        this.select.emit(workflowStatus);
    }


    /** 
    * Handles Workflow Statuses Checkboxes Check Events
    * @param workflowStatus The Checked WorkflowStatus
    */
    public onCheck(workflowStatus: WorkflowStatus): void {

        this.log.trace(`${LOG_PREFIX} Entering onCheck()`);
        this.log.debug(`${LOG_PREFIX} Checked Workflow Status = ${JSON.stringify(workflowStatus)}`);

        // Broadcast the checked WorkflowStatus
        this.log.trace(`${LOG_PREFIX} Broadcasting the checked Workflow Status`);
        this.check.emit(workflowStatus);
    }


    /** 
    * Handles Workflow Statuses Checkboxes Uncheck Events
    * @param workflowStatus The Unchecked WorkflowStatus
    */
    public onUncheck(workflowStatus: WorkflowStatus): void {

        this.log.trace(`${LOG_PREFIX} Entering onUncheck()`);
        this.log.debug(`${LOG_PREFIX} Unchecked Workflow Status = ${JSON.stringify(workflowStatus)}`);

        // Broadcast the unchecked WorkflowStatus
        this.log.trace(`${LOG_PREFIX} Broadcasting the unchecked Workflow Status`);
        this.uncheck.emit(workflowStatus);

    }

    /**
     * Checks whether a Workflow Status record is currently selected
     * @param workflowStatus The target Workflow Status
     * @returns True or false depending on whether the Workflow Status is currently selected or not respectively
     */
    public isSelected(workflowStatus: WorkflowStatus): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isSelected()`);
        this.log.debug(`${LOG_PREFIX} Target Workflow Status = ${JSON.stringify(workflowStatus)}`);

        // Check whether the Workflow Status is currently selected
        this.log.trace(`${LOG_PREFIX} Checking whether the Workflow Status is currently selected`);
        const selected: boolean = this.selected.some(id => id == workflowStatus.id);
        this.log.debug(`${LOG_PREFIX} Selected = ${selected}`);

        return selected;
    }


    /**
     * Checks whether a Workflow Status record is currently checked
     * @param workflowStatus The target Workflow Status
     * @returns True or false depending on whether the Workflow Status is currently checked or not respectively
     */
    public isChecked(workflowStatus: WorkflowStatus): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isChecked()`);
        this.log.debug(`${LOG_PREFIX} Target Workflow Status = ${JSON.stringify(workflowStatus)}`);

        // Check whether the Workflow Status is currently checked
        this.log.trace(`${LOG_PREFIX} Checking whether the Workflow Status is currently checked`);
        const checked: boolean = this.selected.some(id => id == workflowStatus.id);
        this.log.debug(`${LOG_PREFIX} Checked = ${checked}`);

        return checked;
    }

    /**
     * Checks whether a Workflow Status record is desired
     * @param workflowStatus The target Workflow Status
     * @returns True or false depending on whether the Workflow Status is desired or not respectively
     */
    public isDesired(workflowStatus: WorkflowStatus): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isDesired()`);
        this.log.debug(`${LOG_PREFIX} Target Workflow Status = ${JSON.stringify(workflowStatus)}`);

        // Check whether the Workflow Status is currently desired
        this.log.trace(`${LOG_PREFIX} Checking whether the Workflow Status is currently desired`);
        const desired: boolean = this.desired.some(id => id == workflowStatus.id);
        this.log.debug(`${LOG_PREFIX} Desired = ${desired}`);

        return desired;
    }

    /**
     * Checks whether a Workflow Status record is undesired
     * @param workflowStatus The target Workflow Status
     * @returns True or false depending on whether the Workflow Status is undesired or not respectively
     */
    public isUndesired(workflowStatus: WorkflowStatus): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isUndesired()`);
        this.log.debug(`${LOG_PREFIX} Target Workflow Status = ${JSON.stringify(workflowStatus)}`);

        // Check whether the Workflow Status is currently undesired
        this.log.trace(`${LOG_PREFIX} Checking whether the Workflow Status is currently undesired`);
        const undesired: boolean = this.undesired.some(id => id == workflowStatus.id);
        this.log.debug(`${LOG_PREFIX} Undesired = ${undesired}`);

        return undesired;
    }

}
