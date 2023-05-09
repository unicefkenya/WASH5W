import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { SystemUserRight } from '@modules/systems-users-rights/models/system-user-right.model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Systems Users Rights Records Tabulation Modal]";

@Component({
    selector: 'sb-systems-users-rights-records-selection-modal',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './systems-users-rights-records-selection-modal.component.html',
    styleUrls: ['systems-users-rights-records-selection-modal.component.scss'],
})
export class SystemsUsersRightsRecordsSelectionModalComponent implements OnInit {

    // Allows the parent component to inject the desired selection mode: single or multi
    @Input() public selectionMode: string = "single";

    // Allows the parent component to inject the desired Systems Users Rights
    @Input() public desired: number[] = [];

    // Allows the parent component to inject the undesired Systems Users Rights
    // Ignored if the desired Systems Users Rights has been specified
    @Input() public undesired: number[] = [];

    // Allows the parent component to inject the previously selected Systems Users Rights
    @Input() public selected: number[] = [];

    // Propagates radio buttons selection events
    @Output() public select: EventEmitter<SystemUserRight> = new EventEmitter<SystemUserRight>();

    // Propagates checkboxes check events
    @Output() public check: EventEmitter<SystemUserRight> = new EventEmitter<SystemUserRight>();

    // Propagates checkboxes uncheck events
    @Output() public uncheck: EventEmitter<SystemUserRight> = new EventEmitter<SystemUserRight>();  
    
    // Keeps tab of the page title
    public title: string = "Select System User Right Record";    

    constructor(private log: NGXLogger, public activeContextsModal: NgbActiveModal) { }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);
    }


    @HostListener('window:beforeunload')
    ngOnDestroy() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

    }

    /** 
    * Propagates SystemUserRight Selection Events
    * @param systemUserRight The Selected SystemUserRight
    */
     onSelect(systemUserRight: SystemUserRight) {

        this.log.trace(`${LOG_PREFIX} Entering onSelect()`);
        this.log.debug(`${LOG_PREFIX} Selected System User Right = ${JSON.stringify(systemUserRight)}`);

        // Broadcast the selected SystemUserRight
        this.log.trace(`${LOG_PREFIX} Broadcasting the selected System User Right`);
        this.select.emit(systemUserRight);
    }


    /** 
    * Propagates Systems Users Rights Checkboxes Check Events
    * @param systemUserRight The Checked SystemUserRight
    */
    onCheck(systemUserRight: SystemUserRight) {

        this.log.trace(`${LOG_PREFIX} Entering onCheck()`);
        this.log.debug(`${LOG_PREFIX} Checked System User Right = ${JSON.stringify(systemUserRight)}`);

        // Broadcast the checked SystemUserRight
        this.log.trace(`${LOG_PREFIX} Broadcasting the checked System User Right`);
        this.check.emit(systemUserRight);
    }


    /** 
    * Propagates Systems Users Rights Checkboxes Uncheck Events
    * @param systemUserRight The Unchecked SystemUserRight
    */
    onUncheck(systemUserRight: SystemUserRight) {

        this.log.trace(`${LOG_PREFIX} Entering onUncheck()`);
        this.log.debug(`${LOG_PREFIX} Unchecked System User Right = ${JSON.stringify(systemUserRight)}`);

        // Broadcast the unchecked SystemUserRight
        this.log.trace(`${LOG_PREFIX} Broadcasting the unchecked System User Right`);
        this.uncheck.emit(systemUserRight);

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
