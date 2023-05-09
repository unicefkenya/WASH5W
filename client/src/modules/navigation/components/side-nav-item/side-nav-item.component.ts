import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, Input, OnInit } from '@angular/core';
import { FilterService } from '@app/app-filter.service';
import { SBRouteData, SideNavItem } from '@modules/navigation/models';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
    selector: 'sb-side-nav-item',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './side-nav-item.component.html',
    styleUrls: ['side-nav-item.component.scss'],
})
export class SideNavItemComponent implements OnInit {

    @Input() sideNavItem!: SideNavItem;
    @Input() isActive!: boolean;

    expanded = false;
    routeData!: SBRouteData;

    // Instantiate a central gathering point for all the component's subscriptions.
    // Makes it easier to unsubscribe from all subscriptions when the component is destroyed.   
    private _subscriptions: Subscription[] = [];

    constructor(private filterService: FilterService, private cd: ChangeDetectorRef) {}

    ngOnInit() {

        this._subscriptions.push(

            this.filterService.currentFilter$.subscribe(filter => {

                if(filter.activeLink) {
                
                    if(filter.activeLink == this.sideNavItem.link){
                        if(!this.isActive){
                            this.isActive = true;
                            this.cd.detectChanges();
                        }
                        
                    } else {
                        if(this.isActive){
                            this.isActive = false;
                            this.cd.detectChanges();
                        }
                    }
                } else {
                    this.isActive = false;
                }

            })
        )
    }

    @HostListener('window:beforeunload')
    ngOnDestroy() {
        // Clear all subscriptions
        this._subscriptions.forEach(s => s.unsubscribe());
    }    

    getSecondaryOutletLink(outlet: string, link: string | undefined): any {
        let o: any = {};
        o[outlet] = [link];
        return { outlets: o};
    }
    
    onClick() {
        this.expanded = !this.expanded;
        this.filterService.update({activeLink: this.sideNavItem.link})
    }
}
