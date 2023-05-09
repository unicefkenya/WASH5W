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
import { AdministrativeSystem } from '@modules/administrative-systems/models/administrative-system.model';
import { AdministrativeSystemsDataService } from '@modules/administrative-systems/services/administrative-systems-data.service';
import { NGXLogger } from 'ngx-logger';
import { map } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { of } from 'rxjs/internal/observable/of';

const LOG_PREFIX: string = "[Administrative Systems Records Creation Component]";

@Component({
  selector: 'sb-administrative-systems-records-creation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './administrative-systems-records-creation.component.html',
  styleUrls: ['administrative-systems-records-creation.component.scss'],
})
export class AdministrativeSystemsRecordsCreationComponent implements OnInit, OnDestroy {

  // Broadcasts successful Administrative Systems creation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Administrative Systems creation events together with their error plurals
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Defines Administrative Systems reactive form controls group
  public administrativeSystemsForm = new FormGroup({

    name: new FormControl<string | null>('', 
    [Validators.required, Validators.minLength(2), Validators.maxLength(250)],
    [this.nameExists()])
 
  });


  constructor(
    private administrativeSystemsDataService: AdministrativeSystemsDataService,
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
   * Internal validator that checks whether a proposed AdministrativeSystem's name already exists
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

        // Attempt retrieving Administrative Systems with the same name
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve Administrative Systems with the same name`);
        return this.administrativeSystemsDataService
          .getAdministrativeSystems(false,{
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            name: control.value.trim(),
            id: null
          })
          .pipe(
            map((administrativeSystems: AdministrativeSystem[]) => {

              // Check if an Administrative System record with the same name was found
              this.log.trace(`${LOG_PREFIX} Checking if an Administrative System record with the same name was found`);
              if (administrativeSystems.length > 0) {

                // An Administrative System record with the same name was found
                this.log.trace(`${LOG_PREFIX} An Administrative System record with the same name was found`);

                // Mark 'name exists' as true
                this.log.trace(`${LOG_PREFIX} Marking 'name exists' as true`);
                return { 'exists': true };

              } else {

                // An Administrative System record with the same name was not found
                this.log.trace(`${LOG_PREFIX} An Administrative System record with the same name was not found`);

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
   * Validates and saves a new Administrative System Record.
   * Emits a succeeded or failed event depending on whether the save request succeeded or failed respectively
   * Error 400 = Indicates that a user error was encountered
   * Error 500 = Indicates that a system error was encountered
   */
  public save(): void {

    this.log.trace(`${LOG_PREFIX} Entering save()`);

    // Check if the data entry form is valid
    this.log.trace(`${LOG_PREFIX} Checking if the data entry form is valid`);
    if (this.administrativeSystemsForm.valid) {

      // The data entry form is valid
      this.log.trace(`${LOG_PREFIX} The data entry form is valid`);

      // Read in the provided name
      this.log.trace(`${LOG_PREFIX} Reading in the provided name`);
      const name: string | null | undefined = this.administrativeSystemsForm.get('name')?.value?.trim();
      this.log.debug(`${LOG_PREFIX} Administrative System Name = ${name}`);      

      // Save the record
      this.log.trace(`${LOG_PREFIX} Saving the Administrative System Record`);
      this.administrativeSystemsDataService
        .createAdministrativeSystem(new AdministrativeSystem({ data: { name}, version: null }))
        .subscribe({
          next: (response: AdministrativeSystem) => {

            // The Administrative System Record was saved successfully
            this.log.trace(`${LOG_PREFIX} Administrative System Record was saved successfuly`);

            // Reset the form
            this.log.trace(`${LOG_PREFIX} Resetting the form`);
            this.administrativeSystemsForm.reset();

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The Administrative System Record was not saved successfully
            this.log.trace(`${LOG_PREFIX} Administrative System Record was not saved successfuly`);

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
      this.validateAllFormFields(this.administrativeSystemsForm);

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
