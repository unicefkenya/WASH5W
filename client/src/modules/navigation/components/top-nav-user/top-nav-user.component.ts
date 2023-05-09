import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FilterService } from '@app/app-filter.service';

@Component({
    selector: 'sb-topnav-user',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './top-nav-user.component.html',
    styleUrls: ['top-nav-user.component.scss'],
})
export class TopNavUserComponent implements OnInit {

    constructor(private router: Router, public filterService: FilterService) {}
    
    ngOnInit() {}

    logout() {

        // Clear the filter
        this.filterService.update({
            activeSystemUser: null
        }); 
        
        // Clear the local storage
        localStorage.removeItem("filter");
        
        // Redirect the user to the home page
        this.router.navigate(['/home']);
    }
}
