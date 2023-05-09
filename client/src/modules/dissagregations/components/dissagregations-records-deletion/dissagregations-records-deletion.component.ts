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
import { Dissagregation } from '@modules/dissagregations/models/dissagregation.model';
import { DissagregationsDataService } from '@modules/dissagregations/services/dissagregations-data.service';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Dissagregations Records Deletion Component]";

@Component({
  selector: 'sb-dissagregations-records-deletion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dissagregations-records-deletion.component.html',
  styleUrls: ['dissagregations-records-deletion.component.scss'],
})
export class DissagregationsRecordsDeletionComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Dissagregation record
  @Input() public id!: number;

  // Broadcasts successful Dissagregations updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Dissagregations updation events together with their error codes
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the Dissagregation record with the passed in id
  public dissagregation: Dissagregation | null | undefined;

  // Holds the custom icon classes
  public iconClasses: string[] = ["text-danger"];

  constructor(private dissagregationsDataService: DissagregationsDataService, private log: NGXLogger) { }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Dissagregation field based on the passed in id
    this.initialiseDissagregation(() => {

      // Mark Init as complete
      this.log.trace(`${LOG_PREFIX} Init completed`);

    });

  }


  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }

  /**
   * Retrieves the Dissagregation with the injected id and sets it as the Dissagregation that needs to be updated
   * @param callback The function to call when done
   */
  private initialiseDissagregation(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseDissagregation()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveDissagregationRecord(this.id, (dissagregation: Dissagregation | null) => {

      // Set the target Dissagregation
      this.log.trace(`${LOG_PREFIX} Setting the target Dissagregation`);
      this.dissagregation = dissagregation;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }


  /**
   * Retrieves an Dissagregation record given its unique identifier synchronously
   * @param id The unique identifier of the Dissagregation
   * @param callback The function to call when done
   */
  private retrieveDissagregationRecord(id: number, callback: (dissagregation: Dissagregation | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveDissagregationRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the Dissagregation Type Id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the Dissagregation Type Id has been specified`);
    if (id) {

      // The Dissagregation Type Id has been specified
      this.log.trace(`${LOG_PREFIX} The Dissagregation Type Id has been specified`);
      this.log.debug(`${LOG_PREFIX} Dissagregation Id = ${JSON.stringify(id)}`);

      // Try retrieving an Dissagregation Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve an Dissagregation Record with the passed in id`);
      const dissagregation: Dissagregation | undefined = id ? this.dissagregationsDataService.records.find(d => d.id == id) : undefined;

      // Check if the Dissagregation Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the Dissagregation Record was successfully retrieved`);
      if (dissagregation) {

        // The Dissagregation Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Dissagregation Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} Dissagregation Record = ${JSON.stringify(this.dissagregation)}`);

        // Return the Dissagregation
        this.log.warn(`${LOG_PREFIX} Returning the Dissagregation`);
        callback(dissagregation);

      } else {

        // The Dissagregation Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Dissagregation Record was not successfully retrieved`);

        // Return null
        this.log.warn(`${LOG_PREFIX} Returning null`);
        callback(null);

      }


    } else {

      // The Dissagregation Type Id has not been specified
      this.log.error(`${LOG_PREFIX} The Dissagregation Type Id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }




  /**
   * Deletes Dissagregation Records.
   * Emits an succeeded or failed event indicating whether or not the saving exercise was successful.
   * Error 500 = Indicates something unexpected happened at the server side
   */
  public delete(): void {

    // Check if the target Dissagregation record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Dissagregation record was successfully initialised()`);
    if (this.dissagregation) {

      // The target Dissagregation record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Dissagregation record was successfully initialised()`);

      // Delete the record
      this.log.trace(`${LOG_PREFIX} Deleting the Dissagregation Record`);
      this.dissagregationsDataService
        .deleteDissagregation(this.id)
        .subscribe({
          next: () => {

            // The Dissagregation Record was deleted successfully
            this.log.trace(`${LOG_PREFIX} Dissagregation Record was deleted successfuly`);

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The Dissagregation Record was not deleted successfully
            this.log.trace(`${LOG_PREFIX} Dissagregation Record was not deleted successfuly`);

            // Emit a 'failed' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
            this.failed.emit(500);
          }
        });

    } else {
      // The target Dissagregation record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Dissagregation record was not successfully initialised()`);

      // Emit an 'invalid' event
      this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
      this.failed.emit(500);

    }



  }


}
