import { TestBed } from '@angular/core/testing';
import { DataFormsResponsesRecordsGuard } from './data-forms-responses-records.guard';

const LOG_PREFIX: string = "[Data Forms Responses Records Guards]";

describe('Data Forms Responses Records Guards', () => {

    let dataFormsResponsesRecordsGuard: DataFormsResponsesRecordsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [DataFormsResponsesRecordsGuard],
        });
        dataFormsResponsesRecordsGuard = TestBed.inject(DataFormsResponsesRecordsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            dataFormsResponsesRecordsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });
});
