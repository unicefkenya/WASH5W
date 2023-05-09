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
import { DissagregationScheme } from '@modules/dissagregations-schemes/models/dissagregation-scheme.model';
import { DissagregationSchemeState } from '@modules/dissagregations-schemes/models/dissagregation-scheme-state.model';
import { DissagregationsSchemesSelectionDataService } from '@modules/dissagregations-schemes/services/dissagregations-schemes-selection-data.service';

const LOG_PREFIX: string = "[Dissagregations Schemes Records Selection Component]";

@Component({
    selector: 'sb-dissagregations-schemes-records-selection',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './dissagregations-schemes-records-selection.component.html',
    styleUrls: ['dissagregations-schemes-records-selection.component.scss'],
})
export class DissagregationsSchemesRecordsSelectionComponent implements OnInit, OnDestroy, AfterViewInit {

    // Allows the parent component to inject the desired selection mode: single or multi
    @Input() public selectionMode: string = "single";

    // Allows the parent component to inject the desired Dissagregations Schemes
    @Input() public desired: number[] = [];

    // Allows the parent component to inject the undesired Dissagregations Schemes
    // Ignored if the desired Dissagregations Schemes has been specified
    @Input() public undesired: number[] = [];

    // Allows the parent component to inject the previously selected Dissagregations Schemes
    @Input() public selected: number[] = [];

    // Broadcasts radio buttons selection events
    @Output() public select: EventEmitter<DissagregationScheme> = new EventEmitter<DissagregationScheme>();

    // Broadcasts checkboxes check events
    @Output() public check: EventEmitter<DissagregationScheme> = new EventEmitter<DissagregationScheme>();

    // Broadcasts checkboxes uncheck events
    @Output() public uncheck: EventEmitter<DissagregationScheme> = new EventEmitter<DissagregationScheme>();

    // Keeps a local reference to the displayed loading animation component.
    // Makes it possible to trigger the loading animation when a slow background service is invoked.
    private _animation!: LoadingAnimationComponent;

    // Keeps a local reference to the displayed pagination component.
    // Makes it possible to initialise / update the pagination component when the total number of records changes.
    private _pagination!: PaginationComponent;

    // Holds the required records state
    // Makes it possible to supply the filter, sort or search criteria that should be applied to records on retrieval.
    private stateSubject$ = new BehaviorSubject<DissagregationSchemeState>({
        searchTerm: null,
        page: 1,
        pageSize: 5,
        sortColumn: 'id',
        sortDirection: 'asc',
        ids: null,
        name: null
    });
    readonly state$ = this.stateSubject$.asObservable();

    // Central gathering point for all the component's subscriptions.
    // Makes it efficient to unsubscribe from all subscriptions when the component is destroyed.   
    private _subscriptions: Subscription[] = [];

    constructor(
        private cd: ChangeDetectorRef,
        public dissagregationsSchemesDataService: DissagregationsSchemesSelectionDataService,
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

                        // Retrieve the Dissagregation Scheme records corresponding to the passed in state
                        this.log.trace(`${LOG_PREFIX} Retrieving the Dissagregation Scheme records corresponding to the passed in state`);
                        this.dissagregationsSchemesDataService
                            .getDissagregationsSchemes(true,state)
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
            this.dissagregationsSchemesDataService.loading$
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
            this.dissagregationsSchemesDataService.totalRecords$.subscribe(
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
            let copy: DissagregationSchemeState = Object.assign({}, this.stateSubject$.value);

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
            let copy: DissagregationSchemeState = Object.assign({}, this.stateSubject$.value);

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
            let copy: DissagregationSchemeState = Object.assign({}, this.stateSubject$.value);

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
    * Handles DissagregationScheme Selection Events
    * @param dissagregationScheme The Selected DissagregationScheme
    */
    public onSelect(dissagregationScheme: DissagregationScheme): void {

        this.log.trace(`${LOG_PREFIX} Entering onSelect()`);
        this.log.debug(`${LOG_PREFIX} Selected Dissagregation Scheme = ${JSON.stringify(dissagregationScheme)}`);

        // Broadcast the selected DissagregationScheme
        this.log.trace(`${LOG_PREFIX} Broadcasting the selected Dissagregation Scheme`);
        this.select.emit(dissagregationScheme);
    }


    /** 
    * Handles Dissagregations Schemes Checkboxes Check Events
    * @param dissagregationScheme The Checked DissagregationScheme
    */
    public onCheck(dissagregationScheme: DissagregationScheme): void {

        this.log.trace(`${LOG_PREFIX} Entering onCheck()`);
        this.log.debug(`${LOG_PREFIX} Checked Dissagregation Scheme = ${JSON.stringify(dissagregationScheme)}`);

        // Broadcast the checked DissagregationScheme
        this.log.trace(`${LOG_PREFIX} Broadcasting the checked Dissagregation Scheme`);
        this.check.emit(dissagregationScheme);
    }


    /** 
    * Handles Dissagregations Schemes Checkboxes Uncheck Events
    * @param dissagregationScheme The Unchecked DissagregationScheme
    */
    public onUncheck(dissagregationScheme: DissagregationScheme): void {

        this.log.trace(`${LOG_PREFIX} Entering onUncheck()`);
        this.log.debug(`${LOG_PREFIX} Unchecked Dissagregation Scheme = ${JSON.stringify(dissagregationScheme)}`);

        // Broadcast the unchecked DissagregationScheme
        this.log.trace(`${LOG_PREFIX} Broadcasting the unchecked Dissagregation Scheme`);
        this.uncheck.emit(dissagregationScheme);

    }

    /**
     * Checks whether an Dissagregation Scheme record is currently selected
     * @param dissagregationScheme The target Dissagregation Scheme
     * @returns True or false depending on whether the Dissagregation Scheme is currently selected or not respectively
     */
    public isSelected(dissagregationScheme: DissagregationScheme): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isSelected()`);
        this.log.debug(`${LOG_PREFIX} Target Dissagregation Scheme = ${JSON.stringify(dissagregationScheme)}`);

        // Check whether the Dissagregation Scheme is currently selected
        this.log.trace(`${LOG_PREFIX} Checking whether the Dissagregation Scheme is currently selected`);
        const selected: boolean = this.selected.some(id => id == dissagregationScheme.id);
        this.log.debug(`${LOG_PREFIX} Selected = ${selected}`);

        return selected;
    }


    /**
     * Checks whether an Dissagregation Scheme record is currently checked
     * @param dissagregationScheme The target Dissagregation Scheme
     * @returns True or false depending on whether the Dissagregation Scheme is currently checked or not respectively
     */
    public isChecked(dissagregationScheme: DissagregationScheme): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isChecked()`);
        this.log.debug(`${LOG_PREFIX} Target Dissagregation Scheme = ${JSON.stringify(dissagregationScheme)}`);

        // Check whether the Dissagregation Scheme is currently checked
        this.log.trace(`${LOG_PREFIX} Checking whether the Dissagregation Scheme is currently checked`);
        const checked: boolean = this.selected.some(id => id == dissagregationScheme.id);
        this.log.debug(`${LOG_PREFIX} Checked = ${checked}`);

        return checked;
    }

    /**
     * Checks whether an Dissagregation Scheme record is desired
     * @param dissagregationScheme The target Dissagregation Scheme
     * @returns True or false depending on whether the Dissagregation Scheme is desired or not respectively
     */
    public isDesired(dissagregationScheme: DissagregationScheme): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isDesired()`);
        this.log.debug(`${LOG_PREFIX} Target Dissagregation Scheme = ${JSON.stringify(dissagregationScheme)}`);

        // Check whether the Dissagregation Scheme is currently desired
        this.log.trace(`${LOG_PREFIX} Checking whether the Dissagregation Scheme is currently desired`);
        const desired: boolean = this.desired.some(id => id == dissagregationScheme.id);
        this.log.debug(`${LOG_PREFIX} Desired = ${desired}`);

        return desired;
    }

    /**
     * Checks whether an Dissagregation Scheme record is undesired
     * @param dissagregationScheme The target Dissagregation Scheme
     * @returns True or false depending on whether the Dissagregation Scheme is undesired or not respectively
     */
    public isUndesired(dissagregationScheme: DissagregationScheme): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isUndesired()`);
        this.log.debug(`${LOG_PREFIX} Target Dissagregation Scheme = ${JSON.stringify(dissagregationScheme)}`);

        // Check whether the Dissagregation Scheme is currently undesired
        this.log.trace(`${LOG_PREFIX} Checking whether the Dissagregation Scheme is currently undesired`);
        const undesired: boolean = this.undesired.some(id => id == dissagregationScheme.id);
        this.log.debug(`${LOG_PREFIX} Undesired = ${undesired}`);

        return undesired;
    }

}
