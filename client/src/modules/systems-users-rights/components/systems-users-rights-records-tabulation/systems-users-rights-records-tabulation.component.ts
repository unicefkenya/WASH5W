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
import { Subscription, BehaviorSubject, pipe, first } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SystemsUsersRightsRecordsCreationModalComponent } from '@modules/systems-users-rights/containers/systems-users-rights-records-creation-modal/systems-users-rights-records-creation-modal.component';
import { SystemsUsersRightsRecordsDeletionModalComponent } from '@modules/systems-users-rights/containers/systems-users-rights-records-deletion-modal/systems-users-rights-records-deletion-modal.component';
import { SystemsUsersRightsRecordsUpdationModalComponent } from '@modules/systems-users-rights/containers/systems-users-rights-records-updation-modal/systems-users-rights-records-updation-modal.component';
import { SystemsUsersRightsDataService } from '@modules/systems-users-rights/services/systems-users-rights-data.service';
import { SystemUserRightState } from '@modules/systems-users-rights/models/system-user-right-state.model';
import { FilterService } from '@app/app-filter.service';
import { ContextsDataService } from '@modules/contexts/services/contexts-data.service';
import { Context } from '@modules/contexts/models/context.model';
import { SystemRole } from '@modules/systems-roles/models/system-role.model';
import { SystemsRolesDataService } from '@modules/systems-roles/services/systems-roles-data.service';

const LOG_PREFIX: string = "[Systems Users Rights Records Tabulation Component]";

@Component({
    selector: 'sb-systems-users-rights-records-tabulation',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './systems-users-rights-records-tabulation.component.html',
    styleUrls: ['systems-users-rights-records-tabulation.component.scss'],
})
export class SystemsUsersRightsRecordsTabulationComponent implements OnInit, OnDestroy, AfterViewInit {


    // Allow the parent component to pass in the target system user
    @Input() public systemUserId!: number;

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
    private stateSubject$ = new BehaviorSubject<SystemUserRightState>({
        searchTerm: null,
        page: 1,
        pageSize: 5,
        sortColumn: 'name',
        sortDirection: 'asc',
        id: null,
        systemUserId: null,
        contextId: null
    });
    readonly state$ = this.stateSubject$.asObservable();

    // Central gathering point for all the component's subscriptions.
    // Makes it efficient to unsubscribe from all subscriptions when the component is destroyed.   
    private _subscriptions: Subscription[] = [];

    // Keeps tabs of whether the component has been successfully initialised
    public initialised: boolean = false;

    constructor(
        private cd: ChangeDetectorRef,
        public systemsUsersRightsDataService: SystemsUsersRightsDataService,
        public contextsDataService: ContextsDataService,
        public systemsRolesDataService: SystemsRolesDataService,
        public filterService: FilterService,
        private modalService: NgbModal,
        private log: NGXLogger) {

    }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

        // Retrieve and cache contexts locally
        this.initialiseContexts(() => {

            // Retrieve and cache systems roles locally
            this.initialiseSystemsRoles(() => {

                // Initialise the desired record state
                this.initialiseDesiredRecordsState(() => {

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
     * Retrieves and caches Contexts records
     * @param callback The function to call when done
     */
    private initialiseContexts(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseContexts()`);

        // Retrieve and cache all the Contexts records
        this.log.trace(`${LOG_PREFIX} Retrieving and caching all the Contexts records`);
        this.contextsDataService
            .getContexts(true, {
                searchTerm: null,
                page: null,
                pageSize: null,
                sortColumn: 'name',
                sortDirection: 'asc',
                ids: null,
                name: null,
                abbreviation: null
            })
            .pipe(first()) // This will automatically complete (and therefore unsubscribe) after the first value has been emitted.
            .subscribe({
                next: (contexts: Context[]) => {

                    // Contexts successfully retrieved and cached
                    this.log.debug(`${LOG_PREFIX} ${contexts.length} Context(s) retrieved and cached`);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                },

                error: (err: any) => {

                    // Contexts retrieval failed
                    this.log.error(`${LOG_PREFIX} Contexts retrieval failed`);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                }
            });

    }

    /**
     * Retrieves and caches System Roles records
     * @param callback The function to call when done
     */
    private initialiseSystemsRoles(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseSystemsRoles()`);

        // Retrieve and cache all the System Roles records
        this.log.trace(`${LOG_PREFIX} Retrieving and caching all the System Roles records`);
        this.systemsRolesDataService
            .getSystemsRoles(true, {
                searchTerm: null,
                page: 1,
                pageSize: 20,
                sortColumn: 'name',
                sortDirection: 'asc',
                ids: null,
                code: null,
                name: null
            })
            .pipe(first()) // This will automatically complete (and therefore unsubscribe) after the first value has been emitted.
            .subscribe({
                next: (systemsRoles: SystemRole[]) => {

                    // Systems Roles successfully retrieved and cached
                    this.log.debug(`${LOG_PREFIX} ${systemsRoles.length} System Role(s) retrieved and cached`);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                },

                error: (err: any) => {

                    // Systems Roles retrieval failed
                    this.log.error(`${LOG_PREFIX} Systems Roles retrieval failed`);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                }
            });

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
        let copy: SystemUserRightState = Object.assign({}, this.stateSubject$.value);

        // Set the system user id to the input system user id
        this.log.trace(`${LOG_PREFIX} Setting the system user id to the input system user id`);
        copy.systemUserId = this.systemUserId;

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

                        // Retrieve the System User Right records corresponding to the passed in state
                        this.log.trace(`${LOG_PREFIX} Retrieving the System User Right records corresponding to the passed in state`);
                        this.systemsUsersRightsDataService
                            .getSystemsUsersRights(true, state)
                            .subscribe();

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
            this.systemsUsersRightsDataService.loading$
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
            this.systemsUsersRightsDataService.totalRecords$.subscribe(
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
            let copy: SystemUserRightState = Object.assign({}, this.stateSubject$.value);

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
            let copy: SystemUserRightState = Object.assign({}, this.stateSubject$.value);

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
            let copy: SystemUserRightState = Object.assign({}, this.stateSubject$.value);

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
     * Handles Systems Users Rights Records Addition Requests
     */
    public onAddSystemUserRight(): void {

        this.log.trace(`${LOG_PREFIX} Entering onAddSystemUserRight()`);

        const modalRef = this.modalService.open(SystemsUsersRightsRecordsCreationModalComponent, { centered: true, backdrop: 'static' });
        modalRef.componentInstance.systemUserId = this.systemUserId;
    }

    /**
     * Handles Systems Users Rights Records Updation Requests
     */
    public onUpdateSystemUserRight(id: number): void {

        this.log.trace(`${LOG_PREFIX} Entering onUpdateSystemUserRight()`);
        this.log.debug(`${LOG_PREFIX} System User Right Id = ${id}`);

        const modalRef = this.modalService.open(SystemsUsersRightsRecordsUpdationModalComponent, { centered: true, backdrop: 'static' });
        modalRef.componentInstance.id = id;

    }

    /**
     * Handles Systems Users Rights Records Deletion Requests
     */
    public onDeleteSystemUserRight(id: number): void {

        this.log.trace(`${LOG_PREFIX} Entering onDeleteSystemUserRight()`);
        this.log.debug(`${LOG_PREFIX} System User Right Id = ${id}`);

        const modalRef = this.modalService.open(SystemsUsersRightsRecordsDeletionModalComponent, { centered: true, backdrop: 'static' });
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
