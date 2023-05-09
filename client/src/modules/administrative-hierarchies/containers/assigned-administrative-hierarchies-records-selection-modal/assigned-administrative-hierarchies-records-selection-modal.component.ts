import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { FilterService } from '@app/app-filter.service';
import { AdministrativeHierarchy } from '@modules/administrative-hierarchies/models/administrative-hierarchy.model';
import { AdministrativeUnitType } from '@modules/administrative-units-types/models/administrative-unit-type.model';
import { AdministrativeUnitsTypesDataService } from '@modules/administrative-units-types/services/administrative-units-types-data.service';
import { AdministrativeUnit } from '@modules/administrative-units/models/administrative-unit.model';
import { AdministrativeUnitsDataService } from '@modules/administrative-units/services/administrative-units-data.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NGXLogger } from 'ngx-logger';
import { Observable, map, of, BehaviorSubject } from 'rxjs';

const LOG_PREFIX: string = "[Assigned Administrative Hierarchies Records Selection Modal]";

@Component({
    selector: 'sb-assigned-administrative-hierarchies-records-selection-modal',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './assigned-administrative-hierarchies-records-selection-modal.component.html',
    styleUrls: ['assigned-administrative-hierarchies-records-selection-modal.component.scss'],
})
export class AssignedAdministrativeHierarchiesRecordsSelectionModalComponent implements OnInit {


    // Allows the parent component to inject the desired selection mode: single or multi
    @Input() public selectionMode: string = "single";

    // Allows the parent component to specify whether they are interested in the full hierarchical selection
    @Input() public full: boolean = true;    

    // Allows the parent component to inject the ids of the previously selected subsidiary administrative units
    @Input() public selected: number[] = [];

    // Propagates radio buttons selection events
    @Output() public select: EventEmitter<any> = new EventEmitter<any>();

    // Propagates checkboxes check events
    @Output() public check: EventEmitter<any> = new EventEmitter<any>();

    // Propagates checkboxes uncheck events
    @Output() public uncheck: EventEmitter<any> = new EventEmitter<any>();

    // Keeps tab of the page title
    public title: string = "Select Administrative Unit Record";

    constructor(
        public administrativeUnitsDataService: AdministrativeUnitsDataService,
        public administrativeUnitsTypesDataService: AdministrativeUnitsTypesDataService,
        public filterService: FilterService,
        public activeContextsModal: NgbActiveModal,
        private log: NGXLogger) { }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);
    }


    @HostListener('window:beforeunload')
    ngOnDestroy() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

    }

    /** 
    * Propagates Administrative Hierarchy Selection Events
    * @param result The Selected Administrative Hierarchy or Hierarchies
    */
    onSelect(result: any) {

        this.log.trace(`${LOG_PREFIX} Entering onSelect()`);

        // Get the selected Administrative Hierarchy
        this.log.trace(`${LOG_PREFIX} Getting the selected Administrative Hierarchy`);
        const administrativeHierarchy: AdministrativeHierarchy = this.full? result[0] : result;
        this.log.debug(`${LOG_PREFIX} Selected Administrative Hierarchy = ${JSON.stringify(administrativeHierarchy)}`);

        this.retrieveAdministrativeUnitRecord(administrativeHierarchy.data?.responsible?.id, (administrativeUnit: AdministrativeUnit | null) => {

            this.retrieveAdministrativeUnitTypeRecord(administrativeUnit?.data?.typeId, (administrativeUnitType: AdministrativeUnitType | null) => {

                // Broadcast the selected location details
                this.log.trace(`${LOG_PREFIX} Broadcasting the selected location details`);
                this.select.emit(administrativeHierarchy);
                this.filterService.update({
                    activeAdministrativeHierarchy: administrativeHierarchy,
                    activeAdministrativeUnit: administrativeUnit,
                    activeAdministrativeUnitType: administrativeUnitType
                });

                // Close the modal
                this.log.trace(`${LOG_PREFIX} Closing the modal`);
                this.activeContextsModal.close();

            });
        });



    }


    /** 
    * Propagates Contexts Checkboxes Check Events
    * @param result The Checked Administrative Hierarchy or Hierarchies
    */
    onCheck(result: any) {

        this.log.trace(`${LOG_PREFIX} Entering onCheck()`);

        // Get the checked Administrative Hierarchy
        this.log.trace(`${LOG_PREFIX} Getting the checked Administrative Hierarchy`);
        const administrativeHierarchy: AdministrativeHierarchy = this.full? result[0] : result;
        this.log.debug(`${LOG_PREFIX} Checked Administrative Hierarchy = ${JSON.stringify(administrativeHierarchy)}`);

        // Broadcast the checked Administrative Hierarchy
        this.log.trace(`${LOG_PREFIX} Broadcasting the checked Administrative Hierarchy`);
        this.check.emit(administrativeHierarchy);
    }


    /** 
    * Propagates Contexts Checkboxes Uncheck Events
    * @param result The Unchecked Administrative Hierarchy or Hierarchies
    */
    onUncheck(result: any) {

        this.log.trace(`${LOG_PREFIX} Entering onUncheck()`);

        // Get the unchecked Administrative Hierarchy
        this.log.trace(`${LOG_PREFIX} Getting the unchecked Administrative Hierarchy`);
        const administrativeHierarchy: AdministrativeHierarchy = this.full? result[0] : result;
        this.log.debug(`${LOG_PREFIX} Unchecked Administrative Hierarchy = ${JSON.stringify(administrativeHierarchy)}`);

        // Broadcast the unchecked Administrative Hierarchy
        this.log.trace(`${LOG_PREFIX} Broadcasting the unchecked Administrative Hierarchy`);
        this.uncheck.emit(administrativeHierarchy);

    }



    /**
     * Closes the modal
     */
    onDone() {

        this.log.trace(`${LOG_PREFIX} Entering onDone()`);

        // Close the modal
        this.log.trace(`${LOG_PREFIX} Closing the modal`);
        this.activeContextsModal.close();
    }


    /**
     * Retrieves an Administrative Unit record given its unique identifier synchronously
     * @param id The unique identifier of the Administrative Unit
     * @param callback The function to call when done
     */
    private retrieveAdministrativeUnitRecord(id: number | null | undefined, callback: (administrativeUnit: AdministrativeUnit | null) => void): void {

        this.log.trace(`${LOG_PREFIX} Entering retrieveAdministrativeUnitRecord()`);
        this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

        // Check if the Administrative Unit Id has been specified
        this.log.trace(`${LOG_PREFIX} Checking if the Administrative Unit Id has been specified`);
        if (id) {

            // The Administrative Unit Id has been specified
            this.log.trace(`${LOG_PREFIX} The Administrative Unit Id has been specified`);
            this.log.debug(`${LOG_PREFIX} Administrative Unit Id = ${JSON.stringify(id)}`);

            // Try retrieving an Administrative Unit Record with the passed in id
            this.log.trace(`${LOG_PREFIX} Trying to retrieve an Administrative Unit Record with the passed in id`);
            this.administrativeUnitsDataService
                .getAdministrativeUnits(false, {
                    page: null,
                    pageSize: null,
                    searchTerm: null,
                    sortColumn: null,
                    sortDirection: null,
                    id: id,
                    typesIds: null,
                    name: null
                })
                .subscribe({
                    next: (administrativeUnits: AdministrativeUnit[]) => {

                        // Check if an Administrative Unit record with the given id was found
                        this.log.trace(`${LOG_PREFIX} Checking if an Administrative Unit record with the given id was found`);
                        if (administrativeUnits.length > 0) {

                            //An Administrative Unit record with the given id was found
                            this.log.trace(`${LOG_PREFIX} An Administrative Unit record with the given id was found`);

                            // Return the Administrative Unit record
                            this.log.trace(`${LOG_PREFIX} Returning the Administrative Unit record`);
                            callback(administrativeUnits[0]);

                        } else {

                            //An Administrative Unit record with the given id was not found
                            this.log.trace(`${LOG_PREFIX} An Administrative Unit record with the given id was not found`);

                            // Return null
                            this.log.warn(`${LOG_PREFIX} Return null`);
                            callback(null);

                        }
                    }
                });


        } else {

            // The Administrative Unit Id has not been specified
            this.log.error(`${LOG_PREFIX} The Administrative Unit Id has not been specified`);

            // Return null
            this.log.warn(`${LOG_PREFIX} Return null`);
            callback(null);

        }
    }


    /**
       * Retrieves an Administrative Unit Type record given its unique identifier synchronously
       * @param id The unique identifier of the Administrative Unit Type
       * @param callback The function to call when done
       */
    private retrieveAdministrativeUnitTypeRecord(id: number | null | undefined, callback: (administrativeUnitType: AdministrativeUnitType | null) => void): void {

        this.log.trace(`${LOG_PREFIX} Entering retrieveAdministrativeUnitTypeRecord()`);
        this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

        // Check if the Administrative Unit Type Id has been specified
        this.log.trace(`${LOG_PREFIX} Checking if the Administrative Unit Type Id has been specified`);
        if (id) {

            // The Administrative Unit Type Id has been specified
            this.log.trace(`${LOG_PREFIX} The Administrative Unit Type Id has been specified`);
            this.log.debug(`${LOG_PREFIX} Administrative Unit Type Id = ${JSON.stringify(id)}`);

            // Try retrieving an Administrative Unit Type Record with the passed in id
            this.log.trace(`${LOG_PREFIX} Trying to retrieve an Administrative Unit Type Record with the passed in id`);
            this.administrativeUnitsTypesDataService
                .getAdministrativeUnitsTypes(false, {
                    page: null,
                    pageSize: null,
                    searchTerm: null,
                    sortColumn: null,
                    sortDirection: null,
                    id: id,
                    name: null,
                    plural: null
                })
                .subscribe({
                    next:(administrativeUnitTypes: AdministrativeUnitType[]) => {

                        // Check if an Administrative Unit Type record with the given id was found
                        this.log.trace(`${LOG_PREFIX} Checking if an Administrative Unit Type record with the given id was found`);
                        if (administrativeUnitTypes.length > 0) {

                            //An Administrative Unit Type record with the given id was found
                            this.log.trace(`${LOG_PREFIX} An Administrative Unit Type record with the given id was found`);

                            // Return the Administrative Unit Type record
                            this.log.trace(`${LOG_PREFIX} Returning the Administrative Unit Type record`);
                            callback(administrativeUnitTypes[0]);


                        } else {

                            //An Administrative Unit Type record with the given id was not found
                            this.log.trace(`${LOG_PREFIX} An Administrative Unit Type record with the given id was not found`);

                            // Return null
                            this.log.warn(`${LOG_PREFIX} Return null`);
                            callback(null);

                        }
                    }
                });


        } else {

            // The Administrative Unit Type Id has not been specified
            this.log.error(`${LOG_PREFIX} The Administrative Unit Type Id has not been specified`);

            // Return null
            this.log.warn(`${LOG_PREFIX} Return null`);
            callback(null);

        }
    }



}
