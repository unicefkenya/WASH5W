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
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ContextsDataService } from '@modules/contexts/services/contexts-data.service';
import { EntityType } from '@modules/entities-types/models/entity-type.model';
import { EntitiesTypesDataService } from '@modules/entities-types/services/entities-types-data.service';
import { OptionType } from '@modules/options-types/models/option-type.model';
import { NGXLogger } from 'ngx-logger';
import { Observable, map, of } from 'rxjs';

const LOG_PREFIX: string = "[Entities Types Records Creation Component]";

@Component({
  selector: 'sb-entities-types-records-creation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './entities-types-records-creation.component.html',
  styleUrls: ['entities-types-records-creation.component.scss'],
})
export class EntitiesTypesRecordsCreationComponent implements OnInit, OnDestroy {

  // Allows the parent component to inject the unique identifier of the parent Context record
  @Input() public contextId!: number;

  // Broadcasts successful Entities Types creation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Entities Types creation events together with their error codes
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Broadcasts standalone page window open events
  @Output() loadedStandalonePage: EventEmitter<boolean> = new EventEmitter<boolean>();

  // Broadcasts first window open events
  @Output() loadedFirstPage: EventEmitter<boolean> = new EventEmitter<boolean>();

  // Broadcasts nested window open events
  @Output() loadedNestedPage: EventEmitter<boolean> = new EventEmitter<boolean>();

  // Broadcasts last window open events
  @Output() loadedLastPage: EventEmitter<boolean> = new EventEmitter<boolean>();

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
    private cd: ChangeDetectorRef,
    private log: NGXLogger) {

  }


  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Mark Init as complete
    this.log.trace(`${LOG_PREFIX} Init completed`);

  }



  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy`);

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
            contextId: this.contextId,
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

                // Mark 'singular name exists' as true
                this.log.trace(`${LOG_PREFIX} Marking 'singular name exists' as true`);
                return { 'exists': true };

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
            contextId: this.contextId,
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

                // Mark 'plural name exists' as true
                this.log.trace(`${LOG_PREFIX} Marking 'plural name exists' as true`);
                return { 'exists': true };

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
   * Validates and saves a new Entities Types Record.
   * Emits a succeeded or failed event depending on whether the save request succeeded or failed respectively
   * Error 400 = Indicates that a user error was encountered
   * Error 500 = Indicates that a system error was encountered
   */
  public save(): void {

    this.log.trace(`${LOG_PREFIX} Entering save()`);

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
        .createEntityType(
          new EntityType({
            data: {
              contextId: this.contextId,
              name,
              plural,
              optionsTypesIds: this.getSelectedOptionsTypesIds()
            },
            version: null
          }))
        .subscribe({
          next: (response: EntityType) => {

            // The Entity Type Record was saved successfully
            this.log.trace(`${LOG_PREFIX} Entity Type Record was saved successfuly`);

            // Return the page to the default page in case the user elects to continue adding records
            this.log.trace(`${LOG_PREFIX} Returning the page to the default page in case the user elects to continue adding records`);
            this.page = "default";

            // Reset the forms
            this.log.trace(`${LOG_PREFIX} Resetting the forms`);
            this.entitiesTypesForm.controls['name'].reset();
            this.entitiesTypesForm.controls['plural'].reset();
            this.optionsTypes.length = 0;

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
