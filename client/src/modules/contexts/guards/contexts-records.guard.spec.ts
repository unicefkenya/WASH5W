import { TestBed } from '@angular/core/testing';
import { ContextsRecordsGuard } from './contexts-records.guard';

const LOG_PREFIX: string = "[Contexts Records Guards]";

describe('Contexts Records Guards', () => {

    let contextsRecordsGuard: ContextsRecordsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [ContextsRecordsGuard],
        });
        contextsRecordsGuard = TestBed.inject(ContextsRecordsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            contextsRecordsGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });
});
