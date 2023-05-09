// See: https://www.npmjs.com/package/highcharts-angular

import { Component, OnInit, ChangeDetectorRef, AfterViewInit, HostListener, Input } from '@angular/core';
import { FilterService } from '@app/app-filter.service';
import { QuantityObservation } from '@modules/quantities-observations/models';
import { QuantitiesObservationsDataService } from '@modules/quantities-observations/services/quantities-observations-data.service';
import { VisualisationVariable } from '@modules/visualisation-variables/models/visualisation-variable.model';
import { VisualisationVariablesDataService } from '@modules/visualisation-variables/services/visualisation-variables-data.service';
import { Visualisation } from '@modules/visualisations/models/visualisation.model';
import * as Highcharts from 'highcharts';
import HC_exporting from 'highcharts/modules/exporting';
import moment from 'moment';
import { NGXLogger } from 'ngx-logger';
import { Subscription, first } from 'rxjs';
import { AdministrativeUnit } from '@modules/administrative-units/models/administrative-unit.model';
import { VisualisationsAxesDataService } from '@modules/visualisation-axes/services/visualisations-axes-data.service';
import { VisualisationAxis } from '@modules/visualisation-axes/models/visualisation-axis.model';

HC_exporting(Highcharts);

const LOG_PREFIX: string = "[Chart Component]";

@Component({
    selector: 'sb-charts',
    templateUrl: './charts.component.html',
    styleUrls: ['./charts.component.scss']
})
export class VisualisationChartsComponent implements OnInit, AfterViewInit {

    // Allow the parent component to specify what should be visualized
    @Input() visualisation: Visualisation | null = null;

    // Collate the visualisation's variables
    private visualisationVariables!: VisualisationVariable[];

    // Collate the visualisation's axes (optionally)
    private visualisationAxes!: VisualisationAxis[];

    // Collate the visualisation variables indicators observations
    private quantitiesObservations!: QuantityObservation[];

    // Initialise the chart
    chart: typeof Highcharts = Highcharts;

    // Declare a placeholder for the chart options
    options: any;

    // Collate the chart categories - column charts, line charts
    private categories: string[] = [];

    // Collate the chart series
    private series: any[] = [];

    // Collate pie charts generation data
    data: any[] = [];

    // Collate pie charts generation colours
    colours: string[] = [];

    // Keep tabs of the currently active location / time filtering criterias
    public activeAdministrativeUnit: AdministrativeUnit | null | undefined = null;
    public activeTimeIntervalStart: moment.Moment | null = null;
    public activeTimeIntervalEnd: moment.Moment | null = null;

    // Keep tabs on the initialisation status of the chart options
    initialised: boolean = false;

    // Instantiate a central gathering point for all the component's subscriptions.
    // Makes it easier to unsubscribe from all subscriptions when the component is destroyed.   
    private _subscriptions: Subscription[] = [];

    constructor(
        public quantitiesObservationsDataService: QuantitiesObservationsDataService,
        public visualisationsAxesDataService: VisualisationsAxesDataService,
        public visualisationsVariablesDataService: VisualisationVariablesDataService,
        public filterService: FilterService,
        private cd: ChangeDetectorRef,
        private log: NGXLogger) { }






    ngOnInit(): void {

        // Initialize component
        this.log.trace(`${LOG_PREFIX} Initializing component`);

        this.initialiseVisualisationsVariables(() => {
            this.initialiseVisualisationsAxes(() => {
                this.initialiseChartCategories(() => {
                    this.initialiseLocationAndTimeFilterChangesHandler(() => {

                    });
                });
            });
        });



    }


    ngAfterViewInit(): void {

    }

    @HostListener('window:beforeunload')
    ngOnDestroy() {

        this.log.trace(`${LOG_PREFIX} Destroying Component`);

        // Clear all subscriptions
        this.log.trace(`${LOG_PREFIX} Clearing all subscriptions`);
        this._subscriptions.forEach(s => s.unsubscribe());
    }


    /**
     * Retrieves and locally caches Visualisations Variables records
     * @param callback The function to call when done
     */
    private initialiseVisualisationsVariables(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseVisualisationsVariables()`);

        // Retrieve and cache all the Visualisations Variables records
        this.log.trace(`${LOG_PREFIX} Retrieving and caching all the Visualisations Variables records`);
        this.visualisationsVariablesDataService
            .getVisualisationsVariables(false, {
                searchTerm: null,
                page: null,
                pageSize: null,
                sortColumn: 'id',
                sortDirection: 'asc',
                id: null,
                visualisationId: this.visualisation?.id,
                indicatorId: null,
                roleId: null
            })
            .pipe(first())
            .subscribe({
                next: (visualisationsVariables: VisualisationVariable[]) => {

                    // Visualisations Variables successfully retrieved and cached
                    this.log.debug(`${LOG_PREFIX} ${visualisationsVariables.length} Visualisations Variables(s) retrieved and cached`);
                    this.visualisationVariables = this.sortVisualisationVariables(visualisationsVariables);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                },

                error: (err: any) => {

                    // Visualisations Variables retrieval failed
                    this.log.error(`${LOG_PREFIX} Visualisations Variables retrieval failed`);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                }
            });

    }

    /**
     * Retrieves and caches Visualisations Axes records
     * @param callback The function to call when done
     */
    private initialiseVisualisationsAxes(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseVisualisationsAxes()`);

        // Retrieve and cache all the Visualisations Axes records
        this.log.trace(`${LOG_PREFIX} Retrieving and caching all the Visualisations Axes records`);
        this.visualisationsAxesDataService
            .getVisualisationsAxes(false, {
                page: 1,
                pageSize: 20,
                searchTerm: null,
                sortColumn: 'name',
                sortDirection: 'asc',
                id: null,
                visualisationId: this.visualisation?.id,
                axisId: null,
                label: null
            })
            .pipe(first())
            .subscribe({
                next: (visualisationsAxes: VisualisationAxis[]) => {

                    // Visualisations Axes successfully retrieved and cached
                    this.log.debug(`${LOG_PREFIX} ${visualisationsAxes.length} Visualisations Axes(s) retrieved and cached`);
                    this.visualisationAxes = visualisationsAxes;

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                },

                error: (err: any) => {

                    // Visualisations Axes retrieval failed
                    this.log.error(`${LOG_PREFIX} Visualisations Axes retrieval failed`);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                }
            });

    }



    /**
     * Initialise Chart Categories
     * @param callback The function to call when done
     */
    private initialiseChartCategories(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseChartCategories()`);

        switch (this.visualisation?.data.visualisationTypeId) {

            case 2: // BASIC_COLUMN_CHART
            case 3: // STACKED_COLUMN_CHART
            case 4: // BASIC_BAR_CHART
            case 5: // STACKED_BAR_CHART
                this.categories = this.visualisationVariables.map(v => v.data.dimension).filter(this.notEmpty).filter(this.unique);
                break;

            case 1: // BASIC_LINE_CHART
                this.categories = this.filterService.filter.activeTimeIntervals.map(m => m.title);
                break;

            default:
                this.categories = [];
        }

        this.log.debug(`${LOG_PREFIX} Categories = ${JSON.stringify(this.categories)}`);

        // Return
        this.log.trace(`${LOG_PREFIX} Returning`);
        callback();

    }


    /**
     * Subscribe and react to administrative unit changes
     * @param callback The function to call when done
     */
    private initialiseLocationAndTimeFilterChangesHandler(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseLocationAndTimeFilterChangesHandler()`);

        // Subscribe to filtering criteria updates and react to them if the administrative unit or time is changed
        this.log.trace(`${LOG_PREFIX} Subscribing to filtering criteria updates and react to them if the administrative unit or time is changed`);
        this._subscriptions.push(
            this.filterService.currentFilter$
                .subscribe({
                    next: (filter) => {

                        if ((JSON.stringify(this.activeAdministrativeUnit) !== JSON.stringify(filter.activeAdministrativeUnit)) ||
                            (JSON.stringify(this.activeTimeIntervalStart) !== JSON.stringify(moment(filter.activeTimeIntervalStart))) ||
                            (JSON.stringify(this.activeTimeIntervalEnd) !== JSON.stringify(moment(filter.activeTimeIntervalEnd)))) {

                            // Location or time changed
                            this.log.trace(`${LOG_PREFIX} Location or time changed`);

                            // Keep a local reference to the location / temporal filters
                            this.activeAdministrativeUnit = filter.activeAdministrativeUnit;
                            this.activeTimeIntervalStart = moment(filter.activeTimeIntervalStart);
                            this.activeTimeIntervalEnd = moment(filter.activeTimeIntervalEnd);

                            if (this.initialised) {
                                this.initialised = false;
                                this.cd.detectChanges();
                            }

                            this.initialiseQuantitiesObservations(() => {
                                this.initialiseChartSeries(() => {
                                    this.prepareChartOptions(() => {
                                        this.initialised = true;
                                        this.cd.detectChanges();
                                    });
                                });
                            });


                        }
                    }
                })
        );

        // Transfer control to the callback function
        callback();

    }

    /**
     * Retrieves and caches Quantities Observation records
     * @param callback The function to call when done
     */
    private initialiseQuantitiesObservations(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseQuantitiesObservations()`);

        // Check if the target administrative unit has been specified
        this.log.trace(`${LOG_PREFIX} Checking if the target administrative unit has been specified`);
        if (this.filterService.filter.activeAdministrativeUnit?.id) {

            // The target administrative unit has been specified
            this.log.trace(`${LOG_PREFIX} The target administrative unit has been specified`);

            // Retrieve all the Quantities Observations whose indicators are referenced by the visualisation variables
            this.log.trace(`${LOG_PREFIX} Retrieving and caching all the Quantities Observation records`);
            this.quantitiesObservationsDataService
                .getQuantitiesObservations(false, {
                    page: null,
                    pageSize: null,
                    searchTerm: null,
                    sortColumn: 'id',
                    sortDirection: 'asc',
                    partiesIds: this.filterService.filter.activeAdministrativeUnit?.id ? [this.filterService.filter.activeAdministrativeUnit?.id] : null,
                    timePointId: null,
                    timePointIdGTE: parseInt(moment(this.filterService.filter.activeTimeIntervalStart).format('YYYYMMDD')),
                    timePointIdLTE: parseInt(moment(this.filterService.filter.activeTimeIntervalEnd).format('YYYYMMDD')),
                    timePeriodId: null,
                    phenomenonTypesIds: (this.visualisationVariables.map(v => v.data.indicatorId)).filter(this.notEmpty),
                    observationTypeId: null
                })
                .pipe(first())
                .subscribe({
                    next: (quantitiesObservations: QuantityObservation[]) => {

                        // Quantities Observation successfully retrieved and cached
                        this.log.debug(`${LOG_PREFIX} ${quantitiesObservations.length} Quantities Observation(s) retrieved and cached`);
                        this.quantitiesObservations = quantitiesObservations;

                        // Return
                        this.log.trace(`${LOG_PREFIX} Returning`);
                        callback();
                    },

                    error: (err: any) => {

                        // Quantities Observation retrieval failed
                        this.log.error(`${LOG_PREFIX} Quantities Observation retrieval failed`);

                        // Return
                        this.log.trace(`${LOG_PREFIX} Returning`);
                        callback();
                    }
                });

        } else {

            // The target administrative unit has not been specified
            this.log.error(`${LOG_PREFIX} The target administrative unit has not been specified`);

            // Return
            this.log.trace(`${LOG_PREFIX} Returning`);
            callback();
        }



    }




    /**
     * Initialise Chart Series
     * @param callback The function to call when done
     */
    private initialiseChartSeries(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseChartSeries()`);

        const series: any[] = [];

        switch (this.visualisation?.data.visualisationTypeId) {

            case 2: // BASIC_COLUMN_CHART
            case 3: // STACKED_COLUMN_CHART
            case 4: // BASIC_BAR_CHART
            case 5: // STACKED_BAR_CHART

                // Loop through the series labels
                for (let lable of (this.visualisationVariables.map(v => v.data.label)).filter(this.unique)) {

                    const data: number[] = [];

                    // Loop through the categories
                    for (let category of this.categories) {

                        // Find the visualisation variable at the intersection of the series and the category
                        const vv: VisualisationVariable | undefined = this.visualisationVariables.find(vv => vv.data.dimension == category && vv.data.label == lable);

                        // Check if the visualisation variable was successfully retrieved
                        if (vv) {

                            // Retrieve the visualisation variable's observations
                            const observations: QuantityObservation[] = this.quantitiesObservations.filter(q => q.data.phenomenonTypeId == vv.data.indicatorId);

                            // Get the last observed amount
                            const amount: number | null | undefined = observations.length > 0 ? (observations[observations.length - 1]).data.amount : 0;

                            // Initialise the series data value for the current category
                            if (amount) {
                                data.push(amount)
                            } else {
                                data.push(0);
                            }


                        }


                    }

                    // Initialise the series
                    series.push({
                        showInLegend: true,
                        name: lable,
                        data: data
                    });
                }

                break;

            case 1: // BASIC_LINE_CHART

                // Loop through the visualisation variables
                for (let vv of this.visualisationVariables) {

                    const data: number[] = [];

                    // Loop through the moments and collate the series data
                    for (let moment of this.getMoments()) {

                        // Retrieve the visualisation variable's observations
                        const observations: QuantityObservation[] = [];

                        for (let obs of this.quantitiesObservations) {

                            if (obs.data.phenomenonTypeId == vv.data.indicatorId) {
                                const date: Date | null = this.getDateFromDateString(this.getDateStringFromTimepointId(obs.data.timePointId));
                                if (date && moment.isSame(date, 'month')) {
                                    observations.push(obs);
                                }
                            }

                        }
                        // Get the last observed amount
                        const amount: number | null | undefined = observations.length > 0 ? (observations[observations.length - 1]).data.amount : 0;

                        // Initialise the series data value for the current category
                        if (amount) {
                            data.push(amount)
                        } else {
                            data.push(0);
                        }

                    }

                    // Initialise the series
                    series.push({
                        showInLegend: true,
                        name: vv.data.label ? vv.data.label : "serie " + vv.id,
                        data: data
                    })
                }

                break;

            case 6: // PIE_CHART
            case 7: // SEMI_CIRCLE_DONUT  

                // Loop through the visualisation variables
                for (let vv of this.visualisationVariables) {

                    // Retrieve the visualisation variable's observations
                    const observations: QuantityObservation[] | undefined = this.quantitiesObservations.filter(q => q.data.phenomenonTypeId == vv.data.indicatorId);

                    // Get the last observed amount
                    const amount: number | null | undefined = (observations[observations.length - 1]).data.amount;

                    // Initialise the series
                    series.push({
                        name: vv.data.label ? vv.data.label : "serie " + vv.id,
                        y: amount ? amount : 0,
                    })
                }
                break;

        }

        this.log.debug(`${LOG_PREFIX} Series = ${JSON.stringify(series)}`);
        this.series = series;

        // Return
        this.log.trace(`${LOG_PREFIX} Returning`);
        callback();

    }

    private prepareChartOptions(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Preparing Chart Options`);

        switch (this.visualisation?.data.visualisationTypeId) {

            case 1: // BASIC_LINE_CHART:
            case 2: // BASIC_COLUMN_CHART:
            case 3: // STACKED_COLUMN_CHART:
            case 4: // BASIC_BAR_CHART
            case 5: // STACKED_BAR_CHART

                // Get the labels of the chart axes
                const xAxisLabel: VisualisationAxis | undefined = this.visualisationAxes.find(v => v.data.axisId == 1);
                const yAxisLabel: VisualisationAxis | undefined = this.visualisationAxes.find(v => v.data.axisId == 2);


                // Initialize the chart options
                switch (this.visualisation?.data.visualisationTypeId) {

                    case 1: // BASIC_LINE_CHART:
                        this.options = this.getLineChartOptions(this.categories, this.series, xAxisLabel, yAxisLabel);
                        break;

                    case 2: // BASIC_COLUMN_CHART:
                    case 3: // STACKED_COLUMN_CHART:
                        this.options = this.getColumnChartOptions(this.categories, this.series, xAxisLabel, yAxisLabel);
                        break;

                    case 4: // BASIC_BAR_CHART
                    case 5: // STACKED_BAR_CHART
                        this.options = this.getBarChartOptions(this.categories, this.series, xAxisLabel, yAxisLabel);
                        break;
                }
                break;

            case 6: // PIE_CHART
                this.options = this.getPieChartOptions(this.visualisation?.data.name ? this.visualisation?.data.name : "Option", this.data, this.colours);
                break;

            case 7: // SEMI_CIRCLE_DONUT
                this.options = this.getSemiCircleDonutChartOptions(this.visualisation?.data.name ? this.visualisation?.data.name : "Option", this.data, this.colours);
                break;

            default:
                this.options = {}
                return;

        }

        // Return
        this.log.trace(`${LOG_PREFIX} Returning`);
        callback();

    }

    private getLineChartOptions(
        categories: string[],
        series: any[],
        xAxisLabel: VisualisationAxis | undefined,
        yAxisLabel: VisualisationAxis | undefined): any {

        return {
            chart: {
                type: 'line'
            },
            title: {
                text: ''
            },
            subtitle: {
                text: ''
            },
            xAxis: {
                categories: Array.from(categories),
                title: {
                    text: xAxisLabel == undefined ? '' : xAxisLabel.data.label
                },
                crosshair: true
            },
            yAxis: {
                title: {
                    text: yAxisLabel == undefined ? '' : yAxisLabel.data.label
                }
            },
            plotOptions: {
                series: {
                    marker: {
                        enabled: false
                    },
                    dataLabels: {
                        enabled: true,
                        format: '{point.y:.2f}'
                    }
                }
            },
            series: series,
            credits: {
                enabled: false
            }
        }
    }


    private getColumnChartOptions(
        categories: string[],
        series: any[],
        xAxisLabel: VisualisationAxis | undefined,
        yAxisLabel: VisualisationAxis | undefined): any {

        return {
            chart: {
                type: 'column'
            },
            title: {
                text: ''
            },
            subtitle: {
                text: ''
            },
            xAxis: {
                categories: Array.from(categories),
                title: {
                    text: xAxisLabel == undefined ? '' : xAxisLabel.data.label
                },
                crosshair: true
            },
            yAxis: {
                title: {
                    text: yAxisLabel == undefined ? '' : yAxisLabel.data.label
                },
                min: 0,
                max: 100
            },
            series: series,
            plotOptions: {
                column: {
                    stacking: 'normal',
                    dataLabels: {
                        enabled: true
                    }
                }
            },
            credits: {
                enabled: false
            }
        }
    }



    private getBarChartOptions(
        categories: string[],
        series: any[],
        xAxisLabel: VisualisationAxis | undefined,
        yAxisLabel: VisualisationAxis | undefined): any {

        return {
            chart: {
                type: 'bar'
            },
            title: {
                text: ''
            },
            subtitle: {
                text: ''
            },
            xAxis: {
                categories: Array.from(categories),
                title: {
                    text: xAxisLabel == undefined ? '' : xAxisLabel.data.label
                },
                crosshair: true
            },
            yAxis: {
                title: {
                    text: yAxisLabel == undefined ? '' : yAxisLabel.data.label
                },
                min: 0,
                max: 100
            },
            series: series,
            plotOptions: {
                column: {
                    stacking: 'normal',
                    dataLabels: {
                        enabled: true
                    }
                }
            },
            credits: {
                enabled: false
            }
        }
    }



    private getPieChartOptions(
        title: string,
        data: any[],
        colors: string[]): any {

        return {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: 0,
                plotShadow: false,
                type: 'pie'
            },
            title: {
                text: ''
            },
            subtitle: {
                text: ''
            },
            accessibility: {
                point: {
                    valueSuffix: '%'
                }
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.percentage:.2f} %'
                    }
                }
            },
            series: [{
                name: title,
                colorByPoint: true,
                data: data
            }],
            credits: {
                enabled: false
            }
        }
    }



    private getSemiCircleDonutChartOptions(
        title: string,
        data: any[],
        colors: string[]): any {

        return {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: 0,
                plotShadow: false,
                type: 'pie'
            },
            title: {
                text: ''
            },
            subtitle: {
                text: ''
            },
            accessibility: {
                point: {
                    valueSuffix: '%'
                }
            },
            plotOptions: {
                pie: {
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.percentage:.2f} %',
                        distance: -50,
                        style: {
                            fontWeight: 'normal',
                            color: 'black'
                        }
                    },
                    startAngle: -90,
                    endAngle: 90,
                    center: ['50%', '75%'],
                    size: '110%',
                    colors: colors
                }
            },
            series: [{
                type: 'pie',
                name: title,
                innerSize: '50%',
                data: data
            }],
            credits: {
                enabled: false
            }
        }
    }

    /**
     * Sorts the visulisation variables by dimension and index
     */
    private sortVisualisationVariables(visualisationVariables: VisualisationVariable[]): VisualisationVariable[] {

        return visualisationVariables.sort((obj1, obj2) => {

            if (obj1.data.dimensionIdx && obj2.data.dimensionIdx) {
                if (obj1.data.dimensionIdx < obj2.data.dimensionIdx) {
                    return -1;
                } else if (obj1.data.dimensionIdx > obj2.data.dimensionIdx) {
                    return 1;
                } else {

                    if (obj1.data.labelIdx && obj2.data.labelIdx) {

                        if (obj1.data.labelIdx < obj2.data.labelIdx) {
                            return -1;
                        } else if (obj1.data.labelIdx > obj2.data.labelIdx) {
                            return 1;
                        } else {
                            return 0;
                        }

                    } else {

                        return 0;
                    }


                }
            } else {

                if (obj1.data.labelIdx && obj2.data.labelIdx) {

                    if (obj1.data.labelIdx < obj2.data.labelIdx) {
                        return -1;
                    } else if (obj1.data.labelIdx > obj2.data.labelIdx) {
                        return 1;
                    } else {
                        return 0;
                    }

                } else {

                    return 0;
                }
            }
        });

    }



    // See: https://stackoverflow.com/questions/43118692/typescript-filter-out-nulls-from-an-array
    private notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
        return value !== null && value !== undefined;
    }
    
    private unique(value: any, index: any, self: any) {
        return self.indexOf(value) === index;
    }


    private getMoments(): moment.Moment[] {
        return [
            moment(this.filterService.filter.activeTimeIntervalStart),
            moment(this.filterService.filter.activeTimeIntervalStart).clone().add(1, "month"),
            moment(this.filterService.filter.activeTimeIntervalEnd)]
    }

    private getDateStringFromTimepointId(timepointId: number | null | undefined): string | null {

        if (timepointId) {
            let yearString = timepointId.toString();
            let output = [];

            for (var i = 0, len = yearString.length; i < len; i++) {
                output.push(yearString.charAt(i));
            }

            return output[0]
                + "" + output[1]
                + "" + output[2]
                + "" + output[3]
                + "-" + output[4]
                + "" + output[5]
                + "-" + output[6]
                + "" + output[7]
        } else {
            return null;
        }

    }



    private getDateFromDateString(dateString: string | null): Date | null {

        if (dateString) {
            return new Date(dateString);
        } else {
            return null;
        }
    }


}