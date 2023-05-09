import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { LogicalElementType } from '@modules/logical-elements-types/models/logical-element-type.model';
import { LogicalElementsTypesDataService } from '@modules/logical-elements-types/services/logical-elements-types-data.service';
import { NGXLogger } from 'ngx-logger';
import { Observable, map, of } from 'rxjs';

const LOG_PREFIX: string = "[Logical Elements Types Records Updation Component]";

@Component({
  selector: 'sb-logicalElementsTypes-records-updation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './logical-elements-types-records-updation.component.html',
  styleUrls: ['logical-elements-types-records-updation.component.scss'],
})
export class LogicalElementsTypesRecordsUpdationComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Logical Element Type record
  @Input() public id!: number;

  // Broadcasts successful Logical Elements Types updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Logical Elements Types updation events together with their error plurals
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the target Logical Element Type record
  public logicalElementType: LogicalElementType | null | undefined = undefined;

  // Defines Logical Elements Types reactive form controls group
  public logicalElementsTypesForm = new FormGroup({

    name: new FormControl<string | null>('', 
    [Validators.required, Validators.minLength(2), Validators.maxLength(250)],
    [this.nameExists()]),     

    plural: new FormControl<string | null>('', 
    [Validators.required, Validators.minLength(2), Validators.maxLength(250)],
    [this.pluralExists()]),    

  });



  constructor(
    private logicalElementsTypesDataService: LogicalElementsTypesDataService,
    private log: NGXLogger) {

  }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Logical Element Type field based on the passed in id
    this.initialiseLogicalElementType(() => {

      // Initialise the Logical Element Type updation form based on the target Logical Element Type
      this.initialiseLogicalElementTypeUpdationForm(() => {

        // Mark Init as complete
        this.log.trace(`${LOG_PREFIX} Init completed`);

      });
    });

  }

  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }

  /**
   * Retrieves the Logical Element Type with the injected id and sets it as the Logical Element Type that needs to be updated
   * @param callback The function to call when done
   */
  private initialiseLogicalElementType(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseLogicalElementType()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveLogicalElementTypeRecord(this.id, (logicalElementType: LogicalElementType | null) => {

      // Set the target Logical Element Type
      this.log.trace(`${LOG_PREFIX} Setting the target Logical Element Type`);
      this.logicalElementType = logicalElementType;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }


  /**
   * Initialises the Logical Element Type updation form
   * @param callback The function to call when done
   */
  private initialiseLogicalElementTypeUpdationForm(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseLogicalElementTypeUpdationForm()`);
    this.log.debug(`${LOG_PREFIX} Target Logical Element Type Record = ${JSON.stringify(this.logicalElementType)}`);

    // Initialise the Logical Element Type Records form fields
    this.log.trace(`${LOG_PREFIX} Initialising the Logical Element Type Records form fields`);
    this.logicalElementsTypesForm.setValue({
      name: (this.logicalElementType && this.logicalElementType.data?.name) ? this.logicalElementType.data?.name : "",
      plural: (this.logicalElementType && this.logicalElementType.data?.plural) ? this.logicalElementType.data?.plural : "",
    });

    // Return
    this.log.trace(`${LOG_PREFIX} Returning`);
    callback();

  }

  /**
   * Retrieves a Logical Element Type record given its unique identifier synchronously
   * @param id The unique identifier of the Logical Element Type
   * @param callback The function to call when done
   */
  private retrieveLogicalElementTypeRecord(id: number, callback: (logicalElementType: LogicalElementType | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveLogicalElementTypeRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the logicalElementType id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the logicalElementType id has been specified`);
    if (id) {

      // The Logical Element Type id has been specified
      this.log.trace(`${LOG_PREFIX} The Logical Element Type id has been specified`);
      this.log.debug(`${LOG_PREFIX} Logical Element Type Id = ${JSON.stringify(id)}`);

      // Try retrieving a Logical Element Type Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve a Logical Element Type Record with the passed in id`);
      const logicalElementType: LogicalElementType | undefined = id ? this.logicalElementsTypesDataService.records.find(d => d.id == id) : undefined;

      // Check if the Logical Element Type Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the Logical Element Type Record was successfully retrieved`);
      if (logicalElementType) {

        // The Logical Element Type Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Logical Element Type Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} Logical Element Type Record = ${JSON.stringify(this.logicalElementType)}`);

        // Return the Logical Element Type
        this.log.warn(`${LOG_PREFIX} Returning the Logical Element Type`);
        callback(logicalElementType);

      } else {

        // The Logical Element Type Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Logical Element Type Record was not successfully retrieved`);

        // Return null
        this.log.warn(`${LOG_PREFIX} Returning null`);
        callback(null);

      }


    } else {

      // The Logical Element Type id has not been specified
      this.log.error(`${LOG_PREFIX} The Logical Element Type id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }



  /**
   * Internal validator that checks whether a proposed LogicalElementType's plural already exists
   * @returns 
   */
   private pluralExists(): AsyncValidatorFn {

    this.log.trace(`${LOG_PREFIX} Entering pluralExists()`);

    return (control: AbstractControl): Observable<ValidationErrors | null> => {

      // Check if a plural value has been provided
      this.log.trace(`${LOG_PREFIX} Check if a plural value has been provided`);
      if (control.value) {

        // A plural value has been provided
        this.log.trace(`${LOG_PREFIX} A plural value has been provided`);

        // Attempt retrieving Logical Elements Types with the same plural
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve Logical Elements Types with the same plural`);
        return this.logicalElementsTypesDataService
          .getLogicalElementsTypes(false,{
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            plural: control.value,
            name: null
          })
          .pipe(
            map((logicalElementsTypes: LogicalElementType[]) => {

              // Check if a Logical Element Type record with the same plural was found
              this.log.trace(`${LOG_PREFIX} Checking if a Logical Element Type record with the same plural was found`);

              if (logicalElementsTypes.length > 0) {

                // An Logical Element Type record with the same plural was found
                this.log.trace(`${LOG_PREFIX} An Logical Element Type record with the same plural was found`);

                // Retrieve the Logical Element Type record with the specified plural
                this.log.trace(`${LOG_PREFIX} Retrieving the Logical Element Type record with the specified plural`);
                const logicalElementType: LogicalElementType | undefined = logicalElementsTypes.find(s => s.data.plural?.toLowerCase() == control.value.toLowerCase());
                this.log.trace(`${LOG_PREFIX} Logical Element Type record = ${JSON.stringify(logicalElementType)}`);

                // Check if the Logical Element Type record's identity is different from the current Logical Element Type record's identity
                this.log.trace(`${LOG_PREFIX} Checking if the Logical Element Type record's identity is different from the current Logical Element Type record's identity`);

                if (logicalElementType && logicalElementType.id != this.id) {

                  // The Logical Element Type record's identity is different from the current Logical Element Type record's identity
                  this.log.trace(`${LOG_PREFIX} The Logical Element Type record's identity is different from the current Logical Element Type record's identity`);

                  // Mark 'plural exists' as true
                  this.log.trace(`${LOG_PREFIX} Marking 'plural exists' as true`);
                  return { 'exists': true };

                } else {

                  // The Logical Element Type record's identity is not different from the current Logical Element Type record's identity
                  this.log.trace(`${LOG_PREFIX} The Logical Element Type record's identity is not different from the current Logical Element Type record's identity`);

                  // Mark 'plural exists' as false
                  this.log.trace(`${LOG_PREFIX} Marking 'plural exists' as false`);
                  return null;
                }


              } else {

                // An Logical Element Type record with the same plural was not found
                this.log.trace(`${LOG_PREFIX} An Logical Element Type record with the same plural was not found`);

                // Mark 'plural exists' as false
                this.log.trace(`${LOG_PREFIX} Marking 'plural exists' as false`);
                return null;

              }
            }

            )
          );

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
   * Internal validator that checks whether a proposed LogicalElementType's name already exists
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

        // Attempt retrieving Logical Elements Types with the same name
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve Logical Elements Types with the same name`);
        return this.logicalElementsTypesDataService
          .getLogicalElementsTypes(false,{
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            plural: null,
            name: control.value?.trim()
          })
          .pipe(
            map((logicalElementsTypes: LogicalElementType[]) => {

              // Check if a Logical Element Type record with the same name was found
              this.log.trace(`${LOG_PREFIX} Checking if a Logical Element Type record with the same name was found`);

              if (logicalElementsTypes.length > 0) {

                // An Logical Element Type record with the same name was found
                this.log.trace(`${LOG_PREFIX} An Logical Element Type record with the same name was found`);

                // Retrieve the Logical Element Type record with the specified name
                this.log.trace(`${LOG_PREFIX} Retrieving the Logical Element Type record with the specified name`);
                const logicalElementType: LogicalElementType | undefined = logicalElementsTypes.find(s => s.data.name?.toLowerCase() == control.value.toLowerCase());
                this.log.trace(`${LOG_PREFIX} Logical Element Type record = ${JSON.stringify(logicalElementType)}`);

                // Check if the Logical Element Type record's identity is different from the current Logical Element Type record's identity
                this.log.trace(`${LOG_PREFIX} Checking if the Logical Element Type record's identity is different from the current Logical Element Type record's identity`);

                if (logicalElementType && logicalElementType.id != this.id) {

                  // The Logical Element Type record's identity is different from the current Logical Element Type record's identity
                  this.log.trace(`${LOG_PREFIX} The Logical Element Type record's identity is different from the current Logical Element Type record's identity`);

                  // Mark 'name exists' as true
                  this.log.trace(`${LOG_PREFIX} Marking 'name exists' as true`);
                  return { 'exists': true };

                } else {

                  // The Logical Element Type record's identity is not different from the current Logical Element Type record's identity
                  this.log.trace(`${LOG_PREFIX} The Logical Element Type record's identity is not different from the current Logical Element Type record's identity`);

                  // Mark 'name exists' as false
                  this.log.trace(`${LOG_PREFIX} Marking 'name exists' as false`);
                  return null;
                }


              } else {

                // An Logical Element Type record with the same name was not found
                this.log.trace(`${LOG_PREFIX} An Logical Element Type record with the same name was not found`);

                // Mark 'name exists' as false
                this.log.trace(`${LOG_PREFIX} Marking 'name exists' as false`);
                return null;

              }
            }

            )
          );

      } else {

        // A name value has not been provided
        this.log.trace(`${LOG_PREFIX} A name value has not been provided`);

        // Mark 'name exists' as false
        this.log.trace(`${LOG_PREFIX} Marking 'name exists' as false`);
        return of(null);
      }

    };

  }




  /**
   * Validates and saves a new Logical Element Type Record.
   * Emits a succeeded or failed event depending on whether the save request succeeded or failed respectively
   * Error 400 = Indicates that a user error was encountered
   * Error 500 = Indicates that a system error was encountered
   */
  public save(): void {

    this.log.trace(`${LOG_PREFIX} Entering save()`);

    // Check if the target Logical Element Type record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Logical Element Type record was successfully initialised()`);
    if (this.logicalElementType) {

      // The target Logical Element Type record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Logical Element Type record was successfully initialised()`);

      // Check if the data entry form is valid
      this.log.trace(`${LOG_PREFIX} Checking if the data entry form is valid`);
      if (this.logicalElementsTypesForm.valid) {

        // The data entry form is valid
        this.log.trace(`${LOG_PREFIX} The data entry form is valid`);

      // Read in the provided plural
      this.log.trace(`${LOG_PREFIX} Reading in the provided plural`);
      const plural: string | null | undefined = this.logicalElementsTypesForm.get('plural')?.value?.trim();
      this.log.debug(`${LOG_PREFIX} Logical Element Type Plural = ${plural}`);      

      // Read in the provided name
      this.log.trace(`${LOG_PREFIX} Reading in the provided name`);
      const name: string | null | undefined = this.logicalElementsTypesForm.get('name')?.value?.trim();
      this.log.debug(`${LOG_PREFIX} Logical Element Type Name = ${name}`);

        // Save the record
        this.log.trace(`${LOG_PREFIX} Saving the Logical Element Type Record`);
        this.logicalElementsTypesDataService
          .updateLogicalElementType(Object.assign(this.logicalElementType, { data: { name, plural} }))
          .subscribe({
            next: (response: LogicalElementType) => {

              // The Logical Element Type Record was saved successfully
              this.log.trace(`${LOG_PREFIX} The Logical Element Type Record was successfuly updated`);

              // Reset the form
              this.log.trace(`${LOG_PREFIX} Resetting the form`);
              this.logicalElementsTypesForm.reset();

              // Emit a 'succeeded' event
              this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
              this.succeeded.emit();
            },
            error: (error: any) => {

              // The Logical Element Type Record was not saved successfully
              this.log.trace(`${LOG_PREFIX} The Logical Element Type Record was not successfuly updated`);

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
        this.validateAllFormFields(this.logicalElementsTypesForm);

        // Emit an 'invalid' event
        this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
        this.failed.emit(400);

      }

    } else {
      // The target Logical Element Type record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Logical Element Type record was not successfully initialised()`);

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
