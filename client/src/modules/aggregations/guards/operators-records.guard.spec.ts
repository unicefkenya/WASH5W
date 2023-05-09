import { TestBed } from '@angular/core/testing';
import { OperatorsRecordsGuard } from './operators-records.guard';

const LOG_PREFIX: string = "[Operators Records Guards]";

describe('Operators Records Guards', () => {

    let operatorsRecordsGuard: OperatorsRecordsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [OperatorsRecordsGuard],
        });
        operatorsRecordsGuard = TestBed.inject(OperatorsRecordsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            operatorsRecordsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });
});
