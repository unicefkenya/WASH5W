import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { FilterService } from '@app/app-filter.service';
import { DataForm } from '@modules/data-forms/models/data-form.model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Data Forms Records Tabulation Modal]";

@Component({
    selector: 'sb-data-forms-records-selection-modal',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './data-forms-records-selection-modal.component.html',
    styleUrls: ['data-forms-records-selection-modal.component.scss'],
})
export class DataFormsRecordsSelectionModalComponent implements OnInit {


    // Allows the parent component to inject the desired selection mode: single or multi
    @Input() public selectionMode: string = "single";

    // Allows the parent component to inject the desired Contexts
    @Input() public desired: DataForm[] = [];

    // Allows the parent component to inject the undesired Contexts
    // Ignored if the desired Contexts has been specified
    @Input() public undesired: DataForm[] = [];

    // Allows the parent component to inject the previously selected Contexts
    @Input() public selected: DataForm[] = [];

    // Propagates radio buttons selection events
    @Output() public select: EventEmitter<DataForm> = new EventEmitter<DataForm>();

    // Propagates checkboxes check events
    @Output() public check: EventEmitter<DataForm> = new EventEmitter<DataForm>();

    // Propagates checkboxes uncheck events
    @Output() public uncheck: EventEmitter<DataForm> = new EventEmitter<DataForm>();

    // Keeps tab of the page title
    public title: string = "Select Data Form Record";

    constructor(
        public activeModal: NgbActiveModal,
        private filterService: FilterService,
        private log: NGXLogger) { }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);
    }


    @HostListener('window:beforeunload')
    ngOnDestroy() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

    }

    /** 
    * Propagates Data Form Selection Events
    * @param dataForm The Selected Data Form
    */
    onSelect(dataForm: DataForm) {

        this.log.trace(`${LOG_PREFIX} Entering onSelect()`);
        this.log.debug(`${LOG_PREFIX} Selected Data Form = ${JSON.stringify(dataForm)}`);

        // Broadcast the selected Data Form
        this.log.trace(`${LOG_PREFIX} Broadcasting the selected Data Form`);
        this.select.emit(dataForm);

        // Update the global filter
        this.log.trace(`${LOG_PREFIX} Updating the global filter`);
        this.filterService.update({ activeDataForm: dataForm });

        // Close the modal
        this.log.trace(`${LOG_PREFIX} Closing the modal`);
        this.activeModal.close();
    }


    /** 
    * Propagates Contexts Checkboxes Check Events
    * @param dataForm The Checked Data Form
    */
    onCheck(dataForm: DataForm) {

        this.log.trace(`${LOG_PREFIX} Entering onCheck()`);
        this.log.debug(`${LOG_PREFIX} Checked Data Form = ${JSON.stringify(dataForm)}`);

        // Broadcast the checked Data Form
        this.log.trace(`${LOG_PREFIX} Broadcasting the checked Data Form`);
        this.check.emit(dataForm);
    }


    /** 
    * Propagates Contexts Checkboxes Uncheck Events
    * @param dataForm The Unchecked Data Form
    */
    onUncheck(dataForm: DataForm) {

        this.log.trace(`${LOG_PREFIX} Entering onUncheck()`);
        this.log.debug(`${LOG_PREFIX} Unchecked Data Form = ${JSON.stringify(dataForm)}`);

        // Broadcast the unchecked Data Form
        this.log.trace(`${LOG_PREFIX} Broadcasting the unchecked Data Form`);
        this.uncheck.emit(dataForm);

    }

    /**
     * Closes the modal
     */
    onDone() {

        this.log.trace(`${LOG_PREFIX} Entering onDone()`);

        // Close the modal
        this.log.trace(`${LOG_PREFIX} Closing the modal`);
        this.activeModal.close();
    }

}
