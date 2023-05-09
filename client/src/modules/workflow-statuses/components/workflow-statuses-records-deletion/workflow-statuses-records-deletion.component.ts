import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { WorkflowStatus } from '@modules/workflow-statuses/models/workflow-status.model';
import { WorkflowStatusesDataService } from '@modules/workflow-statuses/services/workflow-statuses-data.service';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Workflow Statuses Records Deletion Component]";

@Component({
  selector: 'sb-workflow-statuses-records-deletion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './workflow-statuses-records-deletion.component.html',
  styleUrls: ['workflow-statuses-records-deletion.component.scss'],
})
export class WorkflowStatusesRecordsDeletionComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Workflow Status record
  @Input() public id!: number;

  // Broadcasts successful Workflow Statuses updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Workflow Statuses updation events together with their error plurals
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the target Workflow Status
  public workflowStatus: WorkflowStatus | null | undefined = null;

  // Holds the custom icon classes
  public iconClasses: string[] = ["text-danger"];

  constructor(
    private workflowStatusesDataService: WorkflowStatusesDataService,
    private log: NGXLogger) {

  }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Workflow Status field based on the passed in id
    this.initialiseWorkflowStatus(() => {

      // Mark Init as complete
      this.log.trace(`${LOG_PREFIX} Init completed`);

    });

  }



  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }

  /**
   * Retrieves the Workflow Status with the injected id and sets it as the Workflow Status that needs to be deleted
   * @param callback The function to call when done
   */
  private initialiseWorkflowStatus(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseTargetWorkflowStatusRecord()`);
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
   * Retrieves a Workflow Status record given its unique identifier
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
        this.log.trace(`${LOG_PREFIX} Returning the Workflow Status`);
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
   * Deletes Workflow Status Records.
   * Emits an succeeded or failed event indicating whether or not the saving exercise was successful.
   * Error 500 = Indicates something unexpected happened at the server side
   */
  public delete(): void {

    this.log.trace(`${LOG_PREFIX} Entering delete()`);

    // Check if the target Workflow Status record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Workflow Status record was successfully initialised()`);
    if (this.workflowStatus) {

      // The target Workflow Status record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Workflow Status record was successfully initialised()`);

      // Delete the record
      this.log.trace(`${LOG_PREFIX} Deleting the Workflow Status Record`);
      this.workflowStatusesDataService
        .deleteWorkflowStatus(this.id)
        .subscribe({
          next: () => {

            // The Workflow Status Record was deleted successfully
            this.log.trace(`${LOG_PREFIX} Workflow Status Record was deleted successfuly`);

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The Workflow Status Record was not deleted successfully
            this.log.trace(`${LOG_PREFIX} Workflow Status Record was not deleted successfuly`);

            // Emit a 'failed' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
            this.failed.emit(500);
          }
        });

    } else {
      // The target Workflow Status record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Workflow Status record was not successfully initialised()`);

      // Emit an 'invalid' event
      this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
      this.failed.emit(500);

    }



  }


}
