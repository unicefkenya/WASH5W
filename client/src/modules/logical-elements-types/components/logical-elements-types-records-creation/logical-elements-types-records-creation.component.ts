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
import { LogicalElementType } from '@modules/logical-elements-types/models/logical-element-type.model';
import { LogicalElementsTypesDataService } from '@modules/logical-elements-types/services/logical-elements-types-data.service';
import { NGXLogger } from 'ngx-logger';
import { map } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { of } from 'rxjs/internal/observable/of';

const LOG_PREFIX: string = "[Logical Elements Types Records Creation Component]";

@Component({
  selector: 'sb-logicalElementsTypes-records-creation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './logical-elements-types-records-creation.component.html',
  styleUrls: ['logical-elements-types-records-creation.component.scss'],
})
export class LogicalElementsTypesRecordsCreationComponent implements OnInit, OnDestroy {

  // Broadcasts successful Logical Elements Types creation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Logical Elements Types creation events together with their error plurals
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Defines Logical Elements Types reactive form controls group
  public logicalElementsTypesForm = new FormGroup({

    name: new FormControl<string | null>('', 
    [Validators.required, Validators.minLength(2), Validators.maxLength(250)],
    [this.nameExists()]),    

    plural: new FormControl<string | null>('', 
    [Validators.required, Validators.minLength(2), Validators.maxLength(250)],
    [this.pluralExists()])
 
  });


  constructor(
    private logicalElementsTypesDataService: LogicalElementsTypesDataService,
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
   * Internal validator that checks whether a proposed LogicalElementType's name already exists
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

        // Attempt retrieving Logical Elements Types with the same name
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve Logical Elements Types with the same name`);
        return this.logicalElementsTypesDataService
          .getLogicalElementsTypes(false,{
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            name: control.value.trim(),            
            plural: null
          })
          .pipe(
            map((logicalElementsTypes: LogicalElementType[]) => {

              // Check if a Logical Element Type record with the same name was found
              this.log.trace(`${LOG_PREFIX} Checking if a Logical Element Type record with the same name was found`);
              if (logicalElementsTypes.length > 0) {

                // An Logical Element Type record with the same name was found
                this.log.trace(`${LOG_PREFIX} An Logical Element Type record with the same name was found`);

                // Mark 'name exists' as true
                this.log.trace(`${LOG_PREFIX} Marking 'name exists' as true`);
                return { 'exists': true };

              } else {

                // An Logical Element Type record with the same name was not found
                this.log.trace(`${LOG_PREFIX} An Logical Element Type record with the same name was not found`);

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
   * Internal validator that checks whether a proposed LogicalElementType's plural already exists
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

        // Attempt retrieving Logical Elements Types with the same plural
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve Logical Elements Types with the same plural`);
        return this.logicalElementsTypesDataService
          .getLogicalElementsTypes(false,{
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            name: null,
            plural: control.value
          })
          .pipe(
            map((logicalElementsTypes: LogicalElementType[]) => {

              // Check if a Logical Element Type record with the same plural was found
              this.log.trace(`${LOG_PREFIX} Checking if a Logical Element Type record with the same plural was found`);
              if (logicalElementsTypes.length > 0) {

                // An Logical Element Type record with the same plural was found
                this.log.trace(`${LOG_PREFIX} An Logical Element Type record with the same plural was found`);

                // Mark 'plural exists' as true
                this.log.trace(`${LOG_PREFIX} Marking 'plural exists' as true`);
                return { 'exists': true };

              } else {

                // An Logical Element Type record with the same plural was not found
                this.log.trace(`${LOG_PREFIX} An Logical Element Type record with the same plural was not found`);

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
   * Validates and saves a new Logical Element Type Record.
   * Emits a succeeded or failed event depending on whether the save request succeeded or failed respectively
   * Error 400 = Indicates that a user error was encountered
   * Error 500 = Indicates that a system error was encountered
   */
  public save(): void {

    this.log.trace(`${LOG_PREFIX} Entering save()`);

    // Check if the data entry form is valid
    this.log.trace(`${LOG_PREFIX} Checking if the data entry form is valid`);
    if (this.logicalElementsTypesForm.valid) {

      // The data entry form is valid
      this.log.trace(`${LOG_PREFIX} The data entry form is valid`);

      // Read in the provided name
      this.log.trace(`${LOG_PREFIX} Reading in the provided name`);
      const name: string | null | undefined = this.logicalElementsTypesForm.get('name')?.value?.trim();
      this.log.debug(`${LOG_PREFIX} Logical Element Type Name = ${name}`);      

      // Read in the provided plural name
      this.log.trace(`${LOG_PREFIX} Reading in the provided plural name`);
      const plural: string | null | undefined = this.logicalElementsTypesForm.get('plural')?.value?.trim();
      this.log.debug(`${LOG_PREFIX} Logical Element Type Plural Name = ${plural}`);           

      // Save the record
      this.log.trace(`${LOG_PREFIX} Saving the Logical Element Type Record`);
      this.logicalElementsTypesDataService
        .createLogicalElementType(new LogicalElementType({ data: { name, plural}, version: null }))
        .subscribe({
          next: (response: LogicalElementType) => {

            // The Logical Element Type Record was saved successfully
            this.log.trace(`${LOG_PREFIX} Logical Element Type Record was saved successfuly`);

            // Reset the form
            this.log.trace(`${LOG_PREFIX} Resetting the form`);
            this.logicalElementsTypesForm.reset();

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The Logical Element Type Record was not saved successfully
            this.log.trace(`${LOG_PREFIX} Logical Element Type Record was not saved successfuly`);

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
      this.validateAllFormFields(this.logicalElementsTypesForm);

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
