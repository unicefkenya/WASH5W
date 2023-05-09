import { TestBed } from '@angular/core/testing';
import { SystemsRolesRecordsGuard } from './systems-roles-records.guard';

const LOG_PREFIX: string = "[Systems Roles Records Guards]";

describe('Systems Roles Records Guards', () => {

    let systemsRolesRecordsGuard: SystemsRolesRecordsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [SystemsRolesRecordsGuard],
        });
        systemsRolesRecordsGuard = TestBed.inject(SystemsRolesRecordsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            systemsRolesRecordsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });
});
