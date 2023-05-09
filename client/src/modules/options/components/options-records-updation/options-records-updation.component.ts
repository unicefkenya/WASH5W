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
import { Option } from '@modules/options/models/option.model';
import { OptionsDataService } from '@modules/options/services/options-data.service';
import { OptionsTypesDataService } from '@modules/options-types/services/options-types-data.service';
import { NGXLogger } from 'ngx-logger';
import { Observable, map, of } from 'rxjs';

const LOG_PREFIX: string = "[Options Records Updation Component]";

@Component({
  selector: 'sb-options-records-updation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './options-records-updation.component.html',
  styleUrls: ['options-records-updation.component.scss'],
})
export class OptionsRecordsUpdationComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Option record
  @Input() public id!: number;

  // Broadcasts successful Options updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Options updation events together with their error codes
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the Option record with the passed in id
  public option: Option | null | undefined;

  // Defines Options reactive form controls group
  optionsForm = new FormGroup({

    typeId: new FormControl<number | null>(null,
      [Validators.required]),

    name: new FormControl<string | null>('',
      [Validators.required, Validators.minLength(2), Validators.maxLength(250)],
      [this.nameExists()])

  });

  constructor(
    public optionsTypesDataService: OptionsTypesDataService,
    private optionsDataService: OptionsDataService,
    private log: NGXLogger) {

  }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Option field based on the passed in id
    this.initialiseOption(() => {

      // Initialise the Option updation form based on the target Context
      this.initialiseOptionUpdationForm(() => {

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
   * Retrieves the Option with the injected id and sets it as the Option that needs to be updated
   * @param callback The function to call when done
   */
  private initialiseOption(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseOption()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveOptionRecord(this.id, (option: Option | null) => {

      // Set the target Option
      this.log.trace(`${LOG_PREFIX} Setting the target Option`);
      this.option = option;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }


  /**
   * Initialises the Option updation form
   * @param callback The function to call when done
   */
  private initialiseOptionUpdationForm(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseOptionUpdationForm()`);
    this.log.debug(`${LOG_PREFIX} Target Option Record = ${JSON.stringify(this.option)}`);

    // Initialise the Option Records form fields
    this.log.trace(`${LOG_PREFIX} Initialising the Option Records form fields`);
    this.optionsForm.setValue({
      typeId: this.option?.data.typeId ? this.option.data.typeId : null,
      name: this.option?.data.name ? this.option.data.name : null
    });

    // Return
    this.log.trace(`${LOG_PREFIX} Returning`);
    callback();

  }

  /**
   * Retrieves an Option record given its unique identifier synchronously
   * @param id The unique identifier of the Option
   * @param callback The function to call when done
   */
  private retrieveOptionRecord(id: number, callback: (option: Option | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveOptionRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the Option Type Id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the Option Type Id has been specified`);
    if (id) {

      // The Option Type Id has been specified
      this.log.trace(`${LOG_PREFIX} The Option Type Id has been specified`);
      this.log.debug(`${LOG_PREFIX} Option Id = ${JSON.stringify(id)}`);

      // Try retrieving an Option Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve an Option Record with the passed in id`);
      const option: Option | undefined = id ? this.optionsDataService.records.find(d => d.id == id) : undefined;

      // Check if the Option Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the Option Record was successfully retrieved`);
      if (option) {

        // The Option Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Option Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} Option Record = ${JSON.stringify(option)}`);

        // Return the Option
        this.log.trace(`${LOG_PREFIX} Returning the Option`);
        callback(option);

      } else {

        // The Option Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Option Record was not successfully retrieved`);

        // Return null
        this.log.warn(`${LOG_PREFIX} Returning null`);
        callback(null);

      }


    } else {

      // The Option Type Id has not been specified
      this.log.error(`${LOG_PREFIX} The Option Type Id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }


  /**
   * Internal validator that checks whether a proposed Option's name already exists
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

        // Attempt retrieving Options with the same name
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve Options with the same name`);
        return this.optionsDataService
          .getOptions(false,{
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            ids: null,
            typeId: this.optionsForm.get('typeId')?.value? this.optionsForm.get('typeId')?.value as number : null,
            name: control.value?.trim()
          })
          .pipe(
            map((options: Option[]) => {

              // Check if an Option record with the same name was found
              this.log.trace(`${LOG_PREFIX} Checking if an Option record with the same name was found`);

              if (options.length > 0) {

                // A Option record with the same name was found
                this.log.trace(`${LOG_PREFIX} A Option record with the same name was found`);

                // Retrieve the Option record with the specified name
                this.log.trace(`${LOG_PREFIX} Retrieving the Option record with the specified name`);
                const option: Option | undefined = options.find(s => s.data.name?.toLowerCase() == control.value.toLowerCase());
                this.log.trace(`${LOG_PREFIX} Option record = ${JSON.stringify(option)}`);

                // Check if the Option record's identity is different from the current Option record's identity
                this.log.trace(`${LOG_PREFIX} Checking if the Option record's identity is different from the current Option record's identity`);

                if (option && option.id != this.id) {

                  // The Option record's identity is different from the current Option record's identity
                  this.log.trace(`${LOG_PREFIX} The Option record's identity is different from the current Option record's identity`);

                  // Mark 'code exists' as true
                  this.log.trace(`${LOG_PREFIX} Marking 'code exists' as true`);
                  return { 'exists': true };

                } else {

                  // The Option record's identity is not different from the current Option record's identity
                  this.log.trace(`${LOG_PREFIX} The Option record's identity is not different from the current Option record's identity`);

                  // Mark 'name exists' as false
                  this.log.trace(`${LOG_PREFIX} Marking 'name exists' as false`);
                  return null
                }


              } else {

                // A Option record with the same name was not found
                this.log.trace(`${LOG_PREFIX} A Option record with the same name was not found`);

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
   * Validates and saves the updated Option Record.
   * Emits a succeeded or failed event in response to whether or not the updation exercise was successful.
   * Error 400 = Indicates an invalid Form Control Entry was supplied.
   * Error 500 = Indicates something unexpected happened at the server side
   */
  public save(): void {


    this.log.trace(`${LOG_PREFIX} Entering save()`);

    // Check if the target Option record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Option record was successfully initialised()`);
    if (this.option) {

      // The target Option record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Option record was successfully initialised()`);

      // Check if the data entry form is valid
      this.log.trace(`${LOG_PREFIX} Checking if the data entry form is valid`);
      if (this.optionsForm.valid) {

        // The data entry form is valid
        this.log.trace(`${LOG_PREFIX} The data entry form is valid`);

      // Read in the provided parent Option Type Id
      this.log.trace(`${LOG_PREFIX} Reading in the provided parent Option Type Id`);
      const typeId: number | null | undefined = this.optionsForm.get('typeId')?.value;
      this.log.debug(`${LOG_PREFIX} Parent Option Type Id = ${typeId}`);

      // Read in the provided name
      this.log.trace(`${LOG_PREFIX} Reading in the provided name`);
      const name: string | null | undefined = this.optionsForm.get('name')?.value?.trim();
      this.log.debug(`${LOG_PREFIX} Option Name = ${name}`);

        // Save the record
        this.log.trace(`${LOG_PREFIX} Saving the Options Record`);
        this.optionsDataService
          .updateOption(Object.assign(this.option, {
            data: {
              typeId,
              name
            }
          }))
          .subscribe({
            next: (response: Option) => {

              // The Option Record was saved successfully
              this.log.trace(`${LOG_PREFIX} Option Record was saved successfuly`);

              // Reset the form
              this.log.trace(`${LOG_PREFIX} Resetting the form`);
              this.optionsForm.reset();

              // Emit a 'succeeded' event
              this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
              this.succeeded.emit();
            },
            error: (error: any) => {

              // The Option Record was not saved successfully
              this.log.trace(`${LOG_PREFIX} Option Record was not saved successfuly`);

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
        this.validateAllFormFields(this.optionsForm);

        // Emit an 'invalid' event
        this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
        this.failed.emit(400);
      }


    } else {
      // The target Option record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Option record was not successfully initialised()`);

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
