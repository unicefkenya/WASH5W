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
import { FormControl, FormGroup, NonNullableFormBuilder } from '@angular/forms';
import { FilterService } from '@app/app-filter.service';
import { AdministrativeHierarchy, AdministrativeHierarchyState } from '@modules/administrative-hierarchies/models';
import { AdministrativeSystem } from '@modules/administrative-systems/models/administrative-system.model';
import { AdministrativeStructure } from '@modules/administrative-structures/models';
import { OperatorsDataService } from '@modules/operators/services/operators-data.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AssignedAdministrativeUnitsTypesSelectionDataService } from '@modules/administrative-units-types/services/assigned-administrative-units-types-selection-data.service';
import { AssignedAdministrativeSystemsSelectionDataService } from '@modules/administrative-systems/services/assigned-administrative-systems-selection-data.service';
import { AssignedAdministrativeStructuresSelectionDataService } from '@modules/administrative-structures/services/assigned-administrative-structures-selection-data.service';
import { AssignedAdministrativeHierarchiesSelectionDataService } from '@modules/administrative-hierarchies/services/assigned-administrative-hierarchies-selection-data.service';
import { SystemUserRight } from '@modules/systems-users-rights/models/system-user-right.model';

const LOG_PREFIX: string = "[Assigned Administrative Hierarchies Records Selection Component]";

@Component({
    selector: 'sb-assigned-administrative-hierarchies-records-selection',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './assigned-administrative-hierarchies-records-selection.component.html',
    styleUrls: ['assigned-administrative-hierarchies-records-selection.component.scss'],
})
export class AssignedAdministrativeHierarchiesRecordsSelectionComponent implements OnInit, OnDestroy, AfterViewInit {

    // Allows the parent component to inject the desired selection mode: single or multi
    @Input() public selectionMode: string = "single";

    // Allows the parent component to specify whether they are interested in the full hierarchical selection
    @Input() public full: boolean = false;

    // Allows the parent component to inject the ids of the previously selected subsidiary administrative units
    @Input() public selected: number[] = [];

    // Broadcasts radio buttons selection events
    @Output() public select: EventEmitter<any> = new EventEmitter<any>();

    // Broadcasts checkboxes check events
    @Output() public check: EventEmitter<any> = new EventEmitter<any>();

    // Broadcasts checkboxes uncheck events
    @Output() public uncheck: EventEmitter<any> = new EventEmitter<any>();

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
        pageSize: 5,
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
        public administrativeUnitsTypesDataService: AssignedAdministrativeUnitsTypesSelectionDataService,
        public administrativeSystemsDataService: AssignedAdministrativeSystemsSelectionDataService,
        public administrativeStructuresDataService: AssignedAdministrativeStructuresSelectionDataService,
        public administrativeHierarchiesDataService: AssignedAdministrativeHierarchiesSelectionDataService,
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

        // Retrieve and cache all the Administrative Systems records
        this.log.trace(`${LOG_PREFIX} Retrieving and caching all the Administrative Systems records`);
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

                    // Administrative Systems successfully retrieved and cached
                    this.log.debug(`${LOG_PREFIX} ${administrativeSystems.length} Administrative Systems retrieved and cached`);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                },

                error: (err: any) => {

                    // Administrative Systems records retrieval failed
                    this.log.error(`${LOG_PREFIX} Administrative Systems records retrieval failed`);

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

        // Check if the active assigned Administrative System has been set in the global filter
        this.log.trace(`${LOG_PREFIX} Checking if the assigned active Administrative System has been set in the global filter`);
        if (this.filterService.filter.activeAssignedAdministrativeSystem) {

            // The active assigned Administrative System has been set in the global filter
            this.log.trace(`${LOG_PREFIX} The active assigned Administrative System has been set in the global filter`);

            // Check if the active assigned Administrative System record exists in the cache
            this.log.trace(`${LOG_PREFIX} Checking if the active assigned Administrative System record exists in the cache`);
            if (this.administrativeSystemsDataService.records.some(a => a.id == this.filterService.filter.activeAssignedAdministrativeSystem?.id)) {

                // The active assigned Administrative System record exists in the cache
                this.log.trace(`${LOG_PREFIX} The active assigned Administrative System record exists in the cache`);

                // Initialisation is valid
                this.log.trace(`${LOG_PREFIX} Initialisation is valid`);

            } else {

                // Initialisation is invalid
                this.log.trace(`${LOG_PREFIX} Initialisation is invalid`);

                // Get the first assigned Administrative System record
                this.log.trace(`${LOG_PREFIX} Getting the first assigned Administrative System record`);
                const administrativeSystem: AdministrativeSystem | null = this.administrativeSystemsDataService.records.length > 0 ? this.administrativeSystemsDataService.records[0] : null;
                this.log.trace(`${LOG_PREFIX} First assigned Administrative System record = ${JSON.stringify(administrativeSystem)}`);

                // Update the global filter
                this.log.trace(`${LOG_PREFIX} Updating the global filter`);
                this.filterService.update({ activeAssignedAdministrativeSystem: administrativeSystem, activeAssignedAdministrativeStructures: [], activeAssignedAdministrativeHierarchy: null, openedAssignedAdministrativeHierarchies: [] });

            }

            // Return
            this.log.trace(`${LOG_PREFIX} Returning`);
            callback();

        } else {

            // The active assigned Administrative System has not been set in the global filter
            this.log.trace(`${LOG_PREFIX} The active assigned Administrative System has not been set in the global filter`);

            // Get the first assigned Administrative System record
            this.log.trace(`${LOG_PREFIX} Get the first assigned Administrative System record`);
            const administrativeSystem: AdministrativeSystem | null = this.administrativeSystemsDataService.records.length > 0 ? this.administrativeSystemsDataService.records[0] : null;
            this.log.trace(`${LOG_PREFIX} First assigned Administrative System record = ${JSON.stringify(administrativeSystem)}`);

            // Update the global filter
            this.log.trace(`${LOG_PREFIX} Updating the global filter`);
            this.filterService.update({ activeAssignedAdministrativeSystem: administrativeSystem, activeAssignedAdministrativeStructures: [], activeAssignedAdministrativeHierarchy: null, openedAssignedAdministrativeHierarchies: [] });

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
                hierarchyId: this.filterService.filter.activeAssignedAdministrativeSystem?.id,
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
        if (this.filterService.filter.activeAssignedAdministrativeStructures.length == 0) {

            // The active Administrative Structures have not been set in the global filter
            this.log.trace(`${LOG_PREFIX} The active Administrative Structures have not been set in the global filter`);

            // Get the top level Administrative Structures records
            this.log.trace(`${LOG_PREFIX} Get the top level Administrative Structures records`);
            const administrativeStructures: AdministrativeStructure[] = this.administrativeStructuresDataService.records.filter(a => a.data?.commissioner?.id == null);
            this.log.trace(`${LOG_PREFIX} Top level Administrative Structures records = ${JSON.stringify(administrativeStructures)}`);

            // Update the global filter
            this.log.trace(`${LOG_PREFIX} Updating the global filter`);
            this.filterService.update({ activeAssignedAdministrativeStructures: administrativeStructures });

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
        const activeAdministrativeSystem: AdministrativeSystem | null | undefined = this.filterService.filter.activeAssignedAdministrativeSystem;
        this.log.debug(`${LOG_PREFIX} Active Administrative System = ${JSON.stringify(activeAdministrativeSystem)}`);

        // Make a copy of the desired records state
        this.log.trace(`${LOG_PREFIX} Making a copy of the desired records state`);
        let copy: AdministrativeHierarchyState = Object.assign({}, this.stateSubject$.value);

        // Check if the user previously drilled down
        this.log.trace(`${LOG_PREFIX} Checking if the user previously drilled down`);
        if (this.getLastOpenedAdministrativeHierarchyRecord()) {

            // The user previously drilled down
            this.log.trace(`${LOG_PREFIX} The user previously drilled down`);

            // Set id to null
            this.log.trace(`${LOG_PREFIX} Setting id to null`);
            copy.id = null;

            // Set the active Administrative Structures as the desired Administrative Structures
            this.log.trace(`${LOG_PREFIX} Setting the active Administrative Structures as the desired Administrative Structures`);
            const temp: number[] = [];
            for (let administrativeStructure of this.filterService.filter.activeAssignedAdministrativeStructures) {
                if (administrativeStructure.id) {
                    temp.push(administrativeStructure.id);
                }
            }
            copy.typesIds = temp;

            // Set the commissioner id to the id of the responsible party in last opened administrative hierarchy
            this.log.trace(`${LOG_PREFIX} Setting the commissioner id to the id of the responsible party in last opened administrative hierarchy`);
            copy.commissionerId = this.getLastOpenedAdministrativeHierarchyRecord() ? this.getLastOpenedAdministrativeHierarchyRecord()?.data?.responsible?.id : null


        } else {

            // The user hasn't drilled down yet
            this.log.trace(`${LOG_PREFIX} The user hasn't drilled down yet`);

            // Get the user's rights in the active context
            this.log.trace(`${LOG_PREFIX} Getting the user's assigned administrative unit`);
            const right: SystemUserRight | undefined = this.getSystemUserRight();
            this.filterService.filter?.activeSystemUser?.data.rights


            // Return the state to the assigned administrative unit
            this.log.trace(`${LOG_PREFIX} Returning the state to the assigned administrative unit`);
            copy.page = 1;
            copy.pageSize = 5;
            copy.searchTerm = null;
            copy.sortColumn = 'id';
            copy.sortDirection = 'asc';
            copy.typesIds = right?.data.accountabilityType?.id ? [right.data.accountabilityType.id] : null;
            copy.commissionerId = null;
            copy.responsibleId = null;
            copy.responsibleName = null;
            copy.id = right?.data.accountability?.id;

        }

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
        const activeAdministrativeSystem: AdministrativeSystem | null | undefined = this.filterService.filter.activeAssignedAdministrativeSystem;
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
                                    if (this.filterService.filter.activeAssignedAdministrativeHierarchy) {

                                        // The active Administrative Hierarchy has been set
                                        this.log.trace(`${LOG_PREFIX} The active Administrative Hierarchy has been set`);

                                    } else {

                                        // The active Administrative Hierarchy has not been set
                                        this.log.trace(`${LOG_PREFIX} The active Administrative Hierarchy has not been set`);

                                        // Set the first Administrative Hierarchy record as the default active Administrative Hierarchy
                                        this.log.trace(`${LOG_PREFIX} Setting the first Administrative Hierarchy record as the default active Administrative Hierarchy`);
                                        this.filterService.update({ activeAssignedAdministrativeHierarchy: s.length > 0 ? s[0] : null });

                                    }



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
        return this.filterService.filter.openedAssignedAdministrativeHierarchies.length > 0 ?
            this.filterService.filter.openedAssignedAdministrativeHierarchies[this.filterService.filter.openedAssignedAdministrativeHierarchies.length - 1]?.id == administrativeHierarchyId : false
    }

    /**
     * Retrieves the last opened administrative hierarchy record
     * @returns the last opened administrative hierarchy record if any
     */
    public getLastOpenedAdministrativeHierarchyRecord(): AdministrativeHierarchy | null {
        return this.filterService.filter.openedAssignedAdministrativeHierarchies.length > 0 ?
            this.filterService.filter.openedAssignedAdministrativeHierarchies[this.filterService.filter.openedAssignedAdministrativeHierarchies.length - 1] :
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
     * Retrieves the logged in user's rights in the current context
     * @returns the user's right
     */
    private getSystemUserRight(): SystemUserRight | undefined {

        let right: SystemUserRight | undefined = undefined;

        // Check if the active user has been properly set
        this.log.trace(`${LOG_PREFIX} Checking if the active user has been properly set`);
        if (this.filterService.filter.activeSystemUser && this.filterService.filter.activeSystemUser.data.rights) {

            // The active user has been properly set
            this.log.trace(`${LOG_PREFIX} The active user has been properly set`);

            // Check if the active user's rights have been set
            this.log.trace(`${LOG_PREFIX} Checking if the active user's rights have been set`);
            if (this.filterService.filter.activeSystemUser.data.rights.length > 0) {

                // The active user's right have been set
                this.log.trace(`${LOG_PREFIX} The active user's right have been set`);

                // Check if the active context has been set
                this.log.trace(`${LOG_PREFIX} Checking if the active context has been set`);
                if (this.filterService.filter.activeContext) {

                    // The active context has been set
                    this.log.trace(`${LOG_PREFIX} The active context has been set`);

                    // Try retrieving the user's right in the active context
                    this.log.trace(`${LOG_PREFIX} Trying to retrieve the user's right in the active context`);
                    right = this.filterService.filter.activeSystemUser.data.rights.find(r => r.data.context?.id == this.filterService.filter.activeContext?.id);


                }
            }
        }

        // Return the user right
        this.log.trace(`${LOG_PREFIX} Returning the user right`);
        return right;
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

        if (systemId != this.filterService.filter.activeAssignedAdministrativeSystem?.id) {

            // The specified Administrative System is different from the current Administrative System
            this.log.trace(`${LOG_PREFIX} The specified Administrative System is different from the current Administrative System`);

            // Update the global filter
            this.log.trace(`${LOG_PREFIX} Updating the global filter`);
            this.filterService.update({ activeAssignedAdministrativeSystem: this.administrativeSystemsDataService.records.find(a => a.id == systemId), activeAssignedAdministrativeStructures: [], activeAssignedAdministrativeHierarchy: null, openedAssignedAdministrativeHierarchies: [] });

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
     * Handles Administrative Hierarchies Records Drill Down Requests
     * @param administrativeHierarchy The target the Administrative Hierarchy record to drill down to
     */
    onDrillDown(administrativeHierarchy: AdministrativeHierarchy) {

        this.log.trace(`${LOG_PREFIX} Entering onDrillDown()`);
        this.log.debug(`${LOG_PREFIX} Administrative Hierarchy Record = ${JSON.stringify(administrativeHierarchy)}`);

        // Update the global filter
        this.log.trace(`${LOG_PREFIX} Updating the global filter`);
        this.filterService.update({
            openedAssignedAdministrativeHierarchies: Object.assign([], this.filterService.filter.openedAssignedAdministrativeHierarchies.concat([administrativeHierarchy])),
            activeAssignedAdministrativeStructures: this.getSubsidiaryAdministrativeStructures(administrativeHierarchy.data.type?.id)
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
            const index: number = this.filterService.filter.openedAssignedAdministrativeHierarchies.findIndex(o => o.id == administrativeHierarchy.id);

            this.filterService.update({
                openedAssignedAdministrativeHierarchies: Object.assign([], this.filterService.filter.openedAssignedAdministrativeHierarchies.slice(0, index + 1)),
                activeAssignedAdministrativeStructures: this.getSubsidiaryAdministrativeStructures(administrativeHierarchy.data.type?.id)
            });

        } else {
            this.filterService.update({
                openedAssignedAdministrativeHierarchies: [],
                activeAssignedAdministrativeStructures: this.administrativeStructuresDataService.records.filter(a => a.data?.commissioner?.id == null)
            });
        }

        // Set the default active Administrative Structures ids as the typesIds in the desired records state
        this.initialiseDesiredRecordsState(() => {

        });

    }

    /** 
    * Handles Administrative Hierarchy Selection Events
    * @param administrativeHierarchy The Selected Administrative Hierarchy
    */
    onSelect(administrativeHierarchy: AdministrativeHierarchy) {

        this.log.trace(`${LOG_PREFIX} Entering onSelect()`);
        this.log.debug(`${LOG_PREFIX} Selected Administrative Hierarchy = ${JSON.stringify(administrativeHierarchy)}`);

        // Check whether the user is interested in the full hierarchy
        this.log.trace(`${LOG_PREFIX} Checking whether the user is interested in the full hierarchy`);

        if (this.full) {

            // The user is interested in the full hierarchy
            this.log.trace(`${LOG_PREFIX} The user is interested in the full hierarchy`);

            // Get the currently selected Administrative Hierarchy's predecessors
            this.log.trace(`${LOG_PREFIX} Getting the currently selected Administrative Hierarchy's predecessors`);
            const predecessors: AdministrativeHierarchy[] = Object.assign([], this.filterService.filter.openedAssignedAdministrativeHierarchies);

            // Broadcast the currently selected Administrative Hierarchy together with its predecessors - immediate predecessor first
            this.log.trace(`${LOG_PREFIX} Broadcasting the currently selected Administrative Hierarchy together with its predecessors - immediate predecessor first`);

            this.select.emit([administrativeHierarchy].concat(predecessors.reverse()));



        } else {

            // The user is not interested in the full hierarchy
            this.log.trace(`${LOG_PREFIX} The user is not interested in the full hierarchy`);

            // Broadcast the currently selected Administrative Hierarchy
            this.log.trace(`${LOG_PREFIX} Broadcasting the currently selected Administrative Hierarchy`);

            this.select.emit(administrativeHierarchy);

        }



    }


    /** 
    * Handles Administrative Hierarchies Checkboxes Check Events
    * @param administrativeHierarchy The Checked Administrative Hierarchy
    */
    onCheck(administrativeHierarchy: AdministrativeHierarchy) {

        this.log.trace(`${LOG_PREFIX} Entering onCheck()`);
        this.log.debug(`${LOG_PREFIX} Checked Administrative Hierarchy = ${JSON.stringify(administrativeHierarchy)}`);

        // Check whether the user is interested in the full hierarchy
        this.log.trace(`${LOG_PREFIX} Checking whether the user is interested in the full hierarchy`);

        if (this.full) {

            // The user is interested in the full hierarchy
            this.log.trace(`${LOG_PREFIX} The user is interested in the full hierarchy`);

            // Get the currently checked Administrative Hierarchy's predecessors
            this.log.trace(`${LOG_PREFIX} Getting the currently selected Administrative Hierarchy's predecessors`);
            const predecessors: AdministrativeHierarchy[] = Object.assign([], this.filterService.filter.openedAssignedAdministrativeHierarchies);

            // Broadcast the currently checked Administrative Hierarchy together with its predecessors - immediate predecessor first
            this.log.trace(`${LOG_PREFIX} Broadcasting the currently selected Administrative Hierarchy together with its predecessors - immediate predecessor first`);

            this.select.emit([administrativeHierarchy].concat(predecessors.reverse()));



        } else {

            // The user is not interested in the full hierarchy
            this.log.trace(`${LOG_PREFIX} The user is not interested in the full hierarchy`);

            // Broadcast the currently checked Administrative Hierarchy
            this.log.trace(`${LOG_PREFIX} Broadcasting the currently selected Administrative Hierarchy`);

            this.check.emit(administrativeHierarchy);

        }

    }


    /** 
    * Handles Administrative Hierarchies Checkboxes Uncheck Events
    * @param administrativeHierarchy The Unchecked Administrative Hierarchy
    */
    onUncheck(administrativeHierarchy: AdministrativeHierarchy) {

        this.log.trace(`${LOG_PREFIX} Entering onUncheck()`);
        this.log.debug(`${LOG_PREFIX} Unchecked Administrative Hierarchy = ${JSON.stringify(administrativeHierarchy)}`);

        // Check whether the user is interested in the full hierarchy
        this.log.trace(`${LOG_PREFIX} Checking whether the user is interested in the full hierarchy`);

        if (this.full) {

            // The user is interested in the full hierarchy
            this.log.trace(`${LOG_PREFIX} The user is interested in the full hierarchy`);

            // Get the currently unchecked Administrative Hierarchy's predecessors
            this.log.trace(`${LOG_PREFIX} Getting the currently selected Administrative Hierarchy's predecessors`);
            const predecessors: AdministrativeHierarchy[] = Object.assign([], this.filterService.filter.openedAssignedAdministrativeHierarchies);

            // Broadcast the currently unchecked Administrative Hierarchy together with its predecessors - immediate predecessor first
            this.log.trace(`${LOG_PREFIX} Broadcasting the currently selected Administrative Hierarchy together with its predecessors - immediate predecessor first`);

            this.select.emit([administrativeHierarchy].concat(predecessors.reverse()));

        } else {

            // The user is not interested in the full hierarchy
            this.log.trace(`${LOG_PREFIX} The user is not interested in the full hierarchy`);

            // Broadcast the currently unchecked Administrative Hierarchy
            this.log.trace(`${LOG_PREFIX} Broadcasting the currently selected Administrative Hierarchy`);

            this.uncheck.emit(administrativeHierarchy);

        }

    }

    /**
     * Checks whether an Administrative Hierarchy record is currently selected
     * @param administrativeHierarchy The target Administrative Hierarchy
     * @returns True or false depending on whether the Administrative Hierarchy is currently selected or not respectively
     */
    isSelected(administrativeHierarchy: AdministrativeHierarchy): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isSelected()`);
        this.log.debug(`${LOG_PREFIX} Target Administrative Hierarchy = ${JSON.stringify(administrativeHierarchy)}`);

        // Check whether the Administrative Hierarchy is currently selected
        this.log.trace(`${LOG_PREFIX} Checking whether the Administrative Hierarchy is currently selected`);
        const selected: boolean = this.selected.some(id => id == administrativeHierarchy.data?.responsible?.id);
        this.log.debug(`${LOG_PREFIX} Selected = ${selected}`);

        return selected;
    }


    /**
     * Checks whether an Administrative Hierarchy record is currently checked
     * @param administrativeHierarchy The target Administrative Hierarchy
     * @returns True or false depending on whether the Administrative Hierarchy is currently checked or not respectively
     */
    isChecked(administrativeHierarchy: AdministrativeHierarchy): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isChecked()`);
        this.log.debug(`${LOG_PREFIX} Target Administrative Hierarchy = ${JSON.stringify(administrativeHierarchy)}`);

        // Check whether the Administrative Hierarchy is currently checked
        this.log.trace(`${LOG_PREFIX} Checking whether the Administrative Hierarchy is currently checked`);
        const checked: boolean = this.selected.some(id => id == administrativeHierarchy.data?.responsible?.id);
        this.log.debug(`${LOG_PREFIX} Checked = ${checked}`);

        return checked;
    }



}
