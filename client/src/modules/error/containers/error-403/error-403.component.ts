import { ChangeDetectionStrategy, Component, HostListener, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Error 403 Page Component]";

@Component({
    selector: 'sb-error-403',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './error-403.component.html',
    styleUrls: ['error-403.component.scss'],
})
export class Error403Component implements OnInit {

    // The reason for being forbidden
    @Input() public reason!: string | null;

    // Instantiate a central gathering point for all the component's subscriptions.
    // Makes it easier to unsubscribe from all subscriptions when the component is destroyed.   
    private _subscriptions: Subscription[] = [];

    constructor(private activatedRoute: ActivatedRoute, private log: NGXLogger) { }

    ngOnInit() {

        this._subscriptions.push(

            this.activatedRoute.paramMap.subscribe(params => {

                switch (params.get('cause')) {

                    case "confirmation":
                        this.reason = "You have not yet confirmed your account";
                        break;

                    case "enablement":
                        this.reason = "The administrator has not yet enabled your account";
                        break;

                    case "rights":
                        this.reason = "The administrator has not yet assigned you your rights";
                        break;

                    default:
                        this.reason = "Access to this resource is forbidden"
                }

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
