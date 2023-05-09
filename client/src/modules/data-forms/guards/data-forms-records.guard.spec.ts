import { TestBed } from '@angular/core/testing';
import { DataFormsRecordsGuard } from './data-forms-records.guard';

const LOG_PREFIX: string = "[Data Forms Records Guards]";

describe('Data Forms Records Guards', () => {

    let dataFormsRecordsGuard: DataFormsRecordsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [DataFormsRecordsGuard],
        });
        dataFormsRecordsGuard = TestBed.inject(DataFormsRecordsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            dataFormsRecordsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });
});
