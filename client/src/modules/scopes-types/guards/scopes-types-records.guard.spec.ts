import { TestBed } from '@angular/core/testing';
import { ScopesTypesRecordsGuard } from './scopes-types-records.guard';

const LOG_PREFIX: string = "[Scopes Types Records Guards]";

describe('Scopes Types Records Guards', () => {

    let scopesTypesRecordsGuard: ScopesTypesRecordsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [ScopesTypesRecordsGuard],
        });
        scopesTypesRecordsGuard = TestBed.inject(ScopesTypesRecordsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            scopesTypesRecordsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });
});
