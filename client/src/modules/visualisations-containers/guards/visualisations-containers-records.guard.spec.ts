import { TestBed } from '@angular/core/testing';
import { VisualisationsContainersRecordsGuard } from './visualisations-containers-records.guard';

const LOG_PREFIX: string = "[Visualisations Containers Records Guards]";

describe('Visualisations Containers Records Guards', () => {

    let visualisationsContainersRecordsGuard: VisualisationsContainersRecordsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [VisualisationsContainersRecordsGuard],
        });
        visualisationsContainersRecordsGuard = TestBed.inject(VisualisationsContainersRecordsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            visualisationsContainersRecordsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });
});
