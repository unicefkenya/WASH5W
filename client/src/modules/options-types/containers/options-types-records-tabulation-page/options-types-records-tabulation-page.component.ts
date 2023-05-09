import { ChangeDetectionStrategy, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Tab } from '@common/models/tab.model';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Options Types Records Tabulation Page]";

@Component({
    selector: 'sb-optionsTypes-records-tabulation-page',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './options-types-records-tabulation-page.component.html',
    styleUrls: ['options-types-records-tabulation-page.component.scss'],
})
export class OptionsTypesRecordsTabulationPageComponent implements OnInit, OnDestroy {

    // Keeps tab of the page title
    public title: string = "Options Types";

    // Keeps tab of the page subtitle
    public subtitle: string = "Classifications of sets of selectable choices";

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
