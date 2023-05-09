import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { AdministrativeUnit } from '@modules/administrative-units/models/administrative-unit.model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Administrative Units Records Tabulation Modal]";

@Component({
    selector: 'sb-administrative-units-records-selection-modal',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './administrative-units-records-selection-modal.component.html',
    styleUrls: ['administrative-units-records-selection-modal.component.scss'],
})
export class AdministrativeUnitsRecordsSelectionModalComponent implements OnInit {


    // Allows the parent component to inject the desired selection mode: single or multi
    @Input() public selectionMode: string = "single";

    // Allows the parent component to inject the desired Administrative Unit Types
    @Input() public desiredTypes: number[] = [];    

    // Allows the parent component to inject the desired Administrative Unit
    @Input() public desired: number[] = [];    

    // Allows the parent component to inject the undesired Administrative Units
    // Ignored if the desired Administrative Units has been specified
    @Input() public undesired: number[] = [];

    // Allows the parent component to inject the previously selected Administrative Units
    @Input() public selected: number[] = [];
    // Propagates radio buttons selection events
    @Output() public select: EventEmitter<AdministrativeUnit> = new EventEmitter<AdministrativeUnit>();

    // Propagates checkboxes check events
    @Output() public check: EventEmitter<AdministrativeUnit> = new EventEmitter<AdministrativeUnit>();

    // Propagates checkboxes uncheck events
    @Output() public uncheck: EventEmitter<AdministrativeUnit> = new EventEmitter<AdministrativeUnit>();

    // Keeps tab of the page title
    public title: string = "Select Administrative Unit Record";

    constructor(
        private log: NGXLogger,
        public activeContextsModal: NgbActiveModal,) { }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);
    }


    @HostListener('window:beforeunload')
    ngOnDestroy() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

    }

    /** 
    * Propagates Administrative Unit Selection Events
    * @param administrativeUnit The Selected Administrative Unit
    */
    onSelect(administrativeUnit: AdministrativeUnit) {

        this.log.trace(`${LOG_PREFIX} Entering onSelect()`);
        this.log.debug(`${LOG_PREFIX} Selected Administrative Unit = ${JSON.stringify(administrativeUnit)}`);

        // Broadcast the selected Administrative Unit
        this.log.trace(`${LOG_PREFIX} Broadcasting the selected Administrative Unit`);
        this.select.emit(administrativeUnit);
    }


    /** 
    * Propagates Contexts Checkboxes Check Events
    * @param administrativeUnit The Checked Administrative Unit
    */
    onCheck(administrativeUnit: AdministrativeUnit) {

        this.log.trace(`${LOG_PREFIX} Entering onCheck()`);
        this.log.debug(`${LOG_PREFIX} Checked Administrative Unit = ${JSON.stringify(administrativeUnit)}`);

        // Broadcast the checked Administrative Unit
        this.log.trace(`${LOG_PREFIX} Broadcasting the checked Administrative Unit`);
        this.check.emit(administrativeUnit);
    }


    /** 
    * Propagates Contexts Checkboxes Uncheck Events
    * @param administrativeUnit The Unchecked Administrative Unit
    */
    onUncheck(administrativeUnit: AdministrativeUnit) {

        this.log.trace(`${LOG_PREFIX} Entering onUncheck()`);
        this.log.debug(`${LOG_PREFIX} Unchecked Administrative Unit = ${JSON.stringify(administrativeUnit)}`);

        // Broadcast the unchecked Administrative Unit
        this.log.trace(`${LOG_PREFIX} Broadcasting the unchecked Administrative Unit`);
        this.uncheck.emit(administrativeUnit);

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
