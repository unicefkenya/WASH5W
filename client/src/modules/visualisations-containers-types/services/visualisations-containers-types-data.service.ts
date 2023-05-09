import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { VisualisationContainerType } from '../models/visualisation-container-type.model';
import { map } from 'rxjs/operators';
import { VISUALISATIONS_CONTAINERS_TYPES } from '../data/visualisations-containers-types';

@Injectable({
  providedIn: 'root'
})
export class VisualisationsContainersTypesDataService {

  constructor() { }

  /**
   * Retrieves all the Visualisations Containers Types
   * @returns The Visualisations Containers Types
   */
  public getVisualisationsContainersTypes$(): Observable<VisualisationContainerType[]> {
    return of(VISUALISATIONS_CONTAINERS_TYPES);
  }


  /**
   * Retrieves the Visualisation Container that has a particular identity
   * @param id The unique identifier of the Visualisation Container
   * @returns The Visualisation Container
   */   
  public getVisualisationContainerTypeById$(id: number): Observable<VisualisationContainerType> {
    return this.getVisualisationsContainersTypes$()
      .pipe(
        map(visualisationsContainersTypes => visualisationsContainersTypes.filter(i => i.id == id)),
        map(visualisationsContainersTypes => visualisationsContainersTypes[0]));
  }


  /**
   * Retrieves the Visualisations Containers Types that are of particular identities
   * @param ids The unique identifiers of the Visualisations Containers Types
   * @returns The Visualisations Containers Types
   */  
  public getVisualisationsContainersTypesByIds$(ids: number[] | null | undefined): Observable<VisualisationContainerType[]> {
    if(ids){
      return this.getVisualisationsContainersTypes$()
      .pipe(map(visualisationsContainersTypes => visualisationsContainersTypes.filter(i => ids.some(id => id === i.id))));
    } else {
      return of([]);
    }

  }
}

