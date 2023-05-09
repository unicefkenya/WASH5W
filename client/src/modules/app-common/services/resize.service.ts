import { Injectable } from '@angular/core';
import { SCREEN_SIZE } from '@common/models/screen-sizes.model';
import { BehaviorSubject, distinctUntilChanged, Observable, Subject } from 'rxjs';

const LOG_PREFIX: string = "[Resize Service]";

@Injectable({ providedIn: 'root' })
export class ResizeService {

    private resizeSubject$ = new BehaviorSubject<SCREEN_SIZE | null>(null);
    readonly resize$ = this.resizeSubject$.asObservable();

    onResize(size: SCREEN_SIZE) {

        if (size != this.resizeSubject$.value) {
            this.resizeSubject$.next(size);
        }

    }

}