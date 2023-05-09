import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { WorkflowStatus } from '@modules/workflow-statuses/models/workflow-status.model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Workflow Statuses Records Tabulation Modal]";

@Component({
    selector: 'sb-workflow-statuses-records-selection-modal',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './workflow-statuses-records-selection-modal.component.html',
    styleUrls: ['workflow-statuses-records-selection-modal.component.scss'],
})
export class WorkflowStatusesRecordsSelectionModalComponent implements OnInit {

    // Allows the parent component to inject the desired selection mode: single or multi
    @Input() public selectionMode: string = "single";

    // Allows the parent component to inject the desired Workflow Statuses
    @Input() public desired: number[] = [];

    // Allows the parent component to inject the undesired Workflow Statuses
    // Ignored if the desired Workflow Statuses has been specified
    @Input() public undesired: number[] = [];

    // Allows the parent component to inject the previously selected Workflow Statuses
    @Input() public selected: number[] = [];

    // Propagates radio buttons selection events
    @Output() public select: EventEmitter<WorkflowStatus> = new EventEmitter<WorkflowStatus>();

    // Propagates checkboxes check events
    @Output() public check: EventEmitter<WorkflowStatus> = new EventEmitter<WorkflowStatus>();

    // Propagates checkboxes uncheck events
    @Output() public uncheck: EventEmitter<WorkflowStatus> = new EventEmitter<WorkflowStatus>();  
    
    // Keeps tab of the page title
    public title: string = "Select Workflow Status Record";    

    constructor(private log: NGXLogger, public activeContextsModal: NgbActiveModal) { }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);
    }


    @HostListener('window:beforeunload')
    ngOnDestroy() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

    }

    /** 
    * Propagates WorkflowStatus Selection Events
    * @param workflowStatus The Selected WorkflowStatus
    */
     onSelect(workflowStatus: WorkflowStatus) {

        this.log.trace(`${LOG_PREFIX} Entering onSelect()`);
        this.log.debug(`${LOG_PREFIX} Selected Workflow Status = ${JSON.stringify(workflowStatus)}`);

        // Broadcast the selected WorkflowStatus
        this.log.trace(`${LOG_PREFIX} Broadcasting the selected Workflow Status`);
        this.select.emit(workflowStatus);
    }


    /** 
    * Propagates Workflow Statuses Checkboxes Check Events
    * @param workflowStatus The Checked WorkflowStatus
    */
    onCheck(workflowStatus: WorkflowStatus) {

        this.log.trace(`${LOG_PREFIX} Entering onCheck()`);
        this.log.debug(`${LOG_PREFIX} Checked Workflow Status = ${JSON.stringify(workflowStatus)}`);

        // Broadcast the checked WorkflowStatus
        this.log.trace(`${LOG_PREFIX} Broadcasting the checked Workflow Status`);
        this.check.emit(workflowStatus);
    }


    /** 
    * Propagates Workflow Statuses Checkboxes Uncheck Events
    * @param workflowStatus The Unchecked WorkflowStatus
    */
    onUncheck(workflowStatus: WorkflowStatus) {

        this.log.trace(`${LOG_PREFIX} Entering onUncheck()`);
        this.log.debug(`${LOG_PREFIX} Unchecked Workflow Status = ${JSON.stringify(workflowStatus)}`);

        // Broadcast the unchecked WorkflowStatus
        this.log.trace(`${LOG_PREFIX} Broadcasting the unchecked Workflow Status`);
        this.uncheck.emit(workflowStatus);

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
