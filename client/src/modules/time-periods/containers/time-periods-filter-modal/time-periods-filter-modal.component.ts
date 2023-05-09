import { ChangeDetectionStrategy, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { TimePeriodsFilterComponent } from '@modules/time-periods/components/time-periods-filter/time-periods-filter.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject } from 'rxjs';

const LOG_PREFIX: string = "[Times Periods Filter Modal]";

@Component({
    selector: 'sb-time-periods-filter-modal',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './time-periods-filter-modal.component.html',
    styleUrls: ['time-periods-filter-modal.component.scss'],
})
export class TimePeriodsFilterModalComponent implements OnInit {

    // Keeps tab of the page title
    public title: string = "Filter Reporting Period";

    // Keeps a reference to the reporting period filter component
    private _component!: TimePeriodsFilterComponent;    

    // Keeps tabs on the processing statuses
    private _statusSubject$ = new BehaviorSubject<string>("ready");
    readonly status$ = this._statusSubject$.asObservable();    

    constructor(
        public activeModal: NgbActiveModal,
        private log: NGXLogger) { }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);
    }


    @HostListener('window:beforeunload')
    ngOnDestroy() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

    }

    /**
     * Initialises the local reference to the displayed Data Forms Elements Records creation component
     */
    @ViewChild(TimePeriodsFilterComponent)
    public set component(component: TimePeriodsFilterComponent) {

        this.log.trace(`${LOG_PREFIX} Entering setComponent()`);

        if (component) {
            this._component = component;
        }
    }    

    /**
     * Applies the time period filter
     */
    onApply() {

        this.log.trace(`${LOG_PREFIX} Entering onApply()`);

        // Apply the time period filter
        this.log.trace(`${LOG_PREFIX} Applying the time period filter`);
        this._component.apply();
    }    

    /**
     * Sets the processing status to 'succeeded'
     */
    onSucceeded() {

        this.log.trace(`${LOG_PREFIX} Entering onSucceeded()`);

        // Close the modal
        this.log.trace(`${LOG_PREFIX} Closing the modal`);
        this.activeModal.close();

    }

    /**
     * Sets the processing status to either 'failed' or 'invalid' depending on 
     * whether a system error or user error was encountered respectively
     */
    onFailed(errorCode: number) {

        this.log.trace(`${LOG_PREFIX} Entering onFailed()`);
        this.log.debug(`${LOG_PREFIX} Error Code = ${errorCode}`);


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
