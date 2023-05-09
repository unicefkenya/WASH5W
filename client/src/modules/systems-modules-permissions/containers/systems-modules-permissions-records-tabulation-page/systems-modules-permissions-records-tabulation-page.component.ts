import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Tab } from '@common/models/tab.model';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Systems Modules Permissions Records Tabulation Page]";

@Component({
    selector: 'sb-systems-modules-permissions-records-tabulation-page',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './systems-modules-permissions-records-tabulation-page.component.html',
    styleUrls: ['systems-modules-permissions-records-tabulation-page.component.scss'],
})
export class SystemsModulesPermissionsRecordsTabulationPageComponent implements OnInit, OnDestroy {


    // Keeps tab of the page title
    public title: string = "Systems Modules Permissions";

    // Keeps tab of the page subtitle
    public subtitle: string = "The different types of permissions that are associated with the currently selected system module";

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
