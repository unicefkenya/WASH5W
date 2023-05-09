import { TestBed } from '@angular/core/testing';
import { AdministrativeHierarchiesRecordsGuard } from './administrative-hierarchies-records.guard';

const LOG_PREFIX: string = "[Administrative Hierarchies Records Guards]";

describe('Administrative Hierarchies Records Guards', () => {

    let administrativeHierarchiesRecordsGuard: AdministrativeHierarchiesRecordsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [AdministrativeHierarchiesRecordsGuard],
        });
        administrativeHierarchiesRecordsGuard = TestBed.inject(AdministrativeHierarchiesRecordsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            administrativeHierarchiesRecordsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });
});
