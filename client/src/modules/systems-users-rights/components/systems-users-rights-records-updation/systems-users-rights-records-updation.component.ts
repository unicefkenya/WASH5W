import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { TextUtilService } from '@common/services/text-util.service';
import { AdministrativeHierarchy } from '@modules/administrative-hierarchies/models/administrative-hierarchy.model';
import { ContextsDataService } from '@modules/contexts/services/contexts-data.service';
import { ScopesTypesDataService } from '@modules/scopes-types/services/scopes-types-data.service';
import { SystemsRolesDataService } from '@modules/systems-roles/services/systems-roles-data.service';
import { SystemUserRight } from '@modules/systems-users-rights/models/system-user-right.model';
import { SystemsUsersRightsDataService } from '@modules/systems-users-rights/services/systems-users-rights-data.service';
import { NGXLogger } from 'ngx-logger';
import { map } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { of } from 'rxjs/internal/observable/of';
import { OrganisationsDataService } from '@modules/organisations/services/organisations-data.service';
import { Organisation } from '@modules/organisations/models/organisation.model';
import { EntitiesDataService } from '@modules/entities/services/entities-data.service';
import { Entity } from '@modules/entities/models/entity.model';
import { AdministrativeUnit } from '@modules/administrative-units/models/administrative-unit.model';
import { AdministrativeUnitsDataService } from '@modules/administrative-units/services/administrative-units-data.service';
import { SystemRole } from '@modules/systems-roles/models/system-role.model';
import { ScopeType } from '@modules/scopes-types/models/scope-type.model';
import { Context } from '@modules/contexts/models/context.model';
import { FilterService } from '@app/app-filter.service';
import { HierarchicalLocation } from '@modules/administrative-hierarchies/models/hierarchical-location.model';
import { AdministrativeSystem } from '@modules/administrative-systems/models/administrative-system.model';

const LOG_PREFIX: string = "[Systems Users Rights Records Updation Component]";

@Component({
  selector: 'sb-systems-users-rights-records-updation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './systems-users-rights-records-updation.component.html',
  styleUrls: ['systems-users-rights-records-updation.component.scss'],
})
export class SystemsUsersRightsRecordsUpdationComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target System User Right record
  @Input() public id!: number;

  // Broadcasts selector windows open events
  @Output() public openedLocationSelector: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts selector windows close events
  @Output() public closedLocationSelector: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts selector windows open events
  @Output() public openedOrganisationSelector: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts selector windows close events
  @Output() public closedOrganisationSelector: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts selector windows open events
  @Output() public openedEntitySelector: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts selector windows close events
  @Output() public closedEntitySelector: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts successful Systems Users Rights creation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Systems Users Rights creation events together with their error plurals
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Keep tabs of the selected entity
  private entity: Entity | null | undefined = null;

  // Keep tabs of the selected location
  private location: HierarchicalLocation | null | undefined = null;  

  // Keep tabs of the selected organisation
  private organisation: Organisation | null | undefined = null;    

  // Defines Systems Users Rights reactive form controls group
  public systemsUsersRightsForm = new FormGroup({

    context: new FormGroup({
      contextId: new FormControl<number | null | undefined>(null, [Validators.required, this.isContextRequired()], [this.ContextRightExists()]),
      contextName: new FormControl<string>("")
    }),

    systemRole: new FormGroup({
      systemRoleId: new FormControl<number | null | undefined>(null, this.isSystemRoleRequired()),
      systemRoleName: new FormControl<string>("")
    }),

    scopeType: new FormGroup({
      scopeTypeId: new FormControl<number | null | undefined>(null, this.isScopeTypeRequired()),
      scopeTypeName: new FormControl<string>("")
    }),

    location: new FormGroup({
      administrativeSystemId: new FormControl<number | null | undefined>(null),
      administrativeStructureId: new FormControl<number | null | undefined>(null),
      administrativeHierarchyId: new FormControl<number | null | undefined>(null),
      administrativeUnitId: new FormControl<number | null | undefined>(null, this.isLocationRequired()),
      administrativeUnitName: new FormControl<string | null | undefined>("Choose Location")
    }),

    organisation: new FormGroup({
      organisationId: new FormControl<number | null | undefined>(null, this.isOrganisationRequired()),
      organisationName: new FormControl<string | null | undefined>("Choose Organisation")
    }),

    entity: new FormGroup({
      entityId: new FormControl<number | null | undefined>(null, this.isEntityRequired()),
      entityName: new FormControl<string | null | undefined>("Choose Entity")
    })

  });

  // Keeps tabs of the currently visible content
  public page: string = "default";

  // Keeps tabs of whether the component has been successfully initialised
  public initialised: boolean = false;

  // Holds the target System User Right record
  public systemUserRight: SystemUserRight | null | undefined = undefined;


  constructor(
    public contextsDataService: ContextsDataService,
    public systemsRolesDataService: SystemsRolesDataService,
    public administrativeUnitsDataService: AdministrativeUnitsDataService,
    public scopesTypesDataService: ScopesTypesDataService,
    public textUtilService: TextUtilService,
    private systemsUsersRightsDataService: SystemsUsersRightsDataService,
    public organisationsDataService: OrganisationsDataService,
    public entitiesDataService: EntitiesDataService,
    public filterService: FilterService,
    private cd: ChangeDetectorRef,
    private log: NGXLogger) {

  }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the System User Right field based on the passed in id
    this.initialiseSystemUserRight(() => {

      // Initialise the System User Right updation form based on the target System User Right
      this.initialiseSystemUserRightUpdationForm(() => {

        // Mark Init as complete
        this.log.trace(`${LOG_PREFIX} Init completed`);
        this.initialised = true;
        this.cd.detectChanges();

      });
    });

  }

  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }

  /**
   * Retrieves the System User Right with the injected id and sets it as the System User Right that needs to be updated
   * @param callback The function to call when done
   */
  private initialiseSystemUserRight(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseSystemUserRight()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveSystemUserRightRecord(this.id, (systemUserRight: SystemUserRight | null) => {

      // Set the target System User Right
      this.log.trace(`${LOG_PREFIX} Setting the target System User Right`);
      this.systemUserRight = systemUserRight;

      // Initialise the local Entity Reference
      this.log.trace(`${LOG_PREFIX} Initialising the local Entity Reference`);
      this.entity = this.systemUserRight?.data.entity;

      // Initialise the local Location Reference
      this.log.trace(`${LOG_PREFIX} Initialising the local Location Reference`);
      this.location = this.systemUserRight?.data.location;   
      
      // Initialise the local Organisation Reference
      this.log.trace(`${LOG_PREFIX} Initialising the local Organisation Reference`);
      this.organisation = this.systemUserRight?.data.organisation;         

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }


  /**
   * Initialises the System User Right updation form
   * @param callback The function to call when done
   */
  private initialiseSystemUserRightUpdationForm(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseSystemUserRightUpdationForm()`);
    this.log.debug(`${LOG_PREFIX} Target System User Right Record = ${JSON.stringify(this.systemUserRight)}`);

    // Initialise context
    this.log.trace(`${LOG_PREFIX} Initialising context`);
    this.systemsUsersRightsForm.get('context.contextId')?.setValue(this.systemUserRight?.data.context?.id ? this.systemUserRight?.data.context?.id : null);
    this.systemsUsersRightsForm.get('context.contextName')?.setValue(this.systemUserRight?.data.context?.name ? this.systemUserRight?.data.context?.name : null);

    // Initialise system role
    this.log.trace(`${LOG_PREFIX} Initialising system role`);
    this.systemsUsersRightsForm.get('systemRole.systemRoleId')?.setValue(this.systemUserRight?.data.role?.id ? this.systemUserRight?.data.role?.id : null);
    this.systemsUsersRightsForm.get('systemRole.systemRoleName')?.setValue(this.systemUserRight?.data.role?.name ? this.systemUserRight?.data.role?.name : null);

    // Initialise Scope Type
    this.log.trace(`${LOG_PREFIX} Initialising Scope Type`);
    this.systemsUsersRightsForm.get('scopeType.scopeTypeId')?.setValue(this.systemUserRight?.data.scopeType?.id ? this.systemUserRight.data.scopeType?.id : null);
    this.systemsUsersRightsForm.get('scopeType.scopeTypeName')?.setValue(this.systemUserRight?.data.scopeType?.name ? this.systemUserRight?.data.scopeType?.name : null);

    // Initialise party
    this.log.trace(`${LOG_PREFIX} Initialising party`);

    switch (this.systemUserRight?.data.scopeType?.id) {

      case 1: // Entity

        this.retrieveEntityRecord(this.systemUserRight?.data.entity?.id, (entity: Entity | null) => {

          if (entity) {
            this.systemsUsersRightsForm.get('entity.entityId')?.setValue((entity && entity.id) ? entity.id : null);
            this.systemsUsersRightsForm.get('entity.entityName')?.setValue((entity && entity.data?.name) ? this.textUtilService.truncate(entity.data.name, [35, "..."]) : null);
          }

          // Return
          this.log.trace(`${LOG_PREFIX} Returning`);
          callback();

        });

        break;

      case 2: // Location

        this.retrieveAdministrativeUnitRecord(this.systemUserRight?.data.location?.accountabilities[0]?.id, (administrativeUnit: AdministrativeUnit | null) => {

          if (administrativeUnit) {
            this.systemsUsersRightsForm.get('location.administrativeUnitId')?.setValue((administrativeUnit && administrativeUnit.id) ? administrativeUnit.id : null);
            this.systemsUsersRightsForm.get('location.administrativeUnitName')?.setValue((administrativeUnit && administrativeUnit.data?.name) ? this.textUtilService.truncate(administrativeUnit.data.name, [35, "..."]) : null);
          }

          // Return
          this.log.trace(`${LOG_PREFIX} Returning`);
          callback();

        });

        break;

      case 3: // Organisation

        this.retrieveOrganisationRecord(this.systemUserRight?.data.organisation?.id, (organisation: Organisation | null) => {

          if (organisation) {
            this.systemsUsersRightsForm.get('organisation.organisationId')?.setValue((organisation && organisation.id) ? organisation.id : null);
            this.systemsUsersRightsForm.get('organisation.organisationName')?.setValue((organisation && organisation.data?.name) ? this.textUtilService.truncate(organisation.data.name, [35, "..."]) : null);
          }

          // Return
          this.log.trace(`${LOG_PREFIX} Returning`);
          callback();

        });

        break;

      default:

        // Return
        this.log.trace(`${LOG_PREFIX} Returning`);
        callback();
    }

  }

  /**
   * Retrieves a System User Right record given its unique identifier synchronously
   * @param id The unique identifier of the System User Right
   * @param callback The function to call when done
   */
  private retrieveSystemUserRightRecord(id: number, callback: (systemUserRight: SystemUserRight | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveSystemUserRightRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the System User Right Id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the System User Right Id has been specified`);
    if (id) {

      // The System User Right Id has been specified
      this.log.trace(`${LOG_PREFIX} The System User Right Id has been specified`);
      this.log.debug(`${LOG_PREFIX} System User Right Id = ${JSON.stringify(id)}`);

      // Try retrieving a System User Right Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve a System User Right Record with the passed in id`);
      this.systemsUsersRightsDataService
        .getSystemsUsersRights(false, {
          searchTerm: null,
          page: null,
          pageSize: null,
          sortColumn: null,
          sortDirection: null,
          id: id,
          systemUserId: null,
          contextId: null
        })
        .subscribe({
          next: (systemsUsersRights: SystemUserRight[]) => {

            // Check if a System User Right record with the given id was found
            this.log.trace(`${LOG_PREFIX} Checking if a System User Right record with the given id was found`);
            if (systemsUsersRights.length > 0) {

              //A System User Right record with the given id was found
              this.log.trace(`${LOG_PREFIX} A System User Right record with the given id was found`);

              // Return the System User Right record
              this.log.trace(`${LOG_PREFIX} Returning the System User Right record`);
              callback(systemsUsersRights[0]);


            } else {

              //A System User Right record with the given id was not found
              this.log.trace(`${LOG_PREFIX} A System User Right record with the given id was not found`);

              // Return null
              this.log.warn(`${LOG_PREFIX} Return null`);
              callback(null);

            }
          },
          error: (err: Error) => {
            // Return null
            this.log.warn(`${LOG_PREFIX} Return null`);
            callback(null);
          }
        });


    } else {

      // The System User Right Id has not been specified
      this.log.error(`${LOG_PREFIX} The System User Right Id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }


  /**
   * Retrieves an Administrative Unit record given its unique identifier synchronously
   * @param id The unique identifier of the Administrative Unit
   * @param callback The function to call when done
   */
  private retrieveAdministrativeUnitRecord(id: number | null | undefined, callback: (administrativeUnit: AdministrativeUnit | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveAdministrativeUnitRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the Administrative Unit Id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the Administrative Unit Id has been specified`);
    if (id) {

      // The Administrative Unit Id has been specified
      this.log.trace(`${LOG_PREFIX} The Administrative Unit Id has been specified`);
      this.log.debug(`${LOG_PREFIX} Administrative Unit Id = ${JSON.stringify(id)}`);

      // Try retrieving an Administrative Unit Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve an Administrative Unit Record with the passed in id`);
      this.administrativeUnitsDataService
        .getAdministrativeUnits(false, {
          page: null,
          pageSize: null,
          searchTerm: null,
          sortColumn: null,
          sortDirection: null,
          id: id,
          typesIds: null,
          name: null
        })
        .subscribe({
          next: (administrativeUnits: AdministrativeUnit[]) => {

            // Check if an Administrative Unit record with the given id was found
            this.log.trace(`${LOG_PREFIX} Checking if an Administrative Unit record with the given id was found`);
            if (administrativeUnits.length > 0) {

              //An Administrative Unit record with the given id was found
              this.log.trace(`${LOG_PREFIX} An Administrative Unit record with the given id was found`);

              // Return the Administrative Unit record
              this.log.trace(`${LOG_PREFIX} Returning the Administrative Unit record`);
              callback(administrativeUnits[0]);


            } else {

              //An Administrative Unit record with the given id was not found
              this.log.trace(`${LOG_PREFIX} An Administrative Unit record with the given id was not found`);

              // Return null
              this.log.warn(`${LOG_PREFIX} Return null`);
              callback(null);

            }
          }
        });


    } else {

      // The Administrative Unit Id has not been specified
      this.log.error(`${LOG_PREFIX} The Administrative Unit Id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }





  /**
     * Retrieves an Organisation record given its unique identifier synchronously
     * @param id The unique identifier of the Organisation
     * @param callback The function to call when done
     */
  private retrieveOrganisationRecord(id: number | null | undefined, callback: (organisation: Organisation | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveOrganisationRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the Organisation Id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the Organisation Id has been specified`);
    if (id) {

      // The Organisation Id has been specified
      this.log.trace(`${LOG_PREFIX} The Organisation Id has been specified`);
      this.log.debug(`${LOG_PREFIX} Organisation Id = ${JSON.stringify(id)}`);

      // Try retrieving an Organisation Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve an Organisation Record with the passed in id`);
      this.organisationsDataService
        .getOrganisations(false, {
          page: null,
          pageSize: null,
          searchTerm: null,
          sortColumn: null,
          sortDirection: null,
          id: id,
          typeId: null,
          name: null,
          abbreviation: null
        })
        .subscribe({
          next: (organisations: Organisation[]) => {

            // Check if an Organisation record with the given id was found
            this.log.trace(`${LOG_PREFIX} Checking if an Organisation record with the given id was found`);
            if (organisations.length > 0) {

              //An Organisation record with the given id was found
              this.log.trace(`${LOG_PREFIX} An Organisation record with the given id was found`);

              // Return the Organisation record
              this.log.trace(`${LOG_PREFIX} Returning the Organisation record`);
              callback(organisations[0]);


            } else {

              //An Organisation record with the given id was not found
              this.log.trace(`${LOG_PREFIX} An Organisation record with the given id was not found`);

              // Return null
              this.log.warn(`${LOG_PREFIX} Return null`);
              callback(null);

            }
          }
        });


    } else {

      // The Organisation Id has not been specified
      this.log.error(`${LOG_PREFIX} The Organisation Id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }



  /**
   * Retrieves an Entity record given its unique identifier synchronously
   * @param id The unique identifier of the Entity
   * @param callback The function to call when done
   */
  private retrieveEntityRecord(id: number | null | undefined, callback: (entity: Entity | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveEntityRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the Entity Id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the Entity Id has been specified`);
    if (id) {

      // The Entity Id has been specified
      this.log.trace(`${LOG_PREFIX} The Entity Id has been specified`);
      this.log.debug(`${LOG_PREFIX} Entity Id = ${JSON.stringify(id)}`);

      // Try retrieving an Entity Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve an Entity Record with the passed in id`);
      this.entitiesDataService
        .getEntities(false, {
          page: null,
          pageSize: null,
          searchTerm: null,
          sortColumn: null,
          sortDirection: null,
          id: id,
          typeId: null,
          locationId: null,
          name: null
        })
        .subscribe({
          next: (entities: Entity[]) => {

            // Check if an Entity record with the given id was found
            this.log.trace(`${LOG_PREFIX} Checking if an Entity record with the given id was found`);
            if (entities.length > 0) {

              //An Entity record with the given id was found
              this.log.trace(`${LOG_PREFIX} An Entity record with the given id was found`);

              // Return the Entity record
              this.log.trace(`${LOG_PREFIX} Returning the Entity record`);
              callback(entities[0]);


            } else {

              //An Entity record with the given id was not found
              this.log.trace(`${LOG_PREFIX} An Entity record with the given id was not found`);

              // Return null
              this.log.warn(`${LOG_PREFIX} Return null`);
              callback(null);

            }
          }
        });


    } else {

      // The Entity Id has not been specified
      this.log.error(`${LOG_PREFIX} The Entity Id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }



  /**
   * Retrieves the id of the context
   * @returns the id
   */
  public getContextId(): number | null | undefined {
    return this.systemsUsersRightsForm.get('context.contextId')?.value
  }

  /**
   * Retrieves the name of the context
   * @returns the name
   */
  public getContextName(): string | null | undefined {
    return this.systemsUsersRightsForm.get('context.contextName')?.value
  }


  /**
   * Handles Context change events
   */
  public onContextChange(): void {

    this.log.trace(`${LOG_PREFIX} Entering onContextChange()`);


    // Get the selected context id
    this.log.trace(`${LOG_PREFIX} Getting the selected Context Id`);
    const contextId: number | null | undefined = this.systemsUsersRightsForm.get('context.contextId')?.value
    this.log.debug(`${LOG_PREFIX} Context Id = ${contextId}`);

    // Get the context with the specified id
    this.log.trace(`${LOG_PREFIX} Getting the Context with the specified Id`);
    const context: Context | undefined = this.contextsDataService.records.find(c => c.id == contextId);

    // Update the forms
    this.log.trace(`${LOG_PREFIX} Updating the forms`);
    this.systemsUsersRightsForm.get('context.contextName')?.setValue((context && context.data.name) ? context.data.name : "");

  }

  /**
   * Checks whether the context is required
   * @returns 
   */
  private isContextRequired(): ValidatorFn {

    this.log.trace(`${LOG_PREFIX} Entering isContextRequired()`);

    return (control: AbstractControl): ValidationErrors | null => {

      // Check if a context has been specified
      this.log.trace(`${LOG_PREFIX} Checking if a context has been specified`);
      if (control.value) {

        // A context has been specified
        this.log.trace(`${LOG_PREFIX} A context has been specified`);

        // Considering the requirement constraint as upheld
        this.log.trace(`${LOG_PREFIX} Considering the requirement constraint as upheld`);

        // Return null
        return null;

      } else {

        // A context has not been specified
        this.log.trace(`${LOG_PREFIX} A context has not been specified`);

        // Considering the requirement constraint as violated
        this.log.trace(`${LOG_PREFIX} Considering the requirement constraint as violated`);

        return { 'required': true };

      }

    }

  }



  /**
   * Retrieves the id of the Scope Type
   * @returns the id
   */
  public getScopeTypeId(): number | null | undefined {
    return this.systemsUsersRightsForm.get('scopeType.scopeTypeId')?.value
  }

  /**
   * Retrieves the name of the Scope Type
   * @returns the name
   */
  public getScopeTypeName(): string | null | undefined {
    return this.systemsUsersRightsForm.get('scopeType.scopeTypeName')?.value
  }


  /**
   * Handles Scope Type change events
   */
  public onScopeTypeChange(): void {

    this.log.trace(`${LOG_PREFIX} Entering onScopeTypeChange()`);


    // Get the selected scopeType id
    this.log.trace(`${LOG_PREFIX} Getting the selected Scope Type Id`);
    const scopeTypeId: number | null | undefined = this.systemsUsersRightsForm.get('scopeType.scopeTypeId')?.value
    this.log.debug(`${LOG_PREFIX} Scope Type Id = ${scopeTypeId}`);

    // Get the Scope Type with the specified id
    this.log.trace(`${LOG_PREFIX} Getting the Scope Type with the specified Id`);

    if (scopeTypeId) {

      this.scopesTypesDataService.getScopeTypeById$(scopeTypeId).subscribe({

        next: (scopeType: ScopeType) => {

          // Update the forms
          this.log.trace(`${LOG_PREFIX} Updating the forms`);
          this.systemsUsersRightsForm.get('scopeType.scopeTypeName')?.setValue((scopeType && scopeType.data.name) ? scopeType.data.name : "");

        },
        error: (err: Error) => {

          // Update the forms
          this.log.trace(`${LOG_PREFIX} Updating the forms`);
          this.systemsUsersRightsForm.get('scopeType.scopeTypeName')?.setValue("");

        }

      });

    } else {

      // Update the forms
      this.log.trace(`${LOG_PREFIX} Updating the forms`);
      this.systemsUsersRightsForm.get('scopeType.scopeTypeName')?.setValue("");

    }


  }

  /**
   * Checks whether the Scope Type is required
   * @returns 
   */
  private isScopeTypeRequired(): ValidatorFn {

    this.log.trace(`${LOG_PREFIX} Entering isScopeTypeRequired()`);

    return (control: AbstractControl): ValidationErrors | null => {

      // Check if a Scope Type has been specified
      this.log.trace(`${LOG_PREFIX} Checking if a Scope Type has been specified`);
      if (control.value) {

        // A Scope Type has been specified
        this.log.trace(`${LOG_PREFIX} A Scope Type has been specified`);

        // Considering the requirement constraint as upheld
        this.log.trace(`${LOG_PREFIX} Considering the requirement constraint as upheld`);

        // Return null
        return null;

      } else {

        // A Scope Type has not been specified
        this.log.trace(`${LOG_PREFIX} A Scope Type has not been specified`);

        // Considering the requirement constraint as violated
        this.log.trace(`${LOG_PREFIX} Considering the requirement constraint as violated`);

        return { 'required': true };

      }

    }

  }



  /**
   * Retrieves the id of the System Role
   * @returns the id
   */
  public getSystemRoleId(): number | null | undefined {
    return this.systemsUsersRightsForm.get('systemRole.systemRoleId')?.value
  }

  /**
   * Retrieves the name of the System Role
   * @returns the name
   */
  public getSystemRoleName(): string | null | undefined {
    return this.systemsUsersRightsForm.get('systemRole.systemRoleName')?.value
  }


  /**
   * Handles System Role change events
   */
  public onSystemRoleChange(): void {

    this.log.trace(`${LOG_PREFIX} Entering onSystemRoleChange()`);


    // Get the selected systemRole id
    this.log.trace(`${LOG_PREFIX} Getting the selected System Role Id`);
    const systemRoleId: number | null | undefined = this.systemsUsersRightsForm.get('systemRole.systemRoleId')?.value
    this.log.debug(`${LOG_PREFIX} SystemRole Id = ${systemRoleId}`);

    // Get the System Role with the specified id
    this.log.trace(`${LOG_PREFIX} Getting the System Role with the specified Id`);
    const systemRole: SystemRole | undefined = this.systemsRolesDataService.records.find(c => c.id == systemRoleId);

    // Update the forms
    this.log.trace(`${LOG_PREFIX} Updating the forms`);
    this.systemsUsersRightsForm.get('systemRole.systemRoleName')?.setValue((systemRole && systemRole.data.name) ? systemRole.data.name : "");

  }

  /**
   * Checks whether the System Role is required
   * @returns 
   */
  private isSystemRoleRequired(): ValidatorFn {

    this.log.trace(`${LOG_PREFIX} Entering isSystemRoleRequired()`);

    return (control: AbstractControl): ValidationErrors | null => {

      // Check if a System Role has been specified
      this.log.trace(`${LOG_PREFIX} Checking if a System Role has been specified`);
      if (control.value) {

        // A System Role has been specified
        this.log.trace(`${LOG_PREFIX} A System Role has been specified`);

        // Considering the requirement constraint as upheld
        this.log.trace(`${LOG_PREFIX} Considering the requirement constraint as upheld`);

        // Return null
        return null;

      } else {

        // A System Role has not been specified
        this.log.trace(`${LOG_PREFIX} A System Role has not been specified`);

        // Considering the requirement constraint as violated
        this.log.trace(`${LOG_PREFIX} Considering the requirement constraint as violated`);

        return { 'required': true };

      }

    }

  }

  /**
   * Retrieves the id of the Administrative System
   * @returns the id
   */
  public getAdministrativeSystemId(): number | null | undefined {
    return this.systemsUsersRightsForm.get('location.administrativeSystemId')?.value
  }

  /**
   * Retrieves the id of the Administrative Structure
   * @returns the id
   */
  public getAdministrativeStructureId(): number | null | undefined {
    return this.systemsUsersRightsForm.get('location.administrativeStructureId')?.value
  }

  /**
   * Retrieves the id of the administrative hierarchy
   * @returns the id
   */
  public getAdministrativeHierarchyId(): number | null | undefined {
    return this.systemsUsersRightsForm.get('location.administrativeHierarchyId')?.value
  }


  /**
   * Retrieves the id of the Administrative Unit
   * @returns the id
   */
  public getAdministrativeUnitId(): number | null | undefined {
    return this.systemsUsersRightsForm.get('location.administrativeUnitId')?.value
  }

  /**
   * Retrieves the name of the Administrative Unit
   * @returns the name
   */
  public getAdministrativeUnitName(): string | null | undefined {
    return this.systemsUsersRightsForm.get('location.administrativeUnitName')?.value
  }


  /**
   * Get the selected entity location for preselection purposes
   * @returns 
   */
  public getSelectedLocations(): number[] {
    if (this.getAdministrativeUnitId()) {
      return [this.getAdministrativeUnitId() as number];
    } else {
      return [];
    }
  }



  /**
   * Opens the Location Selector
   */
  public openLocationSelector(): void {

    this.log.trace(`${LOG_PREFIX} Entering openLocationSelector()`);

    // Set the desired page to 'locations'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'locations'`);
    this.page = "locations";

    // Emit an 'openedLocationSelector' event
    this.log.trace(`${LOG_PREFIX} Emitting an 'openedLocationSelector' event`);
    this.openedLocationSelector.emit();

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();
  }


  /**
   * Closes the Entity Locations Selector
   */
  public closeLocationSelector(): void {

    this.log.trace(`${LOG_PREFIX} Entering closeLocationSelector()`);

    // Set the desired page to 'default'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'default'`);
    this.page = "default";

    // Emit a 'closedLocationSelector' event
    this.log.trace(`${LOG_PREFIX} Emitting a 'closedLocationSelector' event`);
    this.closedLocationSelector.emit();

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();
  }


  /**
   * Sets the selected location details and closes the location selector
   * @param accountabilities the hierarchical location
   */
  onSelectAdministrativeHierarchy(accountabilities: AdministrativeHierarchy[]) {

    // Get the currently prevailing Administrative System
    this.log.trace(`${LOG_PREFIX} Getting the currently prevailing Administrative System`);
    const administrativeSystem: AdministrativeSystem | null | undefined = this.filterService.filter.activeAdministrativeSystem;

    // Keep a local reference to the selected Location
    this.log.trace(`${LOG_PREFIX} Keeping a local reference to the selected Location`);
    this.location = {
      system: administrativeSystem,
      accountabilities: accountabilities
    }

    // Get the specifically selected Administrative Hierarchy - aside from its predecessors
    this.log.trace(`${LOG_PREFIX} Getting the specifically selected administrative hierarchy - aside from its predecessors`);
    const administrativeHierarchy: AdministrativeHierarchy = accountabilities[0];

    // Update the form
    this.log.trace(`${LOG_PREFIX} Updating the form`);
    this.systemsUsersRightsForm.get('location.administrativeSystemId')?.setValue(this.filterService.filter.activeAdministrativeSystem?.id);
    this.systemsUsersRightsForm.get('location.administrativeStructureId')?.setValue(this.filterService.filter.activeAdministrativeStructures.filter(a => a.data.responsible?.id == administrativeHierarchy.data.type?.id)[0].id);
    this.systemsUsersRightsForm.get('location.administrativeHierarchyId')?.setValue(administrativeHierarchy.id);
    this.systemsUsersRightsForm.get('location.administrativeUnitId')?.setValue(administrativeHierarchy.data.responsible?.id);
    this.systemsUsersRightsForm.get('location.administrativeUnitName')?.setValue(this.textUtilService.truncate(administrativeHierarchy.data.responsible?.name, [35, "..."]));

    // Set the desired page to 'default'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'default'`);
    this.page = "default";

    // Emit a 'closedLocationSelector' event
    this.log.trace(`${LOG_PREFIX} Emitting a 'closedLocationSelector' event`);
    this.closedLocationSelector.emit();

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();

  }


  /**
   * Checks whether the location is required
   * @returns 
   */
  private isLocationRequired(): ValidatorFn {

    this.log.trace(`${LOG_PREFIX} Entering isLocationRequired()`);

    return (control: AbstractControl): ValidationErrors | null => {

      // Check if a location has been specified
      this.log.trace(`${LOG_PREFIX} Checking if a location has been specified`);
      if (control.value) {

        // A location has been specified
        this.log.trace(`${LOG_PREFIX} A location has been specified`);

        // Considering the requirement constraint as upheld
        this.log.trace(`${LOG_PREFIX} Considering the requirement constraint as upheld`);

        // Return null
        return null;

      } else {

        // A location has not been specified
        this.log.trace(`${LOG_PREFIX} A location has not been specified`);

        // Considering the requirement constraint as violated if Scope Type is location
        this.log.trace(`${LOG_PREFIX} Considering the requirement constraint as violated if Scope Type is location`);

        return this.systemsUsersRightsForm ? (this.getScopeTypeId() == 2 ? { 'required': true } : null) : null;

      }

    }

  }


  /**
   * Retrieves the id of the organisation
   * @returns the id
   */
  public getOrganisationId(): number | null | undefined {
    return this.systemsUsersRightsForm.get('organisation.organisationId')?.value
  }

  /**
   * Retrieves the name of the organisation
   * @returns the name
   */
  public getOrganisationName(): string | null | undefined {
    return this.systemsUsersRightsForm.get('organisation.organisationName')?.value
  }

  /**
   * Get the selected entity organisation for preselection purposes
   * @returns 
   */
  public getSelectedOrganisations(): number[] {
    if (this.getOrganisationId()) {
      return [this.getOrganisationId() as number];
    } else {
      return [];
    }
  }


  /**
   * Opens the Organisation Selector
   */
  public openOrganisationSelector(): void {

    this.log.trace(`${LOG_PREFIX} Entering openOrganisationSelector()`);

    // Set the desired page to 'organisations'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'organisations'`);
    this.page = "organisations";

    // Emit an 'openedOrganisationSelector' event
    this.log.trace(`${LOG_PREFIX} Emitting an 'openedOrganisationSelector' event`);
    this.openedOrganisationSelector.emit();

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();
  }


  /**
   * Closes the Entity Organisations Selector
   */
  public closeOrganisationSelector(): void {

    this.log.trace(`${LOG_PREFIX} Entering closeOrganisationSelector()`);

    // Set the desired page to 'default'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'default'`);
    this.page = "default";

    // Emit a 'closedOrganisationSelector' event
    this.log.trace(`${LOG_PREFIX} Emitting a 'closedOrganisationSelector' event`);
    this.closedOrganisationSelector.emit();

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();
  }


  /**
  * Sets the selected organisation details and close the organisation selector
  * @param organisation the selected organisation
  */
  onSelectOrganisation(organisation: Organisation) {

    // Keep a local reference to the selected organisation
    this.log.trace(`${LOG_PREFIX} Keeping a local reference to the selected organisation`);
    this.organisation = organisation;

    // Update the form
    this.log.trace(`${LOG_PREFIX} Updating the form`);
    this.systemsUsersRightsForm.get('organisation.organisationId')?.setValue((organisation && organisation.id) ? organisation.id : null);
    this.systemsUsersRightsForm.get('organisation.organisationName')?.setValue((organisation && organisation.data?.name) ? this.textUtilService.truncate(organisation.data.name, [35, "..."]) : null);

    // Set the desired page to 'default'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'default'`);
    this.page = "default";

    // Emit a 'closedOrganisationSelector' event
    this.log.trace(`${LOG_PREFIX} Emitting a 'closedOrganisationSelector' event`);
    this.closedOrganisationSelector.emit();

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();

  }

  /**
   * Checks whether the organisation is required
   * @returns 
   */
  private isOrganisationRequired(): ValidatorFn {

    this.log.trace(`${LOG_PREFIX} Entering isOrganisationRequired()`);

    return (control: AbstractControl): ValidationErrors | null => {

      // Check if a organisation has been specified
      this.log.trace(`${LOG_PREFIX} Checking if a organisation has been specified`);
      if (control.value) {

        // A organisation has been specified
        this.log.trace(`${LOG_PREFIX} A organisation has been specified`);

        // Considering the requirement constraint as upheld
        this.log.trace(`${LOG_PREFIX} Considering the requirement constraint as upheld`);

        // Return null
        return null;

      } else {

        // A organisation has not been specified
        this.log.trace(`${LOG_PREFIX} A organisation has not been specified`);

        // Considering the requirement constraint as violated if Scope Type is organisation
        this.log.trace(`${LOG_PREFIX} Considering the requirement constraint as violated if Scope Type is organisation`);

        return this.systemsUsersRightsForm ? (this.getScopeTypeId() == 3 ? { 'required': true } : null) : null;

      }

    }

  }


  /**
   * Retrieves the id of the entity
   * @returns the id
   */
  public getEntityId(): number | null | undefined {
    return this.systemsUsersRightsForm.get('entity.entityId')?.value
  }

  /**
   * Retrieves the name of the entity
   * @returns the name
   */
  public getEntityName(): string | null | undefined {
    return this.systemsUsersRightsForm.get('entity.entityName')?.value
  }


  /**
   * Get the selected entity entity for preselection purposes
   * @returns 
   */
  public getSelectedEntities(): number[] {
    if (this.getEntityId()) {
      return [this.getEntityId() as number];
    } else {
      return [];
    }
  }


  /**
   * Opens the Entity Selector
   */
  public openEntitySelector(): void {

    this.log.trace(`${LOG_PREFIX} Entering openEntitySelector()`);

    // Set the desired page to 'entities'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'entities'`);
    this.page = "entities";

    // Emit an 'openedEntitySelector' event
    this.log.trace(`${LOG_PREFIX} Emitting an 'openedEntitySelector' event`);
    this.openedEntitySelector.emit();

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();
  }


  /**
   * Closes the Entity Entities Selector
   */
  public closeEntitySelector(): void {

    this.log.trace(`${LOG_PREFIX} Entering closeEntitySelector()`);

    // Set the desired page to 'default'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'default'`);
    this.page = "default";

    // Emit a 'closedEntitySelector' event
    this.log.trace(`${LOG_PREFIX} Emitting a 'closedEntitySelector' event`);
    this.closedEntitySelector.emit();

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();
  }


  /**
  * Sets the selected entity details and close the entity selector
  * @param entity Sets 
  */
  onSelectEntity(entity: Entity) {

    // Keep a local reference to the selected entity
    this.log.trace(`${LOG_PREFIX} Keeping a local reference to the selected entity`);
    this.entity = entity;    

    // Update the form
    this.log.trace(`${LOG_PREFIX} Updating the form`);
    this.systemsUsersRightsForm.get('entity.entityId')?.setValue((entity && entity.id) ? entity.id : null);
    this.systemsUsersRightsForm.get('entity.entityName')?.setValue((entity && entity.data?.name) ? this.textUtilService.truncate(entity.data.name, [35, "..."]) : null);

    // Set the desired page to 'default'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'default'`);
    this.page = "default";

    // Emit a 'closedEntitySelector' event
    this.log.trace(`${LOG_PREFIX} Emitting a 'closedEntitySelector' event`);
    this.closedEntitySelector.emit();

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();

  }


  /**
   * Checks whether the entity is required
   * @returns 
   */
  private isEntityRequired(): ValidatorFn {

    this.log.trace(`${LOG_PREFIX} Entering isEntityRequired()`);

    return (control: AbstractControl): ValidationErrors | null => {

      // Check if a entity has been specified
      this.log.trace(`${LOG_PREFIX} Checking if a entity has been specified`);
      if (control.value) {

        // A entity has been specified
        this.log.trace(`${LOG_PREFIX} A entity has been specified`);

        // Considering the requirement constraint as upheld
        this.log.trace(`${LOG_PREFIX} Considering the requirement constraint as upheld`);

        // Return null
        return null;

      } else {

        // A entity has not been specified
        this.log.trace(`${LOG_PREFIX} A entity has not been specified`);

        // Considering the requirement constraint as violated if Scope Type is entity
        this.log.trace(`${LOG_PREFIX} Considering the requirement constraint as violated if Scope Type is entity`);

        return this.systemsUsersRightsForm ? (this.getScopeTypeId() == 1 ? { 'required': true } : null) : null;

      }

    }

  }



  /**
   * Internal validator that checks whether a System User Right record with the same context exists
   * @returns 
   */
  private ContextRightExists(): AsyncValidatorFn {

    this.log.trace(`${LOG_PREFIX} Entering contextRightExists()`);

    return (control: AbstractControl): Observable<ValidationErrors | null> => {

      // Check if a context value has been provided
      this.log.trace(`${LOG_PREFIX} Check if a context value has been provided`);
      if (control.value) {

        // A context value has been provided
        this.log.trace(`${LOG_PREFIX} A context value has been provided`);

        // Attempt retrieving Systems Users Rights with the same context
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve Systems Users Rights with the same context`);
        return this.systemsUsersRightsDataService
          .getSystemsUsersRights(false, {
            searchTerm: null,
            page: 1,
            pageSize: 20,
            sortColumn: 'name',
            sortDirection: 'asc',
            id: null,
            systemUserId: this.systemUserRight?.data.user?.id,
            contextId: control.value
          })
          .pipe(
            map((systemsUsersRights: SystemUserRight[]) => {

              // Check if an System User Right record with the same Context Id was found
              this.log.trace(`${LOG_PREFIX} Checking if an System User Right record with the same Context Id was found`);

              if (systemsUsersRights.length > 0) {

                // A System User Right record with the same Context Id was found
                this.log.trace(`${LOG_PREFIX} An System User Right record with the same Context Id was found`);

                // Filter out the System User Right records with the same Context Ids but different ids from the current one
                this.log.trace(`${LOG_PREFIX} Filtering out the System User Right records with the same Context Ids but different ids from the current one`);
                const different: SystemUserRight[] = systemsUsersRights.filter(s => s.id != this.systemUserRight?.id);

                // Check if at least one different System User Right record was filtered out
                this.log.trace(`${LOG_PREFIX} Checking if at least one different System User Right record was filtered out`);
                if (different.length > 0) {

                  // At least one different System User Right record was filtered out
                  this.log.trace(`${LOG_PREFIX} At least one different System User Right record was filtered out`);

                  // Mark 'Context Right Exists' as true
                  this.log.trace(`${LOG_PREFIX} Marking 'Context Right Exists' as true`);
                  return { 'exists': true };

                } else {

                  // No different System User Right record was filtered out
                  this.log.trace(`${LOG_PREFIX} No different System User Right record was filtered out`);

                  // Mark 'Context Right Exists' as false
                  this.log.trace(`${LOG_PREFIX} Marking 'Context Right Exists' as false`);
                  return null;
                }


              } else {

                // A System User Right record with the same Context Id was not found
                this.log.trace(`${LOG_PREFIX} A System User Right record with the same Context Id was not found`);

                // Mark 'Context Right Exists' as false
                this.log.trace(`${LOG_PREFIX} Marking 'Context Right Exists' as false`);
                return null;

              }
            }

            )
          )

      } else {

        // A context value has not been provided
        this.log.trace(`${LOG_PREFIX} A context value has not been provided`);

        // Mark 'context exists' as false
        this.log.trace(`${LOG_PREFIX} Marking 'context exists' as false`);
        return of(null);
      }

    };

  }



  /**
   * Validates and saves a new System User Right Record.
   * Emits a succeeded or failed event depending on whether the save request succeeded or failed respectively
   * Error 400 = Indicates that a user error was encountered
   * Error 500 = Indicates that a system error was encountered
   */
  public save(): void {

    this.log.trace(`${LOG_PREFIX} Entering save()`);

    // Check if the data entry form is valid
    this.log.trace(`${LOG_PREFIX} Checking if the data entry form is valid`);
    if (this.systemsUsersRightsForm.valid) {

      // The data entry form is valid
      this.log.trace(`${LOG_PREFIX} The data entry form is valid`);

      // Read in the provided context
      this.log.trace(`${LOG_PREFIX} Reading in the provided context`);
      const context: { id: number | null | undefined; name: string | null | undefined; } = { id: this.getContextId(), name: this.getContextName() };
      this.log.debug(`${LOG_PREFIX} Context = ${JSON.stringify(context)}`);

      // Read in the provided system role
      this.log.trace(`${LOG_PREFIX} Reading in the provided system role`);
      const systemRole: { id: number | null | undefined; name: string | null | undefined; } = { id: this.getSystemRoleId(), name: this.getSystemRoleName() };
      this.log.debug(`${LOG_PREFIX} System Role = ${JSON.stringify(systemRole)}`);

      // Read in the provided entity
      this.log.trace(`${LOG_PREFIX} Reading in the provided entity`);
      const entity: { id: number | null | undefined; name: string | null | undefined; } = { id: this.getEntityId(), name: this.getEntityName() };
      this.log.debug(`${LOG_PREFIX} Entity = ${JSON.stringify(entity)}`);

      // Read in the provided location
      this.log.trace(`${LOG_PREFIX} Reading in the provided location`);
      const location: { id: number | null | undefined; name: string | null | undefined; } = { id: this.getAdministrativeUnitId(), name: this.getAdministrativeUnitName() };
      this.log.debug(`${LOG_PREFIX} Location = ${JSON.stringify(location)}`);

      // Read in the provided organisation
      this.log.trace(`${LOG_PREFIX} Reading in the provided organisation`);
      const organisation: { id: number | null | undefined; name: string | null | undefined; } = { id: this.getOrganisationId(), name: this.getOrganisationName() };
      this.log.debug(`${LOG_PREFIX} Organisation = ${JSON.stringify(organisation)}`);

      // Read in the provided Scope Type
      this.log.trace(`${LOG_PREFIX} Reading in the provided Scope Type`);
      const scopeType: { id: number | null | undefined; name: string | null | undefined; } = { id: this.getScopeTypeId(), name: this.getScopeTypeName() };
      this.log.debug(`${LOG_PREFIX} Scope Type = ${JSON.stringify(scopeType)}`);

      // Initialise the party id
      this.log.trace(`${LOG_PREFIX} Initialising the party id`);
      const party: { id: number | null | undefined; name: string | null | undefined; } | null | undefined = scopeType.id == 1 ? entity : (scopeType.id == 2 ? location : (scopeType.id == 3 ? organisation : null));
      this.log.debug(`${LOG_PREFIX} Party Id = ${party}`);

      // Save the record
      this.log.trace(`${LOG_PREFIX} Saving the System User Right Record`);
      this.systemsUsersRightsDataService
        .updateSystemUserRight(new SystemUserRight({
          id: this.systemUserRight?.id,
          data: {
            user: { id: this.systemUserRight?.data.user?.id },
            context: context,
            role: systemRole,
            scopeType: scopeType,
            party: party,
            accountabilitySystem: { id: this.getAdministrativeSystemId() },
            accountabilityType: { id: this.getAdministrativeStructureId() },
            accountability: { id: this.getAdministrativeHierarchyId() },
            entity: this.entity,
            location: this.location,
            organisation: this.organisation
          },
          version: this.systemUserRight?.version
        }))
        .subscribe({
          next: (response: SystemUserRight) => {

            // The System User Right Record was saved successfully
            this.log.trace(`${LOG_PREFIX} System User Right Record was saved successfuly`);

            // Reset the form
            this.log.trace(`${LOG_PREFIX} Resetting the form`);
            this.systemsUsersRightsForm.reset();

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The System User Right Record was not saved successfully
            this.log.trace(`${LOG_PREFIX} System User Right Record was not saved successfuly`);

            // Emit a 'failed' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
            this.failed.emit(500);
          }
        });
    } else {

      // The data entry form is invalid
      this.log.trace(`${LOG_PREFIX} The data entry form is invalid`);

      // Run the form fields validation request to validate all fields and display the error message(s)
      this.log.trace(`${LOG_PREFIX} Running the form fields validation request to validate all fields and display the error message(s)`);
      this.validateAllFormFields(this.systemsUsersRightsForm);

      // Emit an 'invalid' event
      this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
      this.failed.emit(400);
    }
  }

  /**
   * See: https://loiane.com/2017/08/angular-reactive-forms-trigger-validation-on-submit
   * @param formGroup 
   */
  private validateAllFormFields(formGroup: FormGroup): void {

    this.log.trace(`${LOG_PREFIX} Entering validateAllFormFields()`);

    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }


}
