import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { SystemModule } from '@modules/systems-modules/models/system-module.model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Systems Modules Records Tabulation Modal]";

@Component({
    selector: 'sb-systemsModules-records-selection-modal',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './systems-modules-records-selection-modal.component.html',
    styleUrls: ['systems-modules-records-selection-modal.component.scss'],
})
export class SystemsModulesRecordsSelectionModalComponent implements OnInit {

    // Allows the parent component to inject the desired selection mode: single or multi
    @Input() public selectionMode: string = "single";

    // Allows the parent component to inject the desired Systems Modules
    @Input() public desired: number[] = [];

    // Allows the parent component to inject the undesired Systems Modules
    // Ignored if the desired Systems Modules has been specified
    @Input() public undesired: number[] = [];

    // Allows the parent component to inject the previously selected Systems Modules
    @Input() public selected: number[] = [];

    // Propagates radio buttons selection events
    @Output() public select: EventEmitter<SystemModule> = new EventEmitter<SystemModule>();

    // Propagates checkboxes check events
    @Output() public check: EventEmitter<SystemModule> = new EventEmitter<SystemModule>();

    // Propagates checkboxes uncheck events
    @Output() public uncheck: EventEmitter<SystemModule> = new EventEmitter<SystemModule>();  
    
    // Keeps tab of the page title
    public title: string = "Select Systems Modules Record";    

    constructor(private log: NGXLogger, public activeContextsModal: NgbActiveModal) { }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);
    }


    @HostListener('window:beforeunload')
    ngOnDestroy() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

    }

    /** 
    * Propagates SystemModule Selection Events
    * @param systemModule The Selected SystemModule
    */
     onSelect(systemModule: SystemModule) {

        this.log.trace(`${LOG_PREFIX} Entering onSelect()`);
        this.log.debug(`${LOG_PREFIX} Selected System Module = ${JSON.stringify(systemModule)}`);

        // Broadcast the selected SystemModule
        this.log.trace(`${LOG_PREFIX} Broadcasting the selected System Module`);
        this.select.emit(systemModule);
    }


    /** 
    * Propagates Systems Modules Checkboxes Check Events
    * @param systemModule The Checked SystemModule
    */
    onCheck(systemModule: SystemModule) {

        this.log.trace(`${LOG_PREFIX} Entering onCheck()`);
        this.log.debug(`${LOG_PREFIX} Checked System Module = ${JSON.stringify(systemModule)}`);

        // Broadcast the checked SystemModule
        this.log.trace(`${LOG_PREFIX} Broadcasting the checked System Module`);
        this.check.emit(systemModule);
    }


    /** 
    * Propagates Systems Modules Checkboxes Uncheck Events
    * @param systemModule The Unchecked SystemModule
    */
    onUncheck(systemModule: SystemModule) {

        this.log.trace(`${LOG_PREFIX} Entering onUncheck()`);
        this.log.debug(`${LOG_PREFIX} Unchecked System Module = ${JSON.stringify(systemModule)}`);

        // Broadcast the unchecked SystemModule
        this.log.trace(`${LOG_PREFIX} Broadcasting the unchecked System Module`);
        this.uncheck.emit(systemModule);

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
