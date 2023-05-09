import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostListener,
    OnDestroy,
    OnInit,
    ViewChild
} from '@angular/core';
import { LocationsDataFormsResponsesRecordsCreationComponent } from '@modules/data-forms-responses/components/locations-data-forms-responses-records-creation/locations-data-forms-responses-records-creation.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject, Subscription, timer } from 'rxjs';

const LOG_PREFIX: string = "[Locations-Data Forms Responses Records Creation Modal]";

@Component({
    selector: 'sb-locations-data-forms-responses-records-creation-modal',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './locations-data-forms-responses-records-creation-modal.component.html',
    styleUrls: ['locations-data-forms-responses-records-creation-modal.component.scss'],
})
export class LocationsDataFormsResponsesRecordsCreationModalComponent implements OnInit, OnDestroy {

    // Keeps tab of the page title
    public title: string = "Report";

    // Keeps a reference to the Data Forms Responses Records creation component
    private _component!: LocationsDataFormsResponsesRecordsCreationComponent;

    // Keeps tabs on the processing statuses
    private _statusSubject$ = new BehaviorSubject<string>("ready");
    readonly status$ = this._statusSubject$.asObservable();

    constructor(
        public activeLocationsDataFormsResponsesModal: NgbActiveModal,
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
     * Initialises the local reference to the displayed Data Forms Responses Records creation component
     */
    @ViewChild(LocationsDataFormsResponsesRecordsCreationComponent)
    public set component(component: LocationsDataFormsResponsesRecordsCreationComponent) {

        this.log.trace(`${LOG_PREFIX} Entering setComponent()`);

        if (component) {
            this._component = component;
        }
    }


    /**
     * Sets the processing status to 'saving' and invokes the save function in 
     * the Data Forms Responses Records creation component
     */
    onSave() {

        this.log.trace(`${LOG_PREFIX} Entering onSave()`);

        // Set the status to 'saving'
        this.log.trace(`${LOG_PREFIX} Setting the status to 'saving'`);
        this._statusSubject$.next("saving");

        // Call the save function in the Data Forms Responses Records creation component
        this.log.trace(`${LOG_PREFIX} Calling the save function in the Data Forms Responses Records creation component`);
        this._component.save();
    }

    /**
     * Sets the processing status to 'succeeded'
     */
    onSucceeded() {

        this.log.trace(`${LOG_PREFIX} Entering onSucceeded()`);

        // Set the status to 'done'
        this.log.trace(`${LOG_PREFIX} Setting the status to 'done'`);
        this._statusSubject$.next("done");

        timer(1000).subscribe(x => {

            // Close the modal
            this.log.trace(`${LOG_PREFIX} Closing the modal`);
            this.activeLocationsDataFormsResponsesModal.close();

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
        this.activeLocationsDataFormsResponsesModal.close();
    }

    /**
     * Closes the modal
     */
     onDone() {

        this.log.trace(`${LOG_PREFIX} Entering onDone()`);

        // Close the modal
        this.log.trace(`${LOG_PREFIX} Closing the modal`);
        this.activeLocationsDataFormsResponsesModal.close();
    } 
    


    /**
     * Sets the processing status to 'locations-selections'
     */
     public onOpenLocationSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering onOpenLocationSelector()`);

        // Set the new status to 'locations-selections'
        this.log.trace(`${LOG_PREFIX} Setting the new status to 'locations-selections'`);
        this._statusSubject$.next("locations-selections");

        this.cd.detectChanges();

    }


    
    /**
     * Close the currently open from types selector
     */
    public closeLocationSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering closeLocationSelector()`);

        // Call the closeLocationSelector function in the Location Transitions Records creation component
        this.log.trace(`${LOG_PREFIX} Calling the closeLocationSelector function in the Location Transitions Records creation component`);
        this._component.closeLocationSelector();

    }


    /**
     * Sets the processing status to the previous status
     */
    public onCloseLocationSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering onCloseLocationSelector()`);

        // Reset the status to ready
        this.log.trace(`${LOG_PREFIX} Resetting the status to 'ready'`);
        this._statusSubject$.next("ready");

        this.cd.detectChanges();


    }


}
