import {
    ChangeDetectionStrategy,
    Component,
    HostListener,
    Input,
    OnInit,
    ViewChild
} from '@angular/core';
import { WorkflowTransitionsRecordsDeletionComponent } from '../../components/workflow-transitions-records-deletion/workflow-transitions-records-deletion.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject, timer } from 'rxjs';

const LOG_PREFIX: string = "[Workflow Transitions Records Deletion Modal]";

@Component({
    selector: 'sb-workflow-transitions-records-deletion-modal',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './workflow-transitions-records-deletion-modal.component.html',
    styleUrls: ['workflow-transitions-records-deletion-modal.component.scss'],
})
export class WorkflowTransitionsRecordsDeletionModalComponent implements OnInit {

    // Allows the from component to inject the unique identifier of the target Workflow Transition record
    @Input() public id!: number;

    // Keeps tab of the page title
    public title: string = "Delete Workflow Transition Record";    

    // Keeps a reference to the Workflow Transitions Records creation component
    private _component!: WorkflowTransitionsRecordsDeletionComponent;

    // Keeps tabs on the processing statuses
    private _statusSubject$ = new BehaviorSubject<string>("ready");
    readonly status$ = this._statusSubject$.asObservable();

    constructor(
        public activeContextsModal: NgbActiveModal,
        private log: NGXLogger) { }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);
    }


    @HostListener('window:beforeunload')
    ngOnDestroy() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

    }

    /**
     * Initialises the local reference to the displayed Workflow Transitions Records deletion component
     */
    @ViewChild(WorkflowTransitionsRecordsDeletionComponent)
    public set component(component: WorkflowTransitionsRecordsDeletionComponent) {

        this.log.trace(`${LOG_PREFIX} Entering setComponent()`);

        if (component) {
            this._component = component;
        }
    }

    /**
     * Sets the processing status to 'deleting' and invokes the delete function in 
     * the Workflow Transitions Records deletion component
     */
     onDelete() {

        this.log.trace(`${LOG_PREFIX} Entering onDelete()`);

        // Set the status to 'deleting'
        this.log.trace(`${LOG_PREFIX} Setting the status to 'deleting'`);
        this._statusSubject$.next("deleting");

        // Call the save function in the Workflow Transitions Records deleting component
        this.log.trace(`${LOG_PREFIX} Calling the save function in the Workflow Transitions Records deleting component`);
        this._component.delete();
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

}
