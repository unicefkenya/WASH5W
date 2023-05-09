import { TestBed } from '@angular/core/testing';
import { AdministrativeUnitsRecordsGuard } from './administrative-units-records.guard';

const LOG_PREFIX: string = "[Administrative Units Records Guards]";

describe('Administrative Units Records Guards', () => {

    let administrativeUnitsRecordsGuard: AdministrativeUnitsRecordsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [AdministrativeUnitsRecordsGuard],
        });
        administrativeUnitsRecordsGuard = TestBed.inject(AdministrativeUnitsRecordsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            administrativeUnitsRecordsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });
});
