import { TestBed } from '@angular/core/testing';
import { VisualisationsFormatsRecordsGuard } from './visualisations-formats-records.guard';

const LOG_PREFIX: string = "[Visualisations Formats Records Guards]";

describe('Visualisations Formats Records Guards', () => {

    let visualisationsFormatsRecordsGuard: VisualisationsFormatsRecordsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [VisualisationsFormatsRecordsGuard],
        });
        visualisationsFormatsRecordsGuard = TestBed.inject(VisualisationsFormatsRecordsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            visualisationsFormatsRecordsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });
});
