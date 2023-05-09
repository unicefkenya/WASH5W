import { TestBed } from '@angular/core/testing';
import { SystemsUsersAccountsRecordsGuard } from './systems-users-accounts.guard';

const LOG_PREFIX: string = "[System Users Accounts Guards]";

describe('System Users Accounts Guards', () => {

    let systemUsersAccountsGuard: SystemsUsersAccountsRecordsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [SystemsUsersAccountsRecordsGuard],
        });
        systemUsersAccountsGuard = TestBed.inject(SystemsUsersAccountsRecordsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            systemUsersAccountsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });
});
