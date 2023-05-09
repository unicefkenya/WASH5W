import { TestBed } from '@angular/core/testing';
import { VisualisationsAxesTypesRecordsGuard } from './visualisations-axes-types-records.guard';


const LOG_PREFIX: string = "[Visualisation Axes Types Records Guards]";

describe('Visualisation Axes Types Records Guards', () => {

    let visualisationAxesTypesRecordsGuard: VisualisationsAxesTypesRecordsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [VisualisationsAxesTypesRecordsGuard],
        });
        visualisationAxesTypesRecordsGuard = TestBed.inject(VisualisationsAxesTypesRecordsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            visualisationAxesTypesRecordsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });
});
