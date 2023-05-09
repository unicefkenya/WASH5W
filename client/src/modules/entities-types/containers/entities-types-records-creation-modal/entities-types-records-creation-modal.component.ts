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
import { EntitiesTypesRecordsCreationComponent } from '../../components/entities-types-records-creation/entities-types-records-creation.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject } from 'rxjs';

const LOG_PREFIX: string = "[Entities Types Records Creation Modal]";

@Component({
    selector: 'sb-entities-types-records-creation-modal',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './entities-types-records-creation-modal.component.html',
    styleUrls: ['entities-types-records-creation-modal.component.scss'],
})
export class EntitiesTypesRecordsCreationModalComponent implements OnInit, OnDestroy {

    // Allows the parent component to inject the unique identifier of the parent Context record
    @Input() public contextId!: number;

    // Keeps tab of the page title
    public title: string = "Create Entity Type Record";

    // Keeps tab of the previous status
    public previous: string | null = 'first';

    // Keeps a reference to the Entities Types Records creation component
    private _component!: EntitiesTypesRecordsCreationComponent;

    // Keeps tabs on the processing statuses
    private _statusSubject$ = new BehaviorSubject<string>("first");
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
     * Initialises the local reference to the displayed Entities Types Records creation component
     */
    @ViewChild(EntitiesTypesRecordsCreationComponent)
    public set component(component: EntitiesTypesRecordsCreationComponent) {

        this.log.trace(`${LOG_PREFIX} Entering setComponent()`);

        if (component) {
            this._component = component;
        }
    }



    /**
     * Sets the processing status to 'standalone'
     */
     public onLoadStandalonePage(): void {

        // Set the status to 'standalone'
        this.log.trace(`${LOG_PREFIX} Setting the status to 'standalone'`);
        this._statusSubject$.next("standalone");


        this.cd.detectChanges();
    }


    /**
     * Sets the processing status to 'first'
     */
    public onLoadFirstPage(): void {

        // Set the status to 'first'
        this.log.trace(`${LOG_PREFIX} Setting the status to 'first'`);
        this._statusSubject$.next("first");

        this.cd.detectChanges();
    }


    /**
     * Sets the processing status to 'nested'
     */
    public onLoadNestedPage(): void {

        // Set the status to 'nested'
        this.log.trace(`${LOG_PREFIX} Setting the status to 'nested'`);

        this._statusSubject$.next("nested");

        this.cd.detectChanges();
    }


    /**
     * Sets the processing status to 'last'
     */
    public onLoadLastPage(): void {

        // Set the status to 'last'
        this.log.trace(`${LOG_PREFIX} Setting the status to 'last'`);
        this._statusSubject$.next("last");

        this.cd.detectChanges();
    }


    /**
     * Calls the View Child's onNext() function
     */
    public onNext(): void {
        this._component.showNextPage();

        this.cd.detectChanges();
    }


    /**
     * Sets the processing status to the previous status and invokes the previous function in 
     * the Data Forms Elements Records creation component
     */
    public onPrevious(): void {

        this.log.trace(`${LOG_PREFIX} Entering onPrevious()`);

        // Call the previous function in the Data Forms Elements Records creation component
        this.log.trace(`${LOG_PREFIX} Calling the previous function in the Data Forms Elements Records creation component`);
        this._component.showPreviousPage();

        this.cd.detectChanges();



    }


    /**
     * Sets the processing status to 'saving' and invokes the save function in 
     * the Entities Types Records creation component
     */
    onSave() {

        this.log.trace(`${LOG_PREFIX} Entering onSave()`);

        // Set the status to 'saving'
        this.log.trace(`${LOG_PREFIX} Setting the status to 'saving'`);
        this._statusSubject$.next("saving");

        // Call the save function in the Entities Types Records creation component
        this.log.trace(`${LOG_PREFIX} Calling the save function in the Entities Types Records creation component`);
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
        this._statusSubject$.next("first");

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
