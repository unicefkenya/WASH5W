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
import { Context } from '@modules/contexts/models/context.model';
import { ContextsDataService } from '@modules/contexts/services/contexts-data.service';
import { Timestep } from '@modules/timesteps/models/timestep.model';
import { TimestepsDataService } from '@modules/timesteps/services/timesteps-data.service';
import { NGXLogger } from 'ngx-logger';
import { Observable, map, of } from 'rxjs';

const LOG_PREFIX: string = "[Contexts Records Updation Component]";

@Component({
  selector: 'sb-contexts-records-updation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contexts-records-updation.component.html',
  styleUrls: ['contexts-records-updation.component.scss'],
})
export class ContextsRecordsUpdationComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Context record
  @Input() public id!: number;

  // Broadcasts successful Contexts updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Contexts updation events together with their error abbreviations
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the target Context record
  public context: Context | null | undefined = undefined;

  // Keeps tabs of the selected timestep
  private timestep: { id: number | null | undefined; name: string | null | undefined } | null | undefined = null;  

  // Defines Contexts reactive form controls group
  public contextsForm = new FormGroup({

    abbreviation: new FormControl<string | null>('', 
    [Validators.required, Validators.minLength(2), Validators.maxLength(250)],
    [this.abbreviationExists()]),    

    name: new FormControl<string | null>('', 
    [Validators.required, Validators.minLength(2), Validators.maxLength(250)],
    [this.nameExists()]),

    timestep: new FormControl<number | null>(null,
      [Validators.required]),    

    description: new FormControl<string | null>('', 
    [Validators.maxLength(500)])    

  });



  constructor(
    public contextsDataService: ContextsDataService,
    public timestepsDataService: TimestepsDataService,
    private log: NGXLogger) {

  }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Context field based on the passed in id
    this.initialiseContext(() => {

      // Initialise the Context updation form based on the target Context
      this.initialiseContextUpdationForm(() => {

        // Init the local timestep
        this.timestep = Object.assign({}, this.context?.data.timestep);

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
   * Retrieves the Context with the injected id and sets it as the Context that needs to be updated
   * @param callback The function to call when done
   */
  private initialiseContext(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseContext()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveContextRecord(this.id, (context: Context | null) => {

      // Set the target Context
      this.log.trace(`${LOG_PREFIX} Setting the target Context`);
      this.context = context;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }


  /**
   * Initialises the Context updation form
   * @param callback The function to call when done
   */
  private initialiseContextUpdationForm(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseContextUpdationForm()`);
    this.log.debug(`${LOG_PREFIX} Target Context Record = ${JSON.stringify(this.context)}`);

    // Initialise the Context Records form fields
    this.log.trace(`${LOG_PREFIX} Initialising the Context Records form fields`);
    this.contextsForm.setValue({
      name: (this.context && this.context.data?.name) ? this.context.data?.name : "",
      abbreviation: (this.context && this.context.data?.abbreviation) ? this.context.data.abbreviation : "",
      timestep: (this.context && this.context.data?.timestep?.id) ? this.context.data.timestep.id: null,
      description: (this.context && this.context.data?.description) ? this.context.data.description : ""
    });

    // Return
    this.log.trace(`${LOG_PREFIX} Returning`);
    callback();

  }

  /**
   * Retrieves a Context record given its unique identifier synchronously
   * @param id The unique identifier of the Context
   * @param callback The function to call when done
   */
  private retrieveContextRecord(id: number, callback: (context: Context | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveContextRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the context id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the context id has been specified`);
    if (id) {

      // The context id has been specified
      this.log.trace(`${LOG_PREFIX} The context id has been specified`);
      this.log.debug(`${LOG_PREFIX} Context Id = ${JSON.stringify(id)}`);

      // Try retrieving a Context Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve a Context Record with the passed in id`);
      const context: Context | undefined = id ? this.contextsDataService.records.find(d => d.id == id) : undefined;

      // Check if the Context Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the Context Record was successfully retrieved`);
      if (context) {

        // The Context Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Context Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} Context Record = ${JSON.stringify(this.context)}`);

        // Return the Context
        this.log.warn(`${LOG_PREFIX} Returning the Context`);
        callback(context);

      } else {

        // The Context Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Context Record was not successfully retrieved`);

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
   * Keep tabs of timestep selection events and updates the local selected timestep field
   * @param selectedTimestep The selected timestep
   */
   public onTimestepChange() {

    this.log.trace(`${LOG_PREFIX} Entering onTimestepChange()`);

      // Read in the selected timestep
      this.log.trace(`${LOG_PREFIX} Reading in the selected timestep`);
      const timestepId: number | null | undefined = this.contextsForm.get('timestep')?.value;
      this.log.debug(`${LOG_PREFIX} Timestep Id = ${timestepId}`);    

      // Retrieve the timestep with the selected id
      this.log.trace(`${LOG_PREFIX} Retrieving the timestep with the selected id`);
      if(timestepId) {

        this.timestepsDataService.getTimestepById$(timestepId).subscribe({
          next: (selectedTimestep: Timestep) => {
            this.timestep = {
              id: selectedTimestep.id,
              name: selectedTimestep.data.name
            }
          }
        })
      } else {
        this.timestep = null;
      }
    
  }
  
  /**
   * Internal validator that checks whether a proposed Context's abbreviation already exists
   * @returns 
   */
   private abbreviationExists(): AsyncValidatorFn {

    this.log.trace(`${LOG_PREFIX} Entering abbreviationExists()`);

    return (control: AbstractControl): Observable<ValidationErrors | null> => {

      // Check if an abbreviation value has been provided
      this.log.trace(`${LOG_PREFIX} Check if an abbreviation value has been provided`);
      if (control.value) {

        // An abbreviation value has been provided
        this.log.trace(`${LOG_PREFIX} An abbreviation value has been provided`);

        // Attempt retrieving Contexts with the same abbreviation
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve Contexts with the same abbreviation`);
        return this.contextsDataService
          .getContexts(false,{
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            ids: null,
            abbreviation: control.value,
            name: null
          })
          .pipe(
            map((contexts: Context[]) => {

              // Check if a Context record with the same abbreviation was found
              this.log.trace(`${LOG_PREFIX} Checking if a Context record with the same abbreviation was found`);

              if (contexts.length > 0) {

                // A Context record with the same abbreviation was found
                this.log.trace(`${LOG_PREFIX} A Context record with the same abbreviation was found`);

                // Retrieve the Context record with the specified abbreviation
                this.log.trace(`${LOG_PREFIX} Retrieving the Context record with the specified abbreviation`);
                const context: Context | undefined = contexts.find(s => s.data.abbreviation?.toLowerCase() == control.value.toLowerCase());
                this.log.trace(`${LOG_PREFIX} Context record = ${JSON.stringify(context)}`);

                // Check if the Context record's identity is different from the current Context record's identity
                this.log.trace(`${LOG_PREFIX} Checking if the Context record's identity is different from the current Context record's identity`);

                if (context && context.id != this.id) {

                  // The Context record's identity is different from the current Context record's identity
                  this.log.trace(`${LOG_PREFIX} The Context record's identity is different from the current Context record's identity`);

                  // Mark 'abbreviation exists' as true
                  this.log.trace(`${LOG_PREFIX} Marking 'abbreviation exists' as true`);
                  return { 'exists': true };

                } else {

                  // The Context record's identity is not different from the current Context record's identity
                  this.log.trace(`${LOG_PREFIX} The Context record's identity is not different from the current Context record's identity`);

                  // Mark 'abbreviation exists' as false
                  this.log.trace(`${LOG_PREFIX} Marking 'abbreviation exists' as false`);
                  return null;
                }


              } else {

                // A Context record with the same abbreviation was not found
                this.log.trace(`${LOG_PREFIX} A Context record with the same abbreviation was not found`);

                // Mark 'abbreviation exists' as false
                this.log.trace(`${LOG_PREFIX} Marking 'abbreviation exists' as false`);
                return null;

              }
            }

            )
          );

      } else {

        // An abbreviation value has not been provided
        this.log.trace(`${LOG_PREFIX} An abbreviation value has not been provided`);

        // Mark 'abbreviation exists' as false
        this.log.trace(`${LOG_PREFIX} Marking 'abbreviation exists' as false`);
        return of(null);
      }

    };

  }



  /**
   * Internal validator that checks whether a proposed Context's name already exists
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

        // Attempt retrieving Contexts with the same name
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve Contexts with the same name`);
        return this.contextsDataService
          .getContexts(false,{
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            ids: null,
            abbreviation: null,
            name: control.value?.trim()
          })
          .pipe(
            map((contexts: Context[]) => {

              // Check if a Context record with the same name was found
              this.log.trace(`${LOG_PREFIX} Checking if a Context record with the same name was found`);

              if (contexts.length > 0) {

                // A Context record with the same name was found
                this.log.trace(`${LOG_PREFIX} A Context record with the same name was found`);

                // Retrieve the Context record with the specified name
                this.log.trace(`${LOG_PREFIX} Retrieving the Context record with the specified name`);
                const context: Context | undefined = contexts.find(s => s.data.name?.toLowerCase() == control.value.toLowerCase());
                this.log.trace(`${LOG_PREFIX} Context record = ${JSON.stringify(context)}`);

                // Check if the Context record's identity is different from the current Context record's identity
                this.log.trace(`${LOG_PREFIX} Checking if the Context record's identity is different from the current Context record's identity`);

                if (context && context.id != this.id) {

                  // The Context record's identity is different from the current Context record's identity
                  this.log.trace(`${LOG_PREFIX} The Context record's identity is different from the current Context record's identity`);

                  // Mark 'name exists' as true
                  this.log.trace(`${LOG_PREFIX} Marking 'name exists' as true`);
                  return { 'exists': true };

                } else {

                  // The Context record's identity is not different from the current Context record's identity
                  this.log.trace(`${LOG_PREFIX} The Context record's identity is not different from the current Context record's identity`);

                  // Mark 'name exists' as false
                  this.log.trace(`${LOG_PREFIX} Marking 'name exists' as false`);
                  return null;
                }


              } else {

                // A Context record with the same name was not found
                this.log.trace(`${LOG_PREFIX} A Context record with the same name was not found`);

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
   * Validates and saves a new Context Record.
   * Emits a succeeded or failed event depending on whether the save request succeeded or failed respectively
   * Error 400 = Indicates that a user error was encountered
   * Error 500 = Indicates that a system error was encountered
   */
  public save(): void {

    this.log.trace(`${LOG_PREFIX} Entering save()`);

    // Check if the target Context record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Context record was successfully initialised()`);
    if (this.context) {

      // The target Context record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Context record was successfully initialised()`);

      // Check if the data entry form is valid
      this.log.trace(`${LOG_PREFIX} Checking if the data entry form is valid`);
      if (this.contextsForm.valid) {

        // The data entry form is valid
        this.log.trace(`${LOG_PREFIX} The data entry form is valid`);

      // Read in the provided abbreviation
      this.log.trace(`${LOG_PREFIX} Reading in the provided abbreviation`);
      const abbreviation: string | null | undefined = this.contextsForm.get('abbreviation')?.value?.trim();
      this.log.debug(`${LOG_PREFIX} Context Abbreviation = ${abbreviation}`);      

      // Read in the provided name
      this.log.trace(`${LOG_PREFIX} Reading in the provided name`);
      const name: string | null | undefined = this.contextsForm.get('name')?.value?.trim();
      this.log.debug(`${LOG_PREFIX} Context Name = ${name}`);

      // Read in the provided description
      this.log.trace(`${LOG_PREFIX} Reading in the provided description`);
      const description: string | null | undefined = this.contextsForm.get('description')?.value?.trim();
      this.log.debug(`${LOG_PREFIX} Context Description = ${description}`);  

        // Save the record
        this.log.trace(`${LOG_PREFIX} Saving the Context Record`);
        this.contextsDataService
          .updateContext(Object.assign(this.context, { data: { abbreviation, name, description, schemeId: 1,  timestep: this.timestep } }))
          .subscribe({
            next: (response: Context) => {

              // The Context Record was saved successfully
              this.log.trace(`${LOG_PREFIX} The Context Record was successfuly updated`);

              // Reset the form
              this.log.trace(`${LOG_PREFIX} Resetting the form`);
              this.contextsForm.reset();

              // Emit a 'succeeded' event
              this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
              this.succeeded.emit();
            },
            error: (error: any) => {

              // The Context Record was not saved successfully
              this.log.trace(`${LOG_PREFIX} The Context Record was not successfuly updated`);

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
        this.validateAllFormFields(this.contextsForm);

        // Emit an 'invalid' event
        this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
        this.failed.emit(400);

      }

    } else {
      // The target Context record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Context record was not successfully initialised()`);

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
