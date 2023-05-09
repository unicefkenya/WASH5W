import { TestBed } from '@angular/core/testing';
import { OptionsTypesRecordsGuard } from './options-types-records.guard';

const LOG_PREFIX: string = "[Options Types Records Guards]";

describe('Options Types Records Guards', () => {

    let optionsTypesRecordsGuard: OptionsTypesRecordsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [OptionsTypesRecordsGuard],
        });
        optionsTypesRecordsGuard = TestBed.inject(OptionsTypesRecordsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            optionsTypesRecordsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });
});
