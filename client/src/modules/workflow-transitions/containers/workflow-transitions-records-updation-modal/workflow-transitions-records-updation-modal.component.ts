import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostListener,
    Input,
    OnInit,
    ViewChild
} from '@angular/core';
import { WorkflowTransitionsRecordsUpdationComponent } from '../../components/workflow-transitions-records-updation/workflow-transitions-records-updation.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject, timer } from 'rxjs';


const LOG_PREFIX: string = "[Workflow Transitions Records Updation Modal]";

@Component({
    selector: 'sb-workflow-transitions-records-updation-modal',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './workflow-transitions-records-updation-modal.component.html',
    styleUrls: ['workflow-transitions-records-updation-modal.component.scss'],
})
export class WorkflowTransitionsRecordsUpdationModalComponent implements OnInit {

    // Allows the from component to inject the unique identifier of the target Workflow Transition record
    @Input() public id!: number;

    // Keeps tab of the page title
    public title: string = "Update Workflow Transition Record";

    // Keeps a reference to the Workflow Transitions Records creation component
    private _component!: WorkflowTransitionsRecordsUpdationComponent;

    // Keeps tabs on the processing statuses
    private _statusSubject$ = new BehaviorSubject<string>("ready");
    readonly status$ = this._statusSubject$.asObservable();

    constructor(
        public activeContextsModal: NgbActiveModal,
        private cd: ChangeDetectorRef,
        private log: NGXLogger) { }


    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);
    }


    @HostListener('window:beforeunload')
    ngOnDestroy() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

    }

    /**
     * Initialises the local reference to the displayed Workflow Transitions Records updation component
     */
    @ViewChild(WorkflowTransitionsRecordsUpdationComponent)
    public set component(component: WorkflowTransitionsRecordsUpdationComponent) {

        this.log.trace(`${LOG_PREFIX} Entering setComponent()`);

        if (component) {
            this._component = component;
        }
    }

    /**
     * Sets the processing status to 'saving' and invokes the save function in 
     * the Workflow Transitions Records updation component
     */
    onSave() {

        this.log.trace(`${LOG_PREFIX} Entering onSave()`);

        // Set the status to 'saving'
        this.log.trace(`${LOG_PREFIX} Setting the status to 'saving'`);
        this._statusSubject$.next("saving");

        // Call the save function in the Workflow Transitions Records updation component
        this.log.trace(`${LOG_PREFIX} Calling the save function in the Workflow Transitions Records updation component`);
        this._component.save();
    }

    /**
     * Sets the processing status to 'done' and then autocloses the modal after a short delay
     */
    onSucceeded() {

        this.log.trace(`${LOG_PREFIX} Entering onSucceeded()`);

        // Set the status to 'done'
        this.log.trace(`${LOG_PREFIX} Setting the status to 'done'`);
        this._statusSubject$.next("done");

        timer(1000).subscribe(x => {

            // Close the modal
            this.log.trace(`${LOG_PREFIX} Closing the modal`);
            this.activeContextsModal.close();

        })


    }

    /**
     * Sets the processing status to either 'failed' or 'invalid' depending on 
     * whether a workflow error or user error was encountered respectively
     */
    onFailed(errorCode: number) {

        this.log.trace(`${LOG_PREFIX} Entering onFailed()`);
        this.log.debug(`${LOG_PREFIX} Error Code = ${errorCode}`);

        switch (errorCode) {

            case 400:

                // Set the status to 'invalid'
                this.log.trace(`${LOG_PREFIX} Setting the status to 'invalid'`);
                this._statusSubject$.next("invalid");

                break;

            default:

                // Set the status to 'failed'
                this.log.trace(`${LOG_PREFIX} Setting the status to 'failed'`);
                this._statusSubject$.next("failed");

        }

    }

    /**
     * Sets the processing status to 'retrying'
     */
    onRetry() {

        this.log.trace(`${LOG_PREFIX} Entering onRetry()`);

        // Set the status to 'retrying'
        this.log.trace(`${LOG_PREFIX} Setting the status to 'retrying'`);
        this._statusSubject$.next("retrying");

    }

    /**
     * Sets the processing status to 'done' and closes the modal
     */
    onQuit() {

        this.log.trace(`${LOG_PREFIX} Entering onQuit()`);

        // Set the status to 'done'
        this.log.trace(`${LOG_PREFIX} Setting the status to 'done'`);
        this._statusSubject$.next("done");


        // Close the modal
        this.log.trace(`${LOG_PREFIX} Closing the modal`);
        this.activeContextsModal.close();
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


    /**
     * Sets the processing status to 'workflows-selections'
     */
    public onOpenWorkflowSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering onOpenWorkflowSelector()`);

        // Set the new status to 'workflows-selections'
        this.log.trace(`${LOG_PREFIX} Setting the new status to 'workflows-selections'`);
        this._statusSubject$.next("workflows-selections");

        this.cd.detectChanges();

    }



    /**
     * Close the currently open from types selector
     */
    public closeWorkflowSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering closeWorkflowSelector()`);

        // Call the closeWorkflowSelector function in the Workflow Transitions Records creation component
        this.log.trace(`${LOG_PREFIX} Calling the closeWorkflowSelector function in the Workflow Transitions Records creation component`);
        this._component.closeWorkflowSelector();


    }


    /**
     * Sets the processing status to the previous status
     */
    public onCloseWorkflowSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering onCloseWorkflowSelector()`);

        // Reset the status to ready
        this.log.trace(`${LOG_PREFIX} Resetting the status to 'ready'`);
        this._statusSubject$.next("ready");

        this.cd.detectChanges();


    }


    /**
     * Sets the processing status to 'from-statuses-selections'
     */
    public onOpenFromWorkflowStatusSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering onOpenFromWorkflowStatusSelector()`);

        // Set the new status to 'from-statuses-selections'
        this.log.trace(`${LOG_PREFIX} Setting the new status to 'from-statuses-selections'`);
        this._statusSubject$.next("from-statuses-selections");

        this.cd.detectChanges();

    }



    /**
     * Close the currently open from types selector
     */
    public closeFromWorkflowStatusSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering closeFromWorkflowStatusSelector()`);

        // Call the closeFromWorkflowStatusSelector function in the Workflow Transitions Records creation component
        this.log.trace(`${LOG_PREFIX} Calling the closeFromWorkflowStatusSelector function in the Workflow Transitions Records creation component`);
        this._component.closeFromWorkflowStatusSelector();


    }


    /**
     * Sets the processing status to the previous status
     */
    public onCloseFromWorkflowStatusSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering onCloseFromWorkflowStatusSelector()`);

        // Reset the status to ready
        this.log.trace(`${LOG_PREFIX} Resetting the status to 'ready'`);
        this._statusSubject$.next("ready");

        this.cd.detectChanges();


    }



    /**
     * Sets the processing status to 'to-statuses-selections'
     */
    public onOpenToWorkflowStatusSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering onOpenToWorkflowStatusSelector()`);

        // Set the new status to 'to-statuses-selections'
        this.log.trace(`${LOG_PREFIX} Setting the new status to 'to-statuses-selections'`);
        this._statusSubject$.next("to-statuses-selections");

        this.cd.detectChanges();

    }





    /**
     * Close the currently open to types selector
     */
    public closeToWorkflowStatusSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering closeToWorkflowStatusSelector()`);

        // Call the closeToWorkflowStatusSelector function in the Workflow Transitions Records creation component
        this.log.trace(`${LOG_PREFIX} Calling the closeToWorkflowStatusSelector function in the Workflow Transitions Records creation component`);
        this._component.closeToWorkflowStatusSelector();


    }



    /**
     * Sets the processing status to the previous status
     */
    public onCloseToWorkflowStatusSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering onCloseToWorkflowStatusSelector()`);

        // Reset the status to ready
        this.log.trace(`${LOG_PREFIX} Resetting the status to 'ready'`);
        this._statusSubject$.next("ready");

        this.cd.detectChanges();


    }




    /**
     * Sets the processing status to 'permissions-selections'
     */
     public onOpenPermissionSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering onOpenPermissionSelector()`);

        // Set the new status to 'permissions-selections'
        this.log.trace(`${LOG_PREFIX} Setting the new status to 'permissions-selections'`);
        this._statusSubject$.next("permissions-selections");

        this.cd.detectChanges();

    }



    /**
     * Close the currently open from types selector
     */
    public closePermissionSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering closePermissionSelector()`);

        // Call the closePermissionSelector function in the Permission Transitions Records creation component
        this.log.trace(`${LOG_PREFIX} Calling the closePermissionSelector function in the Permission Transitions Records creation component`);
        this._component.closePermissionSelector();


    }


    /**
     * Sets the processing status to the previous status
     */
    public onClosePermissionSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering onClosePermissionSelector()`);

        // Reset the status to ready
        this.log.trace(`${LOG_PREFIX} Resetting the status to 'ready'`);
        this._statusSubject$.next("ready");

        this.cd.detectChanges();


    }


}
