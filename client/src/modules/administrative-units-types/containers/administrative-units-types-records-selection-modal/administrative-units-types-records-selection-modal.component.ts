import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { AdministrativeUnitType } from '@modules/administrative-units-types/models/administrative-unit-type.model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Administrative Units Types Records Tabulation Modal]";

@Component({
    selector: 'sb-administrativeUnitsTypes-records-selection-modal',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './administrative-units-types-records-selection-modal.component.html',
    styleUrls: ['administrative-units-types-records-selection-modal.component.scss'],
})
export class AdministrativeUnitsTypesRecordsSelectionModalComponent implements OnInit {

    // Allows the parent component to inject the desired selection mode: single or multi
    @Input() public selectionMode: string = "single";

    // Allows the parent component to inject the desired Administrative Units Types
    @Input() public desired: number[] = [];

    // Allows the parent component to inject the undesired Administrative Units Types
    // Ignored if the desired Administrative Units Types has been specified
    @Input() public undesired: number[] = [];

    // Allows the parent component to inject the previously selected Administrative Units Types
    @Input() public selected: number[] = [];

    // Propagates radio buttons selection events
    @Output() public select: EventEmitter<AdministrativeUnitType> = new EventEmitter<AdministrativeUnitType>();

    // Propagates checkboxes check events
    @Output() public check: EventEmitter<AdministrativeUnitType> = new EventEmitter<AdministrativeUnitType>();

    // Propagates checkboxes uncheck events
    @Output() public uncheck: EventEmitter<AdministrativeUnitType> = new EventEmitter<AdministrativeUnitType>();  
    
    // Keeps tab of the page title
    public title: string = "Select Administrative Unit Type Record";    

    constructor(private log: NGXLogger, public activeContextsModal: NgbActiveModal) { }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);
    }


    @HostListener('window:beforeunload')
    ngOnDestroy() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

    }

    /** 
    * Propagates AdministrativeUnitType Selection Events
    * @param administrativeUnitType The Selected AdministrativeUnitType
    */
     onSelect(administrativeUnitType: AdministrativeUnitType) {

        this.log.trace(`${LOG_PREFIX} Entering onSelect()`);
        this.log.debug(`${LOG_PREFIX} Selected Administrative Unit Type = ${JSON.stringify(administrativeUnitType)}`);

        // Broadcast the selected AdministrativeUnitType
        this.log.trace(`${LOG_PREFIX} Broadcasting the selected Administrative Unit Type`);
        this.select.emit(administrativeUnitType);
    }


    /** 
    * Propagates Administrative Units Types Checkboxes Check Events
    * @param administrativeUnitType The Checked AdministrativeUnitType
    */
    onCheck(administrativeUnitType: AdministrativeUnitType) {

        this.log.trace(`${LOG_PREFIX} Entering onCheck()`);
        this.log.debug(`${LOG_PREFIX} Checked Administrative Unit Type = ${JSON.stringify(administrativeUnitType)}`);

        // Broadcast the checked AdministrativeUnitType
        this.log.trace(`${LOG_PREFIX} Broadcasting the checked Administrative Unit Type`);
        this.check.emit(administrativeUnitType);
    }


    /** 
    * Propagates Administrative Units Types Checkboxes Uncheck Events
    * @param administrativeUnitType The Unchecked AdministrativeUnitType
    */
    onUncheck(administrativeUnitType: AdministrativeUnitType) {

        this.log.trace(`${LOG_PREFIX} Entering onUncheck()`);
        this.log.debug(`${LOG_PREFIX} Unchecked Administrative Unit Type = ${JSON.stringify(administrativeUnitType)}`);

        // Broadcast the unchecked AdministrativeUnitType
        this.log.trace(`${LOG_PREFIX} Broadcasting the unchecked Administrative Unit Type`);
        this.uncheck.emit(administrativeUnitType);

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


}
