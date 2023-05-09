import {
  AfterContentInit,
  AfterViewInit,
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
import { FilterService } from '@app/app-filter.service';
import { TextUtilService } from '@common/services/text-util.service';
import { AdministrativeHierarchy } from '@modules/administrative-hierarchies/models/administrative-hierarchy.model';
import { AdministrativeUnit } from '@modules/administrative-units/models/administrative-unit.model';
import { EntityType } from '@modules/entities-types/models/entity-type.model';
import { EntitiesTypesDataService } from '@modules/entities-types/services/entities-types-data.service';
import { Entity } from '@modules/entities/models/entity.model';
import { EntitiesDataService } from '@modules/entities/services/entities-data.service';
import { OptionType } from '@modules/options-types/models/option-type.model';
import { Option } from '@modules/options/models/option.model';
import { OptionsTypesDataService } from '@modules/options-types/services/options-types-data.service';
import { OptionsDataService } from '@modules/options/services/options-data.service';
import { NGXLogger } from 'ngx-logger';
import { Observable, map, of, first, BehaviorSubject } from 'rxjs';
import { EntityClassification } from '@modules/entities/models/entity-classification.model';
import { AdministrativeUnitsDataService } from '@modules/administrative-units/services/administrative-units-data.service';

const LOG_PREFIX: string = "[Entities Records Updation Component]";

@Component({
  selector: 'sb-entities-records-updation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './entities-records-updation.component.html',
  styleUrls: ['entities-records-updation.component.scss'],
})
export class EntitiesRecordsUpdationComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Entity record
  @Input() public id!: number;

  // Broadcasts successful Entities updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Entities updation events together with their error codes
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the Entity record with the passed in id
  public entity: Entity | null | undefined;

  // Broadcasts selector windows open events
  @Output() public openedLocationSelector: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts selector windows close events
  @Output() public closedLocationSelector: EventEmitter<void> = new EventEmitter<void>();

  // Keep tabs of the selected Administrative Unit & its parentage
  private location: {id: number | null | undefined; name: string | null | undefined;}[] | null | undefined  = null;

  // Keeps tabs of the entitiesTypes
  private entitiesTypesSubject$ = new BehaviorSubject<EntityType[]>([]);
  readonly entitiesTypes$ = this.entitiesTypesSubject$.asObservable();

  // Keep tabs of the option types and their options
  public optionsMapping: Map<OptionType, Option[]> = new Map();

  // Defines Entities reactive form controls group
  entitiesForm = new FormGroup({

    typeId: new FormControl<number | null>(null,
      [Validators.required]),

    name: new FormControl<string | null>('',
      [Validators.required, Validators.minLength(2), Validators.maxLength(250)],
      [this.nameExists()]),

    location: new FormGroup({
      locationId: new FormControl<number | null | undefined>(null, this.locationIsValid()),
      locationName: new FormControl<string | null | undefined>("Choose Location")
    }),

  });

  // Keeps tabs of the currently visible content
  public page: string = "default";

  // Keeps tabs of whether the component has been successfully initialised
  public initialised: boolean = false;

  // Keep tabs of the entities
  public classifications: EntityClassification[] = [];

  // Kepp tabs of the classification errors
  public classificationError: string | null = null;

  constructor(
    public entitiesTypesDataService: EntitiesTypesDataService,
    public entitiesDataService: EntitiesDataService,
    public optionsTypesDataService: OptionsTypesDataService,
    public optionsDataService: OptionsDataService,
    public administrativeUnitsDataService: AdministrativeUnitsDataService,
    public filterService: FilterService,
    public textUtilService: TextUtilService,
    private cd: ChangeDetectorRef,
    private log: NGXLogger) {

  }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise and locally cache the context's entities types
    this.initialiseEntitiesTypes(() => {

      // Initialise the Entity field based on the passed in id
      this.initialiseEntity(() => {

        // Initialise the local location reference
        this.initialiseLocation(() => {

          // Initialise the Entity updation form based on the target Context
          this.initialiseEntityUpdationForm(() => {

            // Initialise the classifications that correspond the currently selected entity type
            this.initialiseClassifications(() => {

              // Mark Init as complete
              this.log.trace(`${LOG_PREFIX} Init completed`);
              this.initialised = true;
              this.cd.detectChanges();

            });

          });

        });

      });

    });



  }




  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }


  /**
   * Retrieves and locally caches the specified context's Entities Types records
   * @param callback The function to call when done
   */
  private initialiseEntitiesTypes(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseEntitiesTypes()`);

    // Retrieve and locally cache all the Entities Types records
    this.log.trace(`${LOG_PREFIX} Retrieving and locally caching all the Entities Types records`);
    this.entitiesTypesDataService
      .getEntitiesTypes(false, {
        searchTerm: null,
        page: null,
        pageSize: null,
        sortColumn: 'name',
        sortDirection: 'asc',
        id: null,
        contextId: this.filterService.filter.activeContext?.id,
        name: null,
        plural: null
      })
      .pipe(first()) // This will automatically complete (and therefore unsubscribe) after the first value has been emitted.
      .subscribe({
        next: (entitiesTypes: EntityType[]) => {

          // Entities Types successfully retrieved and cached
          this.log.debug(`${LOG_PREFIX} ${entitiesTypes.length} Entities Types(s) retrieved and cached`);

          // Update the local entities types list
          this.log.debug(`${LOG_PREFIX} ${entitiesTypes.length} Updating the local entities types list`);
          this.entitiesTypesSubject$.next(entitiesTypes);

          // Return
          this.log.trace(`${LOG_PREFIX} Returning`);
          callback();
        },

        error: (err: any) => {

          // Entities Types retrieval failed
          this.log.error(`${LOG_PREFIX} Entities Types retrieval failed`);

          // Return
          this.log.trace(`${LOG_PREFIX} Returning`);
          callback();
        }
      });

  }



  /**
   * Retrieves the Entity with the injected id and sets it as the Entity that needs to be updated
   * @param callback The function to call when done
   */
  private initialiseEntity(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseEntity()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveEntityRecord(this.id, (entity: Entity | null) => {

      // Set the target Entity
      this.log.trace(`${LOG_PREFIX} Setting the target Entity`);
      this.entity = entity;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }


  /**
   * Retrieves the local location reference - as in the location of the entity (including parent admin units)
   * @param callback The function to call when done
   */
  private initialiseLocation(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseLocation()`);

    // Initialise the local location reference
    this.location = Object.assign([], this.entity?.data.location ? this.entity.data.location : []);

    // Return
    this.log.trace(`${LOG_PREFIX} Returning`);
    callback();

  }


  /**
   * Initialise Classifications
   */
  private initialiseClassifications(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseClassifications()`);

    // Clear the current classification if any
    this.classifications.length = 0;

    // Clear the current classification errors if any
    this.classificationError = null;

    // Get the currently selected entity type
    this.log.trace(`${LOG_PREFIX} Getting the currently selected entity type`);
    const entityType: EntityType | undefined = this.entitiesTypesDataService.records.find(e => e.id == this.entitiesForm.get('typeId')?.value);
    this.log.debug(`${LOG_PREFIX} Entity Type = ${entityType ? JSON.stringify(entityType) : null}`);

    if (entityType && entityType.data.optionsTypesIds) {

      // Initialise the classifications
      this.log.trace(`${LOG_PREFIX} Initialising the classifications`);
      for (let optionTypeId of entityType.data.optionsTypesIds) {
        const ec: EntityClassification | undefined = this.entity?.data.classifications?.find(e => e.optionTypeId == optionTypeId);
        this.classifications.push({ optionTypeId: optionTypeId, optionId: ec?.optionId ? ec.optionId : null })
      }

    }

    // Return
    this.log.trace(`${LOG_PREFIX} Returning`);
    callback();

  }



  /**
   * Initialises the Entity updation form
   * @param callback The function to call when done
   */
  private initialiseEntityUpdationForm(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseEntityUpdationForm()`);
    this.log.debug(`${LOG_PREFIX} Target Entity Record = ${JSON.stringify(this.entity)}`);

    this.retrieveAdministrativeUnitRecord(this.location && this.location.length > 0? this.location[0].id: null, (administrativeUnit: AdministrativeUnit | null) => {

      // Update the form fields
      this.log.trace(`${LOG_PREFIX} Updating the form fields`);
      this.entitiesForm.setValue({
        typeId: this.entity?.data.typeId ? this.entity.data.typeId : null,
        name: this.entity?.data.name ? this.entity.data.name : null,
        location: { locationId: administrativeUnit?.id ? administrativeUnit.id : null, locationName: administrativeUnit?.data.name ? administrativeUnit.data.name : "Choose location" }
      });

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }

  /**
   * Retrieves an Entity record given its unique identifier synchronously
   * @param id The unique identifier of the Entity
   * @param callback The function to call when done
   */
  private retrieveEntityRecord(id: number, callback: (entity: Entity | null) => void): void {

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
   * Retrieves the id of the location of the entity
   * @returns the field id
   */
  public getEntityLocationId(): number | null | undefined {
    return this.entitiesForm.get('location.locationId')?.value
  }


  /**
   * Get the selected entity location for preselection purposes
   * @returns 
   */
  public getSelectedLocations(): number[] {
    if (this.getEntityLocationId()) {
      return [this.getEntityLocationId() as number];
    } else {
      return [];
    }
  }

  /**
   * Return the option type given its id
   * @param optionTypeId the id of the option type
   */
  getOptionType(optionTypeId: number): OptionType | null | undefined {
    return this.optionsTypesDataService.records.find(o => o.id == optionTypeId);
  }

  /**
   * Return the options given their option types ids
   * @param optionTypeId the id of the option type
   */
  getOptions(optionTypeId: number): Option[] | null | undefined {
    return this.optionsDataService.records.filter(o => o.data.typeId == optionTypeId);
  }


  /**
   * Handles Entity Type change events
   */
  public onEntityTypeChange(): void {

    this.log.trace(`${LOG_PREFIX} Entering onEntityTypeChange()`);

    this.initialiseClassifications(() => {

    })

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
   * Sets the selected location details and close the location selector
   * @param hierarchies the selected location - & its parents
   */
  onSelectAdministrativeHierarchyElement(hierarchies: AdministrativeHierarchy[]) {

    // Update the local location reference
    this.log.trace(`${LOG_PREFIX} Updating the local location reference`);
    this.location = [];
    for(let hierarchy of hierarchies){
      if(hierarchy.data.responsible?.id){
        this.location.push({id: hierarchy.data.responsible.id, name: hierarchy.data.responsible.name});
      }
    }

    // Get the actual selected location
    this.log.trace(`${LOG_PREFIX} Getting the actual selected location`);
    const administrativeHierarchy: AdministrativeHierarchy = hierarchies[0];

    // Update the form
    this.log.trace(`${LOG_PREFIX} Updating the form`);
    this.entitiesForm.get('location.locationId')?.setValue((administrativeHierarchy && administrativeHierarchy.data.responsible?.id) ? administrativeHierarchy.data.responsible.id : null);
    this.entitiesForm.get('location.locationName')?.setValue((administrativeHierarchy && administrativeHierarchy.data.responsible?.name) ? this.textUtilService.truncate(administrativeHierarchy.data.responsible.name, [35, "..."]) : null);

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



  onChangeClassification(optionTypeId: number, optionId: number): void {
    const c: EntityClassification | undefined = this.classifications.find(e => e.optionTypeId == optionTypeId);
    if (c) {
      c.optionId = optionId;
    }
  }



  /**
   * Internal validator that checks whether a proposed Entity's name already exists
   * @returns 
   */
  private nameExists(): AsyncValidatorFn {

    this.log.trace(`${LOG_PREFIX} Entering nameExists()`);

    return (control: AbstractControl): Observable<ValidationErrors | null> => {

      // Check if a name value has been provided
      this.log.trace(`${LOG_PREFIX} Check if a name value has been provided`);
      if (control.value) {

        // A name value has been provided
        this.log.trace(`${LOG_PREFIX} A name value has been provided`);

        // Attempt retrieving Entities with the same name
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve Entities with the same name`);
        return this.entitiesDataService
          .getEntities(false, {
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            id: null,
            typeId: this.entitiesForm.get('typeId')?.value ? this.entitiesForm.get('typeId')?.value as number : null,
            locationId: null,
            name: control.value?.trim()
          })
          .pipe(
            map((entities: Entity[]) => {

              // Check if a Entity record with the same name was found
              this.log.trace(`${LOG_PREFIX} Checking if a Entity record with the same name was found`);

              if (entities.length > 0) {

                // A Entity record with the same name was found
                this.log.trace(`${LOG_PREFIX} A Entity record with the same name was found`);

                // Retrieve the Entity record with the specified name
                this.log.trace(`${LOG_PREFIX} Retrieving the Entity record with the specified name`);
                const entity: Entity | undefined = entities.find(s => s.data.name?.toLowerCase() == control.value.toLowerCase());
                this.log.trace(`${LOG_PREFIX} Entity record = ${JSON.stringify(entity)}`);

                // Check if the Entity record's identity is different from the current Entity record's identity
                this.log.trace(`${LOG_PREFIX} Checking if the Entity record's identity is different from the current Entity record's identity`);

                if (entity && entity.id != this.id) {

                  // The Entity record's identity is different from the current Entity record's identity
                  this.log.trace(`${LOG_PREFIX} The Entity record's identity is different from the current Entity record's identity`);

                  // Mark 'name exists' as true
                  this.log.trace(`${LOG_PREFIX} Marking 'name exists' as true`);
                  return { 'exists': true };

                } else {

                  // The Entity record's identity is not different from the current Entity record's identity
                  this.log.trace(`${LOG_PREFIX} The Entity record's identity is not different from the current Entity record's identity`);

                  // Mark 'name exists' as false
                  this.log.trace(`${LOG_PREFIX} Marking 'name exists' as false`);
                  return null
                }


              } else {

                // A Entity record with the same name was not found
                this.log.trace(`${LOG_PREFIX} A Entity record with the same name was not found`);

                // Mark 'name exists' as false
                this.log.trace(`${LOG_PREFIX} Marking 'name exists' as false`);
                return null

              }
            }

            )
          );

      } else {

        // A name value has not been provided
        this.log.trace(`${LOG_PREFIX} A name value has not been provided`);

        // Mark 'name exists' as false
        this.log.trace(`${LOG_PREFIX} Marking 'name exists' as false`);
        return of(null)
      }

    };

  }

  /**
   * Internal validator that checks whether a location has been specified
   * @returns 
   */
  private locationIsValid(): ValidatorFn {


    return (control: AbstractControl): ValidationErrors | null => {

      if (control.value) {
        return null;
      } else {
        return { 'required': true }
      }


    }
  }

  /**
   * Validates and saves the updated Entity Record.
   * Emits a succeeded or failed event in response to whether or not the updation exercise was successful.
   * Error 400 = Indicates an invalid Form Control Entry was supplied.
   * Error 500 = Indicates something unexpected happened at the server side
   */
  public save(): void {


    this.log.trace(`${LOG_PREFIX} Entering save()`);

    // Check if the data entry form is valid
    this.log.trace(`${LOG_PREFIX} Checking if the data entry form is valid`);
    if (this.entitiesForm.valid && this.classificationsAreValid()) {

      // The target Entity record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Entity record was successfully initialised()`);

      // Check if the data entry form is valid
      this.log.trace(`${LOG_PREFIX} Checking if the data entry form is valid`);
      if (this.entitiesForm.valid) {

        // The data entry form is valid
        this.log.trace(`${LOG_PREFIX} The data entry form is valid`);

        // Read in the provided parent Type Id
        this.log.trace(`${LOG_PREFIX} Reading in the provided parent Type Id`);
        const typeId: number | null | undefined = this.entitiesForm.get('typeId')?.value;
        this.log.debug(`${LOG_PREFIX} Entity Type Id = ${typeId}`);

        // Read in the provided name
        this.log.trace(`${LOG_PREFIX} Reading in the provided name`);
        const name: string | null | undefined = this.entitiesForm.get('name')?.value?.trim();
        this.log.debug(`${LOG_PREFIX} Entity Name = ${name}`)

        // Save the record
        this.log.trace(`${LOG_PREFIX} Saving the Entities Record`);
        this.entitiesDataService
          .updateEntity(new Entity({
            id: this.entity?.id,
            data: {
              typeId,
              location: this.location,
              name,
              classifications: this.classifications
            },
            version: this.entity?.version
          }))
          .subscribe({
            next: (response: Entity) => {

              // The Entity Record was saved successfully
              this.log.trace(`${LOG_PREFIX} Entity Record was saved successfuly`);

              // Reset the form
              this.log.trace(`${LOG_PREFIX} Resetting the form`);
              this.entitiesForm.controls['name'].reset();
              this.classifications.length = 0;

              // Emit a 'succeeded' event
              this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
              this.succeeded.emit();
            },
            error: (error: any) => {

              // The Entity Record was not saved successfully
              this.log.trace(`${LOG_PREFIX} Entity Record was not saved successfuly`);

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
        this.classificationsAreValid();
        this.validateAllFormFields(this.entitiesForm);

        // Emit an 'invalid' event
        this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
        this.failed.emit(400);
      }


    } else {
      // The target Entity record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Entity record was not successfully initialised()`);

      // Emit an 'invalid' event
      this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
      this.failed.emit(500);

    }

  }

  public classificationsAreValid(): boolean {

    let valid: boolean = true;

    for (let classification of this.classifications) {
      if (classification.optionTypeId) {
        if (!classification.optionId) {
          valid = false;
        }
      }

    }

    if (valid) {
      this.classificationError = null;
    } else {
      this.classificationError = this.classifications.length > 1 ? "Please provide a value for all options" : "Please provide a value for the option";
    }

    this.cd.detectChanges();

    return valid;
  }


  /**
   * See: https://loiane.com/2017/08/angular-reactive-forms-trigger-validation-on-submit
   * @param formGroup 
   */
  private validateAllFormFields(formGroup: FormGroup): void {
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
