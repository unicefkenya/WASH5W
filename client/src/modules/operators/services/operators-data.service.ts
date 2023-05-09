import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Operator } from '../models/operator.model';
import { map } from 'rxjs/operators';
import { OPERATORS } from '../data/operators';

@Injectable({
  providedIn: 'root'
})
export class OperatorsDataService {

  constructor() { }

  /**
   * Retrieves all the Operators
   * @returns The Operators
   */
  public getOperators$(): Observable<Operator[]> {
    return of(OPERATORS);
  }


  /**
   * Retrieves the Operator that has a particular identity
   * @param id The unique identifier of the Operator
   * @returns The Operator
   */   
  public getOperatorById$(id: number): Observable<Operator> {
    return this.getOperators$()
      .pipe(
        map(operators => operators.filter(i => i.id == id)),
        map(operators => operators[0]));
  }


  /**
   * Retrieves the Operators that are of particular identities
   * @param ids The unique identifiers of the operators
   * @returns The Operators
   */  
  public getOperatorsByIds$(ids: number[] | null | undefined): Observable<Operator[]> {
    if(ids){
      return this.getOperators$()
      .pipe(map(operators => operators.filter(i => ids.some(id => id === i.id))));
    } else {
      return of([]);
    }

  }
}

