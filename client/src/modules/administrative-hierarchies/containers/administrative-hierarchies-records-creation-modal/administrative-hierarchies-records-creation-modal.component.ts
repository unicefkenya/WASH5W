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
import { AdministrativeHierarchiesRecordsCreationComponent } from '../../components/administrative-hierarchies-records-creation/administrative-hierarchies-records-creation.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject } from 'rxjs';
import { AdministrativeStructure } from '@modules/administrative-structures/models';
import { AdministrativeSystem } from '@modules/administrative-systems/models';

const LOG_PREFIX: string = "[Administrative Hierarchies Records Creation Modal]";

@Component({
    selector: 'sb-administrative-hierarchies-records-creation-modal',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './administrative-hierarchies-records-creation-modal.component.html',
    styleUrls: ['administrative-hierarchies-records-creation-modal.component.scss'],
})
export class AdministrativeHierarchiesRecordsCreationModalComponent implements OnInit, OnDestroy {

    // Allows the parent component to inject the active administrative system
    @Input() public system!: AdministrativeSystem;

    // Allows the parent component to inject the target commissioner
    @Input() public commissioner!: { id: number | null | undefined; name: number | null | undefined; };

    // Allows the parent component to inject the permissible administrative structures
    @Input() public structures!: AdministrativeStructure[];


    // Keeps tab of the page title
    public title: string = "Create Administrative Hierarchy Record";

    // Keeps a reference to the Administrative Hierarchies Records creation component
    private _component!: AdministrativeHierarchiesRecordsCreationComponent;


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
     * Initialises the local reference to the displayed Administrative Hierarchies Records creation component
     */
    @ViewChild(AdministrativeHierarchiesRecordsCreationComponent)
    public set component(component: AdministrativeHierarchiesRecordsCreationComponent) {

        this.log.trace(`${LOG_PREFIX} Entering setComponent()`);

        if (component) {
            this._component = component;
        }
    }


    /**
     * Sets the processing status to 'saving' and invokes the save function in 
     * the Administrative Hierarchies Records creation component
     */
    onSave() {

        this.log.trace(`${LOG_PREFIX} Entering onSave()`);

        // Set the status to 'saving'
        this.log.trace(`${LOG_PREFIX} Setting the status to 'saving'`);
        this._statusSubject$.next("saving");

        // Call the save function in the Administrative Hierarchies Records creation component
        this.log.trace(`${LOG_PREFIX} Calling the save function in the Administrative Hierarchies Records creation component`);
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
     * Sets the processing status to 'subsidiary-units-selections'
     */
    public onOpenSubsidiaryAdministrativeUnitSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering onOpenSubsidiaryAdministrativeUnitSelector()`);

        // Set the new status to 'subsidiary-units-selections'
        this.log.trace(`${LOG_PREFIX} Setting the new status to 'subsidiary-units-selections'`);
        this._statusSubject$.next("subsidiary-units-selections");

        this.cd.detectChanges();

    }


    /**
     * Close the currently open responsibles selector
     */
    public closeSubsidiaryAdministrativeUnitSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering closeSubsidiaryAdministrativeUnitSelector()`);

        // Call the closeSubsidiaryAdministrativeUnitSelector function in the Administrative Hierarchies Records creation component
        this.log.trace(`${LOG_PREFIX} Calling the closeSubsidiaryAdministrativeUnitSelector function in the Administrative Hierarchies Records creation component`);
        this._component.closeSubsidiaryAdministrativeUnitSelector();

    }



    /**
     * Sets the processing status to the previous status
     */
    public onCloseSubsidiaryAdministrativeUnitSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering onCloseSubsidiaryAdministrativeUnitSelector()`);

        // Reset the status to ready
        this.log.trace(`${LOG_PREFIX} Resetting the status to 'ready'`);
        this._statusSubject$.next("ready");

        this.cd.detectChanges();


    }

}
