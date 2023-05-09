import { TestBed } from '@angular/core/testing';
import { AdministrativeUnitsTypesRecordsGuard } from './administrative-units-types-records.guard';

const LOG_PREFIX: string = "[Administrative Units Types Records Guards]";

describe('Administrative Units Types Records Guards', () => {

    let administrativeUnitsTypesRecordsGuard: AdministrativeUnitsTypesRecordsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [AdministrativeUnitsTypesRecordsGuard],
        });
        administrativeUnitsTypesRecordsGuard = TestBed.inject(AdministrativeUnitsTypesRecordsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            administrativeUnitsTypesRecordsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });
});
