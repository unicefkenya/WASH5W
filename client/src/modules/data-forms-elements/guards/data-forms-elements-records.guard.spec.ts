import { TestBed } from '@angular/core/testing';
import { DataFormsElementsRecordsGuard } from './data-forms-elements-records.guard';

const LOG_PREFIX: string = "[Data Forms Elements Records Guards]";

describe('Data Forms Elements Records Guards', () => {

    let dataFormsElementsRecordsGuard: DataFormsElementsRecordsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [DataFormsElementsRecordsGuard],
        });
        dataFormsElementsRecordsGuard = TestBed.inject(DataFormsElementsRecordsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            dataFormsElementsRecordsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });
});
