import { TestBed } from '@angular/core/testing';
import { OrganisationsRecordsGuard } from './organisations-records.guard';

const LOG_PREFIX: string = "[Organisations Records Guards]";

describe('Organisations Records Guards', () => {

    let organisationsRecordsGuard: OrganisationsRecordsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [OrganisationsRecordsGuard],
        });
        organisationsRecordsGuard = TestBed.inject(OrganisationsRecordsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            organisationsRecordsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });
});
