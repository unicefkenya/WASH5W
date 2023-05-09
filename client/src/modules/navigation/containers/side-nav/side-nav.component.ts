import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FilterService } from '@app/app-filter.service';
import { ThemesService } from '@common/services';
import { SideNavItems, SideNavSection } from '@modules/navigation/models';
import { NavigationService } from '@modules/navigation/services';
import { Subscription } from 'rxjs';

@Component({
    selector: 'sb-side-nav',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './side-nav.component.html',
    styleUrls: ['side-nav.component.scss'],
})
export class SideNavComponent implements OnInit, OnDestroy {
    
    // Instantiate and avail the sidenav sections variable to the parent component for customizations 
    @Input() sideNavSections!: SideNavSection[];

    // Instantiate and avail the sidenav items variable to the parent component for customizations
    @Input() sideNavItems!: SideNavItems;

    // Classes that are adjusted on the fly based on the prevailing theme
    customClasses: string[] = [];

    // A common gathering point for all the component's subscriptions.
    // Makes it easier to unsubscribe from all subscriptions when the component is destroyed.   
    private _subscriptions: Subscription[] = [];   

    constructor(
        public filterService: FilterService,
        public navigationService: NavigationService, 
        private themesService: ThemesService) {}

    ngOnInit() {
        this._subscriptions.push(
            this.themesService.themes$.subscribe((theme) => {
                this.customClasses = [];
                this.customClasses.push(`sb-sidenav-${theme}`);
            })
        );

        
    }

      
  ngOnDestroy() {
        this._subscriptions.forEach((s) => s.unsubscribe());
    } 
}
