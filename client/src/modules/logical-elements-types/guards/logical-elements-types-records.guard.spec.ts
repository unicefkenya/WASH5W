import { TestBed } from '@angular/core/testing';
import { LogicalElementsTypesRecordsGuard } from './logical-elements-types-records.guard';

const LOG_PREFIX: string = "[Logical Elements Types Records Guards]";

describe('Logical Elements Types Records Guards', () => {

    let logicalElementsTypesRecordsGuard: LogicalElementsTypesRecordsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [LogicalElementsTypesRecordsGuard],
        });
        logicalElementsTypesRecordsGuard = TestBed.inject(LogicalElementsTypesRecordsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            logicalElementsTypesRecordsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });
});
