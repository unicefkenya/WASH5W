import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { VisualisationDataType } from '../models/visualisation-data-type.model';
import { map } from 'rxjs/operators';
import { VISUALISATION_DATA_TYPES } from '../data/visualisation-data-types';

@Injectable({
  providedIn: 'root'
})
export class VisualisationsDataTypesDataService {

  constructor() { }

  /**
   * Retrieves all the Visualisation Data Types
   * @returns The Visualisation Data Types
   */
  public getVisualisationsDataTypes$(): Observable<VisualisationDataType[]> {
    return of(VISUALISATION_DATA_TYPES);
  }


  /**
   * Retrieves the Visualisation Variable Role that has a particular identity
   * @param id The unique identifier of the Visualisation Variable Role
   * @returns The Visualisation Variable Role
   */   
  public getVisualisationDataTypeById$(id: number): Observable<VisualisationDataType> {
    return this.getVisualisationsDataTypes$()
      .pipe(
        map(visualisationDataTypes => visualisationDataTypes.filter(i => i.id == id)),
        map(visualisationDataTypes => visualisationDataTypes[0]));
  }


  /**
   * Retrieves the Visualisation Data Types that are of particular identities
   * @param ids The unique identifiers of the Visualisation Data Types
   * @returns The Visualisation Data Types
   */  
  public getVisualisationsDataTypesByIds$(ids: number[] | null | undefined): Observable<VisualisationDataType[]> {
    if(ids){
      return this.getVisualisationsDataTypes$()
      .pipe(map(visualisationDataTypes => visualisationDataTypes.filter(i => ids.some(id => id === i.id))));
    } else {
      return of([]);
    }

  }
}

