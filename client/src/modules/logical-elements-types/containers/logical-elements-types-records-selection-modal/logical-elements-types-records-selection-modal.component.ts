import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { LogicalElementType } from '@modules/logical-elements-types/models/logical-element-type.model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Logical Elements Types Records Tabulation Modal]";

@Component({
    selector: 'sb-logicalElementsTypes-records-selection-modal',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './logical-elements-types-records-selection-modal.component.html',
    styleUrls: ['logical-elements-types-records-selection-modal.component.scss'],
})
export class LogicalElementsTypesRecordsSelectionModalComponent implements OnInit {

    // Allows the parent component to inject the desired selection mode: single or multi
    @Input() public selectionMode: string = "single";

    // Allows the parent component to inject the desired Logical Elements Types
    @Input() public desired: number[] = [];

    // Allows the parent component to inject the undesired Logical Elements Types
    // Ignored if the desired Logical Elements Types has been specified
    @Input() public undesired: number[] = [];

    // Allows the parent component to inject the previously selected Logical Elements Types
    @Input() public selected: number[] = [];

    // Propagates radio buttons selection events
    @Output() public select: EventEmitter<LogicalElementType> = new EventEmitter<LogicalElementType>();

    // Propagates checkboxes check events
    @Output() public check: EventEmitter<LogicalElementType> = new EventEmitter<LogicalElementType>();

    // Propagates checkboxes uncheck events
    @Output() public uncheck: EventEmitter<LogicalElementType> = new EventEmitter<LogicalElementType>();  
    
    // Keeps tab of the page title
    public title: string = "Select Logical Element Type Record";    

    constructor(private log: NGXLogger, public activeContextsModal: NgbActiveModal) { }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);
    }


    @HostListener('window:beforeunload')
    ngOnDestroy() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

    }

    /** 
    * Propagates LogicalElementType Selection Events
    * @param logicalElementType The Selected LogicalElementType
    */
     onSelect(logicalElementType: LogicalElementType) {

        this.log.trace(`${LOG_PREFIX} Entering onSelect()`);
        this.log.debug(`${LOG_PREFIX} Selected Logical Element Type = ${JSON.stringify(logicalElementType)}`);

        // Broadcast the selected LogicalElementType
        this.log.trace(`${LOG_PREFIX} Broadcasting the selected Logical Element Type`);
        this.select.emit(logicalElementType);
    }


    /** 
    * Propagates Logical Elements Types Checkboxes Check Events
    * @param logicalElementType The Checked LogicalElementType
    */
    onCheck(logicalElementType: LogicalElementType) {

        this.log.trace(`${LOG_PREFIX} Entering onCheck()`);
        this.log.debug(`${LOG_PREFIX} Checked Logical Element Type = ${JSON.stringify(logicalElementType)}`);

        // Broadcast the checked LogicalElementType
        this.log.trace(`${LOG_PREFIX} Broadcasting the checked Logical Element Type`);
        this.check.emit(logicalElementType);
    }


    /** 
    * Propagates Logical Elements Types Checkboxes Uncheck Events
    * @param logicalElementType The Unchecked LogicalElementType
    */
    onUncheck(logicalElementType: LogicalElementType) {

        this.log.trace(`${LOG_PREFIX} Entering onUncheck()`);
        this.log.debug(`${LOG_PREFIX} Unchecked Logical Element Type = ${JSON.stringify(logicalElementType)}`);

        // Broadcast the unchecked LogicalElementType
        this.log.trace(`${LOG_PREFIX} Broadcasting the unchecked Logical Element Type`);
        this.uncheck.emit(logicalElementType);

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
