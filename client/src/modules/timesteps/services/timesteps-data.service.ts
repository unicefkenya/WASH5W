import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { TIMESTEPS } from '../data/timesteps';
import { Timestep } from '../models/timestep.model';

@Injectable({
  providedIn: 'root'
})
export class TimestepsDataService {

  constructor() { }

  /**
   * Retrieves all the Timesteps
   * @returns The Timesteps
   */
  public getTimesteps$(): Observable<Timestep[]> {
    return of(TIMESTEPS);
  }


  /**
   * Retrieves the Timestep that has a particular identity
   * @param id The unique identifier of the Timestep
   * @returns The Timestep
   */   
  public getTimestepById$(id: number): Observable<Timestep> {
    return this.getTimesteps$()
      .pipe(
        map(timesteps => timesteps.filter(i => i.id == id)),
        map(timesteps => timesteps[0]));
  }


  /**
   * Retrieves the Timesteps that are of particular identities
   * @param ids The unique identifiers of the timesteps
   * @returns The Timesteps
   */  
  public getTimestepsByIds$(ids: number[] | null | undefined): Observable<Timestep[]> {
    if(ids){
      return this.getTimesteps$()
      .pipe(map(timesteps => timesteps.filter(i => ids.some(id => id === i.id))));
    } else {
      return of([]);
    }

  }
}

