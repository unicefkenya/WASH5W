import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { Tab } from '@common/models/tab.model';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[QuantitiesObservations Records Tabulation Page]";

@Component({
    selector: 'sb-quantities-observations-records-tabulation-page',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './quantities-observations-records-tabulation-page.component.html',
    styleUrls: ['quantities-observations-records-tabulation-page.component.scss'],
})
export class QuantitiesObservationsRecordsTabulationPageComponent implements OnInit, OnDestroy {

    // Allows the parent component to inject the unique identifier of the active time period
    @Input() public timePeriodId!: number | null;

    // Allows the parent component to inject the unique identifier of the target indicator
    @Input() public phenomenonTypeId!: number | null;

    // Allows the parent component to inject the unique identifier of the target indicator's unit of measure
    @Input() public unitId!: number | null;

    // Allows the parent component to inject the unique identifier of the target observation type e.g. target / actual
    @Input() public observationTypeId!: number | null;

    // Keeps tab of the page title
    public title: string = "QuantitiesObservations";

    // Keeps tab of the page subtitle
    public subtitle: string = "The bodies from which data is collected";;

    // Keeps tabs of the tabs if page is tabbed
    public tabs: Tab[] = []


    constructor(
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
     * Returns the list of tabs sorted by index
     */
    public getSortedTabs(): Tab[] {

        this.log.trace(`${LOG_PREFIX} Entering getSortedTabs()`);

        return this.tabs.sort((t1: Tab, t2: Tab) => {
            if (t1.index > t2.index) {
                return 1;
            }

            if (t1.index < t2.index) {
                return -1;
            }

            return 0;
        });
    }


}
