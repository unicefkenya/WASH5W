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
import { TimePeriod } from '@modules/time-periods/models/time-period.model';
import { TimePeriodState } from '@modules/time-periods/models/time-period-state.model';
import { TimePeriodsSelectionDataService } from '@modules/time-periods/services/time-periods-selection-data.service';
import { FormControl, FormGroup } from '@angular/forms';
import { ContextsDataService } from '@modules/contexts/services/contexts-data.service';
import moment from 'moment';
import { FilterService } from '@app/app-filter.service';
import { Context } from '@modules/contexts/models/context.model';

const LOG_PREFIX: string = "[Times Periods Records Selection Component]";

@Component({
    selector: 'sb-time-periods-records-selection',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './time-periods-records-selection.component.html',
    styleUrls: ['time-periods-records-selection.component.scss'],
})
export class TimePeriodsRecordsSelectionComponent implements OnInit, OnDestroy, AfterViewInit {

    // Allows the parent component to inject the desired selection mode: single or multi
    @Input() public selectionMode: string = "single";

    // Allows the parent component to inject the desired Times Periods
    @Input() public desired: number[] = [];

    // Allows the parent component to inject the undesired Times Periods
    // Ignored if the desired Times Periods has been specified
    @Input() public undesired: number[] = [];

    // Allows the parent component to inject the previously selected Times Periods
    @Input() public selected: number[] = [];

    // Broadcasts radio buttons selection events
    @Output() public select: EventEmitter<TimePeriod> = new EventEmitter<TimePeriod>();

    // Broadcasts checkboxes check events
    @Output() public check: EventEmitter<TimePeriod> = new EventEmitter<TimePeriod>();

    // Broadcasts checkboxes uncheck events
    @Output() public uncheck: EventEmitter<TimePeriod> = new EventEmitter<TimePeriod>();

    // Keeps a local reference to the displayed loading animation component.
    // Makes it possible to trigger the loading animation when a slow background service is invoked.
    private _animation!: LoadingAnimationComponent;

    // Keeps a local reference to the displayed pagination component.
    // Makes it possible to initialise / update the pagination component when the total number of records changes.
    private _pagination!: PaginationComponent;

    // Holds the required records state
    // Makes it possible to supply the filter, sort or search criteria that should be applied to records on retrieval.
    private stateSubject$ = new BehaviorSubject<TimePeriodState>({
        searchTerm: null,
        page: 1,
        pageSize: 10,
        sortColumn: 'id',
        sortDirection: 'desc',
        contextId: null,
        open: null,
        id: null
    });
    readonly state$ = this.stateSubject$.asObservable();

    // Keeps tabs of whether the component has been successfully initialised
    public initialised: boolean = false;

    // Instantitate a new reactive Form Group
    // This will allow us to define and enforce the validation rules for all the form controls.
    timePeriodsForm = new FormGroup({
        contextId: new FormControl<number | null>(null, [
        ]),
    });


    // Central gathering point for all the component's subscriptions.
    // Makes it efficient to unsubscribe from all subscriptions when the component is destroyed.   
    private _subscriptions: Subscription[] = [];

    constructor(
        public filterService: FilterService,
        public timePeriodsDataService: TimePeriodsSelectionDataService,
        public contextsDataService: ContextsDataService,
        private cd: ChangeDetectorRef,
        private log: NGXLogger) {

    }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

        // Initialise the default selected time period
        this.initialiseSelectedTimePeriod(() => {

            // Initialise the desired record state
            this.initialiseDesiredRecordsState(() => {

                // Monitor & react to desired records state changes
                this.initialiseDesiredRecordsStateChangesHandler(() => {

                    // Mark Init as complete
                    this.log.trace(`${LOG_PREFIX} Init completed`);
                    this.initialised = true;
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
     * Presets default selected time period
     * @param callback The function to call when done
     */
    private initialiseSelectedTimePeriod(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseSelectedTimePeriod()`);

        // Get the currently active Reporting Period
        this.log.trace(`${LOG_PREFIX} Getting the currently Active Reporting Period`);
        const activeReportingPeriod: TimePeriod | null | undefined = this.filterService.filter.activeReportingPeriod;
        this.log.debug(`${LOG_PREFIX} Active Reporting Period = ${JSON.stringify(activeReportingPeriod)}`);

        // Preselect the currently active Reporting Period
        this.log.trace(`${LOG_PREFIX} Preselecting the currently active Reporting Period`);
        if (activeReportingPeriod?.id && this.selected?.length == 0) {
            this.selected = [activeReportingPeriod.id]
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

        // Get the Active Context
        this.log.trace(`${LOG_PREFIX} Get the Active Context`);
        const activeContext: Context | null | undefined = this.filterService.filter.activeContext;
        this.log.debug(`${LOG_PREFIX} Active Context = ${JSON.stringify(activeContext)}`);

        this.log.trace(`${LOG_PREFIX} Get the Active Reporting Period`);
        const activeReportingPeriod: TimePeriod | null | undefined = this.filterService.filter.expandedTimePeriods[0];
        this.log.debug(`${LOG_PREFIX} Active Reporting Period = ${JSON.stringify(activeReportingPeriod)}`);

        // Make a copy of the desired records state
        this.log.trace(`${LOG_PREFIX} Making a copy of the desired records state`);
        let copy: TimePeriodState = Object.assign({}, this.stateSubject$.value);

        // Set the active Context as the desired Context
        this.log.trace(`${LOG_PREFIX} Setting the active Context as the desired Context`);
        copy.contextId = activeContext?.id;

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
                        this.log.debug(`${LOG_PREFIX} Desired records state = ${state}`);

                        // Retrieve the Time Period records corresponding to the passed in state
                        this.log.trace(`${LOG_PREFIX} Retrieving the Time Period records corresponding to the passed in state`);
                        this.timePeriodsDataService
                            .getTimePeriods(true, state)
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
            this.timePeriodsDataService.loading$
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
            this.timePeriodsDataService.totalRecords$.subscribe(
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
     * Takes in a time period object and returns a presentable string version of its period
     * @param timePeriod the time period
     * @returns The presentable string version of the time period
     */
    public getFormattedTimePeriod(timePeriod: TimePeriod): string | null {

        if (timePeriod.data.start && timePeriod.data.end) {

            switch (timePeriod.data.typeId) {

                case 1: //Daily

                    return moment(timePeriod.data.start, "YYYY-MM-DD").format("MMMM Do YYYY");

                default:

                    return `${moment(timePeriod.data.start, "YYYY-MM-DD").format("MMMM Do YYYY")} - ${moment(timePeriod.data.end, "YYYY-MM-DD").format("MMMM Do YYYY")}`;

            }

        } else {
            return null;
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
            let copy: TimePeriodState = Object.assign({}, this.stateSubject$.value);

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
            let copy: TimePeriodState = Object.assign({}, this.stateSubject$.value);

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
            let copy: TimePeriodState = Object.assign({}, this.stateSubject$.value);

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
    * Handles TimePeriod Selection Events
    * @param timePeriod The Selected TimePeriod
    */
    public onSelect(timePeriod: TimePeriod): void {

        this.log.trace(`${LOG_PREFIX} Entering onSelect()`);
        this.log.debug(`${LOG_PREFIX} Selected Time Period = ${JSON.stringify(timePeriod)}`);

        // Broadcast the selected TimePeriod
        this.log.trace(`${LOG_PREFIX} Broadcasting the selected Time Period`);
        this.select.emit(timePeriod);

        // Update the global filter
        this.log.trace(`${LOG_PREFIX} Updating the global filter`);
        this.filterService.update({ activeReportingPeriod: timePeriod });
    }


    /** 
    * Handles Times Periods Checkboxes Check Events
    * @param timePeriod The Checked TimePeriod
    */
    public onCheck(timePeriod: TimePeriod): void {

        this.log.trace(`${LOG_PREFIX} Entering onCheck()`);
        this.log.debug(`${LOG_PREFIX} Checked Time Period = ${JSON.stringify(timePeriod)}`);

        // Broadcast the checked TimePeriod
        this.log.trace(`${LOG_PREFIX} Broadcasting the checked Time Period`);
        this.check.emit(timePeriod);
    }


    /** 
    * Handles Times Periods Checkboxes Uncheck Events
    * @param timePeriod The Unchecked TimePeriod
    */
    public onUncheck(timePeriod: TimePeriod): void {

        this.log.trace(`${LOG_PREFIX} Entering onUncheck()`);
        this.log.debug(`${LOG_PREFIX} Unchecked Time Period = ${JSON.stringify(timePeriod)}`);

        // Broadcast the unchecked TimePeriod
        this.log.trace(`${LOG_PREFIX} Broadcasting the unchecked Time Period`);
        this.uncheck.emit(timePeriod);

    }

    /**
     * Checks whether a Time Period record is currently selected
     * @param timePeriod The target Time Period
     * @returns True or false depending on whether the Time Period is currently selected or not respectively
     */
    public isSelected(timePeriod: TimePeriod): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isSelected()`);
        this.log.debug(`${LOG_PREFIX} Target Time Period = ${JSON.stringify(timePeriod)}`);

        // Check whether the Time Period is currently selected
        this.log.trace(`${LOG_PREFIX} Checking whether the Time Period is currently selected`);
        const selected: boolean = this.selected.some(id => id == timePeriod.id);
        this.log.debug(`${LOG_PREFIX} Selected = ${selected}`);

        return selected;
    }


    /**
     * Checks whether a Time Period record is currently checked
     * @param timePeriod The target Time Period
     * @returns True or false depending on whether the Time Period is currently checked or not respectively
     */
    public isChecked(timePeriod: TimePeriod): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isChecked()`);
        this.log.debug(`${LOG_PREFIX} Target Time Period = ${JSON.stringify(timePeriod)}`);

        // Check whether the Time Period is currently checked
        this.log.trace(`${LOG_PREFIX} Checking whether the Time Period is currently checked`);
        const checked: boolean = this.selected.some(id => id == timePeriod.id);
        this.log.debug(`${LOG_PREFIX} Checked = ${checked}`);

        return checked;
    }

    /**
     * Checks whether a Time Period record is desired
     * @param timePeriod The target Time Period
     * @returns True or false depending on whether the Time Period is desired or not respectively
     */
    public isDesired(timePeriod: TimePeriod): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isDesired()`);
        this.log.debug(`${LOG_PREFIX} Target Time Period = ${JSON.stringify(timePeriod)}`);

        // Check whether the Time Period is currently desired
        this.log.trace(`${LOG_PREFIX} Checking whether the Time Period is currently desired`);
        const desired: boolean = this.desired.some(id => id == timePeriod.id);
        this.log.debug(`${LOG_PREFIX} Desired = ${desired}`);

        return desired;
    }

    /**
     * Checks whether a Time Period record is undesired
     * @param timePeriod The target Time Period
     * @returns True or false depending on whether the Time Period is undesired or not respectively
     */
    public isUndesired(timePeriod: TimePeriod): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isUndesired()`);
        this.log.debug(`${LOG_PREFIX} Target Time Period = ${JSON.stringify(timePeriod)}`);

        // Check whether the Time Period is currently undesired
        this.log.trace(`${LOG_PREFIX} Checking whether the Time Period is currently undesired`);
        const undesired: boolean = this.undesired.some(id => id == timePeriod.id);
        this.log.debug(`${LOG_PREFIX} Undesired = ${undesired}`);

        return undesired;
    }

}
