import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { LogicalScheme } from '@modules/logical-schemes/models/logical-scheme.model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Logical Schemes Records Tabulation Modal]";

@Component({
    selector: 'sb-logical-schemes-records-selection-modal',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './logical-schemes-records-selection-modal.component.html',
    styleUrls: ['logical-schemes-records-selection-modal.component.scss'],
})
export class LogicalSchemesRecordsSelectionModalComponent implements OnInit {

    // Allows the parent component to inject the desired selection mode: single or multi
    @Input() public selectionMode: string = "single";

    // Allows the parent component to inject the desired Logical Schemes
    @Input() public desired: number[] = [];

    // Allows the parent component to inject the undesired Logical Schemes
    // Ignored if the desired Logical Schemes has been specified
    @Input() public undesired: number[] = [];

    // Allows the parent component to inject the previously selected Logical Schemes
    @Input() public selected: number[] = [];

    // Propagates radio buttons selection events
    @Output() public select: EventEmitter<LogicalScheme> = new EventEmitter<LogicalScheme>();

    // Propagates checkboxes check events
    @Output() public check: EventEmitter<LogicalScheme> = new EventEmitter<LogicalScheme>();

    // Propagates checkboxes uncheck events
    @Output() public uncheck: EventEmitter<LogicalScheme> = new EventEmitter<LogicalScheme>();  
    
    // Keeps tab of the page title
    public title: string = "Select Logical Scheme Record";    

    constructor(private log: NGXLogger, public activeContextsModal: NgbActiveModal) { }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);
    }


    @HostListener('window:beforeunload')
    ngOnDestroy() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

    }

    /** 
    * Propagates LogicalScheme Selection Events
    * @param logicalScheme The Selected LogicalScheme
    */
     onSelect(logicalScheme: LogicalScheme) {

        this.log.trace(`${LOG_PREFIX} Entering onSelect()`);
        this.log.debug(`${LOG_PREFIX} Selected Logical Scheme = ${JSON.stringify(logicalScheme)}`);

        // Broadcast the selected LogicalScheme
        this.log.trace(`${LOG_PREFIX} Broadcasting the selected Logical Scheme`);
        this.select.emit(logicalScheme);
    }


    /** 
    * Propagates Logical Schemes Checkboxes Check Events
    * @param logicalScheme The Checked LogicalScheme
    */
    onCheck(logicalScheme: LogicalScheme) {

        this.log.trace(`${LOG_PREFIX} Entering onCheck()`);
        this.log.debug(`${LOG_PREFIX} Checked Logical Scheme = ${JSON.stringify(logicalScheme)}`);

        // Broadcast the checked LogicalScheme
        this.log.trace(`${LOG_PREFIX} Broadcasting the checked Logical Scheme`);
        this.check.emit(logicalScheme);
    }


    /** 
    * Propagates Logical Schemes Checkboxes Uncheck Events
    * @param logicalScheme The Unchecked LogicalScheme
    */
    onUncheck(logicalScheme: LogicalScheme) {

        this.log.trace(`${LOG_PREFIX} Entering onUncheck()`);
        this.log.debug(`${LOG_PREFIX} Unchecked Logical Scheme = ${JSON.stringify(logicalScheme)}`);

        // Broadcast the unchecked LogicalScheme
        this.log.trace(`${LOG_PREFIX} Broadcasting the unchecked Logical Scheme`);
        this.uncheck.emit(logicalScheme);

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
