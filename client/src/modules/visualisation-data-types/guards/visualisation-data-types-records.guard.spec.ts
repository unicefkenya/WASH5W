import { TestBed } from '@angular/core/testing';
import { VisualisationDataTypesRecordsGuard } from './visualisation-data-types-records.guard';

const LOG_PREFIX: string = "[Visualisation Data Types Records Guards]";

describe('VisualisationDataTypes Records Guards', () => {

    let visualisationDataTypesRecordsGuard: VisualisationDataTypesRecordsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [VisualisationDataTypesRecordsGuard],
        });
        visualisationDataTypesRecordsGuard = TestBed.inject(VisualisationDataTypesRecordsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            visualisationDataTypesRecordsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });
});
