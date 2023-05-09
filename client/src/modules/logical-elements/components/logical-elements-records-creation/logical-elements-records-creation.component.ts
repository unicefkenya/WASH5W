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
import { ContextsDataService } from '@modules/contexts/services/contexts-data.service';
import { LogicalElementsTypesDataService } from '@modules/logical-elements-types/services/logical-elements-types-data.service';
import { LogicalElement } from '@modules/logical-elements/models/logical-element.model';
import { LogicalElementsDataService } from '@modules/logical-elements/services/logical-elements-data.service';
import { NGXLogger } from 'ngx-logger';
import { Observable, map, of } from 'rxjs';

const LOG_PREFIX: string = "[Logical Elements Records Creation Component]";

@Component({
  selector: 'sb-logical-elements-records-creation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './logical-elements-records-creation.component.html',
  styleUrls: ['logical-elements-records-creation.component.scss'],
})
export class LogicalElementsRecordsCreationComponent implements OnInit, OnDestroy {

  // Allows the parent component to inject the unique identifier of the parent Context record
  @Input() public contextId!: number;

  // Allows the parent component to inject the unique identifier of the element type record
  @Input() public typeId!: number;

  // Broadcasts successful Logical Elements creation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Logical Elements creation events together with their error codes
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Defines Logical Elements reactive form controls group
  logicalElementsForm = new FormGroup({

    typeId: new FormControl<number | null>(null,
      [Validators.required]),

    no: new FormControl<string | null>('',
      [Validators.required, Validators.minLength(1), Validators.maxLength(50)],
      [this.noExists()]),

    name: new FormControl<string | null>('',
      [Validators.required, Validators.minLength(2), Validators.maxLength(250)],
      [this.nameExists()]),

    description: new FormControl<string | null>('',
      [Validators.maxLength(500)])

  });

  constructor(
    public contextsDataService: ContextsDataService,
    public logicalElementsTypesDataService: LogicalElementsTypesDataService,
    private logicalElementsDataService: LogicalElementsDataService,
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
    this.logicalElementsForm.get('typeId')?.setValue(this.typeId ? Number(this.typeId) : null);

    // Return
    this.log.trace(`${LOG_PREFIX} Returning`);
    callback();

  }




  /**
   * Internal validator that checks whether a proposed Logical Element's no already exists
   * @returns 
   */
  private noExists(): AsyncValidatorFn {

    this.log.trace(`${LOG_PREFIX} Entering noExists()`);

    return (control: AbstractControl): Observable<ValidationErrors | null> => {

      // Check if a no value has been provided
      this.log.trace(`${LOG_PREFIX} Check if a no value has been provided`);
      if (control.value) {

        // A no value has been provided
        this.log.trace(`${LOG_PREFIX} A no value has been provided`);

        // Attempt retrieving Logical Elements Permissions with the same no
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve Logical Elements Permissions with the same no`);
        return this.logicalElementsDataService
          .getLogicalElements(false, {
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            id: null,
            contextId: this.contextId,
            typesIds: this.logicalElementsForm.get('typeId')?.value ? [this.logicalElementsForm.get('typeId')?.value as number] : null,
            no: control.value?.trim(),
            name: null
          })
          .pipe(
            map((logicalElements: LogicalElement[]) => {

              // Check if a Logical Element record with the same no was found
              this.log.trace(`${LOG_PREFIX} Checking if a Logical Element record with the same no was found`);
              if (logicalElements.length > 0) {

                // A Logical Element record with the same no was found
                this.log.trace(`${LOG_PREFIX} A Logical Element record with the same no was found`);

                // Mark 'code exists' as true
                this.log.trace(`${LOG_PREFIX} Marking 'code exists' as true`);
                return { 'exists': true };


              } else {

                // A Logical Element record with the same no was not found
                this.log.trace(`${LOG_PREFIX} A Logical Element record with the same no was not found`);

                // Mark 'no exists' as false
                this.log.trace(`${LOG_PREFIX} Marking 'no exists' as false`);
                return null

              }
            }

            )
          );

      } else {

        // A no value has not been provided
        this.log.trace(`${LOG_PREFIX} A no value has not been provided`);

        // Mark 'no exists' as false
        this.log.trace(`${LOG_PREFIX} Marking 'no exists' as false`);
        return of(null)
      }

    };

  }




  /**
   * Internal validator that checks whether a proposed Logical Element's name already exists
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

        // Attempt retrieving Logical Elements Permissions with the same name
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve Logical Elements Permissions with the same name`);
        return this.logicalElementsDataService
          .getLogicalElements(false, {
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            id: null,
            contextId: this.contextId,
            typesIds: this.logicalElementsForm.get('typeId')?.value ? [this.logicalElementsForm.get('typeId')?.value as number] : null,
            no: null,
            name: control.value?.trim()
          })
          .pipe(
            map((logicalElements: LogicalElement[]) => {

              // Check if a Logical Element record with the same name was found
              this.log.trace(`${LOG_PREFIX} Checking if a Logical Element record with the same name was found`);
              if (logicalElements.length > 0) {

                // A Logical Element record with the same name was found
                this.log.trace(`${LOG_PREFIX} A Logical Element record with the same name was found`);

                // Mark 'code exists' as true
                this.log.trace(`${LOG_PREFIX} Marking 'code exists' as true`);
                return { 'exists': true };


              } else {

                // A Logical Element record with the same name was not found
                this.log.trace(`${LOG_PREFIX} A Logical Element record with the same name was not found`);

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
   * Validates and saves a new Logical Elements Record.
   * Emits a succeeded or failed event depending on whether the save request succeeded or failed respectively
   * Error 400 = Indicates that a user error was encountered
   * Error 500 = Indicates that a system error was encountered
   */
  public save(): void {

    this.log.trace(`${LOG_PREFIX} Entering save()`);

    // Check if the data entry form is valid
    this.log.trace(`${LOG_PREFIX} Checking if the data entry form is valid`);
    if (this.logicalElementsForm.valid) {

      // The data entry form is valid
      this.log.trace(`${LOG_PREFIX} The data entry form is valid`);

      // Read in the provided parent Type Id
      this.log.trace(`${LOG_PREFIX} Reading in the provided parent Type Id`);
      const typeId: number | null | undefined = this.logicalElementsForm.get('typeId')?.value;
      this.log.debug(`${LOG_PREFIX} Parent Type Id = ${typeId}`);

      // Read in the provided no.
      this.log.trace(`${LOG_PREFIX} Reading in the provided no.`);
      const no: string | null | undefined = this.logicalElementsForm.get('no')?.value?.trim();
      this.log.debug(`${LOG_PREFIX} Logical Element No. = ${no}`);

      // Read in the provided name
      this.log.trace(`${LOG_PREFIX} Reading in the provided name`);
      const name: string | null | undefined = this.logicalElementsForm.get('name')?.value?.trim();
      this.log.debug(`${LOG_PREFIX} Logical Element Name = ${name}`);

      // Read in the provided description
      this.log.trace(`${LOG_PREFIX} Reading in the provided description`);
      const description: string | null | undefined = this.logicalElementsForm.get('description')?.value?.trim();
      this.log.debug(`${LOG_PREFIX} Logical Element Description = ${description}`);

      // Save the record
      this.log.trace(`${LOG_PREFIX} Saving the Logical Elements Record`);
      this.logicalElementsDataService
        .createLogicalElement(
          new LogicalElement({
            data: {
              contextId: this.contextId,
              typeId,
              no,
              name,
              description
            },
            version: null
          }))
        .subscribe({
          next: (response: LogicalElement) => {

            // The Logical Element Record was saved successfully
            this.log.trace(`${LOG_PREFIX} Logical Element Record was saved successfuly`);

            // Reset the forms
            this.log.trace(`${LOG_PREFIX} Resetting the forms`);
            this.logicalElementsForm.controls['no'].reset();
            this.logicalElementsForm.controls['name'].reset();
            this.logicalElementsForm.controls['description'].reset();

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The Logical Element Record was not saved successfully
            this.log.trace(`${LOG_PREFIX} Logical Element Record was not saved successfuly`);

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
      this.validateAllFormFields(this.logicalElementsForm);

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
