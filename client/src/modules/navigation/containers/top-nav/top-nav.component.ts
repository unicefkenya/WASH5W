import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FilterService } from '@app/app-filter.service';
import { ConnectivityStatusService, TextUtilService, ThemesService } from '@common/services';
import { NavigationService } from '@modules/navigation/services';
import { NGXLogger } from 'ngx-logger';
import { Subscription } from 'rxjs';

@Component({
    selector: 'sb-topnav',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './top-nav.component.html',
    styleUrls: ['top-nav.component.scss'],
})
export class TopNavComponent implements OnInit, OnDestroy {

    // Classes that are adjusted on the fly based on the prevailing theme
    customClasses: string[] = []; 

    // Keeps tabs of whether we are online
    online: boolean = false;

    // Whether the nav is shown conditionally or unconditionally
    nav: string = "conditional"; // conditional or unconditional

    // A common gathering point for all the component's subscriptions.
    // Makes it easier to unsubscribe from all subscriptions when the component is destroyed.   
    private _subscriptions: Subscription[] = [];

    constructor(
        public connectivityStatusService: ConnectivityStatusService,
        public filterService: FilterService,
        public textUtilService: TextUtilService,
        private navigationService: NavigationService, 
        private themesService: ThemesService,
        private log: NGXLogger,
        private cd: ChangeDetectorRef) { }

    ngOnInit() {
        this._subscriptions.push(
            this.themesService.themes$.subscribe((theme) => {
                this.customClasses = [];
                this.customClasses.push(`navbar-${theme}`);
            })
        );

        this._subscriptions.push(
            this.connectivityStatusService.online$.subscribe((online) => {
                if(this.online != online) {
                    this.online = online;
                    this.cd.markForCheck();
                }
            })
        )
    }

    truncateTitle(title: string): string {
        return title? this.textUtilService.truncate(title, [150, "..."]) : "";
    }

    
    ngOnDestroy() {
        this._subscriptions.forEach((s) => s.unsubscribe());
    }

    toggleSideNav() {
        this.navigationService.toggleSideNav();
    }
}
