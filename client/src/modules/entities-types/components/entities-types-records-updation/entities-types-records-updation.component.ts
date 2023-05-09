import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { EntityType } from '@modules/entities-types/models/entity-type.model';
import { EntitiesTypesDataService } from '@modules/entities-types/services/entities-types-data.service';
import { ContextsDataService } from '@modules/contexts/services/contexts-data.service';
import { NGXLogger } from 'ngx-logger';
import { Observable, map, of } from 'rxjs';
import { OptionType } from '@modules/options-types/models/option-type.model';
import { OptionsTypesDataService } from '@modules/options-types/services/options-types-data.service';

const LOG_PREFIX: string = "[Entities Types Records Updation Component]";

@Component({
  selector: 'sb-entities-types-records-updation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './entities-types-records-updation.component.html',
  styleUrls: ['entities-types-records-updation.component.scss'],
})
export class EntitiesTypesRecordsUpdationComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Entity Type record
  @Input() public id!: number;

  // Broadcasts successful Entities Types updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Entities Types updation events together with their error codes
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Broadcasts standalone page window open events
  @Output() loadedStandalonePage: EventEmitter<boolean> = new EventEmitter<boolean>();

  // Broadcasts first window open events
  @Output() loadedFirstPage: EventEmitter<boolean> = new EventEmitter<boolean>();

  // Broadcasts nested window open events
  @Output() loadedNestedPage: EventEmitter<boolean> = new EventEmitter<boolean>();

  // Broadcasts last window open events
  @Output() loadedLastPage: EventEmitter<boolean> = new EventEmitter<boolean>();

  // Holds the Entity Type record with the passed in id
  public entityType: EntityType | null | undefined;

  // Keep tabs on the selected options types
  public optionsTypes: OptionType[] = [];

  // Defines Entities Types reactive form controls group
  entitiesTypesForm = new FormGroup({

    name: new FormControl<string | null>('',
      [Validators.required, Validators.minLength(2), Validators.maxLength(250)],
      [this.singularNameExists()]),

    plural: new FormControl<string | null>('',
      [Validators.required, Validators.minLength(2), Validators.maxLength(250)],
      [this.pluralNameExists()]),

  });

  // Keeps tabs of the currently visible content
  page: string = "default";

  // Keeps tabs of the processing errors
  public errors: Map<string, string> = new Map();

  constructor(
    public contextsDataService: ContextsDataService,
    public entitiesTypesDataService: EntitiesTypesDataService,
    public optionsTypesDataService: OptionsTypesDataService,
    private cd: ChangeDetectorRef,
    private log: NGXLogger) {

  }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Entity Type field based on the passed in id
    this.initialiseEntityType(() => {

      // Initialise the entity type's applicable options types
      this.initialiseOptionsTypesRecords(this.entityType?.data.optionsTypesIds, () => {

        // Initialise the Entity Type updation form based on the target Context
        this.initialiseEntityTypeUpdationForm(() => {

          // Mark Init as complete
          this.log.trace(`${LOG_PREFIX} Init completed`);

        });
      })


    });

  }


  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }


  /**
   * Retrieves the Entity Type with the injected id and sets it as the Entity Type that needs to be updated
   * @param callback The function to call when done
   */
  private initialiseEntityType(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseEntityType()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveEntityTypeRecord(this.id, (entityType: EntityType | null) => {

      // Set the target Entity Type
      this.log.trace(`${LOG_PREFIX} Setting the target Entity Type`);
      this.entityType = entityType;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }



  /**
   * Retrieves a optionTypes records given their unique identifiers synchronously
   * @param ids The unique identifiers of the optionTypes
   * @param callback The function to call when done
   */
  private initialiseOptionsTypesRecords(ids: number[] | null | undefined, callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseOptionsTypesRecords()`);

    // Check if the Options Types ids have been specified
    this.log.trace(`${LOG_PREFIX} Checking if the Options Types ids have been specified`);
    if (ids && ids.length > 0) {

      // The options types ids have been specified
      this.log.trace(`${LOG_PREFIX} The options types ids have been specified`);
      this.log.debug(`${LOG_PREFIX} Options Types ids = ${JSON.stringify(ids)}`);

      // Try retrieving the optionsTypes records with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve the optionsTypes record with the passed in id`);
      this.optionsTypesDataService
        .getOptionsTypes(false, {
          searchTerm: null,
          page: null,
          pageSize: null,
          sortColumn: null,
          sortDirection: null,
          ids: ids,
          name: null
        })
        .subscribe({
          next: (optionsTypes: OptionType[]) => {

            // Check if Options Types records were found
            this.log.trace(`${LOG_PREFIX} Checking if Options Types records were found`);
            if (optionsTypes.length > 0) {

              //Options Types records were found
              this.log.trace(`${LOG_PREFIX} Options Types records were found`);
              this.optionsTypes = optionsTypes;

              // Transfer control to the callback function
              this.log.trace(`${LOG_PREFIX} Transfering control to the callback function`);
              callback();


            } else {

              //Options Types records were no found
              this.log.trace(`${LOG_PREFIX} Options Types records were not found`);
              this.optionsTypes = []

              // Transfer control to the callback function
              this.log.trace(`${LOG_PREFIX} Transfering control to the callback function`);
              callback();

            }
          }
        });


    } else {

      // The Indicators Ids have not been specified
      this.log.error(`${LOG_PREFIX} The Indicators Ids have not been specified`);
      this.optionsTypes = [];

      // Transfer control to the callback function
      this.log.trace(`${LOG_PREFIX} Transfering control to the callback function`);
      callback();

    }
  }



  /**
   * Initialises the Entity Type updation form
   * @param callback The function to call when done
   */
  private initialiseEntityTypeUpdationForm(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseEntityTypeUpdationForm()`);
    this.log.debug(`${LOG_PREFIX} Target Entity Type Record = ${JSON.stringify(this.entityType)}`);

    // Initialise the Entity Type Records form fields
    this.log.trace(`${LOG_PREFIX} Initialising the Entity Type Records form fields`);
    this.entitiesTypesForm.setValue({
      name: this.entityType?.data.name ? this.entityType.data.name : null,
      plural: this.entityType?.data.plural ? this.entityType.data.plural : null
    });

    // Return
    this.log.trace(`${LOG_PREFIX} Returning`);
    callback();

  }

  /**
   * Retrieves a Entity Type record given its unique identifier synchronously
   * @param id The unique identifier of the Entity Type
   * @param callback The function to call when done
   */
  private retrieveEntityTypeRecord(id: number, callback: (entityType: EntityType | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveEntityTypeRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the context id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the context id has been specified`);
    if (id) {

      // The context id has been specified
      this.log.trace(`${LOG_PREFIX} The context id has been specified`);
      this.log.debug(`${LOG_PREFIX} Entity Type Id = ${JSON.stringify(id)}`);

      // Try retrieving a Entity Type Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve a Entity Type Record with the passed in id`);
      const entityType: EntityType | undefined = id ? this.entitiesTypesDataService.records.find(d => d.id == id) : undefined;

      // Check if the Entity Type Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the Entity Type Record was successfully retrieved`);
      if (entityType) {

        // The Entity Type Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Entity Type Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} Entity Type Record = ${JSON.stringify(entityType)}`);

        // Return the Entity Type
        this.log.trace(`${LOG_PREFIX} Returning the Entity Type`);
        callback(entityType);

      } else {

        // The Entity Type Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Entity Type Record was not successfully retrieved`);

        // Return null
        this.log.warn(`${LOG_PREFIX} Returning null`);
        callback(null);

      }


    } else {

      // The context id has not been specified
      this.log.error(`${LOG_PREFIX} The context id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }


  /**
   * Retrieves the ids of the selected optionsTypes
   * @returns the ids
   */
  public getSelectedOptionsTypesIds(): number[] {

    this.log.trace(`${LOG_PREFIX} Entering getSelectedOptionsTypesIds()`);

    const ids: number[] = [];
    for (let s of this.optionsTypes) {
      if (s.id) {
        ids.push(s.id);
      }
    }

    this.log.debug(`${LOG_PREFIX} Selected OptionsTypes Ids = ${ids}`);

    return ids;
  }



  /** 
  * Handles optionsTypes Selections Events
  * @param optionType The selected optionType
  */
  onSelectOptionType(optionType: OptionType) {

    this.log.trace(`${LOG_PREFIX} Entering onSelectOptionType()`);
    this.log.trace(`${LOG_PREFIX} Selected optionType = ${JSON.stringify(optionType)}`);

    // Insert the newly selected optionType into the form fields array - if its nonexistent
    if (optionType && this.optionsTypes.findIndex(o => o.id == optionType.id) == -1) {

      // Add the form field to the form fields array
      this.optionsTypes.push(optionType);

      // Validate
      this.isOptionsTypesSpecificationValid();
    }

  }


  /** 
  * Handles optionsTypes Deselection Events
  * @param optionType The deselected optionType
  */
  onDeselectOptionType(optionType: OptionType) {

    this.log.trace(`${LOG_PREFIX} Entering onDeselectOptionType()`);
    this.log.trace(`${LOG_PREFIX} Deselected optionType: ${JSON.stringify(optionType)}`);

    // Removes the newly Unchecked optionType from the Selected optionsTypes array - if in existence
    let index = optionType ? this.optionsTypes.findIndex(o => o.id == optionType.id) : -1;
    if (index != -1) {

      // Remove optionType from optionsTypes array
      this.optionsTypes.splice(index, 1);

      // Validate
      this.isOptionsTypesSpecificationValid();
    }
  }



  /**
   * Loads the next page
   */
  public showNextPage() {

    this.log.trace(`${LOG_PREFIX} Entering showNextPage()`);

    switch (this.page) {

      case "default":

        // Move to the next page iff the current page is valid
        if (this.entitiesTypesForm.valid) {

          // Load the options types selection window
          this.log.trace(`${LOG_PREFIX} Loading the options types selection window`);
          this.page = "optionsTypes";

          // Mark the current page as the last page
          this.log.trace(`${LOG_PREFIX} Marking the current page as the last page`);
          this.loadedLastPage.emit(true);

        } else {

          // Run the form fields validation request to validate all fields and display the error message(s)
          this.log.trace(`${LOG_PREFIX} Running the form fields validation request to validate all fields and display the error message(s)`);
          this.validateAllFormFields(this.entitiesTypesForm);

        }

        break;

      default:

        // Mark the wizard as having reached a premature end
        this.log.error(`${LOG_PREFIX} The wizard has reached a premature end`);


    }

    this.cd.detectChanges();

  }

  /**
  * Load the previous page
  */
  public showPreviousPage() {

    this.log.trace(`${LOG_PREFIX} Entering showPreviousPage()`);

    switch (this.page) {

      case "optionsTypes":

        this.log.trace(`${LOG_PREFIX} Loading the default window`);
        this.page = "default";

        // Mark the current page as the first page
        this.log.trace(`${LOG_PREFIX} Marking the current page as the first page`);
        this.loadedFirstPage.emit(true);

        break;
    }

    this.cd.detectChanges();

  }


  /**
   * Internal validator that checks whether a proposed EntityType's singular name already exists
   * @returns 
   */
  private singularNameExists(): AsyncValidatorFn {

    this.log.trace(`${LOG_PREFIX} Entering singularNameExists()`);

    return (control: AbstractControl): Observable<ValidationErrors | null> => {

      // Check if a singular name value has been provided
      this.log.trace(`${LOG_PREFIX} Check if a singular name value has been provided`);
      if (control.value) {

        // A singular name value has been provided
        this.log.trace(`${LOG_PREFIX} A singular name value has been provided`);

        // Attempt retrieving Entities Types with the same singular name
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve Entities Types with the same singular name`);
        return this.entitiesTypesDataService
          .getEntitiesTypes(false, {
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            id: null,
            contextId: this.entityType?.data.contextId,
            name: control.value.trim(),
            plural: null
          })
          .pipe(
            map((entitiesTypes: EntityType[]) => {

              // Check if a Entity Type record with the same singular name was found
              this.log.trace(`${LOG_PREFIX} Checking if a Entity Type record with the same singular name was found`);
              if (entitiesTypes.length > 0) {

                // An Entity Type record with the same singular name was found
                this.log.trace(`${LOG_PREFIX} An Entity Type record with the same singular name was found`);

                // Retrieve the Entity Type record with the specified singular name
                this.log.trace(`${LOG_PREFIX} Retrieving the Entity Type record with the specified singular name`);
                const entityType: EntityType | undefined = entitiesTypes.find(s => s.data.name?.toLowerCase() == control.value.toLowerCase());
                this.log.trace(`${LOG_PREFIX} Entity Type record = ${JSON.stringify(entityType)}`);

                // Check if the Entity Type record's identity is different from the current Entity Type record's identity
                this.log.trace(`${LOG_PREFIX} Checking if the Entity Type record's identity is different from the current Entity Type record's identity`);

                if (entityType && entityType.id != this.id) {

                  // The Entity Type record's identity is different from the current Entity Type record's identity
                  this.log.trace(`${LOG_PREFIX} The Entity Type record's identity is different from the current Entity Type record's identity`);

                  // Mark 'singular name exists' as true
                  this.log.trace(`${LOG_PREFIX} Marking 'singular name exists' as true`);
                  return { 'exists': true };

                } else {

                  // The Entity Type record's identity is not different from the current Entity Type record's identity
                  this.log.trace(`${LOG_PREFIX} The Entity Type record's identity is not different from the current Entity Type record's identity`);

                  // Mark 'singular name exists' as false
                  this.log.trace(`${LOG_PREFIX} Marking 'singular name exists' as false`);
                  return null;
                }

              } else {

                // An Entity Type record with the same singular name was not found
                this.log.trace(`${LOG_PREFIX} An Entity Type record with the same singular name was not found`);

                // Mark 'singular name exists' as false
                this.log.trace(`${LOG_PREFIX} Marking 'singular name exists' as false`);
                return null;

              }
            }

            )
          )

      } else {

        // A plural value has not been provided
        this.log.trace(`${LOG_PREFIX} A plural value has not been provided`);

        // Mark 'plural exists' as false
        this.log.trace(`${LOG_PREFIX} Marking 'plural exists' as false`);
        return of(null);
      }

    };

  }


  /**
   * Internal validator that checks whether a proposed EntityType's plural name already exists
   * @returns 
   */
  private pluralNameExists(): AsyncValidatorFn {

    this.log.trace(`${LOG_PREFIX} Entering pluralNameExists()`);

    return (control: AbstractControl): Observable<ValidationErrors | null> => {

      // Check if a plural name value has been provided
      this.log.trace(`${LOG_PREFIX} Check if a plural name value has been provided`);
      if (control.value) {

        // A plural name value has been provided
        this.log.trace(`${LOG_PREFIX} A plural name value has been provided`);

        // Attempt retrieving Entities Types with the same plural name
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve Entities Types with the same plural name`);
        return this.entitiesTypesDataService
          .getEntitiesTypes(false, {
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            id: null,
            contextId: this.entityType?.data.contextId,
            name: null,
            plural: control.value.trim()
          })
          .pipe(
            map((entitiesTypes: EntityType[]) => {

              // Check if a Entity Type record with the same plural name was found
              this.log.trace(`${LOG_PREFIX} Checking if a Entity Type record with the same plural name was found`);
              if (entitiesTypes.length > 0) {

                // An Entity Type record with the same plural name was found
                this.log.trace(`${LOG_PREFIX} An Entity Type record with the same plural name was found`);

                // Retrieve the Entity Type record with the specified plural name
                this.log.trace(`${LOG_PREFIX} Retrieving the Entity Type record with the specified plural name`);
                const entityType: EntityType | undefined = entitiesTypes.find(s => s.data.name?.toLowerCase() == control.value.toLowerCase());
                this.log.trace(`${LOG_PREFIX} Entity Type record = ${JSON.stringify(entityType)}`);

                // Check if the Entity Type record's identity is different from the current Entity Type record's identity
                this.log.trace(`${LOG_PREFIX} Checking if the Entity Type record's identity is different from the current Entity Type record's identity`);

                if (entityType && entityType.id != this.id) {

                  // The Entity Type record's identity is different from the current Entity Type record's identity
                  this.log.trace(`${LOG_PREFIX} The Entity Type record's identity is different from the current Entity Type record's identity`);

                  // Mark 'plural name exists' as true
                  this.log.trace(`${LOG_PREFIX} Marking 'plural name exists' as true`);
                  return { 'exists': true };

                } else {

                  // The Entity Type record's identity is not different from the current Entity Type record's identity
                  this.log.trace(`${LOG_PREFIX} The Entity Type record's identity is not different from the current Entity Type record's identity`);

                  // Mark 'plural name exists' as false
                  this.log.trace(`${LOG_PREFIX} Marking 'plural name exists' as false`);
                  return null;
                }

              } else {

                // An Entity Type record with the same plural name was not found
                this.log.trace(`${LOG_PREFIX} An Entity Type record with the same plural name was not found`);

                // Mark 'plural name exists' as false
                this.log.trace(`${LOG_PREFIX} Marking 'plural name exists' as false`);
                return null;

              }
            }

            )
          )

      } else {

        // A plural value has not been provided
        this.log.trace(`${LOG_PREFIX} A plural value has not been provided`);

        // Mark 'plural exists' as false
        this.log.trace(`${LOG_PREFIX} Marking 'plural exists' as false`);
        return of(null);
      }

    };

  }

  /**
   * Checks whether the optionType details have been fully and correctly specified
   * @returns True or False
   */
  private isOptionsTypesSpecificationValid(): boolean {

    this.log.trace(`${LOG_PREFIX} Entering isOptionsTypesSelectionValid()`);

    let valid: boolean = true;

    return valid;
  }


  /**
   * Validates and saves the updated Entity Type Record.
   * Emits a succeeded or failed event in response to whether or not the updation exercise was successful.
   * Error 400 = Indicates an invalid Form Control Entry was supplied.
   * Error 500 = Indicates something unexpected happened at the server side
   */
  public save(): void {


    this.log.trace(`${LOG_PREFIX} Entering save()`);

    // Check if the target Entity Type record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Entity Type record was successfully initialised()`);
    if (this.entityType) {

      // The target Entity Type record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Entity Type record was successfully initialised()`);

      // Check if the data entry form is valid
      this.log.trace(`${LOG_PREFIX} Checking if the data entry form is valid`);
      if (this.entitiesTypesForm.valid) {

        // The data entry form is valid
        this.log.trace(`${LOG_PREFIX} The data entry form is valid`);

        // Read in the provided name
        this.log.trace(`${LOG_PREFIX} Reading in the provided name`);
        const name: string | null | undefined = this.entitiesTypesForm.get('name')?.value?.trim();
        this.log.debug(`${LOG_PREFIX} Entity Type Name = ${name}`);

        // Read in the provided plural name
        this.log.trace(`${LOG_PREFIX} Reading in the provided plural name`);
        const plural: string | null | undefined = this.entitiesTypesForm.get('plural')?.value?.trim();
        this.log.debug(`${LOG_PREFIX} Entity Type Plural Name = ${plural}`);

        // Save the record
        this.log.trace(`${LOG_PREFIX} Saving the Entities Types Record`);
        this.entitiesTypesDataService
          .updateEntityType(new EntityType( {
            id: this.entityType.id,
            data: {
              contextId: this.entityType.data.contextId,
              optionsTypesIds: this.getSelectedOptionsTypesIds(),
              name,
              plural,
            },
            version: this.entityType.version
          }))
          .subscribe({
            next: (response: EntityType) => {

              // The Entity Type Record was saved successfully
              this.log.trace(`${LOG_PREFIX} Entity Type Record was saved successfuly`);

              // Reset the form
              this.log.trace(`${LOG_PREFIX} Resetting the form`);
              this.entitiesTypesForm.get('name')?.setValue(null);
              this.entitiesTypesForm.get('plural')?.setValue(null);

              // Emit a 'succeeded' event
              this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
              this.succeeded.emit();
            },
            error: (error: any) => {

              // The Entity Type Record was not saved successfully
              this.log.trace(`${LOG_PREFIX} Entity Type Record was not saved successfuly`);

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
        this.validateAllFormFields(this.entitiesTypesForm);

        // Emit an 'invalid' event
        this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
        this.failed.emit(400);
      }


    } else {
      // The target Entity Type record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Entity Type record was not successfully initialised()`);

      // Emit an 'invalid' event
      this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
      this.failed.emit(500);

    }

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
