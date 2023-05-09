import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { Domain } from '@modules/domains/models/domain.model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Domains Records Tabulation Modal]";

@Component({
    selector: 'sb-domains-records-selection-modal',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './domains-records-selection-modal.component.html',
    styleUrls: ['domains-records-selection-modal.component.scss'],
})
export class DomainsRecordsSelectionModalComponent implements OnInit {

    // Allows the parent component to inject the desired selection mode: single or multi
    @Input() public selectionMode: string = "single";

    // Allows the parent component to inject the desired Domains
    @Input() public desired: number[] = [];

    // Allows the parent component to inject the undesired Domains
    // Ignored if the desired Domains has been specified
    @Input() public undesired: number[] = [];

    // Allows the parent component to inject the previously selected Domains
    @Input() public selected: number[] = [];

    // Propagates radio buttons selection events
    @Output() public select: EventEmitter<Domain> = new EventEmitter<Domain>();

    // Propagates checkboxes check events
    @Output() public check: EventEmitter<Domain> = new EventEmitter<Domain>();

    // Propagates checkboxes uncheck events
    @Output() public uncheck: EventEmitter<Domain> = new EventEmitter<Domain>();  
    
    // Keeps tab of the page title
    public title: string = "Select Domain Record";    

    constructor(private log: NGXLogger, public activeDomainsModal: NgbActiveModal,) { }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);
    }

    @HostListener('window:beforeunload')
    ngOnDestroy() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

    }

    /** 
    * Propagates Domain Selection Events
    * @param domain The Selected Domain
    */
     onSelect(domain: Domain) {

        this.log.trace(`${LOG_PREFIX} Entering onSelect()`);
        this.log.debug(`${LOG_PREFIX} Selected Domain = ${JSON.stringify(domain)}`);

        // Broadcast the selected Domain
        this.log.trace(`${LOG_PREFIX} Broadcasting the selected Domain`);
        this.select.emit(domain);
    }


    /** 
    * Propagates Domains Checkboxes Check Events
    * @param domain The Checked Domain
    */
    onCheck(domain: Domain) {

        this.log.trace(`${LOG_PREFIX} Entering onCheck()`);
        this.log.debug(`${LOG_PREFIX} Checked Domain = ${JSON.stringify(domain)}`);

        // Broadcast the checked Domain
        this.log.trace(`${LOG_PREFIX} Broadcasting the checked Domain`);
        this.check.emit(domain);
    }


    /** 
    * Propagates Domains Checkboxes Uncheck Events
    * @param domain The Unchecked Domain
    */
    onUncheck(domain: Domain) {

        this.log.trace(`${LOG_PREFIX} Entering onUncheck()`);
        this.log.debug(`${LOG_PREFIX} Unchecked Domain = ${JSON.stringify(domain)}`);

        // Broadcast the unchecked Domain
        this.log.trace(`${LOG_PREFIX} Broadcasting the unchecked Domain`);
        this.uncheck.emit(domain);

    }
    
    /**
     * Closes the modal
     */
     onDone() {

        this.log.trace(`${LOG_PREFIX} Entering onDone()`);

        // Close the modal
        this.log.trace(`${LOG_PREFIX} Closing the modal`);
        this.activeDomainsModal.close();
    }
    

}
