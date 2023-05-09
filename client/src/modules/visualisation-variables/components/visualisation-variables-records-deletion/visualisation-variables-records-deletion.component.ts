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
import { VisualisationVariable } from '@modules/visualisation-variables/models/visualisation-variable.model';
import { VisualisationVariablesDataService } from '@modules/visualisation-variables/services/visualisation-variables-data.service';
import { VisualisationsVariablesMessagesService } from '@modules/visualisation-variables/services/visualisations-variables-message.service';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Visualisation Variables Records Deletion Component]";

@Component({
  selector: 'sb-visualisation-variables-records-deletion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './visualisation-variables-records-deletion.component.html',
  styleUrls: ['visualisation-variables-records-deletion.component.scss'],
})
export class VisualisationVariablesRecordsDeletionComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Visualisation Variable record
  @Input() public id!: number;

  // Broadcasts successful Visualisation Variables updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Visualisation Variables updation events together with their error codes
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the Visualisation Variable record with the passed in id
  public visualisationVariable: VisualisationVariable | null | undefined;

  // Holds the custom icon classes
  public iconClasses: string[] = ["text-danger"];

  constructor(
    private visualisationVariablesDataService: VisualisationVariablesDataService, 
    public visualisationsVariablesMessagesService: VisualisationsVariablesMessagesService,
    private log: NGXLogger) { }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Visualisation Variable field based on the passed in id
    this.initialiseVisualisationVariable(() => {

      // Mark Init as complete
      this.log.trace(`${LOG_PREFIX} Init completed`);

    });

  }


  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }

  /**
   * Retrieves the Visualisation Variable with the injected id and sets it as the Visualisation Variable that needs to be updated
   * @param callback The function to call when done
   */
  private initialiseVisualisationVariable(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseVisualisationVariable()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveVisualisationVariableRecord(this.id, (visualisationVariable: VisualisationVariable | null) => {

      // Set the target Visualisation Variable
      this.log.trace(`${LOG_PREFIX} Setting the target Visualisation Variable`);
      this.visualisationVariable = visualisationVariable;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }

 /**
   * Retrieves an Visualisation Variable record given its unique identifier synchronously
   * @param id The unique identifier of the Visualisation Variable
   * @param callback The function to call when done
   */
  private retrieveVisualisationVariableRecord(id: number, callback: (visualisationVariable: VisualisationVariable | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveVisualisationVariableRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the Visualisation Id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the Visualisation Id has been specified`);
    if (id) {

      // The Visualisation Id has been specified
      this.log.trace(`${LOG_PREFIX} The Visualisation Id has been specified`);
      this.log.debug(`${LOG_PREFIX} Visualisation Variable Id = ${JSON.stringify(id)}`);

      // Try retrieving an Visualisation Variable Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve an Visualisation Variable Record with the passed in id`);
      this.visualisationVariablesDataService
      .getVisualisationsVariables(false, {
          searchTerm: null,
          page: null,
          pageSize: null,
          sortColumn: null,
          sortDirection: null,
          id: id,
          visualisationId: null,
          indicatorId: null,
          roleId: null
      })
      .subscribe({
          next: (visualisationsVariables: VisualisationVariable[]) => {

            // Check if an Visualisation Variable record with the given id was found
            this.log.trace(`${LOG_PREFIX} Checking if an Visualisation Variable record with the given id was found`);
            if (visualisationsVariables.length > 0) {

              //An Visualisation Variable record with the given id was found
              this.log.trace(`${LOG_PREFIX} An Visualisation Variable record with the given id was found`);

              // Return the Visualisation Variable record
              this.log.trace(`${LOG_PREFIX} Returning the Visualisation Variable record`);
              callback(visualisationsVariables[0]);


            } else {

              //An Visualisation Variable record with the given id was not found
              this.log.trace(`${LOG_PREFIX} An Visualisation Variable record with the given id was not found`);

              // Return null
              this.log.warn(`${LOG_PREFIX} Return null`);
              callback(null);

            }
          },
          error: (err: Error) => {
              // Return null
              this.log.warn(`${LOG_PREFIX} Return null`);
              callback(null);
          }
      });


    } else {

      // The Visualisation Id has not been specified
      this.log.error(`${LOG_PREFIX} The Visualisation Id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }



  /**
   * Deletes Visualisation Variable Records.
   * Emits an succeeded or failed event indicating whether or not the saving exercise was successful.
   * Error 500 = Indicates something unexpected happened at the server side
   */
  public delete(): void {

    // Check if the target Visualisation Variable record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Visualisation Variable record was successfully initialised()`);
    if (this.visualisationVariable) {

      // The target Visualisation Variable record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Visualisation Variable record was successfully initialised()`);

      // Delete the record
      this.log.trace(`${LOG_PREFIX} Deleting the Visualisation Variable Record`);
      this.visualisationVariablesDataService
        .deleteVisualisationVariable(this.id)
        .subscribe({
          next: () => {

            // The Visualisation Variable Record was deleted successfully
            this.log.trace(`${LOG_PREFIX} Visualisation Variable Record was deleted successfuly`);
            this.visualisationsVariablesMessagesService.broadcastVisualisationVariableModificationMessage();

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The Visualisation Variable Record was not deleted successfully
            this.log.trace(`${LOG_PREFIX} Visualisation Variable Record was not deleted successfuly`);

            // Emit a 'failed' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
            this.failed.emit(500);
          }
        });

    } else {
      // The target Visualisation Variable record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Visualisation Variable record was not successfully initialised()`);

      // Emit an 'invalid' event
      this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
      this.failed.emit(500);

    }



  }


}
