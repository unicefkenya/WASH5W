import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostListener,
    Input,
    OnInit,
    ViewChild
} from '@angular/core';
import { AdministrativeStructuresRecordsUpdationComponent } from '../../components/administrative-structures-records-updation/administrative-structures-records-updation.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject, timer } from 'rxjs';


const LOG_PREFIX: string = "[Administrative Structures Records Updation Modal]";

@Component({
    selector: 'sb-administrative-structures-records-updation-modal',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './administrative-structures-records-updation-modal.component.html',
    styleUrls: ['administrative-structures-records-updation-modal.component.scss'],
})
export class AdministrativeStructuresRecordsUpdationModalComponent implements OnInit {

    // Allows the parent component to inject the unique identifier of the target Administrative Structure record
    @Input() public id!: number;

    // Keeps tab of the page title
    public title: string = "Update Administrative Structure Record";

    // Keeps a reference to the Administrative Structures Records creation component
    private _component!: AdministrativeStructuresRecordsUpdationComponent;

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
     * Initialises the local reference to the displayed Administrative Structures Records updation component
     */
    @ViewChild(AdministrativeStructuresRecordsUpdationComponent)
    public set component(component: AdministrativeStructuresRecordsUpdationComponent) {

        this.log.trace(`${LOG_PREFIX} Entering setComponent()`);

        if (component) {
            this._component = component;
        }
    }

    /**
     * Sets the processing status to 'saving' and invokes the save function in 
     * the Administrative Structures Records updation component
     */
    onSave() {

        this.log.trace(`${LOG_PREFIX} Entering onSave()`);

        // Set the status to 'saving'
        this.log.trace(`${LOG_PREFIX} Setting the status to 'saving'`);
        this._statusSubject$.next("saving");

        // Call the save function in the Administrative Structures Records updation component
        this.log.trace(`${LOG_PREFIX} Calling the save function in the Administrative Structures Records updation component`);
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
     * Sets the processing status to 'systems-selections'
     */
    public onOpenSystemSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering onOpenSystemSelector()`);

        // Set the new status to 'systems-selections'
        this.log.trace(`${LOG_PREFIX} Setting the new status to 'systems-selections'`);
        this._statusSubject$.next("systems-selections");

        this.cd.detectChanges();

    }



    /**
     * Close the currently open parent types selector
     */
    public closeSystemSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering closeSystemSelector()`);

        // Call the closeSystemSelector function in the Administrative Structures Records creation component
        this.log.trace(`${LOG_PREFIX} Calling the closeSystemSelector function in the Administrative Structures Records creation component`);
        this._component.closeSystemSelector();


    }


    /**
     * Sets the processing status to the previous status
     */
    public onCloseSystemSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering onCloseSystemSelector()`);

        // Reset the status to ready
        this.log.trace(`${LOG_PREFIX} Resetting the status to 'ready'`);
        this._statusSubject$.next("ready");

        this.cd.detectChanges();


    }


    /**
     * Sets the processing status to 'parent-types-selections'
     */
    public onOpenParentAdministrativeUnitTypeSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering onOpenParentAdministrativeUnitTypeSelector()`);

        // Set the new status to 'parent-types-selections'
        this.log.trace(`${LOG_PREFIX} Setting the new status to 'parent-types-selections'`);
        this._statusSubject$.next("parent-types-selections");

        this.cd.detectChanges();

    }



    /**
     * Close the currently open parent types selector
     */
    public closeParentAdministrativeUnitTypeSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering closeParentAdministrativeUnitTypeSelector()`);

        // Call the closeParentAdministrativeUnitTypeSelector function in the Administrative Structures Records creation component
        this.log.trace(`${LOG_PREFIX} Calling the closeParentAdministrativeUnitTypeSelector function in the Administrative Structures Records creation component`);
        this._component.closeParentAdministrativeUnitTypeSelector();


    }


    /**
     * Sets the processing status to the previous status
     */
    public onCloseParentAdministrativeUnitTypeSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering onCloseParentAdministrativeUnitTypeSelector()`);

        // Reset the status to ready
        this.log.trace(`${LOG_PREFIX} Resetting the status to 'ready'`);
        this._statusSubject$.next("ready");

        this.cd.detectChanges();


    }



    /**
     * Sets the processing status to 'subsidiary-types-selections'
     */
    public onOpenSubsidiaryAdministrativeUnitTypeSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering onOpenSubsidiaryAdministrativeUnitTypeSelector()`);

        // Set the new status to 'subsidiary-types-selections'
        this.log.trace(`${LOG_PREFIX} Setting the new status to 'subsidiary-types-selections'`);
        this._statusSubject$.next("subsidiary-types-selections");

        this.cd.detectChanges();

    }





    /**
     * Close the currently open subsidiary types selector
     */
    public closeSubsidiaryAdministrativeUnitTypeSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering closeSubsidiaryAdministrativeUnitTypeSelector()`);

        // Call the closeSubsidiaryAdministrativeUnitTypeSelector function in the Administrative Structures Records creation component
        this.log.trace(`${LOG_PREFIX} Calling the closeSubsidiaryAdministrativeUnitTypeSelector function in the Administrative Structures Records creation component`);
        this._component.closeSubsidiaryAdministrativeUnitTypeSelector();


    }



    /**
     * Sets the processing status to the previous status
     */
    public onCloseSubsidiaryAdministrativeUnitTypeSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering onCloseSubsidiaryAdministrativeUnitTypeSelector()`);

        // Reset the status to ready
        this.log.trace(`${LOG_PREFIX} Resetting the status to 'ready'`);
        this._statusSubject$.next("ready");

        this.cd.detectChanges();


    }

}
