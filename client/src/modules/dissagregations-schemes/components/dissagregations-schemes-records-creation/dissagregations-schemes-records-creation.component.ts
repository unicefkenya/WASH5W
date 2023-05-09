import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { DissagregationScheme } from '@modules/dissagregations-schemes/models/dissagregation-scheme.model';
import { DissagregationsSchemesDataService } from '@modules/dissagregations-schemes/services/dissagregations-schemes-data.service';
import { NGXLogger } from 'ngx-logger';
import { map } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { of } from 'rxjs/internal/observable/of';

const LOG_PREFIX: string = "[Dissagregations Schemes Records Creation Component]";

@Component({
  selector: 'sb-dissagregationsSchemes-records-creation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dissagregations-schemes-records-creation.component.html',
  styleUrls: ['dissagregations-schemes-records-creation.component.scss'],
})
export class DissagregationsSchemesRecordsCreationComponent implements OnInit, OnDestroy {

  // Broadcasts successful Dissagregations Schemes creation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Dissagregations Schemes creation events together with their error plurals
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Defines Dissagregations Schemes reactive form controls group
  public dissagregationsSchemesForm = new FormGroup({

    name: new FormControl<string | null>('', 
    [Validators.required, Validators.minLength(2), Validators.maxLength(250)],
    [this.nameExists()])   
 
  });


  constructor(
    private dissagregationsSchemesDataService: DissagregationsSchemesDataService,
    private log: NGXLogger) {

  }


  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Mark Init as complete
    this.log.trace(`${LOG_PREFIX} Init completed`);

  }


  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }


  /**
   * Internal validator that checks whether a proposed Dissagregation Scheme's Name already exists
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

        // Attempt retrieving Dissagregations Schemes with the same Name
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve Dissagregations Schemes with the same Name`);
        return this.dissagregationsSchemesDataService
          .getDissagregationsSchemes(false,{
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            ids: null,
            name: control.value.trim(),
          })
          .pipe(
            map((dissagregationsSchemes: DissagregationScheme[]) => {

              // Check if an Dissagregation Scheme record with the same Name was found
              this.log.trace(`${LOG_PREFIX} Checking if an Dissagregation Scheme record with the same Name was found`);
              if (dissagregationsSchemes.length > 0) {

                // An Dissagregation Scheme record with the same Name was found
                this.log.trace(`${LOG_PREFIX} An Dissagregation Scheme record with the same Name was found`);

                // Mark 'Name Exists' as true
                this.log.trace(`${LOG_PREFIX} Marking 'Name Exists' as true`);
                return { 'exists': true };

              } else {

                // An Dissagregation Scheme record with the same Name was not found
                this.log.trace(`${LOG_PREFIX} An Dissagregation Scheme record with the same Name was not found`);

                // Mark 'Name Exists' as false
                this.log.trace(`${LOG_PREFIX} Marking 'Name Exists' as false`);
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
   * Validates and saves a new Dissagregation Scheme Record.
   * Emits a succeeded or failed event depending on whether the save request succeeded or failed respectively
   * Error 400 = Indicates that a user error was encountered
   * Error 500 = Indicates that a system error was encountered
   */
  public save(): void {

    this.log.trace(`${LOG_PREFIX} Entering save()`);

    // Check if the data entry form is valid
    this.log.trace(`${LOG_PREFIX} Checking if the data entry form is valid`);
    if (this.dissagregationsSchemesForm.valid) {

      // The data entry form is valid
      this.log.trace(`${LOG_PREFIX} The data entry form is valid`);

      // Read in the provided name
      this.log.trace(`${LOG_PREFIX} Reading in the provided name`);
      const name: string | null | undefined = this.dissagregationsSchemesForm.get('name')?.value?.trim();
      this.log.debug(`${LOG_PREFIX} Dissagregation Scheme Name = ${name}`);           

      // Save the record
      this.log.trace(`${LOG_PREFIX} Saving the Dissagregation Scheme Record`);
      this.dissagregationsSchemesDataService
        .createDissagregationScheme(new DissagregationScheme({ data: { name}, version: null }))
        .subscribe({
          next: (response: DissagregationScheme) => {

            // The Dissagregation Scheme Record was saved successfully
            this.log.trace(`${LOG_PREFIX} Dissagregation Scheme Record was saved successfuly`);

            // Reset the form
            this.log.trace(`${LOG_PREFIX} Resetting the form`);
            this.dissagregationsSchemesForm.reset();

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The Dissagregation Scheme Record was not saved successfully
            this.log.trace(`${LOG_PREFIX} Dissagregation Scheme Record was not saved successfuly`);

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
      this.validateAllFormFields(this.dissagregationsSchemesForm);

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
