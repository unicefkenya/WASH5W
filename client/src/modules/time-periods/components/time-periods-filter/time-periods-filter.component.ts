import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    HostListener,
    OnDestroy,
    OnInit,
    Output,
} from '@angular/core';
import { LoadingAnimationComponent } from '@common/components';
import { NGXLogger } from 'ngx-logger';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FilterService } from '@app/app-filter.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { formatDate } from '@angular/common';
import { DateUtilService } from '@common/services/date-util.service';
import { TimestepEnum } from '@modules/timesteps/models/timestep.enum';
import { Timestep } from '@modules/timesteps/models';
import { TimePeriod } from '@modules/time-periods/models/time-period.model';
import { environment } from 'environments/environment';

const LOG_PREFIX: string = "[Times Periods Filter Component]";

@Component({
    selector: 'sb-time-periods-filter',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './time-periods-filter.component.html',
    styleUrls: ['time-periods-filter.component.scss'],
})
export class TimePeriodsFilterComponent implements OnInit, OnDestroy, AfterViewInit {

    // Broadcasts successful Organisations creation events
    @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

    // Broadcasts failed Organisations creation events together with their error codes
    @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

    // The Time Step
    public timestep!: Timestep;

    // The Start Date
    public startDate!: Date;

    // The End Date
    public endDate!: Date;

    // Keeps tabs of the permissible timesteps
    private _timesteps$ = new BehaviorSubject<Timestep[]>([]);
    readonly timesteps$ = this._timesteps$.asObservable();

    // Intervals between the Start & End Dates
    private intervals!: { start: string, end: string, title: string }[];

    // Keeps a local reference to the displayed loading animation component.
    // Makes it possible to trigger the loading animation when a slow background service is invoked.
    private _animation!: LoadingAnimationComponent;

    // Keeps tabs of whether the component has been successfully initialised
    public initialised: boolean = false;

    // Keeps tabs of whether theres an ongoing processing event
    private _processing$ = new BehaviorSubject<Boolean>(false);
    readonly processing$ = this._processing$.asObservable();

    // Defines Contexts reactive form controls group
    public timePeriodsForm!: FormGroup;

    // Central gathering point for all the component's subscriptions.
    // Makes it efficient to unsubscribe from all subscriptions when the component is destroyed.   
    private _subscriptions: Subscription[] = [];

    constructor(
        public filterService: FilterService,
        public dateUtilService: DateUtilService,
        private cd: ChangeDetectorRef,
        private log: NGXLogger) {

    }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

        // Initialise the currently active time step
        this.log.trace(`${LOG_PREFIX} Initialising the currently active time step`);
        this.timestep = this.filterService.filter.activeTimeIntervalSteps ?
            Object.assign({}, this.filterService.filter.activeTimeIntervalSteps)
            : TimestepEnum.MONTHLY;

        this.log.debug(`${LOG_PREFIX} Time Step = ${JSON.stringify(this.timestep)}`);

        // Initialise other permissible timesteps
        // A user should not be allowed to visualise anything lower than the unit that the user was allowed to collect data in
        this.log.trace(`${LOG_PREFIX} Initialising other permissible timesteps`);
        const timesteps: Timestep[] = [];
        for (let t of TimestepEnum.getTimesteps()) {
            if (t.id && this.timestep.id) {
                if (t.id >= this.timestep.id) {
                    timesteps.push(t)
                }
            }
        }
        this._timesteps$.next(timesteps);

        // Initialise the start date
        this.log.trace(`${LOG_PREFIX} Initialising the start date`);
        this.startDate = this.filterService.filter.activeTimeIntervalStart ?
            this.dateUtilService.getDateFromDateString(this.filterService.filter.activeTimeIntervalStart) || new Date(Date.now())
            : new Date(Date.now());

        this.log.debug(`${LOG_PREFIX} Start Date = ${JSON.stringify(this.startDate)}`);

        // Initialise the end date
        this.log.trace(`${LOG_PREFIX} Initialising the end date`);
        this.endDate = this.filterService.filter.activeTimeIntervalEnd ?
            this.dateUtilService.getDateFromDateString(this.filterService.filter.activeTimeIntervalEnd) || new Date(Date.now())
            : new Date(Date.now());

        this.log.debug(`${LOG_PREFIX} End Date = ${JSON.stringify(this.endDate)}`);

        // Initialise the intervals between the start and end dates
        this.log.trace(`${LOG_PREFIX} Initialising the intervals between the start and end dates`);
        this.intervals = Object.assign([], this.filterService.filter.activeTimeIntervals ? this.filterService.filter.activeTimeIntervals : []);

        // Initialise the form
        this.log.trace(`${LOG_PREFIX} Initialising the form`);
        this.timePeriodsForm = new FormGroup({
            timestepId: new FormControl<number>(this.timestep.id as number, [Validators.required]),
            startDate: new FormControl<string>(formatDate(this.startDate, 'yyyy-MM-dd', 'en'), [Validators.required]),
            endDate: new FormControl<string>(formatDate(this.endDate, 'yyyy-MM-dd', 'en'), [Validators.required]),
        });

        // Subscribe to timestepId changes
        this.log.trace(`${LOG_PREFIX} Subscribing to timestepId changes`);
        this.timePeriodsForm.controls['timestepId'].valueChanges.subscribe((value: number) => {
            this.log.trace(`${LOG_PREFIX} Timestep ID changed`);
            this.log.debug(`${LOG_PREFIX} Timestep ID = ${value}`);

            // Handle the Timestep ID change
            this.onSelectTimestepId(value);
        });

        // Subscribe to start date changes
        this.log.trace(`${LOG_PREFIX} Subscribing to start date changes`);
        this.timePeriodsForm.controls['startDate'].valueChanges.subscribe((value: string | null) => {
            this.log.trace(`${LOG_PREFIX} Start date changed`);
            this.log.debug(`${LOG_PREFIX} Start Date = ${value}`);

            // Handle the Start Date change
            this.onSelectStartDate(value);

        });

        // Subscribe to end date changes
        this.log.trace(`${LOG_PREFIX} Subscribing to end date changes`);
        this.timePeriodsForm.controls['endDate'].valueChanges.subscribe((value: string | null) => {
            this.log.trace(`${LOG_PREFIX} End date changed`);
            this.log.debug(`${LOG_PREFIX} End Date = ${value}`);

            // Handle the End Date change
            this.onSelectEndDate(value);
        });



        // Mark initialisation as completed
        this.log.trace(`${LOG_PREFIX} Marking initialisation as completed`);
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

    /**
     * Handles timestep selection events
     * @param value 
     */
    private onSelectTimestepId(value: number | null): void {

        this.log.trace(`${LOG_PREFIX} Entering onSelectTimestepId()`);

        // Check if a timestep id was passed in
        this.log.trace(`${LOG_PREFIX} Checking if a timestep id was passed in`);
        if (value) {

            // A timestep id was passed in
            this.log.trace(`${LOG_PREFIX} A timestep id was passed in`);
            this.log.debug(`${LOG_PREFIX} Timestep id = ${value}`);

            // Update the local timestep
            this.log.trace(`${LOG_PREFIX} Updating the local timestep`);
            this.timestep = TimestepEnum.getTimestepById(value);
            this.log.debug(`${LOG_PREFIX} Timestep = ${JSON.stringify(this.timestep)}`);

            // Get a yyyy-MM-dd formatted version of the start date
            this.log.trace(`${LOG_PREFIX} Getting a yyyy-MM-dd formatted version of the start date`);
            let start: string | null | undefined = this.dateUtilService.formatDate(this.startDate, 'short');
            this.log.debug(`${LOG_PREFIX} Start Date String = ${start}`);

            // Get a yyyy-MM-dd formatted version of the end date
            this.log.trace(`${LOG_PREFIX} Getting a yyyy-MM-dd formatted version of the end date`);
            let end: string | null | undefined = this.dateUtilService.formatDate(this.endDate, 'short');
            this.log.debug(`${LOG_PREFIX} End Date String = ${end}`);

            // Check if the start date & end date were successfully formatted
            this.log.trace(`${LOG_PREFIX} Checking if the start date & end date were successfully formatted`);
            if (start && end) {

                // The start date & end date were successfully formatted
                this.log.trace(`${LOG_PREFIX} The start date & end date were successfully formatted`);

                // Set processing status to true
                this.log.trace(`${LOG_PREFIX} Setting the processing status to true`);
                this._processing$.next(true);

                // Collect the time periods between the start and end dates
                this.log.trace(`${LOG_PREFIX} Clearing the previous collection of time periods`);
                this.intervals.length = 0;

                // Initialise a container of time periods
                this.log.trace(`${LOG_PREFIX} Initialising a container of time periods`);
                let periods: TimePeriod[] = [];

                // Add the last time period to the container
                this.log.trace(`${LOG_PREFIX} Adding the last time period to the container`);
                const _last: { start: string; end: string } = this.dateUtilService.getCurrent(end, TimestepEnum.getTimestepById(this.timestep.id as number), environment.year === 'fiscal' ? 'fiscal' : 'calendar');
                const last: TimePeriod = new TimePeriod({
                    data: {
                        contextId: this.filterService.filter.activeContext?.id,
                        typeId: this.timestep?.id,
                        start: _last.start,
                        end: _last.end,
                        open: false
                    }
                });


                // Optionally append other previous time periods
                this.log.trace(`${LOG_PREFIX} Optionally appending other previous time periods`);
                let ref: string | null | undefined = last.data.start;
                let finished: boolean = this.dateUtilService.isDateBefore(last.data.start, start);
                while (!finished) {

                    const _period: { start: string; end: string } = this.dateUtilService.getPrevious(ref, TimestepEnum.getTimestepById(this.timestep.id as number), environment.year === 'fiscal' ? 'fiscal' : 'calendar')
                    const period: TimePeriod = new TimePeriod({
                        data: {
                            contextId: this.filterService.filter.activeContext?.id,
                            typeId: this.timestep?.id,
                            start: _period.start,
                            end: _period.end,
                            open: true
                        }
                    });

                    // Add the period to the list of periods
                    periods.push(period);

                    // Do a check to determine whether we should continue processing the time periods
                    if (this.dateUtilService.isDateBefore(period.data.start, start)) {
                        finished = true;
                    } else {
                        ref = period.data.start;
                    }
                }


                // Reverse the order of the time periods such that the first one comes first
                this.log.trace(`${LOG_PREFIX} Reversing the order of the time periods such that the first one comes first`);
                periods = periods.reverse();

                this.log.debug(`${LOG_PREFIX} Time Periods = ${JSON.stringify(this.intervals)}`);

                // Use the time periods to update the intervals
                this.log.trace(`${LOG_PREFIX} Using the time periods to update the intervals`);
                this.intervals = periods
                    .filter(p => p.data.start && p.data.end)
                    .map(p => ({
                        start: p.data.start as string,
                        end: p.data.end as string,
                        title: this.dateUtilService.getIntervalDescriptor(p.data.start, p.data.end, TimestepEnum.getTimestepById(this.timestep.id as number), environment.year === 'fiscal' ? 'fiscal' : 'calendar')
                    }));

                // Update the start date
                this.log.trace(`${LOG_PREFIX} Updating the start date`);
                if (periods[0].data.start) {
                    this.startDate = new Date(periods[0].data.start);
                    this.timePeriodsForm.controls['startDate'].setValue(formatDate(this.startDate, 'yyyy-MM-dd', 'en'));
                }
                this.log.debug(`${LOG_PREFIX} Start Date = ${JSON.stringify(this.startDate)}`);

                // Update the end date
                this.log.trace(`${LOG_PREFIX} Updating the end date`);
                const temp: string | null | undefined = periods[this.intervals.length - 1].data.end;
                if (temp) {
                    this.endDate = new Date(temp);
                    this.timePeriodsForm.controls['endDate'].setValue(formatDate(this.endDate, 'yyyy-MM-dd', 'en'));
                }
                this.log.debug(`${LOG_PREFIX} End Date = ${JSON.stringify(this.endDate)}`);               

                // Set processing status to false
                this.log.trace(`${LOG_PREFIX} Setting the processing status to false`);
                this._processing$.next(false);

            } else {
                // The start date & end date were not successfully formatted
                this.log.trace(`${LOG_PREFIX} The start date & end date were not successfully formatted`);
            }





        } else {
            // A timestep id was not passed in
            this.log.error(`${LOG_PREFIX} A timestep id was not passed in`);
        }
    }


    /**
     * Handles start date selection events
     * @param value 
     */
    private onSelectStartDate(value: string | null): void {

        this.log.trace(`${LOG_PREFIX} Entering onSelectEndDate()`);

        // Check if a start date was passed in
        this.log.trace(`${LOG_PREFIX} Checking if a start date was passed in`);
        if (value) {

            // A start date was passed in
            this.log.trace(`${LOG_PREFIX} A start date was passed in`);
            this.log.debug(`${LOG_PREFIX} Start Date = ${value}`);

            // Get a yyyy-MM-dd formatted version of the start date
            this.log.trace(`${LOG_PREFIX} Getting a yyyy-MM-dd formatted version of the start date`);
            let start: string | null = this.dateUtilService.formatDate(value, 'short');
            this.log.debug(`${LOG_PREFIX} Start Date String = ${start}`);

            // Get a yyyy-MM-dd formatted version of the end date
            this.log.trace(`${LOG_PREFIX} Getting a yyyy-MM-dd formatted version of the end date`);
            let end: string | null = this.dateUtilService.formatDate(this.endDate, 'short');
            this.log.debug(`${LOG_PREFIX} End Date String = ${end}`);

            // Check if the start date & end date were successfully formatted
            this.log.trace(`${LOG_PREFIX} Checking if the start date & end date were successfully formatted`);
            if (start && end) {

                // The start date & end date were successfully formatted
                this.log.trace(`${LOG_PREFIX} The start date & end date were successfully formatted`);

                // Set processing status to true
                this.log.trace(`${LOG_PREFIX} Setting the processing status to true`);
                this._processing$.next(true);

                // Check if the end date is still valid
                this.log.trace(`${LOG_PREFIX} Checking if the end date is still valid`);
                if (!this.dateUtilService.isDateAfter(start, end)) {

                    // The end date is no longer valid
                    this.log.trace(`${LOG_PREFIX} The end date is no longer valid: It falls before the start date`);

                    // Set the end date to the start date
                    this.log.trace(`${LOG_PREFIX} Setting the end date to the start date`);
                    this.endDate = new Date(start);
                    end = start;

                } else {
                    // The end date is still valid
                    this.log.trace(`${LOG_PREFIX} The end date is still valid`);
                }

                // Clear the previous collection of time periods
                this.log.trace(`${LOG_PREFIX} Clearing the previous collection of time periods`);
                this.intervals.length = 0;

                // Initialise a container of time periods
                this.log.trace(`${LOG_PREFIX} Initialising a container of time periods`);
                let periods: TimePeriod[] = [];

                // Add the first time period to the container
                this.log.trace(`${LOG_PREFIX} Adding the first time period to the container`);
                const _first: { start: string; end: string } = this.dateUtilService.getCurrent(start, TimestepEnum.getTimestepById(this.timestep.id as number), environment.year === 'fiscal' ? 'fiscal' : 'calendar');
                const first: TimePeriod = new TimePeriod({
                    data: {
                        contextId: this.filterService.filter.activeContext?.id,
                        typeId: this.timestep?.id,
                        start: _first.start,
                        end: _first.end,
                        open: false
                    }
                });


                // Optionally append other following time periods
                this.log.trace(`${LOG_PREFIX} Optionally appending other following time periods`);
                let ref: string | null | undefined = first.data.end;
                let finished: boolean = this.dateUtilService.isDateAfter(first.data.end, end);
                while (!finished) {

                    const _period: { start: string; end: string } = this.dateUtilService.getNext(ref, TimestepEnum.getTimestepById(this.timestep.id as number), environment.year === 'fiscal' ? 'fiscal' : 'calendar')
                    const period: TimePeriod = new TimePeriod({
                        data: {
                            contextId: this.filterService.filter.activeContext?.id,
                            typeId: this.timestep?.id,
                            start: _period.start,
                            end: _period.end,
                            open: true
                        }
                    });

                    // Add the period to the list of periods
                    periods.push(period);

                    // Do a check to determine whether we should continue processing the time periods
                    if (this.dateUtilService.isDateAfter(period.data.end, end)) {
                        ref = period.data.end;
                    } else {
                        finished = true;
                    }
                }

                this.log.debug(`${LOG_PREFIX} Time Periods = ${JSON.stringify(this.intervals)}`);

                // Use the time periods to update the intervals
                this.log.trace(`${LOG_PREFIX} Using the time periods to update the intervals`);
                this.intervals = periods
                    .filter(p => p.data.start && p.data.end)
                    .map(p => ({
                        start: p.data.start as string,
                        end: p.data.end as string,
                        title: this.dateUtilService.getIntervalDescriptor(p.data.start, p.data.end, TimestepEnum.getTimestepById(this.timestep.id as number), environment.year === 'fiscal' ? 'fiscal' : 'calendar')
                    }));

                // Update the start date
                this.log.trace(`${LOG_PREFIX} Updating the start date`);
                if (periods[0].data.start) {
                    this.startDate = new Date(periods[0].data.start);
                    this.timePeriodsForm.controls['startDate'].setValue(formatDate(this.startDate, 'yyyy-MM-dd', 'en'));
                }
                this.log.debug(`${LOG_PREFIX} Start Date = ${JSON.stringify(this.startDate)}`);

                // Update the end date
                this.log.trace(`${LOG_PREFIX} Updating the end date`);
                const temp: string | null | undefined = periods[this.intervals.length - 1].data.end;
                if (temp) {
                    this.endDate = new Date(temp);
                    this.timePeriodsForm.controls['endDate'].setValue(formatDate(this.endDate, 'yyyy-MM-dd', 'en'));
                }
                this.log.debug(`${LOG_PREFIX} End Date = ${JSON.stringify(this.endDate)}`);

                // Set processing status to false
                this.log.trace(`${LOG_PREFIX} Setting the processing status to false`);
                this._processing$.next(false);

            } else {
                // The start date & end date were not successfully formatted
                this.log.trace(`${LOG_PREFIX} The start date & end date were not successfully formatted`);
            }



        } else {
            // A start date was not passed in
            this.log.error(`${LOG_PREFIX} A start date was not passed in`);
        }
    }

    /**
    * Handles end date selection events
    * @param value 
    */

    private onSelectEndDate(value: string | null): void {

        this.log.trace(`${LOG_PREFIX} Entering onSelectEndDate()`);

        // Check if an end date was passed in
        this.log.trace(`${LOG_PREFIX} Checking if an end date was passed in`);
        if (value) {

            // An end date was passed in
            this.log.trace(`${LOG_PREFIX} An end date was passed in`);
            this.log.debug(`${LOG_PREFIX} End Date = ${value}`);

            // Get a yyyy-MM-dd formatted version of the start date
            this.log.trace(`${LOG_PREFIX} Getting a yyyy-MM-dd formatted version of the start date`);
            let start: string | null = this.dateUtilService.formatDate(this.startDate, 'short');
            this.log.debug(`${LOG_PREFIX} Start Date String = ${start}`);

            // Get a yyyy-MM-dd formatted version of the end date
            this.log.trace(`${LOG_PREFIX} Getting a yyyy-MM-dd formatted version of the end date`);
            let end: string | null = this.dateUtilService.formatDate(value, 'short');
            this.log.debug(`${LOG_PREFIX} End Date String = ${end}`);

            // Check if the start date & end date were successfully formatted
            this.log.trace(`${LOG_PREFIX} Checking if the start date & end date were successfully formatted`);
            if (start && end) {

                // The start date & end date were successfully formatted
                this.log.trace(`${LOG_PREFIX} The start date & end date were successfully formatted`);

                // Set processing status to true
                this.log.trace(`${LOG_PREFIX} Setting the processing status to true`);
                this._processing$.next(true);

                // Check if the start date is still valid
                this.log.trace(`${LOG_PREFIX} Checking if the start date is still valid`);
                if (!this.dateUtilService.isDateBefore(end, start)) {

                    // The start date is no longer valid
                    this.log.trace(`${LOG_PREFIX} The start date is no longer valid: It falls after the end date`);

                    // Set the start date to the end date
                    this.log.trace(`${LOG_PREFIX} Setting the start date to the end date`);
                    this.startDate = new Date(end);
                    start = end;

                } else {
                    // The start date is still valid
                    this.log.trace(`${LOG_PREFIX} The start date is still valid`);
                }

                // Clear the previous collection of time periods
                this.log.trace(`${LOG_PREFIX} Clearing the previous collection of time periods`);
                this.intervals.length = 0;

                
                // Initialise a container of time periods
                this.log.trace(`${LOG_PREFIX} Initialising a container of time periods`);
                let periods: TimePeriod[] = [];

                // Add the last time period to the container
                this.log.trace(`${LOG_PREFIX} Adding the last time period to the container`);
                const _last: { start: string; end: string } = this.dateUtilService.getCurrent(end, TimestepEnum.getTimestepById(this.timestep.id as number), environment.year === 'fiscal' ? 'fiscal' : 'calendar');
                const last: TimePeriod = new TimePeriod({
                    data: {
                        contextId: this.filterService.filter.activeContext?.id,
                        typeId: this.timestep?.id,
                        start: _last.start,
                        end: _last.end,
                        open: false
                    }
                });

                // Optionally append other previous time periods
                this.log.trace(`${LOG_PREFIX} Optionally appending other previous time periods`);
                let ref: string | null | undefined = last.data.start;
                let finished: boolean = this.dateUtilService.isDateBefore(last.data.start, start);
                while (!finished) {

                    const _period: { start: string; end: string } = this.dateUtilService.getPrevious(ref, TimestepEnum.getTimestepById(this.timestep.id as number), environment.year === 'fiscal' ? 'fiscal' : 'calendar')
                    const period: TimePeriod = new TimePeriod({
                        data: {
                            contextId: this.filterService.filter.activeContext?.id,
                            typeId: this.timestep?.id,
                            start: _period.start,
                            end: _period.end,
                            open: true
                        }
                    });

                    // Add the period to the list of periods
                    periods.push(period);

                    // Do a check to determine whether we should continue processing the time periods
                    if (this.dateUtilService.isDateBefore(period.data.start, start)) {
                        finished = true;
                    } else {
                        ref = period.data.start;
                    }
                }


                // Reverse the order of the time periods such that the first one comes first
                this.log.trace(`${LOG_PREFIX} Reversing the order of the time periods such that the first one comes first`);
                periods = periods.reverse();

                this.log.debug(`${LOG_PREFIX} Time Periods = ${JSON.stringify(this.intervals)}`);

                // Use the time periods to update the intervals
                this.log.trace(`${LOG_PREFIX} Using the time periods to update the intervals`);
                this.intervals = periods
                    .filter(p => p.data.start && p.data.end)
                    .map(p => ({
                        start: p.data.start as string,
                        end: p.data.end as string,
                        title: this.dateUtilService.getIntervalDescriptor(p.data.start, p.data.end, TimestepEnum.getTimestepById(this.timestep.id as number), environment.year === 'fiscal' ? 'fiscal' : 'calendar')
                    }));

                // Update the start date
                this.log.trace(`${LOG_PREFIX} Updating the start date`);
                if (periods[0].data.start) {
                    this.startDate = new Date(periods[0].data.start);
                    this.timePeriodsForm.controls['startDate'].setValue(formatDate(this.startDate, 'yyyy-MM-dd', 'en'));
                }
                this.log.debug(`${LOG_PREFIX} Start Date = ${JSON.stringify(this.startDate)}`);

                // Update the end date
                this.log.trace(`${LOG_PREFIX} Updating the end date`);
                const temp: string | null | undefined = periods[this.intervals.length - 1].data.end;
                if (temp) {
                    this.endDate = new Date(temp);
                    this.timePeriodsForm.controls['endDate'].setValue(formatDate(this.endDate, 'yyyy-MM-dd', 'en'));
                }
                this.log.debug(`${LOG_PREFIX} End Date = ${JSON.stringify(this.endDate)}`); 

                // Set processing status to false
                this.log.trace(`${LOG_PREFIX} Setting the processing status to false`);
                this._processing$.next(false);

            } else {
                // The start date & end date were not successfully formatted
                this.log.trace(`${LOG_PREFIX} The start date & end date were not successfully formatted`);
            }



        } else {
            // An end date was not passed in
            this.log.error(`${LOG_PREFIX} An end date was not passed in`);
        }
    }


    public apply(): void {

        // Get a yyyy-MM-dd formatted version of the start date
        this.log.trace(`${LOG_PREFIX} Getting a yyyy-MM-dd formatted version of the start date`);
        let start: string | null = this.dateUtilService.formatDate(this.startDate, 'short');
        this.log.debug(`${LOG_PREFIX} Start Date String = ${start}`);

        // Get a yyyy-MM-dd formatted version of the end date
        this.log.trace(`${LOG_PREFIX} Getting a yyyy-MM-dd formatted version of the end date`);
        let end: string | null = this.dateUtilService.formatDate(this.endDate, 'short');
        this.log.debug(`${LOG_PREFIX} End Date String = ${end}`);

        // Check if the start date & end date were successfully formatted
        this.log.trace(`${LOG_PREFIX} Checking if the start date & end date were successfully formatted`);
        if (start && end) {

            // The start date & end date were successfully formatted
            this.log.trace(`${LOG_PREFIX} The start date & end date were successfully formatted`);

            // Update the global filter
            this.log.trace(`${LOG_PREFIX} Updating the global filter`);

            this.filterService.update({
                activeTimeIntervalStart: start,
                activeTimeIntervalEnd: end,
                activeTimeIntervalSteps: this.timestep,
                activeTimeIntervals: this.intervals
            });

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();

        } else {
            // The start date & end date were not successfully formatted
            this.log.trace(`${LOG_PREFIX} The start date & end date were not successfully formatted`);

            // Run the form fields validation request to validate all fields and display the error message(s)
            this.log.trace(`${LOG_PREFIX} Running the form fields validation request to validate all fields and display the error message(s)`);
            this.validateAllFormFields(this.timePeriodsForm);

            // Emit an 'invalid' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
            this.failed.emit(400);
        }

    }

    /**
     * See: https://loiane.com/2017/08/angular-reactive-forms-trigger-validation-on-submit
     * @param formGroup 
     */
    private validateAllFormFields(formGroup: FormGroup): void {

        this.log.trace(`${LOG_PREFIX} Entering validateAllFormFields()`);

        Object.keys(formGroup.controls).forEach(field => {
            const control = formGroup.get(field);
            if (control instanceof FormControl) {
                control.markAsTouched({ onlySelf: true });
            } else if (control instanceof FormGroup) {
                this.validateAllFormFields(control);
            }
        });
    }

}
