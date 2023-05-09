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
import { Subscription, first, BehaviorSubject, filter } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataFormsDataService } from '@modules/data-forms/services/data-forms-data.service';
import { FormControl, FormGroup } from '@angular/forms';
import { ContextsDataService } from '@modules/contexts/services/contexts-data.service';
import { Context } from '@modules/contexts/models';
import { FilterService } from '@app/app-filter.service';
import { DataForm } from '@modules/data-forms/models/data-form.model';
import { Router } from '@angular/router';
import { DataFormsFieldsRecordsCreationModalComponent } from '@modules/data-forms-elements/containers/data-forms-fields-records-creation-modal/data-forms-fields-records-creation-modal.component';
import { DataFormElementState } from '@modules/data-forms-elements/models/data-form-element-state.model';
import { DataFormsElementsDataService } from '@modules/data-forms-elements/services/data-forms-elements-data.service';
import { DataFormElement } from '@modules/data-forms-elements/models/data-form-element.model';
import { DataFormsFieldsRecordsUpdationModalComponent } from '@modules/data-forms-elements/containers/data-forms-fields-records-updation-modal/data-forms-fields-records-updation-modal.component';
import { DataFormsFieldsRecordsDeletionModalComponent } from '@modules/data-forms-elements/containers/data-forms-fields-records-deletion-modal/data-forms-fields-records-deletion-modal.component';
import { DataFormsGroupsRecordsCreationModalComponent } from '@modules/data-forms-elements/containers/data-forms-groups-records-creation-modal/data-forms-groups-records-creation-modal.component';

const LOG_PREFIX: string = "[Data Forms Elements Configuration Views Component]";

@Component({
    selector: 'sb-data-forms-elements-configuration-views-tabulation',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './data-forms-elements-configuration-views-tabulation.component.html',
    styleUrls: ['data-forms-elements-configuration-views-tabulation.component.scss'],
})
export class DataFormsElementsConfigurationViewsComponent implements OnInit, OnDestroy, AfterViewInit {

    // Keeps a local reference of the currently active context
    private activeContext: Context | null | undefined = null;

    // Keeps a local reference to the displayed loading animation component.
    // Makes it possible to trigger the loading animation when a slow background service is invoked.
    private _animation!: LoadingAnimationComponent;

    // Keeps tabs of whether the component has been successfully initialised
    public initialised: boolean = false;

    // Holds the top-level data form elements
    private topLevelDataFormElementsSubject$ = new BehaviorSubject<DataFormElement[]>([]);
    readonly topLevelDataFormElements$ = this.topLevelDataFormElementsSubject$.asObservable();

    // Holds the nested data form elements mapped to their parent id
    public nestedDataFormElements: Map<number, DataFormElement[]> = new Map();

    // Holds the required records state
    // Makes it possible to supply the filter, sort or search criteria that should be applied to records on retrieval.
    private stateSubject$ = new BehaviorSubject<DataFormElementState>({
        searchTerm: null,
        page: null,
        pageSize: null,
        sortColumn: "index",
        sortDirection: "asc",
        id: null,
        indexLTE: null,
        indexGTE: null,
        dataFormId: null,
        categoryId: null,
        typeId: null,
        parentId: null,
        name: null
    });
    readonly state$ = this.stateSubject$.asObservable();

    // Central gathering point for all the component's subscriptions.
    // Makes it efficient to unsubscribe from all subscriptions when the component is destroyed.   
    private _subscriptions: Subscription[] = [];

    // Instantitate a new reactive Form Group
    // This will allow us to define and enforce the validation rules for all the form controls.
    dataFormElementsForm = new FormGroup({
        contextId: new FormControl<number | null>(null, [
        ]),
        dataFormId: new FormControl<number | null>(null, [
        ]),
    });

    constructor(
        private cd: ChangeDetectorRef,
        public contextsDataService: ContextsDataService,
        public dataFormsDataService: DataFormsDataService,
        public dataFormsElementsDataService: DataFormsElementsDataService,
        public filterService: FilterService,
        public modalService: NgbModal,
        public router: Router,
        private log: NGXLogger) {

    }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

        // Initialise the active Context from the global filter
        this.initialiseActiveContext(() => {

            // Listen to and react to global context changes
            this.initialiseActiveContextChangesHandler(() => {

                // Retrieve and cache Data Forms locally
                this.initialiseDataForms(() => {

                    // Set the default active Data Form if not set
                    this.initialiseActiveDataForm(() => {

                        // Set the default active Context's id as the contextId in the desired records state
                        this.initialiseDesiredRecordsState(() => {

                            // Preselect the active Context in the data tabulation form
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
                })


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

                // Mark After-View-Init as complete
                this.log.trace(`${LOG_PREFIX} After-View-Init completed`);
            });
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

                            this.initialiseDataForms(() => {
                                this.initialiseActiveDataForm(() => {

                                    // Make a copy of the desired records state
                                    this.log.trace(`${LOG_PREFIX} Making a copy of the desired records state`);
                                    let copy: DataFormElementState = Object.assign({}, this.stateSubject$.value);

                                    // Update the copy of the desired records state
                                    this.log.trace(`${LOG_PREFIX} Updating the copy of the desired records state`);
                                    Object.assign(copy, { dataFormId: this.filterService.filter.activeDataForm?.id });

                                    // Broadcast the newly desired record state
                                    this.log.trace(`${LOG_PREFIX} Broadcasting the newly desired record state`);
                                    this.stateSubject$.next(copy);

                                    // Preselect the item on the form
                                    this.log.trace(`${LOG_PREFIX} Preselecting the item on the form`);
                                    this.dataFormElementsForm.get('dataFormId')?.setValue(this.filterService.filter.activeDataForm?.id ? this.filterService.filter.activeDataForm?.id : null);
                                })
                            });

                        }
                    }
                })
        );

        // Transfer control to the callback function
        callback();

    }


    /**
     * Retrieves and caches Data Forms records
     * @param callback The function to call when done
     */
    private initialiseDataForms(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseDataForms()`);

        // Retrieve and cache the context's Data Forms records
        this.log.trace(`${LOG_PREFIX} Retrieving and caching the context's Data Forms records`);
        this.dataFormsDataService
            .getDataForms(true, {
                page: null,
                pageSize: null,
                searchTerm: null,
                sortColumn: 'name',
                sortDirection: 'asc',
                contextId: this.filterService.filter.activeContext?.id,
                name: null
            })
            .pipe(first()) // This will automatically complete (and therefore unsubscribe) after the first value has been emitted.
            .subscribe({
                next: (dataForms: DataForm[]) => {

                    // Data Forms successfully retrieved and cached
                    this.log.debug(`${LOG_PREFIX} ${dataForms.length} DataForm(s) retrieved and cached`);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                },

                error: (err: any) => {

                    // Data Forms retrieval failed
                    this.log.error(`${LOG_PREFIX} Data Forms retrieval failed`);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                }
            });


    }


    /**
     * Sets the active DataForm if it has not been set in the global filter
     * @param callback The function to call when done
     */
    private initialiseActiveDataForm(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseActiveDataForm()`);

        // Check if the active DataForm has been set in the global filter
        this.log.trace(`${LOG_PREFIX} Checking if the active DataForm has been set in the global filter`);
        if (this.filterService.filter.activeDataForm) {

            // The active DataForm has been set in the global filter
            this.log.trace(`${LOG_PREFIX} The active DataForm has been set in the global filter`);

            // Check if the active Data Form record exists in the cache
            this.log.trace(`${LOG_PREFIX} Checking if the active Data Form record exists in the cache`);
            if (this.dataFormsDataService.records.some(a => a.id == this.filterService.filter.activeDataForm?.id)) {

                // The active Data Form record exists in the cache
                this.log.trace(`${LOG_PREFIX} The active Data Form record exists in the cache`);

                // Initialisation is valid
                this.log.trace(`${LOG_PREFIX} Initialisation is valid`);

            } else {

                // Initialisation is invalid
                this.log.trace(`${LOG_PREFIX} Initialisation is invalid`);

                // Get the first Data Form record
                this.log.trace(`${LOG_PREFIX} Get the first Data Form record`);
                const dataForm: DataForm | null = this.dataFormsDataService.records.length > 0 ? this.dataFormsDataService.records[0] : null;
                this.log.trace(`${LOG_PREFIX} First Data Form record = ${JSON.stringify(dataForm)}`);

                // Update the global filter
                this.log.trace(`${LOG_PREFIX} Updating the global filter`);
                this.filterService.update({ activeDataForm: dataForm });

            }

            // Return
            this.log.trace(`${LOG_PREFIX} Returning`);
            callback();

        } else {

            // The active DataForm has not been set in the global filter
            this.log.trace(`${LOG_PREFIX} The active DataForm has not been set in the global filter`);

            // Get the first Data Form record
            this.log.trace(`${LOG_PREFIX} Get the first Data Form record`);
            const dataForm: DataForm | null = this.dataFormsDataService.records.length > 0 ? this.dataFormsDataService.records[0] : null;
            this.log.trace(`${LOG_PREFIX} First Data Form record = ${JSON.stringify(dataForm)}`);

            // Update the global filter
            this.log.trace(`${LOG_PREFIX} Updating the global filter`);
            this.filterService.update({ activeDataForm: dataForm });

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

        this.log.trace(`${LOG_PREFIX} Get the Active Context`);
        const activeContext: Context | null | undefined = this.filterService.filter.activeContext;
        this.log.debug(`${LOG_PREFIX} Active Context = ${JSON.stringify(activeContext)}`);

        this.log.trace(`${LOG_PREFIX} Get the Active DataForm`);
        const activeDataForm: DataForm | null | undefined = this.filterService.filter.activeDataForm;
        this.log.debug(`${LOG_PREFIX} Active DataForm = ${JSON.stringify(activeDataForm)}`);

        // Make a copy of the desired records state
        this.log.trace(`${LOG_PREFIX} Making a copy of the desired records state`);
        let copy: DataFormElementState = Object.assign({}, this.stateSubject$.value);

        // Set the active Context as the desired Context
        this.log.trace(`${LOG_PREFIX} Setting the active Context as the desired Context`);
        Object.assign(copy, { contextId: activeContext?.id, dataFormId: activeDataForm?.id });

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


        // Set the default Context
        this.log.trace(`${LOG_PREFIX} Setting the default Context`);
        const activeContext: Context | null | undefined = this.filterService.filter.activeContext;
        this.dataFormElementsForm.get('contextId')?.setValue((activeContext && activeContext.id) ? activeContext.id : null);


        // Set the default DataForm
        this.log.trace(`${LOG_PREFIX} Setting the default Data Form`);
        const activeDataForm: DataForm | null | undefined = this.filterService.filter.activeDataForm;
        this.dataFormElementsForm.get('dataFormId')?.setValue((activeDataForm && activeDataForm.id) ? activeDataForm.id : null);

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

                        // Retrieve the Data Form Element records corresponding to the passed in state
                        this.log.trace(`${LOG_PREFIX} Retrieving the Data Form Element records corresponding to the passed in state`);
                        this.dataFormsElementsDataService
                            .getDataFormsElements(true, state)
                            .subscribe({
                                next: (dataFormElements: DataFormElement[]) => {

                                    // Data Form Element records retrieved
                                    this.log.trace(`${LOG_PREFIX} Data Form Element records retrieved`);

                                    // Collate the Top Level and Nested Data Form Elements
                                    this.log.trace(`${LOG_PREFIX} Collating the Top Level and Nested Data Form Elements`);
                                    const top: DataFormElement[] = [];
                                    const nested: Map<number, DataFormElement[]> = new Map();
                                    for (let dataFormElement of dataFormElements) {
                                        if (dataFormElement.data.parentId) {
                                            let siblings: DataFormElement[] | undefined = nested.get(dataFormElement.data.parentId);
                                            if (siblings) {
                                                siblings.push(dataFormElement);
                                            } else {
                                                nested.set(dataFormElement.data.parentId, [dataFormElement])
                                            }
                                        } else {
                                            top.push(dataFormElement);
                                        }
                                    }

                                    // Update the local Top Level and Nested Data Form Elements
                                    this.log.trace(`${LOG_PREFIX} Updating the local Top Level and Nested Data Form Elements`);
                                    this.topLevelDataFormElementsSubject$.next(top);
                                    this.nestedDataFormElements = nested;

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
            this.contextsDataService.loading$
                .subscribe(
                    (loading) => {

                        // Loading status changed
                        this.log.trace(`${LOG_PREFIX} Loading status changed`);
                        this.log.debug(`${LOG_PREFIX} Loading status = ${loading}`);

                        // Propagate the loading status to the loading animation component
                        this.log.trace(`${LOG_PREFIX} Propagating the loading status to the loading animation component`);
                        if (this._animation) {
                            this._animation.loading = loading;
                            
                            // Mark the UI as needing to be checked for changes
                            this.log.trace(`${LOG_PREFIX} Marking the UI as needing to be checked for changes`);
                            this.cd.markForCheck();
                        }


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
            this.dataFormsElementsDataService.totalRecords$.subscribe(
                (total) => {

                    // Total record count changed
                    this.log.trace(`${LOG_PREFIX} Total record count changed`);
                    this.log.debug(`${LOG_PREFIX} Total record count = ${total}`);

                }));

        // Transfer control to the callback function
        callback();

    }


    /**
     * Retrieves the data form elements that belong to the parent with the specified id
     * @param parentId the parent id
     * @returns the data form elements
     */
    public getNestedDataFormElements(parentId: number): DataFormElement[] | undefined {
        return this.dataFormsElementsDataService.nestedDataFormElements.get(parentId);
    }

    /**
     * Handles DataForm change events
     */
    public onDataFormChange(): void {

        this.log.trace(`${LOG_PREFIX} Entering onDataFormChange()`);


        // Get the selected Data Form id
        this.log.trace(`${LOG_PREFIX} Getting the selected Data Form Id`);
        const dataFormId: number | null | undefined = this.dataFormElementsForm.get('dataFormId')?.value
        this.log.debug(`${LOG_PREFIX} Data Form Id = ${dataFormId}`);

        // Check if the specified Data Form is different from the current dataForm
        this.log.trace(`${LOG_PREFIX} Check if the specified Data Form is different from the current dataForm`);

        if (dataFormId != this.stateSubject$.value.dataFormId) {

            // The specified Data Form is different from the current dataForm
            this.log.trace(`${LOG_PREFIX} The specified Data Form is different from the current dataForm`);

            // Get the Data Form record corresponding to the passed in id
            this.log.trace(`${LOG_PREFIX} Getting the Data Form record corresponding to the passed in id`);
            const dataForm: DataForm | undefined = this.dataFormsDataService.records.find(o => o.id == dataFormId);

            // Update the global filter
            this.log.trace(`${LOG_PREFIX} Updating the global filter`);
            this.filterService.update({ activeDataForm: dataForm });

            // Make a copy of the desired records state
            this.log.trace(`${LOG_PREFIX} Making a copy of the desired records state`);
            let copy: DataFormElementState = Object.assign({}, this.stateSubject$.value);

            // Update the copy of the desired records state
            this.log.trace(`${LOG_PREFIX} Updating the copy of the desired records state`);
            Object.assign(copy, { dataFormId: dataFormId });

            // Broadcast the newly desired record state
            this.log.trace(`${LOG_PREFIX} Broadcasting the newly desired record state`);
            this.stateSubject$.next(copy);

        } else {

            // The specified Data Form is not different from the current dataForm
            this.log.trace(`${LOG_PREFIX} The specified Data Form is not different from the current dataForm`);

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
            let copy: DataFormElementState = Object.assign({}, this.stateSubject$.value);

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
            let copy: DataFormElementState = Object.assign({}, this.stateSubject$.value);

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
            let copy: DataFormElementState = Object.assign({}, this.stateSubject$.value);

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
     * Handles Data Forms Elements Records Addition Requests
     * @typeId The unique identifier of the category of element that needs to be added
     */
    public onAddDataFormElement(categoryId: number): void {

        this.log.trace(`${LOG_PREFIX} Entering onAddDataFormElement()`);
        this.log.debug(`${LOG_PREFIX} Data Form Element Category Id = ${categoryId}`);

        // Check what category of element needs to be added
        switch (categoryId) {

            case 1:
                // A group needs to be added
                // Open the group addition modal
                this.log.trace(`${LOG_PREFIX} Opening the group addition modal`);
                const groupModalRef = this.modalService.open(DataFormsGroupsRecordsCreationModalComponent, { centered: true, backdrop: 'static' });
                groupModalRef.componentInstance.contextId = this.filterService.filter.activeContext?.id;
                groupModalRef.componentInstance.dataFormId = this.filterService.filter.activeDataForm?.id;

                break;

            case 2:
                // A field needs to be added
                // Open the field addition modal
                this.log.trace(`${LOG_PREFIX} Opening the field addition modal`);
                const fieldModalRef = this.modalService.open(DataFormsFieldsRecordsCreationModalComponent, { centered: true, backdrop: 'static' });
                fieldModalRef.componentInstance.contextId = this.filterService.filter.activeContext?.id;
                fieldModalRef.componentInstance.dataFormId = this.filterService.filter.activeDataForm?.id;
                break;

            default:
                this.log.trace(`${LOG_PREFIX} Unsupported element type`);

        }

    }

    /**
     * Handles Data Forms Elements Records Updation Requests
     * @param id The unique identifier of the Data Form record to update
     * @typeId The unique identifier of the category of element that needs to be updated
     */
    public onUpdateDataFormElement(id: number, categoryId: number): void {

        this.log.trace(`${LOG_PREFIX} Entering onUpdateDataForm()`);
        this.log.debug(`${LOG_PREFIX} Data Form Record Id = ${id}`);
        this.log.debug(`${LOG_PREFIX} Data Form Element Category Id = ${categoryId}`);

        // Check what category of element needs to be updated
        switch (categoryId) {

            case 1:
                // A group needs to be updated
                // Open the group updation modal
                this.log.trace(`${LOG_PREFIX} Opening the group updation modal`);
                alert(`Coming Soon`);
                break;

            case 2:
                // A field needs to be updated
                // Open the field updation modal
                this.log.trace(`${LOG_PREFIX} Opening the field updation modal`);
                const modalRef = this.modalService.open(DataFormsFieldsRecordsUpdationModalComponent, { centered: true, backdrop: 'static' });
                modalRef.componentInstance.id = id;
                break;

            default:
                this.log.trace(`${LOG_PREFIX} Unsupported element type`);

        }

    }

    /**
     * Handles Data Forms Records Deletion Requests
     * @param id The unique identifier of the Data Form record to delete
     * @typeId The unique identifier of the category of element that needs to be deleted
     */
    public onDeleteDataFormElement(id: number, categoryId: number): void {

        this.log.trace(`${LOG_PREFIX} Entering onDeleteDataForm()`);
        this.log.debug(`${LOG_PREFIX} Data Form Record Id = ${id}`);
        this.log.debug(`${LOG_PREFIX} Data Form Element Category Id = ${categoryId}`);

        // Check what category of element needs to be deleted
        switch (categoryId) {

            case 1:
                // A group needs to be deleted
                // Open the group deletion modal
                this.log.trace(`${LOG_PREFIX} Opening the group deletion modal`);
                alert(`Coming Soon`);
                break;

            case 2:
                // A field needs to be deleted
                // Open the field deletion modal
                this.log.trace(`${LOG_PREFIX} Opening the field deletion modal`);
                const modalRef = this.modalService.open(DataFormsFieldsRecordsDeletionModalComponent, { centered: true, backdrop: 'static' });
                modalRef.componentInstance.id = id;
                break;

            default:
                this.log.trace(`${LOG_PREFIX} Unsupported element type`);

        }

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
     * Checks whether a Data Form Element record is currently expanded
     * @param dataFormElement The unique identifier of the target Data Form Element
     * @returns True or false depending on whether the Data Form Element is currently expanded or not respectively
     */
    public isExpanded(dataFormElement: DataFormElement | null | undefined): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isExpanded()`);
        this.log.debug(`${LOG_PREFIX} Target Data Form Element Id = ${JSON.stringify(dataFormElement)}`);

        // Check if a data form element was passed in
        this.log.trace(`${LOG_PREFIX} Checking if a data form element was passed in`);
        if (dataFormElement) {

            // A data form element was passed in
            this.log.trace(`${LOG_PREFIX} A data form element was passed in`);

            // Check whether the Data Form Element is currently expanded
            this.log.trace(`${LOG_PREFIX} Checking whether the Data Form Element is currently expanded`);
            const expanded: boolean = this.filterService.filter.expandedDataFormElements.some(element => element.id == dataFormElement.id);
            this.log.debug(`${LOG_PREFIX} Expanded = ${expanded}`);

            return expanded;

        } else {


            // A data form element was not passed in
            this.log.warn(`${LOG_PREFIX} A data form element was not passed in`);

            // Return false by default
            this.log.warn(`${LOG_PREFIX} Returning false by default`);

            return false;
        }


    }


    /**
     * Checks whether a Data Form Element record is currently collapsed
     * @param dataFormElement The unique identifier of the target Data Form Element
     * @returns True or false depending on whether the Data Form Element is currently collapsed or not respectively
     */
    public isCollapsed(dataFormElement: DataFormElement | null | undefined): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isCollapsed()`);
        this.log.debug(`${LOG_PREFIX} Target Data Form Element = ${JSON.stringify(dataFormElement)}`);

        // Check if a data form element was passed in
        this.log.trace(`${LOG_PREFIX} Checking if a data form element was passed in`);
        if (dataFormElement) {

            // A data form element was passed in
            this.log.trace(`${LOG_PREFIX} A data form element was passed in`);

            // Check whether the Data Form Element is currently collapsed
            this.log.trace(`${LOG_PREFIX} Checking whether the Data Form Element is currently collapsed`);
            const collapsed: boolean = !(this.filterService.filter.expandedDataFormElements.some(element => element.id == dataFormElement.id));
            this.log.debug(`${LOG_PREFIX} Collapsed = ${collapsed}`);

            return collapsed;

        } else {


            // A data form element was not passed in
            this.log.warn(`${LOG_PREFIX} A data form element was not passed in`);

            // Return false by default
            this.log.warn(`${LOG_PREFIX} Returning false by default`);

            return false;
        }

    }


    /**
     * Expands records
     */
    public onExpand(dataFormElement: DataFormElement | null | undefined): void {

        this.log.trace(`${LOG_PREFIX} Entering onExpand()`);
        this.log.debug(`${LOG_PREFIX} Data Form Element = ${JSON.stringify(dataFormElement)}`);

        // Check if a data form element was passed in
        this.log.trace(`${LOG_PREFIX} Checking if a data form element was passed in`);
        if (dataFormElement) {

            // Add the Data Form Element into the array of expanded Data Form Elements records
            this.log.trace(`${LOG_PREFIX} Add the Data Form Element into the array of expanded Data Form Elements records`);
            if (!(this.filterService.filter.expandedDataFormElements.some(d => d.id == dataFormElement.id))) {
                this.filterService.filter.expandedDataFormElements.push(dataFormElement);
            }

            this.cd.detectChanges();

        } else {


            // A data form element was not passed in
            this.log.warn(`${LOG_PREFIX} A data form element was not passed in`);

        }

    }


    /**
     * Collapses records
     */
    public onCollapse(dataFormElement: DataFormElement | null | undefined): void {

        this.log.trace(`${LOG_PREFIX} Entering onCollapse()`);
        this.log.debug(`${LOG_PREFIX} Data Form Element Id = ${JSON.stringify(dataFormElement)}`);

        // Check if a data form element was passed in
        this.log.trace(`${LOG_PREFIX} Checking if a data form element was passed in`);
        if (dataFormElement) {

            // A data form element was passed in
            this.log.trace(`${LOG_PREFIX} A data form element was passed in`);

            // Remove the Data Form Element from the array of expanded Data Form Elements
            this.log.trace(`${LOG_PREFIX} Remove the Data Form Element from the array of expanded Data Form Elements`);
            let index: number = this.filterService.filter.expandedDataFormElements.findIndex(d => d.id == dataFormElement.id)
            if (index != -1) {
                this.filterService.filter.expandedDataFormElements.splice(index, 1);
            }

            this.cd.detectChanges();

        } else {


            // A data form element was not passed in
            this.log.warn(`${LOG_PREFIX} A data form element was not passed in`);

        }

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
        modalRef.componentInstance.contextId = this.filterService.filter.activeContext?.id;
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
