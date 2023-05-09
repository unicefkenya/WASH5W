import { TestBed } from '@angular/core/testing';
import { DissagregationsRecordsGuard } from './dissagregations-records.guard';

const LOG_PREFIX: string = "[Dissagregations Records Guards]";

describe('Dissagregations Records Guards', () => {

    let dissagregationsRecordsGuard: DissagregationsRecordsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [DissagregationsRecordsGuard],
        });
        dissagregationsRecordsGuard = TestBed.inject(DissagregationsRecordsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            dissagregationsRecordsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });
});
