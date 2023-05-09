import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FilterService } from '@app/app-filter.service';

@Component({
    selector: 'sb-footer',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './footer.component.html',
    styleUrls: ['footer.component.scss'],
})
export class FooterComponent implements OnInit {
    constructor(public filterService: FilterService) {}
    ngOnInit() {}
}
