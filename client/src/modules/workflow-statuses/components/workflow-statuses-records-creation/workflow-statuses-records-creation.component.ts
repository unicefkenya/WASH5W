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
import { WorkflowStatus } from '@modules/workflow-statuses/models/workflow-status.model';
import { WorkflowStatusesDataService } from '@modules/workflow-statuses/services/workflow-statuses-data.service';
import { NGXLogger } from 'ngx-logger';
import { map } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { of } from 'rxjs/internal/observable/of';

const LOG_PREFIX: string = "[Workflow Statuses Records Creation Component]";

@Component({
  selector: 'sb-workflow-statuses-records-creation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './workflow-statuses-records-creation.component.html',
  styleUrls: ['workflow-statuses-records-creation.component.scss'],
})
export class WorkflowStatusesRecordsCreationComponent implements OnInit, OnDestroy {

  // Broadcasts successful Workflow Statuses creation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Workflow Statuses creation events together with their error plurals
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Defines Workflow Statuses reactive form controls group
  public workflowStatusesForm = new FormGroup({

    name: new FormControl<string | null>('', 
    [Validators.required, Validators.minLength(2), Validators.maxLength(250)],
    [this.nameExists()])
 
  });


  constructor(
    private workflowStatusesDataService: WorkflowStatusesDataService,
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
   * Internal validator that checks whether a proposed WorkflowStatus's name already exists
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

        // Attempt retrieving Workflow Statuses with the same name
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve Workflow Statuses with the same name`);
        return this.workflowStatusesDataService
          .getWorkflowStatuses(false,{
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            name: control.value.trim()
          })
          .pipe(
            map((workflowStatuses: WorkflowStatus[]) => {

              // Check if a Workflow Status record with the same name was found
              this.log.trace(`${LOG_PREFIX} Checking if a Workflow Status record with the same name was found`);
              if (workflowStatuses.length > 0) {

                // An Workflow Status record with the same name was found
                this.log.trace(`${LOG_PREFIX} An Workflow Status record with the same name was found`);

                // Mark 'name exists' as true
                this.log.trace(`${LOG_PREFIX} Marking 'name exists' as true`);
                return { 'exists': true };

              } else {

                // An Workflow Status record with the same name was not found
                this.log.trace(`${LOG_PREFIX} An Workflow Status record with the same name was not found`);

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
   * Validates and saves a new Workflow Status Record.
   * Emits a succeeded or failed event depending on whether the save request succeeded or failed respectively
   * Error 400 = Indicates that a user error was encountered
   * Error 500 = Indicates that a system error was encountered
   */
  public save(): void {

    this.log.trace(`${LOG_PREFIX} Entering save()`);

    // Check if the data entry form is valid
    this.log.trace(`${LOG_PREFIX} Checking if the data entry form is valid`);
    if (this.workflowStatusesForm.valid) {

      // The data entry form is valid
      this.log.trace(`${LOG_PREFIX} The data entry form is valid`);

      // Read in the provided name
      this.log.trace(`${LOG_PREFIX} Reading in the provided name`);
      const name: string | null | undefined = this.workflowStatusesForm.get('name')?.value?.trim();
      this.log.debug(`${LOG_PREFIX} Workflow Status Name = ${name}`);      

      // Save the record
      this.log.trace(`${LOG_PREFIX} Saving the Workflow Status Record`);
      this.workflowStatusesDataService
        .createWorkflowStatus(new WorkflowStatus({ data: { name}, version: null }))
        .subscribe({
          next: (response: WorkflowStatus) => {

            // The Workflow Status Record was saved successfully
            this.log.trace(`${LOG_PREFIX} Workflow Status Record was saved successfuly`);

            // Reset the form
            this.log.trace(`${LOG_PREFIX} Resetting the form`);
            this.workflowStatusesForm.reset();

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The Workflow Status Record was not saved successfully
            this.log.trace(`${LOG_PREFIX} Workflow Status Record was not saved successfuly`);

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
      this.validateAllFormFields(this.workflowStatusesForm);

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
