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
import { SystemsModulesDataService } from '@modules/systems-modules/services/systems-modules-data.service';
import { SystemModulePermission } from '@modules/systems-modules-permissions/models/system-module-permission.model';
import { SystemsModulesPermissionsDataService } from '@modules/systems-modules-permissions/services/systems-modules-permissions-data.service';
import { NGXLogger } from 'ngx-logger';
import { Observable, map, of } from 'rxjs';
import { environment } from 'environments/environment';

const LOG_PREFIX: string = "[Systems Modules Permissions Records Creation Component]";

@Component({
  selector: 'sb-systems-modules-permissions-records-creation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './systems-modules-permissions-records-creation.component.html',
  styleUrls: ['systems-modules-permissions-records-creation.component.scss'],
})
export class SystemsModulesPermissionsRecordsCreationComponent implements OnInit, OnDestroy {

  // Allows the parent component to inject the unique identifier of the parent Context record
  @Input() public systemModuleId!: number;

  // Broadcasts successful Systems Modules Permissions creation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Systems Modules Permissions creation events together with their error codes
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Defines Systems Modules Permissions reactive form controls group
  systemsModulesPermissionsForm = new FormGroup({

    systemModuleId: new FormControl<number | null>(null,
      [Validators.required]),

    code: new FormControl<string | null>('',
      [Validators.required, Validators.minLength(2), Validators.maxLength(250)],
      [this.codeExists()]),

    name: new FormControl<string | null>('',
      [Validators.required, Validators.minLength(2), Validators.maxLength(250)],
      [this.nameExists()]),

    custom: new FormControl<boolean>(true),

    description: new FormControl<string | null>('',
      [Validators.maxLength(500)])

  });


  constructor(
    public systemsModulesDataService: SystemsModulesDataService,
    private systemsModulesPermissionsDataService: SystemsModulesPermissionsDataService,
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
    this.systemsModulesPermissionsForm.get('systemModuleId')?.setValue(this.systemModuleId ? this.systemModuleId : null);

    // Return
    this.log.trace(`${LOG_PREFIX} Returning`);
    callback();

  }


  public isProductionEnvironment(): boolean {
    return (environment.production);
  }

  public isDevelopmentEnvironment(): boolean {
    return !(environment.production);
  }



  /**
   * Internal validator that checks whether a proposed System Module Permission's code already exists
   * @returns 
   */
  private codeExists(): AsyncValidatorFn {

    this.log.trace(`${LOG_PREFIX} Entering codeExists()`);

    return (control: AbstractControl): Observable<ValidationErrors | null> => {

      // Check if a code value has been provided
      this.log.trace(`${LOG_PREFIX} Check if a code value has been provided`);
      if (control.value) {

        // A code value has been provided
        this.log.trace(`${LOG_PREFIX} A code value has been provided`);

        // Attempt retrieving System Module Permissions Permissions with the same code
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve System Module Permissions Permissions with the same code`);
        return this.systemsModulesPermissionsDataService
          .getSystemsModulesPermissions(false, {
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            code: control.value,
            name: null
          })
          .pipe(
            map((systemModulePermissions: SystemModulePermission[]) => {

              // Check if a System Module Permission record with the same code was found
              this.log.trace(`${LOG_PREFIX} Checking if a System Module Permission record with the same code was found`);
              if (systemModulePermissions.length > 0) {

                // A System Module Permission record with the same code was found
                this.log.trace(`${LOG_PREFIX} A System Module Permission record with the same code was found`);

                // Mark 'code exists' as true
                this.log.trace(`${LOG_PREFIX} Marking 'code exists' as true`);
                return { 'exists': true };

              } else {

                // A System Module Permission record with the same code was not found
                this.log.trace(`${LOG_PREFIX} A System Module Permission record with the same code was not found`);

                // Mark 'code exists' as false
                this.log.trace(`${LOG_PREFIX} Marking 'code exists' as false`);
                return null

              }
            }

            )
          );

      } else {

        // A code value has not been provided
        this.log.trace(`${LOG_PREFIX} A code value has not been provided`);

        // Mark 'code exists' as false
        this.log.trace(`${LOG_PREFIX} Marking 'code exists' as false`);
        return of(null)
      }

    };

  }



  /**
   * Internal validator that checks whether a proposed System Module Permission's name already exists
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

        // Attempt retrieving System Module Permissions Permissions with the same name
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve System Module Permissions Permissions with the same name`);
        return this.systemsModulesPermissionsDataService
          .getSystemsModulesPermissions(false, {
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            code: null,
            name: control.value
          })
          .pipe(
            map((systemModulePermissions: SystemModulePermission[]) => {

              // Check if a System Module Permission record with the same name was found
              this.log.trace(`${LOG_PREFIX} Checking if a System Module Permission record with the same name was found`);
              if (systemModulePermissions.length > 0) {

                // A System Module Permission record with the same name was found
                this.log.trace(`${LOG_PREFIX} A System Module Permission record with the same name was found`);

                // Mark 'code exists' as true
                this.log.trace(`${LOG_PREFIX} Marking 'code exists' as true`);
                return { 'exists': true };


              } else {

                // A System Module Permission record with the same name was not found
                this.log.trace(`${LOG_PREFIX} A System Module Permission record with the same name was not found`);

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
   * Establishes whether the field is custom
   * @returns True or False
   */
  public isCustom(): boolean {

    this.log.trace(`${LOG_PREFIX} Entering isCustom()`);

    if (this.systemsModulesPermissionsForm.get('custom')?.value) {
      return true;
    } else {
      return false;
    }

  }


  /**
   * Flags whether or not the field is custom
   * @param e Switch event
   */
  public toggleCustomness(e: any): void {

    this.log.trace(`${LOG_PREFIX} Entering toggleCustomness()`);

    // Check if the switch has been checked
    this.log.trace(`${LOG_PREFIX} Checking if the switch has been checked`);
    if (e.target.checked) {

      // The switch has been checked
      this.log.trace(`${LOG_PREFIX} The switch has been checked`);

      // Update the form
      this.log.trace(`${LOG_PREFIX} Updating the form`);
      this.systemsModulesPermissionsForm.get('custom')?.setValue(true);


    } else {

      // The switch has been unchecked
      this.log.trace(`${LOG_PREFIX} The switch has been unchecked`);

      // Update the form
      this.log.trace(`${LOG_PREFIX} Updating the form`);
      this.systemsModulesPermissionsForm.get('custom')?.setValue(false);

    }

  }


  /**
   * Validates and saves a new System Module Permissions Record.
   * Emits a succeeded or failed event depending on whether the save request succeeded or failed respectively
   * Error 400 = Indicates that a user error was encountered
   * Error 500 = Indicates that a system error was encountered
   */
  public save(): void {

    this.log.trace(`${LOG_PREFIX} Entering save()`);

    // Check if the data entry form is valid
    this.log.trace(`${LOG_PREFIX} Checking if the data entry form is valid`);
    if (this.systemsModulesPermissionsForm.valid) {

      // The data entry form is valid
      this.log.trace(`${LOG_PREFIX} The data entry form is valid`);

      // Read in the provided parent system module id
      this.log.trace(`${LOG_PREFIX} Reading in the provided parent system module id`);
      const systemModuleId: number | null | undefined = this.systemsModulesPermissionsForm.get('systemModuleId')?.value;
      this.log.debug(`${LOG_PREFIX} Parent System Module Id = ${systemModuleId}`);

      // Read in the provided code
      this.log.trace(`${LOG_PREFIX} Reading in the provided code`);
      const code: string | null | undefined = this.systemsModulesPermissionsForm.get('code')?.value;
      this.log.debug(`${LOG_PREFIX} System Module Permission Code = ${code}`);

      // Read in the provided name
      this.log.trace(`${LOG_PREFIX} Reading in the provided name`);
      const name: string | null | undefined = this.systemsModulesPermissionsForm.get('name')?.value;
      this.log.debug(`${LOG_PREFIX} System Module Permission Name = ${name}`);

      // Read in the provided description
      this.log.trace(`${LOG_PREFIX} Reading in the provided description`);
      const description: string | null | undefined = this.systemsModulesPermissionsForm.get('description')?.value;
      this.log.debug(`${LOG_PREFIX} System Module Permission Description = ${description}`);

      // Save the record
      this.log.trace(`${LOG_PREFIX} Saving the System Module Permissions Record`);
      this.systemsModulesPermissionsDataService
        .createSystemModulePermission(
          new SystemModulePermission({
            data: {
              systemModuleId,
              code,
              name,
              description,
              custom: this.isCustom(),
            },
            version: null
          }))
        .subscribe({
          next: (response: SystemModulePermission) => {

            // The System Module Permission Record was saved successfully
            this.log.trace(`${LOG_PREFIX} System Module Permission Record was saved successfuly`);

            // Reset the form
            this.log.trace(`${LOG_PREFIX} Resetting the form`);
            this.systemsModulesPermissionsForm.reset();

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The System Module Permission Record was not saved successfully
            this.log.trace(`${LOG_PREFIX} System Module Permission Record was not saved successfuly`);

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
      this.validateAllFormFields(this.systemsModulesPermissionsForm);

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
