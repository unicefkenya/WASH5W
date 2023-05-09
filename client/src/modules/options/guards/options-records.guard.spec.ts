import { TestBed } from '@angular/core/testing';
import { OptionsRecordsGuard } from './options-records.guard';

const LOG_PREFIX: string = "[Options Records Guards]";

describe('Options Records Guards', () => {

    let optionsRecordsGuard: OptionsRecordsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [OptionsRecordsGuard],
        });
        optionsRecordsGuard = TestBed.inject(OptionsRecordsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            optionsRecordsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });
});
