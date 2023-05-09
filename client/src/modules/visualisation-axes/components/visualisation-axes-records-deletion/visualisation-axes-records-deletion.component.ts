import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { VisualisationAxis } from '@modules/visualisation-axes/models/visualisation-axis.model';
import { VisualisationsAxesDataService } from '@modules/visualisation-axes/services/visualisations-axes-data.service';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Visualisations Axes Records Deletion Component]";

@Component({
  selector: 'sb-visualisation-axes-records-deletion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './visualisation-axes-records-deletion.component.html',
  styleUrls: ['visualisation-axes-records-deletion.component.scss'],
})
export class VisualisationAxesRecordsDeletionComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Visualisation Axis record
  @Input() public id!: number;

  // Broadcasts successful Visualisation Axes updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Visualisation Axes updation events together with their error codes
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the Visualisation Axis record with the passed in id
  public visualisationAxis: VisualisationAxis | null | undefined;

  // Holds the custom icon classes
  public iconClasses: string[] = ["text-danger"];

  constructor(private visualisationsAxesDataService: VisualisationsAxesDataService, private log: NGXLogger) { }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Visualisation Axis field based on the passed in id
    this.initialiseVisualisationAxis(() => {

      // Mark Init as complete
      this.log.trace(`${LOG_PREFIX} Init completed`);

    });

  }


  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }

  /**
   * Retrieves the Visualisation Axis with the injected id and sets it as the Visualisation Axis that needs to be updated
   * @param callback The function to call when done
   */
  private initialiseVisualisationAxis(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseVisualisationAxis()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveVisualisationAxisRecord(this.id, (visualisationAxis: VisualisationAxis | null) => {

      // Set the target Visualisation Axis
      this.log.trace(`${LOG_PREFIX} Setting the target Visualisation Axis`);
      this.visualisationAxis = visualisationAxis;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }


   /**
   * Retrieves an Visualisation Axis record given its unique identifier synchronously
   * @param id The unique identifier of the Visualisation Axis
   * @param callback The function to call when done
   */
    private retrieveVisualisationAxisRecord(id: number, callback: (visualisationAxis: VisualisationAxis | null) => void): void {

      this.log.trace(`${LOG_PREFIX} Entering retrieveVisualisationAxisRecord()`);
      this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);
  
      // Check if the Visualisation Id has been specified
      this.log.trace(`${LOG_PREFIX} Checking if the Visualisation Id has been specified`);
      if (id) {
  
        // The Visualisation Id has been specified
        this.log.trace(`${LOG_PREFIX} The Visualisation Id has been specified`);
        this.log.debug(`${LOG_PREFIX} Visualisation Axis Id = ${JSON.stringify(id)}`);
  
        // Try retrieving an Visualisation Axis Record with the passed in id
        this.log.trace(`${LOG_PREFIX} Trying to retrieve an Visualisation Axis Record with the passed in id`);
        this.visualisationsAxesDataService
          .getVisualisationsAxes(false, {
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            id: id,
            visualisationId: null,
            axisId: null,
            label: null
          })
          .subscribe({
            next: (visualisationsAxes: VisualisationAxis[]) => {
  
              // Check if an Visualisation Axis record with the given id was found
              this.log.trace(`${LOG_PREFIX} Checking if an Visualisation Axis record with the given id was found`);
              if (visualisationsAxes.length > 0) {
  
                //An Visualisation Axis record with the given id was found
                this.log.trace(`${LOG_PREFIX} An Visualisation Axis record with the given id was found`);
  
                // Return the Visualisation Axis record
                this.log.trace(`${LOG_PREFIX} Returning the Visualisation Axis record`);
                callback(visualisationsAxes[0]);
  
  
              } else {
  
                //An Visualisation Axis record with the given id was not found
                this.log.trace(`${LOG_PREFIX} An Visualisation Axis record with the given id was not found`);
  
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
   * Deletes Visualisation Axis Records.
   * Emits an succeeded or failed event indicating whether or not the saving exercise was successful.
   * Error 500 = Indicates something unexpected happened at the server side
   */
  public delete(): void {

    // Check if the target Visualisation Axis record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Visualisation Axis record was successfully initialised()`);
    if (this.visualisationAxis) {

      // The target Visualisation Axis record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Visualisation Axis record was successfully initialised()`);

      // Delete the record
      this.log.trace(`${LOG_PREFIX} Deleting the Visualisation Axis Record`);
      this.visualisationsAxesDataService
        .deleteVisualisationAxis(this.id)
        .subscribe({
          next: () => {

            // The Visualisation Axis Record was deleted successfully
            this.log.trace(`${LOG_PREFIX} Visualisation Axis Record was deleted successfuly`);

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The Visualisation Axis Record was not deleted successfully
            this.log.trace(`${LOG_PREFIX} Visualisation Axis Record was not deleted successfuly`);

            // Emit a 'failed' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
            this.failed.emit(500);
          }
        });

    } else {
      // The target Visualisation Axis record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Visualisation Axis record was not successfully initialised()`);

      // Emit an 'invalid' event
      this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
      this.failed.emit(500);

    }



  }


}
