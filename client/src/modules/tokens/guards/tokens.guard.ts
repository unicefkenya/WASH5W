import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Observable, of } from 'rxjs';

const LOG_PREFIX: string = "[Tokens Guards]";

@Injectable()
export class TokensGuard implements CanActivate {
    canActivate(): Observable<boolean> {
        return of(true);
    }
}
