import { TestBed } from '@angular/core/testing';
import { DataFormsElementsCategoriesRecordsGuard } from './data-forms-element-types-records.guard';

const LOG_PREFIX: string = "[Data Forms Elements Categories Records Guards]";

describe('Data Forms Elements Categories Records Guards', () => {

    let dataFormsElementTypesRecordsGuard: DataFormsElementsCategoriesRecordsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [DataFormsElementsCategoriesRecordsGuard],
        });
        dataFormsElementTypesRecordsGuard = TestBed.inject(DataFormsElementsCategoriesRecordsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            dataFormsElementTypesRecordsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });
});
