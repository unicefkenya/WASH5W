import { TestBed } from '@angular/core/testing';
import { VisualisationsRecordsGuard } from './visualisations-records.guard';

const LOG_PREFIX: string = "[Visualisations Records Guards]";

describe('Visualisations Records Guards', () => {

    let visualisationsRecordsGuard: VisualisationsRecordsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [VisualisationsRecordsGuard],
        });
        visualisationsRecordsGuard = TestBed.inject(VisualisationsRecordsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            visualisationsRecordsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });
});
