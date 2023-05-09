import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

const LOG_PREFIX: string = "[Text Util Service]";

@Injectable({ providedIn: 'root' })
export class TextUtilService {

  /**
   * Truncates strings
   * @param value The String to be truncated
   * @param args The total number of desired characters and the characters that should trail the truncation
   * @returns The truncated string
   */
   public truncate(value: string | null | undefined, args: any[]): string {

    if(value) {
        const limit = args.length > 0 ? parseInt(args[0], 10) : 20;
        const trail = args.length > 1 ? args[1] : '...';
        return value.length > limit ? value.substring(0, limit) + trail : value;
    } else {
        return "";
    }

}  

}