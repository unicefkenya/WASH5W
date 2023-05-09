import { TestBed } from '@angular/core/testing';
import { SystemsRolesPermissionsRecordsGuard } from './systems-roles-permissions-records.guard';

const LOG_PREFIX: string = "[Systems Roles Permissions Records Guards]";

describe('Systems Roles Permissions Records Guards', () => {

    let systemsRolesPermissionsRecordsGuard: SystemsRolesPermissionsRecordsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [SystemsRolesPermissionsRecordsGuard],
        });
        systemsRolesPermissionsRecordsGuard = TestBed.inject(SystemsRolesPermissionsRecordsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            systemsRolesPermissionsRecordsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });
});
