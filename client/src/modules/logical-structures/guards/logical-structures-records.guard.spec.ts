import { TestBed } from '@angular/core/testing';
import { LogicalStructuresRecordsGuard } from './logical-structures-records.guard';

const LOG_PREFIX: string = "[Logical Structures Records Guards]";

describe('Logical Structures Records Guards', () => {

    let logicalStructuresRecordsGuard: LogicalStructuresRecordsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [LogicalStructuresRecordsGuard],
        });
        logicalStructuresRecordsGuard = TestBed.inject(LogicalStructuresRecordsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            logicalStructuresRecordsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });
});
