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
import { Subscription, BehaviorSubject, first, Observable, of } from 'rxjs';
import { SystemModule } from '@modules/systems-modules/models';
import { SystemModulePermission } from '@modules/systems-modules-permissions/models/system-module-permission.model';
import { SystemsRolesDataService } from '@modules/systems-roles/services/systems-roles-data.service';
import { FilterService } from '@app/app-filter.service';
import { SystemRole } from '@modules/systems-roles/models/system-role.model';
import { FormGroup, FormControl } from '@angular/forms';
import { SystemModuleState } from '@modules/systems-modules/models/system-module-state.model';
import { SystemsModulesDataService } from '@modules/systems-modules/services/systems-modules-data.service';
import { SystemsModulesPermissionsDataService } from '@modules/systems-modules-permissions/services/systems-modules-permissions-data.service';
import { environment } from 'environments/environment';

const LOG_PREFIX: string = "[Systems Roles Permissions Records Tabulation Component]";

@Component({
    selector: 'sb-systems-roles-permissions-records-tabulation',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './systems-roles-permissions-records-tabulation.component.html',
    styleUrls: ['systems-roles-permissions-records-tabulation.component.scss'],
})
export class SystemsRolesPermissionsRecordsTabulationComponent implements OnInit, OnDestroy, AfterViewInit {

    // Keeps a local reference to the displayed loading animation component.
    // Makes it possible to trigger the loading animation when a slow background service is invoked.
    private _animation!: LoadingAnimationComponent;

    // Keeps a local reference to the displayed pagination component.
    // Makes it possible to initialise / update the pagination component when the total number of records changes.
    private _pagination!: PaginationComponent;

    // Keeps tabs on the records skipped due to pagination
    public paginationOffset: number = 0;

    // Holds the required records state
    // Makes it possible to supply the filter, sort or search criteria that should be applied to records on retrieval.
    private stateSubject$ = new BehaviorSubject<SystemModuleState>({
        page: 1,
        pageSize: 20,
        searchTerm: '',
        sortColumn: 'name',
        sortDirection: 'asc',
        ids: null,
        name: null,
        enabled: null,
        customisable: null
    });
    readonly state$ = this.stateSubject$.asObservable();

    // Instantitate a new reactive Form Group
    // This will allow us to define and enforce the validation rules for all the form controls.
    systemsRolesPermissionsForm = new FormGroup({
        systemRoleId: new FormControl<number | null>(null, [
        ]),
    });

    // Keeps tabs of whether the page has been successfully initialised
    public initialised: boolean = false;

    // Central gathering point for all the component's subscriptions.
    // Makes it efficient to unsubscribe from all subscriptions when the component is destroyed.   
    private _subscriptions: Subscription[] = [];

    constructor(
        private cd: ChangeDetectorRef,
        public systemsModulesDataService: SystemsModulesDataService,
        public systemsRolesDataService: SystemsRolesDataService,
        public systemsModulesPermissionsDataService: SystemsModulesPermissionsDataService,
        public filterService: FilterService,
        private log: NGXLogger) {



    }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

        // Retrieve and cache System Roles locally
        this.initialiseSystemRoles(() => {

            // Set the default active System Role if not set
            this.initialiseActiveSystemRole(() => {

                // Retrieve and cache System Modules  Permissions locally
                this.initialiseSystemModulesPermissions(() => {

                    // Retrieve and cache System Modules locally
                    this.initialiseSystemModules(() => {

                        // Preselect the active System Module in the data tabulation form
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
        this.filterService.filter.expandedSystemModulesIds.length = 0;
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
            this.initialiseLoadingStatusChangesHandler(() => { });

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
                this.initialiseTotalRecordCountsChangesHandler(() => { });
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

    /**
     * Retrieves and caches System Roles records
     * @param callback The function to call when done
     */
    private initialiseSystemRoles(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseSystemRoles()`);

        // Retrieve and cache all the System Roles records
        this.log.trace(`${LOG_PREFIX} Retrieving and caching all the System Roles records`);
        this.systemsRolesDataService
            .getSystemsRoles(true, {
                searchTerm: null,
                page: null,
                pageSize: null,
                sortColumn: 'id',
                sortDirection: 'asc',
                ids: null,
                code: null,
                name: null
            })
            .pipe(first()) // This will automatically complete (and therefore unsubscribe) after the first value has been emitted.
            .subscribe({
                next: (systemRoles: SystemRole[]) => {

                    // System Roles successfully retrieved and cached
                    this.log.debug(`${LOG_PREFIX} ${systemRoles.length} System Role(s) retrieved and cached`);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                },

                error: (err: any) => {

                    // System Roles retrieval failed
                    this.log.error(`${LOG_PREFIX} System Roles retrieval failed`);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                }
            });

    }



    /**
     * Sets the active System Role if it has not been set in the global filter
     * @param callback The function to call when done
     */
    private initialiseActiveSystemRole(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseActiveSystemRole()`);

        // Check if the active System Role has been set in the global filter
        this.log.trace(`${LOG_PREFIX} Checking if the active System Role has been set in the global filter`);
        if (this.filterService.filter.activeSystemRole) {

            // The active System Role has been set in the global filter
            this.log.trace(`${LOG_PREFIX} The active System Role has been set in the global filter`);

            // Check if the active System Role record exists in the cache
            this.log.trace(`${LOG_PREFIX} Checking if the active System Role record exists in the cache`);
            if (this.systemsRolesDataService.records.some(a => a.id == this.filterService.filter.activeSystemRole?.id)) {

                // The active System Role record exists in the cache
                this.log.trace(`${LOG_PREFIX} The active System Role record exists in the cache`);

                // Initialisation is valid
                this.log.trace(`${LOG_PREFIX} Initialisation is valid`);

            } else {

                // Initialisation is invalid
                this.log.trace(`${LOG_PREFIX} Initialisation is invalid`);

                // Get the first System Role record
                this.log.trace(`${LOG_PREFIX} Get the first System Role record`);
                const systemRole: SystemRole | null = this.systemsRolesDataService.records.length > 0 ? this.systemsRolesDataService.records[0] : null;
                this.log.trace(`${LOG_PREFIX} First System Role record = ${JSON.stringify(systemRole)}`);

                // Update the global filter
                this.log.trace(`${LOG_PREFIX} Updating the global filter`);
                this.filterService.update({ activeSystemRole: systemRole });

            }


            // Return
            this.log.trace(`${LOG_PREFIX} Returning`);
            callback();

        } else {

            // The active System Role has not been set in the global filter
            this.log.trace(`${LOG_PREFIX} The active System Role has not been set in the global filter`);

            // Get the first System Role record
            this.log.trace(`${LOG_PREFIX} Get the first System Role record`);
            const systemRole: SystemRole | null = this.systemsRolesDataService.records.length > 0 ? this.systemsRolesDataService.records[0] : null;
            this.log.trace(`${LOG_PREFIX} First System Role record = ${JSON.stringify(systemRole)}`);

            // Update the global filter
            this.log.trace(`${LOG_PREFIX} Updating the global filter`);
            this.filterService.update({ activeSystemRole: systemRole });

            // Return
            this.log.trace(`${LOG_PREFIX} Returning`);
            callback();

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
                sortColumn: 'id',
                sortDirection: 'asc',
                ids: null,
                name: null,
                enabled: true,
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
     * Retrieves and caches System Modules Permissions records
     * @param callback The function to call when done
     */
    private initialiseSystemModulesPermissions(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseSystemModulesPermissions()`);

        // Retrieve and cache all the System Modules Permissions records
        this.log.trace(`${LOG_PREFIX} Retrieving and caching all the System Modules Permissions records`);
        this.systemsModulesPermissionsDataService
            .getSystemsModulesPermissions(true, {
                searchTerm: null,
                page: null,
                pageSize: null,
                sortColumn: 'id',
                sortDirection: 'asc',
                code: null,
                name: null
            })
            .pipe(first()) // This will automatically complete (and therefore unsubscribe) after the first value has been emitted.
            .subscribe({
                next: (systemModulesPermissions: SystemModulePermission[]) => {

                    // System ModulesPermissions successfully retrieved and cached
                    this.log.debug(`${LOG_PREFIX} ${systemModulesPermissions.length} System Module(s) retrieved and cached`);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                },

                error: (err: any) => {

                    // System ModulesPermissions retrieval failed
                    this.log.error(`${LOG_PREFIX} System ModulesPermissions retrieval failed`);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                }
            });

    }



    /**
     * Presets default values in the data tabulation form
     * @param callback The function to call when done
     */
    private initialiseFormGroup(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseFormGroup()`);

        this.log.trace(`${LOG_PREFIX} Get the Active System Role`);
        const activeSystemRole: SystemRole | null | undefined = this.filterService.filter.activeSystemRole;
        this.log.debug(`${LOG_PREFIX} Active System Role = ${JSON.stringify(activeSystemRole)}`);

        // Select the active System Role
        this.log.trace(`${LOG_PREFIX} Selecting the active System Role`);
        this.systemsRolesPermissionsForm.get('systemRoleId')?.setValue((activeSystemRole && activeSystemRole.id) ? activeSystemRole.id : null);


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

                        // Retrieve the System Module records corresponding to the passed in state
                        this.log.trace(`${LOG_PREFIX} Retrieving the System Module records corresponding to the passed in state`);
                        this.systemsModulesDataService
                            .getSystemsModules(true, state)
                            .subscribe({
                                next: (s: SystemModule[]) => {

                                    // System Module records retrieved
                                    this.log.trace(`${LOG_PREFIX} System Module records retrieved`);
                                    this.log.debug(`${LOG_PREFIX} System Module records = ${JSON.stringify(s)}`);

                                    // Update the offset due to pagination
                                    this.log.trace(`${LOG_PREFIX} Updating the offset due to pagination`);
                                    this.paginationOffset = this.calculatePaginationOffset();
                                    this.log.debug(`${LOG_PREFIX} Pagination Offset = ${this.paginationOffset}`);

                                    this.cd.markForCheck();

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

    public isConfigurable(): boolean {
        if (this.isDevelopmentEnvironment()) {
            return true;
        } else {
            if (this.filterService.filter.activeSystemRole?.data.customisable) {
                return this.filterService.filter.activeSystemRole.data.customisable;
            } else {
                return false;
            }
        }
    }

    public isProductionEnvironment(): boolean {
        return (environment.production);
    }

    public isDevelopmentEnvironment(): boolean {
        return !(environment.production);
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
            let copy: SystemModuleState = Object.assign({}, this.stateSubject$.value);

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
            let copy: SystemModuleState = Object.assign({}, this.stateSubject$.value);

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
            let copy: SystemModuleState = Object.assign({}, this.stateSubject$.value);

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
     * Get all the system modules that belong to a target system module
     * @param systemModuleId The id of the target system module
     * @returns the target system modules
     */
    public getSystemModulePermissions(systemModuleId: number | null | undefined): Observable<SystemModulePermission[]> {
        if (systemModuleId && this.filterService.filter.expandedSystemModulesIds.some(id => id == systemModuleId)) {
            return of(this.systemsModulesPermissionsDataService.records.filter(s => s.data.systemModuleId == systemModuleId));
        } else {
            return of([]);
        }
    }

    /**
     * Handles System Role change events
     */
    public onSystemRoleChange(): void {

        this.log.trace(`${LOG_PREFIX} Entering onSystemRoleChange()`);


        // Get the selected system role id
        this.log.trace(`${LOG_PREFIX} Getting the selected System Role Id`);
        const systemRoleId: number | null | undefined = this.systemsRolesPermissionsForm.get('systemRoleId')?.value
        this.log.debug(`${LOG_PREFIX} System Role Id = ${systemRoleId}`);

        // Get the System Role record corresponding to the id
        this.log.trace(`${LOG_PREFIX} Getting the System Role record corresponding to the id`);
        const systemRole: SystemRole | null | undefined = this.systemsRolesDataService.records.length > 0 ? this.systemsRolesDataService.records.find(s => s.id == systemRoleId) : null;
        this.log.trace(`${LOG_PREFIX} System Role record = ${JSON.stringify(systemRole)}`);

        // Update the global filter
        this.log.trace(`${LOG_PREFIX} Updating the global filter`);
        this.filterService.update({ activeSystemRole: systemRole });


    }


    /**
     * Checks whether a System Module record is currently expanded
     * @param systemModule The unique identifier of the target System Module
     * @returns True or false depending on whether the System Module is currently expanded or not respectively
     */
    public isExpanded(systemModule: SystemModule | null | undefined): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isExpanded()`);
        this.log.debug(`${LOG_PREFIX} Target System Module Id = ${JSON.stringify(systemModule)}`);

        // Check if a System Module id was passed in
        this.log.trace(`${LOG_PREFIX} Checking if a System Module id was passed in`);
        if (systemModule?.id) {

            // A System Module was passed in
            this.log.trace(`${LOG_PREFIX} A System Module was passed in`);

            // Check whether the System Module is currently expanded
            this.log.trace(`${LOG_PREFIX} Checking whether the System Module is currently expanded`);
            const expanded: boolean = this.filterService.filter.expandedSystemModulesIds.some(id => id == systemModule.id);
            this.log.debug(`${LOG_PREFIX} Expanded = ${expanded}`);

            return expanded;

        } else {


            // A System Module was not passed in
            this.log.warn(`${LOG_PREFIX} A System Module was not passed in`);

            // Return false by default
            this.log.warn(`${LOG_PREFIX} Returning false by default`);

            return false;
        }


    }


    /**
     * Checks whether a System Module record is currently collapsed
     * @param systemModule The unique identifier of the target System Module
     * @returns True or false depending on whether the System Module is currently collapsed or not respectively
     */
    public isCollapsed(systemModule: SystemModule | null | undefined): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isCollapsed()`);
        this.log.debug(`${LOG_PREFIX} Target System Module = ${JSON.stringify(systemModule)}`);

        // Check if a System Module id was passed in
        this.log.trace(`${LOG_PREFIX} Checking if a System Module id was passed in`);
        if (systemModule?.id) {

            // A System Module was passed in
            this.log.trace(`${LOG_PREFIX} A System Module was passed in`);

            // Check whether the System Module is currently collapsed
            this.log.trace(`${LOG_PREFIX} Checking whether the System Module is currently collapsed`);
            const collapsed: boolean = !(this.filterService.filter.expandedSystemModulesIds.some(id => id == systemModule.id));
            this.log.debug(`${LOG_PREFIX} Collapsed = ${collapsed}`);

            return collapsed;

        } else {


            // A System Module was not passed in
            this.log.warn(`${LOG_PREFIX} A System Module was not passed in`);

            // Return false by default
            this.log.warn(`${LOG_PREFIX} Returning false by default`);

            return false;
        }

    }


    /**
     * Expands records
     */
    public onExpand(systemModule: SystemModule | null | undefined): void {

        this.log.trace(`${LOG_PREFIX} Entering onExpand()`);
        this.log.debug(`${LOG_PREFIX} System Module = ${JSON.stringify(systemModule)}`);

        // Check if a System Module id was passed in
        this.log.trace(`${LOG_PREFIX} Checking if a System Module id was passed in`);
        if (systemModule?.id) {

            // Make a copy of the currently expanded System Modules ids
            this.log.trace(`${LOG_PREFIX} Making a copy of the currently expanded System Modules ids`);
            const ids: number[] = Object.assign([], this.filterService.filter.expandedSystemModulesIds);

            // Add the expanded System Module to the copy of expanded System Modules ids
            this.log.trace(`${LOG_PREFIX} Adding the expanded System Module to the copy of expanded System Modules ids`);
            if (!(ids.some(id => id == systemModule.id))) {
                ids.push(systemModule.id);
            }

            // Update the global filter of expanded system modules ids
            this.log.trace(`${LOG_PREFIX} Updating the global filter of expanded system modules ids`);
            this.filterService.update({ expandedSystemModulesIds: ids })

            this.cd.detectChanges();

        } else {


            // A System Module was not passed in
            this.log.warn(`${LOG_PREFIX} A System Module was not passed in`);

        }

    }


    /**
     * Collapses records
     */
    public onCollapse(systemModule: SystemModule | null | undefined): void {

        this.log.trace(`${LOG_PREFIX} Entering onCollapse()`);
        this.log.debug(`${LOG_PREFIX} System Module Id = ${JSON.stringify(systemModule)}`);

        // Check if a System Module id was passed in
        this.log.trace(`${LOG_PREFIX} Checking if a System Module id was passed in`);
        if (systemModule?.id) {

            // Make a copy of the currently expanded System Modules ids
            this.log.trace(`${LOG_PREFIX} Making a copy of the currently expanded System Modules ids`);
            const ids: number[] = Object.assign([], this.filterService.filter.expandedSystemModulesIds);

            // Remove the collapsed System Module from the copy of expanded System Modules ids
            this.log.trace(`${LOG_PREFIX} Remove the collapsed System Module from the copy of expanded System Modules ids`);
            let index: number = ids.findIndex(id => id == systemModule.id)
            if (index != -1) {
                ids.splice(index, 1);
            }

            // Update the global filter of expanded system modules ids
            this.log.trace(`${LOG_PREFIX} Updating the global filter of expanded system modules ids`);
            this.filterService.update({ expandedSystemModulesIds: ids })

            this.cd.detectChanges();

        } else {


            // A System Module was not passed in
            this.log.warn(`${LOG_PREFIX} A System Module was not passed in`);

        }

    }


    /**
     * Checks whether a System Module Permission record is currently checked
     * @param systemModulePermission The target System Module Permission
     * @returns True or false depending on whether the System Module Permission is currently checked or not respectively
     */
    public isChecked(systemModulePermission: SystemModulePermission): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isChecked()`);
        this.log.debug(`${LOG_PREFIX} Target System Module Permission = ${JSON.stringify(systemModulePermission)}`);

        // Check whether the System Module is currently checked
        this.log.trace(`${LOG_PREFIX} Checking whether the System Module is currently checked`);
        if (this.filterService.filter.activeSystemRole?.data.permissions) {
            return this.filterService.filter.activeSystemRole.data.permissions.some(code => code == systemModulePermission.data.code);
        } else {
            return false;
        }
    }



    /** 
    * Handles Systems Modules Permissions Checkboxes Check Events
    * @param systemModulePermission The Checked System Module Permission
    */
    onCheck(systemModulePermission: SystemModulePermission) {

        this.log.trace(`${LOG_PREFIX} Entering onCheck()`);
        this.log.debug(`${LOG_PREFIX} Checked System Module Permission = ${JSON.stringify(systemModulePermission)}`);

        // Add the System Module Permission code into the array of selected permissions
        this.log.trace(`${LOG_PREFIX} Adding the System Module Permission code into the array of selected permissions`);
        if (systemModulePermission.data.code) {
            if (this.filterService.filter.activeSystemRole?.data.permissions?.indexOf(systemModulePermission.data.code) == -1) {
                this.filterService.filter.activeSystemRole?.data.permissions.push(systemModulePermission.data.code);
                this.save();
            }
        }

    }


    /** 
    * Handles Systems Modules Permissions Checkboxes Uncheck Events
    * @param systemModulePermission The Unchecked System Module Permission
    */
    onUncheck(systemModulePermission: SystemModulePermission) {

        this.log.trace(`${LOG_PREFIX} Entering onUncheck()`);


        // Check if a valid System Module Permission id was passed in
        this.log.trace(`${LOG_PREFIX} Checking if a valid System Module Permission id was passed in`);
        if (systemModulePermission.id) {

            // A valid System Module Permission id was passed in
            this.log.trace(`${LOG_PREFIX} A valid System Module Permission id was passed in`);
            this.log.trace(`${LOG_PREFIX} System Module Permission id = ${systemModulePermission.id}`);

            // Attempt retrieving the index of the System Module Permission id in the System Role's permissions array
            this.log.trace(`${LOG_PREFIX} Attempting to retrieve the index of the System Module Permission id in the System Role's permissions array`);
            let index: number = this.filterService.filter.activeSystemRole?.data.permissions ? this.filterService.filter.activeSystemRole.data.permissions.findIndex(code => code == systemModulePermission.data.code) : -1;

            // Check if the System Module Permission id's index was successfully retrieved
            this.log.trace(`${LOG_PREFIX} Checking if the System Module Permission id's index was successfully retrieved`);
            if (index != -1) {

                // The System Module Permission id's index was successfully retrieved
                this.log.trace(`${LOG_PREFIX} The System Module Permission id's index was successfully retrieved`);
                this.log.trace(`${LOG_PREFIX} Index = ${index}`);

                // Remove the System Role permission id at that index
                this.log.trace(`${LOG_PREFIX} Removing the System Role permission id at that index`);
                this.filterService.filter.activeSystemRole?.data.permissions?.splice(index, 1);

                // Save the updated System Role permission record
                this.log.trace(`${LOG_PREFIX} Saving the updated System Role permission record`);
                this.save();

            } else {

                // The system module permission id's index was not successfully retrieved
                this.log.warn(`${LOG_PREFIX} The system module permission id's index was not successfully retrieved`);
                this.log.warn(`${LOG_PREFIX} Index = ${index}`);

                // Ignore the uncheck request
                this.log.warn(`${LOG_PREFIX} Ignoring the uncheck request`);

            }

        } else {

            // A valid System Module Permission id was not passed in
            this.log.warn(`${LOG_PREFIX} A valid System Module Permission id was not passed in`);

            // Ignore the uncheck request
            this.log.warn(`${LOG_PREFIX} Ignoring the uncheck request`);
        }


    }


    private save(): void {

        if (this.filterService.filter.activeSystemRole) {

            // Save the record
            this.log.trace(`${LOG_PREFIX} Saving the System Role Record`);
            this.systemsRolesDataService
                .updateSystemRole(this.filterService.filter.activeSystemRole)
                .subscribe({
                    next: (response: SystemRole) => {

                        // The System Role Record was saved successfully
                        this.log.trace(`${LOG_PREFIX} The System Role Record was successfuly updated`);

                    },
                    error: (error: any) => {

                        // The System Role Record was not saved successfully
                        this.log.trace(`${LOG_PREFIX} The System Role Record was not successfuly updated`);


                    }
                });
        }

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
