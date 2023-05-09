import { TestBed } from '@angular/core/testing';
import { WorkflowTransitionsRecordsGuard } from './workflow-transitions-records.guard';

const LOG_PREFIX: string = "[Workflow Transitions Records Guards]";

describe('Workflow Transitions Records Guards', () => {

    let workflowTransitionsRecordsGuard: WorkflowTransitionsRecordsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [WorkflowTransitionsRecordsGuard],
        });
        workflowTransitionsRecordsGuard = TestBed.inject(WorkflowTransitionsRecordsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            workflowTransitionsRecordsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });
});
