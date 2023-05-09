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
import { SystemsModulesPermissionsDataService } from '@modules/systems-modules-permissions/services/systems-modules-permissions-data.service';
import { FormControl, FormGroup } from '@angular/forms';
import { SystemsModulesDataService } from '@modules/systems-modules/services/systems-modules-data.service';
import { FilterService } from '@app/app-filter.service';
import { SystemModulePermission, SystemModulePermissionState } from '@modules/systems-modules-permissions/models';
import { SystemModule } from '@modules/systems-modules/models/system-module.model';

const LOG_PREFIX: string = "[Systems Modules Permissions Records Selection Component]";

@Component({
    selector: 'sb-systems-modules-permissions-records-selection',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './systems-modules-permissions-records-selection.component.html',
    styleUrls: ['systems-modules-permissions-records-selection.component.scss'],
})
export class SystemsModulesPermissionsRecordsSelectionComponent implements OnInit, OnDestroy, AfterViewInit {

    // Allows the parent component to inject the desired selection mode: single or multi
    @Input() public selectionMode: string = "single";

    // Allows the parent component to inject the desired System Modules
    @Input() public desiredTypes!: number[];

    // Allows the parent component to inject the desired System Module Permission
    @Input() public desired: number[] = [];

    // Allows the parent component to inject the undesired Systems Modules Permissions
    // Ignored if the desired Systems Modules Permissions has been specified
    @Input() public undesired: number[] = [];

    // Allows the parent component to inject the previously selected Systems Modules Permissions
    @Input() public selected: number[] = [];

    // Broadcasts radio buttons selection events
    @Output() public select: EventEmitter<SystemModulePermission> = new EventEmitter<SystemModulePermission>();

    // Broadcasts checkboxes check events
    @Output() public check: EventEmitter<SystemModulePermission> = new EventEmitter<SystemModulePermission>();

    // Broadcasts checkboxes uncheck events
    @Output() public uncheck: EventEmitter<SystemModulePermission> = new EventEmitter<SystemModulePermission>();

    // Keeps a local reference to the displayed loading animation component.
    // Makes it possible to trigger the loading animation when a slow background service is invoked.
    private _animation!: LoadingAnimationComponent;

    // Keeps a local reference to the displayed pagination component.
    // Makes it possible to initialise / update the pagination component when the total number of records changes.
    private _pagination!: PaginationComponent;

    // Holds the component's initialisation status.
    // Makes it possible to display the most appropriate content based on whether the initialisation was a success or not.
    initialised: boolean | undefined;

    // Keep tabs on whether the permissions are customisable
    customisable: boolean = false;

    // Holds the required records state
    // Makes it possible to supply the filter, sort or search criteria that should be applied to records on retrieval.
    private stateSubject$ = new BehaviorSubject<SystemModulePermissionState>({
        page: 1,
        pageSize: 5,
        searchTerm: '',
        sortColumn: 'name',
        sortDirection: 'asc',
        systemModuleId: null,
        name: null,
        code: null
    });
    readonly state$ = this.stateSubject$.asObservable();

    // Keeps tabs on the records skipped due to pagination
    paginationOffset: number = 0;

    // Central gathering point for all the component's subscriptions.
    // Makes it efficient to unsubscribe from all subscriptions when the component is destroyed.   
    private _subscriptions: Subscription[] = [];

    // Instantitate a new reactive Form Group
    // This will allow us to define and enforce the validation rules for all the form controls.
    systemsModulesPermissionsForm = new FormGroup({
        systemModuleId: new FormControl<number | null>(null, [
        ]),
    });

    constructor(
        private cd: ChangeDetectorRef,
        public systemsModulesDataService: SystemsModulesDataService,
        public systemsModulesPermissionsDataService: SystemsModulesPermissionsDataService,
        private filterService: FilterService,
        private log: NGXLogger) {

    }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

        // Retrieve and cache System Modules locally
        this.initialiseSystemModules(() => {

            // Set the default active System Module if not set
            this.initialiseActiveSystemModule(() => {

                // Set the default active System Module's id as the systemModuleId in the desired records state
                this.initialiseDesiredRecordsState(() => {

                    // Preselect the active System Module in the data tabulation form
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


                });
            });
        }
    }


    /**
     * Retrieves and caches System Modules records
     * @param callback The function to call when done
     */
    private initialiseSystemModules(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseSystemModules()`);

        // Retrieve and cache all the System Modules records
        this.log.trace(`${LOG_PREFIX} Retrieving and caching all the System Modules records`);
        this.systemsModulesDataService
            .getSystemsModules(true, {
                searchTerm: null,
                page: null,
                pageSize: null,
                sortColumn: 'name',
                sortDirection: 'asc',
                ids: null,
                name: null,
                enabled: null,
                customisable: null
            })
            .pipe(first()) // This will automatically complete (and therefore unsubscribe) after the first value has been emitted.
            .subscribe({
                next: (systemModules: SystemModule[]) => {

                    // System Modules successfully retrieved and cached
                    this.log.debug(`${LOG_PREFIX} ${systemModules.length} System Module(s) retrieved and cached`);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                },

                error: (err: any) => {

                    // System Modules retrieval failed
                    this.log.error(`${LOG_PREFIX} System Modules retrieval failed`);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                }
            });

    }


    /**
     * Sets the active System Module if it has not been set in the global filter
     * @param callback The function to call when done
     */
    private initialiseActiveSystemModule(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseActiveSystemModule()`);

        // Check if the active System Module has been set in the global filter
        this.log.trace(`${LOG_PREFIX} Checking if the active System Module has been set in the global filter`);
        if (this.filterService.filter.activeSystemModule) {

            // The active System Module has been set in the global filter
            this.log.trace(`${LOG_PREFIX} The active System Module has been set in the global filter`);

            // Check if the active System Module record exists in the cache
            this.log.trace(`${LOG_PREFIX} Checking if the active System Module record exists in the cache`);
            if (this.systemsModulesDataService.records.some(a => a.id == this.filterService.filter.activeSystemModule?.id)) {

                // The active System Module record exists in the cache
                this.log.trace(`${LOG_PREFIX} The active System Module record exists in the cache`);

                // Initialisation is valid
                this.log.trace(`${LOG_PREFIX} Initialisation is valid`);

            } else {

                // Initialisation is invalid
                this.log.trace(`${LOG_PREFIX} Initialisation is invalid`);

                // Get the first System Module record
                this.log.trace(`${LOG_PREFIX} Get the first System Module record`);
                const systemModule: SystemModule | null = this.systemsModulesDataService.records.length > 0 ? this.systemsModulesDataService.records[0] : null;
                this.log.trace(`${LOG_PREFIX} First System Module record = ${JSON.stringify(systemModule)}`);

                // Update the global filter
                this.log.trace(`${LOG_PREFIX} Updating the global filter`);
                this.filterService.update({ activeSystemModule: systemModule });

                // Update the system module's customisability status
                this.log.trace(`${LOG_PREFIX} Updating the system module's customisability status`);
                this.customisable = systemModule?.data.customisable ? systemModule?.data.customisable : false;

            }

            // Return
            this.log.trace(`${LOG_PREFIX} Returning`);
            callback();

        } else {

            // The active System Module has not been set in the global filter
            this.log.trace(`${LOG_PREFIX} The active System Module has not been set in the global filter`);

            // Get the first System Module record
            this.log.trace(`${LOG_PREFIX} Get the first System Module record`);
            const systemModule: SystemModule | null = this.systemsModulesDataService.records.length > 0 ? this.systemsModulesDataService.records[0] : null;
            this.log.trace(`${LOG_PREFIX} First System Module record = ${JSON.stringify(systemModule)}`);

            // Update the global filter
            this.log.trace(`${LOG_PREFIX} Updating the global filter`);
            this.filterService.update({ activeSystemModule: systemModule });

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

        this.log.trace(`${LOG_PREFIX} Get the Active System Module`);
        const activeSystemModule: SystemModule | null | undefined = this.filterService.filter.activeSystemModule;
        this.log.debug(`${LOG_PREFIX} Active System Module = ${JSON.stringify(activeSystemModule)}`);

        // Make a copy of the desired records state
        this.log.trace(`${LOG_PREFIX} Making a copy of the desired records state`);
        let copy: SystemModulePermissionState = Object.assign({}, this.stateSubject$.value);

        // Set the active System Module as the desired System Module
        this.log.trace(`${LOG_PREFIX} Setting the active System Module as the desired System Module`);
        Object.assign(copy, { systemModuleId: activeSystemModule?.id });

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

        this.log.trace(`${LOG_PREFIX} Get the Active System Module`);
        const activeSystemModule: SystemModule | null | undefined = this.filterService.filter.activeSystemModule;
        this.log.debug(`${LOG_PREFIX} Active System Module = ${JSON.stringify(activeSystemModule)}`);

        // Select the active System Module
        this.log.trace(`${LOG_PREFIX} Selecting the active System Module`);
        this.systemsModulesPermissionsForm.get('systemModuleId')?.setValue((activeSystemModule && activeSystemModule.id) ? activeSystemModule.id : null);


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

                        // Retrieve the System Module Permissions records corresponding to the passed in state
                        this.log.trace(`${LOG_PREFIX} Retrieving the System Module Permissions records corresponding to the passed in state`);
                        this.systemsModulesPermissionsDataService
                            .getSystemsModulesPermissions(true, state)
                            .pipe(first())
                            .subscribe({
                                next: (s: SystemModulePermission[]) => {

                                    // System Module Permissions records retrieved
                                    this.log.trace(`${LOG_PREFIX} System Module Permissions records retrieved`);
                                    this.log.debug(`${LOG_PREFIX} System Module Permissions records = ${JSON.stringify(s)}`);

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
            this.systemsModulesDataService.loading$
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
            this.systemsModulesDataService.totalRecords$.subscribe(
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

    public isCustomisable(): boolean {
        return this.filterService.filter.activeSystemModule?.data.customisable ? true : false
    }

    /**
     * Handles System Module change events
     */
    public onSystemModuleChange(): void {

        this.log.trace(`${LOG_PREFIX} Entering onSystemModuleChange()`);


        // Get the selected system module id
        this.log.trace(`${LOG_PREFIX} Getting the selected System Module Id`);
        const systemModuleId: number | null | undefined = this.systemsModulesPermissionsForm.get('systemModuleId')?.value
        this.log.debug(`${LOG_PREFIX} System Module Id = ${systemModuleId}`);

        // Check if the specified system module is different from the current system module
        this.log.trace(`${LOG_PREFIX} Check if the specified system module is different from the current system module`);

        if (systemModuleId != this.stateSubject$.value.systemModuleId) {

            // The specified system module is different from the current system module
            this.log.trace(`${LOG_PREFIX} The specified system module is different from the current system module`);

            // Get the first System Module record
            this.log.trace(`${LOG_PREFIX} Get the first System Module record`);
            const systemModule: SystemModule | null | undefined = this.systemsModulesDataService.records.find(s => s.id == systemModuleId);
            this.log.trace(`${LOG_PREFIX} First System Module record = ${JSON.stringify(systemModule)}`);

            // Update the global filter
            this.log.trace(`${LOG_PREFIX} Updating the global filter`);
            this.filterService.update({ activeSystemModule: systemModule });

            // Update the system module's customisability status
            this.log.trace(`${LOG_PREFIX} Updating the system module's customisability status`);
            this.customisable = systemModule?.data.customisable ? systemModule?.data.customisable : false;

            // Make a copy of the desired records state
            this.log.trace(`${LOG_PREFIX} Making a copy of the desired records state`);
            let copy: SystemModulePermissionState = Object.assign({}, this.stateSubject$.value);

            // Update the copy of the desired records state
            this.log.trace(`${LOG_PREFIX} Updating the copy of the desired records state`);
            Object.assign(copy, { systemModuleId: systemModuleId });

            // Broadcast the newly desired record state
            this.log.trace(`${LOG_PREFIX} Broadcasting the newly desired record state`);
            this.stateSubject$.next(copy);

        } else {

            // The specified system module is not different from the current system module
            this.log.trace(`${LOG_PREFIX} The specified system module is not different from the current system module`);

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
            let copy: SystemModulePermissionState = Object.assign({}, this.stateSubject$.value);

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
            let copy: SystemModulePermissionState = Object.assign({}, this.stateSubject$.value);

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
            let copy: SystemModulePermissionState = Object.assign({}, this.stateSubject$.value);

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
    * Handles System Module Permission Selection Events
    * @param systemModulePermission The Selected System Module Permission
    */
    onSelect(systemModulePermission: SystemModulePermission) {

        this.log.trace(`${LOG_PREFIX} Entering onSelect()`);
        this.log.debug(`${LOG_PREFIX} Selected System Module Permission = ${JSON.stringify(systemModulePermission)}`);

        // Broadcast the selected System Module Permission
        this.log.trace(`${LOG_PREFIX} Broadcasting the selected System Module Permission`);
        this.select.emit(systemModulePermission);
    }


    /** 
    * Handles Systems Modules Permissions Checkboxes Check Events
    * @param systemModulePermission The Checked System Module Permission
    */
    onCheck(systemModulePermission: SystemModulePermission) {

        this.log.trace(`${LOG_PREFIX} Entering onCheck()`);
        this.log.debug(`${LOG_PREFIX} Checked System Module Permission = ${JSON.stringify(systemModulePermission)}`);

        // Broadcast the checked System Module Permission
        this.log.trace(`${LOG_PREFIX} Broadcasting the checked System Module Permission`);
        this.check.emit(systemModulePermission);
    }


    /** 
    * Handles Systems Modules Permissions Checkboxes Uncheck Events
    * @param systemModulePermission The Unchecked System Module Permission
    */
    onUncheck(systemModulePermission: SystemModulePermission) {

        this.log.trace(`${LOG_PREFIX} Entering onUncheck()`);
        this.log.debug(`${LOG_PREFIX} Unchecked System Module Permission = ${JSON.stringify(systemModulePermission)}`);

        // Broadcast the unchecked System Module Permission
        this.log.trace(`${LOG_PREFIX} Broadcasting the unchecked System Module Permission`);
        this.uncheck.emit(systemModulePermission);

    }

    /**
     * Checks whether an System Module Permission record is currently selected
     * @param systemModulePermission The target System Module Permission
     * @returns True or false depending on whether the System Module Permission is currently selected or not respectively
     */
    isSelected(systemModulePermission: SystemModulePermission): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isSelected()`);
        this.log.debug(`${LOG_PREFIX} Target System Module Permission = ${JSON.stringify(systemModulePermission)}`);

        // Check whether the System Module Permission is currently selected
        this.log.trace(`${LOG_PREFIX} Checking whether the System Module Permission is currently selected`);
        const selected: boolean = this.selected.some(id => id == systemModulePermission.id);
        this.log.debug(`${LOG_PREFIX} Selected = ${selected}`);

        return selected;
    }


    /**
     * Checks whether an System Module Permission record is currently checked
     * @param systemModulePermission The target System Module Permission
     * @returns True or false depending on whether the System Module Permission is currently checked or not respectively
     */
    isChecked(systemModulePermission: SystemModulePermission): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isChecked()`);
        this.log.debug(`${LOG_PREFIX} Target System Module Permission = ${JSON.stringify(systemModulePermission)}`);

        // Check whether the System Module Permission is currently checked
        this.log.trace(`${LOG_PREFIX} Checking whether the System Module Permission is currently checked`);
        const checked: boolean = this.selected.some(id => id == systemModulePermission.id);
        this.log.debug(`${LOG_PREFIX} Checked = ${checked}`);

        return checked;
    }

    /**
     * Checks whether an System Module Permission record is desired
     * @param systemModulePermission The target System Module Permission
     * @returns True or false depending on whether the System Module Permission is desired or not respectively
     */
    isDesired(systemModulePermission: SystemModulePermission): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isDesired()`);
        this.log.debug(`${LOG_PREFIX} Target System Module Permission = ${JSON.stringify(systemModulePermission)}`);

        // Check whether the System Module Permission is currently desired
        this.log.trace(`${LOG_PREFIX} Checking whether the System Module Permission is currently desired`);
        const desired: boolean = this.desired.some(id => id == systemModulePermission.id);
        this.log.debug(`${LOG_PREFIX} Desired = ${desired}`);

        return desired;
    }

    /**
     * Checks whether an System Module Permission record is undesired
     * @param systemModulePermission The target System Module Permission
     * @returns True or false depending on whether the System Module Permission is undesired or not respectively
     */
    isUndesired(systemModulePermission: SystemModulePermission): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isUndesired()`);
        this.log.debug(`${LOG_PREFIX} Target System Module Permission = ${JSON.stringify(systemModulePermission)}`);

        // Check whether the System Module Permission is currently undesired
        this.log.trace(`${LOG_PREFIX} Checking whether the System Module Permission is currently undesired`);
        const undesired: boolean = this.undesired.some(id => id == systemModulePermission.id);
        this.log.debug(`${LOG_PREFIX} Undesired = ${undesired}`);

        return undesired;
    }



}
