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
import { OrganisationsDataService } from '@modules/organisations/services/organisations-data.service';
import { FormControl, FormGroup } from '@angular/forms';
import { OrganisationsTypesDataService } from '@modules/organisations-types/services/organisations-types-data.service';
import { FilterService } from '@app/app-filter.service';
import { Organisation, OrganisationState } from '@modules/organisations/models';
import { OrganisationType } from '@modules/organisations-types/models/organisation-type.model';

const LOG_PREFIX: string = "[Organisations Records Selection Component]";

@Component({
    selector: 'sb-organisations-records-selection',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './organisations-records-selection.component.html',
    styleUrls: ['organisations-records-selection.component.scss'],
})
export class OrganisationsRecordsSelectionComponent implements OnInit, OnDestroy, AfterViewInit {

    // Allows the parent component to inject the desired selection mode: single or multi
    @Input() public selectionMode: string = "single";

    // Allows the parent component to inject the desired Organisation Types
    @Input() public desiredTypes!: number[];

    // Allows the parent component to inject the desired Organisation
    @Input() public desired: number[] = [];

    // Allows the parent component to inject the undesired Organisations
    // Ignored if the desired Organisations has been specified
    @Input() public undesired: number[] = [];

    // Allows the parent component to inject the previously selected Organisations
    @Input() public selected: number[] = [];

    // Broadcasts radio buttons selection events
    @Output() public select: EventEmitter<Organisation> = new EventEmitter<Organisation>();

    // Broadcasts checkboxes check events
    @Output() public check: EventEmitter<Organisation> = new EventEmitter<Organisation>();

    // Broadcasts checkboxes uncheck events
    @Output() public uncheck: EventEmitter<Organisation> = new EventEmitter<Organisation>();

    // Keeps a local reference to the displayed loading animation component.
    // Makes it possible to trigger the loading animation when a slow background service is invoked.
    private _animation!: LoadingAnimationComponent;

    // Keeps a local reference to the displayed pagination component.
    // Makes it possible to initialise / update the pagination component when the total number of records changes.
    private _pagination!: PaginationComponent;

    // Holds the component's initialisation status.
    // Makes it possible to display the most appropriate content based on whether the initialisation was a success or not.
    initialised: boolean | undefined;

    // Holds the required records state
    // Makes it possible to supply the filter, sort or search criteria that should be applied to records on retrieval.
    private stateSubject$ = new BehaviorSubject<OrganisationState>({
        page: 1,
        pageSize: 5,
        searchTerm: null,
        sortColumn: 'name',
        sortDirection: 'asc',
        id: null,
        typeId: null,
        name: null,
        abbreviation: null
    });
    readonly state$ = this.stateSubject$.asObservable();

    // Central gathering point for all the component's subscriptions.
    // Makes it efficient to unsubscribe from all subscriptions when the component is destroyed.   
    private _subscriptions: Subscription[] = [];

    // Instantitate a new reactive Form Group
    // This will allow us to define and enforce the validation rules for all the form controls.
    organisationsForm = new FormGroup({
        typeId: new FormControl<number | null>(null, [
        ]),
    });

    constructor(
        private cd: ChangeDetectorRef,
        public organisationsTypesDataService: OrganisationsTypesDataService,
        public organisationsDataService: OrganisationsDataService,
        private filterService: FilterService,
        private log: NGXLogger) {

    }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

        // Retrieve and cache Organisations Types locally
        this.initialiseOrganisationsTypes(() => {

            // Set the default active Organisation Type if not set
            this.initialiseActiveOrganisationType(() => {

                // Set the default active Organisation Type's id as the typeId in the desired records state
                this.initialiseDesiredRecordsState(() => {

                    // Preselect the active Organisation Type in the data tabulation form
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
     * Retrieves and caches Organisations Types records
     * @param callback The function to call when done
     */
    private initialiseOrganisationsTypes(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseOrganisationsTypes()`);

        // Retrieve and cache all the Organisations Types records
        this.log.trace(`${LOG_PREFIX} Retrieving and caching all the Organisations Types records`);
        this.organisationsTypesDataService
            .getOrganisationsTypes(true, {
                searchTerm: null,
                page: null,
                pageSize: null,
                sortColumn: 'name',
                sortDirection: 'asc',
                id: null,
                name: null,
                plural: null,
                abbreviation: null,
                colourCode: null  
            })
            .pipe(first()) // This will automatically complete (and therefore unsubscribe) after the first value has been emitted.
            .subscribe({
                next: (organisationsTypes: OrganisationType[]) => {

                    // Organisations Types successfully retrieved and cached
                    this.log.debug(`${LOG_PREFIX} ${organisationsTypes.length} Organisations Types(s) retrieved and cached`);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                },

                error: (err: any) => {

                    // Organisations Types retrieval failed
                    this.log.error(`${LOG_PREFIX} Organisations Types retrieval failed`);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                }
            });

    }


    /**
     * Sets the active Organisation Type if it has not been set in the global filter
     * @param callback The function to call when done
     */
    private initialiseActiveOrganisationType(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseActiveOrganisationType()`);

        // Check if the active Organisation Type has been set in the global filter
        this.log.trace(`${LOG_PREFIX} Checking if the active Organisation Type has been set in the global filter`);
        if (this.filterService.filter.activeOrganisationType) {

            // The active Organisation Type has been set in the global filter
            this.log.trace(`${LOG_PREFIX} The active Organisation Type has been set in the global filter`);

            // Check if the active Organisation Type record exists in the cache
            this.log.trace(`${LOG_PREFIX} Checking if the active Organisation Type record exists in the cache`);
            if (this.organisationsTypesDataService.records.some(a => a.id == this.filterService.filter.activeOrganisationType?.id)) {

                // The active Organisation Type record exists in the cache
                this.log.trace(`${LOG_PREFIX} The active Organisation Type record exists in the cache`);

                // Initialisation is valid
                this.log.trace(`${LOG_PREFIX} Initialisation is valid`);

            } else {

                // Initialisation is invalid
                this.log.trace(`${LOG_PREFIX} Initialisation is invalid`);

                // Get the first Organisation Type record
                this.log.trace(`${LOG_PREFIX} Get the first Organisation Type record`);
                const organisationType: OrganisationType | null = this.organisationsTypesDataService.records.length > 0 ? this.organisationsTypesDataService.records[0] : null;
                this.log.trace(`${LOG_PREFIX} First Organisation Type record = ${JSON.stringify(organisationType)}`);

                // Update the global filter
                this.log.trace(`${LOG_PREFIX} Updating the global filter`);
                this.filterService.update({ activeOrganisationType: organisationType });

            }

            // Return
            this.log.trace(`${LOG_PREFIX} Returning`);
            callback();

        } else {

            // The active Organisation Type has not been set in the global filter
            this.log.trace(`${LOG_PREFIX} The active Organisation Type has not been set in the global filter`);

            // Get the first Organisation Type record
            this.log.trace(`${LOG_PREFIX} Get the first Organisation Type record`);
            const organisationType: OrganisationType | null = this.organisationsTypesDataService.records.length > 0 ? this.organisationsTypesDataService.records[0] : null;
            this.log.trace(`${LOG_PREFIX} First Organisation Type record = ${JSON.stringify(organisationType)}`);

            // Update the global filter
            this.log.trace(`${LOG_PREFIX} Updating the global filter`);
            this.filterService.update({ activeOrganisationType: organisationType });

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

        // Make a copy of the desired records state
        this.log.trace(`${LOG_PREFIX} Making a copy of the desired records state`);
        let copy: OrganisationState = Object.assign({}, this.stateSubject$.value);

        // Set the active target Organisation Types based on whether the window has been previously initialised
        this.log.trace(`${LOG_PREFIX} Setting the active target Organisation Types based on whether the window has been previously initialised`);
        if (this.initialised) {

            this.log.trace(`${LOG_PREFIX} Get the Active Organisation Type`);
            const activeOrganisationType: OrganisationType | null | undefined = this.filterService.filter.activeOrganisationType;
            this.log.debug(`${LOG_PREFIX} Active Organisation Type = ${JSON.stringify(activeOrganisationType)}`);

            Object.assign(copy, { typeId: activeOrganisationType && activeOrganisationType.id ? [activeOrganisationType.id] : null });

        } else {

            if (this.desiredTypes) {
                Object.assign(copy, { typeId: this.desiredTypes });
            }
        }


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

        this.log.trace(`${LOG_PREFIX} Get the Active Organisation Type`);
        const activeOrganisationType: OrganisationType | null | undefined = this.filterService.filter.activeOrganisationType;
        this.log.debug(`${LOG_PREFIX} Active Organisation Type = ${JSON.stringify(activeOrganisationType)}`);

        // Select the active Organisation Type
        this.log.trace(`${LOG_PREFIX} Selecting the active Organisation Type`);
        this.organisationsForm.get('typeId')?.setValue((activeOrganisationType && activeOrganisationType.id) ? activeOrganisationType.id : null);


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

                        // Retrieve the Organisations records corresponding to the passed in state
                        this.log.trace(`${LOG_PREFIX} Retrieving the Organisations records corresponding to the passed in state`);
                        this.organisationsDataService
                            .getOrganisations(true, state)
                            .pipe(first())
                            .subscribe({
                                next: (s: Organisation[]) => {

                                    // Organisations records retrieved
                                    this.log.trace(`${LOG_PREFIX} Organisations records retrieved`);
                                    this.log.debug(`${LOG_PREFIX} Organisations records = ${JSON.stringify(s)}`);

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
            this.organisationsDataService.loading$
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
            this.organisationsDataService.totalRecords$.subscribe(
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
     * Handles Organisation Type change events
     */
     public onOrganisationTypeChange(): void {

        this.log.trace(`${LOG_PREFIX} Entering onOrganisationTypeChange()`);


        // Get the selected Organisation Type Id
        this.log.trace(`${LOG_PREFIX} Getting the selected Organisation Type Id`);
        const typeId: number | null | undefined = this.organisationsForm.get('typeId')?.value
        this.log.debug(`${LOG_PREFIX} Organisation Type Id = ${typeId}`);

        // Check if the specified Organisation Type is different from the current Organisation Type
        this.log.trace(`${LOG_PREFIX} Check if the specified Organisation Type is different from the current Organisation Type`);

        if (this.stateSubject$.value.typeId != typeId) {

            // The specified Organisation Type is different from the current Organisation Type
            this.log.trace(`${LOG_PREFIX} The specified Organisation Type is different from the current Organisation Type`);

            // Update the global filter
            this.log.trace(`${LOG_PREFIX} Updating the global filter`);
            this.filterService.update({ activeOrganisationType: this.organisationsTypesDataService.records.find(a => a.id == typeId) });

            // Make a copy of the desired records state
            this.log.trace(`${LOG_PREFIX} Making a copy of the desired records state`);
            let copy: OrganisationState = Object.assign({}, this.stateSubject$.value);

            // Update the copy of the desired records state
            this.log.trace(`${LOG_PREFIX} Updating the copy of the desired records state`);
            Object.assign(copy, { typeId: typeId, page: 1 });

            // Broadcast the newly desired record state
            this.log.trace(`${LOG_PREFIX} Broadcasting the newly desired record state`);
            this.stateSubject$.next(copy);

        } else {

            // The specified Organisation Type is not different from the current Organisation Type
            this.log.trace(`${LOG_PREFIX} The specified Organisation Type is not different from the current Organisation Type`);

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
            let copy: OrganisationState = Object.assign({}, this.stateSubject$.value);

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
            let copy: OrganisationState = Object.assign({}, this.stateSubject$.value);

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
            let copy: OrganisationState = Object.assign({}, this.stateSubject$.value);

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
    * Handles Organisation Selection Events
    * @param organisation The Selected Organisation
    */
    onSelect(organisation: Organisation) {

        this.log.trace(`${LOG_PREFIX} Entering onSelect()`);
        this.log.debug(`${LOG_PREFIX} Selected Organisation = ${JSON.stringify(organisation)}`);

        // Broadcast the selected Organisation
        this.log.trace(`${LOG_PREFIX} Broadcasting the selected Organisation`);
        this.select.emit(organisation);
    }


    /** 
    * Handles Organisations Checkboxes Check Events
    * @param organisation The Checked Organisation
    */
    onCheck(organisation: Organisation) {

        this.log.trace(`${LOG_PREFIX} Entering onCheck()`);
        this.log.debug(`${LOG_PREFIX} Checked Organisation = ${JSON.stringify(organisation)}`);

        // Broadcast the checked Organisation
        this.log.trace(`${LOG_PREFIX} Broadcasting the checked Organisation`);
        this.check.emit(organisation);
    }


    /** 
    * Handles Organisations Checkboxes Uncheck Events
    * @param organisation The Unchecked Organisation
    */
    onUncheck(organisation: Organisation) {

        this.log.trace(`${LOG_PREFIX} Entering onUncheck()`);
        this.log.debug(`${LOG_PREFIX} Unchecked Organisation = ${JSON.stringify(organisation)}`);

        // Broadcast the unchecked Organisation
        this.log.trace(`${LOG_PREFIX} Broadcasting the unchecked Organisation`);
        this.uncheck.emit(organisation);

    }

    /**
     * Checks whether an Organisation record is currently selected
     * @param organisation The target Organisation
     * @returns True or false depending on whether the Organisation is currently selected or not respectively
     */
    isSelected(organisation: Organisation): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isSelected()`);
        this.log.debug(`${LOG_PREFIX} Target Organisation = ${JSON.stringify(organisation)}`);

        // Check whether the Organisation is currently selected
        this.log.trace(`${LOG_PREFIX} Checking whether the Organisation is currently selected`);
        const selected: boolean = this.selected.some(id => id == organisation.id);
        this.log.debug(`${LOG_PREFIX} Selected = ${selected}`);

        return selected;
    }


    /**
     * Checks whether an Organisation record is currently checked
     * @param organisation The target Organisation
     * @returns True or false depending on whether the Organisation is currently checked or not respectively
     */
    isChecked(organisation: Organisation): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isChecked()`);
        this.log.debug(`${LOG_PREFIX} Target Organisation = ${JSON.stringify(organisation)}`);

        // Check whether the Organisation is currently checked
        this.log.trace(`${LOG_PREFIX} Checking whether the Organisation is currently checked`);
        const checked: boolean = this.selected.some(id => id == organisation.id);
        this.log.debug(`${LOG_PREFIX} Checked = ${checked}`);

        return checked;
    }

    /**
     * Checks whether an Organisation record is desired
     * @param organisation The target Organisation
     * @returns True or false depending on whether the Organisation is desired or not respectively
     */
    isDesired(organisation: Organisation): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isDesired()`);
        this.log.debug(`${LOG_PREFIX} Target Organisation = ${JSON.stringify(organisation)}`);

        // Check whether the Organisation is currently desired
        this.log.trace(`${LOG_PREFIX} Checking whether the Organisation is currently desired`);
        const desired: boolean = this.desired.some(id => id == organisation.id);
        this.log.debug(`${LOG_PREFIX} Desired = ${desired}`);

        return desired;
    }

    /**
     * Checks whether an Organisation record is undesired
     * @param organisation The target Organisation
     * @returns True or false depending on whether the Organisation is undesired or not respectively
     */
    isUndesired(organisation: Organisation): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isUndesired()`);
        this.log.debug(`${LOG_PREFIX} Target Organisation = ${JSON.stringify(organisation)}`);

        // Check whether the Organisation is currently undesired
        this.log.trace(`${LOG_PREFIX} Checking whether the Organisation is currently undesired`);
        const undesired: boolean = this.undesired.some(id => id == organisation.id);
        this.log.debug(`${LOG_PREFIX} Undesired = ${undesired}`);

        return undesired;
    }



}
