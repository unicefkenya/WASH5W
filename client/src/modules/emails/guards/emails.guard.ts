import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Observable, of } from 'rxjs';

const LOG_PREFIX: string = "[Emails Guards]";

@Injectable()
export class EmailsGuard implements CanActivate {
    canActivate(): Observable<boolean> {
        return of(true);
    }
}
