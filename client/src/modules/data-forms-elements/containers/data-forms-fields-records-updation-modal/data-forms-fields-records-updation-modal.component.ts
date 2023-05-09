import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostListener,
    Input,
    OnInit,
    ViewChild
} from '@angular/core';
import { DataFormsFieldsRecordsUpdationComponent } from '../../components/data-forms-fields-records-updation/data-forms-fields-records-updation.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject, timer } from 'rxjs';


const LOG_PREFIX: string = "[Data Forms Fields Records Updation Modal]";

@Component({
    selector: 'sb-data-forms-fields-records-updation-modal',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './data-forms-fields-records-updation-modal.component.html',
    styleUrls: ['data-forms-fields-records-updation-modal.component.scss'],
})
export class DataFormsFieldsRecordsUpdationModalComponent implements OnInit {


    // Allows the parent component to inject the unique identifier of the Data Form Field
    @Input() public id: number | null | undefined;

    // Keeps tab of the page title
    public title: string = "Update Data Form Field";

    // Keeps tab of the previous status
    public previous: string | null = null;

    // Keeps tabs of whether the wizard is a standalone
    public standalone: boolean = true;

    // Keeps a reference to the Data Forms Elements Records updation component
    private _component!: DataFormsFieldsRecordsUpdationComponent;

    // Keeps tabs on the processing statuses
    private _statusSubject$ = new BehaviorSubject<string>("standalone");
    readonly status$ = this._statusSubject$.asObservable();

    constructor(
        public activeDataFormsElementsModal: NgbActiveModal,
        private cd: ChangeDetectorRef,
        private log: NGXLogger) { }

    ngOnInit(){

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);
    }


    @HostListener('window:beforeunload')
    ngOnDestroy(){

        this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

    }

    /**
     * Initialises the local reference to the displayed Data Forms Elements Records updation component
     */
    @ViewChild(DataFormsFieldsRecordsUpdationComponent)
    public set component(component: DataFormsFieldsRecordsUpdationComponent) {

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
     * Sets the processing status to 'saving' and invokes the save function in 
     * the Data Forms Elements Records updation component
     */
    public onSave(): void {

        this.log.trace(`${LOG_PREFIX} Entering onSave()`);

        // Capture the previous page
        this.previous = this._statusSubject$.value;

        // Set the status to 'saving'
        //this.log.trace(`${LOG_PREFIX} Setting the status to 'saving'`);
        //this._statusSubject$.next("saving");

        // Call the save function in the Data Forms Elements Records updation component
        this.log.trace(`${LOG_PREFIX} Calling the save function in the Data Forms Elements Records updation component`);
        this._component.save();
    }

    /**
     * Sets the processing status to 'succeeded'
     */
    public onSucceeded(): void {

        this.log.trace(`${LOG_PREFIX} Entering onSucceeded()`);

        // Set the status to 'done'
        this.log.trace(`${LOG_PREFIX} Setting the status to 'done'`);
        this._statusSubject$.next("done");

        timer(1000).subscribe(x => {

            // Close the modal
            this.log.trace(`${LOG_PREFIX} Closing the modal`);
            this.activeDataFormsElementsModal.close();

        });

    }

    /**
     * Sets the processing status to either 'failed' or 'invalid' depending on 
     * whether a system error or user error was encountered respectively
     */
    public onFailed(errorCode: number) {

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
    public onRetry(): void {

        this.log.trace(`${LOG_PREFIX} Entering onRetry()`);

        // Set the status to 'retrying'
        this.log.trace(`${LOG_PREFIX} Setting the status to 'retrying'`);
        this._statusSubject$.next("retrying");

        this.cd.detectChanges();

    }


    /**
     * Sets the processing status to 'ready'
     */
    public onContinue(): void {

        this.log.trace(`${LOG_PREFIX} Entering onContinue()`);

        // Set the status to 'ready'
        this.log.trace(`${LOG_PREFIX} Setting the status to 'ready'`);
        this._statusSubject$.next("ready");

        this.cd.detectChanges();

    }

    /**
     * Sets the processing status to 'done' and closes the modal
     */
    public onQuit(): void {

        this.log.trace(`${LOG_PREFIX} Entering onQuit()`);

        // Set the status to 'done'
        this.log.trace(`${LOG_PREFIX} Setting the status to 'done'`);
        this._statusSubject$.next("done");


        // Close the modal
        this.log.trace(`${LOG_PREFIX} Closing the modal`);
        this.activeDataFormsElementsModal.close();
    }

    /**
     * Closes the modal
     */
    public onDone(): void {

        this.log.trace(`${LOG_PREFIX} Entering onDone()`);

        // Close the modal
        this.log.trace(`${LOG_PREFIX} Closing the modal`);
        this.activeDataFormsElementsModal.close();
    }



    /**
     * Sets the processing status to 'fields-types-selections'
     */
     public onOpenFieldTypeSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering onOpenFieldTypeSelector()`);

        // Capture and set the current status as the new 'previous status'
        this.previous = this._statusSubject$.value;

        // Set the new status to 'fields-types-selections'
        this.log.trace(`${LOG_PREFIX} Setting the new status to 'fields-types-selections'`);
        this._statusSubject$.next("fields-types-selections");

        this.cd.detectChanges();

    }


    /**
     * Close the currently open selector
     */
     public closeFieldTypeSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering closeFieldTypeSelector()`);

        // Call the closeFieldTypeSelector function in the Data Forms Elements Records updation component
        this.log.trace(`${LOG_PREFIX} Calling the closeFieldTypeSelector function in the Data Forms Elements Records updation component`);
        this._component.closeFieldTypeSelector();

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
     public onCloseFieldTypeSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering onCloseFieldTypeSelector()`);

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
     * Sets the processing status to 'fields-selections'
     */
    public onOpenFieldSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering onOpenFieldSelector()`);

        // Capture and set the current status as the new 'previous status'
        this.previous = this._statusSubject$.value;

        // Set the new status to 'fields-selections'
        this.log.trace(`${LOG_PREFIX} Setting the new status to 'fields-selections'`);
        this._statusSubject$.next("fields-selections");

        this.cd.detectChanges();

    }


    


    /**
     * Close the currently open selector
     */
    public closeFieldSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering closeFieldSelector()`);

        // Call the closeFieldSelector function in the Data Forms Elements Records updation component
        this.log.trace(`${LOG_PREFIX} Calling the closeFieldSelector function in the Data Forms Elements Records updation component`);
        this._component.closeFieldSelector();

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
    public onCloseFieldSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering onCloseFieldSelector()`);

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
     * Sets the processing status to the previous status and invokes the previous function in 
     * the Data Forms Elements Records updation component
     */
    public onPrevious(): void {

        this.log.trace(`${LOG_PREFIX} Entering onPrevious()`);

        // Call the previous function in the Data Forms Elements Records updation component
        this.log.trace(`${LOG_PREFIX} Calling the previous function in the Data Forms Elements Records updation component`);
        this._component.showPreviousPage();

        this.cd.detectChanges();



    }

    /**
     * Adds a new validation rule
     */
    public onAddValidationRule(): void {

        this.log.trace(`${LOG_PREFIX} Entering onAddValidationRule()`);

        this._component.onAddValidationRule();

        this.cd.detectChanges();
    }


    /**
    * Retrieves the currently active page
    * @returns The name of the page
    */
    public getPage(): string {

        this.log.trace(`${LOG_PREFIX} Entering getPage()`);

        return this._component.page
    }

}
