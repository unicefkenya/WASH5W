import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PartyType } from '../models/party-type.model';
import { map } from 'rxjs/operators';
import { PARTIES_TYPES } from '../data/parties-types';

@Injectable({
  providedIn: 'root'
})
export class PartiesTypesDataService {

  constructor() { }

  /**
   * Retrieves all the Parties Types
   * @returns The Parties Types
   */
  public getPartiesTypes$(): Observable<PartyType[]> {
    return of(PARTIES_TYPES);
  }


  /**
   * Retrieves the Party Type that has a particular identity
   * @param id The unique identifier of the PartyType
   * @returns The Party Type
   */
  public getPartyTypeById$(id: number): Observable<PartyType> {
    return this.getPartiesTypes$()
      .pipe(
        map(partiesTypes => partiesTypes.filter(i => i.id == id)),
        map(partiesTypes => partiesTypes[0]));
  }


  /**
   * Retrieves the Parties Types that are of particular identities
   * @param ids The unique identifiers of the partiesTypes
   * @returns The Parties Types
   */
  public getPartiesTypesByIds$(ids: number[] | null | undefined): Observable<PartyType[]> {
    if (ids) {
      return this.getPartiesTypes$()
        .pipe(map(partiesTypes => partiesTypes.filter(i => ids.some(id => id === i.id))));
    } else {
      return of([]);
    }

  }


  /**
   * Retrieves the Parties Types that have been currently marked as being active
   * @param ids The unique identifiers of the parties types
   * @returns The Parties Types
   */
  public getActivePartiesTypes$(): Observable<PartyType[]> {

    return this.getPartiesTypes$()
      .pipe(map(partiesTypes => partiesTypes.filter(i => i.data.active == true)));

  }
}

