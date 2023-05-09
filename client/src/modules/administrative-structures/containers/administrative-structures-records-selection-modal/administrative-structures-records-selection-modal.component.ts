import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { AdministrativeStructure } from '@modules/administrative-structures/models/administrative-structure.model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Administrative Structures Records Tabulation Modal]";

@Component({
    selector: 'sb-administrative-structures-records-selection-modal',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './administrative-structures-records-selection-modal.component.html',
    styleUrls: ['administrative-structures-records-selection-modal.component.scss'],
})
export class AdministrativeStructuresRecordsSelectionModalComponent implements OnInit {


    // Allows the parent component to inject the desired selection mode: single or multi
    @Input() public selectionMode: string = "single";

    // Allows the parent component to inject the desired Contexts
    @Input() public desired: AdministrativeStructure[] = [];

    // Allows the parent component to inject the undesired Contexts
    // Ignored if the desired Contexts has been specified
    @Input() public undesired: AdministrativeStructure[] = [];

    // Allows the parent component to inject the previously selected Contexts
    @Input() public selected: AdministrativeStructure[] = [];

    // Propagates radio buttons selection events
    @Output() public select: EventEmitter<AdministrativeStructure> = new EventEmitter<AdministrativeStructure>();

    // Propagates checkboxes check events
    @Output() public check: EventEmitter<AdministrativeStructure> = new EventEmitter<AdministrativeStructure>();

    // Propagates checkboxes uncheck events
    @Output() public uncheck: EventEmitter<AdministrativeStructure> = new EventEmitter<AdministrativeStructure>();

    // Keeps tab of the page title
    public title: string = "Select Administrative Structure Record";

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
    * Propagates Administrative Structure Selection Events
    * @param administrativeStructure The Selected Administrative Structure
    */
    onSelect(administrativeStructure: AdministrativeStructure) {

        this.log.trace(`${LOG_PREFIX} Entering onSelect()`);
        this.log.debug(`${LOG_PREFIX} Selected Administrative Structure = ${JSON.stringify(administrativeStructure)}`);

        // Broadcast the selected Administrative Structure
        this.log.trace(`${LOG_PREFIX} Broadcasting the selected Administrative Structure`);
        this.select.emit(administrativeStructure);
    }


    /** 
    * Propagates Contexts Checkboxes Check Events
    * @param administrativeStructure The Checked Administrative Structure
    */
    onCheck(administrativeStructure: AdministrativeStructure) {

        this.log.trace(`${LOG_PREFIX} Entering onCheck()`);
        this.log.debug(`${LOG_PREFIX} Checked Administrative Structure = ${JSON.stringify(administrativeStructure)}`);

        // Broadcast the checked Administrative Structure
        this.log.trace(`${LOG_PREFIX} Broadcasting the checked Administrative Structure`);
        this.check.emit(administrativeStructure);
    }


    /** 
    * Propagates Contexts Checkboxes Uncheck Events
    * @param administrativeStructure The Unchecked Administrative Structure
    */
    onUncheck(administrativeStructure: AdministrativeStructure) {

        this.log.trace(`${LOG_PREFIX} Entering onUncheck()`);
        this.log.debug(`${LOG_PREFIX} Unchecked Administrative Structure = ${JSON.stringify(administrativeStructure)}`);

        // Broadcast the unchecked Administrative Structure
        this.log.trace(`${LOG_PREFIX} Broadcasting the unchecked Administrative Structure`);
        this.uncheck.emit(administrativeStructure);

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
