import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Visualisations Message Service]";
const HEADERS = { 'Content-Type': 'application/json' };

@Injectable({
  providedIn: 'root'
})
export class VisualisationsAxesMessagesService {
  
    private _visualisationAxisModifiedSubject$ = new Subject<boolean>();
    readonly visualisationAxisModified$ = this._visualisationAxisModifiedSubject$.asObservable();

    constructor(private log: NGXLogger) {

    }


    public broadcastVisualisationAxisModificationMessage(): void {
      this._visualisationAxisModifiedSubject$.next(true);
    }
}
