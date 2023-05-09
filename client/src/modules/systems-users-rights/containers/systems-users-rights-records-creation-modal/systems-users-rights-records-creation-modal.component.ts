import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostListener,
    Input,
    OnDestroy,
    OnInit,
    ViewChild
} from '@angular/core';
import { SystemsUsersRightsRecordsCreationComponent } from '../../components/systems-users-rights-records-creation/systems-users-rights-records-creation.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject } from 'rxjs';

const LOG_PREFIX: string = "[Systems Users Rights Records Creation Modal]";

@Component({
    selector: 'sb-systems-users-rights-records-creation-modal',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './systems-users-rights-records-creation-modal.component.html',
    styleUrls: ['systems-users-rights-records-creation-modal.component.scss'],
})
export class SystemsUsersRightsRecordsCreationModalComponent implements OnInit, OnDestroy {

    // Allow the parent component to pass in the target system user
    @Input() public systemUserId!: number;

    // Keeps tab of the page title
    public title: string = "Create System User Right Record";

    // Keeps a reference to the Systems Users Rights Records creation component
    private _component!: SystemsUsersRightsRecordsCreationComponent;

    // Keeps tab of the previous status
    public previous: string | null = null;

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
     * Initialises the local reference to the displayed Systems Users Rights Records creation component
     */
    @ViewChild(SystemsUsersRightsRecordsCreationComponent)
    public set component(component: SystemsUsersRightsRecordsCreationComponent) {

        this.log.trace(`${LOG_PREFIX} Entering setComponent()`);

        if (component) {
            this._component = component;
        }
    }


    /**
     * Sets the processing status to 'saving' and invokes the save function in 
     * the Entities Records creation component
     */
    onSave() {

        this.log.trace(`${LOG_PREFIX} Entering onSave()`);

        // Set the status to 'saving'
        this.log.trace(`${LOG_PREFIX} Setting the status to 'saving'`);
        this._statusSubject$.next("saving");

        // Call the save function in the Entities Records creation component
        this.log.trace(`${LOG_PREFIX} Calling the save function in the Entities Records creation component`);
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
     * Sets the processing status to 'locations-selections'
     */
    public onOpenLocationSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering onOpenLocationSelector()`);

        // Capture and set the current status as the new 'previous status'
        this.previous = this._statusSubject$.value;

        // Set the new status to 'locations-selections'
        this.log.trace(`${LOG_PREFIX} Setting the new status to 'locations-selections'`);
        this._statusSubject$.next("locations-selections");

        this.cd.detectChanges();

    }


    /**
     * Close the currently open selector
     */
    public closeLocationSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering closeLocationSelector()`);

        // Call the closeLocationSelector function in the Entities Records creation component
        this.log.trace(`${LOG_PREFIX} Calling the closeLocationSelector function in the Entities Records creation component`);
        this._component.closeLocationSelector();

        // Conditionally set the status to the previous status
        this.log.trace(`${LOG_PREFIX} Conditionally setting the status to '${this.previous}'`);
        if (this.previous) {
            this._statusSubject$.next(this.previous);
        }

        // Clear the previous status
        this.log.trace(`${LOG_PREFIX} Clearing the previous status`);
        this.previous = null;


    }


    /**
     * Sets the processing status to the previous status
     */
    public onCloseLocationSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering onCloseLocationSelector()`);

        // Conditionally set the status to the previous status
        this.log.trace(`${LOG_PREFIX} Conditionally setting the status to '${this.previous}'`);
        if (this.previous) {
            this._statusSubject$.next(this.previous);
        }

        // Clear the previous status
        this.log.trace(`${LOG_PREFIX} Clearing the previous status`);
        this.previous = null;

        this.cd.detectChanges();


    }


    /**
         * Sets the processing status to 'organisations-selections'
         */
    public onOpenOrganisationSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering onOpenOrganisationSelector()`);

        // Capture and set the current status as the new 'previous status'
        this.previous = this._statusSubject$.value;

        // Set the new status to 'organisations-selections'
        this.log.trace(`${LOG_PREFIX} Setting the new status to 'organisations-selections'`);
        this._statusSubject$.next("organisations-selections");

        this.cd.detectChanges();

    }


    /**
     * Close the currently open selector
     */
    public closeOrganisationSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering closeOrganisationSelector()`);

        // Call the closeOrganisationSelector function in the Entities Records creation component
        this.log.trace(`${LOG_PREFIX} Calling the closeOrganisationSelector function in the Entities Records creation component`);
        this._component.closeOrganisationSelector();

        // Conditionally set the status to the previous status
        this.log.trace(`${LOG_PREFIX} Conditionally setting the status to '${this.previous}'`);
        if (this.previous) {
            this._statusSubject$.next(this.previous);
        }

        // Clear the previous status
        this.log.trace(`${LOG_PREFIX} Clearing the previous status`);
        this.previous = null;


    }


    /**
     * Sets the processing status to the previous status
     */
    public onCloseOrganisationSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering onCloseOrganisationSelector()`);

        // Conditionally set the status to the previous status
        this.log.trace(`${LOG_PREFIX} Conditionally setting the status to '${this.previous}'`);
        if (this.previous) {
            this._statusSubject$.next(this.previous);
        }

        // Clear the previous status
        this.log.trace(`${LOG_PREFIX} Clearing the previous status`);
        this.previous = null;

        this.cd.detectChanges();


    }


    /**
         * Sets the processing status to 'entities-selections'
         */
    public onOpenEntitySelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering onOpenEntitySelector()`);

        // Capture and set the current status as the new 'previous status'
        this.previous = this._statusSubject$.value;

        // Set the new status to 'entities-selections'
        this.log.trace(`${LOG_PREFIX} Setting the new status to 'entities-selections'`);
        this._statusSubject$.next("entities-selections");

        this.cd.detectChanges();

    }


    /**
     * Close the currently open selector
     */
    public closeEntitySelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering closeEntitySelector()`);

        // Call the closeEntitySelector function in the Entities Records creation component
        this.log.trace(`${LOG_PREFIX} Calling the closeEntitySelector function in the Entities Records creation component`);
        this._component.closeEntitySelector();

        // Conditionally set the status to the previous status
        this.log.trace(`${LOG_PREFIX} Conditionally setting the status to '${this.previous}'`);
        if (this.previous) {
            this._statusSubject$.next(this.previous);
        }

        // Clear the previous status
        this.log.trace(`${LOG_PREFIX} Clearing the previous status`);
        this.previous = null;


    }


    /**
     * Sets the processing status to the previous status
     */
    public onCloseEntitySelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering onCloseEntitySelector()`);

        // Conditionally set the status to the previous status
        this.log.trace(`${LOG_PREFIX} Conditionally setting the status to '${this.previous}'`);
        if (this.previous) {
            this._statusSubject$.next(this.previous);
        }

        // Clear the previous status
        this.log.trace(`${LOG_PREFIX} Clearing the previous status`);
        this.previous = null;

        this.cd.detectChanges();


    }



}
