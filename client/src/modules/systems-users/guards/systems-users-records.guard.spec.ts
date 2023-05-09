import { TestBed } from '@angular/core/testing';
import { SystemsUsersRecordsGuard } from './systems-users-records.guard';

const LOG_PREFIX: string = "[Systems Users Records Guards]";

describe('Systems Users Records Guards', () => {

    let systemsUsersRecordsGuard: SystemsUsersRecordsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [SystemsUsersRecordsGuard],
        });
        systemsUsersRecordsGuard = TestBed.inject(SystemsUsersRecordsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            systemsUsersRecordsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });
});
