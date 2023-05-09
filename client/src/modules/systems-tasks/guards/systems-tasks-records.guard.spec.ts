import { TestBed } from '@angular/core/testing';
import { SystemsTasksRecordsGuard } from './systems-tasks-records.guard';

const LOG_PREFIX: string = "[Systems Tasks Records Guards]";

describe('Systems Tasks Records Guards', () => {

    let systemsTasksRecordsGuard: SystemsTasksRecordsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [SystemsTasksRecordsGuard],
        });
        systemsTasksRecordsGuard = TestBed.inject(SystemsTasksRecordsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            systemsTasksRecordsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });
});
