import { TestBed } from '@angular/core/testing';
import { EntitiesTypesRecordsGuard } from './entities-types-records.guard';

const LOG_PREFIX: string = "[Entities Types Records Guards]";

describe('Entities Types Records Guards', () => {

    let entitiesTypesRecordsGuard: EntitiesTypesRecordsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [EntitiesTypesRecordsGuard],
        });
        entitiesTypesRecordsGuard = TestBed.inject(EntitiesTypesRecordsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            entitiesTypesRecordsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });
});
