import { TestBed } from '@angular/core/testing';
import { LogicalHierarchiesRecordsGuard } from './logical-hierarchies-records.guard';

const LOG_PREFIX: string = "[Logical Hierarchies Records Guards]";

describe('Logical Hierarchies Records Guards', () => {

    let logicalHierarchiesRecordsGuard: LogicalHierarchiesRecordsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [LogicalHierarchiesRecordsGuard],
        });
        logicalHierarchiesRecordsGuard = TestBed.inject(LogicalHierarchiesRecordsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            logicalHierarchiesRecordsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });
});
