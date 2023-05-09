import { TestBed } from '@angular/core/testing';
import { IndicatorsRecordsGuard } from './indicators-records.guard';

const LOG_PREFIX: string = "[Indicators Records Guards]";

describe('Indicators Records Guards', () => {

    let indicatorsRecordsGuard: IndicatorsRecordsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [IndicatorsRecordsGuard],
        });
        indicatorsRecordsGuard = TestBed.inject(IndicatorsRecordsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            indicatorsRecordsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });
});
