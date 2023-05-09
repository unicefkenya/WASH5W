import { TestBed } from '@angular/core/testing';
import { VisualisationsContainersTypesRecordsGuard } from './visualisations-containers-types-records.guard';

const LOG_PREFIX: string = "[Visualisations Containers Types Records Guards]";

describe('Visualisations Containers Types Records Guards', () => {

    let visualisationsContainersTypesRecordsGuard: VisualisationsContainersTypesRecordsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [VisualisationsContainersTypesRecordsGuard],
        });
        visualisationsContainersTypesRecordsGuard = TestBed.inject(VisualisationsContainersTypesRecordsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            visualisationsContainersTypesRecordsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });
});
