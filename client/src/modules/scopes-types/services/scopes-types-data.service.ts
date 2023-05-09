import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ScopeType } from '../models/scope-type.model';
import { map } from 'rxjs/operators';
import { SCOPES_TYPES } from '../data/scopes-types';

@Injectable({
  providedIn: 'root'
})
export class ScopesTypesDataService {

  constructor() { }

  /**
   * Retrieves all the Scopes Types
   * @returns The Scopes Types
   */
  public getScopesTypes$(): Observable<ScopeType[]> {
    return of(SCOPES_TYPES);
  }


  /**
   * Retrieves the Party Type that has a particular identity
   * @param id The unique identifier of the PartyType
   * @returns The Party Type
   */
  public getScopeTypeById$(id: number): Observable<ScopeType> {
    return this.getScopesTypes$()
      .pipe(
        map(scopesTypes => scopesTypes.filter(i => i.id == id)),
        map(scopesTypes => scopesTypes[0]));
  }


  /**
   * Retrieves the Scopes Types that are of particular identities
   * @param ids The unique identifiers of the scopesTypes
   * @returns The Scopes Types
   */
  public getScopesTypesByIds$(ids: number[] | null | undefined): Observable<ScopeType[]> {
    if (ids) {
      return this.getScopesTypes$()
        .pipe(map(scopesTypes => scopesTypes.filter(i => ids.some(id => id === i.id))));
    } else {
      return of([]);
    }

  }


  /**
   * Retrieves the Scopes Types that have been currently marked as being active
   * @param ids The unique identifiers of the scopes types
   * @returns The Scopes Types
   */
  public getActiveScopesTypes$(): Observable<ScopeType[]> {

    return this.getScopesTypes$()
      .pipe(map(scopesTypes => scopesTypes.filter(i => i.data.active == true)));

  }
}

