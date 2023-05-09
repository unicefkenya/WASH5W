import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostListener,
    Input,
    OnDestroy,
    OnInit,
    ViewChild
} from '@angular/core';
import { LogicalSchemesRecordsCreationComponent } from '../../components/logical-schemes-records-creation/logical-schemes-records-creation.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject, Subscription } from 'rxjs';

const LOG_PREFIX: string = "[Logical Schemes Records Creation Modal]";

@Component({
    selector: 'sb-logical-schemes-records-creation-modal',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './logical-schemes-records-creation-modal.component.html',
    styleUrls: ['logical-schemes-records-creation-modal.component.scss'],
})
export class LogicalSchemesRecordsCreationModalComponent implements OnInit, OnDestroy {

    // Keeps tab of the page title
    public title: string = "Create Logical Scheme Record";

    // Keeps a reference to the Logical Schemes Records creation component
    private _component!: LogicalSchemesRecordsCreationComponent;

    // Keeps tabs on the processing statuses
    private _statusSubject$ = new BehaviorSubject<string>("ready");
    readonly status$ = this._statusSubject$.asObservable();

    constructor(
        public activeLogicalSchemesModal: NgbActiveModal,
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
     * Initialises the local reference to the displayed Logical Schemes Records creation component
     */
    @ViewChild(LogicalSchemesRecordsCreationComponent)
    public set component(component: LogicalSchemesRecordsCreationComponent) {

        this.log.trace(`${LOG_PREFIX} Entering setComponent()`);

        if (component) {
            this._component = component;
        }
    }


    /**
     * Sets the processing status to 'saving' and invokes the save function in 
     * the Logical Schemes Records creation component
     */
    onSave() {

        this.log.trace(`${LOG_PREFIX} Entering onSave()`);

        // Set the status to 'saving'
        this.log.trace(`${LOG_PREFIX} Setting the status to 'saving'`);
        this._statusSubject$.next("saving");

        // Call the save function in the Logical Schemes Records creation component
        this.log.trace(`${LOG_PREFIX} Calling the save function in the Logical Schemes Records creation component`);
        this._component.save();
    }

    /**
     * Sets the processing status to 'succeeded'
     */
    onSucceeded() {

        this.log.trace(`${LOG_PREFIX} Entering onSucceeded()`);

        // Set the status to 'succeeded'
        this.log.trace(`${LOG_PREFIX} Setting the status to 'succeeded'`);
        this._statusSubject$.next("succeeded");

        this.cd.detectChanges();
    }

    /**
     * Sets the processing status to either 'failed' or 'invalid' depending on 
     * whether a system error or user error was encountered respectively
     */
    onFailed(errorPlural: number) {

        this.log.trace(`${LOG_PREFIX} Entering onFailed()`);
        this.log.debug(`${LOG_PREFIX} Error Plural = ${errorPlural}`);

        switch (errorPlural) {

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

        this.cd.detectChanges();

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
     * Sets the processing status to 'ready'
     */
    onContinue() {

        this.log.trace(`${LOG_PREFIX} Entering onContinue()`);

        // Set the status to 'ready'
        this.log.trace(`${LOG_PREFIX} Setting the status to 'ready'`);
        this._statusSubject$.next("ready");

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
        this.activeLogicalSchemesModal.close();
    }

    /**
     * Closes the modal
     */
     onDone() {

        this.log.trace(`${LOG_PREFIX} Entering onDone()`);

        // Close the modal
        this.log.trace(`${LOG_PREFIX} Closing the modal`);
        this.activeLogicalSchemesModal.close();
    }    

}
