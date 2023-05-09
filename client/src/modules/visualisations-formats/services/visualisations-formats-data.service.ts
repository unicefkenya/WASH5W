import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { VisualisationFormat } from '../models/visualisation-format.model';
import { map } from 'rxjs/operators';
import { VISUALISATION_FORMATS } from '../data/visualisations-formats';

@Injectable({
  providedIn: 'root'
})
export class VisualisationsFormatsDataService {


  constructor() { }

  /**
   * Retrieves all the Visualisations Formats
   * @returns The Visualisations Formats
   */
  public getVisualisationsFormats$(): Observable<VisualisationFormat[]> {
    return of(VISUALISATION_FORMATS);
  }


  /**
   * Retrieves the Data Form Element Type that has a particular identity
   * @param id The unique identifier of the Data Form Element Type
   * @returns The Data Form Element Type
   */   
  public getVisualisationFormatById$(id: number): Observable<VisualisationFormat> {
    return this.getVisualisationsFormats$()
      .pipe(
        map(types => types.filter(i => i.id == id)),
        map(types => types[0]));
  }

}


