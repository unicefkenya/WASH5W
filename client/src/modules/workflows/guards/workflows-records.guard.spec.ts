import { TestBed } from '@angular/core/testing';
import { WorkflowsRecordsGuard } from './workflows-records.guard';

const LOG_PREFIX: string = "[Workflows Records Guards]";

describe('Workflows Records Guards', () => {

    let workflowsRecordsGuard: WorkflowsRecordsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [WorkflowsRecordsGuard],
        });
        workflowsRecordsGuard = TestBed.inject(WorkflowsRecordsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            workflowsRecordsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });
});
