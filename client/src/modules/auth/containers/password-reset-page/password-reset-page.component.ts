import { ChangeDetectionStrategy, Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Password Reset Page Component]";

@Component({
    selector: 'sb-password-reset-page',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './password-reset-page.component.html',
    styleUrls: ['password-reset-page.component.scss'],
})
export class PasswordResetPageComponent implements OnInit {

    // The registration confirmation token
    public token!: string | null;

    // Instantiate a central gathering point for all the component's subscriptions.
    // Makes it easier to unsubscribe from all subscriptions when the component is destroyed.   
    private _subscriptions: Subscription[] = [];    

    constructor(private activatedRoute: ActivatedRoute, private log: NGXLogger){}

    ngOnInit() { 

        this._subscriptions.push(
            
            this.activatedRoute.paramMap.subscribe(params => {

                this.token = params.get('token');
    
            })
        );
    }


    @HostListener('window:beforeunload')
    ngOnDestroy() {

        this.log.trace(`${LOG_PREFIX} Destroying Component`);

        // Clear all subscriptions
        this.log.trace(`${LOG_PREFIX} Clearing all subscriptions`);
        this._subscriptions.forEach(s => s.unsubscribe());
    }


}
