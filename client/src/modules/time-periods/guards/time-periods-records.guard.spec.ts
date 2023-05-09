import { TestBed } from '@angular/core/testing';
import { TimePeriodsRecordsGuard } from './time-periods-records.guard';

const LOG_PREFIX: string = "[Times Periods Records Guards]";

describe('Times Periods Records Guards', () => {

    let timePeriodsRecordsGuard: TimePeriodsRecordsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [TimePeriodsRecordsGuard],
        });
        timePeriodsRecordsGuard = TestBed.inject(TimePeriodsRecordsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            timePeriodsRecordsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });
});
