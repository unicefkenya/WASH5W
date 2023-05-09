import { TestBed } from '@angular/core/testing';
import { AdministrativeSystemsRecordsGuard } from './administrative-systems-records.guard';

const LOG_PREFIX: string = "[Administrative Systems Records Guards]";

describe('Administrative Systems Records Guards', () => {

    let administrativeSystemsRecordsGuard: AdministrativeSystemsRecordsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [AdministrativeSystemsRecordsGuard],
        });
        administrativeSystemsRecordsGuard = TestBed.inject(AdministrativeSystemsRecordsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            administrativeSystemsRecordsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });
});
