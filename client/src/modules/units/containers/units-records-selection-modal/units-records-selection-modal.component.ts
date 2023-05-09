import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { Unit } from '@modules/units/models/unit.model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Units Records Tabulation Modal]";

@Component({
    selector: 'sb-units-records-selection-modal',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './units-records-selection-modal.component.html',
    styleUrls: ['units-records-selection-modal.component.scss'],
})
export class UnitsRecordsSelectionModalComponent implements OnInit {

    // Allows the parent component to inject the desired selection mode: single or multi
    @Input() public selectionMode: string = "single";

    // Allows the parent component to inject the desired Units
    @Input() public desired: number[] = [];

    // Allows the parent component to inject the undesired Units
    // Ignored if the desired Units has been specified
    @Input() public undesired: number[] = [];

    // Allows the parent component to inject the previously selected Units
    @Input() public selected: number[] = [];

    // Propagates radio buttons selection events
    @Output() public select: EventEmitter<Unit> = new EventEmitter<Unit>();

    // Propagates checkboxes check events
    @Output() public check: EventEmitter<Unit> = new EventEmitter<Unit>();

    // Propagates checkboxes uncheck events
    @Output() public uncheck: EventEmitter<Unit> = new EventEmitter<Unit>();  
    
    // Keeps tab of the page title
    public title: string = "Select Unit Record";    

    constructor(private log: NGXLogger, public activeContextsModal: NgbActiveModal) { }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);
    }


    @HostListener('window:beforeunload')
    ngOnDestroy() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

    }

    /** 
    * Propagates Unit Selection Events
    * @param unit The Selected Unit
    */
     onSelect(unit: Unit) {

        this.log.trace(`${LOG_PREFIX} Entering onSelect()`);
        this.log.debug(`${LOG_PREFIX} Selected Unit = ${JSON.stringify(unit)}`);

        // Broadcast the selected Unit
        this.log.trace(`${LOG_PREFIX} Broadcasting the selected Unit`);
        this.select.emit(unit);
    }


    /** 
    * Propagates Units Checkboxes Check Events
    * @param unit The Checked Unit
    */
    onCheck(unit: Unit) {

        this.log.trace(`${LOG_PREFIX} Entering onCheck()`);
        this.log.debug(`${LOG_PREFIX} Checked Unit = ${JSON.stringify(unit)}`);

        // Broadcast the checked Unit
        this.log.trace(`${LOG_PREFIX} Broadcasting the checked Unit`);
        this.check.emit(unit);
    }


    /** 
    * Propagates Units Checkboxes Uncheck Events
    * @param unit The Unchecked Unit
    */
    onUncheck(unit: Unit) {

        this.log.trace(`${LOG_PREFIX} Entering onUncheck()`);
        this.log.debug(`${LOG_PREFIX} Unchecked Unit = ${JSON.stringify(unit)}`);

        // Broadcast the unchecked Unit
        this.log.trace(`${LOG_PREFIX} Broadcasting the unchecked Unit`);
        this.uncheck.emit(unit);

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
