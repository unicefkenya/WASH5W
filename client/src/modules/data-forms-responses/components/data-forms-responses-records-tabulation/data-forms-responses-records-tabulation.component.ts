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
import { Subscription, timer } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataFormsResponsesDataService } from '@modules/data-forms-responses/services/data-forms-responses-data.service';
import { FilterService } from '@app/app-filter.service';
import { DataFormResponse } from '@modules/data-forms-responses/models/data-form-response.model';
import { DataFormsResponsesRecordsDeletionModalComponent } from '@modules/data-forms-responses/containers/data-forms-responses-records-deletion-modal/data-forms-responses-records-deletion-modal.component';
import { DataFormResponsesInitialisationNotificationService } from '@modules/data-forms-responses/services/data-forms-responses-initialisation-message.service';
import { Tab } from '@common/models/tab.model';
import { LocationsDataFormsResponsesRecordsCreationModalComponent } from '@modules/data-forms-responses/containers/locations-data-forms-responses-records-creation-modal/locations-data-forms-responses-records-creation-modal.component';
import { SystemUserRight } from '@modules/systems-users-rights/models/system-user-right.model';
import { Entity } from '@modules/entities/models/entity.model';
import { Organisation } from '@modules/organisations/models/organisation.model';
import { OrganisationsDataFormsResponsesRecordsCreationModalComponent } from '@modules/data-forms-responses/containers/organisations-data-forms-responses-records-creation-modal/organisations-data-forms-responses-records-creation-modal.component';
import { EntitiesDataService } from '@modules/entities/services/entities-data.service';
import { OrganisationsDataService } from '@modules/organisations/services/organisations-data.service';
import { DateUtilService } from '@common/services/date-util.service';

const LOG_PREFIX: string = "[Data Forms Responses Records Tabulation Component]";

@Component({
    selector: 'sb-dataFormsResponses-records-tabulation',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './data-forms-responses-records-tabulation.component.html',
    styleUrls: ['data-forms-responses-records-tabulation.component.scss'],
})
export class DataFormsResponsesRecordsTabulationComponent implements OnInit, OnDestroy, AfterViewInit {

    // Keeps tabs on the active tab
    @Input() public activeTab: Tab | null = {
        index: 0,
        title: "Draft",
        link: "#",
        active: true
    };

    // Keeps tabs on the active Context's System Rights
    @Input() public activeContextSystemUserRights: SystemUserRight | null | undefined = null;

    // Broadcasts search term changes to the parent component
    @Output() public searchTermChanged: EventEmitter<string> = new EventEmitter<string>();

    // Broadcasts page number changes to the parent component
    @Output() public pageChanged: EventEmitter<number> = new EventEmitter<number>();

    // Broadcasts page size changes to the parent component
    @Output() public pageSizeChanged: EventEmitter<number> = new EventEmitter<number>();

    // Broadcasts Data Form Responses 'open' events to the parent component
    @Output() public opened: EventEmitter<DataFormResponse> = new EventEmitter<DataFormResponse>();

    // Broadcasts loading status events to the parent component
    @Output() public loading: EventEmitter<Boolean> = new EventEmitter<Boolean>();

    // Keeps tabs on whether to guard the workflows
    guard: boolean = true;

    // Keep tabs on the identifier of the target form
    private _formId!: number

    // Keeps a local reference to the displayed loading animation component.
    // Makes it possible to trigger the loading animation when a slow background service is invoked.
    private _animation!: LoadingAnimationComponent;

    // Keeps a local reference to the displayed pagination component.
    // Makes it possible to initialise / update the pagination component when the total number of records changes.
    private _pagination!: PaginationComponent;

    // Keep tabs of the desired page size
    private _pageSize: number = 20;

    // Keep tabs of the currently open page 
    private _page: number = 1;

    // Keeps tabs on the records skipped due to pagination
    public paginationOffset: number = 0;

    // Central gathering point for all the component's subscriptions.
    // Makes it efficient to unsubscribe from all subscriptions when the component is destroyed.   
    private _subscriptions: Subscription[] = [];

    constructor(
        private cd: ChangeDetectorRef,
        public dateUtilService: DateUtilService,
        public entitiesDataService: EntitiesDataService,
        public dataFormsResponsesDataService: DataFormsResponsesDataService,
        public organisationsDataService: OrganisationsDataService,
        public filterService: FilterService,
        public dataFormResponsesInitialisationNotificationService: DataFormResponsesInitialisationNotificationService,
        private modalService: NgbModal,
        private log: NGXLogger) {

    }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

        // Mark Init as complete
        this.log.trace(`${LOG_PREFIX} Init completed`);



    }


    ngAfterViewInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngAfterViewInit()`);

        // Set the initial page size
        this.initialisePaginationPageSize(() => {

            // Monitor & react to total record counts changes
            this.initialiseTotalRecordCountsChangesHandler(() => {

                // Monitor & react to loading status changes
                this.initialiseLoadingStatusChangesHandler(() => {

                    // Monitor & react to forms initialisation notifications
                    this.initialiseDataFormsResponsesInitialisationsNotificationsHandler(() => {

                        // Mark After-View-Init as complete
                        this.log.trace(`${LOG_PREFIX} After-View-Init completed`);

                    })

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
        this._pagination.pageSize = this._pageSize;

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
            this.dataFormsResponsesDataService.loading$
                .subscribe(
                    (loading: boolean) => {

                        this.loading.emit(loading);

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
            this.dataFormsResponsesDataService.totalRecords$.subscribe(
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
     * Subscribe and react to data forms responses initialisations
     * @param callback The function to call when done
     */
    private initialiseDataFormsResponsesInitialisationsNotificationsHandler(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseDataFormsResponsesInitialisationsNotificationsHandler()`);

        // Subscribe to loading events and propagate them to the loading component.
        this.log.trace(`${LOG_PREFIX} Subscribing to loading status changes`);
        this._subscriptions.push(
            this.dataFormResponsesInitialisationNotificationService.initialisations
                .subscribe(
                    (response: DataFormResponse | null) => {

                        if (response) {

                            this.opened.emit(response);

                        }


                    }));



        // Transfer control to the callback function
        callback();

    }

    /**
     * Checks if the current user is entity scoped
     * @returns 
     */
    public isLoggedInUserEntityScoped(): boolean {

        return (this.activeContextSystemUserRights?.data.scopeType?.id == 1) ? true : false;
    }

    /**
     * Checks if the current user is location scoped
     * @returns 
     */
    public isLoggedInUserLocationScoped(): boolean {

        return (this.activeContextSystemUserRights?.data.scopeType?.id == 2) ? true : false;
    }

    /**
     * Checks if the current user is organisation scoped
     * @returns 
     */
    public isLoggedInUserOrganisationScoped(): boolean {

        return (this.activeContextSystemUserRights?.data.scopeType?.id == 3) ? true : false;
    }



    /**
     * Establishes whether a data form response is editable
     * @param dataFormResponse the target data form response
     * @returns true or false 
     */
    public isEditable(dataFormResponse: DataFormResponse): boolean {

        // A form is editable:-
        // 1. if the current period is open
        // 2. if the response is in the draft state
        // 3. if the current user is the owner of the response
        if (!this.isCurrentTimePeriodOpen()) {
            return false;
        } else {
            if (dataFormResponse.data.status?.id != 1) {
                return false;
            } else {
                return dataFormResponse.data.respondent?.id == this.filterService.filter.activeSystemUser?.id
            }

        }

    }


    /**
     * Checks if the prevailing time period is open
     * @returns 
     */
    public isCurrentTimePeriodOpen(): boolean {

        return this.filterService.filter.activeReportingPeriod?.data.open ? this.filterService.filter.activeReportingPeriod.data.open : false;
    }

    /**
     * Classifies responses based on their source
     * @returns 1 if filled by an entity scoped user, 2 if filled by a location scoped user, 3 if filled by an organisation scoped user
     */
    public getResponseClassification(dataFormResponse: DataFormResponse): number | null {

        if (dataFormResponse) {
            if (dataFormResponse.data.entity) {
                return 1;
            } else if (dataFormResponse.data.organisations) {
                return 3;
            } else {
                return 2;
            }
        }

        return null;
    }

    /**
     * Takes in a date object and returns a presentable string version of the date
     * @param timePointId the unique identifier of the timepoint at which the response was captured
     * @returns The presentable string version of the date
     */
    public getFormattedDate(timePointId: number | null | undefined, format: 'short' | 'long' | 'medium'): string | null {

        this.log.trace(`${LOG_PREFIX} Entering getFormattedDate()`);

        // Check if the time point's id was specified
        this.log.trace(`${LOG_PREFIX} Checking if the time point's id was specified`);
        if (timePointId) {

            // The time point's id was specified
            this.log.trace(`${LOG_PREFIX} The time point's id was specified`);
            this.log.debug(`${LOG_PREFIX} Time point's id = ${timePointId}`);
            return this.dateUtilService.formatDate(this.dateUtilService.getDateStringFromTimepointId(timePointId), format);

        } else {

            this.log.error(`${LOG_PREFIX} The time point's id was not specified`);
            return "";

        }
    }


    /**
     * Retrieves an Entity record given its unique identifier synchronously
     * @param id The unique identifier of the Entity
     * @param callback The function to call when done
     */
    private retrieveEntityRecord(id: number | null | undefined, callback: (entity: Entity | null) => void): void {

        this.log.trace(`${LOG_PREFIX} Entering retrieveEntityRecord()`);
        this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

        // Check if the Entity Id has been specified
        this.log.trace(`${LOG_PREFIX} Checking if the Entity Id has been specified`);
        if (id) {

            // The Entity Id has been specified
            this.log.trace(`${LOG_PREFIX} The Entity Id has been specified`);
            this.log.debug(`${LOG_PREFIX} Entity Id = ${JSON.stringify(id)}`);

            // Try retrieving an Entity Record with the passed in id
            this.log.trace(`${LOG_PREFIX} Trying to retrieve an Entity Record with the passed in id`);
            this.entitiesDataService
                .getEntities(false, {
                    page: null,
                    pageSize: null,
                    searchTerm: null,
                    sortColumn: null,
                    sortDirection: null,
                    id: id,
                    typeId: null,
                    locationId: null,
                    name: null
                })
                .subscribe({
                    next: (entities: Entity[]) => {

                        // Check if an Entity record with the given id was found
                        this.log.trace(`${LOG_PREFIX} Checking if an Entity record with the given id was found`);
                        if (entities.length > 0) {

                            //An Entity record with the given id was found
                            this.log.trace(`${LOG_PREFIX} An Entity record with the given id was found`);

                            // Return the Entity record
                            this.log.trace(`${LOG_PREFIX} Returning the Entity record`);
                            callback(entities[0]);


                        } else {

                            //An Entity record with the given id was not found
                            this.log.trace(`${LOG_PREFIX} An Entity record with the given id was not found`);

                            // Return null
                            this.log.warn(`${LOG_PREFIX} Return null`);
                            callback(null);

                        }
                    }
                });


        } else {

            // The Entity Id has not been specified
            this.log.error(`${LOG_PREFIX} The Entity Id has not been specified`);

            // Return null
            this.log.warn(`${LOG_PREFIX} Return null`);
            callback(null);

        }
    }

    /**
         * Retrieves an Organisation record given its unique identifier synchronously
         * @param id The unique identifier of the Organisation
         * @param callback The function to call when done
         */
    private retrieveOrganisationRecord(id: number | null | undefined, callback: (organisation: Organisation | null) => void): void {

        this.log.trace(`${LOG_PREFIX} Entering retrieveOrganisationRecord()`);
        this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

        // Check if the Organisation Id has been specified
        this.log.trace(`${LOG_PREFIX} Checking if the Organisation Id has been specified`);
        if (id) {

            // The Organisation Id has been specified
            this.log.trace(`${LOG_PREFIX} The Organisation Id has been specified`);
            this.log.debug(`${LOG_PREFIX} Organisation Id = ${JSON.stringify(id)}`);

            // Try retrieving an Organisation Record with the passed in id
            this.log.trace(`${LOG_PREFIX} Trying to retrieve an Organisation Record with the passed in id`);
            this.organisationsDataService
                .getOrganisations(false, {
                    page: null,
                    pageSize: null,
                    searchTerm: null,
                    sortColumn: null,
                    sortDirection: null,
                    id: id,
                    typeId: null,
                    name: null,
                    abbreviation: null
                })
                .subscribe({
                    next: (organisations: Organisation[]) => {

                        // Check if an Organisation record with the given id was found
                        this.log.trace(`${LOG_PREFIX} Checking if an Organisation record with the given id was found`);
                        if (organisations.length > 0) {

                            //An Organisation record with the given id was found
                            this.log.trace(`${LOG_PREFIX} An Organisation record with the given id was found`);

                            // Return the Organisation record
                            this.log.trace(`${LOG_PREFIX} Returning the Organisation record`);
                            callback(organisations[0]);


                        } else {

                            //An Organisation record with the given id was not found
                            this.log.trace(`${LOG_PREFIX} An Organisation record with the given id was not found`);

                            // Return null
                            this.log.warn(`${LOG_PREFIX} Return null`);
                            callback(null);

                        }
                    }
                });


        } else {

            // The Organisation Id has not been specified
            this.log.error(`${LOG_PREFIX} The Organisation Id has not been specified`);

            // Return null
            this.log.warn(`${LOG_PREFIX} Return null`);
            callback(null);

        }
    }

    /**
     * Propagates changed search terms to the parent component
     * @param searchTerm The changed search term
     */
    public onSearchTermChange(searchTerm: string): void {
        this.searchTermChanged.emit(searchTerm);
    }

    /**
     * Processes and propagates changed page numbers to the parent component
     * @param searchTerm The changed page number
     */
    public onPageChange(page: number): void {
        this._page = page;
        this.pageChanged.emit(page);
        this.paginationOffset = this.calculatePaginationOffset();
    }

    /**
     * Processes and propagates changed page sizes to the parent component
     * @param searchTerm The changed page size
     */
    public onPageSizeChange(pageSize: number): void {
        this._pageSize = pageSize;
        this.pageSizeChanged.emit(pageSize);
        this.paginationOffset = this.calculatePaginationOffset();
    }


    /**
     * Adds and opens Data Forms Responses for editing
     */
    public onAddDataFormResponse(): void {

        this.log.trace(`${LOG_PREFIX} Entering onAddDataFormResponse()`);

        // Check if the System User Rights has been provided
        this.log.trace(`${LOG_PREFIX} Checking if the System User Rights has been provided`);
        if (this.activeContextSystemUserRights) {

            // The System User Rights has been provided
            this.log.trace(`${LOG_PREFIX} The System User Rights has been provided`);

            // Check the scope of the user's rights in the current context
            this.log.trace(`${LOG_PREFIX} Checking the scope of the user's rights in the current context`);
            switch (this.activeContextSystemUserRights.data.scopeType?.id) {

                case 1: // Entities

                    // The scope of the user's rights is an entity
                    this.log.trace(`${LOG_PREFIX} The scope of the user's rights is an entity`);

                    // Get the target entity
                    this.log.trace(`${LOG_PREFIX} Getting the target entity`);
                    this.retrieveEntityRecord(this.activeContextSystemUserRights.data.entity?.id, (entity: Entity | null) => {
                        this.log.debug(`${LOG_PREFIX} Entity = ${JSON.stringify(entity)}`);
                        if (entity) {
                            // Initialise entity data form response
                            this.log.trace(`${LOG_PREFIX} Initialising entity data form response`);
                            this.dataFormsResponsesDataService
                                .createDataFormResponse(
                                    new DataFormResponse({
                                        data: {
                                            contextId: this.filterService.filter.activeContext?.id,
                                            timePeriodId: this.filterService.filter.activeReportingPeriod?.id,
                                            timePointId: this.dateUtilService.getTimePointIdFromDate(new Date()),
                                            formId: this.filterService.filter.activeDataForm?.id,
                                            location: entity?.data.location,
                                            organisations: null,
                                            entity: { "id": entity?.id, "name": entity?.data.name },
                                            respondent: {
                                                "id": this.filterService.filter.activeSystemUser?.id,
                                                "name": this.filterService.filter.activeSystemUser?.data.name,
                                                "email": this.filterService.filter.activeSystemUser?.data.email
                                            },
                                            responses: [],
                                            status: {
                                                "id": 1,
                                                "name": "Draft"
                                            },
                                            ongoing: true
                                        },
                                        version: null
                                    }))
                                .subscribe({
                                    next: (response: DataFormResponse) => {

                                        // The Data Form Response Record was saved successfully
                                        this.log.trace(`${LOG_PREFIX} Data Form Response Record was saved successfuly`);

                                        timer(0).subscribe(x => {

                                            // Notify interested parties
                                            this.dataFormResponsesInitialisationNotificationService.notify(response);

                                        })


                                    }
                                });
                        }

                    });


                    break;

                case 2: // Locations

                    // The scope of the user's rights is a location
                    this.log.trace(`${LOG_PREFIX} The scope of the user's rights is a location`);

                    // Launch data form response initialisation modal
                    this.log.trace(`${LOG_PREFIX} Launching data form response initialisation modal`);
                    this.modalService.open(LocationsDataFormsResponsesRecordsCreationModalComponent, { centered: true, backdrop: 'static' });

                    break;

                case 3: // Organisations

                    // The scope of the user's rights is an organisation
                    this.log.trace(`${LOG_PREFIX} The scope of the user's rights is an organisation`);

                    // Get the target organisation
                    this.log.trace(`${LOG_PREFIX} Getting the target organisation`);
                    this.retrieveOrganisationRecord(this.activeContextSystemUserRights.data.organisation?.id, (organisation: Organisation | null) => {
                        this.log.debug(`${LOG_PREFIX} Organisation = ${JSON.stringify(organisation)}`);
                        if (organisation) {
                            // Launch organisation data form response initialisation modal
                            this.log.trace(`${LOG_PREFIX} Launching organisation data form response initialisation modal`);
                            const organisationModalRef = this.modalService.open(OrganisationsDataFormsResponsesRecordsCreationModalComponent, { centered: true, backdrop: 'static' });
                            organisationModalRef.componentInstance.organisation = organisation;
                        }

                    });


                    break;

                default:

                    // The scope of the user's rights is unknown
                    this.log.error(`${LOG_PREFIX} The scope of the user's rights is a location`);

                    // Ignoring data form response initialisation
                    this.log.warn(`${LOG_PREFIX} Ignoring data form response initialisation`);

            }

        }



    }


    /**
     * Handles Data Forms Responses Records Deletion Requests
     */
    public onDeleteDataFormResponse(id: number): void {

        this.log.trace(`${LOG_PREFIX} Entering onDeleteDataFormResponse()`);
        this.log.debug(`${LOG_PREFIX} Data Form Response Id = ${id}`);

        const modalRef = this.modalService.open(DataFormsResponsesRecordsDeletionModalComponent, { centered: true, backdrop: 'static' });
        modalRef.componentInstance.id = id;
    }



    /**
     * Propagates Data Forms Responses Preview Requests to the parent component
     */
    public onPreviewDataFormResponse(dataFormResponse: DataFormResponse): void {

        this.log.trace(`${LOG_PREFIX} Entering onPreviewDataFormResponse()`);
        this.log.debug(`${LOG_PREFIX} Data Form Response = ${JSON.stringify(dataFormResponse)}`);

        // Open the data form
        this.log.trace(`${LOG_PREFIX} Opening the data form`);
        this.opened.emit(dataFormResponse);


    }



    /**
     * * Propagates Data Forms Responses Update Requests to the parent component
     */
    public onEditDataFormResponse(dataFormResponse: DataFormResponse): void {

        this.log.trace(`${LOG_PREFIX} Entering onPreviewDataFormResponse()`);
        this.log.debug(`${LOG_PREFIX} Data Form Response = ${JSON.stringify(dataFormResponse)}`);

        // Open the data form
        this.log.trace(`${LOG_PREFIX} Opening the data form`);
        this.opened.emit(dataFormResponse);

    }


    /**
     * Calculates the number of records that have been skipped because of pagination
     * @returns The number of records that have been skipped because of pagination
     */
    private calculatePaginationOffset(): number {

        this.log.trace(`${LOG_PREFIX} Entering calculatePaginationOffset()`);

        if (this._page && this._pageSize) {
            return (this._page - 1) * this._pageSize
        } else {
            return 0;
        }

    }



}
