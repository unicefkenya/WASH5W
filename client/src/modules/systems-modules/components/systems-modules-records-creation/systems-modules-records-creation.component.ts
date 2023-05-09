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
import { SystemModule } from '@modules/systems-modules/models/system-module.model';
import { SystemsModulesDataService } from '@modules/systems-modules/services/systems-modules-data.service';
import { NGXLogger } from 'ngx-logger';
import { map } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { of } from 'rxjs/internal/observable/of';

const LOG_PREFIX: string = "[Systems Modules Records Creation Component]";

@Component({
  selector: 'sb-systemsModules-records-creation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './systems-modules-records-creation.component.html',
  styleUrls: ['systems-modules-records-creation.component.scss'],
})
export class SystemsModulesRecordsCreationComponent implements OnInit, OnDestroy {

  // Broadcasts successful Systems Modules creation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Systems Modules creation events together with their error plurals
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Defines Systems Modules reactive form controls group
  public systemsModulesForm = new FormGroup({

    name: new FormControl<string | null>('',
      [Validators.required, Validators.minLength(2), Validators.maxLength(250)],
      [this.nameExists()]),
    enabled: new FormControl<boolean>(false),
    customisable: new FormControl<boolean>(false)

  });


  constructor(
    private systemsModulesDataService: SystemsModulesDataService,
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
   *Establishes whether the field is enabled
   * @returns True or False
   */
  public isEnabled(): boolean {

    this.log.trace(`${LOG_PREFIX} Entering isEnabled()`);

    if (this.systemsModulesForm.get('enabled')?.value) {
      return true;
    } else {
      return false;
    }

  }



  /**
   * Establishes whether the field should be customisable
   * @returns True or False
   */
  public isCustomisable(): boolean {

    this.log.trace(`${LOG_PREFIX} Entering isCustomisable()`);

    if (this.systemsModulesForm.get('customisable')?.value) {
      return true;
    } else {
      return false;
    }

  }




  /**
   * Flags whether or not the field should be enabled
   * @param e Switch event
   */
   public toggleEnablement(e: any): void {

    this.log.trace(`${LOG_PREFIX} Entering toggleEnablement()`);

    // Check if the switch has been checked
    this.log.trace(`${LOG_PREFIX} Checking if the switch has been checked`);
    if (e.target.checked) {

      // The switch has been checked
      this.log.trace(`${LOG_PREFIX} The switch has been checked`);

      // Update the form
      this.log.trace(`${LOG_PREFIX} Updating the form`);
      this.systemsModulesForm.get('enabled')?.setValue(true);


    } else {

      // The switch has been unchecked
      this.log.trace(`${LOG_PREFIX} The switch has been unchecked`);

      // Update the form
      this.log.trace(`${LOG_PREFIX} Updating the form`);
      this.systemsModulesForm.get('enabled')?.setValue(false);
    }

  }



  /**
   * Flags whether or not the field should be customisable
   * @param e Switch event
   */
  public toggleCustomisability(e: any): void {

    this.log.trace(`${LOG_PREFIX} Entering toggleCustomisability()`);

    // Check if the switch has been checked
    this.log.trace(`${LOG_PREFIX} Checking if the switch has been checked`);
    if (e.target.checked) {

      // The switch has been checked
      this.log.trace(`${LOG_PREFIX} The switch has been checked`);

      // Update the form
      this.log.trace(`${LOG_PREFIX} Updating the form`);
      this.systemsModulesForm.get('customisable')?.setValue(true);


    } else {

      // The switch has been unchecked
      this.log.trace(`${LOG_PREFIX} The switch has been unchecked`);

      // Update the form
      this.log.trace(`${LOG_PREFIX} Updating the form`);
      this.systemsModulesForm.get('customisable')?.setValue(false);

    }

  }




  /**
   * Internal validator that checks whether a proposed System Module's Name already exists
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

        // Attempt retrieving Systems Modules with the same Name
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve Systems Modules with the same Name`);
        return this.systemsModulesDataService
          .getSystemsModules(false, {
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            ids: null,
            name: control.value.trim(),
            enabled: null,
            customisable: null
          })
          .pipe(
            map((systemsModules: SystemModule[]) => {

              // Check if an System Module record with the same Name was found
              this.log.trace(`${LOG_PREFIX} Checking if an System Module record with the same Name was found`);
              if (systemsModules.length > 0) {

                // An System Module record with the same Name was found
                this.log.trace(`${LOG_PREFIX} An System Module record with the same Name was found`);

                // Mark 'Name Exists' as true
                this.log.trace(`${LOG_PREFIX} Marking 'Name Exists' as true`);
                return { 'exists': true };

              } else {

                // An System Module record with the same Name was not found
                this.log.trace(`${LOG_PREFIX} An System Module record with the same Name was not found`);

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
   * Validates and saves a new System Module Record.
   * Emits a succeeded or failed event depending on whether the save request succeeded or failed respectively
   * Error 400 = Indicates that a user error was encountered
   * Error 500 = Indicates that a system error was encountered
   */
  public save(): void {

    this.log.trace(`${LOG_PREFIX} Entering save()`);

    // Check if the data entry form is valid
    this.log.trace(`${LOG_PREFIX} Checking if the data entry form is valid`);
    if (this.systemsModulesForm.valid) {

      // The data entry form is valid
      this.log.trace(`${LOG_PREFIX} The data entry form is valid`);

      // Read in the provided name
      this.log.trace(`${LOG_PREFIX} Reading in the provided name`);
      const name: string | null | undefined = this.systemsModulesForm.get('name')?.value?.trim();
      this.log.debug(`${LOG_PREFIX} System Module Name = ${name}`);

      // Save the record
      this.log.trace(`${LOG_PREFIX} Saving the System Module Record`);
      this.systemsModulesDataService
        .createSystemModule(new SystemModule({
          data: {
            name,
            enabled: this.isEnabled(),
            customisable: this.isCustomisable(),
          },
          version: null
        }))
        .subscribe({
          next: (response: SystemModule) => {

            // The System Module Record was saved successfully
            this.log.trace(`${LOG_PREFIX} System Module Record was saved successfuly`);

            // Reset the form
            this.log.trace(`${LOG_PREFIX} Resetting the form`);
            this.systemsModulesForm.reset();

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The System Module Record was not saved successfully
            this.log.trace(`${LOG_PREFIX} System Module Record was not saved successfuly`);

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
      this.validateAllFormFields(this.systemsModulesForm);

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
