import { ChangeDetectionStrategy, Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { Tab } from '@common/models/tab.model';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Systems Users Rights Records Tabulation Page]";

@Component({
    selector: 'sb-systems-users-rights-records-tabulation-page',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './systems-users-rights-records-tabulation-page.component.html',
    styleUrls: ['systems-users-rights-records-tabulation-page.component.scss'],
})
export class SystemsUsersRightsRecordsTabulationPageComponent implements OnInit, OnDestroy {

    // Allow the parent component to pass in the target system user
    @Input() public systemUserId!: number;

    // Keeps tab of the page title
    public title: string = "Systems Users Rights";

    // Keeps tab of the page subtitle
    public subtitle: string = "The different contexts assigned to users and their roles / scope of their roles within that context";

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
