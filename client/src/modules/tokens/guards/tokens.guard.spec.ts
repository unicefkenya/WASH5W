import { TestBed } from '@angular/core/testing';
import { TokensGuard } from './tokens.guard';

const LOG_PREFIX: string = "[Tokens Guards Test]";

describe('Tokens Guards', () => {

    let tokensGuard: TokensGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [TokensGuard],
        });
        tokensGuard = TestBed.inject(TokensGuard);
    });

    describe('canActivate', () => {
        it('should return an Observable<boolean>', () => {
            tokensGuard.canActivate().subscribe(response => {
                expect(response).toEqual(true);
            });
        });
    });
});
