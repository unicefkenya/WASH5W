import {
    ChangeDetectionStrategy,
    Component,
    HostListener,
    Input,
    OnInit,
    ViewChild
} from '@angular/core';
import { AdministrativeSystemsRecordsDeletionComponent } from '../../components/administrative-systems-records-deletion/administrative-systems-records-deletion.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject, timer } from 'rxjs';

const LOG_PREFIX: string = "[Administrative Systems Records Deletion Modal]";

@Component({
    selector: 'sb-administrative-systems-records-deletion-modal',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './administrative-systems-records-deletion-modal.component.html',
    styleUrls: ['administrative-systems-records-deletion-modal.component.scss'],
})
export class AdministrativeSystemsRecordsDeletionModalComponent implements OnInit {

    // Allows the parent component to inject the unique identifier of the target Administrative System record
    @Input() public id!: number;

    // Keeps tab of the page title
    public title: string = "Delete Administrative System Record";    

    // Keeps a reference to the Administrative Systems Records creation component
    private _component!: AdministrativeSystemsRecordsDeletionComponent;

    // Keeps tabs on the processing statuses
    private _statusSubject$ = new BehaviorSubject<string>("ready");
    readonly status$ = this._statusSubject$.asObservable();

    constructor(
        public activeAdministrativeSystemsModal: NgbActiveModal,
        private log: NGXLogger) { }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);
    }


    @HostListener('window:beforeunload')
    ngOnDestroy() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

    }

    /**
     * Initialises the local reference to the displayed Administrative Systems Records deletion component
     */
    @ViewChild(AdministrativeSystemsRecordsDeletionComponent)
    public set component(component: AdministrativeSystemsRecordsDeletionComponent) {

        this.log.trace(`${LOG_PREFIX} Entering setComponent()`);

        if (component) {
            this._component = component;
        }
    }

    /**
     * Sets the processing status to 'deleting' and invokes the delete function in 
     * the Administrative Systems Records deletion component
     */
     onDelete() {

        this.log.trace(`${LOG_PREFIX} Entering onDelete()`);

        // Set the status to 'deleting'
        this.log.trace(`${LOG_PREFIX} Setting the status to 'deleting'`);
        this._statusSubject$.next("deleting");

        // Call the save function in the Administrative Systems Records deleting component
        this.log.trace(`${LOG_PREFIX} Calling the save function in the Administrative Systems Records deleting component`);
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
            this.activeAdministrativeSystemsModal.close();

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
        this.activeAdministrativeSystemsModal.close();
    }

    /**
     * Closes the modal
     */
     onDone() {

        this.log.trace(`${LOG_PREFIX} Entering onDone()`);

        // Close the modal
        this.log.trace(`${LOG_PREFIX} Closing the modal`);
        this.activeAdministrativeSystemsModal.close();
    }      



}
