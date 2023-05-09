import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Tab } from '@common/models/tab.model';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Data Forms Records Tabulation Page]";

@Component({
    selector: 'sb-data-forms-elements-configuration-views-tabulation-page',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './data-forms-elements-configuration-views-tabulation-page.component.html',
    styleUrls: ['data-forms-elements-configuration-views-tabulation-page.component.scss'],
})
export class DataFormsElementsConfigurationViewsTabulationPageComponent implements OnInit, OnDestroy {

    // Keeps tab of the page title
    public title: string = "Data Forms Designs";

    // Keeps tab of the page subtitle
    public subtitle: string = "Data Collection Tools Design";

    // Keeps tabs of the tabs if page is tabbed
    public tabs: Tab[] = [ ];


    constructor(
        private cd: ChangeDetectorRef,
        private log: NGXLogger) { }

    ngOnInit() {
        this.log.trace(`${LOG_PREFIX} Initialising Component`);
    }

    @HostListener('window:beforeunload')
    ngOnDestroy() {
        this.log.trace(`${LOG_PREFIX} Destroying Component`);
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
