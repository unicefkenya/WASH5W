import { TestBed } from '@angular/core/testing';
import { EmailsGuard } from './emails.guard';

const LOG_PREFIX: string = "[Emails Guards Test]";

describe('Emails Guards', () => {

    let tokensGuard: EmailsGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [EmailsGuard],
        });
        tokensGuard = TestBed.inject(EmailsGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            tokensGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });
});
