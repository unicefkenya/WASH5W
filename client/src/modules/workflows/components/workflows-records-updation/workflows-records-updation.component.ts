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
import { Workflow } from '@modules/workflows/models/workflow.model';
import { WorkflowsDataService } from '@modules/workflows/services/workflows-data.service';
import { NGXLogger } from 'ngx-logger';
import { Observable, map, of } from 'rxjs';

const LOG_PREFIX: string = "[Workflows Records Updation Component]";

@Component({
  selector: 'sb-workflows-records-updation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './workflows-records-updation.component.html',
  styleUrls: ['workflows-records-updation.component.scss'],
})
export class WorkflowsRecordsUpdationComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Workflow record
  @Input() public id!: number;

  // Broadcasts successful Workflows updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Workflows updation events together with their error abbreviations
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the target Workflow record
  public workflow: Workflow | null | undefined = undefined;

  // Defines Workflows reactive form controls group
  public workflowsForm = new FormGroup({

    name: new FormControl<string | null>('', 
    [Validators.required, Validators.minLength(2), Validators.maxLength(250)],
    [this.nameExists()])  

  });



  constructor(
    private workflowsDataService: WorkflowsDataService,
    private log: NGXLogger) {

  }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Workflow field based on the passed in id
    this.initialiseWorkflow(() => {

      // Initialise the Workflow updation form based on the target Workflow
      this.initialiseWorkflowUpdationForm(() => {

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
   * Retrieves the Workflow with the injected id and sets it as the Workflow that needs to be updated
   * @param callback The function to call when done
   */
  private initialiseWorkflow(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseWorkflow()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveWorkflowRecord(this.id, (workflow: Workflow | null) => {

      // Set the target Workflow
      this.log.trace(`${LOG_PREFIX} Setting the target Workflow`);
      this.workflow = workflow;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }


  /**
   * Initialises the Workflow updation form
   * @param callback The function to call when done
   */
  private initialiseWorkflowUpdationForm(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseWorkflowUpdationForm()`);
    this.log.debug(`${LOG_PREFIX} Target Workflow Record = ${JSON.stringify(this.workflow)}`);

    // Initialise the Workflow Records form fields
    this.log.trace(`${LOG_PREFIX} Initialising the Workflow Records form fields`);
    this.workflowsForm.setValue({
      name: (this.workflow && this.workflow.data?.name) ? this.workflow.data?.name : ""
    });

    // Return
    this.log.trace(`${LOG_PREFIX} Returning`);
    callback();

  }

  /**
   * Retrieves a Workflow record given its unique identifier synchronously
   * @param id The unique identifier of the Workflow
   * @param callback The function to call when done
   */
  private retrieveWorkflowRecord(id: number, callback: (workflow: Workflow | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveWorkflowRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the workflow id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the workflow id has been specified`);
    if (id) {

      // The workflow id has been specified
      this.log.trace(`${LOG_PREFIX} The workflow id has been specified`);
      this.log.debug(`${LOG_PREFIX} Workflow Id = ${JSON.stringify(id)}`);

      // Try retrieving a Workflow Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve a Workflow Record with the passed in id`);
      const workflow: Workflow | undefined = id ? this.workflowsDataService.records.find(d => d.id == id) : undefined;

      // Check if the Workflow Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the Workflow Record was successfully retrieved`);
      if (workflow) {

        // The Workflow Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Workflow Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} Workflow Record = ${JSON.stringify(this.workflow)}`);

        // Return the Workflow
        this.log.warn(`${LOG_PREFIX} Returning the Workflow`);
        callback(workflow);

      } else {

        // The Workflow Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Workflow Record was not successfully retrieved`);

        // Return null
        this.log.warn(`${LOG_PREFIX} Returning null`);
        callback(null);

      }


    } else {

      // The workflow id has not been specified
      this.log.error(`${LOG_PREFIX} The workflow id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }

  /**
   * Internal validator that checks whether a proposed Workflow's name already exists
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

        // Attempt retrieving Workflows with the same name
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve Workflows with the same name`);
        return this.workflowsDataService
          .getWorkflows(false,{
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            name: control.value?.trim()
          })
          .pipe(
            map((workflows: Workflow[]) => {

              // Check if a Workflow record with the same name was found
              this.log.trace(`${LOG_PREFIX} Checking if a Workflow record with the same name was found`);

              if (workflows.length > 0) {

                // A Workflow record with the same name was found
                this.log.trace(`${LOG_PREFIX} A Workflow record with the same name was found`);

                // Retrieve the Workflow record with the specified name
                this.log.trace(`${LOG_PREFIX} Retrieving the Workflow record with the specified name`);
                const workflow: Workflow | undefined = workflows.find(s => s.data.name?.toLowerCase() == control.value.toLowerCase());
                this.log.trace(`${LOG_PREFIX} Workflow record = ${JSON.stringify(workflow)}`);

                // Check if the Workflow record's identity is different from the current Workflow record's identity
                this.log.trace(`${LOG_PREFIX} Checking if the Workflow record's identity is different from the current Workflow record's identity`);

                if (workflow && workflow.id != this.id) {

                  // The Workflow record's identity is different from the current Workflow record's identity
                  this.log.trace(`${LOG_PREFIX} The Workflow record's identity is different from the current Workflow record's identity`);

                  // Mark 'name exists' as true
                  this.log.trace(`${LOG_PREFIX} Marking 'name exists' as true`);
                  return { 'exists': true };

                } else {

                  // The Workflow record's identity is not different from the current Workflow record's identity
                  this.log.trace(`${LOG_PREFIX} The Workflow record's identity is not different from the current Workflow record's identity`);

                  // Mark 'name exists' as false
                  this.log.trace(`${LOG_PREFIX} Marking 'name exists' as false`);
                  return null;
                }


              } else {

                // A Workflow record with the same name was not found
                this.log.trace(`${LOG_PREFIX} A Workflow record with the same name was not found`);

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
   * Validates and saves a new Workflow Record.
   * Emits a succeeded or failed event depending on whether the save request succeeded or failed respectively
   * Error 400 = Indicates that a user error was encountered
   * Error 500 = Indicates that a system error was encountered
   */
  public save(): void {

    this.log.trace(`${LOG_PREFIX} Entering save()`);

    // Check if the target Workflow record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Workflow record was successfully initialised()`);
    if (this.workflow) {

      // The target Workflow record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Workflow record was successfully initialised()`);

      // Check if the data entry form is valid
      this.log.trace(`${LOG_PREFIX} Checking if the data entry form is valid`);
      if (this.workflowsForm.valid) {

        // The data entry form is valid
        this.log.trace(`${LOG_PREFIX} The data entry form is valid`);      

      // Read in the provided name
      this.log.trace(`${LOG_PREFIX} Reading in the provided name`);
      const name: string | null | undefined = this.workflowsForm.get('name')?.value?.trim();
      this.log.debug(`${LOG_PREFIX} Workflow Name = ${name}`); 

        // Save the record
        this.log.trace(`${LOG_PREFIX} Saving the Workflow Record`);
        this.workflowsDataService
          .updateWorkflow(Object.assign(this.workflow, { data: { name} }))
          .subscribe({
            next: (response: Workflow) => {

              // The Workflow Record was saved successfully
              this.log.trace(`${LOG_PREFIX} The Workflow Record was successfuly updated`);

              // Reset the form
              this.log.trace(`${LOG_PREFIX} Resetting the form`);
              this.workflowsForm.reset();

              // Emit a 'succeeded' event
              this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
              this.succeeded.emit();
            },
            error: (error: any) => {

              // The Workflow Record was not saved successfully
              this.log.trace(`${LOG_PREFIX} The Workflow Record was not successfuly updated`);

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
        this.validateAllFormFields(this.workflowsForm);

        // Emit an 'invalid' event
        this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
        this.failed.emit(400);

      }

    } else {
      // The target Workflow record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Workflow record was not successfully initialised()`);

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
