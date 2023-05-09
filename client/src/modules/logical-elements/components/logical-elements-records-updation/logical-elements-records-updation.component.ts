import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { LogicalElement } from '@modules/logical-elements/models/logical-element.model';
import { LogicalElementsDataService } from '@modules/logical-elements/services/logical-elements-data.service';
import { LogicalElementsTypesDataService } from '@modules/logical-elements-types/services/logical-elements-types-data.service';
import { NGXLogger } from 'ngx-logger';
import { Observable, map, of } from 'rxjs';
import { ContextsDataService } from '@modules/contexts/services/contexts-data.service';

const LOG_PREFIX: string = "[Logical Elements Records Updation Component]";

@Component({
  selector: 'sb-logical-elements-records-updation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './logical-elements-records-updation.component.html',
  styleUrls: ['logical-elements-records-updation.component.scss'],
})
export class LogicalElementsRecordsUpdationComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Logical Element record
  @Input() public id!: number;

  // Broadcasts successful Logical Elements updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Logical Elements updation events together with their error codes
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the Logical Element record with the passed in id
  public logicalElement: LogicalElement | null | undefined;

  // Defines Logical Elements reactive form controls group
  logicalElementsForm = new FormGroup({

    typeId: new FormControl<number | null>(null,
      [Validators.required]),

    no: new FormControl<string | null>('',
      [Validators.required, Validators.minLength(1), Validators.maxLength(50)],
      [this.noExists()]),

    name: new FormControl<string | null>('',
      [Validators.required, Validators.minLength(2), Validators.maxLength(250)],
      [this.nameExists()]),

    description: new FormControl<string | null>('',
      [Validators.maxLength(500)])

  });

  constructor(
    public contextsDataService: ContextsDataService,
    public logicalElementsTypesDataService: LogicalElementsTypesDataService,
    private logicalElementsDataService: LogicalElementsDataService,
    private log: NGXLogger) {

  }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Logical Element field based on the passed in id
    this.initialiseLogicalElement(() => {

      // Initialise the Logical Element updation form based on the target Context
      this.initialiseLogicalElementUpdationForm(() => {

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
   * Retrieves the Logical Element with the injected id and sets it as the Logical Element that needs to be updated
   * @param callback The function to call when done
   */
  private initialiseLogicalElement(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseLogicalElement()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveLogicalElementRecord(this.id, (logicalElement: LogicalElement | null) => {

      // Set the target Logical Element
      this.log.trace(`${LOG_PREFIX} Setting the target Logical Element`);
      this.logicalElement = logicalElement;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }


  /**
   * Initialises the Logical Element updation form
   * @param callback The function to call when done
   */
  private initialiseLogicalElementUpdationForm(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseLogicalElementUpdationForm()`);
    this.log.debug(`${LOG_PREFIX} Target Logical Element Record = ${JSON.stringify(this.logicalElement)}`);

    // Initialise the Logical Element Records form fields
    this.log.trace(`${LOG_PREFIX} Initialising the Logical Element Records form fields`);
    this.logicalElementsForm.setValue({
      typeId: this.logicalElement?.data.typeId ? this.logicalElement.data.typeId : null,
      no: this.logicalElement?.data.no ? this.logicalElement.data.no : null,
      name: this.logicalElement?.data.name ? this.logicalElement.data.name : null,
      description: this.logicalElement?.data.description ? this.logicalElement.data.description : null
    });

    // Return
    this.log.trace(`${LOG_PREFIX} Returning`);
    callback();

  }

  /**
   * Retrieves a Logical Element record given its unique identifier synchronously
   * @param id The unique identifier of the Logical Element
   * @param callback The function to call when done
   */
  private retrieveLogicalElementRecord(id: number, callback: (logicalElement: LogicalElement | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveLogicalElementRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the Logical Element Type Id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the Logical Element Type Id has been specified`);
    if (id) {

      // The Logical Element Type Id has been specified
      this.log.trace(`${LOG_PREFIX} The Logical Element Type Id has been specified`);
      this.log.debug(`${LOG_PREFIX} Logical Element Id = ${JSON.stringify(id)}`);

      // Try retrieving a Logical Element Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve a Logical Element Record with the passed in id`);
      const logicalElement: LogicalElement | undefined = id ? this.logicalElementsDataService.records.find(d => d.id == id) : undefined;

      // Check if the Logical Element Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the Logical Element Record was successfully retrieved`);
      if (logicalElement) {

        // The Logical Element Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Logical Element Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} Logical Element Record = ${JSON.stringify(logicalElement)}`);

        // Return the Logical Element
        this.log.trace(`${LOG_PREFIX} Returning the Logical Element`);
        callback(logicalElement);

      } else {

        // The Logical Element Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Logical Element Record was not successfully retrieved`);

        // Return null
        this.log.warn(`${LOG_PREFIX} Returning null`);
        callback(null);

      }


    } else {

      // The Logical Element Type Id has not been specified
      this.log.error(`${LOG_PREFIX} The Logical Element Type Id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }



  /**
   * Internal validator that checks whether a proposed Logical Element's no already exists
   * @returns 
   */
  private noExists(): AsyncValidatorFn {

    this.log.trace(`${LOG_PREFIX} Entering noExists()`);

    return (control: AbstractControl): Observable<ValidationErrors | null> => {

      // Check if a no value has been provided
      this.log.trace(`${LOG_PREFIX} Check if a no value has been provided`);
      if (control.value) {

        // A no value has been provided
        this.log.trace(`${LOG_PREFIX} A no value has been provided`);

        // Attempt retrieving Logical Elements with the same no
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve Logical Elements with the same no`);
        return this.logicalElementsDataService
          .getLogicalElements(false, {
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            id: null,
            contextId: this.logicalElement?.data.contextId,
            typesIds: this.logicalElementsForm.get('typeId')?.value ? [this.logicalElementsForm.get('typeId')?.value as number] : null,
            no: control.value?.trim(),
            name: null
          })
          .pipe(
            map((logicalElements: LogicalElement[]) => {

              // Check if a Logical Element record with the same no was found
              this.log.trace(`${LOG_PREFIX} Checking if a Logical Element record with the same no was found`);

              if (logicalElements.length > 0) {

                // A Logical Element record with the same no was found
                this.log.trace(`${LOG_PREFIX} A Logical Element record with the same no was found`);

                // Retrieve the Logical Element record with the specified no
                this.log.trace(`${LOG_PREFIX} Retrieving the Logical Element record with the specified no`);
                const logicalElement: LogicalElement | undefined = logicalElements.find(s => s.data.no?.toLowerCase() == control.value.toLowerCase());
                this.log.trace(`${LOG_PREFIX} Logical Element record = ${JSON.stringify(logicalElement)}`);

                // Check if the Logical Element record's identity is different from the current Logical Element record's identity
                this.log.trace(`${LOG_PREFIX} Checking if the Logical Element record's identity is different from the current Logical Element record's identity`);

                if (logicalElement && logicalElement.id != this.id) {

                  // The Logical Element record's identity is different from the current Logical Element record's identity
                  this.log.trace(`${LOG_PREFIX} The Logical Element record's identity is different from the current Logical Element record's identity`);

                  // Mark 'code exists' as true
                  this.log.trace(`${LOG_PREFIX} Marking 'code exists' as true`);
                  return { 'exists': true };

                } else {

                  // The Logical Element record's identity is not different from the current Logical Element record's identity
                  this.log.trace(`${LOG_PREFIX} The Logical Element record's identity is not different from the current Logical Element record's identity`);

                  // Mark 'no exists' as false
                  this.log.trace(`${LOG_PREFIX} Marking 'no exists' as false`);
                  return null
                }


              } else {

                // A Logical Element record with the same no was not found
                this.log.trace(`${LOG_PREFIX} A Logical Element record with the same no was not found`);

                // Mark 'no exists' as false
                this.log.trace(`${LOG_PREFIX} Marking 'no exists' as false`);
                return null

              }
            }

            )
          );

      } else {

        // A no value has not been provided
        this.log.trace(`${LOG_PREFIX} A no value has not been provided`);

        // Mark 'no exists' as false
        this.log.trace(`${LOG_PREFIX} Marking 'no exists' as false`);
        return of(null)
      }

    };

  }



  /**
   * Internal validator that checks whether a proposed Logical Element's name already exists
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

        // Attempt retrieving Logical Elements with the same name
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve Logical Elements with the same name`);
        return this.logicalElementsDataService
          .getLogicalElements(false, {
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            id: null,
            contextId: this.logicalElement?.data.contextId,
            typesIds: this.logicalElementsForm.get('typeId')?.value ? [this.logicalElementsForm.get('typeId')?.value as number] : null,
            no: null,
            name: control.value?.trim()
          })
          .pipe(
            map((logicalElements: LogicalElement[]) => {

              // Check if a Logical Element record with the same name was found
              this.log.trace(`${LOG_PREFIX} Checking if a Logical Element record with the same name was found`);

              if (logicalElements.length > 0) {

                // A Logical Element record with the same name was found
                this.log.trace(`${LOG_PREFIX} A Logical Element record with the same name was found`);

                // Retrieve the Logical Element record with the specified name
                this.log.trace(`${LOG_PREFIX} Retrieving the Logical Element record with the specified name`);
                const logicalElement: LogicalElement | undefined = logicalElements.find(s => s.data.name?.toLowerCase() == control.value.toLowerCase());
                this.log.trace(`${LOG_PREFIX} Logical Element record = ${JSON.stringify(logicalElement)}`);

                // Check if the Logical Element record's identity is different from the current Logical Element record's identity
                this.log.trace(`${LOG_PREFIX} Checking if the Logical Element record's identity is different from the current Logical Element record's identity`);

                if (logicalElement && logicalElement.id != this.id) {

                  // The Logical Element record's identity is different from the current Logical Element record's identity
                  this.log.trace(`${LOG_PREFIX} The Logical Element record's identity is different from the current Logical Element record's identity`);

                  // Mark 'code exists' as true
                  this.log.trace(`${LOG_PREFIX} Marking 'code exists' as true`);
                  return { 'exists': true };

                } else {

                  // The Logical Element record's identity is not different from the current Logical Element record's identity
                  this.log.trace(`${LOG_PREFIX} The Logical Element record's identity is not different from the current Logical Element record's identity`);

                  // Mark 'name exists' as false
                  this.log.trace(`${LOG_PREFIX} Marking 'name exists' as false`);
                  return null
                }


              } else {

                // A Logical Element record with the same name was not found
                this.log.trace(`${LOG_PREFIX} A Logical Element record with the same name was not found`);

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
   * Validates and saves the updated Logical Element Record.
   * Emits a succeeded or failed event in response to whether or not the updation exercise was successful.
   * Error 400 = Indicates an invalid Form Control Entry was supplied.
   * Error 500 = Indicates something unexpected happened at the server side
   */
  public save(): void {


    this.log.trace(`${LOG_PREFIX} Entering save()`);

    // Check if the target Logical Element record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Logical Element record was successfully initialised()`);
    if (this.logicalElement) {

      // The target Logical Element record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Logical Element record was successfully initialised()`);

      // Check if the data entry form is valid
      this.log.trace(`${LOG_PREFIX} Checking if the data entry form is valid`);
      if (this.logicalElementsForm.valid) {

        // The data entry form is valid
        this.log.trace(`${LOG_PREFIX} The data entry form is valid`);

        // Read in the provided parent Type Id
        this.log.trace(`${LOG_PREFIX} Reading in the provided parent Type Id`);
        const typeId: number | null | undefined = this.logicalElementsForm.get('typeId')?.value;
        this.log.debug(`${LOG_PREFIX} Parent Type Id = ${typeId}`);

        // Read in the provided no.
        this.log.trace(`${LOG_PREFIX} Reading in the provided no.`);
        const no: string | null | undefined = this.logicalElementsForm.get('no')?.value?.trim();
        this.log.debug(`${LOG_PREFIX} Logical Element No. = ${no}`);

        // Read in the provided name
        this.log.trace(`${LOG_PREFIX} Reading in the provided name`);
        const name: string | null | undefined = this.logicalElementsForm.get('name')?.value?.trim();
        this.log.debug(`${LOG_PREFIX} Logical Element Name = ${name}`);

        // Read in the provided description
        this.log.trace(`${LOG_PREFIX} Reading in the provided description`);
        const description: string | null | undefined = this.logicalElementsForm.get('description')?.value?.trim();
        this.log.debug(`${LOG_PREFIX} Logical Element Description = ${description}`);

        // Save the record
        this.log.trace(`${LOG_PREFIX} Saving the Logical Elements Record`);
        this.logicalElementsDataService
          .updateLogicalElement(new LogicalElement({
            id: this.logicalElement.id,
            data: {
              contextId: this.logicalElement?.data.contextId,
              typeId,
              no,
              name,
              description
            },
            version: this.logicalElement.version
          }))
          .subscribe({
            next: (response: LogicalElement) => {

              // The Logical Element Record was saved successfully
              this.log.trace(`${LOG_PREFIX} Logical Element Record was saved successfuly`);

              // Reset the forms
              this.log.trace(`${LOG_PREFIX} Resetting the forms`);
              this.logicalElementsForm.controls['no'].reset();
              this.logicalElementsForm.controls['name'].reset();
              this.logicalElementsForm.controls['description'].reset();


              // Emit a 'succeeded' event
              this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
              this.succeeded.emit();
            },
            error: (error: any) => {

              // The Logical Element Record was not saved successfully
              this.log.trace(`${LOG_PREFIX} Logical Element Record was not saved successfuly`);

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
        this.validateAllFormFields(this.logicalElementsForm);

        // Emit an 'invalid' event
        this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
        this.failed.emit(400);
      }


    } else {
      // The target Logical Element record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Logical Element record was not successfully initialised()`);

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
