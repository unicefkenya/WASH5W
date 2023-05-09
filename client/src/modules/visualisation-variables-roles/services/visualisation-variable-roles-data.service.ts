import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { VisualisationVariableRole } from '../models/visualisation-variable-role.model';
import { map } from 'rxjs/operators';
import { VISUALISATION_VARIABLES_ROLES } from '../data/visualisation-variable-roles';

@Injectable({
  providedIn: 'root'
})
export class VisualisationVariablesRolesDataService {

  constructor() { }

  /**
   * Retrieves all the Visualisation Variables Roles
   * @returns The Visualisation Variables Roles
   */
  public getVisualisationVariablesRoles$(): Observable<VisualisationVariableRole[]> {
    return of(VISUALISATION_VARIABLES_ROLES);
  }


  /**
   * Retrieves the Visualisation Variable Role that has a particular identity
   * @param id The unique identifier of the Visualisation Variable Role
   * @returns The Visualisation Variable Role
   */   
  public getVisualisationVariableRoleById$(id: number): Observable<VisualisationVariableRole> {
    return this.getVisualisationVariablesRoles$()
      .pipe(
        map(visualisationVariablesRoles => visualisationVariablesRoles.filter(i => i.id == id)),
        map(visualisationVariablesRoles => visualisationVariablesRoles[0]));
  }


  /**
   * Retrieves the Visualisation Variables Roles that are of particular identities
   * @param ids The unique identifiers of the Visualisation Variables Roles
   * @returns The Visualisation Variables Roles
   */  
  public getVisualisationVariablesRolesByIds$(ids: number[] | null | undefined): Observable<VisualisationVariableRole[]> {
    if(ids){
      return this.getVisualisationVariablesRoles$()
      .pipe(map(visualisationVariablesRoles => visualisationVariablesRoles.filter(i => ids.some(id => id === i.id))));
    } else {
      return of([]);
    }

  }
}

