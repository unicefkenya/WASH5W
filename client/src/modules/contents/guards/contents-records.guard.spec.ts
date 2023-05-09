import { TestBed } from '@angular/core/testing';
import { ContentsRecordsGuard } from './contents-records.guard';

const LOG_PREFIX: string = "[Contents Records Guards]";

describe('Contents Records Guards', () => {

    let contentsRecordsGuard: ContentsRecordsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [ContentsRecordsGuard],
        });
        contentsRecordsGuard = TestBed.inject(ContentsRecordsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            contentsRecordsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });
});
