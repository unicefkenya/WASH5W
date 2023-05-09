import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostListener,
    Input,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core';
import { LoadingAnimationComponent, PaginationComponent } from '@common/components';
import { NGXLogger } from 'ngx-logger';
import { Subscription, first, BehaviorSubject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QuantitiesObservationsRecordsCreationModalComponent } from '@modules/quantities-observations/containers/quantities-observations-records-creation-modal/quantities-observations-records-creation-modal.component';
import { QuantitiesObservationsRecordsDeletionModalComponent } from '@modules/quantities-observations/containers/quantities-observations-records-deletion-modal/quantities-observations-records-deletion-modal.component';
import { QuantitiesObservationsDataService } from '@modules/quantities-observations/services/quantities-observations-data.service';
import { Filter, FilterService } from '@app/app-filter.service';
import { QuantityObservation } from '@modules/quantities-observations/models/quantity-observation.model';
import { QuantityObservationState } from '@modules/quantities-observations/models/quantity-observation-state.model';
import { AdministrativeUnit } from '@modules/administrative-units/models/administrative-unit.model';

const LOG_PREFIX: string = "[Quantities Observations Records Tabulation Component]";

@Component({
    selector: 'sb-quantities-observations-records-tabulation',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './quantities-observations-records-tabulation.component.html',
    styleUrls: ['quantities-observations-records-tabulation.component.scss'],
})
export class QuantitiesObservationsRecordsTabulationComponent implements OnInit, OnDestroy, AfterViewInit {

    // Allows the parent component to inject the unique identifier of the active time period
    @Input() public timePeriodId!: number | null;

    // Allows the parent component to inject the unique identifier of the target indicator
    @Input() public phenomenonTypeId!: number | null;

    // Allows the parent component to inject the unique identifier of the target indicator's unit of measure
    @Input() public unitId!: number | null;

    // Allows the parent component to inject the unique identifier of the target observation type e.g. target / actual
    @Input() public observationTypeId!: number | null;

    // Keeps a local reference to the displayed loading animation component.
    // Makes it possible to trigger the loading animation when a slow background service is invoked.
    private _animation!: LoadingAnimationComponent;

    // Keeps a local reference to the displayed pagination component.
    // Makes it possible to initialise / update the pagination component when the total number of records changes.
    private _pagination!: PaginationComponent;

    // Holds the required records state
    // Makes it possible to supply the filter, sort or search criteria that should be applied to records on retrieval.
    private stateSubject$ = new BehaviorSubject<QuantityObservationState>({
        page: 1,
        pageSize: 5,
        searchTerm: null,
        sortColumn: 'id',
        sortDirection: 'asc',
        partiesIds: null,
        timePointId: null,
        timePointIdGTE: null,
        timePointIdLTE: null,
        timePeriodId: null,
        phenomenonTypesIds: null,
        observationTypeId: null
    });
    readonly state$ = this.stateSubject$.asObservable();




    // Keeps tabs on the records skipped due to pagination
    paginationOffset: number = 0;

    // Central gathering point for all the component's subscriptions.
    // Makes it efficient to unsubscribe from all subscriptions when the component is destroyed.   
    private _subscriptions: Subscription[] = [];


    // Keeps tabs of whether the component has been successfully initialised
    public initialised: boolean = false;

    constructor(
        private cd: ChangeDetectorRef,
        public quantitiesObservationsDataService: QuantitiesObservationsDataService,
        private filterService: FilterService,
        private modalService: NgbModal,
        private log: NGXLogger) {

    }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

        // Set the desired records state
        this.initialiseDesiredRecordsState(() => {

            // Monitor & react to desired records state changes
            this.initialiseDesiredRecordsStateChangesHandler(() => {

                // Monitor & react to location changes
                this.initialiseAdministrativeUnitChangesListener(() => {

                    // Mark Init as complete
                    this.log.trace(`${LOG_PREFIX} Init completed`);
                    this.initialised = true;
                    this.cd.markForCheck();

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
     * Presets default values in the desired records state bean
     * @param callback The function to call when done
     */
    private initialiseDesiredRecordsState(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseDesiredRecordsState()`);

        // Get the active Administrative Unit
        this.log.trace(`${LOG_PREFIX} Getting the active Administrative Unit`);
        const activeAdministrativeUnit: AdministrativeUnit | null | undefined = this.filterService.filter.activeAdministrativeUnit;
        this.log.debug(`${LOG_PREFIX} Active administrative unit = ${JSON.stringify(activeAdministrativeUnit)}`);

        // Make a copy of the desired records state
        this.log.trace(`${LOG_PREFIX} Making a copy of the desired records state`);
        let copy: QuantityObservationState = Object.assign({}, this.stateSubject$.value);

        // Set the active QuantityObservation Type as the desired QuantityObservation Type
        this.log.trace(`${LOG_PREFIX} Setting the active QuantityObservation Type as the desired QuantityObservation Type`);
        Object.assign(copy, {
            partiesIds: activeAdministrativeUnit && activeAdministrativeUnit.id ? [activeAdministrativeUnit.id] : [-1],
            phenomenonTypesIds: this.phenomenonTypeId ? [this.phenomenonTypeId] : [-1],
            observationTypeId: this.observationTypeId ? this.observationTypeId : -1
        });

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

                        // Retrieve the QuantitiesObservations records corresponding to the passed in state
                        this.log.trace(`${LOG_PREFIX} Retrieving the QuantitiesObservations records corresponding to the passed in state`);
                        this.quantitiesObservationsDataService
                            .getQuantitiesObservations(true, state)
                            .pipe(first())
                            .subscribe({
                                next: (s: QuantityObservation[]) => {

                                    // QuantitiesObservations records retrieved
                                    this.log.trace(`${LOG_PREFIX} QuantitiesObservations records retrieved`);
                                    this.log.debug(`${LOG_PREFIX} QuantitiesObservations records = ${JSON.stringify(s)}`);

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
     * Initialises administrative units changes listener
     * @param callback The function to call when done
     */
    private initialiseAdministrativeUnitChangesListener(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseAdministrativeUnitChangesListener()`);

        this._subscriptions.push(
            this.filterService.currentFilter$.subscribe({
                next: (filter: Filter) => {

                    // Check if a different Administrative Unit has been selected
                    this.log.trace(`${LOG_PREFIX} Checking if a different Administrative Unit has been selected`);

                    if (filter.activeAdministrativeUnit?.id != this.getCurrentPartyId()) {

                        // A different Administrative Unit has been selected
                        this.log.trace(`${LOG_PREFIX} A different Administrative Unit has been selected`);

                        // Make a copy of the desired records state
                        this.log.trace(`${LOG_PREFIX} Making a copy of the desired records state`);
                        let copy: QuantityObservationState = Object.assign({}, this.stateSubject$.value);

                        // Update the copy of the desired records state
                        this.log.trace(`${LOG_PREFIX} Updating the copy of the desired records state`);
                        Object.assign(copy, {
                            partiesIds: filter.activeAdministrativeUnit && filter.activeAdministrativeUnit.id ? [filter.activeAdministrativeUnit.id] : [-1],
                        });

                        // Broadcast the newly desired record state
                        this.log.trace(`${LOG_PREFIX} Broadcasting the newly desired record state`);
                        this.stateSubject$.next(copy);

                    } else {

                        // A different Administrative Unit has not been selected
                        this.log.trace(`${LOG_PREFIX} A different Administrative Unit has not been selected`);

                        // Ignore the update
                        this.log.trace(`${LOG_PREFIX} Ignoring the update`);

                    }
                }
            })
        )

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
     * Subscribe and react to loading status changes
     * @param callback The function to call when done
     */
    private initialiseLoadingStatusChangesHandler(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseLoadingStatusChangesHandler()`);

        // Subscribe to loading events and propagate them to the loading component.
        this.log.trace(`${LOG_PREFIX} Subscribing to loading status changes`);
        this._subscriptions.push(
            this.quantitiesObservationsDataService.loading$
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
            this.quantitiesObservationsDataService.totalRecords$.subscribe(
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

    getCurrentPartyId(): number | null {
        if (this.stateSubject$.value.partiesIds && this.stateSubject$.value.partiesIds.length > 0) {
            return this.stateSubject$.value.partiesIds[0];
        } else {
            return null;
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
            let copy: QuantityObservationState = Object.assign({}, this.stateSubject$.value);

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
            let copy: QuantityObservationState = Object.assign({}, this.stateSubject$.value);

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
     * Handles QuantitiesObservations Records Addition Requests
     */
    public onAddQuantityObservation(): void {

        this.log.trace(`${LOG_PREFIX} Entering onAddQuantityObservation()`);
        const modalRef = this.modalService.open(QuantitiesObservationsRecordsCreationModalComponent, { centered: true, backdrop: 'static' });
        modalRef.componentInstance.timePeriodId = this.timePeriodId;
        modalRef.componentInstance.phenomenonTypeId = this.phenomenonTypeId;
        modalRef.componentInstance.unitId = this.unitId;
        modalRef.componentInstance.observationTypeId = this.observationTypeId;
    }


    /**
     * Handles QuantitiesObservations Records Deletion Requests
     * * @param id The unique identifier of the Quantity Observation record to delete
     */
    public onDeleteQuantityObservation(id: number): void {

        this.log.trace(`${LOG_PREFIX} Entering onDeleteQuantityObservation()`);
        this.log.debug(`${LOG_PREFIX} Quantity Observation Record Id = ${id}`);
        const modalRef = this.modalService.open(QuantitiesObservationsRecordsDeletionModalComponent, { centered: true, backdrop: 'static' });
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

    public getFormattedDateString(timepointId: number | null): string | null {
        return this.formatDateString(this.getDateStringFromTimepointId(timepointId));
    }

    public getShortFormattedDateString(timepointId: number | null): string | null {
        return this.formatDateStringShort(this.getDateStringFromTimepointId(timepointId));
    }



    private getDateStringFromTimepointId(timepointId: number | null): string | null {

        if (timepointId) {
            let yearString = timepointId.toString();
            let output = [];

            for (var i = 0, len = yearString.length; i < len; i++) {
                output.push(yearString.charAt(i));
            }

            return output[0]
                + "" + output[1]
                + "" + output[2]
                + "" + output[3]
                + "-" + output[4]
                + "" + output[5]
                + "-" + output[6]
                + "" + output[7]
        } else {
            return null;
        }

    }

    private formatDateString(dateString: string | null): string | null {

        if (dateString) {
            let date: Date = new Date(dateString);
            let year = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date);
            let month = new Intl.DateTimeFormat('en', { month: 'long' }).format(date);
            let day = new Intl.DateTimeFormat('en', { day: 'numeric' }).format(date);

            return `${day} ${month} ${year}`;
        } else {
            return null;
        }
    }

    private formatDateStringShort(dateString: string | null): string | null {

        if (dateString) {
            let date: Date = new Date(dateString);
            let year = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date);
            let month = new Intl.DateTimeFormat('en', { month: 'short' }).format(date);
            let day = new Intl.DateTimeFormat('en', { day: 'numeric' }).format(date);

            return `${day} ${month} ${year}`;
        } else {
            return null;
        }
    }


}
