import { TestBed } from '@angular/core/testing';
import { AdministrativeStructuresRecordsGuard } from './administrative-structures-records.guard';

const LOG_PREFIX: string = "[Administrative Structures Records Guards]";

describe('Administrative Structures Records Guards', () => {

    let administrativeStructuresRecordsGuard: AdministrativeStructuresRecordsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [AdministrativeStructuresRecordsGuard],
        });
        administrativeStructuresRecordsGuard = TestBed.inject(AdministrativeStructuresRecordsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            administrativeStructuresRecordsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });
});
