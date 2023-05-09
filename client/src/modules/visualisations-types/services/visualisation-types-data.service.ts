import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { VisualisationType } from '../models/visualisation-type.model';
import { map } from 'rxjs/operators';
import { VISUALISATION_TYPES } from '../data/visualisation-types';

@Injectable({
  providedIn: 'root'
})
export class VisualisationsTypesDataService {

  constructor() { }

  /**
   * Retrieves all the Visualisations Types
   * @returns The Visualisations Types
   */
  public getVisualisationsTypes$(): Observable<VisualisationType[]> {
    return of(VISUALISATION_TYPES);
  }


  /**
   * Retrieves the Visualisation Axis that has a particular identity
   * @param id The unique identifier of the Visualisation Axis
   * @returns The Visualisation Axis
   */
  public getVisualisationTypeById$(id: number): Observable<VisualisationType> {
    return this.getVisualisationsTypes$()
      .pipe(
        map(visualisationsTypes => visualisationsTypes.filter(i => i.id == id)),
        map(visualisationsTypes => visualisationsTypes[0]));
  }


  /**
   * Retrieves the Visualisations Types that are of particular identities
   * @param ids The unique identifiers of the Visualisations Types
   * @returns The Visualisations Types
   */
  public getVisualisationsTypesByIds$(ids: number[] | null | undefined): Observable<VisualisationType[]> {
    if (ids) {
      return this.getVisualisationsTypes$()
        .pipe(map(visualisationsTypes => visualisationsTypes.filter(i => ids.some(id => id === i.id))));
    } else {
      return of([]);
    }

  }

  /**
   * Retrieves the Visualisations Types that have  certain parent
   * @returns The Visualisations Types
   */
  public getVisualisationsTypesByParentId$(parentId: number | null | undefined): Observable<VisualisationType[]> {
    if (parentId) {
      return this.getVisualisationsTypes$()
        .pipe(map(types => types.filter(i => i.data.parentId == parentId)));
    } else {
      return of([])
    }

  }
}

