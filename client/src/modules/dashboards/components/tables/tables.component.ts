import { Component, Input, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { Filter } from '@app/app-filter.service';
import { FilterService } from '@app/app-filter.service';
import { BehaviorSubject, Subscription, first } from 'rxjs';
import { VisualisationVariable } from '@modules/visualisation-variables/models/visualisation-variable.model.js';
import { QuantityObservation } from '@modules/quantities-observations/models/quantity-observation.model.js';
import { MapState } from '@modules/dashboards/models/map-state.model.js';
import { Visualisation } from '@modules/visualisations/models/visualisation.model.js';
import { AdministrativeHierarchiesDataService } from '@modules/administrative-hierarchies/services/administrative-hierarchies-data.service';
import { AdministrativeUnitsDataService } from '@modules/administrative-units/services/administrative-units-data.service';
import { AdministrativeHierarchy } from '@modules/administrative-hierarchies/models/administrative-hierarchy.model';
import { AdministrativeUnit } from '@modules/administrative-units/models/administrative-unit.model';
import { QuantitiesObservationsDataService } from '@modules/quantities-observations/services/quantities-observations-data.service';
import { VisualisationVariablesDataService } from '@modules/visualisation-variables/services/visualisation-variables-data.service';
import { VisualisationsDataService } from '@modules/visualisations/services/visualisations-data.service';
import { AdministrativeStructure } from '@modules/administrative-structures/models';
import { AdministrativeStructuresDataService } from '@modules/administrative-structures/services/administrative-structures-data.service';
import moment from 'moment';

const LOG_PREFIX: string = "[Visualisation Table Component]";

@Component({
  selector: 'sb-tables',
  templateUrl: './tables.component.html',
  styleUrls: ['tables.component.scss']
})
export class VisualisationTableComponent implements OnInit {

  // Allow the parent component to specify what should be visualized
  @Input() visualisation: Visualisation | null = null;

  // Collate the visualisation's variables
  visualisationVariables!: VisualisationVariable[];

  // Keep tabs on the active visualisation variable
  public activeVisualisationVariable: VisualisationVariable | null | undefined;

  // Keep tabs on the subsidiary administrative hierarchies
  subsidiaries: AdministrativeHierarchy[] = [];

  // Collate the visualisation variables indicators observations
  private quantitiesObservations!: QuantityObservation[];

  // Keep tabs on the values associated with each administrative unit
  values: Map<number, number> = new Map();


  // Holds the required records state
  // Makes it possible to supply the filter, sort or search criteria that should be applied to records on retrieval.
  private stateSubject$ = new BehaviorSubject<MapState | null>(null);
  readonly state$ = this.stateSubject$.asObservable();


  // Keep tabs on the current filter
  filter!: Filter;


  // Keep tabs of errors
  error: string = "";


  // Keep tabs on whether the map has been initialised previously
  initialised: boolean = false;


  // Keep tabs on the selected reporting period's data
  // admin unit id -> [visualisation variable id -> value]
  private data: Map<number, Map<number, number | null | undefined>> = new Map<number, Map<number, number | null | undefined>>();


  // Keep tabs of the currently active location / time filtering criterias
  public activeAdministrativeHierarchy: AdministrativeHierarchy | null | undefined = null;
  public activeAdministrativeUnit: AdministrativeUnit | null | undefined = null;
  public activeTimeIntervalStart: moment.Moment | null = null;
  public activeTimeIntervalEnd: moment.Moment | null = null;

  // Instantiate a central gathering point for all the component's subscriptions.
  // Makes it easier to unsubscribe from all subscriptions when the component is destroyed.   
  private _subscriptions: Subscription[] = [];

  constructor(
    public filterService: FilterService,
    public visualisationsDataService: VisualisationsDataService,
    public visualisationsVariablesDataService: VisualisationVariablesDataService,
    public administrativeHierarchiesDataService: AdministrativeHierarchiesDataService,
    public administrativeStructuresDataService: AdministrativeStructuresDataService,
    public administrativeUnitsDataService: AdministrativeUnitsDataService,
    public quantitiesObservationsDataService: QuantitiesObservationsDataService,
    private cd: ChangeDetectorRef,
    private log: NGXLogger) {
  }

  ngOnInit() {

    this.initialiseVisualisationsVariables(() => {
      this.initialiseLocationAndTimeFilterChangesHandler(() => {

      })
    })
  }



  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Destroying Component`);

    // Clear all subscriptions
    this.log.trace(`${LOG_PREFIX} Clearing all subscriptions`);
    this._subscriptions.forEach(s => s.unsubscribe());
  }


  /**
   * Retrieves and locally caches Visualisations Variables records
   * @param callback The function to call when done
   */
  private initialiseVisualisationsVariables(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseVisualisationsVariables()`);

    // Retrieve and cache all the Visualisations Variables records
    this.log.trace(`${LOG_PREFIX} Retrieving and caching all the Visualisations Variables records`);
    this.visualisationsVariablesDataService
      .getVisualisationsVariables(false, {
        searchTerm: null,
        page: null,
        pageSize: null,
        sortColumn: 'id',
        sortDirection: 'asc',
        id: null,
        visualisationId: this.visualisation?.id,
        indicatorId: null,
        roleId: null
      })
      .pipe(first())
      .subscribe({
        next: (visualisationsVariables: VisualisationVariable[]) => {

          // Visualisations Variables successfully retrieved and cached
          this.log.debug(`${LOG_PREFIX} ${visualisationsVariables.length} Visualisations Variables(s) retrieved and cached`);
          this.visualisationVariables = this.sortVisualisationVariables(visualisationsVariables);

          // Preselect the first viualisation variable
          this.log.trace(`${LOG_PREFIX} ${visualisationsVariables.length} Preselecting the first viualisation variable`);
          this.activeVisualisationVariable = visualisationsVariables.length > 0 ? visualisationsVariables[0] : null;

          // Return
          this.log.trace(`${LOG_PREFIX} Returning`);
          callback();
        },

        error: (err: any) => {

          // Visualisations Variables retrieval failed
          this.log.error(`${LOG_PREFIX} Visualisations Variables retrieval failed`);

          // Return
          this.log.trace(`${LOG_PREFIX} Returning`);
          callback();
        }
      });

  }


  /**
   * Subscribe and react to administrative unit changes
   * @param callback The function to call when done
   */
  private initialiseLocationAndTimeFilterChangesHandler(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseLocationAndTimeFilterChangesHandler()`);

    // Subscribe to filtering criteria updates and react to them if the administrative unit or time is changed
    this.log.trace(`${LOG_PREFIX} Subscribing to filtering criteria updates and react to them if the administrative unit or time is changed`);
    this._subscriptions.push(
      this.filterService.currentFilter$
        .subscribe({
          next: (filter) => {

            if ((JSON.stringify(this.activeAdministrativeUnit) !== JSON.stringify(filter.activeAdministrativeUnit)) ||
              (JSON.stringify(this.activeTimeIntervalStart) !== JSON.stringify(moment(filter.activeTimeIntervalStart))) ||
              (JSON.stringify(this.activeTimeIntervalEnd) !== JSON.stringify(moment(filter.activeTimeIntervalEnd)))) {

              // Location or time changed
              this.log.trace(`${LOG_PREFIX} Location or time changed`);

              if (this.initialised) {
                this.initialised = false;
                this.cd.detectChanges();
              }

              if ((JSON.stringify(this.activeAdministrativeUnit) !== JSON.stringify(filter.activeAdministrativeUnit))) {

                this.initialiseSubsidiaries(() => {
                  this.initialiseQuantitiesObservations(() => {
                    this.initialiseSubsidiariesData(() => {
                      this.initialised = true;
                      this.cd.detectChanges();
                    })
                  })
                })

              } else {
                this.initialiseQuantitiesObservations(() => {
                  this.initialiseSubsidiariesData(() => {
                    this.initialised = true;
                    this.cd.detectChanges();
                  })
                })
              }

              // Keep a local reference to the location / temporal filters
              this.activeAdministrativeHierarchy = Object.assign({}, filter.activeAdministrativeHierarchy);
              this.activeAdministrativeUnit = Object.assign({}, filter.activeAdministrativeUnit);
              this.activeTimeIntervalStart = moment(filter.activeTimeIntervalStart).clone();
              this.activeTimeIntervalEnd = moment(filter.activeTimeIntervalEnd).clone();

            }
          }
        })
    );

    // Transfer control to the callback function
    callback();

  }


  private initialiseSubsidiaries(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseSubsidiaries()`);

    this.subsidiaries.length = 0;

    if (this.filterService.filter.activeAdministrativeSystem?.id && this.filterService.filter.activeAdministrativeUnit?.id && this.filterService.filter.activeAdministrativeUnit?.data.typeId) {

      this.getSubsidiaryAdministrativeStructuresIds((ids: number[] | null) => {

        if (ids && ids.length > 0) {

          this.administrativeHierarchiesDataService
            .getAdministrativeHierarchies(false, {
              searchTerm: null,
              page: null,
              pageSize: null,
              sortColumn: 'id',
              sortDirection: 'asc',
              typesIds: ids,
              commissionerId: this.filterService.filter.activeAdministrativeUnit?.id,
              commissionerName: null,
              responsibleId: null,
              responsibleName: null,
              id: null
            })
            .pipe(first()) // This will automatically complete (and therefore unsubscribe) after the first value has been emitted.
            .subscribe({
              next: (administrativeHierarchies: AdministrativeHierarchy[]) => {

                // Administrative Hierarchies successfully retrieved and cached
                this.log.debug(`${LOG_PREFIX} ${administrativeHierarchies.length} Administrative Hierarchies retrieved and cached`);

                // Initialise the subsidiaries list
                this.log.trace(`${LOG_PREFIX} Initialising the subsidiaries list`);
                this.subsidiaries = administrativeHierarchies;

                // Return
                this.log.trace(`${LOG_PREFIX} Returning`);
                callback();
              },

              error: (err: any) => {

                // Administrative Hierarchies retrieval failed
                this.log.error(`${LOG_PREFIX} Administrative Hierarchies retrieval failed`);

                // Return
                this.log.trace(`${LOG_PREFIX} Returning`);
                callback();

              }
            });

        } else {

          // Return
          this.log.trace(`${LOG_PREFIX} Returning`);
          callback();
        }

      })

    } else {

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    }

  }


  /**
   * Retrieves and caches Quantities Observation records
   * @param callback The function to call when done
   */
  private initialiseQuantitiesObservations(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseQuantitiesObservations()`);

    // Check if the target administrative unit has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the target administrative unit has been specified`);
    if (this.filterService.filter.activeAdministrativeUnit?.id) {

      // The target administrative unit has been specified
      this.log.trace(`${LOG_PREFIX} The target administrative unit has been specified`);

      // Retrieve all the Quantities Observations whose indicators are referenced by the visualisation variables
      this.log.trace(`${LOG_PREFIX} Retrieving and caching all the Quantities Observation records`);
      this.quantitiesObservationsDataService
        .getQuantitiesObservations(false, {
          page: null,
          pageSize: null,
          searchTerm: null,
          sortColumn: 'id',
          sortDirection: 'asc',
          partiesIds: (this.subsidiaries.filter(s => s.data.responsible?.id).map(s => s.data.responsible?.id as number)).filter(this.notEmpty),
          timePointId: null,
          timePointIdGTE: parseInt(moment(this.filterService.filter.activeTimeIntervalStart).format('YYYYMMDD')),
          timePointIdLTE: parseInt(moment(this.filterService.filter.activeTimeIntervalEnd).format('YYYYMMDD')),
          timePeriodId: null,
          phenomenonTypesIds: (this.visualisationVariables.filter(v => v.data.indicatorId).map(v => v.data.indicatorId as number)).filter(this.notEmpty),
          observationTypeId: null
        })
        .pipe(first())
        .subscribe({
          next: (quantitiesObservations: QuantityObservation[]) => {

            // Quantities Observation successfully retrieved and cached
            this.log.debug(`${LOG_PREFIX} ${quantitiesObservations.length} Quantities Observation(s) retrieved and cached`);
            this.quantitiesObservations = quantitiesObservations;

            // Return
            this.log.trace(`${LOG_PREFIX} Returning`);
            callback();
          },

          error: (err: any) => {

            // Quantities Observation retrieval failed
            this.log.error(`${LOG_PREFIX} Quantities Observation retrieval failed`);

            // Return
            this.log.trace(`${LOG_PREFIX} Returning`);
            callback();
          }
        });

    } else {

      // The target administrative unit has not been specified
      this.log.error(`${LOG_PREFIX} The target administrative unit has not been specified`);

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    }


  }


  initialiseSubsidiariesData(callback: () => void) {

    this.log.trace(`${LOG_PREFIX} Entering initialiseSubsidiariesData()`);

    // Clear the previously initialised data
    this.data.clear();

    // Loop through each of the administrative hierarchies subsidiaries
    for (let subsidiary of this.subsidiaries) {

      // Get the id of the administrative unit associated with the subsidiary administrative hierarchy level
      const adminUnitId: number | null | undefined = subsidiary?.data?.responsible?.id;

      // Continue iff the administrative unit id was successfully retrieved
      if (adminUnitId) {

        // Obtain the administrative unit's observed values for each of the visualisations variables for the active period
        for (let v of this.visualisationVariables) {

          // Consider only the visualisation variables with valid ids / indicator ids
          if (v.id && v.data.indicatorId) {

            // Get the administrative unit's observations container
            // or initialise one if non-existent
            let temp: Map<number, number | null | undefined> | undefined = this.data.get(adminUnitId);
            if (temp == undefined) { temp = new Map<number, number | null | undefined>(); }

            // Get the observations associated with the administrative unit / visualisation variable's indicators
            const observations: QuantityObservation[] = this.quantitiesObservations.filter(q => q.data.partyId == adminUnitId && q.data.phenomenonTypeId == v.data.indicatorId);

            // Pick an observed value based on how many observations were returned
            switch (observations.length) {

              case 0:
                temp.set(v.id, null);
                break;

              case 1:
                temp.set(v.id, observations[0].data.amount);
                break;

              default:

                // Sort in descending order and take the first value i.e. the latest value
                temp.set(v.id, observations.sort(function (a, b) {
                  if (a.data.timePointId && b.data.timePointId) {
                    if (a.data.timePointId > b.data.timePointId) return -1;
                    if (a.data.timePointId < b.data.timePointId) return 1;
                    return 0;
                  } else {
                    return 0;
                  }
                })[0].data.amount);

            }

            // Update the administrative unit's data
            this.data.set(adminUnitId, temp);
          }

        }

      }


    }

    // Return
    this.log.trace(`${LOG_PREFIX} Returning`);
    callback();

  }



  private showError(message: string) {

    this.error = message;

    setTimeout(() => {
      this.error = "";
      this.cd.detectChanges();
    }, 5000);
  }

  /**
   * Sorts the visulisation variables by dimension and index
   */
  private sortVisualisationVariables(visualisationVariables: VisualisationVariable[]): VisualisationVariable[] {

    return visualisationVariables.sort((obj1, obj2) => {

      if (obj1.data.dimensionIdx && obj2.data.dimensionIdx) {
        if (obj1.data.dimensionIdx < obj2.data.dimensionIdx) {
          return -1;
        } else if (obj1.data.dimensionIdx > obj2.data.dimensionIdx) {
          return 1;
        } else {

          if (obj1.data.labelIdx && obj2.data.labelIdx) {

            if (obj1.data.labelIdx < obj2.data.labelIdx) {
              return -1;
            } else if (obj1.data.labelIdx > obj2.data.labelIdx) {
              return 1;
            } else {
              return 0;
            }

          } else {

            return 0;
          }


        }
      } else {

        if (obj1.data.labelIdx && obj2.data.labelIdx) {

          if (obj1.data.labelIdx < obj2.data.labelIdx) {
            return -1;
          } else if (obj1.data.labelIdx > obj2.data.labelIdx) {
            return 1;
          } else {
            return 0;
          }

        } else {

          return 0;
        }
      }
    });

  }



  // See: https://stackoverflow.com/questions/43118692/typescript-filter-out-nulls-from-an-array
  private notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
    return value !== null && value !== undefined;
  }
  private unique(value: any, index: any, self: any) {
    return self.indexOf(value) === index;
  }


  getCurrentDimensionVisualisationVariables(): VisualisationVariable[] {

    return this.visualisationVariables.filter(v => v.data.dimensionIdx == 1).sort((obj1, obj2) => {

      if (obj1.data.dimensionIdx && obj2.data.dimensionIdx) {

        if (obj1.data.dimensionIdx < obj2.data.dimensionIdx) {
          return -1;
        } else if (obj1.data.dimensionIdx > obj2.data.dimensionIdx) {
          return 1;
        } else {

          if (obj1.data.labelIdx && obj2.data.labelIdx) {
            if (obj1.data.labelIdx < obj2.data.labelIdx) {
              return -1;
            } else if (obj1.data.labelIdx > obj2.data.labelIdx) {
              return 1;
            } else {
              return 0;
            }
          } else {
            return 0;
          }

        }
      } else {

        if (obj1.data.labelIdx && obj2.data.labelIdx) {
          if (obj1.data.labelIdx < obj2.data.labelIdx) {
            return -1;
          } else if (obj1.data.labelIdx > obj2.data.labelIdx) {
            return 1;
          } else {
            return 0;
          }
        } else {
          return 0;
        }

      }
    });

  }


  getValue(administrativeUnitId: number, visualisationVariableId: number): number | null | undefined {

    let value: number | null | undefined = null;

    if (administrativeUnitId && visualisationVariableId) {

      const temp: Map<number, number | null | undefined> | undefined = this.data.get(administrativeUnitId);

      if (temp) {

        value = temp.get(visualisationVariableId);

      }


    }

    return value;

  }




  getVariableColorCode(variable: VisualisationVariable | null | undefined): any {

    return variable?.data.color ? { "background-color": variable.data.color, "background-clip": "content-box", "padding": 0 } : { "background-color": "#ffffff", "background-clip": "content-box", "padding": 0 };

  }

  getSubsidiaryAdministrativeStructuresIds(callback: (ids: number[] | null) => void): void {

    const hierarchyId: number | null | undefined = this.filterService.filter.activeAdministrativeSystem?.id;
    const commissionerId: number | null | undefined = this.filterService.filter.activeAdministrativeUnit?.data.typeId;

    if (hierarchyId && commissionerId) {

      this.administrativeStructuresDataService
        .getAdministrativeStructures(true, {
          searchTerm: null,
          page: null,
          pageSize: null,
          sortColumn: 'id',
          sortDirection: 'asc',
          hierarchyId: hierarchyId,
          hierarchyName: null,
          commissionerId: commissionerId,
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

    } else {
      callback(null);
    }

  }

}