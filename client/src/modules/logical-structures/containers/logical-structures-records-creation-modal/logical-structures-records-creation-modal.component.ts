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
import { LogicalStructuresRecordsCreationComponent } from '../../components/logical-structures-records-creation/logical-structures-records-creation.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject } from 'rxjs';

const LOG_PREFIX: string = "[Logical Structures Records Creation Modal]";

@Component({
    selector: 'sb-logical-structures-records-creation-modal',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './logical-structures-records-creation-modal.component.html',
    styleUrls: ['logical-structures-records-creation-modal.component.scss'],
})
export class LogicalStructuresRecordsCreationModalComponent implements OnInit, OnDestroy {

    // Allows the parent component to inject the unique identifier of the parent scheme record
    @Input() public schemeId!: number;

    // Keeps tab of the page title
    public title: string = "Create Logical Structure Record";

    // Keeps a reference to the Logical Structures Records creation component
    private _component!: LogicalStructuresRecordsCreationComponent;
  

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
     * Initialises the local reference to the displayed Logical Structures Records creation component
     */
    @ViewChild(LogicalStructuresRecordsCreationComponent)
    public set component(component: LogicalStructuresRecordsCreationComponent) {

        this.log.trace(`${LOG_PREFIX} Entering setComponent()`);

        if (component) {
            this._component = component;
        }
    }


    /**
     * Sets the processing status to 'saving' and invokes the save function in 
     * the Logical Structures Records creation component
     */
    onSave() {

        this.log.trace(`${LOG_PREFIX} Entering onSave()`);

        // Set the status to 'saving'
        this.log.trace(`${LOG_PREFIX} Setting the status to 'saving'`);
        this._statusSubject$.next("saving");

        // Call the save function in the Logical Structures Records creation component
        this.log.trace(`${LOG_PREFIX} Calling the save function in the Logical Structures Records creation component`);
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
     * whether a scheme error or user error was encountered respectively
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
     * Sets the processing status to 'schemes-selections'
     */
     public onOpenSchemeSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering onOpenSchemeSelector()`);

        // Set the new status to 'schemes-selections'
        this.log.trace(`${LOG_PREFIX} Setting the new status to 'schemes-selections'`);
        this._statusSubject$.next("schemes-selections");

        this.cd.detectChanges();

    }


    
    /**
     * Close the currently open parent types selector
     */
    public closeSchemeSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering closeSchemeSelector()`);

        // Call the closeSchemeSelector function in the Logical Structures Records creation component
        this.log.trace(`${LOG_PREFIX} Calling the closeSchemeSelector function in the Logical Structures Records creation component`);
        this._component.closeSchemeSelector();

    }


    /**
     * Sets the processing status to the previous status
     */
    public onCloseSchemeSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering onCloseSchemeSelector()`);

        // Reset the status to ready
        this.log.trace(`${LOG_PREFIX} Resetting the status to 'ready'`);
        this._statusSubject$.next("ready");

        this.cd.detectChanges();


    }


    /**
     * Sets the processing status to 'parent-types-selections'
     */
     public onOpenParentLogicalElementTypeSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering onOpenParentLogicalElementTypeSelector()`);

        // Set the new status to 'parent-types-selections'
        this.log.trace(`${LOG_PREFIX} Setting the new status to 'parent-types-selections'`);
        this._statusSubject$.next("parent-types-selections");

        this.cd.detectChanges();

    }


    
    /**
     * Close the currently open parent types selector
     */
    public closeParentLogicalElementTypeSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering closeParentLogicalElementTypeSelector()`);

        // Call the closeParentLogicalElementTypeSelector function in the Logical Structures Records creation component
        this.log.trace(`${LOG_PREFIX} Calling the closeParentLogicalElementTypeSelector function in the Logical Structures Records creation component`);
        this._component.closeParentLogicalElementTypeSelector();


    }


    /**
     * Sets the processing status to the previous status
     */
    public onCloseParentLogicalElementTypeSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering onCloseParentLogicalElementTypeSelector()`);

        // Reset the status to ready
        this.log.trace(`${LOG_PREFIX} Resetting the status to 'ready'`);
        this._statusSubject$.next("ready");

        this.cd.detectChanges();


    }



    /**
     * Sets the processing status to 'subsidiary-types-selections'
     */
     public onOpenSubsidiaryLogicalElementTypeSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering onOpenSubsidiaryLogicalElementTypeSelector()`);

        // Set the new status to 'subsidiary-types-selections'
        this.log.trace(`${LOG_PREFIX} Setting the new status to 'subsidiary-types-selections'`);
        this._statusSubject$.next("subsidiary-types-selections");

        this.cd.detectChanges();

    }


    


    /**
     * Close the currently open subsidiary types selector
     */
    public closeSubsidiaryLogicalElementTypeSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering closeSubsidiaryLogicalElementTypeSelector()`);

        // Call the closeSubsidiaryLogicalElementTypeSelector function in the Logical Structures Records creation component
        this.log.trace(`${LOG_PREFIX} Calling the closeSubsidiaryLogicalElementTypeSelector function in the Logical Structures Records creation component`);
        this._component.closeSubsidiaryLogicalElementTypeSelector();

    }



    /**
     * Sets the processing status to the previous status
     */
    public onCloseSubsidiaryLogicalElementTypeSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering onCloseSubsidiaryLogicalElementTypeSelector()`);

        // Reset the status to ready
        this.log.trace(`${LOG_PREFIX} Resetting the status to 'ready'`);
        this._statusSubject$.next("ready");

        this.cd.detectChanges();


    }

}
