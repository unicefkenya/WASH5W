import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { Dissagregation } from '@modules/dissagregations/models/dissagregation.model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Dissagregations Records Tabulation Modal]";

@Component({
    selector: 'sb-dissagregations-records-selection-modal',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './dissagregations-records-selection-modal.component.html',
    styleUrls: ['dissagregations-records-selection-modal.component.scss'],
})
export class DissagregationsRecordsSelectionModalComponent implements OnInit {


    // Allows the parent component to inject the desired selection mode: single or multi
    @Input() public selectionMode: string = "single";

    // Allows the parent component to inject the desired Dissagregation Type
    @Input() public desiredType!: number; 

    // Allows the parent component to inject the desired Dissagregation
    @Input() public desired: number[] = [];    

    // Allows the parent component to inject the undesired Dissagregations
    // Ignored if the desired Dissagregations has been specified
    @Input() public undesired: number[] = [];

    // Allows the parent component to inject the previously selected Dissagregations
    @Input() public selected: number[] = [];
    // Propagates radio buttons selection events
    @Output() public select: EventEmitter<Dissagregation> = new EventEmitter<Dissagregation>();

    // Propagates checkboxes check events
    @Output() public check: EventEmitter<Dissagregation> = new EventEmitter<Dissagregation>();

    // Propagates checkboxes uncheck events
    @Output() public uncheck: EventEmitter<Dissagregation> = new EventEmitter<Dissagregation>();

    // Keeps tab of the page title
    public title: string = "Select Dissagregation Record";

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
    * Propagates Dissagregation Selection Events
    * @param dissagregation The Selected Dissagregation
    */
    onSelect(dissagregation: Dissagregation) {

        this.log.trace(`${LOG_PREFIX} Entering onSelect()`);
        this.log.debug(`${LOG_PREFIX} Selected Dissagregation = ${JSON.stringify(dissagregation)}`);

        // Broadcast the selected Dissagregation
        this.log.trace(`${LOG_PREFIX} Broadcasting the selected Dissagregation`);
        this.select.emit(dissagregation);
    }


    /** 
    * Propagates Contexts Checkboxes Check Events
    * @param dissagregation The Checked Dissagregation
    */
    onCheck(dissagregation: Dissagregation) {

        this.log.trace(`${LOG_PREFIX} Entering onCheck()`);
        this.log.debug(`${LOG_PREFIX} Checked Dissagregation = ${JSON.stringify(dissagregation)}`);

        // Broadcast the checked Dissagregation
        this.log.trace(`${LOG_PREFIX} Broadcasting the checked Dissagregation`);
        this.check.emit(dissagregation);
    }


    /** 
    * Propagates Contexts Checkboxes Uncheck Events
    * @param dissagregation The Unchecked Dissagregation
    */
    onUncheck(dissagregation: Dissagregation) {

        this.log.trace(`${LOG_PREFIX} Entering onUncheck()`);
        this.log.debug(`${LOG_PREFIX} Unchecked Dissagregation = ${JSON.stringify(dissagregation)}`);

        // Broadcast the unchecked Dissagregation
        this.log.trace(`${LOG_PREFIX} Broadcasting the unchecked Dissagregation`);
        this.uncheck.emit(dissagregation);

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
