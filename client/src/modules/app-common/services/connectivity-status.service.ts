import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { first, fromEvent, map, merge, of, Subject } from 'rxjs';

const LOG_PREFIX: string = "[Connectivity Status Service]";

@Injectable({ providedIn: 'root' })
export class ConnectivityStatusService {

    // Instantiate an observable field of the online status.
    // This field's value will be updated every couple of milliseconds.
    private _onlineSubject$ = new Subject<boolean>();
    readonly online$ = this._onlineSubject$.asObservable();

    constructor(private log: NGXLogger) {

        // See: https://dev.to/the_thinkster/how-to-detect-if-a-user-is-online-offline-with-angular-rxjs-48cm
        setInterval(() => {

            merge(
                of(null),
                fromEvent(window, 'online'),
                fromEvent(window, 'offline')
            )
                .pipe(first())
                .pipe(map(() => navigator.onLine))
                .subscribe(online => {

                    if(!online){
                        this.log.warn(`${LOG_PREFIX} The system is offline`);
                    }
                    
                    //this._onlineSubject$.next(online);
                    this._onlineSubject$.next(true);
                });

        }, 1000)
    }

}