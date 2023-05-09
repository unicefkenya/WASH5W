import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
    selector: 'sb-layout-reporting',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './layout-reporting.component.html',
    styleUrls: ['layout-reporting.component.scss'],
})
export class LayoutReportingComponent implements OnInit {
    constructor() {}
    ngOnInit() {}
}
