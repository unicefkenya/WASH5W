import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { Organisation } from '@modules/organisations/models/organisation.model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Organisations Records Tabulation Modal]";

@Component({
    selector: 'sb-organisations-records-selection-modal',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './organisations-records-selection-modal.component.html',
    styleUrls: ['organisations-records-selection-modal.component.scss'],
})
export class OrganisationsRecordsSelectionModalComponent implements OnInit {


    // Allows the parent component to inject the desired selection mode: single or multi
    @Input() public selectionMode: string = "single";

    // Allows the parent component to inject the desired Organisation Types
    @Input() public desiredTypes: number[] = [];    

    // Allows the parent component to inject the desired Organisation
    @Input() public desired: number[] = [];    

    // Allows the parent component to inject the undesired Organisations
    // Ignored if the desired Organisations has been specified
    @Input() public undesired: number[] = [];

    // Allows the parent component to inject the previously selected Organisations
    @Input() public selected: number[] = [];
    // Propagates radio buttons selection events
    @Output() public select: EventEmitter<Organisation> = new EventEmitter<Organisation>();

    // Propagates checkboxes check events
    @Output() public check: EventEmitter<Organisation> = new EventEmitter<Organisation>();

    // Propagates checkboxes uncheck events
    @Output() public uncheck: EventEmitter<Organisation> = new EventEmitter<Organisation>();

    // Keeps tab of the page title
    public title: string = "Select Organisation Record";

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
    * Propagates Organisation Selection Events
    * @param organisation The Selected Organisation
    */
    onSelect(organisation: Organisation) {

        this.log.trace(`${LOG_PREFIX} Entering onSelect()`);
        this.log.debug(`${LOG_PREFIX} Selected Organisation = ${JSON.stringify(organisation)}`);

        // Broadcast the selected Organisation
        this.log.trace(`${LOG_PREFIX} Broadcasting the selected Organisation`);
        this.select.emit(organisation);
    }


    /** 
    * Propagates Contexts Checkboxes Check Events
    * @param organisation The Checked Organisation
    */
    onCheck(organisation: Organisation) {

        this.log.trace(`${LOG_PREFIX} Entering onCheck()`);
        this.log.debug(`${LOG_PREFIX} Checked Organisation = ${JSON.stringify(organisation)}`);

        // Broadcast the checked Organisation
        this.log.trace(`${LOG_PREFIX} Broadcasting the checked Organisation`);
        this.check.emit(organisation);
    }


    /** 
    * Propagates Contexts Checkboxes Uncheck Events
    * @param organisation The Unchecked Organisation
    */
    onUncheck(organisation: Organisation) {

        this.log.trace(`${LOG_PREFIX} Entering onUncheck()`);
        this.log.debug(`${LOG_PREFIX} Unchecked Organisation = ${JSON.stringify(organisation)}`);

        // Broadcast the unchecked Organisation
        this.log.trace(`${LOG_PREFIX} Broadcasting the unchecked Organisation`);
        this.uncheck.emit(organisation);

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
