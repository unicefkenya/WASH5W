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
import { AdministrativeUnitType } from '@modules/administrative-units-types/models/administrative-unit-type.model';
import { AdministrativeUnitTypeState } from '@modules/administrative-units-types/models/administrative-unit-type-state.model';
import { AdministrativeUnitsTypesSelectionDataService } from '@modules/administrative-units-types/services/administrative-units-types-selection-data.service';

const LOG_PREFIX: string = "[Administrative Units Types Records Selection Component]";

@Component({
    selector: 'sb-administrativeUnitsTypes-records-selection',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './administrative-units-types-records-selection.component.html',
    styleUrls: ['administrative-units-types-records-selection.component.scss'],
})
export class AdministrativeUnitsTypesRecordsSelectionComponent implements OnInit, OnDestroy, AfterViewInit {

    // Allows the parent component to inject the desired selection mode: single or multi
    @Input() public selectionMode: string = "single";

    // Allows the parent component to inject the desired Administrative Units Types
    @Input() public desired: number[] = [];

    // Allows the parent component to inject the undesired Administrative Units Types
    // Ignored if the desired Administrative Units Types has been specified
    @Input() public undesired: number[] = [];

    // Allows the parent component to inject the previously selected Administrative Units Types
    @Input() public selected: number[] = [];

    // Broadcasts radio buttons selection events
    @Output() public select: EventEmitter<AdministrativeUnitType> = new EventEmitter<AdministrativeUnitType>();

    // Broadcasts checkboxes check events
    @Output() public check: EventEmitter<AdministrativeUnitType> = new EventEmitter<AdministrativeUnitType>();

    // Broadcasts checkboxes uncheck events
    @Output() public uncheck: EventEmitter<AdministrativeUnitType> = new EventEmitter<AdministrativeUnitType>();

    // Keeps a local reference to the displayed loading animation component.
    // Makes it possible to trigger the loading animation when a slow background service is invoked.
    private _animation!: LoadingAnimationComponent;

    // Keeps a local reference to the displayed pagination component.
    // Makes it possible to initialise / update the pagination component when the total number of records changes.
    private _pagination!: PaginationComponent;

    // Holds the required records state
    // Makes it possible to supply the filter, sort or search criteria that should be applied to records on retrieval.
    private stateSubject$ = new BehaviorSubject<AdministrativeUnitTypeState>({
        searchTerm: null,
        page: 1,
        pageSize: 10,
        sortColumn: 'name',
        sortDirection: 'asc',
        id: null,
        plural: null,
        name: null
    });
    readonly state$ = this.stateSubject$.asObservable();

    // Central gathering point for all the component's subscriptions.
    // Makes it efficient to unsubscribe from all subscriptions when the component is destroyed.   
    private _subscriptions: Subscription[] = [];

    constructor(
        private cd: ChangeDetectorRef,
        public administrativeUnitsTypesDataService: AdministrativeUnitsTypesSelectionDataService,
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

                        // Retrieve the Administrative Unit Type records corresponding to the passed in state
                        this.log.trace(`${LOG_PREFIX} Retrieving the Administrative Unit Type records corresponding to the passed in state`);
                        this.administrativeUnitsTypesDataService
                            .getAdministrativeUnitsTypes(true,state)
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
            this.administrativeUnitsTypesDataService.loading$
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
            this.administrativeUnitsTypesDataService.totalRecords$.subscribe(
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
            let copy: AdministrativeUnitTypeState = Object.assign({}, this.stateSubject$.value);

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
            let copy: AdministrativeUnitTypeState = Object.assign({}, this.stateSubject$.value);

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
            let copy: AdministrativeUnitTypeState = Object.assign({}, this.stateSubject$.value);

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
    * Handles AdministrativeUnitType Selection Events
    * @param administrativeUnitType The Selected AdministrativeUnitType
    */
    public onSelect(administrativeUnitType: AdministrativeUnitType): void {

        this.log.trace(`${LOG_PREFIX} Entering onSelect()`);
        this.log.debug(`${LOG_PREFIX} Selected Administrative Unit Type = ${JSON.stringify(administrativeUnitType)}`);

        // Broadcast the selected AdministrativeUnitType
        this.log.trace(`${LOG_PREFIX} Broadcasting the selected Administrative Unit Type`);
        this.select.emit(administrativeUnitType);
    }


    /** 
    * Handles Administrative Units Types Checkboxes Check Events
    * @param administrativeUnitType The Checked AdministrativeUnitType
    */
    public onCheck(administrativeUnitType: AdministrativeUnitType): void {

        this.log.trace(`${LOG_PREFIX} Entering onCheck()`);
        this.log.debug(`${LOG_PREFIX} Checked Administrative Unit Type = ${JSON.stringify(administrativeUnitType)}`);

        // Broadcast the checked AdministrativeUnitType
        this.log.trace(`${LOG_PREFIX} Broadcasting the checked Administrative Unit Type`);
        this.check.emit(administrativeUnitType);
    }


    /** 
    * Handles Administrative Units Types Checkboxes Uncheck Events
    * @param administrativeUnitType The Unchecked AdministrativeUnitType
    */
    public onUncheck(administrativeUnitType: AdministrativeUnitType): void {

        this.log.trace(`${LOG_PREFIX} Entering onUncheck()`);
        this.log.debug(`${LOG_PREFIX} Unchecked Administrative Unit Type = ${JSON.stringify(administrativeUnitType)}`);

        // Broadcast the unchecked AdministrativeUnitType
        this.log.trace(`${LOG_PREFIX} Broadcasting the unchecked Administrative Unit Type`);
        this.uncheck.emit(administrativeUnitType);

    }

    /**
     * Checks whether an Administrative Unit Type record is currently selected
     * @param administrativeUnitType The target Administrative Unit Type
     * @returns True or false depending on whether the Administrative Unit Type is currently selected or not respectively
     */
    public isSelected(administrativeUnitType: AdministrativeUnitType): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isSelected()`);
        this.log.debug(`${LOG_PREFIX} Target Administrative Unit Type = ${JSON.stringify(administrativeUnitType)}`);

        // Check whether the Administrative Unit Type is currently selected
        this.log.trace(`${LOG_PREFIX} Checking whether the Administrative Unit Type is currently selected`);
        const selected: boolean = this.selected.some(id => id == administrativeUnitType.id);
        this.log.debug(`${LOG_PREFIX} Selected = ${selected}`);

        return selected;
    }


    /**
     * Checks whether an Administrative Unit Type record is currently checked
     * @param administrativeUnitType The target Administrative Unit Type
     * @returns True or false depending on whether the Administrative Unit Type is currently checked or not respectively
     */
    public isChecked(administrativeUnitType: AdministrativeUnitType): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isChecked()`);
        this.log.debug(`${LOG_PREFIX} Target Administrative Unit Type = ${JSON.stringify(administrativeUnitType)}`);

        // Check whether the Administrative Unit Type is currently checked
        this.log.trace(`${LOG_PREFIX} Checking whether the Administrative Unit Type is currently checked`);
        const checked: boolean = this.selected.some(id => id == administrativeUnitType.id);
        this.log.debug(`${LOG_PREFIX} Checked = ${checked}`);

        return checked;
    }

    /**
     * Checks whether an Administrative Unit Type record is desired
     * @param administrativeUnitType The target Administrative Unit Type
     * @returns True or false depending on whether the Administrative Unit Type is desired or not respectively
     */
    public isDesired(administrativeUnitType: AdministrativeUnitType): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isDesired()`);
        this.log.debug(`${LOG_PREFIX} Target Administrative Unit Type = ${JSON.stringify(administrativeUnitType)}`);

        // Check whether the Administrative Unit Type is currently desired
        this.log.trace(`${LOG_PREFIX} Checking whether the Administrative Unit Type is currently desired`);
        const desired: boolean = this.desired.some(id => id == administrativeUnitType.id);
        this.log.debug(`${LOG_PREFIX} Desired = ${desired}`);

        return desired;
    }

    /**
     * Checks whether an Administrative Unit Type record is undesired
     * @param administrativeUnitType The target Administrative Unit Type
     * @returns True or false depending on whether the Administrative Unit Type is undesired or not respectively
     */
    public isUndesired(administrativeUnitType: AdministrativeUnitType): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isUndesired()`);
        this.log.debug(`${LOG_PREFIX} Target Administrative Unit Type = ${JSON.stringify(administrativeUnitType)}`);

        // Check whether the Administrative Unit Type is currently undesired
        this.log.trace(`${LOG_PREFIX} Checking whether the Administrative Unit Type is currently undesired`);
        const undesired: boolean = this.undesired.some(id => id == administrativeUnitType.id);
        this.log.debug(`${LOG_PREFIX} Undesired = ${undesired}`);

        return undesired;
    }

}
