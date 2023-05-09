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
import { AdministrativeUnitsTypesDataService } from '@modules/administrative-units-types/services/administrative-units-types-data.service';
import { AdministrativeUnit } from '@modules/administrative-units/models/administrative-unit.model';
import { AdministrativeUnitsDataService } from '@modules/administrative-units/services/administrative-units-data.service';
import { NGXLogger } from 'ngx-logger';
import { Observable, map, of } from 'rxjs';

const LOG_PREFIX: string = "[Administrative Units Records Creation Component]";

@Component({
  selector: 'sb-administrative-units-records-creation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './administrative-units-records-creation.component.html',
  styleUrls: ['administrative-units-records-creation.component.scss'],
})
export class AdministrativeUnitsRecordsCreationComponent implements OnInit, OnDestroy {

  // Allows the parent component to inject the unique identifier of the parent Context record
  @Input() public typeId!: number;

  // Broadcasts successful Administrative Units creation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Administrative Units creation events together with their error codes
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Defines Administrative Units reactive form controls group
  administrativeUnitsForm = new FormGroup({

    typeId: new FormControl<number | null>(null,
      [Validators.required]),

    name: new FormControl<string | null>('',
      [Validators.required, Validators.minLength(2), Validators.maxLength(250)],
      [this.nameExists()])

  });


  constructor(
    public administrativeUnitsTypesDataService: AdministrativeUnitsTypesDataService,
    private administrativeUnitsDataService: AdministrativeUnitsDataService,
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
    this.administrativeUnitsForm.get('typeId')?.setValue(this.typeId ? this.typeId : null);

    // Return
    this.log.trace(`${LOG_PREFIX} Returning`);
    callback();

  }



  /**
   * Internal validator that checks whether a proposed Administrative Unit's name already exists
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

        // Attempt retrieving Administrative Units Permissions with the same name
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve Administrative Units Permissions with the same name`);
        return this.administrativeUnitsDataService
          .getAdministrativeUnits(false, {
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            id: null,
            typesIds: this.administrativeUnitsForm.get('typeId')?.value? [this.administrativeUnitsForm.get('typeId')?.value as number] : null,
            name: control.value?.trim()
          })
          .pipe(
            map((administrativeUnits: AdministrativeUnit[]) => {

              // Check if an Administrative Unit record with the same name was found
              this.log.trace(`${LOG_PREFIX} Checking if an Administrative Unit record with the same name was found`);
              if (administrativeUnits.length > 0) {

                // A Administrative Unit record with the same name was found
                this.log.trace(`${LOG_PREFIX} A Administrative Unit record with the same name was found`);

                // Mark 'code exists' as true
                this.log.trace(`${LOG_PREFIX} Marking 'code exists' as true`);
                return { 'exists': true };


              } else {

                // A Administrative Unit record with the same name was not found
                this.log.trace(`${LOG_PREFIX} A Administrative Unit record with the same name was not found`);

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
   * Validates and saves a new Administrative Units Record.
   * Emits a succeeded or failed event depending on whether the save request succeeded or failed respectively
   * Error 400 = Indicates that a user error was encountered
   * Error 500 = Indicates that a system error was encountered
   */
  public save(): void {

    this.log.trace(`${LOG_PREFIX} Entering save()`);

    // Check if the data entry form is valid
    this.log.trace(`${LOG_PREFIX} Checking if the data entry form is valid`);
    if (this.administrativeUnitsForm.valid) {

      // The data entry form is valid
      this.log.trace(`${LOG_PREFIX} The data entry form is valid`);

      // Read in the provided parent Administrative Unit Type Id
      this.log.trace(`${LOG_PREFIX} Reading in the provided parent Administrative Unit Type Id`);
      const typeId: number | null | undefined = this.administrativeUnitsForm.get('typeId')?.value;
      this.log.debug(`${LOG_PREFIX} Parent Administrative Unit Type Id = ${typeId}`);

      // Read in the provided name
      this.log.trace(`${LOG_PREFIX} Reading in the provided name`);
      const name: string | null | undefined = this.administrativeUnitsForm.get('name')?.value?.trim();
      this.log.debug(`${LOG_PREFIX} Administrative Unit Name = ${name}`);

      // Save the record
      this.log.trace(`${LOG_PREFIX} Saving the Administrative Units Record`);
      this.administrativeUnitsDataService
        .createAdministrativeUnit(
          new AdministrativeUnit({
            data: {
              typeId,
              name
            },
            version: null
          }))
        .subscribe({
          next: (response: AdministrativeUnit) => {

            // The Administrative Unit Record was saved successfully
            this.log.trace(`${LOG_PREFIX} Administrative Unit Record was saved successfuly`);

            // Reset the forms
            this.log.trace(`${LOG_PREFIX} Resetting the forms`);
            this.administrativeUnitsForm.controls['name'].reset();

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The Administrative Unit Record was not saved successfully
            this.log.trace(`${LOG_PREFIX} Administrative Unit Record was not saved successfuly`);

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
      this.validateAllFormFields(this.administrativeUnitsForm);

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
