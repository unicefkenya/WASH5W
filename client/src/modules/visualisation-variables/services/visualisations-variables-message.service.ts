import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Visualisations Message Service]";
const HEADERS = { 'Content-Type': 'application/json' };

@Injectable({
  providedIn: 'root'
})
export class VisualisationsVariablesMessagesService {
  
    private _visualisationVariableModifiedSubject$ = new Subject<boolean>();
    readonly visualisationVariableModified$ = this._visualisationVariableModifiedSubject$.asObservable();

    constructor(private log: NGXLogger) {

    }


    public broadcastVisualisationVariableModificationMessage(): void {
      this._visualisationVariableModifiedSubject$.next(true);
    }
}
