import { TestBed } from '@angular/core/testing';
import { DataFormsElementsTypesRecordsGuard } from './data-forms-element-types-records.guard';

const LOG_PREFIX: string = "[Data Forms Elements Types Records Guards]";

describe('Data Forms Elements Types Records Guards', () => {

    let dataFormsElementTypesRecordsGuard: DataFormsElementsTypesRecordsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [DataFormsElementsTypesRecordsGuard],
        });
        dataFormsElementTypesRecordsGuard = TestBed.inject(DataFormsElementsTypesRecordsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            dataFormsElementTypesRecordsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });
});
