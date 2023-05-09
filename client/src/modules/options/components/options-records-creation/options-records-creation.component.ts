import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { OptionsTypesDataService } from '@modules/options-types/services/options-types-data.service';
import { Option } from '@modules/options/models/option.model';
import { OptionsDataService } from '@modules/options/services/options-data.service';
import { NGXLogger } from 'ngx-logger';
import { Observable, map, of } from 'rxjs';

const LOG_PREFIX: string = "[Options Records Creation Component]";

@Component({
  selector: 'sb-options-records-creation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './options-records-creation.component.html',
  styleUrls: ['options-records-creation.component.scss'],
})
export class OptionsRecordsCreationComponent implements OnInit, OnDestroy {

  // Allows the parent component to inject the unique identifier of the parent Context record
  @Input() public typeId!: number;

  // Broadcasts successful Options creation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Options creation events together with their error codes
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

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

    // Preselect the active Context in the data tabulation form
    this.initialiseFormGroup(() => {

      // Mark Init as complete
      this.log.trace(`${LOG_PREFIX} Init completed`);

    });

  }



  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy`);

  }

  /**
   * Presets default values in the data creation form
   * @param callback The function to call when done
   */
  private initialiseFormGroup(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseFormGroup()`);

    // Select the active Type
    this.log.trace(`${LOG_PREFIX} Selecting the active Type`);
    this.optionsForm.get('typeId')?.setValue(this.typeId ? Number(this.typeId) : null);

    // Return
    this.log.trace(`${LOG_PREFIX} Returning`);
    callback();

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
          .getOptions(false, {
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            ids: null,
            typeId: this.optionsForm.get('typeId')?.value ? this.optionsForm.get('typeId')?.value as number : null,
            name: control.value?.trim()
          })
          .pipe(
            map((options: Option[]) => {

              // Check if an Option record with the same name was found
              this.log.trace(`${LOG_PREFIX} Checking if an Option record with the same name was found`);
              if (options.length > 0) {

                // A Option record with the same name was found
                this.log.trace(`${LOG_PREFIX} A Option record with the same name was found`);

                // Mark 'code exists' as true
                this.log.trace(`${LOG_PREFIX} Marking 'code exists' as true`);
                return { 'exists': true };


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
   * Validates and saves a new Options Record.
   * Emits a succeeded or failed event depending on whether the save request succeeded or failed respectively
   * Error 400 = Indicates that a user error was encountered
   * Error 500 = Indicates that a system error was encountered
   */
  public save(): void {

    this.log.trace(`${LOG_PREFIX} Entering save()`);

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
        .createOption(
          new Option({
            data: {
              typeId,
              name
            },
            version: null
          }))
        .subscribe({
          next: (response: Option) => {

            // The Option Record was saved successfully
            this.log.trace(`${LOG_PREFIX} Option Record was saved successfuly`);

            // Reset the forms
            this.log.trace(`${LOG_PREFIX} Resetting the forms`);
            this.optionsForm.controls['name'].reset();

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
