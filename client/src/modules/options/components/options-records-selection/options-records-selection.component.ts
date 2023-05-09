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
import { OptionsDataService } from '@modules/options/services/options-data.service';
import { FormControl, FormGroup } from '@angular/forms';
import { OptionsTypesDataService } from '@modules/options-types/services/options-types-data.service';
import { FilterService } from '@app/app-filter.service';
import { Option, OptionState } from '@modules/options/models';
import { OptionType } from '@modules/options-types/models/option-type.model';

const LOG_PREFIX: string = "[Options Records Selection Component]";

@Component({
    selector: 'sb-options-records-selection',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './options-records-selection.component.html',
    styleUrls: ['options-records-selection.component.scss'],
})
export class OptionsRecordsSelectionComponent implements OnInit, OnDestroy, AfterViewInit {

    // Allows the parent component to inject the desired selection mode: single or multi
    @Input() public selectionMode: string = "single";

    // Allows the parent component to inject the desired Option Type
    @Input() public desiredType!: number;

    // Allows the parent component to inject the desired Option
    @Input() public desired: number[] = [];

    // Allows the parent component to inject the undesired Options
    // Ignored if the desired Options has been specified
    @Input() public undesired: number[] = [];

    // Allows the parent component to inject the previously selected Options
    @Input() public selected: number[] = [];

    // Broadcasts radio buttons selection events
    @Output() public select: EventEmitter<Option> = new EventEmitter<Option>();

    // Broadcasts checkboxes check events
    @Output() public check: EventEmitter<Option> = new EventEmitter<Option>();

    // Broadcasts checkboxes uncheck events
    @Output() public uncheck: EventEmitter<Option> = new EventEmitter<Option>();

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
    private stateSubject$ = new BehaviorSubject<OptionState>({
        page: 1,
        pageSize: 5,
        searchTerm: null,
        sortColumn: 'name',
        sortDirection: 'asc',
        ids: null,
        typeId: null,
        name: null
    });
    readonly state$ = this.stateSubject$.asObservable();

    // Central gathering point for all the component's subscriptions.
    // Makes it efficient to unsubscribe from all subscriptions when the component is destroyed.   
    private _subscriptions: Subscription[] = [];

    // Instantitate a new reactive Form Group
    // This will allow us to define and enforce the validation rules for all the form controls.
    optionsForm = new FormGroup({
        typeId: new FormControl<number | null>(null, [
        ]),
    });

    constructor(
        private cd: ChangeDetectorRef,
        public optionsTypesDataService: OptionsTypesDataService,
        public optionsDataService: OptionsDataService,
        private filterService: FilterService,
        private log: NGXLogger) {

    }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

        // Retrieve and cache Options Types locally
        this.initialiseOptionsTypes(() => {

            // Set the default active Option Type if not set
            this.initialiseActiveOptionType(() => {

                // Set the default active Option Type's id as the typeId in the desired records state
                this.initialiseDesiredRecordsState(() => {

                    // Preselect the active Option Type in the data tabulation form
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
     * Retrieves and caches Options Types records
     * @param callback The function to call when done
     */
    private initialiseOptionsTypes(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseOptionsTypes()`);

        // Retrieve and cache all the Options Types records
        this.log.trace(`${LOG_PREFIX} Retrieving and caching all the Options Types records`);
        this.optionsTypesDataService
            .getOptionsTypes(true, {
                searchTerm: null,
                page: null,
                pageSize: null,
                sortColumn: 'name',
                sortDirection: 'asc',
                ids: null,
                name: null
            })
            .pipe(first()) // This will automatically complete (and therefore unsubscribe) after the first value has been emitted.
            .subscribe({
                next: (optionsTypes: OptionType[]) => {

                    // Options Types successfully retrieved and cached
                    this.log.debug(`${LOG_PREFIX} ${optionsTypes.length} Options Types(s) retrieved and cached`);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                },

                error: (err: any) => {

                    // Options Types retrieval failed
                    this.log.error(`${LOG_PREFIX} Options Types retrieval failed`);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                }
            });

    }


    /**
     * Sets the active Option Type if it has not been set in the global filter
     * @param callback The function to call when done
     */
    private initialiseActiveOptionType(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseActiveOptionType()`);

        // Check if the active Option Type has been set in the global filter
        this.log.trace(`${LOG_PREFIX} Checking if the active Option Type has been set in the global filter`);
        if (this.filterService.filter.activeOptionType) {

            // The active Option Type has been set in the global filter
            this.log.trace(`${LOG_PREFIX} The active Option Type has been set in the global filter`);

            // Check if the active Option Type record exists in the cache
            this.log.trace(`${LOG_PREFIX} Checking if the active Option Type record exists in the cache`);
            if (this.optionsTypesDataService.records.some(a => a.id == this.filterService.filter.activeOptionType?.id)) {

                // The active Option Type record exists in the cache
                this.log.trace(`${LOG_PREFIX} The active Option Type record exists in the cache`);

                // Initialisation is valid
                this.log.trace(`${LOG_PREFIX} Initialisation is valid`);

            } else {

                // Initialisation is invalid
                this.log.trace(`${LOG_PREFIX} Initialisation is invalid`);

                // Get the first Option Type record
                this.log.trace(`${LOG_PREFIX} Get the first Option Type record`);
                const optionType: OptionType | null = this.optionsTypesDataService.records.length > 0 ? this.optionsTypesDataService.records[0] : null;
                this.log.trace(`${LOG_PREFIX} First Option Type record = ${JSON.stringify(optionType)}`);

                // Update the global filter
                this.log.trace(`${LOG_PREFIX} Updating the global filter`);
                this.filterService.update({ activeOptionType: optionType });

            }

            // Return
            this.log.trace(`${LOG_PREFIX} Returning`);
            callback();

        } else {

            // The active Option Type has not been set in the global filter
            this.log.trace(`${LOG_PREFIX} The active Option Type has not been set in the global filter`);

            // Get the first Option Type record
            this.log.trace(`${LOG_PREFIX} Get the first Option Type record`);
            const optionType: OptionType | null = this.optionsTypesDataService.records.length > 0 ? this.optionsTypesDataService.records[0] : null;
            this.log.trace(`${LOG_PREFIX} First Option Type record = ${JSON.stringify(optionType)}`);

            // Update the global filter
            this.log.trace(`${LOG_PREFIX} Updating the global filter`);
            this.filterService.update({ activeOptionType: optionType });

            // Return
            this.log.trace(`${LOG_PREFIX} Returning`);
            callback();

        }
    }

    /**
     * Presets default values in the data tabulation form
     * @param callback The function to call when done
     */
    private initialiseFormGroup(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseFormGroup()`);

        this.log.trace(`${LOG_PREFIX} Get the Active Option Type`);
        const activeOptionType: OptionType | null | undefined = this.filterService.filter.activeOptionType;
        this.log.debug(`${LOG_PREFIX} Active Option Type = ${JSON.stringify(activeOptionType)}`);

        // Select the active Option Type
        this.log.trace(`${LOG_PREFIX} Selecting the active Option Type`);
        this.optionsForm.get('typeId')?.setValue((activeOptionType && activeOptionType.id) ? activeOptionType.id : null);


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
     * Presets default values in the desired records state bean
     * @param callback The function to call when done
     */




    private initialiseDesiredRecordsState(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseDesiredRecordsState()`);

        // Make a copy of the desired records state
        this.log.trace(`${LOG_PREFIX} Making a copy of the desired records state`);
        let copy: OptionState = Object.assign({}, this.stateSubject$.value);

        // Check if the component has been previously initialised
        this.log.trace(`${LOG_PREFIX} Checking if the component has been previously initialised`);
        if (this.initialised) {

            // The component has been previously initialised
            this.log.trace(`${LOG_PREFIX} The component has been previously initialised`);

            this.log.trace(`${LOG_PREFIX} Get the Active Option Type`);
            const activeOptionType: OptionType | null | undefined = this.filterService.filter.activeOptionType;
            this.log.debug(`${LOG_PREFIX} Active Option Type = ${JSON.stringify(activeOptionType)}`);

            Object.assign(copy, { typeId: activeOptionType && activeOptionType.id ? activeOptionType.id : null });

        } else {

            // The component has not been previously initialised
            this.log.trace(`${LOG_PREFIX} The component has not been previously initialised`);

            // Check if the desired option type has been specified
            this.log.trace(`${LOG_PREFIX} Checking if the desired option type has been specified`);
            if (this.desiredType) {

                // The desired option type has been specified
                this.log.trace(`${LOG_PREFIX} The desired option type has been specified`);
                this.log.debug(`${LOG_PREFIX} Desired Option Type = ${JSON.stringify(this.desiredType)}`);

                // Initialise the option type to the specified option type
                this.log.trace(`${LOG_PREFIX} Initialising the option type to the specified option type`);
                Object.assign(copy, { typeId: this.desiredType });

            } else {

                this.log.trace(`${LOG_PREFIX} Get the Active Option Type`);
                const activeOptionType: OptionType | null | undefined = this.filterService.filter.activeOptionType;
                this.log.debug(`${LOG_PREFIX} Active Option Type = ${JSON.stringify(activeOptionType)}`);

                // Initialise the option type to the default option type
                this.log.trace(`${LOG_PREFIX} Initialising the option type to the default option type`);
                Object.assign(copy, { typeId: activeOptionType && activeOptionType.id ? activeOptionType.id : null });
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

                        // Retrieve the Options records corresponding to the passed in state
                        this.log.trace(`${LOG_PREFIX} Retrieving the Options records corresponding to the passed in state`);
                        this.optionsDataService
                            .getOptions(true, state)
                            .pipe(first())
                            .subscribe({
                                next: (s: Option[]) => {

                                    // Options records retrieved
                                    this.log.trace(`${LOG_PREFIX} Options records retrieved`);
                                    this.log.debug(`${LOG_PREFIX} Options records = ${JSON.stringify(s)}`);

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
            this.optionsDataService.loading$
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
            this.optionsDataService.totalRecords$.subscribe(
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
     * Handles Option Type change events
     */
    public onOptionTypeChange(): void {

        this.log.trace(`${LOG_PREFIX} Entering onOptionTypeChange()`);


        // Get the selected Option Type Id
        this.log.trace(`${LOG_PREFIX} Getting the selected Option Type Id`);
        const typeId: number | null | undefined = this.optionsForm.get('typeId')?.value
        this.log.debug(`${LOG_PREFIX} Option Type Id = ${typeId}`);

        // Check if the specified Option Type is different from the current Option Type
        this.log.trace(`${LOG_PREFIX} Check if the specified Option Type is different from the current Option Type`);

        if (this.stateSubject$.value.typeId != typeId) {

            // The specified Option Type is different from the current Option Type
            this.log.trace(`${LOG_PREFIX} The specified Option Type is different from the current Option Type`);

            // Update the global filter
            this.log.trace(`${LOG_PREFIX} Updating the global filter`);
            this.filterService.update({ activeOptionType: this.optionsTypesDataService.records.find(a => a.id == typeId) });

            // Make a copy of the desired records state
            this.log.trace(`${LOG_PREFIX} Making a copy of the desired records state`);
            let copy: OptionState = Object.assign({}, this.stateSubject$.value);

            // Update the copy of the desired records state
            this.log.trace(`${LOG_PREFIX} Updating the copy of the desired records state`);
            Object.assign(copy, { typeId: typeId, page: 1 });

            // Broadcast the newly desired record state
            this.log.trace(`${LOG_PREFIX} Broadcasting the newly desired record state`);
            this.stateSubject$.next(copy);

        } else {

            // The specified Option Type is not different from the current Option Type
            this.log.trace(`${LOG_PREFIX} The specified Option Type is not different from the current Option Type`);

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
            let copy: OptionState = Object.assign({}, this.stateSubject$.value);

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
            let copy: OptionState = Object.assign({}, this.stateSubject$.value);

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
            let copy: OptionState = Object.assign({}, this.stateSubject$.value);

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
    * Handles Option Selection Events
    * @param option The Selected Option
    */
    onSelect(option: Option) {

        this.log.trace(`${LOG_PREFIX} Entering onSelect()`);
        this.log.debug(`${LOG_PREFIX} Selected Option = ${JSON.stringify(option)}`);

        // Broadcast the selected Option
        this.log.trace(`${LOG_PREFIX} Broadcasting the selected Option`);
        this.select.emit(option);
    }


    /** 
    * Handles Options Checkboxes Check Events
    * @param option The Checked Option
    */
    onCheck(option: Option) {

        this.log.trace(`${LOG_PREFIX} Entering onCheck()`);
        this.log.debug(`${LOG_PREFIX} Checked Option = ${JSON.stringify(option)}`);

        // Broadcast the checked Option
        this.log.trace(`${LOG_PREFIX} Broadcasting the checked Option`);
        this.check.emit(option);
    }


    /** 
    * Handles Options Checkboxes Uncheck Events
    * @param option The Unchecked Option
    */
    onUncheck(option: Option) {

        this.log.trace(`${LOG_PREFIX} Entering onUncheck()`);
        this.log.debug(`${LOG_PREFIX} Unchecked Option = ${JSON.stringify(option)}`);

        // Broadcast the unchecked Option
        this.log.trace(`${LOG_PREFIX} Broadcasting the unchecked Option`);
        this.uncheck.emit(option);

    }

    /**
     * Checks whether an Option record is currently selected
     * @param option The target Option
     * @returns True or false depending on whether the Option is currently selected or not respectively
     */
    isSelected(option: Option): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isSelected()`);
        this.log.debug(`${LOG_PREFIX} Target Option = ${JSON.stringify(option)}`);

        // Check whether the Option is currently selected
        this.log.trace(`${LOG_PREFIX} Checking whether the Option is currently selected`);
        const selected: boolean = this.selected.some(id => id == option.id);
        this.log.debug(`${LOG_PREFIX} Selected = ${selected}`);

        return selected;
    }


    /**
     * Checks whether an Option record is currently checked
     * @param option The target Option
     * @returns True or false depending on whether the Option is currently checked or not respectively
     */
    isChecked(option: Option): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isChecked()`);
        this.log.debug(`${LOG_PREFIX} Target Option = ${JSON.stringify(option)}`);

        // Check whether the Option is currently checked
        this.log.trace(`${LOG_PREFIX} Checking whether the Option is currently checked`);
        const checked: boolean = this.selected.some(id => id == option.id);
        this.log.debug(`${LOG_PREFIX} Checked = ${checked}`);

        return checked;
    }

    /**
     * Checks whether an Option record is desired
     * @param option The target Option
     * @returns True or false depending on whether the Option is desired or not respectively
     */
    isDesired(option: Option): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isDesired()`);
        this.log.debug(`${LOG_PREFIX} Target Option = ${JSON.stringify(option)}`);

        // Check whether the Option is currently desired
        this.log.trace(`${LOG_PREFIX} Checking whether the Option is currently desired`);
        const desired: boolean = this.desired.some(id => id == option.id);
        this.log.debug(`${LOG_PREFIX} Desired = ${desired}`);

        return desired;
    }

    /**
     * Checks whether an Option record is undesired
     * @param option The target Option
     * @returns True or false depending on whether the Option is undesired or not respectively
     */
    isUndesired(option: Option): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isUndesired()`);
        this.log.debug(`${LOG_PREFIX} Target Option = ${JSON.stringify(option)}`);

        // Check whether the Option is currently undesired
        this.log.trace(`${LOG_PREFIX} Checking whether the Option is currently undesired`);
        const undesired: boolean = this.undesired.some(id => id == option.id);
        this.log.debug(`${LOG_PREFIX} Undesired = ${undesired}`);

        return undesired;
    }



}
