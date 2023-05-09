import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { LogicalStructure } from '@modules/logical-structures/models/logical-structure.model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Logical Structures Records Tabulation Modal]";

@Component({
    selector: 'sb-logical-structures-records-selection-modal',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './logical-structures-records-selection-modal.component.html',
    styleUrls: ['logical-structures-records-selection-modal.component.scss'],
})
export class LogicalStructuresRecordsSelectionModalComponent implements OnInit {


    // Allows the parent component to inject the desired selection mode: single or multi
    @Input() public selectionMode: string = "single";

    // Allows the parent component to inject the desired Contexts
    @Input() public desired: LogicalStructure[] = [];

    // Allows the parent component to inject the undesired Contexts
    // Ignored if the desired Contexts has been specified
    @Input() public undesired: LogicalStructure[] = [];

    // Allows the parent component to inject the previously selected Contexts
    @Input() public selected: LogicalStructure[] = [];

    // Propagates radio buttons selection events
    @Output() public select: EventEmitter<LogicalStructure> = new EventEmitter<LogicalStructure>();

    // Propagates checkboxes check events
    @Output() public check: EventEmitter<LogicalStructure> = new EventEmitter<LogicalStructure>();

    // Propagates checkboxes uncheck events
    @Output() public uncheck: EventEmitter<LogicalStructure> = new EventEmitter<LogicalStructure>();

    // Keeps tab of the page title
    public title: string = "Select Logical Structure Record";

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
    * Propagates Logical Structure Selection Events
    * @param logicalStructure The Selected Logical Structure
    */
    onSelect(logicalStructure: LogicalStructure) {

        this.log.trace(`${LOG_PREFIX} Entering onSelect()`);
        this.log.debug(`${LOG_PREFIX} Selected Logical Structure = ${JSON.stringify(logicalStructure)}`);

        // Broadcast the selected Logical Structure
        this.log.trace(`${LOG_PREFIX} Broadcasting the selected Logical Structure`);
        this.select.emit(logicalStructure);
    }


    /** 
    * Propagates Contexts Checkboxes Check Events
    * @param logicalStructure The Checked Logical Structure
    */
    onCheck(logicalStructure: LogicalStructure) {

        this.log.trace(`${LOG_PREFIX} Entering onCheck()`);
        this.log.debug(`${LOG_PREFIX} Checked Logical Structure = ${JSON.stringify(logicalStructure)}`);

        // Broadcast the checked Logical Structure
        this.log.trace(`${LOG_PREFIX} Broadcasting the checked Logical Structure`);
        this.check.emit(logicalStructure);
    }


    /** 
    * Propagates Contexts Checkboxes Uncheck Events
    * @param logicalStructure The Unchecked Logical Structure
    */
    onUncheck(logicalStructure: LogicalStructure) {

        this.log.trace(`${LOG_PREFIX} Entering onUncheck()`);
        this.log.debug(`${LOG_PREFIX} Unchecked Logical Structure = ${JSON.stringify(logicalStructure)}`);

        // Broadcast the unchecked Logical Structure
        this.log.trace(`${LOG_PREFIX} Broadcasting the unchecked Logical Structure`);
        this.uncheck.emit(logicalStructure);

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
