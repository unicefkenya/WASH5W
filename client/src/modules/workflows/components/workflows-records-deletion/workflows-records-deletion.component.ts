import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { Workflow } from '@modules/workflows/models/workflow.model';
import { WorkflowsDataService } from '@modules/workflows/services/workflows-data.service';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Workflows Records Deletion Component]";

@Component({
  selector: 'sb-workflows-records-deletion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './workflows-records-deletion.component.html',
  styleUrls: ['workflows-records-deletion.component.scss'],
})
export class WorkflowsRecordsDeletionComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Workflow record
  @Input() public id!: number;

  // Broadcasts successful Workflows updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Workflows updation events together with their error abbreviations
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the target Workflow
  public workflow: Workflow | null | undefined = null;

  // Holds the custom icon classes
  public iconClasses: string[] = ["text-danger"];

  constructor(
    private workflowsDataService: WorkflowsDataService,
    private log: NGXLogger) {

  }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Workflow field based on the passed in id
    this.initialiseWorkflow(() => {

      // Mark Init as complete
      this.log.trace(`${LOG_PREFIX} Init completed`);

    });

  }



  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }

  /**
   * Retrieves the Workflow with the injected id and sets it as the Workflow that needs to be deleted
   * @param callback The function to call when done
   */
  private initialiseWorkflow(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseTargetWorkflowRecord()`);
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
   * Retrieves a Workflow record given its unique identifier
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
        this.log.trace(`${LOG_PREFIX} Returning the Workflow`);
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
   * Deletes Workflow Records.
   * Emits an succeeded or failed event indicating whether or not the saving exercise was successful.
   * Error 500 = Indicates something unexpected happened at the server side
   */
  public delete(): void {

    this.log.trace(`${LOG_PREFIX} Entering delete()`);

    // Check if the target Workflow record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Workflow record was successfully initialised()`);
    if (this.workflow) {

      // The target Workflow record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Workflow record was successfully initialised()`);

      // Delete the record
      this.log.trace(`${LOG_PREFIX} Deleting the Workflow Record`);
      this.workflowsDataService
        .deleteWorkflow(this.id)
        .subscribe({
          next: () => {

            // The Workflow Record was deleted successfully
            this.log.trace(`${LOG_PREFIX} Workflow Record was deleted successfuly`);

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The Workflow Record was not deleted successfully
            this.log.trace(`${LOG_PREFIX} Workflow Record was not deleted successfuly`);

            // Emit a 'failed' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
            this.failed.emit(500);
          }
        });

    } else {
      // The target Workflow record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Workflow record was not successfully initialised()`);

      // Emit an 'invalid' event
      this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
      this.failed.emit(500);

    }



  }


}
