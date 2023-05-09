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
import { Subscription, first, BehaviorSubject, debounceTime } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SystemsModulesPermissionsRecordsCreationModalComponent } from '@modules/systems-modules-permissions/containers/systems-modules-permissions-records-creation-modal/systems-modules-permissions-records-creation-modal.component';
import { SystemsModulesPermissionsRecordsDeletionModalComponent } from '@modules/systems-modules-permissions/containers/systems-modules-permissions-records-deletion-modal/systems-modules-permissions-records-deletion-modal.component';
import { SystemsModulesPermissionsRecordsUpdationModalComponent } from '@modules/systems-modules-permissions/containers/systems-modules-permissions-records-updation-modal/systems-modules-permissions-records-updation-modal.component';
import { SystemsModulesPermissionsDataService } from '@modules/systems-modules-permissions/services/systems-modules-permissions-data.service';
import { FormControl, FormGroup } from '@angular/forms';
import { SystemsModulesDataService } from '@modules/systems-modules/services/systems-modules-data.service';
import { SystemModule } from '@modules/systems-modules/models';
import { FilterService } from '@app/app-filter.service';
import { SystemModulePermission } from '@modules/systems-modules-permissions/models/system-module-permission.model';
import { SystemModulePermissionState } from '@modules/systems-modules-permissions/models/system-module-permission-state.model';
import { environment } from 'environments/environment';

const LOG_PREFIX: string = "[Systems Modules Permissions Records Tabulation Component]";

@Component({
    selector: 'sb-systems-modules-permissions-records-tabulation',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './systems-modules-permissions-records-tabulation.component.html',
    styleUrls: ['systems-modules-permissions-records-tabulation.component.scss'],
})
export class SystemsModulesPermissionsRecordsTabulationComponent implements OnInit, OnDestroy, AfterViewInit {

    // Keeps a local reference to the displayed loading animation component.
    // Makes it possible to trigger the loading animation when a slow background service is invoked.
    private _animation!: LoadingAnimationComponent;

    // Keeps a local reference to the displayed pagination component.
    // Makes it possible to initialise / update the pagination component when the total number of records changes.
    private _pagination!: PaginationComponent;

    customisable: boolean = false;

    // Holds the required records state
    // Makes it possible to supply the filter, sort or search criteria that should be applied to records on retrieval.
    private stateSubject$ = new BehaviorSubject<SystemModulePermissionState>({
        page: 1,
        pageSize: 20,
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
        private modalService: NgbModal,
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

    public isProductionEnvironment(): boolean {
        return (environment.production);
    }

    public isDevelopmentEnvironment(): boolean {
        return !(environment.production);
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
     * Handles Systems Modules Permissions Records Addition Requests
     */
    public onAddSystemModulePermission(): void {
        this.log.trace(`${LOG_PREFIX} Adding a new System Module Permission Record`);
        const modalRef = this.modalService.open(SystemsModulesPermissionsRecordsCreationModalComponent, { centered: true, backdrop: 'static' });
        modalRef.componentInstance.systemModuleId = this.stateSubject$.value.systemModuleId;
    }

    /**
     * Handles Systems Modules Permissions Records Updation Requests
     * @param id The unique identifier of the System Module Permission record to update
     */
    public onUpdateSystemModulePermission(id: number): void {
        this.log.trace(`${LOG_PREFIX} Updating System Module Permission Record`);
        this.log.debug(`${LOG_PREFIX} System Module Permission Record Id = ${id}`);
        const modalRef = this.modalService.open(SystemsModulesPermissionsRecordsUpdationModalComponent, { centered: true, backdrop: 'static' });
        modalRef.componentInstance.id = id;

    }

    /**
     * Handles Systems Modules Permissions Records Deletion Requests
     * * @param id The unique identifier of the System Module Permission record to delete
     */
    public onDeleteSystemModulePermission(id: number): void {
        this.log.trace(`${LOG_PREFIX} Deleting System Module Permission Record`);
        this.log.debug(`${LOG_PREFIX} System Module Permission Record Id = ${id}`);
        const modalRef = this.modalService.open(SystemsModulesPermissionsRecordsDeletionModalComponent, { centered: true, backdrop: 'static' });
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

}