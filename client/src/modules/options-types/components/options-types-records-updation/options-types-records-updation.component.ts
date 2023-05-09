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
import { OptionType } from '@modules/options-types/models/option-type.model';
import { OptionsTypesDataService } from '@modules/options-types/services/options-types-data.service';
import { NGXLogger } from 'ngx-logger';
import { Observable, map, of } from 'rxjs';

const LOG_PREFIX: string = "[Options Types Records Updation Component]";

@Component({
  selector: 'sb-optionsTypes-records-updation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './options-types-records-updation.component.html',
  styleUrls: ['options-types-records-updation.component.scss'],
})
export class OptionsTypesRecordsUpdationComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Option Type record
  @Input() public id!: number;

  // Broadcasts successful Options Types updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Options Types updation events together with their error plurals
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the target Option Type record
  public optionType: OptionType | null | undefined = undefined;

  // Defines Options Types reactive form controls group
  public optionsTypesForm = new FormGroup({

    name: new FormControl<string | null>('',
      [Validators.required, Validators.minLength(2), Validators.maxLength(250)],
      [this.nameExists()])

  });



  constructor(
    private optionsTypesDataService: OptionsTypesDataService,
    private log: NGXLogger) {

  }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Option Type field based on the passed in id
    this.initialiseOptionType(() => {

      // Initialise the Option Type updation form based on the target Option Type
      this.initialiseOptionTypeUpdationForm(() => {

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
   * Retrieves the Option Type with the injected id and sets it as the Option Type that needs to be updated
   * @param callback The function to call when done
   */
  private initialiseOptionType(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseOptionType()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveOptionTypeRecord(this.id, (optionType: OptionType | null) => {

      // Set the target Option Type
      this.log.trace(`${LOG_PREFIX} Setting the target Option Type`);
      this.optionType = optionType;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }


  /**
   * Initialises the Option Type updation form
   * @param callback The function to call when done
   */
  private initialiseOptionTypeUpdationForm(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseOptionTypeUpdationForm()`);
    this.log.debug(`${LOG_PREFIX} Target Option Type Record = ${JSON.stringify(this.optionType)}`);

    // Initialise the Option Type Records form fields
    this.log.trace(`${LOG_PREFIX} Initialising the Option Type Records form fields`);
    this.optionsTypesForm.setValue({
      name: (this.optionType && this.optionType.data?.name) ? this.optionType.data?.name : ""
    });

    // Return
    this.log.trace(`${LOG_PREFIX} Returning`);
    callback();

  }

  /**
   * Retrieves an Option Type record given its unique identifier synchronously
   * @param id The unique identifier of the Option Type
   * @param callback The function to call when done
   */
  private retrieveOptionTypeRecord(id: number, callback: (optionType: OptionType | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveOptionTypeRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the optionType id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the optionType id has been specified`);
    if (id) {

      // The Option Type id has been specified
      this.log.trace(`${LOG_PREFIX} The Option Type id has been specified`);
      this.log.debug(`${LOG_PREFIX} Option Type Id = ${JSON.stringify(id)}`);

      // Try retrieving an Option Type Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve an Option Type Record with the passed in id`);
      const optionType: OptionType | undefined = id ? this.optionsTypesDataService.records.find(d => d.id == id) : undefined;

      // Check if the Option Type Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the Option Type Record was successfully retrieved`);
      if (optionType) {

        // The Option Type Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Option Type Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} Option Type Record = ${JSON.stringify(this.optionType)}`);

        // Return the Option Type
        this.log.warn(`${LOG_PREFIX} Returning the Option Type`);
        callback(optionType);

      } else {

        // The Option Type Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Option Type Record was not successfully retrieved`);

        // Return null
        this.log.warn(`${LOG_PREFIX} Returning null`);
        callback(null);

      }


    } else {

      // The Option Type id has not been specified
      this.log.error(`${LOG_PREFIX} The Option Type id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }



  /**
   * Internal validator that checks whether a proposed Option Type's Name already exists
   * @returns 
   */
  private nameExists(): AsyncValidatorFn {

    this.log.trace(`${LOG_PREFIX} Entering nameExists()`);

    return (control: AbstractControl): Observable<ValidationErrors | null> => {

      // Check if a Name value has been provided
      this.log.trace(`${LOG_PREFIX} Check if a Name value has been provided`);
      if (control.value) {

        // A Name value has been provided
        this.log.trace(`${LOG_PREFIX} A Name value has been provided`);

        // Attempt retrieving Options Types with the same Name
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve Options Types with the same Name`);
        return this.optionsTypesDataService
          .getOptionsTypes(false, {
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            ids: null,
            name: control.value.trim()
          })
          .pipe(
            map((optionsTypes: OptionType[]) => {

              // Check if an Option Type record with the same Name was found
              this.log.trace(`${LOG_PREFIX} Checking if an Option Type record with the same Name was found`);

              if (optionsTypes.length > 0) {

                // An Option Type record with the same Name was found
                this.log.trace(`${LOG_PREFIX} An Option Type record with the same Name was found`);

                // Retrieve the Option Type record with the specified Name
                this.log.trace(`${LOG_PREFIX} Retrieving the Option Type record with the specified Name`);
                const optionType: OptionType | undefined = optionsTypes.find(s => s.data.name?.toLowerCase() == control.value.toLowerCase());
                this.log.trace(`${LOG_PREFIX} Option Type record = ${JSON.stringify(optionType)}`);

                // Check if the Option Type record's identity is different from the current Option Type record's identity
                this.log.trace(`${LOG_PREFIX} Checking if the Option Type record's identity is different from the current Option Type record's identity`);

                if (optionType && optionType.id != this.id) {

                  // The Option Type record's identity is different from the current Option Type record's identity
                  this.log.trace(`${LOG_PREFIX} The Option Type record's identity is different from the current Option Type record's identity`);

                  // Mark 'Name Exists' as true
                  this.log.trace(`${LOG_PREFIX} Marking 'Name Exists' as true`);
                  return { 'exists': true };

                } else {

                  // The Option Type record's identity is not different from the current Option Type record's identity
                  this.log.trace(`${LOG_PREFIX} The Option Type record's identity is not different from the current Option Type record's identity`);

                  // Mark 'Name Exists' as false
                  this.log.trace(`${LOG_PREFIX} Marking 'Name Exists' as false`);
                  return null;
                }


              } else {

                // An Option Type record with the same Name was not found
                this.log.trace(`${LOG_PREFIX} An Option Type record with the same Name was not found`);

                // Mark 'Name exists' as false
                this.log.trace(`${LOG_PREFIX} Marking 'Name exists' as false`);
                return null;

              }
            }

            )
          )

      } else {

        // A Name value has not been provided
        this.log.trace(`${LOG_PREFIX} A Name value has not been provided`);

        // Mark 'Name Exists' as false
        this.log.trace(`${LOG_PREFIX} Marking 'Name Exists' as false`);
        return of(null);
      }

    };

  }

  /**
   * Validates and saves a new Option Type Record.
   * Emits a succeeded or failed event depending on whether the save request succeeded or failed respectively
   * Error 400 = Indicates that a user error was encountered
   * Error 500 = Indicates that a system error was encountered
   */
  public save(): void {

    this.log.trace(`${LOG_PREFIX} Entering save()`);

    // Check if the target Option Type record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Option Type record was successfully initialised()`);
    if (this.optionType) {

      // The target Option Type record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Option Type record was successfully initialised()`);

      // Check if the data entry form is valid
      this.log.trace(`${LOG_PREFIX} Checking if the data entry form is valid`);
      if (this.optionsTypesForm.valid) {

        // The data entry form is valid
        this.log.trace(`${LOG_PREFIX} The data entry form is valid`);

        // Read in the provided name
        this.log.trace(`${LOG_PREFIX} Reading in the provided name`);
        const name: string | null | undefined = this.optionsTypesForm.get('name')?.value?.trim();
        this.log.debug(`${LOG_PREFIX} Option Type Name = ${name}`);

        // Save the record
        this.log.trace(`${LOG_PREFIX} Saving the Option Type Record`);
        this.optionsTypesDataService
          .updateOptionType(Object.assign(this.optionType, { data: { name } }))
          .subscribe({
            next: (response: OptionType) => {

              // The Option Type Record was saved successfully
              this.log.trace(`${LOG_PREFIX} The Option Type Record was successfuly updated`);

              // Reset the form
              this.log.trace(`${LOG_PREFIX} Resetting the form`);
              this.optionsTypesForm.reset();

              // Emit a 'succeeded' event
              this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
              this.succeeded.emit();
            },
            error: (error: any) => {

              // The Option Type Record was not saved successfully
              this.log.trace(`${LOG_PREFIX} The Option Type Record was not successfuly updated`);

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
        this.validateAllFormFields(this.optionsTypesForm);

        // Emit an 'invalid' event
        this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
        this.failed.emit(400);

      }

    } else {
      // The target Option Type record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Option Type record was not successfully initialised()`);

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
