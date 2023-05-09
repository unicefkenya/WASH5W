import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { SystemModulePermission } from '@modules/systems-modules-permissions/models/system-module-permission.model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Systems Modules Permissions Records Tabulation Modal]";

@Component({
    selector: 'sb-systems-modules-permissions-records-selection-modal',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './systems-modules-permissions-records-selection-modal.component.html',
    styleUrls: ['systems-modules-permissions-records-selection-modal.component.scss'],
})
export class SystemsModulesPermissionsRecordsSelectionModalComponent implements OnInit {


    // Allows the parent component to inject the desired selection mode: single or multi
    @Input() public selectionMode: string = "single";

    // Allows the parent component to inject the desired System Modules
    @Input() public desiredTypes: number[] = [];    

    // Allows the parent component to inject the desired System Module Permission
    @Input() public desired: number[] = [];    

    // Allows the parent component to inject the undesired Systems Modules Permissions
    // Ignored if the desired Systems Modules Permissions has been specified
    @Input() public undesired: number[] = [];

    // Allows the parent component to inject the previously selected Systems Modules Permissions
    @Input() public selected: number[] = [];
    // Propagates radio buttons selection events
    @Output() public select: EventEmitter<SystemModulePermission> = new EventEmitter<SystemModulePermission>();

    // Propagates checkboxes check events
    @Output() public check: EventEmitter<SystemModulePermission> = new EventEmitter<SystemModulePermission>();

    // Propagates checkboxes uncheck events
    @Output() public uncheck: EventEmitter<SystemModulePermission> = new EventEmitter<SystemModulePermission>();

    // Keeps tab of the page title
    public title: string = "Select System Module Permission Record";

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
    * Propagates System Module Permission Selection Events
    * @param systemModulePermission The Selected System Module Permission
    */
    onSelect(systemModulePermission: SystemModulePermission) {

        this.log.trace(`${LOG_PREFIX} Entering onSelect()`);
        this.log.debug(`${LOG_PREFIX} Selected System Module Permission = ${JSON.stringify(systemModulePermission)}`);

        // Broadcast the selected System Module Permission
        this.log.trace(`${LOG_PREFIX} Broadcasting the selected System Module Permission`);
        this.select.emit(systemModulePermission);
    }


    /** 
    * Propagates Contexts Checkboxes Check Events
    * @param systemModulePermission The Checked System Module Permission
    */
    onCheck(systemModulePermission: SystemModulePermission) {

        this.log.trace(`${LOG_PREFIX} Entering onCheck()`);
        this.log.debug(`${LOG_PREFIX} Checked System Module Permission = ${JSON.stringify(systemModulePermission)}`);

        // Broadcast the checked System Module Permission
        this.log.trace(`${LOG_PREFIX} Broadcasting the checked System Module Permission`);
        this.check.emit(systemModulePermission);
    }


    /** 
    * Propagates Contexts Checkboxes Uncheck Events
    * @param systemModulePermission The Unchecked System Module Permission
    */
    onUncheck(systemModulePermission: SystemModulePermission) {

        this.log.trace(`${LOG_PREFIX} Entering onUncheck()`);
        this.log.debug(`${LOG_PREFIX} Unchecked System Module Permission = ${JSON.stringify(systemModulePermission)}`);

        // Broadcast the unchecked System Module Permission
        this.log.trace(`${LOG_PREFIX} Broadcasting the unchecked System Module Permission`);
        this.uncheck.emit(systemModulePermission);

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
