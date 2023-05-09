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
import { LogicalScheme } from '@modules/logical-schemes/models/logical-scheme.model';
import { LogicalSchemesDataService } from '@modules/logical-schemes/services/logical-schemes-data.service';
import { NGXLogger } from 'ngx-logger';
import { Observable, map, of } from 'rxjs';

const LOG_PREFIX: string = "[Logical Schemes Records Updation Component]";

@Component({
  selector: 'sb-logical-schemes-records-updation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './logical-schemes-records-updation.component.html',
  styleUrls: ['logical-schemes-records-updation.component.scss'],
})
export class LogicalSchemesRecordsUpdationComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Logical Scheme record
  @Input() public id!: number;

  // Broadcasts successful Logical Schemes updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Logical Schemes updation events together with their error plurals
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the target Logical Scheme record
  public logicalScheme: LogicalScheme | null | undefined = undefined;

  // Defines Logical Schemes reactive form controls group
  public logicalSchemesForm = new FormGroup({

    name: new FormControl<string | null>('', 
    [Validators.required, Validators.minLength(2), Validators.maxLength(250)],
    [this.nameExists()]), 

  });



  constructor(
    private logicalSchemesDataService: LogicalSchemesDataService,
    private log: NGXLogger) {

  }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Logical Scheme field based on the passed in id
    this.initialiseLogicalScheme(() => {

      // Initialise the Logical Scheme updation form based on the target Logical Scheme
      this.initialiseLogicalSchemeUpdationForm(() => {

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
   * Retrieves the Logical Scheme with the injected id and sets it as the Logical Scheme that needs to be updated
   * @param callback The function to call when done
   */
  private initialiseLogicalScheme(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseLogicalScheme()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveLogicalSchemeRecord(this.id, (logicalScheme: LogicalScheme | null) => {

      // Set the target Logical Scheme
      this.log.trace(`${LOG_PREFIX} Setting the target Logical Scheme`);
      this.logicalScheme = logicalScheme;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }


  /**
   * Initialises the Logical Scheme updation form
   * @param callback The function to call when done
   */
  private initialiseLogicalSchemeUpdationForm(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseLogicalSchemeUpdationForm()`);
    this.log.debug(`${LOG_PREFIX} Target Logical Scheme Record = ${JSON.stringify(this.logicalScheme)}`);

    // Initialise the Logical Scheme Records form fields
    this.log.trace(`${LOG_PREFIX} Initialising the Logical Scheme Records form fields`);
    this.logicalSchemesForm.setValue({
      name: (this.logicalScheme && this.logicalScheme.data?.name) ? this.logicalScheme.data?.name : ""
    });

    // Return
    this.log.trace(`${LOG_PREFIX} Returning`);
    callback();

  }

  /**
   * Retrieves a Logical Scheme record given its unique identifier synchronously
   * @param id The unique identifier of the Logical Scheme
   * @param callback The function to call when done
   */
  private retrieveLogicalSchemeRecord(id: number, callback: (logicalScheme: LogicalScheme | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveLogicalSchemeRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the logicalScheme id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the logicalScheme id has been specified`);
    if (id) {

      // The Logical Scheme id has been specified
      this.log.trace(`${LOG_PREFIX} The Logical Scheme id has been specified`);
      this.log.debug(`${LOG_PREFIX} Logical Scheme Id = ${JSON.stringify(id)}`);

      // Try retrieving a Logical Scheme Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve a Logical Scheme Record with the passed in id`);
      const logicalScheme: LogicalScheme | undefined = id ? this.logicalSchemesDataService.records.find(d => d.id == id) : undefined;

      // Check if the Logical Scheme Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the Logical Scheme Record was successfully retrieved`);
      if (logicalScheme) {

        // The Logical Scheme Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Logical Scheme Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} Logical Scheme Record = ${JSON.stringify(this.logicalScheme)}`);

        // Return the Logical Scheme
        this.log.warn(`${LOG_PREFIX} Returning the Logical Scheme`);
        callback(logicalScheme);

      } else {

        // The Logical Scheme Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Logical Scheme Record was not successfully retrieved`);

        // Return null
        this.log.warn(`${LOG_PREFIX} Returning null`);
        callback(null);

      }


    } else {

      // The Logical Scheme id has not been specified
      this.log.error(`${LOG_PREFIX} The Logical Scheme id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }


  /**
   * Internal validator that checks whether a proposed LogicalScheme's name already exists
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

        // Attempt retrieving Logical Schemes with the same name
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve Logical Schemes with the same name`);
        return this.logicalSchemesDataService
          .getLogicalSchemes(false,{
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            name: control.value?.trim()
          })
          .pipe(
            map((logicalSchemes: LogicalScheme[]) => {

              // Check if a Logical Scheme record with the same name was found
              this.log.trace(`${LOG_PREFIX} Checking if a Logical Scheme record with the same name was found`);

              if (logicalSchemes.length > 0) {

                // An Logical Scheme record with the same name was found
                this.log.trace(`${LOG_PREFIX} An Logical Scheme record with the same name was found`);

                // Retrieve the Logical Scheme record with the specified name
                this.log.trace(`${LOG_PREFIX} Retrieving the Logical Scheme record with the specified name`);
                const logicalScheme: LogicalScheme | undefined = logicalSchemes.find(s => s.data.name?.toLowerCase() == control.value.toLowerCase());
                this.log.trace(`${LOG_PREFIX} Logical Scheme record = ${JSON.stringify(logicalScheme)}`);

                // Check if the Logical Scheme record's identity is different from the current Logical Scheme record's identity
                this.log.trace(`${LOG_PREFIX} Checking if the Logical Scheme record's identity is different from the current Logical Scheme record's identity`);

                if (logicalScheme && logicalScheme.id != this.id) {

                  // The Logical Scheme record's identity is different from the current Logical Scheme record's identity
                  this.log.trace(`${LOG_PREFIX} The Logical Scheme record's identity is different from the current Logical Scheme record's identity`);

                  // Mark 'name exists' as true
                  this.log.trace(`${LOG_PREFIX} Marking 'name exists' as true`);
                  return { 'exists': true };

                } else {

                  // The Logical Scheme record's identity is not different from the current Logical Scheme record's identity
                  this.log.trace(`${LOG_PREFIX} The Logical Scheme record's identity is not different from the current Logical Scheme record's identity`);

                  // Mark 'name exists' as false
                  this.log.trace(`${LOG_PREFIX} Marking 'name exists' as false`);
                  return null;
                }


              } else {

                // An Logical Scheme record with the same name was not found
                this.log.trace(`${LOG_PREFIX} An Logical Scheme record with the same name was not found`);

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
   * Validates and saves a new Logical Scheme Record.
   * Emits a succeeded or failed event depending on whether the save request succeeded or failed respectively
   * Error 400 = Indicates that a user error was encountered
   * Error 500 = Indicates that a system error was encountered
   */
  public save(): void {

    this.log.trace(`${LOG_PREFIX} Entering save()`);

    // Check if the target Logical Scheme record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Logical Scheme record was successfully initialised()`);
    if (this.logicalScheme) {

      // The target Logical Scheme record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Logical Scheme record was successfully initialised()`);

      // Check if the data entry form is valid
      this.log.trace(`${LOG_PREFIX} Checking if the data entry form is valid`);
      if (this.logicalSchemesForm.valid) {

        // The data entry form is valid
        this.log.trace(`${LOG_PREFIX} The data entry form is valid`);    

      // Read in the provided name
      this.log.trace(`${LOG_PREFIX} Reading in the provided name`);
      const name: string | null | undefined = this.logicalSchemesForm.get('name')?.value?.trim();
      this.log.debug(`${LOG_PREFIX} Logical Scheme Name = ${name}`);

        // Save the record
        this.log.trace(`${LOG_PREFIX} Saving the Logical Scheme Record`);
        this.logicalSchemesDataService
          .updateLogicalScheme(Object.assign(this.logicalScheme, { data: { name} }))
          .subscribe({
            next: (response: LogicalScheme) => {

              // The Logical Scheme Record was saved successfully
              this.log.trace(`${LOG_PREFIX} The Logical Scheme Record was successfuly updated`);

              // Reset the form
              this.log.trace(`${LOG_PREFIX} Resetting the form`);
              this.logicalSchemesForm.reset();

              // Emit a 'succeeded' event
              this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
              this.succeeded.emit();
            },
            error: (error: any) => {

              // The Logical Scheme Record was not saved successfully
              this.log.trace(`${LOG_PREFIX} The Logical Scheme Record was not successfuly updated`);

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
        this.validateAllFormFields(this.logicalSchemesForm);

        // Emit an 'invalid' event
        this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
        this.failed.emit(400);

      }

    } else {
      // The target Logical Scheme record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Logical Scheme record was not successfully initialised()`);

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
