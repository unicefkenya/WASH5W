import { TestBed } from '@angular/core/testing';
import { TimePointsRecordsGuard } from './time-points-records.guard';

const LOG_PREFIX: string = "[Times Periods Records Guards]";

describe('Times Periods Records Guards', () => {

    let timePeriodsRecordsGuard: TimePointsRecordsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [TimePointsRecordsGuard],
        });
        timePeriodsRecordsGuard = TestBed.inject(TimePointsRecordsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            timePeriodsRecordsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });
});
