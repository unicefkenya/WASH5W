import { Injectable } from '@angular/core';
import { AdministrativeHierarchy } from '@modules/administrative-hierarchies/models/administrative-hierarchy.model';
import { AdministrativeStructure } from '@modules/administrative-structures/models/administrative-structure.model';
import { AdministrativeSystem } from '@modules/administrative-systems/models/administrative-system.model';
import { AdministrativeUnitType } from '@modules/administrative-units-types/models/administrative-unit-type.model';
import { AdministrativeUnit } from '@modules/administrative-units/models/administrative-unit.model';
import { Context } from '@modules/contexts/models/context.model';
import { DataFormElement } from '@modules/data-forms-elements/models';
import { DataForm } from '@modules/data-forms/models';
import { Domain } from '@modules/domains/models/domain.model';
import { EntityType } from '@modules/entities-types/models/entity-type.model';
import { Entity } from '@modules/entities/models';
import { Indicator } from '@modules/indicators/models/indicator.model';
import { LogicalElementType } from '@modules/logical-elements-types/models/logical-element-type.model';
import { LogicalHierarchy } from '@modules/logical-hierarchies/models/logical-hierarchy.model';
import { LogicalScheme } from '@modules/logical-schemes/models/logical-scheme.model';
import { LogicalStructure } from '@modules/logical-structures/models/logical-structure.model';
import { OptionType } from '@modules/options-types/models/option-type.model';
import { OrganisationType } from '@modules/organisations-types/models/organisation-type.model';
import { Organisation } from '@modules/organisations/models/organisation.model';
import { SystemModule } from '@modules/systems-modules/models';
import { SystemRole } from '@modules/systems-roles/models/system-role.model';
import { SystemUser } from '@modules/systems-users/models';
import { TimePeriod } from '@modules/time-periods/models';
import { Timestep } from '@modules/timesteps/models/timestep.model';
import { VisualisationContainerType } from '@modules/visualisations-containers-types/models/visualisation-container-type.model';
import { VisualisationFormat } from '@modules/visualisations-formats/models/visualisation-format.model';
import { Workflow } from '@modules/workflows/models/workflow.model';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject } from 'rxjs';

const LOG_PREFIX: string = "[Filter Service]";

export class Filter {

  // Active
  public activeAdministrativeUnit: AdministrativeUnit | null | undefined;
  public activeAdministrativeUnitType: AdministrativeUnitType | null | undefined;
  public activeAdministrativeStructures: AdministrativeStructure[] = [];
  public activeAdministrativeSystem: AdministrativeSystem | null | undefined
  public activeAdministrativeHierarchy: AdministrativeHierarchy | null | undefined;

  public activeAssignedAdministrativeUnit: AdministrativeUnit | null | undefined;
  public activeAssignedAdministrativeUnitType: AdministrativeUnitType | null | undefined;
  public activeAssignedAdministrativeStructures: AdministrativeStructure[] = [];
  public activeAssignedAdministrativeSystem: AdministrativeSystem | null | undefined
  public activeAssignedAdministrativeHierarchy: AdministrativeHierarchy | null | undefined;

  public activeContext: Context | null | undefined;
  public activeDataForm: DataForm | null | undefined;
  public activeDataFormViewMode: String | null | undefined;
  public activeDomain: Domain | null | undefined;
  public activeEntityType: EntityType | null | undefined;
  public activeLink: string | null | undefined;
  public activeLogicalElementType: LogicalElementType | null | undefined;
  public activeLogicalHierarchy: LogicalHierarchy | null | undefined;
  public activeLogicalScheme: LogicalScheme | null | undefined;
  public activeLogicalStructures: LogicalStructure[] = [];
  public activeOptionType: OptionType | null | undefined;
  public activeOrganisationType: OrganisationType | null | undefined;
  public activeReportingPeriod!: TimePeriod | null | undefined;
  public activeSystemModule: SystemModule | null | undefined;
  public activeSystemRole: SystemRole | null | undefined;
  public activeSystemUser: SystemUser | null | undefined;
  public activeSystemUserContextSystemRole: SystemRole | null | undefined;
  public activeSystemUserEntity: Entity | null | undefined;
  public activeSystemUserEntityLocation: AdministrativeUnit | null | undefined;
  public activeSystemUserLocation: AdministrativeUnit | null | undefined;
  public activeSystemUserOrganisation: Organisation | null | undefined;
  public activeTimeIntervalStart!: string;
  public activeTimeIntervalEnd!: string;
  public activeTimeIntervalSteps!: Timestep;
  public activeTimeIntervals!: { start: string, end: string, title: string }[];
  public activeVisualisationFormat: VisualisationFormat | null | undefined;
  public activeVisualisationContainerType: VisualisationContainerType | null | undefined;
  public activeWorkflow: Workflow | null | undefined;

  // Expanded
  public expandedContexts: Context[] = [];
  public expandedDataFormsIds: number[] = [];
  public expandedDataFormElements: DataFormElement[] = [];
  public expandedIndicators: Indicator[] = [];
  public expandedSystemModulesIds: number[] = [];
  public expandedTimePeriods: TimePeriod[] = [];
  public expandedSystemUsers: SystemUser[] = [];
  public expandedVisualisationContainersIds: number[] = [];


  // Opened
  public openedAdministrativeHierarchies: AdministrativeHierarchy[] = [];
  public openedAssignedAdministrativeHierarchies: AdministrativeHierarchy[] = [];
  public openedLogicalHierarchies: LogicalHierarchy[] = [];


  // Previewed
  public previewedDataFormsIds: number[] = [];


  // Selected
  public selectedLogicalHierarchy: LogicalHierarchy | null | undefined;


  // Assigned
  public assignedContexts: Context[] = [];

  constructor(filters?: Partial<Filter>) {
    Object.assign(this, filters);
  }
}


@Injectable({
  providedIn: 'root'
})
export class FilterService {

  private _currentFilterSubject$;
  readonly currentFilter$;

  constructor(private log: NGXLogger) {

    // Try retrieving previous filters from the local storage
    const _filter: string | null = localStorage.getItem("filter") || null;

    // Initialise the current filter based on whether or not a previous filter was found
    this._currentFilterSubject$ = new BehaviorSubject<Filter>(_filter ? JSON.parse(_filter) : new Filter());
    this.currentFilter$ = this._currentFilterSubject$.asObservable();

  }



  public update(filters?: Partial<Filter>) {

    this.log.trace(`${LOG_PREFIX} Entering update()`);
    this.log.debug(`${LOG_PREFIX} Incoming Filter(s) = ${JSON.stringify(filters)}`);

    // Update the filter
    this._currentFilterSubject$.next(Object.assign(this._currentFilterSubject$.value, filters));

    // Store the updated filter in the local storage
    localStorage.setItem("filter", JSON.stringify(this._currentFilterSubject$.value));

  }


  /**
   * Retrieves the current filter
   */
  public get filter(): Filter {
    return this._currentFilterSubject$.value;
  }


}