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
import { QuantityObservation } from '@modules/quantities-observations/models/quantity-observation.model';
import { QuantitiesObservationsDataService } from '@modules/quantities-observations/services/quantities-observations-data.service';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[QuantitiesObservations Records Deletion Component]";

@Component({
  selector: 'sb-quantities-observations-records-deletion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './quantities-observations-records-deletion.component.html',
  styleUrls: ['quantities-observations-records-deletion.component.scss'],
})
export class QuantitiesObservationsRecordsDeletionComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Quantity Observation Record
  @Input() public id!: number;

  // Broadcasts successful QuantitiesObservations updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed QuantitiesObservations updation events together with their error codes
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the Quantity Observation record with the passed in id
  public quantityObservation: QuantityObservation | null | undefined;

  // Holds the custom icon classes
  public iconClasses: string[] = ["text-danger"];

  constructor(private quantitiesObservationsDataService: QuantitiesObservationsDataService, private log: NGXLogger) { }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Quantity Observation field based on the passed in id
    this.initialiseQuantityObservation(() => {

      // Mark Init as complete
      this.log.trace(`${LOG_PREFIX} Init completed`);

    });

  }


  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }

  /**
   * Retrieves the Quantity Observation with the injected id and sets it as the Quantity Observation that needs to be updated
   * @param callback The function to call when done
   */
  private initialiseQuantityObservation(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseQuantityObservation()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveQuantityObservationRecord(this.id, (quantityObservation: QuantityObservation | null) => {

      // Set the target QuantityObservation
      this.log.trace(`${LOG_PREFIX} Setting the target QuantityObservation`);
      this.quantityObservation = quantityObservation;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }


  /**
   * Retrieves a Quantity Observation Record given its unique identifier synchronously
   * @param id The unique identifier of the Quantity Observation
   * @param callback The function to call when done
   */
  private retrieveQuantityObservationRecord(id: number, callback: (quantityObservation: QuantityObservation | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveQuantityObservationRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the Quantity Observation Id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the Quantity Observation Id has been specified`);
    if (id) {

      // The Quantity Observation Id has been specified
      this.log.trace(`${LOG_PREFIX} The Quantity Observation Id has been specified`);
      this.log.debug(`${LOG_PREFIX} QuantityObservation Id = ${JSON.stringify(id)}`);

      // Try retrieving a Quantity Observation Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve a Quantity Observation Record with the passed in id`);
      const quantityObservation: QuantityObservation | undefined = id ? this.quantitiesObservationsDataService.records.find(d => d.id == id) : undefined;

      // Check if the Quantity Observation Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the Quantity Observation Record was successfully retrieved`);
      if (quantityObservation) {

        // The Quantity Observation Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Quantity Observation Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} Quantity Observation Record = ${JSON.stringify(this.quantityObservation)}`);

        // Return the Quantity Observation
        this.log.warn(`${LOG_PREFIX} Returning the Quantity Observation`);
        callback(quantityObservation);

      } else {

        // The Quantity Observation Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Quantity Observation Record was not successfully retrieved`);

        // Return null
        this.log.warn(`${LOG_PREFIX} Returning null`);
        callback(null);

      }


    } else {

      // The Quantity Observation Id has not been specified
      this.log.error(`${LOG_PREFIX} The Quantity Observation Id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }




  /**
   * Deletes Quantity Observation Records.
   * Emits an succeeded or failed event indicating whether or not the saving exercise was successful.
   * Error 500 = Indicates something unexpected happened at the server side
   */
  public delete(): void {

    // Check if the target Quantity Observation Record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Quantity Observation Record was successfully initialised()`);
    if (this.quantityObservation) {

      // The target Quantity Observation Record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Quantity Observation Record was successfully initialised()`);

      // Delete the record
      this.log.trace(`${LOG_PREFIX} Deleting the Quantity Observation Record`);
      this.quantitiesObservationsDataService
        .deleteQuantityObservation(this.id)
        .subscribe({
          next: () => {

            // The Quantity Observation Record was deleted successfully
            this.log.trace(`${LOG_PREFIX} Quantity Observation Record was deleted successfuly`);

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The Quantity Observation Record was not deleted successfully
            this.log.trace(`${LOG_PREFIX} Quantity Observation Record was not deleted successfuly`);

            // Emit a 'failed' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
            this.failed.emit(500);
          }
        });

    } else {
      // The target Quantity Observation Record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Quantity Observation Record was not successfully initialised()`);

      // Emit an 'invalid' event
      this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
      this.failed.emit(500);

    }



  }


}
