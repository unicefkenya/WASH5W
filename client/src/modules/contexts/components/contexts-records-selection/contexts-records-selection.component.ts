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
import { BehaviorSubject, Subscription, debounceTime, first, Observable, of } from 'rxjs';
import { Context } from '@modules/contexts/models/context.model';
import { ContextState } from '@modules/contexts/models/context-state.model';
import { ContextsSelectionDataService } from '@modules/contexts/services/contexts-selection-data.service';
import { FilterService } from '@app/app-filter.service';

const LOG_PREFIX: string = "[Contexts Records Selection Component]";

@Component({
    selector: 'sb-contexts-records-selection',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './contexts-records-selection.component.html',
    styleUrls: ['contexts-records-selection.component.scss'],
})
export class ContextsRecordsSelectionComponent implements OnInit, OnDestroy, AfterViewInit {

    // Allows the parent component to inject the selection use case: configuration or filtering
    @Input() public usecase: string = "configuration";

    // Allows the parent component to inject the desired selection mode: single or multi
    @Input() public selectionMode: string = "single";

    // Allows the parent component to inject the desired Contexts
    @Input() public desired: Context[] = [];

    // Allows the parent component to inject the undesired Contexts
    // Ignored if the desired Contexts has been specified
    @Input() public undesired: Context[] = [];

    // Allows the parent component to inject the ids of the previously selected Contexts
    @Input() public selected: number[] = [];

    // Broadcasts radio buttons selection events
    @Output() public select: EventEmitter<Context> = new EventEmitter<Context>();

    // Broadcasts checkboxes check events
    @Output() public check: EventEmitter<Context> = new EventEmitter<Context>();

    // Broadcasts checkboxes uncheck events
    @Output() public uncheck: EventEmitter<Context> = new EventEmitter<Context>();

    // Keeps a local reference to the displayed loading animation component.
    // Makes it possible to trigger the loading animation when a slow background service is invoked.
    private _animation!: LoadingAnimationComponent;

    // Keeps a local reference to the displayed pagination component.
    // Makes it possible to initialise / update the pagination component when the total number of records changes.
    private _pagination!: PaginationComponent;

    // Holds the required records state
    // Makes it possible to supply the filter, sort or search criteria that should be applied to records on retrieval.
    private stateSubject$ = new BehaviorSubject<ContextState>({
        searchTerm: null,
        page: 1,
        pageSize: 5,
        sortColumn: 'name',
        sortDirection: 'asc',
        ids: null,
        abbreviation: null,
        name: null
    });
    readonly state$ = this.stateSubject$.asObservable();

    // Central gathering point for all the component's subscriptions.
    // Makes it efficient to unsubscribe from all subscriptions when the component is destroyed.   
    private _subscriptions: Subscription[] = [];

    constructor(
        private cd: ChangeDetectorRef,
        public contextsDataService: ContextsSelectionDataService,
        public filterService: FilterService,
        private log: NGXLogger) {

    }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

        // Monitor & react to desired records state changes
        this.initialiseDesiredRecordsStateChangesHandler(() => {

            // Mark Init as complete
            this.log.trace(`${LOG_PREFIX} Init completed`);
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

                        // Retrieve the Context records corresponding to the passed in state
                        this.log.trace(`${LOG_PREFIX} Retrieving the Context records corresponding to the passed in state`);
                        this.contextsDataService
                            .getContexts(true, state)
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
            this.contextsDataService.loading$
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
            this.contextsDataService.totalRecords$.subscribe(
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
 * Gets the list of contexts depending on the use case
 * @returns 
 */
    getContexts$(): Observable<Context[]> {
        if (this.usecase == "filtering") {
            return of(this.filterService.filter.assignedContexts);
        } else {
            return this.contextsDataService.contexts$;
        }
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
            let copy: ContextState = Object.assign({}, this.stateSubject$.value);

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
            let copy: ContextState = Object.assign({}, this.stateSubject$.value);

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
            let copy: ContextState = Object.assign({}, this.stateSubject$.value);

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
    * Handles Context Selection Events
    * @param context The Selected Context
    */
    public onSelect(context: Context): void {

        this.log.trace(`${LOG_PREFIX} Entering onSelect()`);
        this.log.debug(`${LOG_PREFIX} Selected Context = ${JSON.stringify(context)}`);

        // Broadcast the selected Context
        this.log.trace(`${LOG_PREFIX} Broadcasting the selected Context`);
        this.select.emit(context);
    }


    /** 
    * Handles Contexts Checkboxes Check Events
    * @param context The Checked Context
    */
    public onCheck(context: Context): void {

        this.log.trace(`${LOG_PREFIX} Entering onCheck()`);
        this.log.debug(`${LOG_PREFIX} Checked Context = ${JSON.stringify(context)}`);

        // Broadcast the checked Context
        this.log.trace(`${LOG_PREFIX} Broadcasting the checked Context`);
        this.check.emit(context);
    }


    /** 
    * Handles Contexts Checkboxes Uncheck Events
    * @param context The Unchecked Context
    */
    public onUncheck(context: Context): void {

        this.log.trace(`${LOG_PREFIX} Entering onUncheck()`);
        this.log.debug(`${LOG_PREFIX} Unchecked Context = ${JSON.stringify(context)}`);

        // Broadcast the unchecked Context
        this.log.trace(`${LOG_PREFIX} Broadcasting the unchecked Context`);
        this.uncheck.emit(context);

    }

    /**
     * Checks whether a Context record is currently selected
     * @param context The target Context
     * @returns True or false depending on whether the Context is currently selected or not respectively
     */
    public isSelected(context: Context): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isSelected()`);
        this.log.debug(`${LOG_PREFIX} Target Context = ${JSON.stringify(context)}`);

        // Check whether the Context is currently selected
        this.log.trace(`${LOG_PREFIX} Checking whether the Context is currently selected`);
        const selected: boolean = this.selected.some(id => id == context.id);
        this.log.debug(`${LOG_PREFIX} Selected = ${selected}`);

        return selected;
    }


    /**
     * Checks whether a Context record is currently checked
     * @param context The target Context
     * @returns True or false depending on whether the Context is currently checked or not respectively
     */
    public isChecked(context: Context): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isChecked()`);
        this.log.debug(`${LOG_PREFIX} Target Context = ${JSON.stringify(context)}`);

        // Check whether the Context is currently checked
        this.log.trace(`${LOG_PREFIX} Checking whether the Context is currently checked`);
        const checked: boolean = this.selected.some(id => id == context.id);
        this.log.debug(`${LOG_PREFIX} Checked = ${checked}`);

        return checked;
    }

    /**
     * Checks whether a Context record is desired
     * @param context The target Context
     * @returns True or false depending on whether the Context is desired or not respectively
     */
    public isDesired(context: Context): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isDesired()`);
        this.log.debug(`${LOG_PREFIX} Target Context = ${JSON.stringify(context)}`);

        // Check whether the Context is currently desired
        this.log.trace(`${LOG_PREFIX} Checking whether the Context is currently desired`);
        const desired: boolean = this.desired.some(a => a.id == context.id);
        this.log.debug(`${LOG_PREFIX} Desired = ${desired}`);

        return desired;
    }

    /**
     * Checks whether a Context record is undesired
     * @param context The target Context
     * @returns True or false depending on whether the Context is undesired or not respectively
     */
    public isUndesired(context: Context): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isUndesired()`);
        this.log.debug(`${LOG_PREFIX} Target Context = ${JSON.stringify(context)}`);

        // Check whether the Context is currently undesired
        this.log.trace(`${LOG_PREFIX} Checking whether the Context is currently undesired`);
        const undesired: boolean = this.undesired.some(a => a.id == context.id);
        this.log.debug(`${LOG_PREFIX} Undesired = ${undesired}`);

        return undesired;
    }

}
