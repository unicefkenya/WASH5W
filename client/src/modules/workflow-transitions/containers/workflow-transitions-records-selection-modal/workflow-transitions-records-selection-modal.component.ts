import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { WorkflowTransition } from '@modules/workflow-transitions/models/workflow-transition.model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Workflow Transitions Records Tabulation Modal]";

@Component({
    selector: 'sb-workflow-transitions-records-selection-modal',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './workflow-transitions-records-selection-modal.component.html',
    styleUrls: ['workflow-transitions-records-selection-modal.component.scss'],
})
export class WorkflowTransitionsRecordsSelectionModalComponent implements OnInit {


    // Allows the from component to inject the desired selection mode: single or multi
    @Input() public selectionMode: string = "single";

    // Allows the from component to inject the desired Contexts
    @Input() public desired: WorkflowTransition[] = [];

    // Allows the from component to inject the undesired Contexts
    // Ignored if the desired Contexts has been specified
    @Input() public undesired: WorkflowTransition[] = [];

    // Allows the from component to inject the previously selected Contexts
    @Input() public selected: WorkflowTransition[] = [];

    // Propagates radio buttons selection events
    @Output() public select: EventEmitter<WorkflowTransition> = new EventEmitter<WorkflowTransition>();

    // Propagates checkboxes check events
    @Output() public check: EventEmitter<WorkflowTransition> = new EventEmitter<WorkflowTransition>();

    // Propagates checkboxes uncheck events
    @Output() public uncheck: EventEmitter<WorkflowTransition> = new EventEmitter<WorkflowTransition>();

    // Keeps tab of the page title
    public title: string = "Select Workflow Transition Record";

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
    * Propagates Workflow Transition Selection Events
    * @param workflowTransition The Selected Workflow Transition
    */
    onSelect(workflowTransition: WorkflowTransition) {

        this.log.trace(`${LOG_PREFIX} Entering onSelect()`);
        this.log.debug(`${LOG_PREFIX} Selected Workflow Transition = ${JSON.stringify(workflowTransition)}`);

        // Broadcast the selected Workflow Transition
        this.log.trace(`${LOG_PREFIX} Broadcasting the selected Workflow Transition`);
        this.select.emit(workflowTransition);
    }


    /** 
    * Propagates Contexts Checkboxes Check Events
    * @param workflowTransition The Checked Workflow Transition
    */
    onCheck(workflowTransition: WorkflowTransition) {

        this.log.trace(`${LOG_PREFIX} Entering onCheck()`);
        this.log.debug(`${LOG_PREFIX} Checked Workflow Transition = ${JSON.stringify(workflowTransition)}`);

        // Broadcast the checked Workflow Transition
        this.log.trace(`${LOG_PREFIX} Broadcasting the checked Workflow Transition`);
        this.check.emit(workflowTransition);
    }


    /** 
    * Propagates Contexts Checkboxes Uncheck Events
    * @param workflowTransition The Unchecked Workflow Transition
    */
    onUncheck(workflowTransition: WorkflowTransition) {

        this.log.trace(`${LOG_PREFIX} Entering onUncheck()`);
        this.log.debug(`${LOG_PREFIX} Unchecked Workflow Transition = ${JSON.stringify(workflowTransition)}`);

        // Broadcast the unchecked Workflow Transition
        this.log.trace(`${LOG_PREFIX} Broadcasting the unchecked Workflow Transition`);
        this.uncheck.emit(workflowTransition);

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
