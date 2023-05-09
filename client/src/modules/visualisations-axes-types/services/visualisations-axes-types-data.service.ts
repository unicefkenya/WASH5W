import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { VisualisationAxisType } from '../models/visualisation-axis-type.model';
import { map } from 'rxjs/operators';
import { VISUALISATION_AXES_TYPES } from '../data/visualisations-axes-types';

@Injectable({
  providedIn: 'root'
})
export class VisualisationsAxesTypesDataService {

  constructor() { }

  /**
   * Retrieves all the Visualisation Axes Types
   * @returns The Visualisation Axes Types
   */
  public getVisualisationsAxesTypes$(): Observable<VisualisationAxisType[]> {
    return of(VISUALISATION_AXES_TYPES);
  }


  /**
   * Retrieves the Visualisation Axis that has a particular identity
   * @param id The unique identifier of the Visualisation Axis
   * @returns The Visualisation Axis
   */   
  public getVisualisationAxisTypeById$(id: number): Observable<VisualisationAxisType> {
    return this.getVisualisationsAxesTypes$()
      .pipe(
        map(visualisationAxesTypes => visualisationAxesTypes.filter(i => i.id == id)),
        map(visualisationAxesTypes => visualisationAxesTypes[0]));
  }


  /**
   * Retrieves the Visualisation Axes Types that are of particular identities
   * @param ids The unique identifiers of the Visualisation Axes Types
   * @returns The Visualisation Axes Types
   */  
  public getVisualisationsAxesTypesByIds$(ids: number[] | null | undefined): Observable<VisualisationAxisType[]> {
    if(ids){
      return this.getVisualisationsAxesTypes$()
      .pipe(map(visualisationAxesTypes => visualisationAxesTypes.filter(i => ids.some(id => id === i.id))));
    } else {
      return of([]);
    }

  }
}

