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
import { Subscription, first, BehaviorSubject, Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataFormsRecordsCreationModalComponent } from '@modules/data-forms/containers/data-forms-records-creation-modal/data-forms-records-creation-modal.component';
import { DataFormsRecordsDeletionModalComponent } from '@modules/data-forms/containers/data-forms-records-deletion-modal/data-forms-records-deletion-modal.component';
import { DataFormsRecordsUpdationModalComponent } from '@modules/data-forms/containers/data-forms-records-updation-modal/data-forms-records-updation-modal.component';
import { DataFormsDataService } from '@modules/data-forms/services/data-forms-data.service';
import { FormControl, FormGroup } from '@angular/forms';
import { ContextsDataService } from '@modules/contexts/services/contexts-data.service';
import { Context } from '@modules/contexts/models';
import { FilterService } from '@app/app-filter.service';
import { DataForm } from '@modules/data-forms/models/data-form.model';
import { Router } from '@angular/router';
import { DataFormsFieldsRecordsCreationModalComponent } from '@modules/data-forms-elements/containers/data-forms-fields-records-creation-modal/data-forms-fields-records-creation-modal.component';
import { DataFormsElementsTypesDataService } from '@modules/data-forms-elements-types/services/data-forms-elements-types-data.service';
import { DataFormState } from '@modules/data-forms/models/data-form-state.model';
import { OperatorsDataService } from '@modules/operators/services/operators-data.service';
import { WorkflowsDataService } from '@modules/workflows/services/workflows-data.service';
import { Workflow } from '@modules/workflows/models/workflow.model';

const LOG_PREFIX: string = "[Data Forms Records Tabulation Component]";

@Component({
    selector: 'sb-data-forms-records-tabulation',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './data-forms-records-tabulation.component.html',
    styleUrls: ['data-forms-records-tabulation.component.scss'],
})
export class DataFormsRecordsTabulationComponent implements OnInit, OnDestroy, AfterViewInit {

        // Keeps a local reference of the currently active context
        private activeContext: Context | null | undefined = null;

    // Keeps a local reference to the displayed loading animation component.
    // Makes it possible to trigger the loading animation when a slow background service is invoked.
    private _animation!: LoadingAnimationComponent;

    // Keeps a local reference to the displayed pagination component.
    // Makes it possible to initialise / update the pagination component when the total number of records changes.
    private _pagination!: PaginationComponent;

    // Holds the required records state
    // Makes it possible to supply the filter, sort or search criteria that should be applied to records on retrieval.
    private stateSubject$ = new BehaviorSubject<DataFormState>({
        page: 1,
        pageSize: 20,
        searchTerm: null,
        sortColumn: 'name',
        sortDirection: 'asc',
        contextId: null,
        name: null
    });
    readonly state$ = this.stateSubject$.asObservable();

    // Keeps tabs of the current button disabled state in accordance with the client's online/offline state
    // Should be updated when the online status changes
    private _disabledSubject$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
    readonly disabled$: Observable<boolean> = this._disabledSubject$.asObservable();

    // Keeps tabs on the records skipped due to pagination
    paginationOffset: number = 0;

    // Central gathering point for all the component's subscriptions.
    // Makes it efficient to unsubscribe from all subscriptions when the component is destroyed.   
    private _subscriptions: Subscription[] = [];

    // Instantitate a new reactive Form Group
    // This will allow us to define and enforce the validation rules for all the form controls.
    dataFormsForm = new FormGroup({
        contextId: new FormControl<number | null>(null, [
        ]),
    });

    constructor(
        private cd: ChangeDetectorRef,
        public contextsDataService: ContextsDataService,
        public dataFormsDataService: DataFormsDataService,
        public dataFormsElementsTypesDataService: DataFormsElementsTypesDataService,
        public operatorsDataService: OperatorsDataService,
        public workflowsDataService: WorkflowsDataService,
        public filterService: FilterService,
        private router: Router,
        private modalService: NgbModal,
        private log: NGXLogger) {

    }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

        // Initialise the active Context from the global filter
        this.initialiseActiveContext(() => {

            // Listen to and react to global context changes
            this.initialiseActiveContextChangesHandler(() => {

                // Retrieve and cache Workflows locally
                this.initialiseWorkflows(() => {

                    // Set the default active Context's id as the contextId in the desired records state
                    this.initialiseDesiredRecordsState(() => {

                        // Preselect the active Context in the data tabulation form
                        this.initialiseFormGroup(() => {

                            // Monitor & react to desired records state changes
                            this.initialiseDesiredRecordsStateChangesHandler(() => {

                                // Mark Init as complete
                                this.log.trace(`${LOG_PREFIX} Init completed`);
                            });
                        });

                    });

                })

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
 * Initialise the active context
 * @param callback 
 */
  private initialiseActiveContext(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Initialise the Active Context`);
    this.activeContext = this.filterService.filter.activeContext;
    this.log.debug(`${LOG_PREFIX} Active Context = ${JSON.stringify(this.activeContext)}`);

    // Return
    this.log.trace(`${LOG_PREFIX} Returning`);
    callback();
}

/**
 * Subscribe and react to Context changes
 * @param callback The function to call when done
 */
private initialiseActiveContextChangesHandler(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseActiveContextChangesHandler()`);

    // Subscribe to filtering criteria updates and react to them if the Context is changed
    this.log.trace(`${LOG_PREFIX} Subscribing to filtering criteria updates and reacting to them if the Context is changed`);
    this._subscriptions.push(
        this.filterService.currentFilter$
            .subscribe({
                next: (filter) => {

                    if ((JSON.stringify(this.activeContext) !== JSON.stringify(filter.activeContext))) {

                        // Active context changed
                        this.log.trace(`${LOG_PREFIX} Active context changed`);

                        // Keep a local reference to the location / temporal filters
                        this.activeContext = filter.activeContext;

                        // Make a copy of the desired records state
                        this.log.trace(`${LOG_PREFIX} Making a copy of the desired records state`);
                        let copy: DataFormState = Object.assign({}, this.stateSubject$.value);

                        // Set the active Context as the desired Context
                        this.log.trace(`${LOG_PREFIX} Setting the active Context as the desired Context`);
                        Object.assign(copy, { contextId: this.activeContext?.id });

                        // Broadcast the newly desired record state
                        this.log.trace(`${LOG_PREFIX} Broadcasting the newly desired record state`);
                        this.stateSubject$.next(copy);

                    }
                }
            })
    );

    // Transfer control to the callback function
    callback();

}



    /**
     * Retrieves and caches Workflows records
     * @param callback The function to call when done
     */
    private initialiseWorkflows(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseWorkflows()`);

        // Retrieve and cache all the Workflows records
        this.log.trace(`${LOG_PREFIX} Retrieving and caching all the Workflows records`);
        this.workflowsDataService
            .getWorkflows(true, {
                searchTerm: null,
                page: null,
                pageSize: null,
                sortColumn: 'name',
                sortDirection: 'asc',
                name: null
            })
            .pipe(first()) // This will automatically complete (and therefore unsubscribe) after the first value has been emitted.
            .subscribe({
                next: (workflows: Workflow[]) => {

                    // Workflows successfully retrieved and cached
                    this.log.debug(`${LOG_PREFIX} ${workflows.length} Workflow(s) retrieved and cached`);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                },

                error: (err: any) => {

                    // Workflows retrieval failed
                    this.log.error(`${LOG_PREFIX} Workflows retrieval failed`);

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

        this.log.trace(`${LOG_PREFIX} Get the Active Context`);
        const activeContext: Context | null | undefined = this.filterService.filter.activeContext;
        this.log.debug(`${LOG_PREFIX} Active Context = ${JSON.stringify(activeContext)}`);

        // Make a copy of the desired records state
        this.log.trace(`${LOG_PREFIX} Making a copy of the desired records state`);
        let copy: DataFormState = Object.assign({}, this.stateSubject$.value);

        // Set the active Context as the desired Context
        this.log.trace(`${LOG_PREFIX} Setting the active Context as the desired Context`);
        Object.assign(copy, { contextId: activeContext?.id });

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

        this.log.trace(`${LOG_PREFIX} Get the Active Context`);
        const activeContext: Context | null | undefined = this.filterService.filter.activeContext;
        this.log.debug(`${LOG_PREFIX} Active Context = ${JSON.stringify(activeContext)}`);

        // Select the active Context
        this.log.trace(`${LOG_PREFIX} Selecting the active Context`);
        this.dataFormsForm.get('contextId')?.setValue((activeContext && activeContext.id) ? activeContext.id : null);


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

                        // Retrieve the Data Forms records corresponding to the passed in state
                        this.log.trace(`${LOG_PREFIX} Retrieving the Data Forms records corresponding to the passed in state`);
                        this.dataFormsDataService
                            .getDataForms(true, state)
                            .pipe(first())
                            .subscribe({
                                next: (s: DataForm[]) => {

                                    // Data Forms records retrieved
                                    this.log.trace(`${LOG_PREFIX} Data Forms records retrieved`);
                                    this.log.debug(`${LOG_PREFIX} Data Forms records = ${JSON.stringify(s)}`);

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
            this.dataFormsDataService.loading$
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
            this.dataFormsDataService.totalRecords$.subscribe(
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
            let copy: DataFormState = Object.assign({}, this.stateSubject$.value);

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
            let copy: DataFormState = Object.assign({}, this.stateSubject$.value);

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
            let copy: DataFormState = Object.assign({}, this.stateSubject$.value);

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
     * Handles Data Forms Records Addition Requests
     */
    public onAddDataForm(): void {

        this.log.trace(`${LOG_PREFIX} Entering onAddDataForm()`);
        const modalRef = this.modalService.open(DataFormsRecordsCreationModalComponent, { centered: true, backdrop: 'static' });
        modalRef.componentInstance.contextId = this.stateSubject$.value.contextId;
    }

    /**
     * Handles Data Forms Records Updation Requests
     * @param id The unique identifier of the Data Form record to update
     */
    public onUpdateDataForm(id: number): void {

        this.log.trace(`${LOG_PREFIX} Entering onUpdateDataForm()`);
        this.log.debug(`${LOG_PREFIX} Data Form Record Id = ${id}`);
        const modalRef = this.modalService.open(DataFormsRecordsUpdationModalComponent, { centered: true, backdrop: 'static' });
        modalRef.componentInstance.id = id;

    }

    /**
     * Handles Data Forms Records Deletion Requests
     * * @param id The unique identifier of the Data Form record to delete
     */
    public onDeleteDataForm(id: number): void {

        this.log.trace(`${LOG_PREFIX} Entering onDeleteDataForm()`);
        this.log.debug(`${LOG_PREFIX} Data Form Record Id = ${id}`);
        const modalRef = this.modalService.open(DataFormsRecordsDeletionModalComponent, { centered: true, backdrop: 'static' });
        modalRef.componentInstance.id = id;
    }


    /**
     * Handles Data Forms Records Configuration Requests
     * * @param id The unique identifier of the Data Form record to configure
     */
    public onConfigureDataForm(id: number): void {

        this.log.trace(`${LOG_PREFIX} Entering onConfigureDataForm()`);
        this.log.debug(`${LOG_PREFIX} Data Form Record Id = ${id}`);

        // Retrieve the Data Form record with the specified id
        this.log.trace(`${LOG_PREFIX} Retrieving the Data Form record with the specified id`);
        const dataForm: DataForm | undefined = this.dataFormsDataService.records.find(d => d.id == id);

        // Set the Data Form as the active Data Form
        this.log.trace(`${LOG_PREFIX} Setting the Data Form as the active Data Form`);
        this.filterService.update({ activeDataForm: dataForm, activeDataFormViewMode: "configuration" });


        // Open the Data Form configuration window
        this.log.trace(`${LOG_PREFIX} Opening the Data Form configuration window`);
        this.router.navigate(['/contents', { outlets: { content: ['data_forms_elements'] } }]);
    }


    /**
     * Handles Data Forms Records Preview Requests
     * * @param id The unique identifier of the Data Form record to configure
     */
    public onPreviewDataForm(id: number): void {

        this.log.trace(`${LOG_PREFIX} Entering onConfigureDataForm()`);
        this.log.debug(`${LOG_PREFIX} Data Form Record Id = ${id}`);

        // Retrieve the Data Form record with the specified id
        this.log.trace(`${LOG_PREFIX} Retrieving the Data Form record with the specified id`);
        const dataForm: DataForm | undefined = this.dataFormsDataService.records.find(d => d.id == id);

        // Set the Data Form as the active Data Form
        this.log.trace(`${LOG_PREFIX} Setting the Data Form as the active Data Form`);
        this.filterService.update({ activeDataForm: dataForm, activeDataFormViewMode: "preview" });

        // Open the Data Form preview window
        this.log.trace(`${LOG_PREFIX} Opening the Data Form preview window`);

        // Open the Data Form configuration window
        this.log.trace(`${LOG_PREFIX} Opening the Data Form configuration window`);
        this.router.navigate(['/contents', { outlets: { content: ['data_forms_elements'] } }]);
    }



    /**
     * Checks whether a Data Form record is currently expanded
     * @param dataFormId The unique identifier of the target Data Form
     * @returns True or false depending on whether the Data Form is currently expanded or not respectively
     */
    public isExpanded(dataFormId: number): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isExpanded()`);
        this.log.debug(`${LOG_PREFIX} Target Data Form Id = ${JSON.stringify(dataFormId)}`);

        // Check whether the Data Form is currently expanded
        this.log.trace(`${LOG_PREFIX} Checking whether the Data Form is currently expanded`);
        const expanded: boolean = this.filterService.filter.expandedDataFormsIds.some(id => id == dataFormId);
        this.log.debug(`${LOG_PREFIX} Expanded = ${expanded}`);

        return expanded;
    }


    /**
     * Checks whether a Data Form record is currently collapsed
     * @param dataFormId The unique identifier of the target Data Form
     * @returns True or false depending on whether the Data Form is currently collapsed or not respectively
     */
    public isCollapsed(dataFormId: number): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isCollapsed()`);
        this.log.debug(`${LOG_PREFIX} Target Data Form Id = ${JSON.stringify(dataFormId)}`);

        // Check whether the Data Form is currently collapsed
        this.log.trace(`${LOG_PREFIX} Checking whether the Data Form is currently collapsed`);
        const collapsed: boolean = !(this.filterService.filter.expandedDataFormsIds.some(id => id == dataFormId));
        this.log.debug(`${LOG_PREFIX} Collapsed = ${collapsed}`);

        return collapsed;
    }



    /**
     * Expands records
     */
    public onExpand(dataFormId: number): void {

        this.log.trace(`${LOG_PREFIX} Entering onExpand()`);
        this.log.debug(`${LOG_PREFIX} Data Form Id = ${dataFormId}`);

        // Remove the Data Form id from the array of previewed Data Forms ids
        this.log.trace(`${LOG_PREFIX} Remove the Data Form id from the array of previewed Data Forms ids`);
        let index: number = this.filterService.filter.previewedDataFormsIds.indexOf(dataFormId);
        if (index != -1) {
            this.filterService.filter.previewedDataFormsIds.splice(index, 1);
        }

        // Add the Data Form id into the array of expanded Data Forms records
        this.log.trace(`${LOG_PREFIX} Add the Data Form id into the array of expanded Data Forms records`);
        if (this.filterService.filter.expandedDataFormsIds.indexOf(dataFormId) == -1) {
            this.filterService.filter.expandedDataFormsIds.push(dataFormId);
        }

        this.cd.detectChanges();

    }


    /**
     * Collapses records
     */
    public onCollapse(dataFormId: number): void {

        this.log.trace(`${LOG_PREFIX} Entering onCollapse()`);
        this.log.debug(`${LOG_PREFIX} Data Form Id = ${dataFormId}`);

        // Remove the Data Form id from the array of expanded Data Forms ids
        this.log.trace(`${LOG_PREFIX} Remove the Data Form id from the array of expanded Data Forms ids`);
        let index: number = this.filterService.filter.expandedDataFormsIds.indexOf(dataFormId);
        if (index != -1) {
            this.filterService.filter.expandedDataFormsIds.splice(index, 1);
        }

        this.cd.detectChanges();

    }




    /**
     * Checks whether a Data Form record is currently previewed
     * @param dataFormId The unique identifier of the target Data Form
     * @returns True or false depending on whether the Data Form is currently previewed or not respectively
     */
    public isPreviewed(dataFormId: number): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isPreviewed()`);
        this.log.debug(`${LOG_PREFIX} Target Data Form Id = ${JSON.stringify(dataFormId)}`);

        // Check whether the Data Form is currently previewed
        this.log.trace(`${LOG_PREFIX} Checking whether the Data Form is currently previewed`);
        const previewed: boolean = this.filterService.filter.previewedDataFormsIds.some(id => id == dataFormId);
        this.log.debug(`${LOG_PREFIX} Previewed = ${previewed}`);

        return previewed;
    }


    /**
     * Checks whether a Data Form record is currently hidden
     * @param dataFormId The unique identifier of the target Data Form
     * @returns True or false depending on whether the Data Form is currently collapsed or not respectively
     */
    public isHidden(dataFormId: number): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isHidden()`);
        this.log.debug(`${LOG_PREFIX} Target Data Form Id = ${JSON.stringify(dataFormId)}`);

        // Check whether the Data Form is currently hidden
        this.log.trace(`${LOG_PREFIX} Checking whether the Data Form is currently hidden`);
        const hidden: boolean = !(this.filterService.filter.previewedDataFormsIds.some(id => id == dataFormId));
        this.log.debug(`${LOG_PREFIX} Hidden = ${hidden}`);

        return hidden;
    }



    /**
     * Previews records
     */
    public onPreview(dataFormId: number): void {

        this.log.trace(`${LOG_PREFIX} Entering onPreview()`);
        this.log.debug(`${LOG_PREFIX} Data Form Id = ${dataFormId}`);

        // Remove the Data Form id from the array of expanded Data Forms ids
        this.log.trace(`${LOG_PREFIX} Remove the Data Form id from the array of expanded Data Forms ids`);
        let index: number = this.filterService.filter.expandedDataFormsIds.indexOf(dataFormId);
        if (index != -1) {
            this.filterService.filter.expandedDataFormsIds.splice(index, 1);
        }

        // Add the Data Form id into the array of previewed Data Forms records
        this.log.trace(`${LOG_PREFIX} Add the Data Form id into the array of previewed Data Forms records`);
        if (this.filterService.filter.previewedDataFormsIds.indexOf(dataFormId) == -1) {
            this.filterService.filter.previewedDataFormsIds.push(dataFormId);
        }

        this.cd.detectChanges();

    }


    /**
     * Hides records
     */
    public onHide(dataFormId: number): void {

        this.log.trace(`${LOG_PREFIX} Entering onHide()`);
        this.log.debug(`${LOG_PREFIX} Data Form Id = ${dataFormId}`);

        // Remove the Data Form id from the array of previewed Data Forms ids
        this.log.trace(`${LOG_PREFIX} Remove the Data Form id from the array of previewed Data Forms ids`);
        let index: number = this.filterService.filter.previewedDataFormsIds.indexOf(dataFormId);
        if (index != -1) {
            this.filterService.filter.previewedDataFormsIds.splice(index, 1);
        }

        this.cd.detectChanges();

    }


    onAddField(dataFormId: number, parentId: number | null): void {
        const modalRef = this.modalService.open(DataFormsFieldsRecordsCreationModalComponent, { centered: true, backdrop: 'static' });
        modalRef.componentInstance.contextId = this.stateSubject$.value.contextId;
    }

    onAddGroup(dataFormId: number, parentId: number | null): void {
        alert(`Adding Dataform ${dataFormId} Parent ${parentId} Group`);
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
