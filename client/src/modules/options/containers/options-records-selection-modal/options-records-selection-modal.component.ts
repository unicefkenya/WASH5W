import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { Option } from '@modules/options/models/option.model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Options Records Tabulation Modal]";

@Component({
    selector: 'sb-options-records-selection-modal',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './options-records-selection-modal.component.html',
    styleUrls: ['options-records-selection-modal.component.scss'],
})
export class OptionsRecordsSelectionModalComponent implements OnInit {


    // Allows the parent component to inject the desired selection mode: single or multi
    @Input() public selectionMode: string = "single";

    // Allows the parent component to inject the desired Option Type
    @Input() public desiredType!: number; 

    // Allows the parent component to inject the desired Option
    @Input() public desired: number[] = [];    

    // Allows the parent component to inject the undesired Options
    // Ignored if the desired Options has been specified
    @Input() public undesired: number[] = [];

    // Allows the parent component to inject the previously selected Options
    @Input() public selected: number[] = [];
    // Propagates radio buttons selection events
    @Output() public select: EventEmitter<Option> = new EventEmitter<Option>();

    // Propagates checkboxes check events
    @Output() public check: EventEmitter<Option> = new EventEmitter<Option>();

    // Propagates checkboxes uncheck events
    @Output() public uncheck: EventEmitter<Option> = new EventEmitter<Option>();

    // Keeps tab of the page title
    public title: string = "Select Option Record";

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
    * Propagates Option Selection Events
    * @param option The Selected Option
    */
    onSelect(option: Option) {

        this.log.trace(`${LOG_PREFIX} Entering onSelect()`);
        this.log.debug(`${LOG_PREFIX} Selected Option = ${JSON.stringify(option)}`);

        // Broadcast the selected Option
        this.log.trace(`${LOG_PREFIX} Broadcasting the selected Option`);
        this.select.emit(option);
    }


    /** 
    * Propagates Contexts Checkboxes Check Events
    * @param option The Checked Option
    */
    onCheck(option: Option) {

        this.log.trace(`${LOG_PREFIX} Entering onCheck()`);
        this.log.debug(`${LOG_PREFIX} Checked Option = ${JSON.stringify(option)}`);

        // Broadcast the checked Option
        this.log.trace(`${LOG_PREFIX} Broadcasting the checked Option`);
        this.check.emit(option);
    }


    /** 
    * Propagates Contexts Checkboxes Uncheck Events
    * @param option The Unchecked Option
    */
    onUncheck(option: Option) {

        this.log.trace(`${LOG_PREFIX} Entering onUncheck()`);
        this.log.debug(`${LOG_PREFIX} Unchecked Option = ${JSON.stringify(option)}`);

        // Broadcast the unchecked Option
        this.log.trace(`${LOG_PREFIX} Broadcasting the unchecked Option`);
        this.uncheck.emit(option);

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
