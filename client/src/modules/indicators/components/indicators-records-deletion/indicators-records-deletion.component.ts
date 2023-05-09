import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { Indicator } from '@modules/indicators/models/indicator.model';
import { IndicatorsDataService } from '@modules/indicators/services/indicators-data.service';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Indicators Records Deletion Component]";

@Component({
  selector: 'sb-indicators-records-deletion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './indicators-records-deletion.component.html',
  styleUrls: ['indicators-records-deletion.component.scss'],
})
export class IndicatorsRecordsDeletionComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Indicator record
  @Input() public id!: number;

  // Broadcasts successful Indicators updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Indicators updation events together with their error abbreviations
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the target Indicator
  public indicator: Indicator | null | undefined = null;

  // Holds the custom icon classes
  public iconClasses: string[] = ["text-danger"];

  constructor(
    private indicatorsDataService: IndicatorsDataService,
    private log: NGXLogger) {

  }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Indicator field based on the passed in id
    this.initialiseIndicator(() => {

      // Mark Init as complete
      this.log.trace(`${LOG_PREFIX} Init completed`);

    });

  }



  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }

  /**
   * Retrieves the Indicator with the injected id and sets it as the Indicator that needs to be deleted
   * @param callback The function to call when done
   */
  private initialiseIndicator(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseTargetIndicatorRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveIndicatorRecord(this.id, (indicator: Indicator | null) => {

      // Set the target Indicator
      this.log.trace(`${LOG_PREFIX} Setting the target Indicator`);
      this.indicator = indicator;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }

  /**
   * Retrieves an Indicator record given its unique identifier
   * @param id The unique identifier of the Indicator
   * @param callback The function to call when done
   */
  private retrieveIndicatorRecord(id: number, callback: (indicator: Indicator | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveIndicatorRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the indicator id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the indicator id has been specified`);
    if (id) {

      // The indicator id has been specified
      this.log.trace(`${LOG_PREFIX} The indicator id has been specified`);
      this.log.debug(`${LOG_PREFIX} Indicator Id = ${JSON.stringify(id)}`);

      // Try retrieving an Indicator Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve an Indicator Record with the passed in id`);
      const indicator: Indicator | undefined = id ? this.indicatorsDataService.records.find(d => d.id == id) : undefined;

      // Check if the Indicator Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the Indicator Record was successfully retrieved`);
      if (indicator) {

        // The Indicator Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Indicator Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} Indicator Record = ${JSON.stringify(this.indicator)}`);

        // Return the Indicator
        this.log.trace(`${LOG_PREFIX} Returning the Indicator`);
        callback(indicator);

      } else {

        // The Indicator Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Indicator Record was not successfully retrieved`);

        // Return null
        this.log.warn(`${LOG_PREFIX} Returning null`);
        callback(null);

      }


    } else {

      // The indicator id has not been specified
      this.log.error(`${LOG_PREFIX} The indicator id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }



  /**
   * Deletes Indicator Records.
   * Emits an succeeded or failed event indicating whether or not the saving exercise was successful.
   * Error 500 = Indicates something unexpected happened at the server side
   */
  public delete(): void {

    this.log.trace(`${LOG_PREFIX} Entering delete()`);

    // Check if the target Indicator record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Indicator record was successfully initialised()`);
    if (this.indicator) {

      // The target Indicator record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Indicator record was successfully initialised()`);

      // Delete the record
      this.log.trace(`${LOG_PREFIX} Deleting the Indicator Record`);
      this.indicatorsDataService
        .deleteIndicator(this.id)
        .subscribe({
          next: () => {

            // The Indicator Record was deleted successfully
            this.log.trace(`${LOG_PREFIX} Indicator Record was deleted successfuly`);

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The Indicator Record was not deleted successfully
            this.log.trace(`${LOG_PREFIX} Indicator Record was not deleted successfuly`);

            // Emit a 'failed' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
            this.failed.emit(500);
          }
        });

    } else {
      // The target Indicator record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Indicator record was not successfully initialised()`);

      // Emit an 'invalid' event
      this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
      this.failed.emit(500);

    }



  }


}
