import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { LogicalElement } from '@modules/logical-elements/models/logical-element.model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Logical Elements Records Tabulation Modal]";

@Component({
    selector: 'sb-logical-elements-records-selection-modal',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './logical-elements-records-selection-modal.component.html',
    styleUrls: ['logical-elements-records-selection-modal.component.scss'],
})
export class LogicalElementsRecordsSelectionModalComponent implements OnInit {


    // Allows the parent component to inject the desired selection mode: single or multi
    @Input() public selectionMode: string = "single";

    // Allows the parent component to inject the desired Logical Element Types
    @Input() public desiredTypes: number[] = [];    

    // Allows the parent component to inject the desired Logical Element
    @Input() public desired: number[] = [];    

    // Allows the parent component to inject the undesired Logical Elements
    // Ignored if the desired Logical Elements has been specified
    @Input() public undesired: number[] = [];

    // Allows the parent component to inject the previously selected Logical Elements
    @Input() public selected: number[] = [];
    // Propagates radio buttons selection events
    @Output() public select: EventEmitter<LogicalElement> = new EventEmitter<LogicalElement>();

    // Propagates checkboxes check events
    @Output() public check: EventEmitter<LogicalElement> = new EventEmitter<LogicalElement>();

    // Propagates checkboxes uncheck events
    @Output() public uncheck: EventEmitter<LogicalElement> = new EventEmitter<LogicalElement>();

    // Keeps tab of the page title
    public title: string = "Select Logical Element Record";

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
    * Propagates Logical Element Selection Events
    * @param logicalElement The Selected Logical Element
    */
    onSelect(logicalElement: LogicalElement) {

        this.log.trace(`${LOG_PREFIX} Entering onSelect()`);
        this.log.debug(`${LOG_PREFIX} Selected Logical Element = ${JSON.stringify(logicalElement)}`);

        // Broadcast the selected Logical Element
        this.log.trace(`${LOG_PREFIX} Broadcasting the selected Logical Element`);
        this.select.emit(logicalElement);
    }


    /** 
    * Propagates Contexts Checkboxes Check Events
    * @param logicalElement The Checked Logical Element
    */
    onCheck(logicalElement: LogicalElement) {

        this.log.trace(`${LOG_PREFIX} Entering onCheck()`);
        this.log.debug(`${LOG_PREFIX} Checked Logical Element = ${JSON.stringify(logicalElement)}`);

        // Broadcast the checked Logical Element
        this.log.trace(`${LOG_PREFIX} Broadcasting the checked Logical Element`);
        this.check.emit(logicalElement);
    }


    /** 
    * Propagates Contexts Checkboxes Uncheck Events
    * @param logicalElement The Unchecked Logical Element
    */
    onUncheck(logicalElement: LogicalElement) {

        this.log.trace(`${LOG_PREFIX} Entering onUncheck()`);
        this.log.debug(`${LOG_PREFIX} Unchecked Logical Element = ${JSON.stringify(logicalElement)}`);

        // Broadcast the unchecked Logical Element
        this.log.trace(`${LOG_PREFIX} Broadcasting the unchecked Logical Element`);
        this.uncheck.emit(logicalElement);

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
