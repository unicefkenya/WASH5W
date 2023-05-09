import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { NGXLogger } from 'ngx-logger';
import { Visualisation } from '../models/visualisation.model';
import { environment } from 'environments/environment';
import { catchError, map, tap } from 'rxjs/operators';
import { VisualisationState } from '../models/visualisation-state.model';

const LOG_PREFIX: string = "[Visualisations Message Service]";
const HEADERS = { 'Content-Type': 'application/json' };

@Injectable({
  providedIn: 'root'
})
export class VisualisationsMessagesService {
  
    private _visualisationModifiedSubject$ = new Subject<boolean>();
    readonly visualisationModified$ = this._visualisationModifiedSubject$.asObservable();

    constructor(private log: NGXLogger) {

    }


    public broadcastVisualisationModificationMessage(): void {
      this._visualisationModifiedSubject$.next(true);
    }
}
