import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { WorkflowTransition } from '@modules/workflow-transitions/models/workflow-transition.model';
import { WorkflowTransitionsDataService } from '@modules/workflow-transitions/services/workflow-transitions-data.service';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Workflow Transitions Records Deletion Component]";

@Component({
  selector: 'sb-workflow-transitions-records-deletion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './workflow-transitions-records-deletion.component.html',
  styleUrls: ['workflow-transitions-records-deletion.component.scss'],
})
export class WorkflowTransitionsRecordsDeletionComponent implements OnInit {

  // Allows the from component to inject the unique identifier of the target Workflow Transition record
  @Input() public id!: number;

  // Broadcasts successful Workflow Transitions updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Workflow Transitions updation events together with their error codes
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the Workflow Transition record with the passed in id
  public workflowTransition: WorkflowTransition | null | undefined;

  // Holds the custom icon classes
  public iconClasses: string[] = ["text-danger"];

  constructor(private workflowTransitionsDataService: WorkflowTransitionsDataService, private log: NGXLogger) { }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Workflow Transition field based on the passed in id
    this.initialiseWorkflowTransition(() => {

      // Mark Init as complete
      this.log.trace(`${LOG_PREFIX} Init completed`);

    });

  }


  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }

  /**
   * Retrieves the Workflow Transition with the injected id and sets it as the Workflow Transition that needs to be updated
   * @param callback The function to call when done
   */
  private initialiseWorkflowTransition(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseWorkflowTransition()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveWorkflowTransitionRecord(this.id, (workflowTransition: WorkflowTransition | null) => {

      // Set the target Workflow Transition
      this.log.trace(`${LOG_PREFIX} Setting the target Workflow Transition`);
      this.workflowTransition = workflowTransition;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }


  /**
   * Retrieves a Workflow Transition record given its unique identifier synchronously
   * @param id The unique identifier of the Workflow Transition
   * @param callback The function to call when done
   */
  private retrieveWorkflowTransitionRecord(id: number, callback: (workflowTransition: WorkflowTransition | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveWorkflowTransitionRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the Workflow Id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the Workflow Id has been specified`);
    if (id) {

      // The Workflow Id has been specified
      this.log.trace(`${LOG_PREFIX} The Workflow Id has been specified`);
      this.log.debug(`${LOG_PREFIX} Workflow Transition Id = ${JSON.stringify(id)}`);

      // Try retrieving a Workflow Transition Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve a Workflow Transition Record with the passed in id`);
      const workflowTransition: WorkflowTransition | undefined = id ? this.workflowTransitionsDataService.records.find(d => d.id == id) : undefined;

      // Check if the Workflow Transition Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the Workflow Transition Record was successfully retrieved`);
      if (workflowTransition) {

        // The Workflow Transition Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Workflow Transition Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} Workflow Transition Record = ${JSON.stringify(this.workflowTransition)}`);

        // Return the Workflow Transition
        this.log.warn(`${LOG_PREFIX} Returning the Workflow Transition`);
        callback(workflowTransition);

      } else {

        // The Workflow Transition Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Workflow Transition Record was not successfully retrieved`);

        // Return null
        this.log.warn(`${LOG_PREFIX} Returning null`);
        callback(null);

      }


    } else {

      // The Workflow Id has not been specified
      this.log.error(`${LOG_PREFIX} The Workflow Id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }




  /**
   * Deletes Workflow Transition Records.
   * Emits an succeeded or failed event indicating whether or not the saving exercise was successful.
   * Error 500 = Indicates something unexpected happened at the server side
   */
  public delete(): void {

    // Check if the target Workflow Transition record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Workflow Transition record was successfully initialised()`);
    if (this.workflowTransition) {

      // The target Workflow Transition record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Workflow Transition record was successfully initialised()`);

      // Delete the record
      this.log.trace(`${LOG_PREFIX} Deleting the Workflow Transition Record`);
      this.workflowTransitionsDataService
        .deleteWorkflowTransition(this.id)
        .subscribe({
          next: () => {

            // The Workflow Transition Record was deleted successfully
            this.log.trace(`${LOG_PREFIX} Workflow Transition Record was deleted successfuly`);

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The Workflow Transition Record was not deleted successfully
            this.log.trace(`${LOG_PREFIX} Workflow Transition Record was not deleted successfuly`);

            // Emit a 'failed' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
            this.failed.emit(500);
          }
        });

    } else {
      // The target Workflow Transition record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Workflow Transition record was not successfully initialised()`);

      // Emit an 'invalid' event
      this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
      this.failed.emit(500);

    }



  }


}
