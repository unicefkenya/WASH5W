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
import { Subscription, BehaviorSubject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SystemsUsersRecordsCreationModalComponent } from '@modules/systems-users/containers/systems-users-records-creation-modal/systems-users-records-creation-modal.component';
import { SystemsUsersRecordsDeletionModalComponent } from '@modules/systems-users/containers/systems-users-records-deletion-modal/systems-users-records-deletion-modal.component';
import { SystemsUsersRecordsUpdationModalComponent } from '@modules/systems-users/containers/systems-users-records-updation-modal/systems-users-records-updation-modal.component';
import { SystemsUsersDataService } from '@modules/systems-users/services/systems-users-data.service';
import { SystemUserState } from '@modules/systems-users/models/system-user-state.model';
import { environment } from 'environments/environment';
import { SystemUser } from '@modules/systems-users/models/system-user.model';
import { FilterService } from '@app/app-filter.service';

const LOG_PREFIX: string = "[Systems Users Records Tabulation Component]";

@Component({
    selector: 'sb-systemsUsers-records-tabulation',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './systems-users-records-tabulation.component.html',
    styleUrls: ['systems-users-records-tabulation.component.scss'],
})
export class SystemsUsersRecordsTabulationComponent implements OnInit, OnDestroy, AfterViewInit {

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
    private stateSubject$ = new BehaviorSubject<SystemUserState>({
        searchTerm: null,
        page: 1,
        pageSize: 20,
        sortColumn: 'id',
        sortDirection: 'asc',
        id: null,
        name: null,
        email: null,
        password: null
    });
    readonly state$ = this.stateSubject$.asObservable();

    // Central gathering point for all the component's subscriptions.
    // Makes it efficient to unsubscribe from all subscriptions when the component is destroyed.   
    private _subscriptions: Subscription[] = [];

    // Keep a local reference to the expanded System User
    targetSystemUser!: SystemUser | null;

    constructor(
        private cd: ChangeDetectorRef,
        public systemsUsersDataService: SystemsUsersDataService,
        public filterService: FilterService,
        private modalService: NgbModal,
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
        this.filterService.filter.expandedSystemUsers.length = 0;
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

                        // Retrieve the System User records corresponding to the passed in state
                        this.log.trace(`${LOG_PREFIX} Retrieving the System User records corresponding to the passed in state`);
                        this.systemsUsersDataService
                            .getSystemsUsers(true, state)
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
            this.systemsUsersDataService.loading$
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
            this.systemsUsersDataService.totalRecords$.subscribe(
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
            let copy: SystemUserState = Object.assign({}, this.stateSubject$.value);

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
            let copy: SystemUserState = Object.assign({}, this.stateSubject$.value);

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
            let copy: SystemUserState = Object.assign({}, this.stateSubject$.value);

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
     * Handles Systems Users Records Addition Requests
     */
    public onAddSystemUser(): void {

        this.log.trace(`${LOG_PREFIX} Entering onAddSystemUser()`);

        const modalRef = this.modalService.open(SystemsUsersRecordsCreationModalComponent, { centered: true, backdrop: 'static' });
        modalRef.componentInstance.mode = "administered";

    }

    /**
     * Handles Systems Users Records Updation Requests
     */
    public onUpdateSystemUser(id: number): void {

        this.log.trace(`${LOG_PREFIX} Entering onUpdateSystemUser()`);
        this.log.debug(`${LOG_PREFIX} System User Id = ${id}`);

        const modalRef = this.modalService.open(SystemsUsersRecordsUpdationModalComponent, { centered: true, backdrop: 'static' });
        modalRef.componentInstance.id = id;
        modalRef.componentInstance.mode = "administered";

    }

    /**
     * Handles Systems Users Records Deletion Requests
     */
    public onDeleteSystemUser(id: number): void {

        this.log.trace(`${LOG_PREFIX} Entering onDeleteSystemUser()`);
        this.log.debug(`${LOG_PREFIX} System User Id = ${id}`);

        const modalRef = this.modalService.open(SystemsUsersRecordsDeletionModalComponent, { centered: true, backdrop: 'static' });
        modalRef.componentInstance.id = id;
    }


    /**
     * Checks whether an System User record is currently expanded
     * @param systemUser The unique identifier of the target System User
     * @returns True or false depending on whether the System User is currently expanded or not respectively
     */
    public isExpanded(systemUser: SystemUser | null | undefined): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isExpanded()`);
        this.log.debug(`${LOG_PREFIX} Target SystemUser Id = ${JSON.stringify(systemUser)}`);

        // Check if a System User was passed in
        this.log.trace(`${LOG_PREFIX} Checking if a System User was passed in`);
        if (systemUser) {

            // A System User was passed in
            this.log.trace(`${LOG_PREFIX} A System User was passed in`);

            // Check whether the System User is currently expanded
            this.log.trace(`${LOG_PREFIX} Checking whether the System User is currently expanded`);
            const expanded: boolean = this.filterService.filter.expandedSystemUsers.some(element => element.id == systemUser.id);
            this.log.debug(`${LOG_PREFIX} Expanded = ${expanded}`);

            return expanded;

        } else {


            // A System User was not passed in
            this.log.warn(`${LOG_PREFIX} A System User was not passed in`);

            // Return false by default
            this.log.warn(`${LOG_PREFIX} Returning false by default`);

            return false;
        }


    }


    /**
     * Checks whether an System User record is currently collapsed
     * @param systemUser The unique identifier of the target System User
     * @returns True or false depending on whether the System User is currently collapsed or not respectively
     */
    public isCollapsed(systemUser: SystemUser | null | undefined): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isCollapsed()`);
        this.log.debug(`${LOG_PREFIX} Target SystemUser = ${JSON.stringify(systemUser)}`);

        // Check if a System User was passed in
        this.log.trace(`${LOG_PREFIX} Checking if a System User was passed in`);
        if (systemUser) {

            // A System User was passed in
            this.log.trace(`${LOG_PREFIX} A System User was passed in`);

            // Check whether the System User is currently collapsed
            this.log.trace(`${LOG_PREFIX} Checking whether the System User is currently collapsed`);
            const collapsed: boolean = !(this.filterService.filter.expandedSystemUsers.some(element => element.id == systemUser.id));
            this.log.debug(`${LOG_PREFIX} Collapsed = ${collapsed}`);

            return collapsed;

        } else {


            // A System User was not passed in
            this.log.warn(`${LOG_PREFIX} A System User was not passed in`);

            // Return false by default
            this.log.warn(`${LOG_PREFIX} Returning false by default`);

            return false;
        }

    }


    /**
     * Expands records
     */
    public onExpand(systemUser: SystemUser | null | undefined): void {

        this.log.trace(`${LOG_PREFIX} Entering onExpand()`);
        this.log.debug(`${LOG_PREFIX} System User = ${JSON.stringify(systemUser)}`);

        this.targetSystemUser = null;

        // Check if a System User was passed in
        this.log.trace(`${LOG_PREFIX} Checking if a System User was passed in`);
        if (systemUser) {

            // Clear any currently expanded systemUser record
            this.log.trace(`${LOG_PREFIX} Clearing any currently expanded systemUser record`);
            this.filterService.filter.expandedSystemUsers.length = 0;

            // Add the System User into the array of expanded SystemUsers records
            this.log.trace(`${LOG_PREFIX} Add the System User into the array of expanded SystemUsers records`);
            this.filterService.filter.expandedSystemUsers.push(systemUser);

            // Keep a local reference to the expanded System User
            this.targetSystemUser = systemUser;

        } else {


            // A System User was not passed in
            this.log.warn(`${LOG_PREFIX} A System User was not passed in`);

        }

        this.cd.detectChanges();

    }


    /**
     * Collapses records
     */
    public onCollapse(systemUser: SystemUser | null | undefined): void {

        this.log.trace(`${LOG_PREFIX} Entering onCollapse()`);
        this.log.debug(`${LOG_PREFIX} System User Id = ${JSON.stringify(systemUser)}`);

        this.targetSystemUser = null;
        this.cd.detectChanges();

        // Check if a System User was passed in
        this.log.trace(`${LOG_PREFIX} Checking if a System User was passed in`);
        if (systemUser) {

            // A System User was passed in
            this.log.trace(`${LOG_PREFIX} A System User was passed in`);

            // Remove the System User from the array of expanded SystemUsers
            this.log.trace(`${LOG_PREFIX} Remove the System User from the array of expanded SystemUsers`);
            let index: number = this.filterService.filter.expandedSystemUsers.findIndex(d => d.id == systemUser.id)
            if (index != -1) {
                this.filterService.filter.expandedSystemUsers.splice(index, 1);
            }


        } else {


            // A System User was not passed in
            this.log.warn(`${LOG_PREFIX} A System User was not passed in`);

        }

        this.cd.detectChanges();

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
