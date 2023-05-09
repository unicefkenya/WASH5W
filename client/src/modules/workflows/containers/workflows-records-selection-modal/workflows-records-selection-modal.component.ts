import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { Workflow } from '@modules/workflows/models/workflow.model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Workflows Records Tabulation Modal]";

@Component({
    selector: 'sb-workflows-records-selection-modal',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './workflows-records-selection-modal.component.html',
    styleUrls: ['workflows-records-selection-modal.component.scss'],
})
export class WorkflowsRecordsSelectionModalComponent implements OnInit {

    // Allows the parent component to inject the desired selection mode: single or multi
    @Input() public selectionMode: string = "single";

    // Allows the parent component to inject the desired Workflows
    @Input() public desired: number[] = [];

    // Allows the parent component to inject the undesired Workflows
    // Ignored if the desired Workflows has been specified
    @Input() public undesired: number[] = [];

    // Allows the parent component to inject the previously selected Workflows
    @Input() public selected: number[] = [];

    // Propagates radio buttons selection events
    @Output() public select: EventEmitter<Workflow> = new EventEmitter<Workflow>();

    // Propagates checkboxes check events
    @Output() public check: EventEmitter<Workflow> = new EventEmitter<Workflow>();

    // Propagates checkboxes uncheck events
    @Output() public uncheck: EventEmitter<Workflow> = new EventEmitter<Workflow>();  
    
    // Keeps tab of the page title
    public title: string = "Select Workflow Record";    

    constructor(private log: NGXLogger, public activeWorkflowsModal: NgbActiveModal,) { }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);
    }

    @HostListener('window:beforeunload')
    ngOnDestroy() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

    }

    /** 
    * Propagates Workflow Selection Events
    * @param workflow The Selected Workflow
    */
     onSelect(workflow: Workflow) {

        this.log.trace(`${LOG_PREFIX} Entering onSelect()`);
        this.log.debug(`${LOG_PREFIX} Selected Workflow = ${JSON.stringify(workflow)}`);

        // Broadcast the selected Workflow
        this.log.trace(`${LOG_PREFIX} Broadcasting the selected Workflow`);
        this.select.emit(workflow);
    }


    /** 
    * Propagates Workflows Checkboxes Check Events
    * @param workflow The Checked Workflow
    */
    onCheck(workflow: Workflow) {

        this.log.trace(`${LOG_PREFIX} Entering onCheck()`);
        this.log.debug(`${LOG_PREFIX} Checked Workflow = ${JSON.stringify(workflow)}`);

        // Broadcast the checked Workflow
        this.log.trace(`${LOG_PREFIX} Broadcasting the checked Workflow`);
        this.check.emit(workflow);
    }


    /** 
    * Propagates Workflows Checkboxes Uncheck Events
    * @param workflow The Unchecked Workflow
    */
    onUncheck(workflow: Workflow) {

        this.log.trace(`${LOG_PREFIX} Entering onUncheck()`);
        this.log.debug(`${LOG_PREFIX} Unchecked Workflow = ${JSON.stringify(workflow)}`);

        // Broadcast the unchecked Workflow
        this.log.trace(`${LOG_PREFIX} Broadcasting the unchecked Workflow`);
        this.uncheck.emit(workflow);

    }
    
    /**
     * Closes the modal
     */
     onDone() {

        this.log.trace(`${LOG_PREFIX} Entering onDone()`);

        // Close the modal
        this.log.trace(`${LOG_PREFIX} Closing the modal`);
        this.activeWorkflowsModal.close();
    }
    

}
