import { TestBed } from '@angular/core/testing';
import { SystemsModulesPermissionsRecordsGuard } from './systems-modules-permissions-records.guard';

const LOG_PREFIX: string = "[Systems Modules Permissions Records Guards]";

describe('Systems Modules Permissions Records Guards', () => {

    let systemsModulesPermissionsRecordsGuard: SystemsModulesPermissionsRecordsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [SystemsModulesPermissionsRecordsGuard],
        });
        systemsModulesPermissionsRecordsGuard = TestBed.inject(SystemsModulesPermissionsRecordsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            systemsModulesPermissionsRecordsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });
});
