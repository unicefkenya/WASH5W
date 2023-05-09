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
import { DataForm } from '@modules/data-forms/models/data-form.model';
import { DataFormsDataService } from '@modules/data-forms/services/data-forms-data.service';
import { Workflow } from '@modules/workflows/models/workflow.model';
import { WorkflowsDataService } from '@modules/workflows/services/workflows-data.service';
import { NGXLogger } from 'ngx-logger';
import { Observable, map, of } from 'rxjs';

const LOG_PREFIX: string = "[Data Forms Records Creation Component]";

@Component({
  selector: 'sb-data-forms-records-creation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './data-forms-records-creation.component.html',
  styleUrls: ['data-forms-records-creation.component.scss'],
})
export class DataFormsRecordsCreationComponent implements OnInit, OnDestroy {

  // Allows the parent component to inject the unique identifier of the parent Context record
  @Input() public contextId!: number;

  // Broadcasts successful Data Forms creation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Data Forms creation events together with their error codes
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Keeps tabs of the selected workflow
  private workflow: { id: number | null | undefined; name: string | null | undefined } | null | undefined = null;  

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

      // Mark Init as complete
      this.log.trace(`${LOG_PREFIX} Init completed`);

  }



  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy`);

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

        // Attempt retrieving Data Forms Permissions with the same name
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve Data Forms Permissions with the same name`);
        return this.dataFormsDataService
          .getDataForms(false, {
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            contextId: this.contextId,
            name: control.value?.trim()
          })
          .pipe(
            map((dataForms: DataForm[]) => {

              // Check if a Data Form record with the same name was found
              this.log.trace(`${LOG_PREFIX} Checking if a Data Form record with the same name was found`);
              if (dataForms.length > 0) {

                // A Data Form record with the same name was found
                this.log.trace(`${LOG_PREFIX} A Data Form record with the same name was found`);

                // Mark 'code exists' as true
                this.log.trace(`${LOG_PREFIX} Marking 'code exists' as true`);
                return { 'exists': true };


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
   * Validates and saves a new Data Forms Record.
   * Emits a succeeded or failed event depending on whether the save request succeeded or failed respectively
   * Error 400 = Indicates that a user error was encountered
   * Error 500 = Indicates that a system error was encountered
   */
  public save(): void {

    this.log.trace(`${LOG_PREFIX} Entering save()`);

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
        .createDataForm(
          new DataForm({
            data: {
              contextId: this.contextId,
              name,
              workflow: this.workflow,
              description
            },
            version: null
          }))
        .subscribe({
          next: (response: DataForm) => {

            // The Data Form Record was saved successfully
            this.log.trace(`${LOG_PREFIX} Data Form Record was saved successfuly`);

            // Reset the forms
            this.log.trace(`${LOG_PREFIX} Resetting the forms`);
            this.dataFormsForm.controls['name'].reset();
            this.dataFormsForm.controls['description'].reset();

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
