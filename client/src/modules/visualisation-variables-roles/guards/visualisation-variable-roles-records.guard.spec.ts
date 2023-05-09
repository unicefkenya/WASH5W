import { TestBed } from '@angular/core/testing';
import { VisualisationVariablesRolesRecordsGuard } from './visualisation-variable-roles-records.guard';

const LOG_PREFIX: string = "[VisualisationVariablesRoles Records Guards]";

describe('VisualisationVariablesRoles Records Guards', () => {

    let visualisationVariablesRolesRecordsGuard: VisualisationVariablesRolesRecordsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [VisualisationVariablesRolesRecordsGuard],
        });
        visualisationVariablesRolesRecordsGuard = TestBed.inject(VisualisationVariablesRolesRecordsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            visualisationVariablesRolesRecordsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });
});
