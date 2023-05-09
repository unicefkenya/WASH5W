import { TestBed } from '@angular/core/testing';
import { EntitiesRecordsGuard } from './entities-records.guard';

const LOG_PREFIX: string = "[Entities Records Guards]";

describe('Entities Records Guards', () => {

    let entitiesRecordsGuard: EntitiesRecordsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [EntitiesRecordsGuard],
        });
        entitiesRecordsGuard = TestBed.inject(EntitiesRecordsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            entitiesRecordsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });
});
