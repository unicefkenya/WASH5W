import {
    ChangeDetectionStrategy,
    Component,
    HostListener,
    Input,
    OnInit,
    ViewChild
} from '@angular/core';
import { TimePeriodsRecordsClosureComponent } from '../../components/time-periods-records-closure/time-periods-records-closure.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject, timer } from 'rxjs';

const LOG_PREFIX: string = "[Times Periods Records Closure Modal]";

@Component({
    selector: 'sb-time-periods-records-closure-modal',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './time-periods-records-closure-modal.component.html',
    styleUrls: ['time-periods-records-closure-modal.component.scss'],
})
export class TimePeriodsRecordsClosureModalComponent implements OnInit {

    // Allows the parent component to inject the unique identifier of the target Time Period record
    @Input() public id!: number;

    // Keeps tab of the page title
    public title: string = "Close Reporting Period";    

    // Keeps a reference to the Times Periods Records creation component
    private _component!: TimePeriodsRecordsClosureComponent;

    // Keeps tabs on the processing statuses
    private _statusSubject$ = new BehaviorSubject<string>("ready");
    readonly status$ = this._statusSubject$.asObservable();

    constructor(
        public activeTimePeriodsModal: NgbActiveModal,
        private log: NGXLogger) { }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);
    }


    @HostListener('window:beforeunload')
    ngOnDestroy() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

    }

    /**
     * Initialises the local reference to the displayed Times Periods Records deletion component
     */
    @ViewChild(TimePeriodsRecordsClosureComponent)
    public set component(component: TimePeriodsRecordsClosureComponent) {

        this.log.trace(`${LOG_PREFIX} Entering setComponent()`);

        if (component) {
            this._component = component;
        }
    }

    /**
     * Sets the processing status to 'closing' and invokes the delete function in 
     * the Times Periods Records deletion component
     */
     onClose() {

        this.log.trace(`${LOG_PREFIX} Entering onClose()`);

        // Set the status to 'closing'
        this.log.trace(`${LOG_PREFIX} Setting the status to 'closing'`);
        this._statusSubject$.next("closing");

        // Call the save function in the Times Periods Records closing component
        this.log.trace(`${LOG_PREFIX} Calling the save function in the Times Periods Records closing component`);
        this._component.close();
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
            this.activeTimePeriodsModal.close();

        })


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
        this.activeTimePeriodsModal.close();
    }

    /**
     * Closes the modal
     */
     onDone() {

        this.log.trace(`${LOG_PREFIX} Entering onDone()`);

        // Close the modal
        this.log.trace(`${LOG_PREFIX} Closing the modal`);
        this.activeTimePeriodsModal.close();
    }      



}
