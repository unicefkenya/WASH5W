import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { AdministrativeSystem } from '@modules/administrative-systems/models/administrative-system.model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Administrative Systems Records Tabulation Modal]";

@Component({
    selector: 'sb-administrative-systems-records-selection-modal',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './administrative-systems-records-selection-modal.component.html',
    styleUrls: ['administrative-systems-records-selection-modal.component.scss'],
})
export class AdministrativeSystemsRecordsSelectionModalComponent implements OnInit {

    // Allows the parent component to inject the desired selection mode: single or multi
    @Input() public selectionMode: string = "single";

    // Allows the parent component to inject the desired Administrative Systems
    @Input() public desired: number[] = [];

    // Allows the parent component to inject the undesired Administrative Systems
    // Ignored if the desired Administrative Systems has been specified
    @Input() public undesired: number[] = [];

    // Allows the parent component to inject the previously selected Administrative Systems
    @Input() public selected: number[] = [];

    // Propagates radio buttons selection events
    @Output() public select: EventEmitter<AdministrativeSystem> = new EventEmitter<AdministrativeSystem>();

    // Propagates checkboxes check events
    @Output() public check: EventEmitter<AdministrativeSystem> = new EventEmitter<AdministrativeSystem>();

    // Propagates checkboxes uncheck events
    @Output() public uncheck: EventEmitter<AdministrativeSystem> = new EventEmitter<AdministrativeSystem>();  
    
    // Keeps tab of the page title
    public title: string = "Select Administrative System Record";    

    constructor(private log: NGXLogger, public activeContextsModal: NgbActiveModal) { }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);
    }


    @HostListener('window:beforeunload')
    ngOnDestroy() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

    }

    /** 
    * Propagates AdministrativeSystem Selection Events
    * @param administrativeSystem The Selected AdministrativeSystem
    */
     onSelect(administrativeSystem: AdministrativeSystem) {

        this.log.trace(`${LOG_PREFIX} Entering onSelect()`);
        this.log.debug(`${LOG_PREFIX} Selected Administrative System = ${JSON.stringify(administrativeSystem)}`);

        // Broadcast the selected AdministrativeSystem
        this.log.trace(`${LOG_PREFIX} Broadcasting the selected Administrative System`);
        this.select.emit(administrativeSystem);
    }


    /** 
    * Propagates Administrative Systems Checkboxes Check Events
    * @param administrativeSystem The Checked AdministrativeSystem
    */
    onCheck(administrativeSystem: AdministrativeSystem) {

        this.log.trace(`${LOG_PREFIX} Entering onCheck()`);
        this.log.debug(`${LOG_PREFIX} Checked Administrative System = ${JSON.stringify(administrativeSystem)}`);

        // Broadcast the checked AdministrativeSystem
        this.log.trace(`${LOG_PREFIX} Broadcasting the checked Administrative System`);
        this.check.emit(administrativeSystem);
    }


    /** 
    * Propagates Administrative Systems Checkboxes Uncheck Events
    * @param administrativeSystem The Unchecked AdministrativeSystem
    */
    onUncheck(administrativeSystem: AdministrativeSystem) {

        this.log.trace(`${LOG_PREFIX} Entering onUncheck()`);
        this.log.debug(`${LOG_PREFIX} Unchecked Administrative System = ${JSON.stringify(administrativeSystem)}`);

        // Broadcast the unchecked AdministrativeSystem
        this.log.trace(`${LOG_PREFIX} Broadcasting the unchecked Administrative System`);
        this.uncheck.emit(administrativeSystem);

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
