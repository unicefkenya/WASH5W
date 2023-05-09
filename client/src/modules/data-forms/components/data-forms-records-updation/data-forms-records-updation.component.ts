import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { DataForm } from '@modules/data-forms/models/data-form.model';
import { DataFormsDataService } from '@modules/data-forms/services/data-forms-data.service';
import { ContextsDataService } from '@modules/contexts/services/contexts-data.service';
import { NGXLogger } from 'ngx-logger';
import { Observable, map, of } from 'rxjs';
import { WorkflowsDataService } from '@modules/workflows/services/workflows-data.service';
import { Workflow } from '@modules/workflows/models';

const LOG_PREFIX: string = "[Data Forms Records Updation Component]";

@Component({
  selector: 'sb-data-forms-records-updation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './data-forms-records-updation.component.html',
  styleUrls: ['data-forms-records-updation.component.scss'],
})
export class DataFormsRecordsUpdationComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Data Form record
  @Input() public id!: number;

  // Broadcasts successful Data Forms updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Data Forms updation events together with their error codes
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Keeps tabs of the selected workflow
  private workflow: { id: number | null | undefined; name: string | null | undefined } | null | undefined = null;

  // Holds the Data Form record with the passed in id
  public dataForm: DataForm | null | undefined;

  // Defines Data Forms reactive form controls group
  dataFormsForm = new FormGroup({

    name: new FormControl<string | null>('',
      [Validators.required, Validators.minLength(2), Validators.maxLength(250)],
      [this.nameExists()]),

    workflowId: new FormControl<number | null>(null,
      [Validators.required]),

    description: new FormControl<string | null>('',
      [Validators.maxLength(500)])

  });

  constructor(
    public contextsDataService: ContextsDataService,
    public dataFormsDataService: DataFormsDataService,
    public workflowsDataService: WorkflowsDataService,
    private log: NGXLogger) {

  }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Data Form field based on the passed in id
    this.initialiseDataForm(() => {

      // Initialise the Data Form updation form based on the target Context
      this.initialiseDataFormUpdationForm(() => {

        // Init the local workflow
        this.workflow = Object.assign({}, this.dataForm?.data.workflow);

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
   * Retrieves the Data Form with the injected id and sets it as the Data Form that needs to be updated
   * @param callback The function to call when done
   */
  private initialiseDataForm(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseDataForm()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveDataFormRecord(this.id, (dataForm: DataForm | null) => {

      // Set the target Data Form
      this.log.trace(`${LOG_PREFIX} Setting the target Data Form`);
      this.dataForm = dataForm;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }


  /**
   * Initialises the Data Form updation form
   * @param callback The function to call when done
   */
  private initialiseDataFormUpdationForm(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseDataFormUpdationForm()`);
    this.log.debug(`${LOG_PREFIX} Target Data Form Record = ${JSON.stringify(this.dataForm)}`);

    // Initialise the Data Form Records form fields
    this.log.trace(`${LOG_PREFIX} Initialising the Data Form Records form fields`);
    this.dataFormsForm.setValue({
      name: this.dataForm?.data.name ? this.dataForm.data.name : null,
      workflowId: this.dataForm?.data.workflow?.id ? this.dataForm.data.workflow.id : null,
      description: this.dataForm?.data.description ? this.dataForm.data.description : null
    });

    // Return
    this.log.trace(`${LOG_PREFIX} Returning`);
    callback();

  }

  /**
   * Retrieves a Data Form record given its unique identifier synchronously
   * @param id The unique identifier of the Data Form
   * @param callback The function to call when done
   */
  private retrieveDataFormRecord(id: number, callback: (dataForm: DataForm | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveDataFormRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the context id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the context id has been specified`);
    if (id) {

      // The context id has been specified
      this.log.trace(`${LOG_PREFIX} The context id has been specified`);
      this.log.debug(`${LOG_PREFIX} Data Form Id = ${JSON.stringify(id)}`);

      // Try retrieving a Data Form Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve a Data Form Record with the passed in id`);
      const dataForm: DataForm | undefined = id ? this.dataFormsDataService.records.find(d => d.id == id) : undefined;

      // Check if the Data Form Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the Data Form Record was successfully retrieved`);
      if (dataForm) {

        // The Data Form Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Data Form Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} Data Form Record = ${JSON.stringify(dataForm)}`);

        // Return the Data Form
        this.log.trace(`${LOG_PREFIX} Returning the Data Form`);
        callback(dataForm);

      } else {

        // The Data Form Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Data Form Record was not successfully retrieved`);

        // Return null
        this.log.warn(`${LOG_PREFIX} Returning null`);
        callback(null);

      }


    } else {

      // The context id has not been specified
      this.log.error(`${LOG_PREFIX} The context id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }


  /**
   * Keep tabs of workflow selection events and updates the local selected workflow field
   * @param selectedWorkflow The selected workflow
   */
  public onWorkflowChange() {

    this.log.trace(`${LOG_PREFIX} Entering onWorkflowChange()`);

    // Read in the id of the selected workflow
    this.log.trace(`${LOG_PREFIX} Reading in the id of the selected workflow`);
    const workflowId: number | null | undefined = this.dataFormsForm.get('workflowId')?.value;

    // Check if the workflow id was successfully read
    this.log.trace(`${LOG_PREFIX} Checking if the workflow id was successfully read`);
    if (workflowId) {

      // The workflow id was successfully read
      this.log.trace(`${LOG_PREFIX} The workflow id was successfully read`);
      this.log.trace(`${LOG_PREFIX} Workflow id = ${workflowId}`);

      // Retrieve the workflow with the selected id
      this.log.trace(`${LOG_PREFIX} Retrieving the workflow with the selected id`);


      // Retrieve the workflow with the selected id
      this.log.trace(`${LOG_PREFIX} Retrieving the workflow with the selected id`);
      const temp: Workflow | undefined = this.workflowsDataService.records.find(w => w.id == workflowId);
      this.log.trace(`${LOG_PREFIX} Retrieved Workflow = ${JSON.stringify(temp)}`);

      // Initialise local workflow field
      this.log.trace(`${LOG_PREFIX} Initialising local workflow field`);
      this.workflow = temp ? { id: temp.id, name: temp.data.name } : null;

    } else {

      // The workflow id is missing
      this.log.warn(`${LOG_PREFIX} The workflow id is missing`);


      // Return null
      this.log.warn(`${LOG_PREFIX} Returning null`);
      this.workflow = null;

    }

  }


  /**
   * Internal validator that checks whether a proposed Data Form's name already exists
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

        // Attempt retrieving Data Forms with the same name
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve Data Forms with the same name`);
        return this.dataFormsDataService
          .getDataForms(false, {
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            contextId: this.dataForm?.data.contextId,
            name: control.value?.trim()
          })
          .pipe(
            map((dataForms: DataForm[]) => {

              // Check if a Data Form record with the same name was found
              this.log.trace(`${LOG_PREFIX} Checking if a Data Form record with the same name was found`);

              if (dataForms.length > 0) {

                // A Data Form record with the same name was found
                this.log.trace(`${LOG_PREFIX} A Data Form record with the same name was found`);

                // Retrieve the Data Form record with the specified name
                this.log.trace(`${LOG_PREFIX} Retrieving the Data Form record with the specified name`);
                const dataForm: DataForm | undefined = dataForms.find(s => s.data.name?.toLowerCase() == control.value.toLowerCase());
                this.log.trace(`${LOG_PREFIX} Data Form record = ${JSON.stringify(dataForm)}`);

                // Check if the Data Form record's identity is different from the current Data Form record's identity
                this.log.trace(`${LOG_PREFIX} Checking if the Data Form record's identity is different from the current Data Form record's identity`);

                if (dataForm && dataForm.id != this.id) {

                  // The Data Form record's identity is different from the current Data Form record's identity
                  this.log.trace(`${LOG_PREFIX} The Data Form record's identity is different from the current Data Form record's identity`);

                  // Mark 'code exists' as true
                  this.log.trace(`${LOG_PREFIX} Marking 'code exists' as true`);
                  return { 'exists': true };

                } else {

                  // The Data Form record's identity is not different from the current Data Form record's identity
                  this.log.trace(`${LOG_PREFIX} The Data Form record's identity is not different from the current Data Form record's identity`);

                  // Mark 'name exists' as false
                  this.log.trace(`${LOG_PREFIX} Marking 'name exists' as false`);
                  return null
                }


              } else {

                // A Data Form record with the same name was not found
                this.log.trace(`${LOG_PREFIX} A Data Form record with the same name was not found`);

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
   * Validates and saves the updated Data Form Record.
   * Emits a succeeded or failed event in response to whether or not the updation exercise was successful.
   * Error 400 = Indicates an invalid Form Control Entry was supplied.
   * Error 500 = Indicates something unexpected happened at the server side
   */
  public save(): void {


    this.log.trace(`${LOG_PREFIX} Entering save()`);

    // Check if the target Data Form record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Data Form record was successfully initialised()`);
    if (this.dataForm) {

      // The target Data Form record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Data Form record was successfully initialised()`);

      // Check if the data entry form is valid
      this.log.trace(`${LOG_PREFIX} Checking if the data entry form is valid`);
      if (this.dataFormsForm.valid) {

        // The data entry form is valid
        this.log.trace(`${LOG_PREFIX} The data entry form is valid`);

        // Read in the provided name
        this.log.trace(`${LOG_PREFIX} Reading in the provided name`);
        const name: string | null | undefined = this.dataFormsForm.get('name')?.value?.trim();
        this.log.debug(`${LOG_PREFIX} Data Form Name = ${name}`);

        // Read in the provided description
        this.log.trace(`${LOG_PREFIX} Reading in the provided description`);
        const description: string | null | undefined = this.dataFormsForm.get('description')?.value?.trim();
        this.log.debug(`${LOG_PREFIX} Data Form Description = ${description}`);

        // Save the record
        this.log.trace(`${LOG_PREFIX} Saving the Data Forms Record`);
        this.dataFormsDataService
          .updateDataForm(new DataForm({
            id: this.dataForm.id,
            data: {
              contextId: this.dataForm.data.contextId,
              name,
              workflow: this.workflow,
              description
            },
            version: this.dataForm.version
          }))
          .subscribe({
            next: (response: DataForm) => {

              // The Data Form Record was saved successfully
              this.log.trace(`${LOG_PREFIX} Data Form Record was saved successfuly`);

              // Reset the form
              this.log.trace(`${LOG_PREFIX} Resetting the form`);
              this.dataFormsForm.get('name')?.setValue(null);
              this.dataFormsForm.get('description')?.setValue(null);

              // Emit a 'succeeded' event
              this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
              this.succeeded.emit();
            },
            error: (error: any) => {

              // The Data Form Record was not saved successfully
              this.log.trace(`${LOG_PREFIX} Data Form Record was not saved successfuly`);

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
        this.validateAllFormFields(this.dataFormsForm);

        // Emit an 'invalid' event
        this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
        this.failed.emit(400);
      }


    } else {
      // The target Data Form record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Data Form record was not successfully initialised()`);

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
