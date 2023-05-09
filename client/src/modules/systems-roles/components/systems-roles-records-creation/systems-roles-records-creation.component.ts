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
import { SystemRole } from '@modules/systems-roles/models/system-role.model';
import { SystemsRolesDataService } from '@modules/systems-roles/services/systems-roles-data.service';
import { NGXLogger } from 'ngx-logger';
import { map } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { of } from 'rxjs/internal/observable/of';
import { environment } from 'environments/environment';

const LOG_PREFIX: string = "[Systems Roles Records Creation Component]";

@Component({
  selector: 'sb-systemsRoles-records-creation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './systems-roles-records-creation.component.html',
  styleUrls: ['systems-roles-records-creation.component.scss'],
})
export class SystemsRolesRecordsCreationComponent implements OnInit, OnDestroy {

  // Broadcasts successful Systems Roles creation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Systems Roles creation events together with their error plurals
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Defines Systems Roles reactive form controls group
  public systemsRolesForm = new FormGroup({

    code: new FormControl<string | null>('',
      [Validators.required, Validators.minLength(2), Validators.maxLength(250)],
      [this.codeExists()]),

    name: new FormControl<string | null>('',
      [Validators.required, Validators.minLength(2), Validators.maxLength(250)],
      [this.nameExists()]),

    description: new FormControl<string | null>('',
      [Validators.maxLength(500)]),

    homeId: new FormControl<number>(1,
      [Validators.required]),

    customisable: new FormControl<boolean>(true)

  });


  constructor(
    private systemsRolesDataService: SystemsRolesDataService,
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

  public isProductionEnvironment(): boolean {
    return (environment.production);
  }

  public isDevelopmentEnvironment(): boolean {
    return !(environment.production);
  }


  /**
   * Establishes whether the field should be customisable
   * @returns True or False
   */
  public isCustomisable(): boolean {

    this.log.trace(`${LOG_PREFIX} Entering isCustomisable()`);

    if (this.systemsRolesForm.get('customisable')?.value) {
      return true;
    } else {
      return false;
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
      this.systemsRolesForm.get('customisable')?.setValue(true);


    } else {

      // The switch has been unchecked
      this.log.trace(`${LOG_PREFIX} The switch has been unchecked`);

      // Update the form
      this.log.trace(`${LOG_PREFIX} Updating the form`);
      this.systemsRolesForm.get('customisable')?.setValue(false);

    }

  }



  /**
   * Internal validator that checks whether a proposed System Role's Code already exists
   * @returns 
   */
  private codeExists(): AsyncValidatorFn {

    this.log.trace(`${LOG_PREFIX} Entering codeExists()`);

    return (control: AbstractControl): Observable<ValidationErrors | null> => {

      // Check if a Code value has been provided
      this.log.trace(`${LOG_PREFIX} Check if a Code value has been provided`);
      if (control.value) {

        // A Code value has been provided
        this.log.trace(`${LOG_PREFIX} A Code value has been provided`);

        // Attempt retrieving Systems Roles with the same Code
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve Systems Roles with the same Code`);
        return this.systemsRolesDataService
          .getSystemsRoles(false, {
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            ids: null,
            code: control.value.trim(),
            name: null,
          })
          .pipe(
            map((systemsRoles: SystemRole[]) => {

              // Check if an System Role record with the same Code was found
              this.log.trace(`${LOG_PREFIX} Checking if an System Role record with the same Code was found`);
              if (systemsRoles.length > 0) {

                // An System Role record with the same Code was found
                this.log.trace(`${LOG_PREFIX} An System Role record with the same Code was found`);

                // Mark 'Code Exists' as true
                this.log.trace(`${LOG_PREFIX} Marking 'Code Exists' as true`);
                return { 'exists': true };

              } else {

                // An System Role record with the same Code was not found
                this.log.trace(`${LOG_PREFIX} An System Role record with the same Code was not found`);

                // Mark 'Code Exists' as false
                this.log.trace(`${LOG_PREFIX} Marking 'Code Exists' as false`);
                return null;

              }
            }

            )
          )

      } else {

        // A Code value has not been provided
        this.log.trace(`${LOG_PREFIX} A Code value has not been provided`);

        // Mark 'Code Exists' as false
        this.log.trace(`${LOG_PREFIX} Marking 'Code Exists' as false`);
        return of(null);
      }

    };

  }



  /**
   * Internal validator that checks whether a proposed System Role's Name already exists
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

        // Attempt retrieving Systems Roles with the same Name
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve Systems Roles with the same Name`);
        return this.systemsRolesDataService
          .getSystemsRoles(false, {
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            ids: null,
            code: null,
            name: control.value.trim()
          })
          .pipe(
            map((systemsRoles: SystemRole[]) => {

              // Check if an System Role record with the same Name was found
              this.log.trace(`${LOG_PREFIX} Checking if an System Role record with the same Name was found`);
              if (systemsRoles.length > 0) {

                // An System Role record with the same Name was found
                this.log.trace(`${LOG_PREFIX} An System Role record with the same Name was found`);

                // Mark 'Name Exists' as true
                this.log.trace(`${LOG_PREFIX} Marking 'Name Exists' as true`);
                return { 'exists': true };

              } else {

                // An System Role record with the same Name was not found
                this.log.trace(`${LOG_PREFIX} An System Role record with the same Name was not found`);

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
   * Validates and saves a new System Role Record.
   * Emits a succeeded or failed event depending on whether the save request succeeded or failed respectively
   * Error 400 = Indicates that a user error was encountered
   * Error 500 = Indicates that a system error was encountered
   */
  public save(): void {

    this.log.trace(`${LOG_PREFIX} Entering save()`);

    // Check if the data entry form is valid
    this.log.trace(`${LOG_PREFIX} Checking if the data entry form is valid`);
    if (this.systemsRolesForm.valid) {

      // The data entry form is valid
      this.log.trace(`${LOG_PREFIX} The data entry form is valid`);

      // Read in the provided code
      this.log.trace(`${LOG_PREFIX} Reading in the provided code`);
      const code: string | null | undefined = this.systemsRolesForm.get('code')?.value?.trim();
      this.log.debug(`${LOG_PREFIX} System Role Code = ${code}`);

      // Read in the provided name
      this.log.trace(`${LOG_PREFIX} Reading in the provided name`);
      const name: string | null | undefined = this.systemsRolesForm.get('name')?.value?.trim();
      this.log.debug(`${LOG_PREFIX} System Role Name = ${name}`);

      // Read in the provided description
      this.log.trace(`${LOG_PREFIX} Reading in the provided description`);
      const description: string | null | undefined = this.systemsRolesForm.get('description')?.value?.trim();
      this.log.debug(`${LOG_PREFIX} System Role Description = ${description}`);

      // Read in the provided home id
      this.log.trace(`${LOG_PREFIX} Reading in the provided home id`);
      const homeId: number | null | undefined = this.systemsRolesForm.get('homeId')?.value;
      this.log.debug(`${LOG_PREFIX} System Role Home Page Id = ${code}`);      

      // Save the record
      this.log.trace(`${LOG_PREFIX} Saving the System Role Record`);
      this.systemsRolesDataService
        .createSystemRole(new SystemRole({
          data: {
            code,
            name,
            description,
            homeId,
            customisable: this.isCustomisable()
          },
          version: null
        }))
        .subscribe({
          next: (response: SystemRole) => {

            // The System Role Record was saved successfully
            this.log.trace(`${LOG_PREFIX} System Role Record was saved successfuly`);

            // Reset the form
            this.log.trace(`${LOG_PREFIX} Resetting the form`);
            this.systemsRolesForm.reset();

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The System Role Record was not saved successfully
            this.log.trace(`${LOG_PREFIX} System Role Record was not saved successfuly`);

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
      this.validateAllFormFields(this.systemsRolesForm);

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
