import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { OptionType } from '@modules/options-types/models/option-type.model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Options Types Records Tabulation Modal]";

@Component({
    selector: 'sb-optionsTypes-records-selection-modal',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './options-types-records-selection-modal.component.html',
    styleUrls: ['options-types-records-selection-modal.component.scss'],
})
export class OptionsTypesRecordsSelectionModalComponent implements OnInit {

    // Allows the parent component to inject the desired selection mode: single or multi
    @Input() public selectionMode: string = "single";

    // Allows the parent component to inject the desired Options Types
    @Input() public desired: number[] = [];

    // Allows the parent component to inject the undesired Options Types
    // Ignored if the desired Options Types has been specified
    @Input() public undesired: number[] = [];

    // Allows the parent component to inject the previously selected Options Types
    @Input() public selected: number[] = [];

    // Propagates radio buttons selection events
    @Output() public select: EventEmitter<OptionType> = new EventEmitter<OptionType>();

    // Propagates checkboxes check events
    @Output() public check: EventEmitter<OptionType> = new EventEmitter<OptionType>();

    // Propagates checkboxes uncheck events
    @Output() public uncheck: EventEmitter<OptionType> = new EventEmitter<OptionType>();  
    
    // Keeps tab of the page title
    public title: string = "Select Options Type Record";    

    constructor(private log: NGXLogger, public activeContextsModal: NgbActiveModal) { }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);
    }


    @HostListener('window:beforeunload')
    ngOnDestroy() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

    }

    /** 
    * Propagates OptionType Selection Events
    * @param optionType The Selected OptionType
    */
     onSelect(optionType: OptionType) {

        this.log.trace(`${LOG_PREFIX} Entering onSelect()`);
        this.log.debug(`${LOG_PREFIX} Selected Option Type = ${JSON.stringify(optionType)}`);

        // Broadcast the selected OptionType
        this.log.trace(`${LOG_PREFIX} Broadcasting the selected Option Type`);
        this.select.emit(optionType);
    }


    /** 
    * Propagates Options Types Checkboxes Check Events
    * @param optionType The Checked OptionType
    */
    onCheck(optionType: OptionType) {

        this.log.trace(`${LOG_PREFIX} Entering onCheck()`);
        this.log.debug(`${LOG_PREFIX} Checked Option Type = ${JSON.stringify(optionType)}`);

        // Broadcast the checked OptionType
        this.log.trace(`${LOG_PREFIX} Broadcasting the checked Option Type`);
        this.check.emit(optionType);
    }


    /** 
    * Propagates Options Types Checkboxes Uncheck Events
    * @param optionType The Unchecked OptionType
    */
    onUncheck(optionType: OptionType) {

        this.log.trace(`${LOG_PREFIX} Entering onUncheck()`);
        this.log.debug(`${LOG_PREFIX} Unchecked Option Type = ${JSON.stringify(optionType)}`);

        // Broadcast the unchecked OptionType
        this.log.trace(`${LOG_PREFIX} Broadcasting the unchecked Option Type`);
        this.uncheck.emit(optionType);

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
