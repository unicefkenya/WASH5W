import { TestBed } from '@angular/core/testing';
import { QuantitiesObservationsRecordsGuard } from './quantities-observations-records.guard';

const LOG_PREFIX: string = "[Quantities Observations Records Guards]";

describe('Quantities Observations Records Guards', () => {

    let quantitiesObservationsRecordsGuard: QuantitiesObservationsRecordsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [QuantitiesObservationsRecordsGuard],
        });
        quantitiesObservationsRecordsGuard = TestBed.inject(QuantitiesObservationsRecordsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            quantitiesObservationsRecordsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });
});
