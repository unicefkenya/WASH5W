import { TestBed } from '@angular/core/testing';
import { TimestepsRecordsGuard } from './timesteps-records.guard';

const LOG_PREFIX: string = "[Timesteps Records Guards]";

describe('Timesteps Records Guards', () => {

    let timestepsRecordsGuard: TimestepsRecordsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [TimestepsRecordsGuard],
        });
        timestepsRecordsGuard = TestBed.inject(TimestepsRecordsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            timestepsRecordsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });
});
