import { TestBed } from '@angular/core/testing';
import { LogicalSchemesRecordsGuard } from './logical-schemes-records.guard';

const LOG_PREFIX: string = "[Logical Schemes Records Guards]";

describe('Logical Schemes Records Guards', () => {

    let logicalSchemesRecordsGuard: LogicalSchemesRecordsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [LogicalSchemesRecordsGuard],
        });
        logicalSchemesRecordsGuard = TestBed.inject(LogicalSchemesRecordsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            logicalSchemesRecordsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });
});
