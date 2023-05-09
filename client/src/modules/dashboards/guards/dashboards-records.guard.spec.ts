import { TestBed } from '@angular/core/testing';
import { DashboardsRecordsGuard } from './dashboards-records.guard';

const LOG_PREFIX: string = "[Dashboards Records Guards]";

describe('Dashboards Records Guards', () => {

    let dashboardsRecordsGuard: DashboardsRecordsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [DashboardsRecordsGuard],
        });
        dashboardsRecordsGuard = TestBed.inject(DashboardsRecordsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            dashboardsRecordsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });
});
