import { TestBed } from '@angular/core/testing';
import { VisualisationAxesRecordsGuard } from './visualisation-axes-records.guard';

const LOG_PREFIX: string = "[Visualisation Axes Records Guards]";

describe('Visualisation Axes Records Guards', () => {

    let visualisationAxesRecordsGuard: VisualisationAxesRecordsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [VisualisationAxesRecordsGuard],
        });
        visualisationAxesRecordsGuard = TestBed.inject(VisualisationAxesRecordsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            visualisationAxesRecordsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });
});
