import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { SystemRole } from '@modules/systems-roles/models/system-role.model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Systems Roles Records Tabulation Modal]";

@Component({
    selector: 'sb-systemsRoles-records-selection-modal',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './systems-roles-records-selection-modal.component.html',
    styleUrls: ['systems-roles-records-selection-modal.component.scss'],
})
export class SystemsRolesRecordsSelectionModalComponent implements OnInit {

    // Allows the parent component to inject the desired selection mode: single or multi
    @Input() public selectionMode: string = "single";

    // Allows the parent component to inject the desired Systems Roles
    @Input() public desired: number[] = [];

    // Allows the parent component to inject the undesired Systems Roles
    // Ignored if the desired Systems Roles has been specified
    @Input() public undesired: number[] = [];

    // Allows the parent component to inject the previously selected Systems Roles
    @Input() public selected: number[] = [];

    // Propagates radio buttons selection events
    @Output() public select: EventEmitter<SystemRole> = new EventEmitter<SystemRole>();

    // Propagates checkboxes check events
    @Output() public check: EventEmitter<SystemRole> = new EventEmitter<SystemRole>();

    // Propagates checkboxes uncheck events
    @Output() public uncheck: EventEmitter<SystemRole> = new EventEmitter<SystemRole>();  
    
    // Keeps tab of the page title
    public title: string = "Select Systems Roles Record";    

    constructor(private log: NGXLogger, public activeContextsModal: NgbActiveModal) { }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);
    }


    @HostListener('window:beforeunload')
    ngOnDestroy() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

    }

    /** 
    * Propagates SystemRole Selection Events
    * @param systemRole The Selected SystemRole
    */
     onSelect(systemRole: SystemRole) {

        this.log.trace(`${LOG_PREFIX} Entering onSelect()`);
        this.log.debug(`${LOG_PREFIX} Selected System Role = ${JSON.stringify(systemRole)}`);

        // Broadcast the selected SystemRole
        this.log.trace(`${LOG_PREFIX} Broadcasting the selected System Role`);
        this.select.emit(systemRole);
    }


    /** 
    * Propagates Systems Roles Checkboxes Check Events
    * @param systemRole The Checked SystemRole
    */
    onCheck(systemRole: SystemRole) {

        this.log.trace(`${LOG_PREFIX} Entering onCheck()`);
        this.log.debug(`${LOG_PREFIX} Checked System Role = ${JSON.stringify(systemRole)}`);

        // Broadcast the checked SystemRole
        this.log.trace(`${LOG_PREFIX} Broadcasting the checked System Role`);
        this.check.emit(systemRole);
    }


    /** 
    * Propagates Systems Roles Checkboxes Uncheck Events
    * @param systemRole The Unchecked SystemRole
    */
    onUncheck(systemRole: SystemRole) {

        this.log.trace(`${LOG_PREFIX} Entering onUncheck()`);
        this.log.debug(`${LOG_PREFIX} Unchecked System Role = ${JSON.stringify(systemRole)}`);

        // Broadcast the unchecked SystemRole
        this.log.trace(`${LOG_PREFIX} Broadcasting the unchecked System Role`);
        this.uncheck.emit(systemRole);

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
