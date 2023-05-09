import { Injectable } from '@angular/core';
import { AdministrativeStructuresDataService } from '@modules/administrative-structures/services/administrative-structures-data.service';
import { AdministrativeHierarchiesDataService } from '@modules/administrative-hierarchies/services/administrative-hierarchies-data.service';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject, Subscription, first } from 'rxjs';
import { AdministrativeStructure } from '@modules/administrative-structures/models/administrative-structure.model';
import { AdministrativeHierarchy } from '@modules/administrative-hierarchies/models';

const LOG_PREFIX: string = "[Quantities Observations Data Service]";
const HEADERS = { 'Content-Type': 'application/json' };

export interface HierarchicalTree {
  administrativeUnitId: number;
  children: HierarchicalTree[];
}

@Injectable({
  providedIn: 'root'
})
export class QuantitiesObservationsGenerationDataService {

  constructor(
    private administrativeStructuresDataService: AdministrativeStructuresDataService,
    private administrativeHierarchiesDataService: AdministrativeHierarchiesDataService,
    private log: NGXLogger) {

  }

  public generateQuantitiesObservations(administrativeSystemId: number, timePeriodId: number): void {

    this.log.trace(`${LOG_PREFIX} Entering generateQuantitiesObservations()`);
    this.log.debug(`${LOG_PREFIX} Administrative System Id  = ${administrativeSystemId}`);
    this.log.debug(`${LOG_PREFIX} Time Period Id  = ${timePeriodId}`);

    this.getAdministrativeSystemAdministrativeStructuresIds(administrativeSystemId, (administrativeStructuresIds: number[] | null) => {

      if (administrativeStructuresIds && administrativeStructuresIds.length > 0) {

        this.getAdministrativeHierarchies(administrativeStructuresIds, (administrativeHierarchies: AdministrativeHierarchy[] | null) => {

          if (administrativeHierarchies && administrativeHierarchies.length > 0) {

            this.convertAdministrativeHierarchiesListToTreeList(administrativeHierarchies, (hierarchicalTrees: HierarchicalTree[]) => {

              for (let administrativeHierarchy of administrativeHierarchies) {

                if (administrativeHierarchy.data.responsible?.id) {

   

                }
              }

            })

          }

        })
      }

    })



  }


  private convertAdministrativeHierarchiesListToTreeList(administrativeHierarchies: AdministrativeHierarchy[], callback: (hierarchicalTrees: HierarchicalTree[]) => void): void {

    const map: Map<number, HierarchicalTree> = new Map();

    for (let administrativeHierarchy of administrativeHierarchies) {
      if (administrativeHierarchy.data.responsible?.id) {
        map.set(administrativeHierarchy.data.responsible.id, {
          administrativeUnitId: administrativeHierarchy.data.responsible.id,
          children: []
        });
      }
    }

    const output: HierarchicalTree[] = [];

    for (const administrativeHierarchy of administrativeHierarchies) {

      if (administrativeHierarchy.data.responsible?.id) {

        if (administrativeHierarchy.data.commissioner?.id && map.has(administrativeHierarchy.data.commissioner.id)) {

          map.get(administrativeHierarchy.data.commissioner.id)?.children?.push({
            administrativeUnitId: administrativeHierarchy.data.responsible.id,
            children: []
          })

        } else {

          output.push({
            administrativeUnitId: administrativeHierarchy.data.responsible.id,
            children: []
          });

        }

      }

    };

    callback(output);
  }



  public getAdministrativeHierarchies(administrativeStructuresIds: number[], callback: (administrativeHierarchies: AdministrativeHierarchy[] | null) => void) {

    this.administrativeHierarchiesDataService
      .getAdministrativeHierarchies(false, {
        searchTerm: null,
        page: null,
        pageSize: null,
        sortColumn: 'id',
        sortDirection: 'asc',
        typesIds: administrativeStructuresIds,
        commissionerId: null,
        commissionerName: null,
        responsibleId: null,
        responsibleName: null
      })
      .pipe(first()) // This will automatically complete (and therefore unsubscribe) after the first value has been emitted.
      .subscribe({
        next: (administrativeHierarchies: AdministrativeHierarchy[]) => {
          callback(administrativeHierarchies);
        },

        error: (err: any) => {

          callback(null);

        }
      });
  }


  private getAdministrativeSystemAdministrativeStructuresIds(administrativeSystemId: number, callback: (administrativeStructuresIds: number[] | null) => void): void {

    this.administrativeStructuresDataService
      .getAdministrativeStructures(true, {
        searchTerm: null,
        page: null,
        pageSize: null,
        sortColumn: 'id',
        sortDirection: 'asc',
        hierarchyId: administrativeSystemId,
        hierarchyName: null,
        commissionerId: null,
        commissionerName: null,
        responsibleId: null,
        responsibleName: null
      })
      .pipe(first()) // This will automatically complete (and therefore unsubscribe) after the first value has been emitted.
      .subscribe({
        next: (administrativeStructures: AdministrativeStructure[]) => {

          const ids: number[] = [];
          for (let struct of administrativeStructures) {
            if (struct.id) {
              ids.push(struct.id);
            }
          }
          callback(ids);
        },

        error: (err: any) => {

          callback(null);
        }
      });

  }


  private searchTree(element: HierarchicalTree, administrativeUnitId: number): HierarchicalTree | null {
    if (element.administrativeUnitId == administrativeUnitId) {
      return element;
    } else if (element.children != null) {
      let i;
      let result = null;
      for (i = 0; result == null && i < element.children.length; i++) {
        result = this.searchTree(element.children[i], administrativeUnitId);
      }
      return result;
    }
    return null;
  }


}
