import { TestBed } from '@angular/core/testing';
import { SystemsUsersRightsRecordsGuard } from './systems-users-rights-records.guard';

const LOG_PREFIX: string = "[Systems Users Rights Records Guards]";

describe('Systems Users Rights Records Guards', () => {

    let systemsUsersRightsRecordsGuard: SystemsUsersRightsRecordsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [SystemsUsersRightsRecordsGuard],
        });
        systemsUsersRightsRecordsGuard = TestBed.inject(SystemsUsersRightsRecordsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            systemsUsersRightsRecordsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });
});
