import { TestBed } from '@angular/core/testing';
import { DissagregationsSchemesRecordsGuard } from './dissagregations-schemes-records.guard';

const LOG_PREFIX: string = "[Dissagregations Schemes Records Guards]";

describe('Dissagregations Schemes Records Guards', () => {

    let dissagregationsSchemesRecordsGuard: DissagregationsSchemesRecordsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [DissagregationsSchemesRecordsGuard],
        });
        dissagregationsSchemesRecordsGuard = TestBed.inject(DissagregationsSchemesRecordsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            dissagregationsSchemesRecordsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });
});
