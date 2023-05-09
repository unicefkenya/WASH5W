import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { FilterService } from '@app/app-filter.service';
import { TimePeriod } from '@modules/time-points/models/time-period.model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Times Periods Records Tabulation Modal]";

@Component({
    selector: 'sb-time-points-records-selection-modal',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './time-points-records-selection-modal.component.html',
    styleUrls: ['time-points-records-selection-modal.component.scss'],
})
export class TimePointsRecordsSelectionModalComponent implements OnInit {

    // Allows the parent component to inject the desired selection mode: single or multi
    @Input() public selectionMode: string = "single";

    // Allows the parent component to inject the desired Times Periods
    @Input() public desired: number[] = [];

    // Allows the parent component to inject the undesired Times Periods
    // Ignored if the desired Times Periods has been specified
    @Input() public undesired: number[] = [];

    // Allows the parent component to inject the previously selected Times Periods
    @Input() public selected: number[] = [];

    // Propagates radio buttons selection events
    @Output() public select: EventEmitter<TimePeriod> = new EventEmitter<TimePeriod>();

    // Propagates checkboxes check events
    @Output() public check: EventEmitter<TimePeriod> = new EventEmitter<TimePeriod>();

    // Propagates checkboxes uncheck events
    @Output() public uncheck: EventEmitter<TimePeriod> = new EventEmitter<TimePeriod>();

    // Keeps tab of the page title
    public title: string = "Select Reporting Period";

    constructor(
        public activeModal: NgbActiveModal,
        private filterService: FilterService,
        private log: NGXLogger, public activeContextsModal: NgbActiveModal) { }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);
    }


    @HostListener('window:beforeunload')
    ngOnDestroy() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

    }

    /** 
    * Propagates TimePeriod Selection Events
    * @param timePeriod The Selected TimePeriod
    */
    onSelect(timePeriod: TimePeriod) {

        this.log.trace(`${LOG_PREFIX} Entering onSelect()`);
        this.log.debug(`${LOG_PREFIX} Selected Time Period = ${JSON.stringify(timePeriod)}`);

        // Broadcast the selected TimePeriod
        this.log.trace(`${LOG_PREFIX} Broadcasting the selected Time Period`);
        this.select.emit(timePeriod);

        // Update the global filter
        this.log.trace(`${LOG_PREFIX} Updating the global filter`);
        this.filterService.update({ activeReportingPeriod: timePeriod });

        // Close the modal
        this.log.trace(`${LOG_PREFIX} Closing the modal`);
        this.activeModal.close();
    }


    /** 
    * Propagates Times Periods Checkboxes Check Events
    * @param timePeriod The Checked TimePeriod
    */
    onCheck(timePeriod: TimePeriod) {

        this.log.trace(`${LOG_PREFIX} Entering onCheck()`);
        this.log.debug(`${LOG_PREFIX} Checked Time Period = ${JSON.stringify(timePeriod)}`);

        // Broadcast the checked TimePeriod
        this.log.trace(`${LOG_PREFIX} Broadcasting the checked Time Period`);
        this.check.emit(timePeriod);
    }


    /** 
    * Propagates Times Periods Checkboxes Uncheck Events
    * @param timePeriod The Unchecked TimePeriod
    */
    onUncheck(timePeriod: TimePeriod) {

        this.log.trace(`${LOG_PREFIX} Entering onUncheck()`);
        this.log.debug(`${LOG_PREFIX} Unchecked Time Period = ${JSON.stringify(timePeriod)}`);

        // Broadcast the unchecked TimePeriod
        this.log.trace(`${LOG_PREFIX} Broadcasting the unchecked Time Period`);
        this.uncheck.emit(timePeriod);

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
