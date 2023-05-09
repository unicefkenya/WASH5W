import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { DataFormResponse } from '../models/data-form-response.model';

const LOG_PREFIX: string = "[Data Form Responses Initialisation Notification Service]";

@Injectable({ providedIn: 'root' })
export class DataFormResponsesInitialisationNotificationService {

    private _initialisationSubject$ = new Subject<DataFormResponse | null>();
    readonly initialisations = this._initialisationSubject$.asObservable();

    notify(DataFormResponse: DataFormResponse) {
        this._initialisationSubject$.next(DataFormResponse);
    }

    clearNotifications() {
        this._initialisationSubject$.next(null);
    }

}