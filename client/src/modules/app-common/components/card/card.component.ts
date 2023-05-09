import { ChangeDetectionStrategy, Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { ThemesService } from '@common/services';
import { Subscription } from 'rxjs';

const LOG_PREFIX: string = "[Card Component]";

@Component({
    selector: 'sb-card',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './card.component.html',
    styleUrls: ['card.component.scss'],
})
export class CardComponent implements OnInit, OnDestroy {

    // Allow the parent component to specify whether or not the card should have a shadow
    @Input() shadow: boolean = true;

    // Classes that are adjusted on the fly based on the prevailing theme
    customClasses: string[] = [];

    // A common gathering point for all the component's subscriptions.
    // Makes it easier to unsubscribe from all subscriptions when the component is destroyed.   
    private _subscriptions: Subscription[] = [];

    constructor(private themesService: ThemesService) { }

    ngOnInit() {

        if (this.shadow) {
            this.customClasses.push("shadow");
        }

        this._subscriptions.push(
            this.themesService.themes$.subscribe((theme) => {
                this.customClasses = [];
                this.customClasses.push(`card-${theme}`);
            })
        );
    }

    @HostListener('window:beforeunload')
    ngOnDestroy() {
        this._subscriptions.forEach((s) => s.unsubscribe());
    }
}
