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
import { Visualisation } from '@modules/visualisations/models/visualisation.model';
import { VisualisationsDataService } from '@modules/visualisations/services/visualisations-data.service';
import { VisualisationsMessagesService } from '@modules/visualisations/services/visualisations-message.service';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Visualisations Records Deletion Component]";

@Component({
  selector: 'sb-visualisations-records-deletion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './visualisations-records-deletion.component.html',
  styleUrls: ['visualisations-records-deletion.component.scss'],
})
export class VisualisationsRecordsDeletionComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Visualisation record
  @Input() public id!: number;

  // Broadcasts successful Visualisations updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Visualisations updation events together with their error codes
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the Visualisation record with the passed in id
  public visualisation: Visualisation | null | undefined;

  // Holds the custom icon classes
  public iconClasses: string[] = ["text-danger"];

  constructor(private visualisationsDataService: VisualisationsDataService, public visualisationsMessagesService: VisualisationsMessagesService, private log: NGXLogger) { }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Visualisation field based on the passed in id
    this.initialiseVisualisation(() => {

      // Mark Init as complete
      this.log.trace(`${LOG_PREFIX} Init completed`);

    });

  }


  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }

  /**
   * Retrieves the Visualisation with the injected id and sets it as the Visualisation that needs to be updated
   * @param callback The function to call when done
   */
  private initialiseVisualisation(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseVisualisation()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveVisualisationRecord(this.id, (visualisation: Visualisation | null) => {

      // Set the target Visualisation
      this.log.trace(`${LOG_PREFIX} Setting the target Visualisation`);
      this.visualisation = visualisation;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }


  /**
   * Retrieves an Visualisation record given its unique identifier synchronously
   * @param id The unique identifier of the Visualisation
   * @param callback The function to call when done
   */
   private retrieveVisualisationRecord(id: number, callback: (visualisation: Visualisation | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveVisualisationRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the Visualisation Type Id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the Visualisation Type Id has been specified`);
    if (id) {

      // The Visualisation Type Id has been specified
      this.log.trace(`${LOG_PREFIX} The Visualisation Type Id has been specified`);
      this.log.debug(`${LOG_PREFIX} Visualisation Id = ${JSON.stringify(id)}`);

      // Try retrieving an Visualisation Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve an Visualisation Record with the passed in id`);
      this.visualisationsDataService
      .getVisualisations(false, {
          searchTerm: null,
          page: null,
          pageSize: null,
          sortColumn: null,
          sortDirection: null,
          id: id,
          visualisationContainerId: null,
          visualisationTypeId: null,
          visualisationDataTypeId: null,
          name: null
      })
      .subscribe({
          next: (visualisations: Visualisation[]) => {
              if(visualisations.length > 0) {
                callback(visualisations[0]);
              } else {
                callback(null);
              }
          },
          error: (err: Error) => {
              callback(null);
          }
      });

    } else {

      // The Visualisation Type Id has not been specified
      this.log.error(`${LOG_PREFIX} The Visualisation Type Id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }




  /**
   * Deletes Visualisation Records.
   * Emits an succeeded or failed event indicating whether or not the saving exercise was successful.
   * Error 500 = Indicates something unexpected happened at the server side
   */
  public delete(): void {

    // Check if the target Visualisation record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Visualisation record was successfully initialised()`);
    if (this.visualisation) {

      // The target Visualisation record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Visualisation record was successfully initialised()`);

      // Delete the record
      this.log.trace(`${LOG_PREFIX} Deleting the Visualisation Record`);
      this.visualisationsDataService
        .deleteVisualisation(this.id)
        .subscribe({
          next: () => {

            // The Visualisation Record was deleted successfully
            this.log.trace(`${LOG_PREFIX} Visualisation Record was deleted successfuly`);

            this.visualisationsMessagesService.broadcastVisualisationModificationMessage();

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The Visualisation Record was not deleted successfully
            this.log.trace(`${LOG_PREFIX} Visualisation Record was not deleted successfuly`);

            // Emit a 'failed' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
            this.failed.emit(500);
          }
        });

    } else {
      // The target Visualisation record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Visualisation record was not successfully initialised()`);

      // Emit an 'invalid' event
      this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
      this.failed.emit(500);

    }



  }


}
