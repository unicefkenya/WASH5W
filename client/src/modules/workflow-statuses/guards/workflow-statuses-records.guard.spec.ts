import { TestBed } from '@angular/core/testing';
import { WorkflowStatusesRecordsGuard } from './workflow-statuses-records.guard';

const LOG_PREFIX: string = "[Workflow Statuses Records Guards]";

describe('Workflow Statuses Records Guards', () => {

    let workflowStatusesRecordsGuard: WorkflowStatusesRecordsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [WorkflowStatusesRecordsGuard],
        });
        workflowStatusesRecordsGuard = TestBed.inject(WorkflowStatusesRecordsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            workflowStatusesRecordsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });
});
