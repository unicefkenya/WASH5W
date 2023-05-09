import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { SystemUser } from '@modules/systems-users/models/system-user.model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Systems Users Records Tabulation Modal]";

@Component({
    selector: 'sb-systemsUsers-records-selection-modal',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './systems-users-records-selection-modal.component.html',
    styleUrls: ['systems-users-records-selection-modal.component.scss'],
})
export class SystemsUsersRecordsSelectionModalComponent implements OnInit {

    // Allows the parent component to inject the desired selection mode: single or multi
    @Input() public selectionMode: string = "single";

    // Allows the parent component to inject the desired Systems Users
    @Input() public desired: number[] = [];

    // Allows the parent component to inject the undesired Systems Users
    // Ignored if the desired Systems Users has been specified
    @Input() public undesired: number[] = [];

    // Allows the parent component to inject the previously selected Systems Users
    @Input() public selected: number[] = [];

    // Propagates radio buttons selection events
    @Output() public select: EventEmitter<SystemUser> = new EventEmitter<SystemUser>();

    // Propagates checkboxes check events
    @Output() public check: EventEmitter<SystemUser> = new EventEmitter<SystemUser>();

    // Propagates checkboxes uncheck events
    @Output() public uncheck: EventEmitter<SystemUser> = new EventEmitter<SystemUser>();  
    
    // Keeps tab of the page title
    public title: string = "Select Systems Users Record";    

    constructor(private log: NGXLogger, public activeContextsModal: NgbActiveModal) { }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);
    }


    @HostListener('window:beforeunload')
    ngOnDestroy() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

    }

    /** 
    * Propagates SystemUser Selection Events
    * @param systemUser The Selected SystemUser
    */
     onSelect(systemUser: SystemUser) {

        this.log.trace(`${LOG_PREFIX} Entering onSelect()`);
        this.log.debug(`${LOG_PREFIX} Selected System User = ${JSON.stringify(systemUser)}`);

        // Broadcast the selected SystemUser
        this.log.trace(`${LOG_PREFIX} Broadcasting the selected System User`);
        this.select.emit(systemUser);
    }


    /** 
    * Propagates Systems Users Checkboxes Check Events
    * @param systemUser The Checked SystemUser
    */
    onCheck(systemUser: SystemUser) {

        this.log.trace(`${LOG_PREFIX} Entering onCheck()`);
        this.log.debug(`${LOG_PREFIX} Checked System User = ${JSON.stringify(systemUser)}`);

        // Broadcast the checked SystemUser
        this.log.trace(`${LOG_PREFIX} Broadcasting the checked System User`);
        this.check.emit(systemUser);
    }


    /** 
    * Propagates Systems Users Checkboxes Uncheck Events
    * @param systemUser The Unchecked SystemUser
    */
    onUncheck(systemUser: SystemUser) {

        this.log.trace(`${LOG_PREFIX} Entering onUncheck()`);
        this.log.debug(`${LOG_PREFIX} Unchecked System User = ${JSON.stringify(systemUser)}`);

        // Broadcast the unchecked SystemUser
        this.log.trace(`${LOG_PREFIX} Broadcasting the unchecked System User`);
        this.uncheck.emit(systemUser);

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
