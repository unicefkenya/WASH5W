import { TestBed } from '@angular/core/testing';
import { LogicalElementsRecordsGuard } from './logical-elements-records.guard';

const LOG_PREFIX: string = "[Logical Elements Records Guards]";

describe('Logical Elements Records Guards', () => {

    let logicalElementsRecordsGuard: LogicalElementsRecordsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [LogicalElementsRecordsGuard],
        });
        logicalElementsRecordsGuard = TestBed.inject(LogicalElementsRecordsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            logicalElementsRecordsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });
});
