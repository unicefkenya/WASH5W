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
import { Unit } from '@modules/units/models/unit.model';
import { UnitsDataService } from '@modules/units/services/units-data.service';
import { NGXLogger } from 'ngx-logger';
import { map } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { of } from 'rxjs/internal/observable/of';

const LOG_PREFIX: string = "[Units Records Creation Component]";

@Component({
  selector: 'sb-units-records-creation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './units-records-creation.component.html',
  styleUrls: ['units-records-creation.component.scss'],
})
export class UnitsRecordsCreationComponent implements OnInit, OnDestroy {

  // Broadcasts successful Units creation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Units creation events together with their error abbreviations
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Defines Units reactive form controls group
  public unitsForm = new FormGroup({

    name: new FormControl<string | null>('', 
    [Validators.required, Validators.minLength(2), Validators.maxLength(250)],
    [this.nameExists()]),    

    abbreviation: new FormControl<string | null>('', 
    [Validators.required, Validators.minLength(1), Validators.maxLength(50)],
    [this.abbreviationExists()])
 
  });


  constructor(
    private unitsDataService: UnitsDataService,
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
   * Internal validator that checks whether a proposed Unit's name already exists
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

        // Attempt retrieving Units with the same name
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve Units with the same name`);
        return this.unitsDataService
          .getUnits(false,{
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            id: null,
            name: control.value.trim(),            
            abbreviation: null
          })
          .pipe(
            map((units: Unit[]) => {

              // Check if a Unit record with the same name was found
              this.log.trace(`${LOG_PREFIX} Checking if a Unit record with the same name was found`);
              if (units.length > 0) {

                // An Unit record with the same name was found
                this.log.trace(`${LOG_PREFIX} An Unit record with the same name was found`);

                // Mark 'name exists' as true
                this.log.trace(`${LOG_PREFIX} Marking 'name exists' as true`);
                return { 'exists': true };

              } else {

                // An Unit record with the same name was not found
                this.log.trace(`${LOG_PREFIX} An Unit record with the same name was not found`);

                // Mark 'name exists' as false
                this.log.trace(`${LOG_PREFIX} Marking 'name exists' as false`);
                return null;

              }
            }

            )
          )

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
   * Internal validator that checks whether a proposed Unit's abbreviation already exists
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

        // Attempt retrieving Units with the same abbreviation
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve Units with the same abbreviation`);
        return this.unitsDataService
          .getUnits(false,{
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            id: null,
            name: null,
            abbreviation: control.value
          })
          .pipe(
            map((units: Unit[]) => {

              // Check if a Unit record with the same abbreviation was found
              this.log.trace(`${LOG_PREFIX} Checking if a Unit record with the same abbreviation was found`);
              if (units.length > 0) {

                // An Unit record with the same abbreviation was found
                this.log.trace(`${LOG_PREFIX} An Unit record with the same abbreviation was found`);

                // Mark 'abbreviation exists' as true
                this.log.trace(`${LOG_PREFIX} Marking 'abbreviation exists' as true`);
                return { 'exists': true };

              } else {

                // An Unit record with the same abbreviation was not found
                this.log.trace(`${LOG_PREFIX} An Unit record with the same abbreviation was not found`);

                // Mark 'abbreviation exists' as false
                this.log.trace(`${LOG_PREFIX} Marking 'abbreviation exists' as false`);
                return null;

              }
            }

            )
          )

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
   * Validates and saves a new Unit Record.
   * Emits a succeeded or failed event depending on whether the save request succeeded or failed respectively
   * Error 400 = Indicates that a user error was encountered
   * Error 500 = Indicates that a system error was encountered
   */
  public save(): void {

    this.log.trace(`${LOG_PREFIX} Entering save()`);

    // Check if the data entry form is valid
    this.log.trace(`${LOG_PREFIX} Checking if the data entry form is valid`);
    if (this.unitsForm.valid) {

      // The data entry form is valid
      this.log.trace(`${LOG_PREFIX} The data entry form is valid`);

      // Read in the provided name
      this.log.trace(`${LOG_PREFIX} Reading in the provided name`);
      const name: string | null | undefined = this.unitsForm.get('name')?.value?.trim();
      this.log.debug(`${LOG_PREFIX} Unit Name = ${name}`);      

      // Read in the provided abbreviation name
      this.log.trace(`${LOG_PREFIX} Reading in the provided abbreviation name`);
      const abbreviation: string | null | undefined = this.unitsForm.get('abbreviation')?.value?.trim();
      this.log.debug(`${LOG_PREFIX} Unit Abbreviation = ${abbreviation}`);           

      // Save the record
      this.log.trace(`${LOG_PREFIX} Saving the Unit Record`);
      this.unitsDataService
        .createUnit(new Unit({ data: { name, abbreviation}, version: null }))
        .subscribe({
          next: (response: Unit) => {

            // The Unit Record was saved successfully
            this.log.trace(`${LOG_PREFIX} Unit Record was saved successfuly`);

            // Reset the forms
            this.log.trace(`${LOG_PREFIX} Resetting the forms`);
            this.unitsForm.controls['name'].reset();

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The Unit Record was not saved successfully
            this.log.trace(`${LOG_PREFIX} Unit Record was not saved successfuly`);

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
      this.validateAllFormFields(this.unitsForm);

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
