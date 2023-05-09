import { TestBed } from '@angular/core/testing';
import { VisualisationsTypesRecordsGuard } from './visualisation-types-records.guard';

const LOG_PREFIX: string = "[Visualisations Types Records Guards]";

describe('Visualisations Types Records Guards', () => {

    let visualisationsTypesRecordsGuard: VisualisationsTypesRecordsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [VisualisationsTypesRecordsGuard],
        });
        visualisationsTypesRecordsGuard = TestBed.inject(VisualisationsTypesRecordsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            visualisationsTypesRecordsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });
});
