import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
    selector: 'sb-password-recovery-request-page',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './password-recovery-request-page.component.html',
    styleUrls: ['password-recovery-request-page.component.scss'],
})
export class PasswordRecoveryRequestPageComponent implements OnInit {
    constructor() {}
    ngOnInit() {}
}
