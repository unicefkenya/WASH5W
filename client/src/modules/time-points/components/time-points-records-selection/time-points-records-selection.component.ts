import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostListener,
    OnDestroy,
    OnInit,
} from '@angular/core';
import { LoadingAnimationComponent } from '@common/components';
import { NGXLogger } from 'ngx-logger';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ContextsDataService } from '@modules/contexts/services/contexts-data.service';
import { FilterService } from '@app/app-filter.service';
import { Subscription } from 'rxjs';
import { formatDate } from '@angular/common';

const LOG_PREFIX: string = "[Times Periods Records Selection Component]";

@Component({
    selector: 'sb-time-points-records-selection',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './time-points-records-selection.component.html',
    styleUrls: ['time-points-records-selection.component.scss'],
})
export class TimePointsRecordsSelectionComponent implements OnInit, OnDestroy, AfterViewInit {

    // Init the default start date
    public startDate: Date = new Date(Date.now());

    // Init the default end date
    public endDate: Date = new Date(Date.now());

    // Keeps a local reference to the displayed loading animation component.
    // Makes it possible to trigger the loading animation when a slow background service is invoked.
    private _animation!: LoadingAnimationComponent;

    // Keeps tabs of whether the component has been successfully initialised
    public initialised: boolean = false;


    // Defines Contexts reactive form controls group
    public timePeriodsForm = new FormGroup({
        startDate: new FormControl<string>(formatDate(this.startDate, 'yyyy-MM-dd', 'en'), [Validators.required]),
        endDate: new FormControl<string>(formatDate(this.endDate, 'yyyy-MM-dd', 'en'), [Validators.required]),
    });

    // Central gathering point for all the component's subscriptions.
    // Makes it efficient to unsubscribe from all subscriptions when the component is destroyed.   
    private _subscriptions: Subscription[] = [];

    constructor(
        public filterService: FilterService,
        public contextsDataService: ContextsDataService,
        private cd: ChangeDetectorRef,
        private log: NGXLogger) {

    }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

        // Mark Init as complete
        this.log.trace(`${LOG_PREFIX} Init completed`);
        this.initialised = true;

    }


    ngAfterViewInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngAfterViewInit()`);

    }

    @HostListener('window:beforeunload')
    ngOnDestroy() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

        // Clear all subscriptions
        this.log.trace(`${LOG_PREFIX} Clearing all subscriptions`);
        this._subscriptions.forEach(s => s.unsubscribe());
    }



}
