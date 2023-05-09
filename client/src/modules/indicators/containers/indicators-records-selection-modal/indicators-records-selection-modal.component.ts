import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { IndicatorsRecordsSelectionComponent } from '@modules/indicators/components/indicators-records-selection/indicators-records-selection.component';
import { Indicator } from '@modules/indicators/models/indicator.model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

const LOG_PREFIX: string = "[Indicators Records Tabulation Modal]";

@Component({
    selector: 'sb-indicators-records-selection-modal',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './indicators-records-selection-modal.component.html',
    styleUrls: ['indicators-records-selection-modal.component.scss'],
})
export class IndicatorsRecordsSelectionModalComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the parent Context record
  @Input() public contextId!: number;    

    // Allows the parent component to inject the desired selection mode: single or multi
    @Input() public selectionMode: string = "single";

    // Allows the parent component to inject the desired Indicators
    @Input() public desired: number[] = [];

    // Allows the parent component to inject the undesired Indicators
    // Ignored if the desired Indicators has been specified
    @Input() public undesired: number[] = [];

    // Allows the parent component to inject the previously selected Indicators
    @Input() public selected: number[] = [];

    // Propagates radio buttons selection events
    @Output() public select: EventEmitter<Indicator> = new EventEmitter<Indicator>();

    // Propagates checkboxes check events
    @Output() public check: EventEmitter<Indicator> = new EventEmitter<Indicator>();

    // Propagates checkboxes uncheck events
    @Output() public uncheck: EventEmitter<Indicator> = new EventEmitter<Indicator>();  
    
    // Keeps tab of the page title
    public title: string = "Select Indicator Record";    

    // Keeps a reference to the Indicators Records creation component
    private _component!: IndicatorsRecordsSelectionComponent;

    // Keeps tabs on the processing statuses
    private _statusSubject$ = new BehaviorSubject<string>("ready");
    readonly status$ = this._statusSubject$.asObservable();    

    constructor(
        private log: NGXLogger, 
        public activeIndicatorsModal: NgbActiveModal,
        private cd: ChangeDetectorRef) {

         }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);
    }

    @HostListener('window:beforeunload')
    ngOnDestroy() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

    }

    /** 
    * Propagates Indicator Selection Events
    * @param indicator The Selected Indicator
    */
     onSelect(indicator: Indicator) {

        this.log.trace(`${LOG_PREFIX} Entering onSelect()`);
        this.log.debug(`${LOG_PREFIX} Selected Indicator = ${JSON.stringify(indicator)}`);

        // Broadcast the selected Indicator
        this.log.trace(`${LOG_PREFIX} Broadcasting the selected Indicator`);
        this.select.emit(indicator);
    }


    /** 
    * Propagates Indicators Checkboxes Check Events
    * @param indicator The Checked Indicator
    */
    onCheck(indicator: Indicator) {

        this.log.trace(`${LOG_PREFIX} Entering onCheck()`);
        this.log.debug(`${LOG_PREFIX} Checked Indicator = ${JSON.stringify(indicator)}`);

        // Broadcast the checked Indicator
        this.log.trace(`${LOG_PREFIX} Broadcasting the checked Indicator`);
        this.check.emit(indicator);
    }


    /** 
    * Propagates Indicators Checkboxes Uncheck Events
    * @param indicator The Unchecked Indicator
    */
    onUncheck(indicator: Indicator) {

        this.log.trace(`${LOG_PREFIX} Entering onUncheck()`);
        this.log.debug(`${LOG_PREFIX} Unchecked Indicator = ${JSON.stringify(indicator)}`);

        // Broadcast the unchecked Indicator
        this.log.trace(`${LOG_PREFIX} Broadcasting the unchecked Indicator`);
        this.uncheck.emit(indicator);

    }
    
    /**
     * Closes the modal
     */
     onDone() {

        this.log.trace(`${LOG_PREFIX} Entering onDone()`);

        // Close the modal
        this.log.trace(`${LOG_PREFIX} Closing the modal`);
        this.activeIndicatorsModal.close();
    }



    /**
     * Sets the processing status to 'logical-elements-selections'
     */
     public onOpenLogicalElementSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering onOpenLogicalElementSelector()`);

        // Set the new status to 'logical-elements-selections'
        this.log.trace(`${LOG_PREFIX} Setting the new status to 'logical-elements-selections'`);
        this._statusSubject$.next("logical-elements-selections");

        this.cd.detectChanges();

    }



    /**
     * Close the currently open from types selector
     */
    public closeLogicalElementSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering closeLogicalElementSelector()`);

        // Call the closeLogicalElementSelector function in the Indicators Records creation component
        this.log.trace(`${LOG_PREFIX} Calling the closeLogicalElementSelector function in the Indicators Records creation component`);
        this._component.closeLogicalElementSelector();

    }


    /**
     * Sets the processing status to the previous status
     */
    public onCloseLogicalElementSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering onCloseLogicalElementSelector()`);

        // Reset the status to ready
        this.log.trace(`${LOG_PREFIX} Resetting the status to 'ready'`);
        this._statusSubject$.next("ready");

        this.cd.detectChanges();


    }
   

}
