import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

const LOG_PREFIX: string = "[Registration Component]";

@Component({
    selector: 'sb-registration-page',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './registration-page.component.html',
    styleUrls: ['registration-page.component.scss'],
})
export class RegistrationPageComponent implements OnInit {

    constructor(){}

    ngOnInit() { }

}
