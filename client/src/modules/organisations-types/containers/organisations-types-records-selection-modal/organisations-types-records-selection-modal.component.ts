import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { OrganisationType } from '@modules/organisations-types/models/organisation-type.model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Organisations Types Records Tabulation Modal]";

@Component({
    selector: 'sb-organisationsTypes-records-selection-modal',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './organisations-types-records-selection-modal.component.html',
    styleUrls: ['organisations-types-records-selection-modal.component.scss'],
})
export class OrganisationsTypesRecordsSelectionModalComponent implements OnInit {

    // Allows the parent component to inject the desired selection mode: single or multi
    @Input() public selectionMode: string = "single";

    // Allows the parent component to inject the desired Organisations Types
    @Input() public desired: number[] = [];

    // Allows the parent component to inject the undesired Organisations Types
    // Ignored if the desired Organisations Types has been specified
    @Input() public undesired: number[] = [];

    // Allows the parent component to inject the previously selected Organisations Types
    @Input() public selected: number[] = [];

    // Propagates radio buttons selection events
    @Output() public select: EventEmitter<OrganisationType> = new EventEmitter<OrganisationType>();

    // Propagates checkboxes check events
    @Output() public check: EventEmitter<OrganisationType> = new EventEmitter<OrganisationType>();

    // Propagates checkboxes uncheck events
    @Output() public uncheck: EventEmitter<OrganisationType> = new EventEmitter<OrganisationType>();  
    
    // Keeps tab of the page title
    public title: string = "Select Organisation Type Record";    

    constructor(private log: NGXLogger, public activeContextsModal: NgbActiveModal) { }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);
    }


    @HostListener('window:beforeunload')
    ngOnDestroy() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

    }

    /** 
    * Propagates OrganisationType Selection Events
    * @param organisationType The Selected OrganisationType
    */
     onSelect(organisationType: OrganisationType) {

        this.log.trace(`${LOG_PREFIX} Entering onSelect()`);
        this.log.debug(`${LOG_PREFIX} Selected Organisation Type = ${JSON.stringify(organisationType)}`);

        // Broadcast the selected OrganisationType
        this.log.trace(`${LOG_PREFIX} Broadcasting the selected Organisation Type`);
        this.select.emit(organisationType);
    }


    /** 
    * Propagates Organisations Types Checkboxes Check Events
    * @param organisationType The Checked OrganisationType
    */
    onCheck(organisationType: OrganisationType) {

        this.log.trace(`${LOG_PREFIX} Entering onCheck()`);
        this.log.debug(`${LOG_PREFIX} Checked Organisation Type = ${JSON.stringify(organisationType)}`);

        // Broadcast the checked OrganisationType
        this.log.trace(`${LOG_PREFIX} Broadcasting the checked Organisation Type`);
        this.check.emit(organisationType);
    }


    /** 
    * Propagates Organisations Types Checkboxes Uncheck Events
    * @param organisationType The Unchecked OrganisationType
    */
    onUncheck(organisationType: OrganisationType) {

        this.log.trace(`${LOG_PREFIX} Entering onUncheck()`);
        this.log.debug(`${LOG_PREFIX} Unchecked Organisation Type = ${JSON.stringify(organisationType)}`);

        // Broadcast the unchecked OrganisationType
        this.log.trace(`${LOG_PREFIX} Broadcasting the unchecked Organisation Type`);
        this.uncheck.emit(organisationType);

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
