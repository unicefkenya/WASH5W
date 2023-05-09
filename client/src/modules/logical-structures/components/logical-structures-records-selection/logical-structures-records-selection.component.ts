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
import { LogicalStructuresDataService} from '@modules/logical-structures/services/logical-structures-data.service';
import { FormControl, FormGroup } from '@angular/forms';
import { LogicalSchemesDataService } from '@modules/logical-schemes/services/logical-schemes-data.service';
import { FilterService } from '@app/app-filter.service';
import { LogicalStructure, LogicalStructureState } from '@modules/logical-structures/models';
import { LogicalElementsTypesDataService } from '@modules/logical-elements-types/services/logical-elements-types-data.service';
import { LogicalElementType } from '@modules/logical-elements-types/models/logical-element-type.model';
import { LogicalScheme } from '@modules/logical-schemes/models/logical-scheme.model';

const LOG_PREFIX: string = "[Logical Structures Records Selection Component]";

@Component({
    selector: 'sb-logical-structures-records-selection',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './logical-structures-records-selection.component.html',
    styleUrls: ['logical-structures-records-selection.component.scss'],
})
export class LogicalStructuresRecordsSelectionComponent implements OnInit, OnDestroy, AfterViewInit {

    // Allows the parent component to inject the desired selection mode: single or multi
    @Input() public selectionMode: string = "single";

    // Allows the parent component to inject the desired Logical Structure
    @Input() public desired: LogicalStructure[] = [];    

    // Allows the parent component to inject the undesired Logical Structures
    // Ignored if the desired Logical Structures has been specified
    @Input() public undesired: LogicalStructure[] = [];

    // Allows the parent component to inject the previously selected Logical Structures
    @Input() public selected: LogicalStructure[] = [];

    // Broadcasts radio buttons selection events
    @Output() public select: EventEmitter<LogicalStructure> = new EventEmitter<LogicalStructure>();

    // Broadcasts checkboxes check events
    @Output() public check: EventEmitter<LogicalStructure> = new EventEmitter<LogicalStructure>();

    // Broadcasts checkboxes uncheck events
    @Output() public uncheck: EventEmitter<LogicalStructure> = new EventEmitter<LogicalStructure>();     

    // Keeps a local reference to the displayed loading animation component.
    // Makes it possible to trigger the loading animation when a slow background service is invoked.
    private _animation!: LoadingAnimationComponent;

    // Keeps a local reference to the displayed pagination component.
    // Makes it possible to initialise / update the pagination component when the total number of records changes.
    private _pagination!: PaginationComponent;

    // Holds the required records state
    // Makes it possible to supply the filter, sort or search criteria that should be applied to records on retrieval.
    private stateSubject$ = new BehaviorSubject<LogicalStructureState>({
        page: 1,
        pageSize: 20,
        searchTerm: null,
        sortColumn: 'id',
        sortDirection: 'asc',
        hierarchyId: null,
        hierarchyName: null,
        commissionerId: null,
        commissionerName: null,
        responsibleId: null,
        responsibleName: null
    });
    readonly state$ = this.stateSubject$.asObservable();

    // Keeps tabs of whether the component has been successfully initialised
    public initialised: boolean = false;

    // Instantitate a new reactive Form Group
    // This will allow us to define and enforce the validation rules for all the form controls.
    logicalStructuresForm = new FormGroup({
        schemeId: new FormControl<number | null>(null, [
        ]),
    });    

    // Central gathering point for all the component's subscriptions.
    // Makes it efficient to unsubscribe from all subscriptions when the component is destroyed.   
    private _subscriptions: Subscription[] = [];

    constructor(
        private cd: ChangeDetectorRef,
        public logicalElementsTypesDataService: LogicalElementsTypesDataService,
        public logicalSchemesDataService: LogicalSchemesDataService,
        public logicalStructuresDataService: LogicalStructuresDataService,
        private filterService: FilterService,
        private log: NGXLogger) {

    }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

        // Retrieve and cache Logical Structures Types locally
        this.initialiseLogicalSchemes(() => {

            // Set the default active Logical Scheme if not set
            this.initialiseActiveLogicalScheme(() => {

                // Retrieve and cache Administrative Units Types locally
                this.initialiseLogicalElementsTypes(() => {

                    // Set the default active Logical Scheme's id as the schemeId in the desired records state
                    this.initialiseDesiredRecordsState(() => {

                        // Preselect the active Logical Scheme in the data tabulation form
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
     * Retrieves and caches Logical Structures Types records
     * @param callback The function to call when done
     */
    private initialiseLogicalSchemes(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseLogicalSchemes()`);

        // Retrieve and cache all the Logical Structures Types records
        this.log.trace(`${LOG_PREFIX} Retrieving and caching all the Logical Structures Types records`);
        this.logicalSchemesDataService
            .getLogicalSchemes(true, {
                searchTerm: null,
                page: null,
                pageSize: null,
                sortColumn: 'name',
                sortDirection: 'asc',
                name: null
            })
            .pipe(first()) // This will automatically complete (and therefore unsubscribe) after the first value has been emitted.
            .subscribe({
                next: (logicalSchemes: LogicalScheme[]) => {

                    // Logical Structures Types successfully retrieved and cached
                    this.log.debug(`${LOG_PREFIX} ${logicalSchemes.length} Logical Structures Types(s) retrieved and cached`);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                },

                error: (err: any) => {

                    // Logical Structures Types retrieval failed
                    this.log.error(`${LOG_PREFIX} Logical Structures Types retrieval failed`);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                }
            });

    }



    /**
     * Sets the active Logical Scheme if it has not been set in the global filter
     * @param callback The function to call when done
     */
    private initialiseActiveLogicalScheme(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseActiveLogicalScheme()`);

        // Check if the active Logical Scheme has been set in the global filter
        this.log.trace(`${LOG_PREFIX} Checking if the active Logical Scheme has been set in the global filter`);
        if (this.filterService.filter.activeLogicalScheme) {

            // The active Logical Scheme has been set in the global filter
            this.log.trace(`${LOG_PREFIX} The active Logical Scheme has been set in the global filter`);

            // Check if the active Logical Scheme record exists in the cache
            this.log.trace(`${LOG_PREFIX} Checking if the active Logical Scheme record exists in the cache`);
            if (this.logicalSchemesDataService.records.some(a => a.id == this.filterService.filter.activeLogicalScheme?.id)) {

                // The active Logical Scheme record exists in the cache
                this.log.trace(`${LOG_PREFIX} The active Logical Scheme record exists in the cache`);

                // Initialisation is valid
                this.log.trace(`${LOG_PREFIX} Initialisation is valid`);

            } else {

                // Initialisation is invalid
                this.log.trace(`${LOG_PREFIX} Initialisation is invalid`);

                // Get the first Logical Scheme record
                this.log.trace(`${LOG_PREFIX} Get the first Logical Scheme record`);
                const logicalScheme: LogicalScheme | null = this.logicalSchemesDataService.records.length > 0 ? this.logicalSchemesDataService.records[0] : null;
                this.log.trace(`${LOG_PREFIX} First Logical Scheme record = ${JSON.stringify(logicalScheme)}`);

                // Update the global filter
                this.log.trace(`${LOG_PREFIX} Updating the global filter`);
                this.filterService.update({ activeLogicalScheme: logicalScheme });

            }

            // Return
            this.log.trace(`${LOG_PREFIX} Returning`);
            callback();

        } else {

            // The active Logical Scheme has not been set in the global filter
            this.log.trace(`${LOG_PREFIX} The active Logical Scheme has not been set in the global filter`);

            // Get the first Logical Scheme record
            this.log.trace(`${LOG_PREFIX} Get the first Logical Scheme record`);
            const logicalScheme: LogicalScheme | null = this.logicalSchemesDataService.records.length > 0 ? this.logicalSchemesDataService.records[0] : null;
            this.log.trace(`${LOG_PREFIX} First Logical Scheme record = ${JSON.stringify(logicalScheme)}`);

            // Update the global filter
            this.log.trace(`${LOG_PREFIX} Updating the global filter`);
            this.filterService.update({ activeLogicalScheme: logicalScheme });

            // Return
            this.log.trace(`${LOG_PREFIX} Returning`);
            callback();

        }
    }

    /**
     * Retrieves and caches Administrative Units Types records
     * @param callback The function to call when done
     */
     private initialiseLogicalElementsTypes(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseLogicalElementsTypes()`);

        // Retrieve and cache all the Administrative Units Types records
        this.log.trace(`${LOG_PREFIX} Retrieving and caching all the Administrative Units Types records`);
        this.logicalElementsTypesDataService
            .getLogicalElementsTypes(true, {
                searchTerm: null,
                page: null,
                pageSize: null,
                sortColumn: 'name',
                sortDirection: 'asc',
                name: null,
                plural: null
            })
            .pipe(first()) // This will automatically complete (and therefore unsubscribe) after the first value has been emitted.
            .subscribe({
                next: (logicalElementsTypes: LogicalElementType[]) => {

                    // Administrative Units Types successfully retrieved and cached
                    this.log.debug(`${LOG_PREFIX} ${logicalElementsTypes.length} Administrative Units Types(s) retrieved and cached`);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                },

                error: (err: any) => {

                    // Administrative Units Types retrieval failed
                    this.log.error(`${LOG_PREFIX} Administrative Units Types retrieval failed`);

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

        this.log.trace(`${LOG_PREFIX} Get the Active Logical Scheme`);
        const activeLogicalScheme: LogicalScheme | null | undefined = this.filterService.filter.activeLogicalScheme;
        this.log.debug(`${LOG_PREFIX} Active Logical Scheme = ${JSON.stringify(activeLogicalScheme)}`);

        // Make a copy of the desired records state
        this.log.trace(`${LOG_PREFIX} Making a copy of the desired records state`);
        let copy: LogicalStructureState = Object.assign({}, this.stateSubject$.value);

        // Set the active Logical Scheme as the desired Logical Scheme
        this.log.trace(`${LOG_PREFIX} Setting the active Logical Scheme as the desired Logical Scheme`);
        copy.hierarchyId = activeLogicalScheme?.id;

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

        this.log.trace(`${LOG_PREFIX} Get the Active Logical Scheme`);
        const activeLogicalScheme: LogicalScheme | null | undefined = this.filterService.filter.activeLogicalScheme;
        this.log.debug(`${LOG_PREFIX} Active Logical Scheme = ${JSON.stringify(activeLogicalScheme)}`);

        // Select the active Logical Scheme
        this.log.trace(`${LOG_PREFIX} Selecting the active Logical Scheme`);
        this.logicalStructuresForm.get('schemeId')?.setValue((activeLogicalScheme && activeLogicalScheme.id) ? activeLogicalScheme.id : null);


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

                        // Retrieve the Logical Structures records corresponding to the passed in state
                        this.log.trace(`${LOG_PREFIX} Retrieving the Logical Structures records corresponding to the passed in state`);
                        this.logicalStructuresDataService
                            .getLogicalStructures(true, state)
                            .pipe(first())
                            .subscribe({
                                next: (s: LogicalStructure[]) => {

                                    // Logical Structures records retrieved
                                    this.log.trace(`${LOG_PREFIX} Logical Structures records retrieved`);
                                    this.log.debug(`${LOG_PREFIX} Logical Structures records = ${JSON.stringify(s)}`);

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
            this.logicalStructuresDataService.loading$
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
            this.logicalStructuresDataService.totalRecords$.subscribe(
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
     * Handles Logical Scheme change events
     */
    public onLogicalSchemeChange(): void {

        this.log.trace(`${LOG_PREFIX} Entering onLogicalSchemeChange()`);


        // Get the selected Logical Scheme Id
        this.log.trace(`${LOG_PREFIX} Getting the selected Logical Scheme Id`);
        const schemeId: number | null | undefined = this.logicalStructuresForm.get('schemeId')?.value
        this.log.debug(`${LOG_PREFIX} Logical Scheme Id = ${schemeId}`);

        // Check if the specified Logical Scheme is different from the current Logical Scheme
        this.log.trace(`${LOG_PREFIX} Check if the specified Logical Scheme is different from the current Logical Scheme`);

        if (schemeId != this.stateSubject$.value.hierarchyId) {

            // The specified Logical Scheme is different from the current Logical Scheme
            this.log.trace(`${LOG_PREFIX} The specified Logical Scheme is different from the current Logical Scheme`);

            // Make a copy of the desired records state
            this.log.trace(`${LOG_PREFIX} Making a copy of the desired records state`);
            let copy: LogicalStructureState = Object.assign({}, this.stateSubject$.value);

            // Update the copy of the desired records state
            this.log.trace(`${LOG_PREFIX} Updating the copy of the desired records state`);
            Object.assign(copy, { hierarchyId: schemeId, page: 1 });

            // Broadcast the newly desired record state
            this.log.trace(`${LOG_PREFIX} Broadcasting the newly desired record state`);
            this.stateSubject$.next(copy);

        } else {

            // The specified Logical Scheme is not different from the current Logical Scheme
            this.log.trace(`${LOG_PREFIX} The specified Logical Scheme is not different from the current Logical Scheme`);

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
            let copy: LogicalStructureState = Object.assign({}, this.stateSubject$.value);

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
            let copy: LogicalStructureState = Object.assign({}, this.stateSubject$.value);

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
            let copy: LogicalStructureState = Object.assign({}, this.stateSubject$.value);

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
    * Handles Logical Structure Selection Events
    * @param logicalStructure The Selected Logical Structure
    */
     onSelect(logicalStructure: LogicalStructure) {

        this.log.trace(`${LOG_PREFIX} Entering onSelect()`);
        this.log.debug(`${LOG_PREFIX} Selected Logical Structure = ${JSON.stringify(logicalStructure)}`);

        // Broadcast the selected Logical Structure
        this.log.trace(`${LOG_PREFIX} Broadcasting the selected Logical Structure`);
        this.select.emit(logicalStructure);
    }


    /** 
    * Handles Logical Structures Checkboxes Check Events
    * @param logicalStructure The Checked Logical Structure
    */
    onCheck(logicalStructure: LogicalStructure) {

        this.log.trace(`${LOG_PREFIX} Entering onCheck()`);
        this.log.debug(`${LOG_PREFIX} Checked Logical Structure = ${JSON.stringify(logicalStructure)}`);

        // Broadcast the checked Logical Structure
        this.log.trace(`${LOG_PREFIX} Broadcasting the checked Logical Structure`);
        this.check.emit(logicalStructure);
    }


    /** 
    * Handles Logical Structures Checkboxes Uncheck Events
    * @param logicalStructure The Unchecked Logical Structure
    */
    onUncheck(logicalStructure: LogicalStructure) {

        this.log.trace(`${LOG_PREFIX} Entering onUncheck()`);
        this.log.debug(`${LOG_PREFIX} Unchecked Logical Structure = ${JSON.stringify(logicalStructure)}`);

        // Broadcast the unchecked Logical Structure
        this.log.trace(`${LOG_PREFIX} Broadcasting the unchecked Logical Structure`);
        this.uncheck.emit(logicalStructure);

    }

    /**
     * Checks whether a Logical Structure record is currently selected
     * @param logicalStructure The target Logical Structure
     * @returns True or false depending on whether the Logical Structure is currently selected or not respectively
     */
    isSelected(logicalStructure: LogicalStructure): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isSelected()`);
        this.log.debug(`${LOG_PREFIX} Target Logical Structure = ${JSON.stringify(logicalStructure)}`);

        // Check whether the Logical Structure is currently selected
        this.log.trace(`${LOG_PREFIX} Checking whether the Logical Structure is currently selected`);
        const selected: boolean = this.selected.some(a => a.id == logicalStructure.id);
        this.log.debug(`${LOG_PREFIX} Selected = ${selected}`);

        return selected;
    }


    /**
     * Checks whether a Logical Structure record is currently checked
     * @param logicalStructure The target Logical Structure
     * @returns True or false depending on whether the Logical Structure is currently checked or not respectively
     */    
    isChecked(logicalStructure: LogicalStructure): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isChecked()`);
        this.log.debug(`${LOG_PREFIX} Target Logical Structure = ${JSON.stringify(logicalStructure)}`);

        // Check whether the Logical Structure is currently checked
        this.log.trace(`${LOG_PREFIX} Checking whether the Logical Structure is currently checked`);
        const checked: boolean = this.selected.some(a => a.id == logicalStructure.id);
        this.log.debug(`${LOG_PREFIX} Checked = ${checked}`);

        return checked;
    }

    /**
     * Checks whether a Logical Structure record is desired
     * @param logicalStructure The target Logical Structure
     * @returns True or false depending on whether the Logical Structure is desired or not respectively
     */
     isDesired(logicalStructure: LogicalStructure): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isDesired()`);
        this.log.debug(`${LOG_PREFIX} Target Logical Structure = ${JSON.stringify(logicalStructure)}`);

        // Check whether the Logical Structure is currently desired
        this.log.trace(`${LOG_PREFIX} Checking whether the Logical Structure is currently desired`);
        const desired: boolean = this.desired.some(a => a.id == logicalStructure.id);
        this.log.debug(`${LOG_PREFIX} Desired = ${desired}`);

        return desired;
    }    

    /**
     * Checks whether a Logical Structure record is undesired
     * @param logicalStructure The target Logical Structure
     * @returns True or false depending on whether the Logical Structure is undesired or not respectively
     */
     isUndesired(logicalStructure: LogicalStructure): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isUndesired()`);
        this.log.debug(`${LOG_PREFIX} Target Logical Structure = ${JSON.stringify(logicalStructure)}`);

        // Check whether the Logical Structure is currently undesired
        this.log.trace(`${LOG_PREFIX} Checking whether the Logical Structure is currently undesired`);
        const undesired: boolean = this.undesired.some(a => a.id == logicalStructure.id);
        this.log.debug(`${LOG_PREFIX} Undesired = ${undesired}`);

        return undesired;
    }    


    
}
