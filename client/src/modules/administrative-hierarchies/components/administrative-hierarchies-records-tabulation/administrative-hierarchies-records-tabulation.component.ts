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
import { AdministrativeHierarchiesDataService } from '@modules/administrative-hierarchies/services/administrative-hierarchies-data.service';
import { FormControl, FormGroup } from '@angular/forms';
import { AdministrativeSystemsDataService } from '@modules/administrative-systems/services/administrative-systems-data.service';
import { AdministrativeSystem } from '@modules/administrative-systems/models';
import { FilterService } from '@app/app-filter.service';
import { AdministrativeHierarchy } from '@modules/administrative-hierarchies/models/administrative-hierarchy.model';
import { AdministrativeHierarchyState } from '@modules/administrative-hierarchies/models/administrative-hierarchy-state.model';
import { OperatorsDataService } from '@modules/operators/services/operators-data.service';
import { AdministrativeUnitsTypesDataService } from '@modules/administrative-units-types/services/administrative-units-types-data.service';
import { AdministrativeStructuresDataService } from '@modules/administrative-structures/services/administrative-structures-data.service';
import { AdministrativeStructure } from '@modules/administrative-structures/models/administrative-structure.model';
import { AdministrativeHierarchiesRecordsCreationModalComponent } from '@modules/administrative-hierarchies/containers/administrative-hierarchies-records-creation-modal/administrative-hierarchies-records-creation-modal.component';
import { AdministrativeHierarchiesRecordsDeletionModalComponent } from '@modules/administrative-hierarchies/containers/administrative-hierarchies-records-deletion-modal/administrative-hierarchies-records-deletion-modal.component';

const LOG_PREFIX: string = "[Administrative Hierarchies Records Tabulation Component]";

@Component({
    selector: 'sb-administrative-hierarchies-records-tabulation',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './administrative-hierarchies-records-tabulation.component.html',
    styleUrls: ['administrative-hierarchies-records-tabulation.component.scss'],
})
export class AdministrativeHierarchiesRecordsTabulationComponent implements OnInit, OnDestroy, AfterViewInit {

    // Keeps a local reference to the displayed loading animation component.
    // Makes it possible to trigger the loading animation when a slow background service is invoked.
    private _animation!: LoadingAnimationComponent;

    // Keeps a local reference to the displayed pagination component.
    // Makes it possible to initialise / update the pagination component when the total number of records changes.
    private _pagination!: PaginationComponent;

    // Holds the required records state
    // Makes it possible to supply the filter, sort or search criteria that should be applied to records on retrieval.
    private stateSubject$ = new BehaviorSubject<AdministrativeHierarchyState>({
        page: 1,
        pageSize: 20,
        searchTerm: null,
        sortColumn: 'id',
        sortDirection: 'asc',
        typesIds: null,
        commissionerId: null,
        commissionerName: null,
        responsibleId: null,
        responsibleName: null,
        id: null
    });
    readonly state$ = this.stateSubject$.asObservable();

    // Keeps tabs on the records skipped due to pagination
    paginationOffset: number = 0;

    // Keeps tabs of whether the component has been successfully initialised
    public initialised: boolean = false;

    // Instantitate a new reactive Form Group
    // This will allow us to define and enforce the validation rules for all the form controls.
    administrativeHierarchiesForm = new FormGroup({
        systemId: new FormControl<number | null>(null, [
        ]),
    });

    // Central gathering point for all the component's subscriptions.
    // Makes it efficient to unsubscribe from all subscriptions when the component is destroyed.   
    private _subscriptions: Subscription[] = [];

    constructor(
        private cd: ChangeDetectorRef,
        public administrativeUnitsTypesDataService: AdministrativeUnitsTypesDataService,
        public administrativeSystemsDataService: AdministrativeSystemsDataService,
        public administrativeStructuresDataService: AdministrativeStructuresDataService,
        public administrativeHierarchiesDataService: AdministrativeHierarchiesDataService,
        public operatorsDataService: OperatorsDataService,
        public filterService: FilterService,
        private modalService: NgbModal,
        private log: NGXLogger) {

    }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

        // Retrieve and cache Administrative Systems locally
        this.initialiseAdministrativeSystems(() => {

            // Set the default active Administrative System if not set
            this.initialiseActiveAdministrativeSystem(() => {

                // Retrieve and cache Administrative Structures locally
                this.initialiseAdministrativeStructures(() => {

                    // Set the default active Administrative Structures if not set
                    this.initialiseActiveAdministrativeStructures(() => {

                        // Set the default active Administrative Structures ids as the typesIds in the desired records state
                        this.initialiseDesiredRecordsState(() => {

                            // Preselect the active Administrative System in the data tabulation form
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
     * Retrieves and caches Administrative Systems records
     * @param callback The function to call when done
     */
    private initialiseAdministrativeSystems(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseAdministrativeSystems()`);

        // Retrieve and cache all the Administrative Structures records
        this.log.trace(`${LOG_PREFIX} Retrieving and caching all the Administrative Structures records`);
        this.administrativeSystemsDataService
            .getAdministrativeSystems(true, {
                searchTerm: null,
                page: null,
                pageSize: null,
                sortColumn: 'name',
                sortDirection: 'asc',
                name: null,
                id: null
            })
            .pipe(first()) // This will automatically complete (and therefore unsubscribe) after the first value has been emitted.
            .subscribe({
                next: (administrativeSystems: AdministrativeSystem[]) => {

                    // Administrative Structures successfully retrieved and cached
                    this.log.debug(`${LOG_PREFIX} ${administrativeSystems.length} Administrative Structures retrieved and cached`);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                },

                error: (err: any) => {

                    // Administrative Structures retrieval failed
                    this.log.error(`${LOG_PREFIX} Administrative Structures retrieval failed`);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                }
            });

    }



    /**
     * Sets the active Administrative System if it has not been set in the global filter
     * @param callback The function to call when done
     */
    private initialiseActiveAdministrativeSystem(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseActiveAdministrativeSystem()`);

        // Check if the active Administrative System has been set in the global filter
        this.log.trace(`${LOG_PREFIX} Checking if the active Administrative System has been set in the global filter`);
        if (this.filterService.filter.activeAdministrativeSystem) {

            // The active Administrative System has been set in the global filter
            this.log.trace(`${LOG_PREFIX} The active Administrative System has been set in the global filter`);

            // Check if the active Administrative System record exists in the cache
            this.log.trace(`${LOG_PREFIX} Checking if the active Administrative System record exists in the cache`);
            if (this.administrativeSystemsDataService.records.some(a => a.id == this.filterService.filter.activeAdministrativeSystem?.id)) {

                // The active Administrative System record exists in the cache
                this.log.trace(`${LOG_PREFIX} The active Administrative System record exists in the cache`);

                // Initialisation is valid
                this.log.trace(`${LOG_PREFIX} Initialisation is valid`);

            } else {

                // Initialisation is invalid
                this.log.trace(`${LOG_PREFIX} Initialisation is invalid`);

                // Get the first Administrative System record
                this.log.trace(`${LOG_PREFIX} Get the first Administrative System record`);
                const administrativeSystem: AdministrativeSystem | null = this.administrativeSystemsDataService.records.length > 0 ? this.administrativeSystemsDataService.records[0] : null;
                this.log.trace(`${LOG_PREFIX} First Administrative System record = ${JSON.stringify(administrativeSystem)}`);

                // Update the global filter
                this.log.trace(`${LOG_PREFIX} Updating the global filter`);
                this.filterService.update({ activeAdministrativeSystem: administrativeSystem, activeAdministrativeStructures: [], activeAdministrativeHierarchy: null, openedAdministrativeHierarchies: [] });

            }

            // Return
            this.log.trace(`${LOG_PREFIX} Returning`);
            callback();

        } else {

            // The active Administrative System has not been set in the global filter
            this.log.trace(`${LOG_PREFIX} The active Administrative System has not been set in the global filter`);

            // Get the first Administrative System record
            this.log.trace(`${LOG_PREFIX} Get the first Administrative System record`);
            const administrativeSystem: AdministrativeSystem | null = this.administrativeSystemsDataService.records.length > 0 ? this.administrativeSystemsDataService.records[0] : null;
            this.log.trace(`${LOG_PREFIX} First Administrative System record = ${JSON.stringify(administrativeSystem)}`);

            // Update the global filter
            this.log.trace(`${LOG_PREFIX} Updating the global filter`);
            this.filterService.update({ activeAdministrativeSystem: administrativeSystem, activeAdministrativeStructures: [], activeAdministrativeHierarchy: null, openedAdministrativeHierarchies: [] });

            // Return
            this.log.trace(`${LOG_PREFIX} Returning`);
            callback();

        }
    }


    /**
     * Retrieves and caches Administrative Structures records
     * @param callback The function to call when done
     */
    private initialiseAdministrativeStructures(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseAdministrativeStructures()`);

        // Retrieve and cache all the Administrative Structures records
        this.log.trace(`${LOG_PREFIX} Retrieving and caching all the Administrative Structures records`);
        this.administrativeStructuresDataService
            .getAdministrativeStructures(true, {
                searchTerm: null,
                page: null,
                pageSize: null,
                sortColumn: 'id',
                sortDirection: 'asc',
                hierarchyId: this.filterService.filter.activeAdministrativeSystem?.id,
                hierarchyName: null,
                commissionerId: null,
                commissionerName: null,
                responsibleId: null,
                responsibleName: null
            })
            .pipe(first()) // This will automatically complete (and therefore unsubscribe) after the first value has been emitted.
            .subscribe({
                next: (administrativeStructures: AdministrativeStructure[]) => {

                    // Administrative Structures successfully retrieved and cached
                    this.log.debug(`${LOG_PREFIX} ${administrativeStructures.length} Administrative Structures retrieved and cached`);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                },

                error: (err: any) => {

                    // Administrative Structures retrieval failed
                    this.log.error(`${LOG_PREFIX} Administrative Structures retrieval failed`);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                }
            });

    }




    /**
     * Sets the active Administrative Structures if they have not been set in the global filter
     * @param callback The function to call when done
     */
    private initialiseActiveAdministrativeStructures(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseActiveAdministrativeStructures()`);

        // Check if the active Administrative Structures have been set in the global filter
        this.log.trace(`${LOG_PREFIX} Checking if the active Administrative Structures have been set in the global filter`);
        if (this.filterService.filter.activeAdministrativeStructures.length == 0) {

            // The active Administrative Structures have not been set in the global filter
            this.log.trace(`${LOG_PREFIX} The active Administrative Structures have not been set in the global filter`);

            // Get the top level Administrative Structures records
            this.log.trace(`${LOG_PREFIX} Get the top level Administrative Structures records`);
            const administrativeStructures: AdministrativeStructure[] = this.administrativeStructuresDataService.records.filter(a => a.data?.commissioner?.id == null);
            this.log.trace(`${LOG_PREFIX} Top level Administrative Structures records = ${JSON.stringify(administrativeStructures)}`);

            // Update the global filter
            this.log.trace(`${LOG_PREFIX} Updating the global filter`);
            this.filterService.update({ activeAdministrativeStructures: administrativeStructures });

        } else {

            // The active Administrative Structures have been set in the global filter
            this.log.trace(`${LOG_PREFIX} The active Administrative Structures have been set in the global filter`);

        }

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

        this.log.trace(`${LOG_PREFIX} Get the Active Administrative System`);
        const activeAdministrativeSystem: AdministrativeSystem | null | undefined = this.filterService.filter.activeAdministrativeSystem;
        this.log.debug(`${LOG_PREFIX} Active Administrative System = ${JSON.stringify(activeAdministrativeSystem)}`);

        // Make a copy of the desired records state
        this.log.trace(`${LOG_PREFIX} Making a copy of the desired records state`);
        let copy: AdministrativeHierarchyState = Object.assign({}, this.stateSubject$.value);

        // Set the active Administrative Structures as the desired Administrative Structures
        this.log.trace(`${LOG_PREFIX} Setting the active Administrative Structures as the desired Administrative Structures`);
        const temp: number[] = [];
        for (let administrativeStructure of this.filterService.filter.activeAdministrativeStructures) {
            if (administrativeStructure.id) {
                temp.push(administrativeStructure.id);
            }
        }
        copy.typesIds = temp;
        copy.commissionerId = this.getLastOpenedAdministrativeHierarchyRecord() ? this.getLastOpenedAdministrativeHierarchyRecord()?.data?.responsible?.id : null

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

        this.log.trace(`${LOG_PREFIX} Get the Active Administrative System`);
        const activeAdministrativeSystem: AdministrativeSystem | null | undefined = this.filterService.filter.activeAdministrativeSystem;
        this.log.debug(`${LOG_PREFIX} Active Administrative System = ${JSON.stringify(activeAdministrativeSystem)}`);

        // Select the active Administrative System
        this.log.trace(`${LOG_PREFIX} Selecting the active Administrative System`);
        this.administrativeHierarchiesForm.get('systemId')?.setValue((activeAdministrativeSystem && activeAdministrativeSystem.id) ? activeAdministrativeSystem.id : null);


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

                        // Retrieve the Administrative Hierarchies records corresponding to the passed in state
                        this.log.trace(`${LOG_PREFIX} Retrieving the Administrative Hierarchies records corresponding to the passed in state`);
                        this.administrativeHierarchiesDataService
                            .getAdministrativeHierarchies(true, state)
                            .pipe(first())
                            .subscribe({
                                next: (s: AdministrativeHierarchy[]) => {

                                    // Administrative Hierarchies records retrieved
                                    this.log.trace(`${LOG_PREFIX} Administrative Hierarchies records retrieved`);
                                    this.log.debug(`${LOG_PREFIX} Administrative Hierarchies records = ${JSON.stringify(s)}`);

                                    // Check if the active Administrative Hierarchy has been set
                                    this.log.trace(`${LOG_PREFIX} Check if the active Administrative Hierarchy has been set`);
                                    if (this.filterService.filter.activeAdministrativeHierarchy) {

                                        // The active Administrative Hierarchy has been set
                                        this.log.trace(`${LOG_PREFIX} The active Administrative Hierarchy has been set`);

                                    } else {

                                        // The active Administrative Hierarchy has not been set
                                        this.log.trace(`${LOG_PREFIX} The active Administrative Hierarchy has not been set`);

                                        // Set the first Administrative Hierarchy record as the default active Administrative Hierarchy
                                        this.log.trace(`${LOG_PREFIX} Setting the first Administrative Hierarchy record as the default active Administrative Hierarchy`);
                                        this.filterService.update({ activeAdministrativeHierarchy: s.length > 0 ? s[0] : null });

                                    }



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
            this.administrativeHierarchiesDataService.loading$
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
            this.administrativeHierarchiesDataService.totalRecords$.subscribe(
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
     * Retrieves the administrative structure that has the passed in type as a responsible
     * @param administrativeUnitTypeId The target commissioner
     * @returns the parent administrative structure
     */
    public getParentAdministrativeStructure(administrativeUnitTypeId: number): AdministrativeStructure[] {

        this.log.trace(`${LOG_PREFIX} Entering getSubsidiaryAdministrativeStructures()`);

        return this.administrativeStructuresDataService.records.filter(a => a.data?.commissioner?.id == administrativeUnitTypeId);

    }


    /**
     * Retrieves all the administrative structures that have have the passed in type as a commissioner
     * @param administrativestructureId The target administrative structure
     * @returns the subsidiary administrative structures
     */
    public getSubsidiaryAdministrativeStructures(administrativestructureId: number | null | undefined): AdministrativeStructure[] {

        this.log.trace(`${LOG_PREFIX} Entering getSubsidiaryAdministrativeStructures()`);

        // Retrieve the administrative structure with the specified id
        this.log.trace(`${LOG_PREFIX} Retrieving the administrative structure with the specified id`);
        const administrativeStructure: AdministrativeStructure | undefined = this.administrativeStructuresDataService.records.find(a => a.id == administrativestructureId);

        // Check if the admininistrative structure was successfully retrieved
        this.log.trace(`${LOG_PREFIX} Checking if the admininistrative structure was successfully retrieved`);
        if (administrativeStructure) {

            // The admininistrative structure was successfully retrieved
            this.log.trace(`${LOG_PREFIX} The admininistrative structure was successfully retrieved`);

            // Return the administrative structure's subsidiaries
            this.log.warn(`${LOG_PREFIX} Returning the administrative structure's subsidiaries`);
            return this.administrativeStructuresDataService.records.filter(a => a.data?.commissioner?.id == administrativeStructure.data?.responsible?.id);

        } else {

            // The admininistrative structure was not successfully retrieved
            this.log.warn(`${LOG_PREFIX} The admininistrative structure was not successfully retrieved`);

            // Return an empty list
            this.log.warn(`${LOG_PREFIX} Returning an empty list`);
            return [];


        }



    }


    /**
     * Check if an administrative hierarchy record was the last one opened
     * @param administrativeHierarchyId The target administrative hierarchy record
     * @returns true or false
     */
    public isLastSelected(administrativeHierarchyId: number): boolean {
        return this.filterService.filter.openedAdministrativeHierarchies.length > 0 ?
            this.filterService.filter.openedAdministrativeHierarchies[this.filterService.filter.openedAdministrativeHierarchies.length - 1]?.id == administrativeHierarchyId : false
    }

    /**
     * Retrieves the last opened administrative hierarchy record
     * @returns the last opened administrative hierarchy record if any
     */
    public getLastOpenedAdministrativeHierarchyRecord(): AdministrativeHierarchy | null {
        return this.filterService.filter.openedAdministrativeHierarchies.length > 0 ?
            this.filterService.filter.openedAdministrativeHierarchies[this.filterService.filter.openedAdministrativeHierarchies.length - 1] :
            null;
    }

    /**
     * Creates a commissioner entity given an administrative hierarchy
     * @param activeAdministrativeHierarchy the target administrative hierarchy
     * @returns the commissioner entity
     */
    private getCommissioner(activeAdministrativeHierarchy: AdministrativeHierarchy | null): { id: number | null | undefined; name: string | null | undefined; } | null | undefined {

        // Check if the Administrative Hierarchy was successfully retrieved
        this.log.trace(`${LOG_PREFIX} Checking if the Administrative Hierarchy was successfully retrieved`);
        if (activeAdministrativeHierarchy) {

            // The Administrative Hierarchy was successfully retrieved
            this.log.trace(`${LOG_PREFIX} The Administrative Hierarchy was successfully retrieved`);

            // Return the Administrative Hierarchy's Responsible as the commissioner
            this.log.trace(`${LOG_PREFIX} Returning the Administrative Hierarchy's Responsible as the commissioner`);
            return {
                id: activeAdministrativeHierarchy.data.responsible?.id,
                name: activeAdministrativeHierarchy.data.responsible?.name
            }

        } else {

            // Return null as the commissioner
            this.log.trace(`${LOG_PREFIX} Returning null as the commissioner`);
            return null;
        }

    }


    /**
     * Handles Administrative System change events
     */
    public onAdministrativeSystemChange(): void {

        this.log.trace(`${LOG_PREFIX} Entering onAdministrativeSystemChange()`);


        // Get the selected Administrative System Id
        this.log.trace(`${LOG_PREFIX} Getting the selected Administrative System Id`);
        const systemId: number | null | undefined = this.administrativeHierarchiesForm.get('systemId')?.value
        this.log.debug(`${LOG_PREFIX} Administrative System Id = ${systemId}`);

        // Check if the specified Administrative System is different from the current active Administrative System
        this.log.trace(`${LOG_PREFIX} Check if the specified Administrative System is different from the current active Administrative System`);

        if (systemId != this.filterService.filter.activeAdministrativeSystem?.id) {

            // The specified Administrative System is different from the current Administrative System
            this.log.trace(`${LOG_PREFIX} The specified Administrative System is different from the current Administrative System`);

            // Update the global filter
            this.log.trace(`${LOG_PREFIX} Updating the global filter`);
            this.filterService.update({ activeAdministrativeSystem: this.administrativeSystemsDataService.records.find(a => a.id == systemId), activeAdministrativeStructures: [], activeAdministrativeHierarchy: null, openedAdministrativeHierarchies: [] });

            // Retrieve and cache the corresponding Administrative Structures locally
            this.initialiseAdministrativeStructures(() => {

                // Set the default active Administrative Structures if not set
                this.initialiseActiveAdministrativeStructures(() => {

                    // Set the default active Administrative Structures ids as the typesIds in the desired records state
                    this.initialiseDesiredRecordsState(() => {

                    });

                });



            });

        } else {

            // The specified Administrative System is not different from the current Administrative System
            this.log.trace(`${LOG_PREFIX} The specified Administrative System is not different from the current Administrative System`);

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
            let copy: AdministrativeHierarchyState = Object.assign({}, this.stateSubject$.value);

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
            let copy: AdministrativeHierarchyState = Object.assign({}, this.stateSubject$.value);

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
            let copy: AdministrativeHierarchyState = Object.assign({}, this.stateSubject$.value);

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
     * Handles Administrative Hierarchies Records Addition Requests
     */
    public onAddAdministrativeHierarchy(): void {

        this.log.trace(`${LOG_PREFIX} Entering onAddAdministrativeHierarchy()`);

        // Retrieve the last opened Administrative Hierarchy
        this.log.trace(`${LOG_PREFIX} Retrieving the last opened Administrative Hierarchy`);
        const activeAdministrativeHierarchy: AdministrativeHierarchy | null = this.getLastOpenedAdministrativeHierarchyRecord();

        // Pop up the hierarchical level addition window
        this.log.trace(`${LOG_PREFIX} Popping up the hierarchical level addition window`);
        const modalRef = this.modalService.open(AdministrativeHierarchiesRecordsCreationModalComponent, { centered: true, backdrop: 'static' });
        modalRef.componentInstance.system = this.filterService.filter.activeAdministrativeSystem;
        modalRef.componentInstance.commissioner = this.getCommissioner(activeAdministrativeHierarchy);
        modalRef.componentInstance.structures = activeAdministrativeHierarchy ? this.getSubsidiaryAdministrativeStructures(activeAdministrativeHierarchy.data.type?.id) :
            this.administrativeStructuresDataService.records.filter(a => a.data?.commissioner?.id == null);

    }


    /**
     * Handles Administrative Hierarchies Records Deletion Requests
     * @param id The unique identifier of the Administrative Hierarchy record to delete
     */
    public onDeleteAdministrativeHierarchy(id: number): void {

        this.log.trace(`${LOG_PREFIX} Entering onDeleteAdministrativeHierarchy()`);
        this.log.debug(`${LOG_PREFIX} Administrative Hierarchy Record Id = ${id}`);
        const modalRef = this.modalService.open(AdministrativeHierarchiesRecordsDeletionModalComponent, { centered: true, backdrop: 'static' });
        modalRef.componentInstance.id = id;
    }


    /**
     * Handles Administrative Hierarchies Records Drill Down Requests
     * @param administrativeHierarchy The target the Administrative Hierarchy record to drill down to
     */
    onDrillDown(administrativeHierarchy: AdministrativeHierarchy) {

        this.log.trace(`${LOG_PREFIX} Entering onDrillDown()`);
        this.log.debug(`${LOG_PREFIX} Administrative Hierarchy Record = ${JSON.stringify(administrativeHierarchy)}`);

        // Update the global filter
        this.log.trace(`${LOG_PREFIX} Updating the global filter`);
        this.filterService.update({
            openedAdministrativeHierarchies: Object.assign([], this.filterService.filter.openedAdministrativeHierarchies.concat([administrativeHierarchy])),
            activeAdministrativeStructures: this.getSubsidiaryAdministrativeStructures(administrativeHierarchy.data.type?.id)
        });

        // Set the default active Administrative Structures ids as the typesIds in the desired records state
        this.initialiseDesiredRecordsState(() => {

        });

    }


    /**
     * Handles Administrative Hierarchies Records Drill Up Requests
     * @param administrativeHierarchy The target the Administrative Hierarchy record to drill up to
     */
    onDrillUp(administrativeHierarchy: AdministrativeHierarchy | null) {

        this.log.trace(`${LOG_PREFIX} Entering onDrillDown()`);
        this.log.debug(`${LOG_PREFIX} Administrative Hierarchy Record = ${JSON.stringify(administrativeHierarchy)}`);


        // Update the global filter
        this.log.trace(`${LOG_PREFIX} Updating the global filter`);
        if (administrativeHierarchy) {

            // Get the index of the administrative hierarchy in the opened admin hierarchies
            const index: number = this.filterService.filter.openedAdministrativeHierarchies.findIndex(o => o.id == administrativeHierarchy.id);

            this.filterService.update({
                openedAdministrativeHierarchies: Object.assign([], this.filterService.filter.openedAdministrativeHierarchies.slice(0, index + 1)),
                activeAdministrativeStructures: this.getSubsidiaryAdministrativeStructures(administrativeHierarchy.data.type?.id)
            });

        } else {
            this.filterService.update({
                openedAdministrativeHierarchies: [],
                activeAdministrativeStructures: this.administrativeStructuresDataService.records.filter(a => a.data?.commissioner?.id == null)
            });
        }

        // Set the default active Administrative Structures ids as the typesIds in the desired records state
        this.initialiseDesiredRecordsState(() => {

        });

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
