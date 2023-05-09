import { TestBed } from '@angular/core/testing';
import { VisualisationVariablesRecordsGuard } from './visualisation-variables-records.guard';

const LOG_PREFIX: string = "[Visualisation Variables Records Guards]";

describe('Visualisation Variables Records Guards', () => {

    let visualisationVariablesRecordsGuard: VisualisationVariablesRecordsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [VisualisationVariablesRecordsGuard],
        });
        visualisationVariablesRecordsGuard = TestBed.inject(VisualisationVariablesRecordsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            visualisationVariablesRecordsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });
});
