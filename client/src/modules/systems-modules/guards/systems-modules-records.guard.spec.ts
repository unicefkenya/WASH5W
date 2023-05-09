import { TestBed } from '@angular/core/testing';
import { SystemsModulesRecordsGuard } from './systems-modules-records.guard';

const LOG_PREFIX: string = "[Systems Modules Records Guards]";

describe('Systems Modules Records Guards', () => {

    let systemsModulesRecordsGuard: SystemsModulesRecordsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [SystemsModulesRecordsGuard],
        });
        systemsModulesRecordsGuard = TestBed.inject(SystemsModulesRecordsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            systemsModulesRecordsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });
});
