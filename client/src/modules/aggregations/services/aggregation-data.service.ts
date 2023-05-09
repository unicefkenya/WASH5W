import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { Aggregation } from '../models/aggregation.model';
import { AGGREGATIONS } from '../data/aggregations';

@Injectable({
  providedIn: 'root'
})
export class AggregationsDataService {

  constructor() { }

  /**
   * Retrieves all the Aggregations
   * @returns The Aggregations
   */
  public getAggregations$(): Observable<Aggregation[]> {
    return of(AGGREGATIONS);
  }


  /**
   * Retrieves the Aggregation that has a particular identity
   * @param id The unique identifier of the Aggregation
   * @returns The Aggregation
   */   
  public getAggregationById$(id: number): Observable<Aggregation> {
    return this.getAggregations$()
      .pipe(
        map(aggregations => aggregations.filter(i => i.id == id)),
        map(aggregations => aggregations[0]));
  }


  /**
   * Retrieves the Aggregations that are of particular identities
   * @param ids The unique identifiers of the aggregations
   * @returns The Aggregations
   */  
  public getAggregationsByIds$(ids: number[] | null | undefined): Observable<Aggregation[]> {
    if(ids){
      return this.getAggregations$()
      .pipe(map(aggregations => aggregations.filter(i => ids.some(id => id === i.id))));
    } else {
      return of([]);
    }

  }
}

