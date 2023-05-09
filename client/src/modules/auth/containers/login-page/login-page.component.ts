import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

const LOG_PREFIX: string = "[Login Page Component]";

@Component({
    selector: 'sb-login-page',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './login-page.component.html',
    styleUrls: ['login-page.component.scss'],
})
export class LoginPageComponent implements OnInit {


    constructor() { }

    ngOnInit() { }

}
