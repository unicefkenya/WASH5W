import { TestBed } from '@angular/core/testing';
import { OrganisationsTypesRecordsGuard } from './organisations-types-records.guard';

const LOG_PREFIX: string = "[Organisations Types Records Guards]";

describe('Organisations Types Records Guards', () => {

    let organisationsTypesRecordsGuard: OrganisationsTypesRecordsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [OrganisationsTypesRecordsGuard],
        });
        organisationsTypesRecordsGuard = TestBed.inject(OrganisationsTypesRecordsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            organisationsTypesRecordsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });
});
