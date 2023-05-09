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
import { Subscription, first, BehaviorSubject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DissagregationsRecordsCreationModalComponent } from '@modules/dissagregations/containers/dissagregations-records-creation-modal/dissagregations-records-creation-modal.component';
import { DissagregationsRecordsDeletionModalComponent } from '@modules/dissagregations/containers/dissagregations-records-deletion-modal/dissagregations-records-deletion-modal.component';
import { DissagregationsRecordsUpdationModalComponent } from '@modules/dissagregations/containers/dissagregations-records-updation-modal/dissagregations-records-updation-modal.component';
import { DissagregationsDataService } from '@modules/dissagregations/services/dissagregations-data.service';
import { FormControl, FormGroup } from '@angular/forms';
import { DissagregationsTypesDataService } from '@modules/dissagregations-types/services/dissagregations-types-data.service';
import { DissagregationType } from '@modules/dissagregations-types/models';
import { FilterService } from '@app/app-filter.service';
import { Dissagregation } from '@modules/dissagregations/models/dissagregation.model';
import { DissagregationState } from '@modules/dissagregations/models/dissagregation-state.model';
import { OperatorsDataService } from '@modules/operators/services/operators-data.service';

const LOG_PREFIX: string = "[Dissagregations Records Tabulation Component]";

@Component({
    selector: 'sb-dissagregations-records-tabulation',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './dissagregations-records-tabulation.component.html',
    styleUrls: ['dissagregations-records-tabulation.component.scss'],
})
export class DissagregationsRecordsTabulationComponent implements OnInit, OnDestroy, AfterViewInit {

    // Keeps a local reference to the displayed loading animation component.
    // Makes it possible to trigger the loading animation when a slow background service is invoked.
    private _animation!: LoadingAnimationComponent;

    // Keeps a local reference to the displayed pagination component.
    // Makes it possible to initialise / update the pagination component when the total number of records changes.
    private _pagination!: PaginationComponent;

    // Holds the required records state
    // Makes it possible to supply the filter, sort or search criteria that should be applied to records on retrieval.
    private stateSubject$ = new BehaviorSubject<DissagregationState>({
        page: 1,
        pageSize: 20,
        searchTerm: null,
        sortColumn: 'name',
        sortDirection: 'asc',
        ids: null,
        typeId: null,
        name: null
    });
    readonly state$ = this.stateSubject$.asObservable();

    // Keeps tabs on the records skipped due to pagination
    paginationOffset: number = 0;

    // Keeps tabs of whether the component has been successfully initialised
    public initialised: boolean = false;

    // Central gathering point for all the component's subscriptions.
    // Makes it efficient to unsubscribe from all subscriptions when the component is destroyed.   
    private _subscriptions: Subscription[] = [];

    // Instantitate a new reactive Form Group
    // This will allow us to define and enforce the validation rules for all the form controls.
    dissagregationsForm = new FormGroup({
        typeId: new FormControl<number | null>(null, [
        ]),
    });

    constructor(
        private cd: ChangeDetectorRef,
        public dissagregationsTypesDataService: DissagregationsTypesDataService,
        public dissagregationsDataService: DissagregationsDataService,
        public operatorsDataService: OperatorsDataService,
        private filterService: FilterService,
        private modalService: NgbModal,
        private log: NGXLogger) {

    }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

        // Retrieve and cache Dissagregations Types locally
        this.initialiseDissagregationsTypes(() => {

            // Set the default active Dissagregation Type if not set
            this.initialiseActiveDissagregationType(() => {

                // Set the default active Dissagregation Type's id as the typeId in the desired records state
                this.initialiseDesiredRecordsState(() => {

                    // Preselect the active Dissagregation Type in the data tabulation form
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
     * Retrieves and caches Dissagregations Types records
     * @param callback The function to call when done
     */
    private initialiseDissagregationsTypes(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseDissagregationsTypes()`);

        // Retrieve and cache all the Dissagregations Types records
        this.log.trace(`${LOG_PREFIX} Retrieving and caching all the Dissagregations Types records`);
        this.dissagregationsTypesDataService
            .getDissagregationsTypes(true, {
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
                next: (dissagregationsTypes: DissagregationType[]) => {

                    // Dissagregations Types successfully retrieved and cached
                    this.log.debug(`${LOG_PREFIX} ${dissagregationsTypes.length} Dissagregations Types(s) retrieved and cached`);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                },

                error: (err: any) => {

                    // Dissagregations Types retrieval failed
                    this.log.error(`${LOG_PREFIX} Dissagregations Types retrieval failed`);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                }
            });

    }


    /**
     * Sets the active Dissagregation Type if it has not been set in the global filter
     * @param callback The function to call when done
     */
    private initialiseActiveDissagregationType(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseActiveDissagregationType()`);

        // Check if the active Dissagregation Type has been set in the global filter
        this.log.trace(`${LOG_PREFIX} Checking if the active Dissagregation Type has been set in the global filter`);
        if (this.filterService.filter.activeDissagregationType) {

            // The active Dissagregation Type has been set in the global filter
            this.log.trace(`${LOG_PREFIX} The active Dissagregation Type has been set in the global filter`);

            // Check if the active Dissagregation Type record exists in the cache
            this.log.trace(`${LOG_PREFIX} Checking if the active Dissagregation Type record exists in the cache`);
            if (this.dissagregationsTypesDataService.records.some(a => a.id == this.filterService.filter.activeDissagregationType?.id)) {

                // The active Dissagregation Type record exists in the cache
                this.log.trace(`${LOG_PREFIX} The active Dissagregation Type record exists in the cache`);

                // Initialisation is valid
                this.log.trace(`${LOG_PREFIX} Initialisation is valid`);

            } else {

                // Initialisation is invalid
                this.log.trace(`${LOG_PREFIX} Initialisation is invalid`);

                // Get the first Dissagregation Type record
                this.log.trace(`${LOG_PREFIX} Get the first Dissagregation Type record`);
                const dissagregationType: DissagregationType | null = this.dissagregationsTypesDataService.records.length > 0 ? this.dissagregationsTypesDataService.records[0] : null;
                this.log.trace(`${LOG_PREFIX} First Dissagregation Type record = ${JSON.stringify(dissagregationType)}`);

                // Update the global filter
                this.log.trace(`${LOG_PREFIX} Updating the global filter`);
                this.filterService.update({ activeDissagregationType: dissagregationType });

            }

            // Return
            this.log.trace(`${LOG_PREFIX} Returning`);
            callback();

        } else {

            // The active Dissagregation Type has not been set in the global filter
            this.log.trace(`${LOG_PREFIX} The active Dissagregation Type has not been set in the global filter`);

            // Get the first Dissagregation Type record
            this.log.trace(`${LOG_PREFIX} Get the first Dissagregation Type record`);
            const dissagregationType: DissagregationType | null = this.dissagregationsTypesDataService.records.length > 0 ? this.dissagregationsTypesDataService.records[0] : null;
            this.log.trace(`${LOG_PREFIX} First Dissagregation Type record = ${JSON.stringify(dissagregationType)}`);

            // Update the global filter
            this.log.trace(`${LOG_PREFIX} Updating the global filter`);
            this.filterService.update({ activeDissagregationType: dissagregationType });

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

        this.log.trace(`${LOG_PREFIX} Get the Active Dissagregation Type`);
        const activeDissagregationType: DissagregationType | null | undefined = this.filterService.filter.activeDissagregationType;
        this.log.debug(`${LOG_PREFIX} Active Dissagregation Type = ${JSON.stringify(activeDissagregationType)}`);

        // Make a copy of the desired records state
        this.log.trace(`${LOG_PREFIX} Making a copy of the desired records state`);
        let copy: DissagregationState = Object.assign({}, this.stateSubject$.value);

        // Set the active Dissagregation Type as the desired Dissagregation Type
        this.log.trace(`${LOG_PREFIX} Setting the active Dissagregation Type as the desired Dissagregation Type`);
        Object.assign(copy, { typeId: activeDissagregationType && activeDissagregationType.id ? [activeDissagregationType.id] : null });

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

        this.log.trace(`${LOG_PREFIX} Get the Active Dissagregation Type`);
        const activeDissagregationType: DissagregationType | null | undefined = this.filterService.filter.activeDissagregationType;
        this.log.debug(`${LOG_PREFIX} Active Dissagregation Type = ${JSON.stringify(activeDissagregationType)}`);

        // Select the active Dissagregation Type
        this.log.trace(`${LOG_PREFIX} Selecting the active Dissagregation Type`);
        this.dissagregationsForm.get('typeId')?.setValue((activeDissagregationType && activeDissagregationType.id) ? activeDissagregationType.id : null);


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

                        // Retrieve the Dissagregations records corresponding to the passed in state
                        this.log.trace(`${LOG_PREFIX} Retrieving the Dissagregations records corresponding to the passed in state`);
                        this.dissagregationsDataService
                            .getDissagregations(true, state)
                            .pipe(first())
                            .subscribe({
                                next: (s: Dissagregation[]) => {

                                    // Dissagregations records retrieved
                                    this.log.trace(`${LOG_PREFIX} Dissagregations records retrieved`);
                                    this.log.debug(`${LOG_PREFIX} Dissagregations records = ${JSON.stringify(s)}`);

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
            this.dissagregationsDataService.loading$
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
            this.dissagregationsDataService.totalRecords$.subscribe(
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
     * Handles Dissagregation Type change events
     */
    public onDissagregationTypeChange(): void {

        this.log.trace(`${LOG_PREFIX} Entering onDissagregationTypeChange()`);


        // Get the selected Dissagregation Type Id
        this.log.trace(`${LOG_PREFIX} Getting the selected Dissagregation Type Id`);
        const typeId: number | null | undefined = this.dissagregationsForm.get('typeId')?.value
        this.log.debug(`${LOG_PREFIX} Dissagregation Type Id = ${typeId}`);

        // Check if the specified Dissagregation Type is different from the current Dissagregation Type
        this.log.trace(`${LOG_PREFIX} Check if the specified Dissagregation Type is different from the current Dissagregation Type`);

        if (this.stateSubject$.value.typeId != typeId) {

            // The specified Dissagregation Type is different from the current Dissagregation Type
            this.log.trace(`${LOG_PREFIX} The specified Dissagregation Type is different from the current Dissagregation Type`);

            // Update the global filter
            this.log.trace(`${LOG_PREFIX} Updating the global filter`);
            this.filterService.update({ activeDissagregationType: this.dissagregationsTypesDataService.records.find(a => a.id == typeId) });

            // Make a copy of the desired records state
            this.log.trace(`${LOG_PREFIX} Making a copy of the desired records state`);
            let copy: DissagregationState = Object.assign({}, this.stateSubject$.value);

            // Update the copy of the desired records state
            this.log.trace(`${LOG_PREFIX} Updating the copy of the desired records state`);
            Object.assign(copy, { typeId: typeId, page: 1 });

            // Broadcast the newly desired record state
            this.log.trace(`${LOG_PREFIX} Broadcasting the newly desired record state`);
            this.stateSubject$.next(copy);

        } else {

            // The specified Dissagregation Type is not different from the current Dissagregation Type
            this.log.trace(`${LOG_PREFIX} The specified Dissagregation Type is not different from the current Dissagregation Type`);

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
            let copy: DissagregationState = Object.assign({}, this.stateSubject$.value);

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
            let copy: DissagregationState = Object.assign({}, this.stateSubject$.value);

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
            let copy: DissagregationState = Object.assign({}, this.stateSubject$.value);

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
     * Handles Dissagregations Records Addition Requests
     */
    public onAddDissagregation(): void {

        this.log.trace(`${LOG_PREFIX} Entering onAddDissagregation()`);
        const modalRef = this.modalService.open(DissagregationsRecordsCreationModalComponent, { centered: true, backdrop: 'static' });
        modalRef.componentInstance.typeId = this.stateSubject$.value.typeId ? this.stateSubject$.value.typeId : null;
    }

    /**
     * Handles Dissagregations Records Updation Requests
     * @param id The unique identifier of the Dissagregation record to update
     */
    public onUpdateDissagregation(id: number): void {

        this.log.trace(`${LOG_PREFIX} Entering onUpdateDissagregation()`);
        this.log.debug(`${LOG_PREFIX} Dissagregation Record Id = ${id}`);
        const modalRef = this.modalService.open(DissagregationsRecordsUpdationModalComponent, { centered: true, backdrop: 'static' });
        modalRef.componentInstance.id = id;

    }

    /**
     * Handles Dissagregations Records Deletion Requests
     * * @param id The unique identifier of the Dissagregation record to delete
     */
    public onDeleteDissagregation(id: number): void {

        this.log.trace(`${LOG_PREFIX} Entering onDeleteDissagregation()`);
        this.log.debug(`${LOG_PREFIX} Dissagregation Record Id = ${id}`);
        const modalRef = this.modalService.open(DissagregationsRecordsDeletionModalComponent, { centered: true, backdrop: 'static' });
        modalRef.componentInstance.id = id;
    }


    /**
     * Open the url in a new tab
     * @param url 
     */
    onOpenWebsite(url: string) {
        window.open(url, "_blank");
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
