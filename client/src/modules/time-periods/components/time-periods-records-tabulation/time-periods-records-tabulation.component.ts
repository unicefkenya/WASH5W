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
import { Subscription, BehaviorSubject, first, Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TimePeriodsDataService } from '@modules/time-periods/services/time-periods-data.service';
import { TimePeriod } from '@modules/time-periods/models/time-period.model';
import { TimePeriodState } from '@modules/time-periods/models/time-period-state.model';
import moment from 'moment';
import { FormGroup, FormControl } from '@angular/forms';
import { FilterService } from '@app/app-filter.service';
import { ContextsDataService } from '@modules/contexts/services/contexts-data.service';
import { TimePeriodsRecordsClosureModalComponent } from '@modules/time-periods/containers';
import { Context } from '@modules/contexts/models/context.model';

const LOG_PREFIX: string = "[Times Periods Records Tabulation Component]";

@Component({
    selector: 'sb-time-periods-records-tabulation',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './time-periods-records-tabulation.component.html',
    styleUrls: ['time-periods-records-tabulation.component.scss'],
})
export class TimePeriodsRecordsTabulationComponent implements OnInit, OnDestroy, AfterViewInit {

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
    private stateSubject$ = new BehaviorSubject<TimePeriodState>({
        page: 1,
        pageSize: 20,
        searchTerm: null,
        sortColumn: 'id',
        sortDirection: 'desc',
        contextId: null,
        open: null,
        id: null
    });
    readonly state$ = this.stateSubject$.asObservable();

    // Keeps tabs of the current button disabled state in accordance with the client's online/offline state
    // Should be updated when the online status changes
    private _disabledSubject$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
    readonly disabled$: Observable<boolean> = this._disabledSubject$.asObservable();

    // Keeps tabs on the records skipped due to pagination
    paginationOffset: number = 0;

    // Keeps tabs of whether the component has been initialised
    public initialised: boolean = false;

    // Central gathering point for all the component's subscriptions.
    // Makes it efficient to unsubscribe from all subscriptions when the component is destroyed.   
    private _subscriptions: Subscription[] = [];

    // Instantitate a new reactive Form Group
    // This will allow us to define and enforce the validation rules for all the form controls.
    timePeriodsForm = new FormGroup({
        contextId: new FormControl<number | null>(null, [
        ]),
    });

    constructor(
        public contextsDataService: ContextsDataService,
        public timePeriodsDataService: TimePeriodsDataService,
        public filterService: FilterService,
        public modalService: NgbModal,
        private cd: ChangeDetectorRef,
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

                    // Preselect the active Context in the data tabulation form
                    this.initialiseFormGroup(() => {

                        // Monitor & react to desired records state changes
                        this.initialiseDesiredRecordsStateChangesHandler(() => {

                            // Mark Init as complete
                            this.log.trace(`${LOG_PREFIX} Init completed`);
                            this.initialised = true;
                            this.cd.detectChanges();
                        });
                    });

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
                            let copy: TimePeriodState = Object.assign({}, this.stateSubject$.value);

                            // Update the copy of the desired records state
                            this.log.trace(`${LOG_PREFIX} Updating the copy of the desired records state`);
                            Object.assign(copy, { contextId: filter.activeContext?.id });

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

        this.log.trace(`${LOG_PREFIX} Get the Active Context`);
        const activeContext: Context | null | undefined = this.filterService.filter.activeContext;
        this.log.debug(`${LOG_PREFIX} Active Context = ${JSON.stringify(activeContext)}`);

        // Make a copy of the desired records state
        this.log.trace(`${LOG_PREFIX} Making a copy of the desired records state`);
        let copy: TimePeriodState = Object.assign({}, this.stateSubject$.value);

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
        this.timePeriodsForm.get('contextId')?.setValue((activeContext && activeContext.id) ? activeContext.id : null);


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

                        // Retrieve the Times Periods records corresponding to the passed in state
                        this.log.trace(`${LOG_PREFIX} Retrieving the Times Periods records corresponding to the passed in state`);
                        this.timePeriodsDataService
                            .getTimePeriods(true, state)
                            .pipe(first())
                            .subscribe({
                                next: (s: TimePeriod[]) => {

                                    // Times Periods records retrieved
                                    this.log.trace(`${LOG_PREFIX} Times Periods records retrieved`);
                                    this.log.debug(`${LOG_PREFIX} Times Periods records = ${JSON.stringify(s)}`);

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
     * @see https://momentjs.com/docs/#/parsing/string/
     */
    public getFormattedTimePeriod(timePeriod: TimePeriod): string | null {

        if (timePeriod.data.start && timePeriod.data.end) {

            switch (timePeriod.data.typeId) {

                case 1: //Daily

                    return moment(timePeriod.data.start, "YYYY-MM-DD").format("ddd, MMM DD YYYY");

                default:

                    return `${moment(timePeriod.data.start, "YYYY-MM-DD").format("ddd, MMM DD YYYY")} - ${moment(timePeriod.data.end, "YYYY-MM-DD").format("ddd, MMM DD YYYY")}`;

            }

        } else {
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
        this.log.debug(`${LOG_PREFIX} Search = ${page}`);

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
        this.log.debug(`${LOG_PREFIX} Search = ${pageSize}`);

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
     * Handles Times Periods Records Closure Requests
     */
    public onCloseTimePeriod(id: number): void {

        this.log.trace(`${LOG_PREFIX} Entering onCloseTimePeriod()`);
        this.log.debug(`${LOG_PREFIX} Time Period Id = ${id}`);

        const modalRef = this.modalService.open(TimePeriodsRecordsClosureModalComponent, { centered: true, backdrop: 'static' });
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
