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
import { AdministrativeUnitType } from '@modules/administrative-units-types/models/administrative-unit-type.model';
import { AdministrativeUnitsTypesDataService } from '@modules/administrative-units-types/services/administrative-units-types-data.service';
import { NGXLogger } from 'ngx-logger';
import { map } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { of } from 'rxjs/internal/observable/of';

const LOG_PREFIX: string = "[Administrative Units Types Records Creation Component]";

@Component({
  selector: 'sb-administrativeUnitsTypes-records-creation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './administrative-units-types-records-creation.component.html',
  styleUrls: ['administrative-units-types-records-creation.component.scss'],
})
export class AdministrativeUnitsTypesRecordsCreationComponent implements OnInit, OnDestroy {

  // Broadcasts successful Administrative Units Types creation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Administrative Units Types creation events together with their error plurals
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Defines Administrative Units Types reactive form controls group
  public administrativeUnitsTypesForm = new FormGroup({

    name: new FormControl<string | null>('', 
    [Validators.required, Validators.minLength(2), Validators.maxLength(250)],
    [this.nameExists()]),    

    plural: new FormControl<string | null>('', 
    [Validators.required, Validators.minLength(2), Validators.maxLength(250)],
    [this.pluralExists()])
 
  });


  constructor(
    private administrativeUnitsTypesDataService: AdministrativeUnitsTypesDataService,
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
   * Internal validator that checks whether a proposed AdministrativeUnitType's name already exists
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

        // Attempt retrieving Administrative Units Types with the same name
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve Administrative Units Types with the same name`);
        return this.administrativeUnitsTypesDataService
          .getAdministrativeUnitsTypes(false,{
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            id: null,
            name: control.value.trim(),            
            plural: null
          })
          .pipe(
            map((administrativeUnitsTypes: AdministrativeUnitType[]) => {

              // Check if an Administrative Unit Type record with the same name was found
              this.log.trace(`${LOG_PREFIX} Checking if an Administrative Unit Type record with the same name was found`);
              if (administrativeUnitsTypes.length > 0) {

                // An Administrative Unit Type record with the same name was found
                this.log.trace(`${LOG_PREFIX} An Administrative Unit Type record with the same name was found`);

                // Mark 'name exists' as true
                this.log.trace(`${LOG_PREFIX} Marking 'name exists' as true`);
                return { 'exists': true };

              } else {

                // An Administrative Unit Type record with the same name was not found
                this.log.trace(`${LOG_PREFIX} An Administrative Unit Type record with the same name was not found`);

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
   * Internal validator that checks whether a proposed AdministrativeUnitType's plural already exists
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

        // Attempt retrieving Administrative Units Types with the same plural
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve Administrative Units Types with the same plural`);
        return this.administrativeUnitsTypesDataService
          .getAdministrativeUnitsTypes(false,{
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            id: null,
            name: null,
            plural: control.value
          })
          .pipe(
            map((administrativeUnitsTypes: AdministrativeUnitType[]) => {

              // Check if an Administrative Unit Type record with the same plural was found
              this.log.trace(`${LOG_PREFIX} Checking if an Administrative Unit Type record with the same plural was found`);
              if (administrativeUnitsTypes.length > 0) {

                // An Administrative Unit Type record with the same plural was found
                this.log.trace(`${LOG_PREFIX} An Administrative Unit Type record with the same plural was found`);

                // Mark 'plural exists' as true
                this.log.trace(`${LOG_PREFIX} Marking 'plural exists' as true`);
                return { 'exists': true };

              } else {

                // An Administrative Unit Type record with the same plural was not found
                this.log.trace(`${LOG_PREFIX} An Administrative Unit Type record with the same plural was not found`);

                // Mark 'plural exists' as false
                this.log.trace(`${LOG_PREFIX} Marking 'plural exists' as false`);
                return null;

              }
            }

            )
          )

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
   * Validates and saves a new Administrative Unit Type Record.
   * Emits a succeeded or failed event depending on whether the save request succeeded or failed respectively
   * Error 400 = Indicates that a user error was encountered
   * Error 500 = Indicates that a system error was encountered
   */
  public save(): void {

    this.log.trace(`${LOG_PREFIX} Entering save()`);

    // Check if the data entry form is valid
    this.log.trace(`${LOG_PREFIX} Checking if the data entry form is valid`);
    if (this.administrativeUnitsTypesForm.valid) {

      // The data entry form is valid
      this.log.trace(`${LOG_PREFIX} The data entry form is valid`);

      // Read in the provided name
      this.log.trace(`${LOG_PREFIX} Reading in the provided name`);
      const name: string | null | undefined = this.administrativeUnitsTypesForm.get('name')?.value?.trim();
      this.log.debug(`${LOG_PREFIX} Administrative Unit Type Name = ${name}`);      

      // Read in the provided plural name
      this.log.trace(`${LOG_PREFIX} Reading in the provided plural name`);
      const plural: string | null | undefined = this.administrativeUnitsTypesForm.get('plural')?.value?.trim();
      this.log.debug(`${LOG_PREFIX} Administrative Unit Type Plural Name = ${plural}`);           

      // Save the record
      this.log.trace(`${LOG_PREFIX} Saving the Administrative Unit Type Record`);
      this.administrativeUnitsTypesDataService
        .createAdministrativeUnitType(new AdministrativeUnitType({ data: { name, plural}, version: null }))
        .subscribe({
          next: (response: AdministrativeUnitType) => {

            // The Administrative Unit Type Record was saved successfully
            this.log.trace(`${LOG_PREFIX} Administrative Unit Type Record was saved successfuly`);

            // Reset the form
            this.log.trace(`${LOG_PREFIX} Resetting the form`);
            this.administrativeUnitsTypesForm.reset();

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The Administrative Unit Type Record was not saved successfully
            this.log.trace(`${LOG_PREFIX} Administrative Unit Type Record was not saved successfuly`);

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
      this.validateAllFormFields(this.administrativeUnitsTypesForm);

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
