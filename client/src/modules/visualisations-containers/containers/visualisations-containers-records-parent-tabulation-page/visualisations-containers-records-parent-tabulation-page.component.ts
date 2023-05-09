import { ChangeDetectionStrategy, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Tab } from '@common/models/tab.model';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Visualisations Containers Records Tabulation Page]";

@Component({
    selector: 'sb-visualisations-containers-records-parent-tabulation-page',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './visualisations-containers-records-parent-tabulation-page.component.html',
    styleUrls: ['visualisations-containers-records-parent-tabulation-page.component.scss'],
})
export class VisualisationsContainersRecordsParentTabulationPageComponent implements OnInit, OnDestroy {

    // Keeps tab of the page title
    public title: string = "Visualisations Containers";

    // Keeps tab of the page subtitle
    public subtitle: string = "The collections of page trees, pages & page tabs within which data is visualised";

    // Keeps tabs of the tabs if page is tabbed
    public tabs: Tab[] = [];


    constructor(
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
