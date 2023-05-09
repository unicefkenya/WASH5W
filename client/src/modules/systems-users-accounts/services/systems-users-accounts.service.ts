import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { Filter } from '@app/app-filter.service';
import { AdministrativeUnitsTypesDataService } from '@modules/administrative-units-types/services/administrative-units-types-data.service';
import { AdministrativeHierarchy } from '@modules/administrative-hierarchies/models/administrative-hierarchy.model';
import { AdministrativeHierarchiesDataService } from '@modules/administrative-hierarchies/services/administrative-hierarchies-data.service';
import { AdministrativeStructure } from '@modules/administrative-structures/models/administrative-structure.model';
import { AdministrativeStructuresDataService } from '@modules/administrative-structures/services/administrative-structures-data.service';
import { AdministrativeSystem } from '@modules/administrative-systems/models/administrative-system.model';
import { AdministrativeSystemsDataService } from '@modules/administrative-systems/services/administrative-systems-data.service';
import { AdministrativeUnitType } from '@modules/administrative-units-types/models/administrative-unit-type.model';
import { AdministrativeUnit } from '@modules/administrative-units/models/administrative-unit.model';
import { AdministrativeUnitsDataService } from '@modules/administrative-units/services/administrative-units-data.service';
import { first } from 'rxjs';
import { AssignedAdministrativeUnitsTypesSelectionDataService } from '@modules/administrative-units-types/services/assigned-administrative-units-types-selection-data.service';
import { AssignedAdministrativeUnitsSelectionDataService } from '@modules/administrative-units/services/assigned-administrative-units-selection-data.service';
import { AssignedAdministrativeSystemsSelectionDataService } from '@modules/administrative-systems/services/assigned-administrative-systems-selection-data.service';
import { AssignedAdministrativeStructuresSelectionDataService } from '@modules/administrative-structures/services/assigned-administrative-structures-selection-data.service';
import { AssignedAdministrativeHierarchiesSelectionDataService } from '@modules/administrative-hierarchies/services/assigned-administrative-hierarchies-selection-data.service';
import { SystemUserRight } from '@modules/systems-users-rights/models/system-user-right.model';
import { ContextsDataService } from '@modules/contexts/services/contexts-data.service';
import { Context } from '@modules/contexts/models/context.model';
import { AuthService } from '@modules/auth/services/auth.service';
import { SystemRole } from '@modules/systems-roles/models/system-role.model';
import { Timestep } from '@modules/timesteps/models/timestep.model';
import { OrganisationsDataService } from '@modules/organisations/services/organisations-data.service';
import { EntitiesDataService } from '@modules/entities/services/entities-data.service';
import { Organisation } from '@modules/organisations/models/organisation.model';
import { Entity } from '@modules/entities/models/entity.model';
import { TimePeriodsDataService } from '@modules/time-periods/services/time-periods-data.service';
import { TimePeriod } from '@modules/time-periods/models';
import { DateUtilService } from '@common/services/date-util.service';
import { TimestepEnum } from '@modules/timesteps/models/timestep.enum';
import { environment } from 'environments/environment';

const LOG_PREFIX: string = "[System Users Accounts Service]";

@Injectable({
  providedIn: 'root'
})
export class SystemsUsersAccountsService {


  constructor(
    private authService: AuthService,
    private contextsDataService: ContextsDataService,
    private administrativeUnitsTypesDataService: AdministrativeUnitsTypesDataService,
    private administrativeUnitsDataService: AdministrativeUnitsDataService,
    private administrativeSystemsDataService: AdministrativeSystemsDataService,
    private administrativeStructuresDataService: AdministrativeStructuresDataService,
    private administrativeHierarchiesDataService: AdministrativeHierarchiesDataService,
    private assignedAdministrativeUnitsTypesSelectionDataService: AssignedAdministrativeUnitsTypesSelectionDataService,
    private assignedAdministrativeUnitsSelectionDataService: AssignedAdministrativeUnitsSelectionDataService,
    private assignedAdministrativeSystemsSelectionDataService: AssignedAdministrativeSystemsSelectionDataService,
    private assignedAdministrativeStructuresSelectionDataService: AssignedAdministrativeStructuresSelectionDataService,
    private assignedAdministrativeHierarchiesSelectionDataService: AssignedAdministrativeHierarchiesSelectionDataService,
    private organisationsDataService: OrganisationsDataService,
    private entitiesDataService: EntitiesDataService,
    private timePeriodsDataService: TimePeriodsDataService,
    private dateUtilService: DateUtilService,
    private log: NGXLogger) {

  }

  /**
   * Prepares the user's account after logging in
   * @param filter the local storage
   * @param callback the function to call once done
   */
  public prepareUserAccountAfterSignIn(filter: Filter, callback: () => void): void {
    this.initialiseAssignedContexts(filter, () => {
      this.initialiseActiveContext(filter, null, () => {
        this.initialiseActiveContextRole(filter, () => {
          this.initialiseTime(filter, () => {
            this.initialiseAssignedLocation(filter, () => {
              this.initialiseGlobalLocation(filter, () => {
                this.initialiseScope(filter, () => {
                  callback();
                })
              })
            })
          })
        })
      })
    })

  }


  /**
 * Prepares the user's account after context switchs
 * @param filter the local storage
 * @param context the incoming context
 * @param callback the function to call once done
 */
  public prepareUserAccountAfterContextSwitch(filter: Filter, context: Context, callback: () => void): void {
    this.initialiseActiveContext(filter, context, () => {
      this.initialiseActiveContextRole(filter, () => {
        this.initialiseTime(filter, () => {
          this.initialiseAssignedLocation(filter, () => {
            this.initialiseScope(filter, () => {
              callback();
            })
          })
        })
      })
    })
  }



  /**
   * Adds the logged in user's entity, location or organisation to the list of active filters
   * @param callback 
   */
  private initialiseScope(filter: Filter, callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseScope()`);

    // Check if the active user has been properly set
    this.log.trace(`${LOG_PREFIX} Checking if the active user has been properly set`);
    if (filter.activeSystemUser && filter.activeSystemUser.data.rights) {

      // The active user has been properly set
      this.log.trace(`${LOG_PREFIX} The active user has been properly set`);

      // Check if the active context has been set
      this.log.trace(`${LOG_PREFIX} Checking if the active context has been set`);
      if (filter.activeContext) {

        // The active context has been set
        this.log.trace(`${LOG_PREFIX} The active context has been set`);

        // Try retrieving the user's rights in the active context
        this.log.trace(`${LOG_PREFIX} Trying to retrieve the user's rights in the active context`);
        const rights: SystemUserRight | undefined = filter.activeSystemUser.data.rights.find(r => r.data.context?.id == filter.activeContext?.id);

        // Check if the the user's rights were successfully retrieved
        this.log.trace(`${LOG_PREFIX} Checking if the the user's rights were successfully retrieved`);
        if (rights) {

          // The user's rights were successfully retrieved
          this.log.trace(`${LOG_PREFIX} The user's rights were successfully retrieved`);

          // Initialise scope based on scope type
          switch (rights.data.scopeType?.id) {
            case 1: // Entity

              this.initialiseActiveSystemUserEntity(filter, rights, () => {
                this.initialiseActiveSystemUserEntityLocation(filter, rights, () => {

                  // Set the active system user location to null
                  this.log.warn(`${LOG_PREFIX} Setting the active system user location to null`);
                  filter.activeSystemUserLocation = null;

                  // Set the active system user organisation to null
                  this.log.warn(`${LOG_PREFIX} Setting the active system user organisation to null`);
                  filter.activeSystemUserOrganisation = null;

                });
              });

              break;

            case 2: // Location

              this.initialiseActiveSystemUserLocation(filter, rights, () => {

                // Set the active system user entity to null
                this.log.warn(`${LOG_PREFIX} Setting the active system user entity to null`);
                filter.activeSystemUserEntity = null;

                // Set the active system user entity location to null
                this.log.warn(`${LOG_PREFIX} Setting the active system user entity location to null`);
                filter.activeSystemUserEntityLocation = null;

                // Set the active system user organisation to null
                this.log.warn(`${LOG_PREFIX} Setting the active system user organisation to null`);
                filter.activeSystemUserOrganisation = null;

              });

              break;

            case 3: // Organisation

              this.initialiseActiveSystemUserOrganisation(filter, rights, () => {

                // Set the active system user entity to null
                this.log.warn(`${LOG_PREFIX} Setting the active system user entity to null`);
                filter.activeSystemUserEntity = null;

                // Set the active system user entity location to null
                this.log.warn(`${LOG_PREFIX} Setting the active system user entity location to null`);
                filter.activeSystemUserEntityLocation = null;

                // Set the active system user location to null
                this.log.warn(`${LOG_PREFIX} Setting the active system user location to null`);
                filter.activeSystemUserLocation = null;

              });

              break;

            default:

              // Unknown Scope Type
              this.log.error(`${LOG_PREFIX} Unknown Scope Type`);

              // Set the active system user's entity to null
              this.log.warn(`${LOG_PREFIX} Setting the active system user's entity to null`);
              filter.activeSystemUserEntity = null;

              // Set the active system user entity location to null
              this.log.warn(`${LOG_PREFIX} Setting the active system user entity location to null`);
              filter.activeSystemUserEntityLocation = null;

              // Set the active system user's location to null
              this.log.warn(`${LOG_PREFIX} Setting the active system user's location to null`);
              filter.activeSystemUserLocation = null;

              // Set the active system user's organisation to null
              this.log.warn(`${LOG_PREFIX} Setting the active system user's organisation to null`);
              filter.activeSystemUserOrganisation = null;

              break;

          }

          // Return
          this.log.trace(`${LOG_PREFIX} Returning`);
          callback();


        } else {

          // The user's rights were not successfully retrieved
          this.log.trace(`${LOG_PREFIX} The user's rights were not successfully retrieved`);

          // Set the active system user's entity to null
          this.log.warn(`${LOG_PREFIX} Setting the active system user's entity to null`);
          filter.activeSystemUserEntity = null;

          // Set the active system user entity location to null
          this.log.warn(`${LOG_PREFIX} Setting the active system user entity location to null`);
          filter.activeSystemUserEntityLocation = null;

          // Set the active system user's location to null
          this.log.warn(`${LOG_PREFIX} Setting the active system user's location to null`);
          filter.activeSystemUserLocation = null;

          // Set the active system user's organisation to null
          this.log.warn(`${LOG_PREFIX} Setting the active system user's organisation to null`);
          filter.activeSystemUserOrganisation = null;

          // Return
          this.log.trace(`${LOG_PREFIX} Returning`);
          callback();
        }


      } else {

        // The active context has not been set
        this.log.error(`${LOG_PREFIX} The active context has not been set`);

        // Set the active system user's entity to null
        this.log.warn(`${LOG_PREFIX} Setting the active system user's entity to null`);
        filter.activeSystemUserEntity = null;

        // Set the active system user's location to null
        this.log.warn(`${LOG_PREFIX} Setting the active system user's location to null`);
        filter.activeSystemUserLocation = null;

        // Set the active system user's organisation to null
        this.log.warn(`${LOG_PREFIX} Setting the active system user's organisation to null`);
        filter.activeSystemUserOrganisation = null;

        // Return
        this.log.trace(`${LOG_PREFIX} Returning`);
        callback();
      }


    } else {

      // The active user has not been properly set
      this.log.error(`${LOG_PREFIX} The active user has not been properly set`);

      // Set the active system user's entity to null
      this.log.warn(`${LOG_PREFIX} Setting the active system user's entity to null`);
      filter.activeSystemUserEntity = null;

      // Set the active system user's location to null
      this.log.warn(`${LOG_PREFIX} Setting the active system user's location to null`);
      filter.activeSystemUserLocation = null;

      // Set the active system user's organisation to null
      this.log.warn(`${LOG_PREFIX} Setting the active system user's organisation to null`);
      filter.activeSystemUserOrganisation = null;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();
    }


  }


  /**
     * Adds the logged in user's entity to the list of active filters
     * @param callback 
     */
  private initialiseActiveSystemUserEntity(filter: Filter, rights: SystemUserRight, callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseActiveSystemUserEntity()`);

    // Check if the user's rights are entity scoped
    this.log.trace(`${LOG_PREFIX} Checking if the user's rights are entity scoped`);
    if (rights.data.scopeType?.id == 1) {

      // The user's rights are entity scoped
      this.log.trace(`${LOG_PREFIX} The user's rights are entity scoped`);

      // Check if the assigned entity id has been specified
      this.log.trace(`${LOG_PREFIX} Checking if the assigned entity id has been specified`);
      if (rights.data.party?.id) {

        // The entity id has been specified
        this.log.trace(`${LOG_PREFIX} The entity id has been specified`);

        // Retrieve the assigned entity
        this.log.trace(`${LOG_PREFIX} Retrieving the assigned entity`);
        this.entitiesDataService.getEntities(false, {
          page: null,
          pageSize: null,
          searchTerm: null,
          sortColumn: null,
          sortDirection: null,
          id: rights.data.party?.id,
          typeId: null,
          locationId: null,
          name: null
        }).subscribe({
          next: (entities: Entity[]) => {

            // Check if the system user entity was successfully retrieved
            this.log.trace(`${LOG_PREFIX} Checking if the system user entity was successfully retrieved`);
            if (entities.length == 1) {

              // The system user entity was successfully retrieved
              this.log.trace(`${LOG_PREFIX} The system user entity was successfully retrieved`);

              // Add the system user entity to the active filters
              this.log.trace(`${LOG_PREFIX} Adding the system user entity to the active filters`);
              filter.activeSystemUserEntity = entities[0];

              // Return
              this.log.trace(`${LOG_PREFIX} Returning`);
              callback();


            } else {

              // The system user entity was not successfully retrieved
              this.log.error(`${LOG_PREFIX} The system user entity was not successfully retrieved`);

              // Set the active system user entity to null
              this.log.warn(`${LOG_PREFIX} Setting the active system user entity to null`);
              filter.activeSystemUserEntity = null;

              // Return
              this.log.trace(`${LOG_PREFIX} Returning`);
              callback();
            }


          },
          error: (err: Error) => {

            // Failed to retrieve the system user entity
            this.log.error(`${LOG_PREFIX} Failed to retrieve the system user entity`);

            // Set the active system user entity to null
            this.log.warn(`${LOG_PREFIX} Setting the active system user entity to null`);
            filter.activeSystemUserEntity = null;

            // Return
            this.log.trace(`${LOG_PREFIX} Returning`);
            callback();
          }

        });


      } else {

        // The entity id has not been specified
        this.log.error(`${LOG_PREFIX} The entity id has not been specified`);

        // Set the active system user entity to null
        this.log.warn(`${LOG_PREFIX} Setting the active system user entity to null`);
        filter.activeSystemUserEntity = null;

        // Return
        this.log.trace(`${LOG_PREFIX} Returning`);
        callback();
      }


    } else {

      // The user's rights are not entity scoped
      this.log.trace(`${LOG_PREFIX} The user's rights are not entity scoped`);

      // Set the active system user entity to null
      this.log.trace(`${LOG_PREFIX} Setting the active system user entity to null`);
      filter.activeSystemUserEntity = null;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();
    }


  }

  /**
     * Adds the logged in user's entity location to the list of active filters
     * @param callback 
     */
  private initialiseActiveSystemUserEntityLocation(filter: Filter, rights: SystemUserRight, callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseActiveSystemUserEntityLocation()`);

    // Check if the user's rights are entity location scoped
    this.log.trace(`${LOG_PREFIX} Checking if the user's rights are entity location scoped`);
    if (rights.data.scopeType?.id == 1) {

      // The user's rights are entity location scoped
      this.log.trace(`${LOG_PREFIX} The user's rights are entity location scoped`);

      // Check if the assigned entity location id has been specified
      this.log.trace(`${LOG_PREFIX} Checking if the assigned entity location id has been specified`);
      if (rights.data.party?.id) {

        // The entity location id has been specified
        this.log.trace(`${LOG_PREFIX} The entity location id has been specified`);

        // Retrieve the assigned entity location
        this.log.trace(`${LOG_PREFIX} Retrieving the assigned entity location`);
        this.administrativeUnitsDataService
          .getAdministrativeUnits(false, {
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            id: rights.data.party?.id,
            typesIds: null,
            name: null
          })
          .pipe(first()) // This will automatically complete (and therefore unsubscribe) after the first value has been emitted.
          .subscribe({
            next: (administrativeUnits: AdministrativeUnit[]) => {

              // Check if the system user entity location was successfully retrieved
              this.log.trace(`${LOG_PREFIX} Checking if the system user entity location was successfully retrieved`);
              if (administrativeUnits.length == 1) {

                // The system user entity location was successfully retrieved
                this.log.trace(`${LOG_PREFIX} The system user entity location was successfully retrieved`);

                // Add the system user entity location to the active filters
                this.log.trace(`${LOG_PREFIX} Adding the system user entity location to the active filters`);
                filter.activeSystemUserEntityLocation = administrativeUnits[0];

                // Return
                this.log.trace(`${LOG_PREFIX} Returning`);
                callback();


              } else {

                // The system user entity location was not successfully retrieved
                this.log.error(`${LOG_PREFIX} The system user entity location was not successfully retrieved`);

                // Set the active system user entity location to null
                this.log.warn(`${LOG_PREFIX} Setting the active system user entity location to null`);
                filter.activeSystemUserEntityLocation = null;

                // Return
                this.log.trace(`${LOG_PREFIX} Returning`);
                callback();
              }


            },
            error: (err: Error) => {

              // Failed to retrieve the system user entity location
              this.log.error(`${LOG_PREFIX} Failed to retrieve the system user entity location`);

              // Set the active system user entity location to null
              this.log.warn(`${LOG_PREFIX} Setting the active system user entity location to null`);
              filter.activeSystemUserEntityLocation = null;

              // Return
              this.log.trace(`${LOG_PREFIX} Returning`);
              callback();
            }

          });


      } else {

        // The entity location id has not been specified
        this.log.error(`${LOG_PREFIX} The entity location id has not been specified`);

        // Set the active system user entity location to null
        this.log.warn(`${LOG_PREFIX} Setting the active system user entity location to null`);
        filter.activeSystemUserEntityLocation = null;

        // Return
        this.log.trace(`${LOG_PREFIX} Returning`);
        callback();
      }


    } else {

      // The user's rights are not entity location scoped
      this.log.trace(`${LOG_PREFIX} The user's rights are not entity location scoped`);

      // Set the active system user entity location to null
      this.log.trace(`${LOG_PREFIX} Setting the active system user entity location to null`);
      filter.activeSystemUserEntityLocation = null;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();
    }


  }


  /**
     * Adds the logged in user's location to the list of active filters
     * @param callback 
     */
  private initialiseActiveSystemUserLocation(filter: Filter, rights: SystemUserRight, callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseActiveSystemUserLocation()`);

    // Check if the user's rights are location scoped
    this.log.trace(`${LOG_PREFIX} Checking if the user's rights are location scoped`);
    if (rights.data.scopeType?.id == 2) {

      // The user's rights are location scoped
      this.log.trace(`${LOG_PREFIX} The user's rights are location scoped`);

      // Check if the assigned location id has been specified
      this.log.trace(`${LOG_PREFIX} Checking if the assigned location id has been specified`);
      if (rights.data.party?.id) {

        // The location id has been specified
        this.log.trace(`${LOG_PREFIX} The location id has been specified`);

        // Retrieve the assigned location
        this.log.trace(`${LOG_PREFIX} Retrieving the assigned location`);
        this.administrativeUnitsDataService
          .getAdministrativeUnits(false, {
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            id: rights.data.party?.id,
            typesIds: null,
            name: null
          })
          .pipe(first()) // This will automatically complete (and therefore unsubscribe) after the first value has been emitted.
          .subscribe({
            next: (administrativeUnits: AdministrativeUnit[]) => {

              // Check if the system user location was successfully retrieved
              this.log.trace(`${LOG_PREFIX} Checking if the system user location was successfully retrieved`);
              if (administrativeUnits.length == 1) {

                // The system user location was successfully retrieved
                this.log.trace(`${LOG_PREFIX} The system user location was successfully retrieved`);

                // Add the system user location to the active filters
                this.log.trace(`${LOG_PREFIX} Adding the system user location to the active filters`);
                filter.activeSystemUserLocation = administrativeUnits[0];

                // Return
                this.log.trace(`${LOG_PREFIX} Returning`);
                callback();


              } else {

                // The system user location was not successfully retrieved
                this.log.error(`${LOG_PREFIX} The system user location was not successfully retrieved`);

                // Set the active system user location to null
                this.log.warn(`${LOG_PREFIX} Setting the active system user location to null`);
                filter.activeSystemUserLocation = null;

                // Return
                this.log.trace(`${LOG_PREFIX} Returning`);
                callback();
              }


            },
            error: (err: Error) => {

              // Failed to retrieve the system user location
              this.log.error(`${LOG_PREFIX} Failed to retrieve the system user location`);

              // Set the active system user location to null
              this.log.warn(`${LOG_PREFIX} Setting the active system user location to null`);
              filter.activeSystemUserLocation = null;

              // Return
              this.log.trace(`${LOG_PREFIX} Returning`);
              callback();
            }

          });


      } else {

        // The location id has not been specified
        this.log.error(`${LOG_PREFIX} The location id has not been specified`);

        // Set the active system user location to null
        this.log.warn(`${LOG_PREFIX} Setting the active system user location to null`);
        filter.activeSystemUserLocation = null;

        // Return
        this.log.trace(`${LOG_PREFIX} Returning`);
        callback();
      }


    } else {

      // The user's rights are not location scoped
      this.log.trace(`${LOG_PREFIX} The user's rights are not location scoped`);

      // Set the active system user location to null
      this.log.trace(`${LOG_PREFIX} Setting the active system user location to null`);
      filter.activeSystemUserLocation = null;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();
    }


  }


  /**
   * Adds the logged in user's organisation to the list of active filters
   * @param callback 
   */
  private initialiseActiveSystemUserOrganisation(filter: Filter, rights: SystemUserRight, callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseActiveSystemUserOrganisation()`);

    // Check if the user's rights are organisation scoped
    this.log.trace(`${LOG_PREFIX} Checking if the user's rights are organisation scoped`);
    if (rights.data.scopeType?.id == 3) {

      // The user's rights are organisation scoped
      this.log.trace(`${LOG_PREFIX} The user's rights are organisation scoped`);

      // Check if the assigned organisation id has been specified
      this.log.trace(`${LOG_PREFIX} Checking if the assigned organisation id has been specified`);
      if (rights.data.party?.id) {

        // The organisation id has been specified
        this.log.trace(`${LOG_PREFIX} The organisation id has been specified`);

        // Retrieve the assigned organisation
        this.log.trace(`${LOG_PREFIX} Retrieving the assigned organisation`);
        this.organisationsDataService.getOrganisations(false, {
          page: null,
          pageSize: null,
          searchTerm: null,
          sortColumn: null,
          sortDirection: null,
          id: rights.data.party?.id,
          typeId: null,
          name: null,
          abbreviation: null
        }).subscribe({
          next: (organisations: Organisation[]) => {

            // Check if the system user organisation was successfully retrieved
            this.log.trace(`${LOG_PREFIX} Checking if the system user organisation was successfully retrieved`);
            if (organisations.length == 1) {

              // The system user organisation was successfully retrieved
              this.log.trace(`${LOG_PREFIX} The system user organisation was successfully retrieved`);

              // Add the system user organisation to the active filters
              this.log.trace(`${LOG_PREFIX} Adding the system user organisation to the active filters`);
              filter.activeSystemUserOrganisation = organisations[0];

              // Return
              this.log.trace(`${LOG_PREFIX} Returning`);
              callback();


            } else {

              // The system user organisation was not successfully retrieved
              this.log.error(`${LOG_PREFIX} The system user organisation was not successfully retrieved`);

              // Set the active system user organisation to null
              this.log.warn(`${LOG_PREFIX} Setting the active system user organisation to null`);
              filter.activeSystemUserOrganisation = null;

              // Return
              this.log.trace(`${LOG_PREFIX} Returning`);
              callback();
            }


          },
          error: (err: Error) => {

            // Failed to retrieve the system user organisation
            this.log.error(`${LOG_PREFIX} Failed to retrieve the system user organisation`);

            // Set the active system user organisation to null
            this.log.warn(`${LOG_PREFIX} Setting the active system user organisation to null`);
            filter.activeSystemUserOrganisation = null;

            // Return
            this.log.trace(`${LOG_PREFIX} Returning`);
            callback();
          }

        });


      } else {

        // The organisation id has not been specified
        this.log.error(`${LOG_PREFIX} The organisation id has not been specified`);

        // Set the active system user organisation to null
        this.log.warn(`${LOG_PREFIX} Setting the active system user organisation to null`);
        filter.activeSystemUserOrganisation = null;

        // Return
        this.log.trace(`${LOG_PREFIX} Returning`);
        callback();
      }


    } else {

      // The user's rights are not organisation scoped
      this.log.trace(`${LOG_PREFIX} The user's rights are not organisation scoped`);

      // Set the active system user organisation to null
      this.log.trace(`${LOG_PREFIX} Setting the active system user organisation to null`);
      filter.activeSystemUserOrganisation = null;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();
    }


  }


  /**
   * Retrieves and adds the Contexts that have been assigned to the logged in user to the local storage
   * @param callback The function to call when done
   */
  private initialiseAssignedContexts(filter: Filter, callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseContexts()`);

    // Check if the active user has been properly set
    this.log.trace(`${LOG_PREFIX} Checking if the active user has been properly set`);
    if (filter.activeSystemUser && filter.activeSystemUser.data.rights) {

      // The active user has been properly set
      this.log.trace(`${LOG_PREFIX} The active user has been properly set`);

      // Check if the active user's rights have been set
      this.log.trace(`${LOG_PREFIX} Checking if the active user's rights have been set`);
      if (filter.activeSystemUser.data.rights.length > 0) {

        // The active user's right have been set
        this.log.trace(`${LOG_PREFIX} The active user's right have been set`);

        // Try retrieving the ids of the contexts that have been assigned to the user
        this.log.trace(`${LOG_PREFIX} Trying to retrieve the ids of the contexts that have been assigned to the user`);
        const ids: number[] | undefined = filter.activeSystemUser?.data.rights?.map(r => r.data.context?.id).filter(this.notEmpty).filter(this.unique);

        // Check if the ids were successfully retrieved
        this.log.trace(`${LOG_PREFIX} Checking if the ids were successfully retrieved`);
        if (ids && ids.length > 0) {

          // The ids were successfully retrieved
          this.log.trace(`${LOG_PREFIX} The ids were successfully retrieved`);

          // Retrieve and cache the identified Contexts records
          this.log.trace(`${LOG_PREFIX} Retrieving and caching the identified Contexts records`);
          this.contextsDataService
            .getContexts(false, {
              searchTerm: null,
              page: null,
              pageSize: null,
              sortColumn: 'id',
              sortDirection: 'asc',
              ids: ids,
              abbreviation: null,
              name: null
            })
            .pipe(first()) // This will automatically complete (and therefore unsubscribe) after the first value has been emitted.
            .subscribe({
              next: (contexts: Context[]) => {

                // Contexts successfully retrieved and cached
                this.log.debug(`${LOG_PREFIX} ${contexts.length} Context(s) retrieved and cached`);

                // Add the assigned contexts to the active filters
                this.log.trace(`${LOG_PREFIX} Adding the assigned contexts to the active filters`);
                filter.assignedContexts = contexts;

                // Return
                this.log.trace(`${LOG_PREFIX} Returning`);
                callback();
              },

              error: (err: any) => {

                // Contexts retrieval failed
                this.log.error(`${LOG_PREFIX} Contexts retrieval failed`);

                // Set the assigned contexts to an empty collection
                this.log.warn(`${LOG_PREFIX} Setting the assigned contexts to an empty collection`);
                filter.assignedContexts = [];

                // Return
                this.log.trace(`${LOG_PREFIX} Returning`);
                callback();
              }
            });

        } else {

          // The ids were not successfully retrieved
          this.log.trace(`${LOG_PREFIX} The ids were not successfully retrieved`);

          // Set the assigned contexts to an empty collection
          this.log.warn(`${LOG_PREFIX} Setting the assigned contexts to an empty collection`);
          filter.assignedContexts = [];

          // Return
          this.log.trace(`${LOG_PREFIX} Returning`);
          callback();
        }




      } else {

        // The active user's right have not been set
        this.log.trace(`${LOG_PREFIX} The active user's right have not been set`);

        // Clear the assigned administrative details
        this.log.warn(`${LOG_PREFIX} Clearing the assigned administrative details`);
        this.clearAssignedLocationDetails(filter);

        // Return
        this.log.trace(`${LOG_PREFIX} Returning`);
        callback();
      }


    } else {

      // The active user has not been properly set
      this.log.error(`${LOG_PREFIX} The active user has not been properly set`);

      // Clear the assigned administrative details
      this.log.warn(`${LOG_PREFIX} Clearing the assigned administrative details`);
      this.clearAssignedLocationDetails(filter);

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();
    }


  }


  /**
   * Sets the default active context to the one that has been passed in or to the last one that has been assigned to the user by default
   * @param callback The function to call when done
   */
  private initialiseActiveContext(filter: Filter, context: Context | null, callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseActiveContext()`);


    // Check if the active user's assigned contexts have been set
    this.log.trace(`${LOG_PREFIX} Checking if the active user's assigned contexts have been set`);
    if (filter.assignedContexts && filter.assignedContexts.length > 0) {

      // The active user's assigned contexts have been set
      this.log.trace(`${LOG_PREFIX} The active user's assigned contexts have been set`);

      // Check if the desired active context has been passed in
      this.log.trace(`${LOG_PREFIX} Checking if the desired active context has been passed in`);
      if (context) {

        // The desired active context has been passed in
        this.log.trace(`${LOG_PREFIX} The desired active context has been passed in`);

      } else {

        // The desired active context has not been passed in
        this.log.trace(`${LOG_PREFIX} The desired active context has not been passed in`);

        // Initialise the desired active context to the last assigned context
        this.log.trace(`${LOG_PREFIX} Initialising the desired active context to the last assigned context`);
        context = filter.assignedContexts.length > 0 ? filter.assignedContexts[filter.assignedContexts.length - 1] : null;
      }


      // Add the desired context to the active filters
      this.log.trace(`${LOG_PREFIX} Adding the desired context to the active filters`);
      this.log.debug(`${LOG_PREFIX} Desired Active Context = ${JSON.stringify(context)}`);
      filter.activeContext = context;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    } else {

      // The active user's assigned contexts have not been set
      this.log.error(`${LOG_PREFIX} The active user's assigned contexts have not been set`);

      // Set the active context to null
      this.log.warn(`${LOG_PREFIX} Setting the active context to null`);
      filter.activeContext = null;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    }

  }


  /**
   * Adds the logged in user's role in the current context to the list of active filters
   * @param callback 
   */
  private initialiseActiveContextRole(filter: Filter, callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseActiveContextRole()`);

    // Check if the active user has been properly set
    this.log.trace(`${LOG_PREFIX} Checking if the active user has been properly set`);
    if (filter.activeSystemUser && filter.activeSystemUser.data.rights) {

      // The active user has been properly set
      this.log.trace(`${LOG_PREFIX} The active user has been properly set`);


      // Check if the active context has been set
      this.log.trace(`${LOG_PREFIX} Checking if the active context has been set`);
      if (filter.activeContext) {

        // The active context has been set
        this.log.trace(`${LOG_PREFIX} The active context has been set`);

        // Try retrieving the active user's role in the active context
        this.log.trace(`${LOG_PREFIX} Trying to retrieve the active user's role in the active context`);
        this.authService.retrieveActiveUsersContextRole(filter.activeSystemUser, filter.activeContext)
          .subscribe({
            next: (systemRole: SystemRole | null) => {

              // Check if the system role was successfully retrieved
              this.log.trace(`${LOG_PREFIX} Checking if the system role was successfully retrieved`);
              if (systemRole) {

                // The system role was successfully retrieved
                this.log.trace(`${LOG_PREFIX} The system role was successfully retrieved`);

                // Add the system role to the active filters
                this.log.trace(`${LOG_PREFIX} Adding the system role to the active filters`);
                filter.activeSystemUserContextSystemRole = systemRole;

                // Return
                this.log.trace(`${LOG_PREFIX} Returning`);
                callback();


              } else {

                // The system role was not successfully retrieved
                this.log.error(`${LOG_PREFIX} The system role was not successfully retrieved`);

                // Set the active system role to null
                this.log.warn(`${LOG_PREFIX} Setting the active system role to null`);
                filter.activeSystemUserContextSystemRole = null;

                // Return
                this.log.trace(`${LOG_PREFIX} Returning`);
                callback();
              }


            },
            error: (err: Error) => {

              // Failed to retrieve the active user's context role
              this.log.error(`${LOG_PREFIX} Failed to retrieve the active user's context role`);

              // Set the active system role to null
              this.log.warn(`${LOG_PREFIX} Setting the active system role to null`);
              filter.activeSystemUserContextSystemRole = null;

              // Return
              this.log.trace(`${LOG_PREFIX} Returning`);
              callback();
            }

          });


      } else {

        // The active context has not been set
        this.log.error(`${LOG_PREFIX} The active context has not been set`);

        // Set the active system role to null
        this.log.warn(`${LOG_PREFIX} Setting the active system role to null`);
        filter.activeSystemUserContextSystemRole = null;

        // Return
        this.log.trace(`${LOG_PREFIX} Returning`);
        callback();
      }


    } else {

      // The active user has not been properly set
      this.log.error(`${LOG_PREFIX} The active user has not been properly set`);

      // Set the active system role to null
      this.log.warn(`${LOG_PREFIX} Setting the active system role to null`);
      filter.activeSystemUserContextSystemRole = null;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();
    }


  }


  private initialiseTime(filter: Filter, callback: () => void): void {

    // Get the Active Context from the Filter
    this.log.trace(`${LOG_PREFIX} Getting the Active Context from the Filter`);
    const activeContext: Context | null | undefined = filter.activeContext;

    // Check if the active context & active context's reporting time steps have been initialised
    this.log.trace(`${LOG_PREFIX} Checking if the active context & active context's reporting time steps have been initialised`);
    if (activeContext && activeContext.data.timestep?.id) {

      // The active context & active context's reporting time steps have been initialised
      this.log.trace(`${LOG_PREFIX} The active context & active context's reporting time steps have been initialised`);

      // Get the Active Context's Reporting Time Steps
      this.log.trace(`${LOG_PREFIX} Getting the Active Context's Reporting Time Steps`);
      let timestep: Timestep = new Timestep(TimestepEnum.getTimestepById(activeContext.data.timestep?.id));
      this.log.debug(`${LOG_PREFIX} Reporting Time Steps = ${JSON.stringify(timestep)}`);

      // Get the Active Context's last Reporting Period
      this.log.trace(`${LOG_PREFIX} Getting the Active Context's last Reporting Period`);
      this.getContextLastReportingPeriod(activeContext, timestep, (reportingPeriods: TimePeriod[]) => {

        // Get the last day of the last period; or just today if it null
        const last: string = reportingPeriods.length > 0 && reportingPeriods[0].data.end ? reportingPeriods[0].data.end : this.dateUtilService.getNow();

        // Initialise the first, second and third time periods based on the availability of reporting periods
        this.log.trace(`${LOG_PREFIX} Initialising the first, second and third time periods based on the availability of reporting periods`);
        let first: TimePeriod | null;
        let second: TimePeriod | null;
        let third: TimePeriod | null;

          // Init the third period
          let period: { start: string; end: string } = this.dateUtilService.getCurrent(last, TimestepEnum.getTimestepById(timestep.id as number), environment.year === 'fiscal' ? 'fiscal' : 'calendar')

          // Use the current date to initialise a period that spans from a previous date to the current date based on the target timestep
          third = new TimePeriod({
            data: {
              contextId: activeContext.id,
              typeId: timestep?.id,
              start: period.start,
              end: period.end,
              open: true
            }
          });

        this.log.debug(`${LOG_PREFIX} Third Time Interval = ${JSON.stringify(third)}`);

          // Initialise the second time period to an equidistant value from the third step
          this.log.trace(`${LOG_PREFIX} Initialising the second time period to an equidistant value from the third step`);

          // Init the second period
          period  = this.dateUtilService.getPrevious(third.data.start, TimestepEnum.getTimestepById(timestep.id as number), environment.year === 'fiscal' ? 'fiscal' : 'calendar')

          second = new TimePeriod({
            data: {
              contextId: activeContext.id,
              typeId: timestep?.id,
              start: period.start,
              end: period.end,
              open: true
            }
          });

        this.log.debug(`${LOG_PREFIX} Second Time Interval = ${JSON.stringify(second)}`);

          // Initialise the first time period to an equidistant value from the third step
          this.log.trace(`${LOG_PREFIX} Initialising the first time period to an equidistant value from the second step`);

          // Init the first period
          period = this.dateUtilService.getPrevious(second.data.start, TimestepEnum.getTimestepById(timestep.id as number), environment.year === 'fiscal' ? 'fiscal' : 'calendar')

          first = new TimePeriod({
            data: {
              contextId: activeContext.id,
              typeId: timestep?.id,
              start: period.start,
              end: period.end,
              open: true
            }
          });

        this.log.debug(`${LOG_PREFIX} First Time Interval = ${JSON.stringify(first)}`);

        filter.activeTimeIntervalStart = this.dateUtilService.formatDate(third.data.start, "short");
        filter.activeTimeIntervalEnd = this.dateUtilService.formatDate(third.data.end, "short");
        filter.activeTimeIntervalSteps = timestep;
        filter.activeTimeIntervals = [
          {
            start: this.dateUtilService.formatDate(first.data.start, "short"),
            end: this.dateUtilService.formatDate(first.data.end, "short"),
            title: this.dateUtilService.getIntervalDescriptor(first.data.start, first.data.end, TimestepEnum.getTimestepById(timestep.id as number), environment.year === 'fiscal' ? 'fiscal' : 'calendar')
          },
          {
            start: this.dateUtilService.formatDate(second.data.start, "short"),
            end: this.dateUtilService.formatDate(second.data.end, "short"),
            title: this.dateUtilService.getIntervalDescriptor(second.data.start, second.data.end, TimestepEnum.getTimestepById(timestep.id as number), environment.year === 'fiscal' ? 'fiscal' : 'calendar')
          },
          {
            start: this.dateUtilService.formatDate(third.data.start, "short"),
            end: this.dateUtilService.formatDate(third.data.end, "short"),
            title: this.dateUtilService.getIntervalDescriptor(third.data.start, third.data.end, TimestepEnum.getTimestepById(timestep.id as number), environment.year === 'fiscal' ? 'fiscal' : 'calendar')
          }
        ];

        // Transfer control to the callback function
        callback();

      });

    } else {

      // The active context & active context's reporting time steps have not been initialised
      this.log.error(`${LOG_PREFIX} The active context & active context's reporting time steps have not been initialised`);

      // Skipping Time Periods initialization
      this.log.warn(`${LOG_PREFIX} Skipping Time Periods initialization`);

      // Transfer control to the callback function
      callback();
    }

  }


  private getContextLastReportingPeriod(context: Context, timestep: Timestep, callback: (reportingPeriods: TimePeriod[]) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering getContextLastReportingPeriod()`);

    this.timePeriodsDataService.getTimePeriods(false, {
      searchTerm: null,
      page: 1,
      pageSize: 1,
      sortColumn: 'id',
      sortDirection: 'desc',
      contextId: context.id,
      open: null,
      id: null
    }).subscribe({
      next: (reportingPeriods: TimePeriod[]) => {

        this.log.trace(`${LOG_PREFIX} Reporting Periods retrieval successfully completed`);
        this.log.debug(`${LOG_PREFIX} Reporting Periods = ${JSON.stringify(reportingPeriods)}`);

        // Return the retrieved time periods
        callback(reportingPeriods);

      },
      error: (err: any) => {

        this.log.error(`${LOG_PREFIX} Reporting Periods retrieval not successfully completed`);

        // Return an empty collection
        this.log.warn(`${LOG_PREFIX} Returning an empty collection`);
        callback([]);

      }
    });
  }



  private initialiseAssignedLocation(filter: Filter, callback: () => void): void {

    // Check if the active user has been properly set
    this.log.trace(`${LOG_PREFIX} Checking if the active user has been properly set`);
    if (filter.activeSystemUser && filter.activeSystemUser.data.rights) {

      // The active user has been properly set
      this.log.trace(`${LOG_PREFIX} The active user has been properly set`);

      // Check if the active user's rights have been set
      this.log.trace(`${LOG_PREFIX} Checking if the active user's rights have been set`);
      if (filter.activeSystemUser.data.rights.length > 0) {

        // The active user's right have been set
        this.log.trace(`${LOG_PREFIX} The active user's right have been set`);

        // Check if the active context has been set
        this.log.trace(`${LOG_PREFIX} Checking if the active context has been set`);
        if (filter.activeContext) {

          // The active context has been set
          this.log.trace(`${LOG_PREFIX} The active context has been set`);

          // Try retrieving the user's right in the active context
          this.log.trace(`${LOG_PREFIX} Trying to retrieve the user's right in the active context`);
          const right: SystemUserRight | undefined = filter.activeSystemUser.data.rights.find(r => r.data.context?.id == filter.activeContext?.id);

          // Check if the user's right in the active context was successfully retrieved
          this.log.trace(`${LOG_PREFIX} Checking if the user's right in the active context was successfully retrieved`);
          if (right) {

            // The user's right in the active context was successfully retrieved
            this.log.trace(`${LOG_PREFIX} The user's right in the active context was successfully retrieved`);

            // Check if the user's right is locational
            this.log.trace(`${LOG_PREFIX} Checking if the user's right is locational`);
            if (right.data.scopeType?.id == 2) {

              // The user's right is locational
              this.log.trace(`${LOG_PREFIX} The user's right is locational`);

              this.initialiseActiveAssignedAdministrativeSystem(filter, right, () => {
                this.initialiseActiveAssignedAdministrativeStructures(filter, right, () => {
                  this.initialiseActiveAssignedAdministrativeHierarchy(filter, right, () => {
                    this.initialiseActiveAssignedAdministrativeUnit(filter, right, () => {
                      this.initialiseActiveAssignedAdministrativeUnitType(filter, () => {
                        callback();
                      })
                    })
                  })
                })
              })

            } else {

              // The user's right is not locational
              this.log.trace(`${LOG_PREFIX} The user's right is not locational`);


              // Clear the assigned administrative details
              this.log.warn(`${LOG_PREFIX} Clearing the assigned administrative details`);
              this.clearAssignedLocationDetails(filter);

              // Return
              this.log.trace(`${LOG_PREFIX} Returning`);
              callback();
            }

          } else {

            // The user's right in the active context was not successfully retrieved
            this.log.trace(`${LOG_PREFIX} The user's right in the active context was not successfully retrieved`);


            // Clear the assigned administrative details
            this.log.warn(`${LOG_PREFIX} Clearing the assigned administrative details`);
            this.clearAssignedLocationDetails(filter);

            // Return
            this.log.trace(`${LOG_PREFIX} Returning`);
            callback();
          }


        } else {

          // The active context has not been set
          this.log.error(`${LOG_PREFIX} The active context has not been set`);

          // Clear the assigned administrative details
          this.log.warn(`${LOG_PREFIX} Clearing the assigned administrative details`);
          this.clearAssignedLocationDetails(filter);

          // Return
          this.log.trace(`${LOG_PREFIX} Returning`);
          callback();
        }




      } else {

        // The active user's right have not been set
        this.log.trace(`${LOG_PREFIX} The active user's right have not been set`);

        // Clear the assigned administrative details
        this.log.warn(`${LOG_PREFIX} Clearing the assigned administrative details`);
        this.clearAssignedLocationDetails(filter);

        // Return
        this.log.trace(`${LOG_PREFIX} Returning`);
        callback();
      }


    } else {

      // The active user has not been properly set
      this.log.error(`${LOG_PREFIX} The active user has not been properly set`);

      // Clear the assigned administrative details
      this.log.warn(`${LOG_PREFIX} Clearing the assigned administrative details`);
      this.clearAssignedLocationDetails(filter);

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();
    }




  }

  private initialiseActiveAssignedAdministrativeSystem(filter: Filter, right: SystemUserRight, callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseActiveAssignedAdministrativeSystem()`);

    // Check if the id of the assigned Administrative System has been provided
    this.log.trace(`${LOG_PREFIX} Checking if the id of the assigned Administrative System has been provided`);
    if (right.data.accountabilitySystem?.id) {

      // The id of the assigned Administrative System has been provided
      this.log.trace(`${LOG_PREFIX} The id of the assigned Administrative System has been provided`);

      // Try retrieving the Administrative System record with the specified id
      this.log.trace(`${LOG_PREFIX} Try retrieve the Administrative System record with the specified id`);
      this.assignedAdministrativeSystemsSelectionDataService
        .getAdministrativeSystems(true, {
          searchTerm: null,
          page: null,
          pageSize: null,
          sortColumn: null,
          sortDirection: null,
          id: right.data.accountabilitySystem?.id,
          name: null
        })
        .pipe(first()) // This will automatically complete (and therefore unsubscribe) after the first value has been emitted.
        .subscribe({
          next: (administrativeSystems: AdministrativeSystem[]) => {

            // Administrative System retrieval completed
            this.log.trace(`${LOG_PREFIX} Administrative System retrieval completed`);
            this.log.debug(`${LOG_PREFIX} Retrieved Administrative System = ${administrativeSystems.length > 0 ? JSON.stringify(administrativeSystems[0]) : null}`);

            // Set the retrieved Administrative System as assigned Administrative System
            this.log.trace(`${LOG_PREFIX} Setting the retrieved Administrative System as assigned Administrative System`);
            filter.activeAssignedAdministrativeSystem = administrativeSystems.length > 0 ? administrativeSystems[0] : null;

            // Return
            this.log.trace(`${LOG_PREFIX} Returning`);
            callback();
          },

          error: () => {

            // Administrative System retrieval failed
            this.log.error(`${LOG_PREFIX} Administrative System retrieval failed`);

            // Set the active assigned Administrative System to null
            this.log.warn(`${LOG_PREFIX} Setting the active assigned Administrative System to null`);
            filter.activeAssignedAdministrativeSystem = null;

            // Return
            this.log.trace(`${LOG_PREFIX} Returning`);
            callback();
          }
        });

    } else {

      // The id of the assigned Administrative System has not been provided
      this.log.error(`${LOG_PREFIX} The id of the assigned Administrative System has not been provided`);

      // Set the active assigned Administrative System to null
      this.log.warn(`${LOG_PREFIX} Setting the active assigned Administrative System to null`);
      filter.activeAssignedAdministrativeSystem = null;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    }

  }

  private initialiseActiveAssignedAdministrativeStructures(filter: Filter, right: SystemUserRight, callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseActiveAssignedAdministrativeStructures()`);

    // Check if the active assigned Administrative System has been set 
    this.log.trace(`${LOG_PREFIX} Checking if the active assigned Administrative System has been set `);
    if (filter.activeAssignedAdministrativeSystem?.id) {

      // The active assigned Administrative System has been set 
      this.log.trace(`${LOG_PREFIX} The active assigned Administrative System has been set `);

      // Check if the id of the assigned Administrative Structure has been provided
      this.log.trace(`${LOG_PREFIX} Checking if the id of the assigned Administrative Structure has been provided`);
      if (right.data.accountabilityType?.id) {

        // The id of the assigned Administrative Structure has been provided
        this.log.trace(`${LOG_PREFIX} The id of the assigned Administrative Structure has been provided`);

        // Try retrieving all the Administrative Structures that belong to the active assigned Administrative System
        this.log.trace(`${LOG_PREFIX} Trying to retrieve all the Administrative Structures that belong to the active assigned Administrative System`);
        this.assignedAdministrativeStructuresSelectionDataService
          .getAdministrativeStructures(true, {
            searchTerm: null,
            page: null,
            pageSize: null,
            sortColumn: 'id',
            sortDirection: 'asc',
            hierarchyId: filter.activeAssignedAdministrativeSystem?.id,
            hierarchyName: null,
            commissionerId: null,
            commissionerName: null,
            responsibleId: null,
            responsibleName: null
          })
          .pipe(first()) // This will automatically complete (and therefore unsubscribe) after the first value has been emitted.
          .subscribe({
            next: (administrativeStructures: AdministrativeStructure[]) => {

              // Administrative Structures retrieval completed
              this.log.trace(`${LOG_PREFIX} Administrative Structures retrieval completed`);
              this.log.debug(`${LOG_PREFIX} ${administrativeStructures.length} Administrative Structures Retrieved`);

              // Get the assigned top level Administrative Structure
              this.log.trace(`${LOG_PREFIX} Getting the assigned top level Administrative Structure`);
              const parent: AdministrativeStructure | undefined = administrativeStructures.find(a => a.id == right.data.accountabilityType?.id);
              this.log.debug(`${LOG_PREFIX} Assigned top level Administrative Structure = ${JSON.stringify(parent)}`);

              // Clear the assigned top level Administrative Structure's parent if it exists
              this.log.trace(`${LOG_PREFIX} Clearing the assigned top level Administrative Structure's parent if it exists`);
              if (parent && parent.data.commissioner) {
                parent.data.commissioner.id = null;
                parent.data.commissioner.name = null;
              }

              // Get the assigned top level Administrative Structure's subsidiaries
              this.log.trace(`${LOG_PREFIX} Getting the assigned top level Administrative Structure's subsidiaries`);
              const subsidiaries: AdministrativeStructure[] = parent ? this.findStructuralChildren(parent.id, administrativeStructures, []) : [];

              // Concatenate the assigned top level Administrative Structure and its subsidiaries and set them as the active assigned Administrative Structures
              this.log.trace(`${LOG_PREFIX} Concatenating the assigned top level Administrative Structure and its subsidiaries and setting them as the active assigned Administrative Structures`);
              filter.activeAssignedAdministrativeStructures = parent ? [parent].concat(subsidiaries) : [];
              this.log.trace(`${LOG_PREFIX} Active assigned Administrative Structures records = ${JSON.stringify(filter.activeAssignedAdministrativeStructures)}`);

              // Return
              this.log.trace(`${LOG_PREFIX} Returning`);
              callback();
            },

            error: () => {

              // Administrative Structures retrieval failed
              this.log.error(`${LOG_PREFIX} Administrative Structures retrieval failed`);


              // Clear the active assigned Administrative Structures
              this.log.warn(`${LOG_PREFIX} Clearing the active assigned Administrative Structures`);
              filter.activeAssignedAdministrativeStructures.length = 0;

              // Return
              this.log.trace(`${LOG_PREFIX} Returning`);
              callback();
            }
          });

      } else {

        // The id of the assigned Administrative Structure has not been provided
        this.log.error(`${LOG_PREFIX} The id of the assigned Administrative Structure has not been provided`);

        // Clear the active assigned Administrative Structures
        this.log.warn(`${LOG_PREFIX} Clearing the active assigned Administrative Structures`);
        filter.activeAssignedAdministrativeStructures.length = 0;

        // Return
        this.log.trace(`${LOG_PREFIX} Returning`);
        callback();

      }

    } else {

      // The active assigned Administrative System has not been set 
      this.log.error(`${LOG_PREFIX} The active assigned Administrative System has not been set `);


      // Clear the active assigned Administrative Structures
      this.log.warn(`${LOG_PREFIX} Clearing the active assigned Administrative Structures`);
      filter.activeAssignedAdministrativeStructures.length = 0;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    }

  }

  private initialiseActiveAssignedAdministrativeHierarchy(filter: Filter, right: SystemUserRight, callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseActiveAssignedAdministrativeHierarchy()`);

    // Check if the id of the assigned Administrative Hierarchy has been provided
    this.log.trace(`${LOG_PREFIX} Checking if the id of the assigned Administrative Hierarchy has been provided`);
    if (right.data.accountability?.id) {

      // The id of the assigned Administrative Hierarchy has been provided
      this.log.trace(`${LOG_PREFIX} The id of the assigned Administrative Hierarchy has been provided`);

      // Try retrieving the Administrative Hierarchy record with the specified id
      this.log.trace(`${LOG_PREFIX} Try retrieve the Administrative Hierarchy record with the specified id`);
      this.assignedAdministrativeHierarchiesSelectionDataService
        .getAdministrativeHierarchies(true, {
          searchTerm: null,
          page: null,
          pageSize: null,
          sortColumn: null,
          sortDirection: null,
          id: right.data.accountability?.id,
          typesIds: null,
          commissionerId: null,
          commissionerName: null,
          responsibleId: null,
          responsibleName: null
        })
        .pipe(first()) // This will automatically complete (and therefore unsubscribe) after the first value has been emitted.
        .subscribe({
          next: (administrativeHierarchies: AdministrativeHierarchy[]) => {

            // Administrative Hierarchy retrieval completed
            this.log.trace(`${LOG_PREFIX} Administrative Hierarchy retrieval completed`);
            this.log.debug(`${LOG_PREFIX} Retrieved Administrative Hierarchy = ${administrativeHierarchies.length > 0 ? JSON.stringify(administrativeHierarchies[0]) : null}`);

            // Set the retrieved Administrative Hierarchy as assigned Administrative Hierarchy
            this.log.trace(`${LOG_PREFIX} Setting the retrieved Administrative Hierarchy as assigned Administrative Hierarchy`);
            filter.activeAssignedAdministrativeHierarchy = administrativeHierarchies.length > 0 ? administrativeHierarchies[0] : null;

            // Return
            this.log.trace(`${LOG_PREFIX} Returning`);
            callback();
          },

          error: () => {

            // Administrative Hierarchy retrieval failed
            this.log.error(`${LOG_PREFIX} Administrative Hierarchy retrieval failed`);

            // Set the active assigned Administrative Hierarchy to null
            this.log.warn(`${LOG_PREFIX} Setting the active assigned Administrative Hierarchy to null`);
            filter.activeAssignedAdministrativeHierarchy = null;

            // Return
            this.log.trace(`${LOG_PREFIX} Returning`);
            callback();
          }
        });

    } else {

      // The id of the assigned Administrative Hierarchy has not been provided
      this.log.error(`${LOG_PREFIX} The id of the assigned Administrative Hierarchy has not been provided`);

      // Set the active assigned Administrative Hierarchy to null
      this.log.warn(`${LOG_PREFIX} Setting the active assigned Administrative Hierarchy to null`);
      filter.activeAssignedAdministrativeHierarchy = null;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    }

  }

  private initialiseActiveAssignedAdministrativeUnit(filter: Filter, right: SystemUserRight, callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseActiveAssignedAdministrativeUnit()`);

    // Check if the id of the assigned Administrative Unit has been provided
    this.log.trace(`${LOG_PREFIX} Checking if the id of the assigned Administrative Unit has been provided`);
    if (right.data.party?.id) {

      // The id of the assigned Administrative Unit has been provided
      this.log.trace(`${LOG_PREFIX} The id of the assigned Administrative Unit has been provided`);

      // Try retrieving the Administrative Unit record with the specified id
      this.log.trace(`${LOG_PREFIX} Try retrieve the Administrative Unit record with the specified id`);
      this.assignedAdministrativeUnitsSelectionDataService
        .getAdministrativeUnits(true, {
          page: null,
          pageSize: null,
          searchTerm: null,
          sortColumn: null,
          sortDirection: null,
          id: right.data.party?.id,
          typesIds: null,
          name: null
        })
        .pipe(first()) // This will automatically complete (and therefore unsubscribe) after the first value has been emitted.
        .subscribe({
          next: (administrativeUnits: AdministrativeUnit[]) => {

            // Administrative Unit retrieval completed
            this.log.trace(`${LOG_PREFIX} Administrative Unit retrieval completed`);
            this.log.debug(`${LOG_PREFIX} Retrieved Administrative Unit = ${administrativeUnits.length > 0 ? JSON.stringify(administrativeUnits[0]) : null}`);

            // Set the retrieved Administrative Unit as assigned Administrative Unit
            this.log.trace(`${LOG_PREFIX} Setting the retrieved Administrative Unit as assigned Administrative Unit`);
            filter.activeAssignedAdministrativeUnit = administrativeUnits.length > 0 ? administrativeUnits[0] : null;

            // Return
            this.log.trace(`${LOG_PREFIX} Returning`);
            callback();
          },

          error: () => {

            // Administrative Unit retrieval failed
            this.log.error(`${LOG_PREFIX} Administrative Unit retrieval failed`);

            // Set the active assigned Administrative Unit to null
            this.log.warn(`${LOG_PREFIX} Setting the active assigned Administrative Unit to null`);
            filter.activeAssignedAdministrativeUnit = null;

            // Return
            this.log.trace(`${LOG_PREFIX} Returning`);
            callback();
          }
        });

    } else {

      // The id of the assigned Administrative Unit has not been provided
      this.log.error(`${LOG_PREFIX} The id of the assigned Administrative Unit has not been provided`);

      // Set the active assigned Administrative Unit to null
      this.log.warn(`${LOG_PREFIX} Setting the active assigned Administrative Unit to null`);
      filter.activeAssignedAdministrativeUnit = null;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    }

  }

  private initialiseActiveAssignedAdministrativeUnitType(filter: Filter, callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseActiveAdministrativeUnitType()`);


    // Check if the active assigned Administrative Unit has been set 
    this.log.trace(`${LOG_PREFIX} Checking if the active assigned Administrative Unit has been set`);
    if (filter.activeAssignedAdministrativeUnit) {

      // The active assigned Administrative Unit has been set 
      this.log.trace(`${LOG_PREFIX} The active assigned Administrative Unit has been set`);

      // Try to retrieve the Administrative Unit's Type
      this.log.trace(`${LOG_PREFIX} Trying to retrieve the Administrative Unit's Type`);
      this.assignedAdministrativeUnitsTypesSelectionDataService
        .getAdministrativeUnitsTypes(true, {
          page: null,
          pageSize: null,
          searchTerm: null,
          sortColumn: 'id',
          sortDirection: 'asc',
          id: filter.activeAssignedAdministrativeUnit.data.typeId,
          name: null,
          plural: null
        })
        .pipe(first()) // This will automatically complete (and therefore unsubscribe) after the first value has been emitted.
        .subscribe({
          next: (administrativeUnitsTypes: AdministrativeUnitType[]) => {

            // Administrative Unit Type retrieval completed
            this.log.trace(`${LOG_PREFIX} Administrative Unit Type retrieval completed`);
            this.log.debug(`${LOG_PREFIX} Retrieved Administrative Unit Type = ${administrativeUnitsTypes.length > 0 ? JSON.stringify(administrativeUnitsTypes[0]) : null}`);

            // Set the retrieved Administrative Unit Type as assigned Administrative Unit Type
            this.log.trace(`${LOG_PREFIX} Setting the retrieved Administrative Unit Type as assigned Administrative Unit Type`);
            filter.activeAssignedAdministrativeUnitType = administrativeUnitsTypes.length > 0 ? administrativeUnitsTypes[0] : null;

            // Return
            this.log.trace(`${LOG_PREFIX} Returning`);
            callback();
          },

          error: () => {

            // Administrative Units Types retrieval failed
            this.log.error(`${LOG_PREFIX} Administrative Units Types retrieval failed`);

            // Set the active assigned Administrative Unit Type to null
            this.log.warn(`${LOG_PREFIX} Setting the active assigned Administrative Unit Type to null`);
            filter.activeAssignedAdministrativeUnitType = null;

            // Return
            this.log.trace(`${LOG_PREFIX} Returning`);
            callback();
          }
        });

    } else {

      // The active assigned Administrative Unit has not been set 
      this.log.trace(`${LOG_PREFIX} The active assigned Administrative Unit has not been set`);

      // Set the active assigned Administrative Unit Type to null
      this.log.warn(`${LOG_PREFIX} Setting the active assigned Administrative Unit Type to null`);
      filter.activeAssignedAdministrativeUnitType = null;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();
    }

  }

  private initialiseGlobalLocation(filter: Filter, callback: () => void): void {
    this.initialiseActiveGlobalAdministrativeSystem(filter, () => {
      this.initialiseActiveGlobalAdministrativeStructure(filter, () => {
        this.initialiseActiveGlobalAdministrativeHierarchy(filter, () => {
          this.initialiseActiveGlobalAdministrativeUnit(filter, () => {
            this.initialiseActiveGlobalAdministrativeUnitType(filter, () => {
              callback();
            })
          })
        })
      })
    })
  }


  private initialiseActiveGlobalAdministrativeSystem(filter: Filter, callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseActiveAdministrativeSystem()`);

    // Retrieve and cache all the Administrative Systems records
    this.log.trace(`${LOG_PREFIX} Retrieving and caching all the Administrative Systems records`);
    this.administrativeSystemsDataService
      .getAdministrativeSystems(true, {
        searchTerm: null,
        page: null,
        pageSize: null,
        sortColumn: 'id',
        sortDirection: 'asc',
        id: null,
        name: null
      })
      .pipe(first()) // This will automatically complete (and therefore unsubscribe) after the first value has been emitted.
      .subscribe({
        next: (administrativeSystems: AdministrativeSystem[]) => {

          // Administrative Systems successfully retrieved and cached
          this.log.debug(`${LOG_PREFIX} ${administrativeSystems.length} Administrative Systems retrieved and cached`);

          // Get and set the first Administrative System as the default active Administrative System
          this.log.trace(`${LOG_PREFIX} Getting and setting the first Administrative System as the default active Administrative System`);
          filter.activeAdministrativeSystem = this.administrativeSystemsDataService.records[0];
          this.log.trace(`${LOG_PREFIX} Active Administrative System = ${JSON.stringify(filter.activeAdministrativeSystem)}`);

          // Return
          this.log.trace(`${LOG_PREFIX} Returning`);
          callback();
        },

        error: () => {

          // Administrative Structures retrieval failed
          this.log.error(`${LOG_PREFIX} Administrative Structures retrieval failed`);

          // Return
          this.log.trace(`${LOG_PREFIX} Returning`);
          callback();
        }
      });

  }

  private initialiseActiveGlobalAdministrativeStructure(filter: Filter, callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseActiveAdministrativeStructure()`);

    // Check if the target Administrative System has been set 
    this.log.trace(`${LOG_PREFIX} Checking if the target Administrative System has been set`);
    if (filter.activeAdministrativeSystem?.id) {

      // The target global Administrative System has been set 
      this.log.trace(`${LOG_PREFIX} The target global Administrative System has been set`);

      // Retrieve and cache all the Administrative Structures that belong to the default selected Administrative System
      this.log.trace(`${LOG_PREFIX} Retrieving and caching all the Administrative Structures that belong to the default selected Administrative System`);
      this.administrativeStructuresDataService
        .getAdministrativeStructures(true, {
          searchTerm: null,
          page: null,
          pageSize: null,
          sortColumn: 'id',
          sortDirection: 'asc',
          hierarchyId: filter.activeAdministrativeSystem?.id,
          hierarchyName: null,
          commissionerId: null,
          commissionerName: null,
          responsibleId: null,
          responsibleName: null
        })
        .pipe(first()) // This will automatically complete (and therefore unsubscribe) after the first value has been emitted.
        .subscribe({
          next: (administrativeStructures: AdministrativeStructure[]) => {

            // Administrative Structures successfully retrieved and cached
            this.log.debug(`${LOG_PREFIX} ${administrativeStructures.length} Administrative Structures retrieved and cached`);

            // Get and set the top level Administrative Structures as the default selected Administrative Structures
            this.log.trace(`${LOG_PREFIX} Getting and setting the top level Administrative Structures as the default selected Administrative Structures`);
            filter.activeAdministrativeStructures = this.administrativeStructuresDataService.records.filter(a => a.data?.commissioner?.id == null);
            this.log.trace(`${LOG_PREFIX} Top level Administrative Structures records = ${JSON.stringify(filter.activeAdministrativeStructures)}`);

            // Return
            this.log.trace(`${LOG_PREFIX} Returning`);
            callback();
          },

          error: () => {

            // Administrative Structures retrieval failed
            this.log.error(`${LOG_PREFIX} Administrative Structures retrieval failed`);

            // Return
            this.log.trace(`${LOG_PREFIX} Returning`);
            callback();
          }
        });

    } else {

      // The target global Administrative System has not been set 
      this.log.trace(`${LOG_PREFIX} The target global Administrative System has not been set`);

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    }



  }

  private initialiseActiveGlobalAdministrativeHierarchy(filter: Filter, callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseActiveAdministrativeHierarchy()`);

    // Check if the target Administrative Structures have been set 
    this.log.trace(`${LOG_PREFIX} Checking if the target Administrative Structures have been set`);
    if (filter.activeAdministrativeStructures && filter.activeAdministrativeStructures.length > 0) {

      // The target global Administrative Structures have been set 
      this.log.trace(`${LOG_PREFIX} The target global Administrative Structures have been set`);

      // Get the id of the first administrative structure
      this.log.trace(`${LOG_PREFIX} Getting the id of the first administrative structure`);
      const administrativeStructureId: number | null = filter.activeAdministrativeStructures ? filter.activeAdministrativeStructures[0].id : null;

      // Check if the id of the first administrative structure was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the id of the first administrative structure was successfully retrieved`);
      if (administrativeStructureId) {

        // The id of the first administrative structure was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The id of the first administrative structure was successfully retrieved`);

        // Retrieve and cache all the Administrative Hierarchies that belong to the default selected Administrative Structure
        this.log.trace(`${LOG_PREFIX} Retrieving and caching all the Administrative Hierarchies that belong to the default selected Administrative Structure`);
        this.administrativeHierarchiesDataService
          .getAdministrativeHierarchies(true, {
            searchTerm: null,
            page: null,
            pageSize: null,
            sortColumn: 'id',
            sortDirection: 'asc',
            id: null,
            typesIds: [administrativeStructureId],
            commissionerId: null,
            commissionerName: null,
            responsibleId: null,
            responsibleName: null
          })
          .pipe(first()) // This will automatically complete (and therefore unsubscribe) after the first value has been emitted.
          .subscribe({
            next: (administrativeHierarchies: AdministrativeHierarchy[]) => {

              // Administrative Hierarchies successfully retrieved and cached
              this.log.debug(`${LOG_PREFIX} ${administrativeHierarchies.length} Administrative Hierarchies retrieved and cached`);

              // Get and set the first Administrative Hierarchy as the default selected Administrative Hierarchy
              this.log.trace(`${LOG_PREFIX} Getting and setting the first Administrative Hierarchy as the default selected Administrative Hierarchy`);
              filter.activeAdministrativeHierarchy = administrativeHierarchies[0];
              this.log.trace(`${LOG_PREFIX} Active Administrative Hierarchy = ${JSON.stringify(filter.activeAdministrativeHierarchy)}`);

              // Return
              this.log.trace(`${LOG_PREFIX} Returning`);
              callback();
            },

            error: () => {

              // Administrative Hierarchies retrieval failed
              this.log.error(`${LOG_PREFIX} Administrative Hierarchies retrieval failed`);

              // Return
              this.log.trace(`${LOG_PREFIX} Returning`);
              callback();
            }
          });


      } else {

        // The id of the first administrative structure was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The id of the first administrative structure was not successfully retrieved`);

        // Administrative Structures retrieval failed
        this.log.error(`${LOG_PREFIX} Administrative Structures retrieval failed`);

        // Return
        this.log.trace(`${LOG_PREFIX} Returning`);
        callback();

      }

    } else {

      // The target global Administrative Structures have not been set 
      this.log.trace(`${LOG_PREFIX} The target global Administrative Structures have not been set`);

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();
    }

  }

  private initialiseActiveGlobalAdministrativeUnit(filter: Filter, callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseActiveAdministrativeUnit()`);

    // Check if the target Administrative Hierarchy has been set 
    this.log.trace(`${LOG_PREFIX} Checking if the target Administrative Hierarchy has been set`);
    if (filter.activeAdministrativeHierarchy) {

      // The target global Administrative Hierarchy has been set 
      this.log.trace(`${LOG_PREFIX} The target global Administrative Hierarchy has been set`);

      // Get the target Administrative Hierarchy
      this.log.trace(`${LOG_PREFIX} Getting the target Administrative Hierarchy`);
      const administrativeHierarchy: AdministrativeHierarchy | null = filter.activeAdministrativeHierarchy ? filter.activeAdministrativeHierarchy : null;

      // Check if the Administrative Hierarchy was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the Administrative Hierarchy was successfully retrieved`);
      if (administrativeHierarchy) {

        // The Administrative Hierarchy was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Administrative Hierarchy was successfully retrieved`);

        // Retrieve the responsible Administrative Unit
        this.log.trace(`${LOG_PREFIX} Retrieving the responsible Administrative Unit`);
        this.administrativeUnitsDataService
          .getAdministrativeUnits(true, {
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: 'id',
            sortDirection: 'asc',
            id: administrativeHierarchy.data.responsible?.id,
            typesIds: null,
            name: null
          })
          .pipe(first()) // This will automatically complete (and therefore unsubscribe) after the first value has been emitted.
          .subscribe({
            next: (administrativeUnits: AdministrativeUnit[]) => {

              // Administrative Units successfully retrieved and cached
              this.log.debug(`${LOG_PREFIX} ${administrativeUnits.length} Administrative Units retrieved and cached`);

              // Get and set the first Administrative Unit as the default selected Administrative Unit
              this.log.trace(`${LOG_PREFIX} Getting and setting the first Administrative Unit as the default selected Administrative Unit`);
              filter.activeAdministrativeUnit = administrativeUnits[0]
              this.log.trace(`${LOG_PREFIX} Active Administrative Unit = ${JSON.stringify(filter.activeAdministrativeUnit)}`);

              // Return
              this.log.trace(`${LOG_PREFIX} Returning`);
              callback();
            },

            error: () => {

              // Administrative Units retrieval failed
              this.log.error(`${LOG_PREFIX} Administrative Units retrieval failed`);

              // Return
              this.log.trace(`${LOG_PREFIX} Returning`);
              callback();
            }
          });


      } else {

        // The Administrative Unit was not successfully retrieved
        this.log.error(`${LOG_PREFIX} The Administrative Unit was not successfully retrieved`);

        // Return
        this.log.trace(`${LOG_PREFIX} Returning`);
        callback();

      }

    } else {

      // The Administrative Unit was not successfully retrieved
      this.log.error(`${LOG_PREFIX} The Administrative Unit was not successfully retrieved`);

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();
    }

  }

  private initialiseActiveGlobalAdministrativeUnitType(filter: Filter, callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseActiveAdministrativeUnitType()`);


    // Check if the target Administrative Unit has been set 
    this.log.trace(`${LOG_PREFIX} Checking if the target Administrative Unit has been set`);
    if (filter.activeAdministrativeUnit) {

      // The target global Administrative Unit has been set 
      this.log.trace(`${LOG_PREFIX} The target global Administrative Unit has been set`);

      // Get the target Administrative Unit
      this.log.trace(`${LOG_PREFIX} Getting the target Administrative Unit`);
      const administrativeUnit: AdministrativeUnit | null = filter.activeAdministrativeUnit ? filter.activeAdministrativeUnit : null;

      // Check if the Administrative Unit was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the Administrative Unit was successfully retrieved`);
      if (administrativeUnit) {

        // The Administrative Unit was successfully retrieved
        this.log.trace(`${LOG_PREFIX} Checking if the Administrative Unit was successfully retrieved`);

        // Retrieve the Administrative Unit's Type
        this.log.trace(`${LOG_PREFIX} Retrieving the Administrative Unit's Type`);
        this.administrativeUnitsTypesDataService
          .getAdministrativeUnitsTypes(true, {
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: 'id',
            sortDirection: 'asc',
            id: administrativeUnit.data.typeId,
            name: null,
            plural: null
          })
          .pipe(first()) // This will automatically complete (and therefore unsubscribe) after the first value has been emitted.
          .subscribe({
            next: (administrativeUnitTypes: AdministrativeUnitType[]) => {

              // Administrative Units Types successfully retrieved and cached
              this.log.debug(`${LOG_PREFIX} ${administrativeUnitTypes.length} Administrative Units Types retrieved and cached`);

              // Get and set the first Administrative Unit Type as the default selected Administrative Unit Type
              this.log.trace(`${LOG_PREFIX} Getting and setting the first Administrative Unit Type as the default selected Administrative Unit Type`);
              filter.activeAdministrativeUnitType = administrativeUnitTypes[0]
              this.log.trace(`${LOG_PREFIX} Active Administrative Unit Type = ${JSON.stringify(filter.activeAdministrativeUnitType)}`);

              // Return
              this.log.trace(`${LOG_PREFIX} Returning`);
              callback();
            },

            error: () => {

              // Administrative Units Types retrieval failed
              this.log.error(`${LOG_PREFIX} Administrative Units Types retrieval failed`);

              // Return
              this.log.trace(`${LOG_PREFIX} Returning`);
              callback();
            }
          });


      } else {

        // The target global Administrative Unit has not been set 
        this.log.error(`${LOG_PREFIX} The target global Administrative Unit has not been set`);

        // Return
        this.log.trace(`${LOG_PREFIX} Returning`);
        callback();

      }

    } else {

      // The target global Administrative Unit has not been set 
      this.log.error(`${LOG_PREFIX} The target global Administrative Unit has not been set`);

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();
    }

  }


  private clearAssignedLocationDetails(filter: Filter): void {

    filter.activeAssignedAdministrativeSystem = null;
    filter.activeAssignedAdministrativeStructures.length = 0;
    filter.activeAssignedAdministrativeHierarchy = null;
    filter.activeAssignedAdministrativeUnitType = null;
    filter.activeAssignedAdministrativeUnit = null;

  }

  private findStructuralChildren(id: number | null | undefined, data: AdministrativeStructure[], results: AdministrativeStructure[]): AdministrativeStructure[] {

    if (id && data.length > 0) {
      for (let d of data) {
        if (d.data.commissioner?.id && (d.data.commissioner.id == id) && d.id) {
          results.push(d)
          this.findStructuralChildren(d.id, data, results,)
        }
      }
    }

    return results;
  }


  private findHierarchicalChildren(id: number, data: AdministrativeHierarchy[], results: AdministrativeHierarchy[]): AdministrativeHierarchy[] {

    if (id && data.length > 0) {
      for (let d of data) {
        if (d.data.commissioner?.id && (d.data.commissioner.id == id) && d.id) {
          results.push(d)
          this.findHierarchicalChildren(d.id, data, results,)
        }
      }
    }

    return results;
  }

  // See: https://stackoverflow.com/questions/43118692/typescript-filter-out-nulls-from-an-array
  private notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
    return value !== null && value !== undefined;
  }

  private unique(value: any, index: any, self: any) {
    return self.indexOf(value) === index;
  }

}
