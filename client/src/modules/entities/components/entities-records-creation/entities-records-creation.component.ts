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


const LOG_PREFIX: string = "[Entities Records Creation Component]";

@Component({
  selector: 'sb-entities-records-creation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './entities-records-creation.component.html',
  styleUrls: ['entities-records-creation.component.scss'],
})
export class EntitiesRecordsCreationComponent implements OnInit, OnDestroy {

  // Allows the parent component to inject the unique identifier of the parent Context record
  @Input() public contextId!: number;

  // Allows the parent component to inject the unique identifier of the entity type record
  @Input() public typeId!: number;

  // Allows the parent component to specify whether the entity is being added in embedded mode (e.g. on the fly during data collection)
  @Input() public embedded: boolean = false;

  // Broadcasts successful Entities creation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Entities creation events together with their error codes
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Broadcasts selector windows open events
  @Output() public openedLocationSelector: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts selector windows close events
  @Output() public closedLocationSelector: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts the successful created Entities when working in embedded modes
  @Output() public created: EventEmitter<Entity> = new EventEmitter<Entity>();

  // Keeps tabs of the entitiesTypes
  private entitiesTypesSubject$ = new BehaviorSubject<EntityType[]>([]);
  readonly entitiesTypes$ = this.entitiesTypesSubject$.asObservable();

  // Keep tabs of the selected Administrative Unit & its parentage
  private location: {id: number | null | undefined; name: string | null | undefined;}[] | null | undefined  = null;

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
    public filterService: FilterService,
    public textUtilService: TextUtilService,
    private cd: ChangeDetectorRef,
    private log: NGXLogger) {

  }


  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise and locally cache the context's entities types
    // This is important for the situations where the entity is being added in embedded mode
    this.initialiseEntitiesTypes(() => {

      // Set the default active Entity Type if not set
      this.initialiseActiveEntityType(() => {

        // Retrieve and cache Options Types locally
        this.initialiseOptionsTypes(() => {

          // Retrieve and cache Options locally
          this.initialiseOptions(() => {

            // Initialise the data tabulation form
            this.initialiseFormGroup(() => {

              // Initialise the classifications that correspond the currently selected entity type
              this.initialiseClassifications(() => {

                // Mark Init as complete
                this.log.trace(`${LOG_PREFIX} Init completed`);
                this.initialised = true;
                this.cd.detectChanges();
              })

            });

          });

        });

      });

    });

  }



  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy`);

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
        contextId: this.contextId,
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
   * Sets the active Entity Type if it has not been set in the global filter
   * @param callback The function to call when done
   */
  private initialiseActiveEntityType(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseActiveEntityType()`);

    // Check if the active Entity Type has been set in the global filter
    this.log.trace(`${LOG_PREFIX} Checking if the active Entity Type has been set in the global filter`);
    if (this.filterService.filter.activeEntityType) {

      // The active Entity Type has been set in the global filter
      this.log.trace(`${LOG_PREFIX} The active Entity Type has been set in the global filter`);

      // Check if the active Entity Type record exists in the cache
      this.log.trace(`${LOG_PREFIX} Checking if the active Entity Type record exists in the cache`);
      if (this.entitiesTypesDataService.records.some(a => a.id == this.filterService.filter.activeEntityType?.id)) {

        // The active Entity Type record exists in the cache
        this.log.trace(`${LOG_PREFIX} The active Entity Type record exists in the cache`);

        // Initialisation is valid
        this.log.trace(`${LOG_PREFIX} Initialisation is valid`);

      } else {

        // Initialisation is invalid
        this.log.trace(`${LOG_PREFIX} Initialisation is invalid`);

        // Get the first Entity Type record
        this.log.trace(`${LOG_PREFIX} Get the first Entity Type record`);
        const entityType: EntityType | null = this.entitiesTypesDataService.records.length > 0 ? this.entitiesTypesDataService.records[0] : null;
        this.log.trace(`${LOG_PREFIX} First Entity Type record = ${JSON.stringify(entityType)}`);

        // Update the global filter
        this.log.trace(`${LOG_PREFIX} Updating the global filter`);
        this.filterService.update({ activeEntityType: entityType });

      }

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    } else {

      // The active Entity Type has not been set in the global filter
      this.log.trace(`${LOG_PREFIX} The active Entity Type has not been set in the global filter`);

      // Get the first Entity Type record
      this.log.trace(`${LOG_PREFIX} Get the first Entity Type record`);
      const entityType: EntityType | null = this.entitiesTypesDataService.records.length > 0 ? this.entitiesTypesDataService.records[0] : null;
      this.log.trace(`${LOG_PREFIX} First Entity Type record = ${JSON.stringify(entityType)}`);

      // Update the global filter
      this.log.trace(`${LOG_PREFIX} Updating the global filter`);
      this.filterService.update({ activeEntityType: entityType });

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    }
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
        this.classifications.push({ optionTypeId: optionTypeId, optionId: null })
      }

    }

    // Return
    this.log.trace(`${LOG_PREFIX} Returning`);
    callback();

  }






  /**
   * Retrieves and caches the active context's Options Types records
   * @param callback The function to call when done
   */
  private initialiseOptionsTypes(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseOptionsTypes()`);

    // Retrieve and cache all the Options Types records
    this.log.trace(`${LOG_PREFIX} Retrieving and caching all the Options Types records`);
    this.optionsTypesDataService
      .getOptionsTypes(true, {
        searchTerm: null,
        page: null,
        pageSize: null,
        sortColumn: 'name',
        sortDirection: 'asc',
        ids: null,
        name: null
      })
      .pipe(first()) // This will automatically complete (and therefore unsubscribe) after the first value has been emitted.
      .subscribe({
        next: (optionsTypes: OptionType[]) => {

          // Options Types successfully retrieved and cached
          this.log.debug(`${LOG_PREFIX} ${optionsTypes.length} Options Types(s) retrieved and cached`);

          // Return
          this.log.trace(`${LOG_PREFIX} Returning`);
          callback();
        },

        error: (err: any) => {

          // Options Types retrieval failed
          this.log.error(`${LOG_PREFIX} Options Types retrieval failed`);

          // Return
          this.log.trace(`${LOG_PREFIX} Returning`);
          callback();
        }
      });

  }




  /**
   * Retrieves and caches Options records
   * @param callback The function to call when done
   */
  private initialiseOptions(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseOptions()`);

    // Retrieve and cache all the Options records
    this.log.trace(`${LOG_PREFIX} Retrieving and caching all the Options records`);
    this.optionsDataService
      .getOptions(true, {
        searchTerm: null,
        page: null,
        pageSize: null,
        sortColumn: 'name',
        sortDirection: 'asc',
        ids: null,
        typeId: null,
        name: null
      })
      .pipe(first()) // This will automatically complete (and therefore unsubscribe) after the first value has been emitted.
      .subscribe({
        next: (options: Option[]) => {

          // Options successfully retrieved and cached
          this.log.debug(`${LOG_PREFIX} ${options.length} Option(s) retrieved and cached`);

          // Return
          this.log.trace(`${LOG_PREFIX} Returning`);
          callback();
        },

        error: (err: any) => {

          // Options retrieval failed
          this.log.error(`${LOG_PREFIX} Options retrieval failed`);

          // Return
          this.log.trace(`${LOG_PREFIX} Returning`);
          callback();
        }
      });

  }  

  /**
   * Presets default values in the data creation form
   * @param callback The function to call when done
   */
  private initialiseFormGroup(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseFormGroup()`);

    // Select the active Type
    this.log.trace(`${LOG_PREFIX} Selecting the active Type`);
    this.entitiesForm.get('typeId')?.setValue(this.typeId ? this.typeId : null);

    // Return
    this.log.trace(`${LOG_PREFIX} Returning`);
    callback();

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

  onChangeClassification(optionTypeId: number, optionId: number): void {
    const c: EntityClassification | undefined = this.classifications.find(e => e.optionTypeId == optionTypeId);
    if (c) {
      c.optionId = optionId;
    }
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

        // Attempt retrieving Entities Permissions with the same name
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve Entities Permissions with the same name`);
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

                // Mark 'code exists' as true
                this.log.trace(`${LOG_PREFIX} Marking 'code exists' as true`);
                return { 'exists': true };


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
   * Validates and saves a new Entities Record.
   * Emits a succeeded or failed event depending on whether the save request succeeded or failed respectively
   * Error 400 = Indicates that a user error was encountered
   * Error 500 = Indicates that a system error was encountered
   */
  public save(): void {

    this.log.trace(`${LOG_PREFIX} Entering save()`);

    // Check if the data entry form is valid
    this.log.trace(`${LOG_PREFIX} Checking if the data entry form is valid`);
    if (this.entitiesForm.valid && this.classificationsAreValid()) {

      // The data entry form is valid
      this.log.trace(`${LOG_PREFIX} The data entry form is valid`);

      // Read in the provided parent Type Id
      this.log.trace(`${LOG_PREFIX} Reading in the provided parent Type Id`);
      const typeId: number | null | undefined = this.entitiesForm.get('typeId')?.value;
      this.log.debug(`${LOG_PREFIX} Entity Type Id = ${typeId}`);

      // Read in the provided name
      this.log.trace(`${LOG_PREFIX} Reading in the provided name`);
      const name: string | null | undefined = this.entitiesForm.get('name')?.value?.trim();
      this.log.debug(`${LOG_PREFIX} Entity Name = ${name}`);

      // Save the record
      this.log.trace(`${LOG_PREFIX} Saving the Entities Record`);
      this.entitiesDataService
        .createEntity(
          new Entity({
            data: {
              typeId,
              location: this.location,
              name,
              classifications: this.classifications
            },
            version: null
          }))
        .subscribe({
          next: (response: Entity) => {

            // The Entity Record was saved successfully
            this.log.trace(`${LOG_PREFIX} Entity Record was saved successfuly`);

            if (this.embedded) {

              // Emit a 'created' event
              this.log.trace(`${LOG_PREFIX} Emitting a 'created' event`);
              this.created.emit(response);

            } else {

              // Emit a 'succeeded' event
              this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
              this.succeeded.emit();

              // Reset the form
              this.log.trace(`${LOG_PREFIX} Resetting the form`);
              this.entitiesForm.controls['name'].reset();
              this.classifications.length = 0;
            }

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
