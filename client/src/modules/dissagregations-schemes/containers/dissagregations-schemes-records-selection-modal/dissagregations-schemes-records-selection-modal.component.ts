import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { DissagregationScheme } from '@modules/dissagregations-schemes/models/dissagregation-scheme.model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Dissagregations Schemes Records Tabulation Modal]";

@Component({
    selector: 'sb-dissagregationsSchemes-records-selection-modal',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './dissagregations-schemes-records-selection-modal.component.html',
    styleUrls: ['dissagregations-schemes-records-selection-modal.component.scss'],
})
export class DissagregationsSchemesRecordsSelectionModalComponent implements OnInit {

    // Allows the parent component to inject the desired selection mode: single or multi
    @Input() public selectionMode: string = "single";

    // Allows the parent component to inject the desired Dissagregations Schemes
    @Input() public desired: number[] = [];

    // Allows the parent component to inject the undesired Dissagregations Schemes
    // Ignored if the desired Dissagregations Schemes has been specified
    @Input() public undesired: number[] = [];

    // Allows the parent component to inject the previously selected Dissagregations Schemes
    @Input() public selected: number[] = [];

    // Propagates radio buttons selection events
    @Output() public select: EventEmitter<DissagregationScheme> = new EventEmitter<DissagregationScheme>();

    // Propagates checkboxes check events
    @Output() public check: EventEmitter<DissagregationScheme> = new EventEmitter<DissagregationScheme>();

    // Propagates checkboxes uncheck events
    @Output() public uncheck: EventEmitter<DissagregationScheme> = new EventEmitter<DissagregationScheme>();  
    
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
    * Propagates DissagregationScheme Selection Events
    * @param dissagregationScheme The Selected DissagregationScheme
    */
     onSelect(dissagregationScheme: DissagregationScheme) {

        this.log.trace(`${LOG_PREFIX} Entering onSelect()`);
        this.log.debug(`${LOG_PREFIX} Selected Dissagregation Scheme = ${JSON.stringify(dissagregationScheme)}`);

        // Broadcast the selected DissagregationScheme
        this.log.trace(`${LOG_PREFIX} Broadcasting the selected Dissagregation Scheme`);
        this.select.emit(dissagregationScheme);
    }


    /** 
    * Propagates Dissagregations Schemes Checkboxes Check Events
    * @param dissagregationScheme The Checked DissagregationScheme
    */
    onCheck(dissagregationScheme: DissagregationScheme) {

        this.log.trace(`${LOG_PREFIX} Entering onCheck()`);
        this.log.debug(`${LOG_PREFIX} Checked Dissagregation Scheme = ${JSON.stringify(dissagregationScheme)}`);

        // Broadcast the checked DissagregationScheme
        this.log.trace(`${LOG_PREFIX} Broadcasting the checked Dissagregation Scheme`);
        this.check.emit(dissagregationScheme);
    }


    /** 
    * Propagates Dissagregations Schemes Checkboxes Uncheck Events
    * @param dissagregationScheme The Unchecked DissagregationScheme
    */
    onUncheck(dissagregationScheme: DissagregationScheme) {

        this.log.trace(`${LOG_PREFIX} Entering onUncheck()`);
        this.log.debug(`${LOG_PREFIX} Unchecked Dissagregation Scheme = ${JSON.stringify(dissagregationScheme)}`);

        // Broadcast the unchecked DissagregationScheme
        this.log.trace(`${LOG_PREFIX} Broadcasting the unchecked Dissagregation Scheme`);
        this.uncheck.emit(dissagregationScheme);

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
