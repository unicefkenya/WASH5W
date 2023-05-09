import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { WorkflowStatus } from '@modules/workflow-statuses/models/workflow-status.model';
import { WorkflowStatusesDataService } from '@modules/workflow-statuses/services/workflow-statuses-data.service';
import { NGXLogger } from 'ngx-logger';
import { Observable, map, of } from 'rxjs';

const LOG_PREFIX: string = "[Workflow Statuses Records Updation Component]";

@Component({
  selector: 'sb-workflow-statuses-records-updation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './workflow-statuses-records-updation.component.html',
  styleUrls: ['workflow-statuses-records-updation.component.scss'],
})
export class WorkflowStatusesRecordsUpdationComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Workflow Status record
  @Input() public id!: number;

  // Broadcasts successful Workflow Statuses updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Workflow Statuses updation events together with their error plurals
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the target Workflow Status record
  public workflowStatus: WorkflowStatus | null | undefined = undefined;

  // Defines Workflow Statuses reactive form controls group
  public workflowStatusesForm = new FormGroup({

    name: new FormControl<string | null>('', 
    [Validators.required, Validators.minLength(2), Validators.maxLength(250)],
    [this.nameExists()]), 

  });



  constructor(
    private workflowStatusesDataService: WorkflowStatusesDataService,
    private log: NGXLogger) {

  }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Workflow Status field based on the passed in id
    this.initialiseWorkflowStatus(() => {

      // Initialise the Workflow Status updation form based on the target Workflow Status
      this.initialiseWorkflowStatusUpdationForm(() => {

        // Mark Init as complete
        this.log.trace(`${LOG_PREFIX} Init completed`);

      });
    });

  }

  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }

  /**
   * Retrieves the Workflow Status with the injected id and sets it as the Workflow Status that needs to be updated
   * @param callback The function to call when done
   */
  private initialiseWorkflowStatus(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseWorkflowStatus()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveWorkflowStatusRecord(this.id, (workflowStatus: WorkflowStatus | null) => {

      // Set the target Workflow Status
      this.log.trace(`${LOG_PREFIX} Setting the target Workflow Status`);
      this.workflowStatus = workflowStatus;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }


  /**
   * Initialises the Workflow Status updation form
   * @param callback The function to call when done
   */
  private initialiseWorkflowStatusUpdationForm(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseWorkflowStatusUpdationForm()`);
    this.log.debug(`${LOG_PREFIX} Target Workflow Status Record = ${JSON.stringify(this.workflowStatus)}`);

    // Initialise the Workflow Status Records form fields
    this.log.trace(`${LOG_PREFIX} Initialising the Workflow Status Records form fields`);
    this.workflowStatusesForm.setValue({
      name: (this.workflowStatus && this.workflowStatus.data?.name) ? this.workflowStatus.data?.name : ""
    });

    // Return
    this.log.trace(`${LOG_PREFIX} Returning`);
    callback();

  }

  /**
   * Retrieves a Workflow Status record given its unique identifier synchronously
   * @param id The unique identifier of the Workflow Status
   * @param callback The function to call when done
   */
  private retrieveWorkflowStatusRecord(id: number, callback: (workflowStatus: WorkflowStatus | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveWorkflowStatusRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the workflowStatus id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the workflowStatus id has been specified`);
    if (id) {

      // The Workflow Status id has been specified
      this.log.trace(`${LOG_PREFIX} The Workflow Status id has been specified`);
      this.log.debug(`${LOG_PREFIX} Workflow Status Id = ${JSON.stringify(id)}`);

      // Try retrieving a Workflow Status Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve a Workflow Status Record with the passed in id`);
      const workflowStatus: WorkflowStatus | undefined = id ? this.workflowStatusesDataService.records.find(d => d.id == id) : undefined;

      // Check if the Workflow Status Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the Workflow Status Record was successfully retrieved`);
      if (workflowStatus) {

        // The Workflow Status Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Workflow Status Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} Workflow Status Record = ${JSON.stringify(this.workflowStatus)}`);

        // Return the Workflow Status
        this.log.warn(`${LOG_PREFIX} Returning the Workflow Status`);
        callback(workflowStatus);

      } else {

        // The Workflow Status Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Workflow Status Record was not successfully retrieved`);

        // Return null
        this.log.warn(`${LOG_PREFIX} Returning null`);
        callback(null);

      }


    } else {

      // The Workflow Status id has not been specified
      this.log.error(`${LOG_PREFIX} The Workflow Status id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
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
            name: control.value?.trim()
          })
          .pipe(
            map((workflowStatuses: WorkflowStatus[]) => {

              // Check if a Workflow Status record with the same name was found
              this.log.trace(`${LOG_PREFIX} Checking if a Workflow Status record with the same name was found`);

              if (workflowStatuses.length > 0) {

                // An Workflow Status record with the same name was found
                this.log.trace(`${LOG_PREFIX} An Workflow Status record with the same name was found`);

                // Retrieve the Workflow Status record with the specified name
                this.log.trace(`${LOG_PREFIX} Retrieving the Workflow Status record with the specified name`);
                const workflowStatus: WorkflowStatus | undefined = workflowStatuses.find(s => s.data.name?.toLowerCase() == control.value.toLowerCase());
                this.log.trace(`${LOG_PREFIX} Workflow Status record = ${JSON.stringify(workflowStatus)}`);

                // Check if the Workflow Status record's identity is different from the current Workflow Status record's identity
                this.log.trace(`${LOG_PREFIX} Checking if the Workflow Status record's identity is different from the current Workflow Status record's identity`);

                if (workflowStatus && workflowStatus.id != this.id) {

                  // The Workflow Status record's identity is different from the current Workflow Status record's identity
                  this.log.trace(`${LOG_PREFIX} The Workflow Status record's identity is different from the current Workflow Status record's identity`);

                  // Mark 'name exists' as true
                  this.log.trace(`${LOG_PREFIX} Marking 'name exists' as true`);
                  return { 'exists': true };

                } else {

                  // The Workflow Status record's identity is not different from the current Workflow Status record's identity
                  this.log.trace(`${LOG_PREFIX} The Workflow Status record's identity is not different from the current Workflow Status record's identity`);

                  // Mark 'name exists' as false
                  this.log.trace(`${LOG_PREFIX} Marking 'name exists' as false`);
                  return null;
                }


              } else {

                // An Workflow Status record with the same name was not found
                this.log.trace(`${LOG_PREFIX} An Workflow Status record with the same name was not found`);

                // Mark 'name exists' as false
                this.log.trace(`${LOG_PREFIX} Marking 'name exists' as false`);
                return null;

              }
            }

            )
          );

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

    // Check if the target Workflow Status record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Workflow Status record was successfully initialised()`);
    if (this.workflowStatus) {

      // The target Workflow Status record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Workflow Status record was successfully initialised()`);

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
          .updateWorkflowStatus(Object.assign(this.workflowStatus, { data: { name} }))
          .subscribe({
            next: (response: WorkflowStatus) => {

              // The Workflow Status Record was saved successfully
              this.log.trace(`${LOG_PREFIX} The Workflow Status Record was successfuly updated`);

              // Reset the form
              this.log.trace(`${LOG_PREFIX} Resetting the form`);
              this.workflowStatusesForm.reset();

              // Emit a 'succeeded' event
              this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
              this.succeeded.emit();
            },
            error: (error: any) => {

              // The Workflow Status Record was not saved successfully
              this.log.trace(`${LOG_PREFIX} The Workflow Status Record was not successfuly updated`);

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

    } else {
      // The target Workflow Status record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Workflow Status record was not successfully initialised()`);

      // Emit an 'invalid' event
      this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
      this.failed.emit(500);

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
