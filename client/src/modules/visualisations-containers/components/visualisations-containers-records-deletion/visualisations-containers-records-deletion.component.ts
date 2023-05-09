import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { VisualisationContainer } from '@modules/visualisations-containers/models/visualisation-container.model';
import { VisualisationsContainersDataService } from '@modules/visualisations-containers/services/visualisations-containers-data.service';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Visualisations Containers Records Deletion Component]";

@Component({
  selector: 'sb-visualisationsContainers-records-deletion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './visualisations-containers-records-deletion.component.html',
  styleUrls: ['visualisations-containers-records-deletion.component.scss'],
})
export class VisualisationsContainersRecordsDeletionComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Visualisation Container record
  @Input() public id!: number;

  // Broadcasts successful Visualisations Containers updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Visualisations Containers updation events together with their error plurals
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the target Visualisation Container
  public visualisationContainer: VisualisationContainer | null | undefined = null;

  // Holds the custom icon classes
  public iconClasses: string[] = ["text-danger"];

  constructor(
    private visualisationsContainersDataService: VisualisationsContainersDataService,
    private log: NGXLogger) {

  }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Visualisation Container field based on the passed in id
    this.initialiseVisualisationContainer(() => {

      // Mark Init as complete
      this.log.trace(`${LOG_PREFIX} Init completed`);

    });

  }



  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }

  /**
   * Retrieves the Visualisation Container with the injected id and sets it as the Visualisation Container that needs to be deleted
   * @param callback The function to call when done
   */
  private initialiseVisualisationContainer(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseTargetVisualisationContainerRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveVisualisationContainerRecord(this.id, (visualisationContainer: VisualisationContainer | null) => {

      // Set the target Visualisation Container
      this.log.trace(`${LOG_PREFIX} Setting the target Visualisation Container`);
      this.visualisationContainer = visualisationContainer;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }

  /**
   * Retrieves an Visualisation Container record given its unique identifier
   * @param id The unique identifier of the Visualisation Container
   * @param callback The function to call when done
   */
  private retrieveVisualisationContainerRecord(id: number, callback: (visualisationContainer: VisualisationContainer | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveVisualisationContainerRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the visualisationContainer id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the visualisationContainer id has been specified`);
    if (id) {

      // The Visualisation Container id has been specified
      this.log.trace(`${LOG_PREFIX} The Visualisation Container id has been specified`);
      this.log.debug(`${LOG_PREFIX} Visualisation Container Id = ${JSON.stringify(id)}`);

      // Try retrieving an Visualisation Container Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve an Visualisation Container Record with the passed in id`);
      const visualisationContainer: VisualisationContainer | undefined = id ? this.visualisationsContainersDataService.records.find(d => d.id == id) : undefined;

      // Check if the Visualisation Container Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the Visualisation Container Record was successfully retrieved`);
      if (visualisationContainer) {

        // The Visualisation Container Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Visualisation Container Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} Visualisation Container Record = ${JSON.stringify(this.visualisationContainer)}`);

        // Return the Visualisation Container
        this.log.trace(`${LOG_PREFIX} Returning the Visualisation Container`);
        callback(visualisationContainer);

      } else {

        // The Visualisation Container Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Visualisation Container Record was not successfully retrieved`);

        // Return null
        this.log.warn(`${LOG_PREFIX} Returning null`);
        callback(null);

      }


    } else {

      // The Visualisation Container id has not been specified
      this.log.error(`${LOG_PREFIX} The Visualisation Container id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }



  /**
   * Deletes Visualisation Container Records.
   * Emits an succeeded or failed event indicating whether or not the saving exercise was successful.
   * Error 500 = Indicates something unexpected happened at the server side
   */
  public delete(): void {

    this.log.trace(`${LOG_PREFIX} Entering delete()`);

    // Check if the target Visualisation Container record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Visualisation Container record was successfully initialised()`);
    if (this.visualisationContainer) {

      // The target Visualisation Container record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Visualisation Container record was successfully initialised()`);

      // Delete the record
      this.log.trace(`${LOG_PREFIX} Deleting the Visualisation Container Record`);
      this.visualisationsContainersDataService
        .deleteVisualisationContainer(this.id)
        .subscribe({
          next: () => {

            // The Visualisation Container Record was deleted successfully
            this.log.trace(`${LOG_PREFIX} Visualisation Container Record was deleted successfuly`);

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The Visualisation Container Record was not deleted successfully
            this.log.trace(`${LOG_PREFIX} Visualisation Container Record was not deleted successfuly`);

            // Emit a 'failed' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
            this.failed.emit(500);
          }
        });

    } else {
      // The target Visualisation Container record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Visualisation Container record was not successfully initialised()`);

      // Emit an 'invalid' event
      this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
      this.failed.emit(500);

    }



  }


}
