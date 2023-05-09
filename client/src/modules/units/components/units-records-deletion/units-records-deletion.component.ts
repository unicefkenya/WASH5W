import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { Unit } from '@modules/units/models/unit.model';
import { UnitsDataService } from '@modules/units/services/units-data.service';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Units Records Deletion Component]";

@Component({
  selector: 'sb-units-records-deletion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './units-records-deletion.component.html',
  styleUrls: ['units-records-deletion.component.scss'],
})
export class UnitsRecordsDeletionComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Unit record
  @Input() public id!: number;

  // Broadcasts successful Units updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Units updation events together with their error abbreviations
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the target Unit
  public unit: Unit | null | undefined = null;

  // Holds the custom icon classes
  public iconClasses: string[] = ["text-danger"];

  constructor(
    private unitsDataService: UnitsDataService,
    private log: NGXLogger) {

  }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Unit field based on the passed in id
    this.initialiseUnit(() => {

      // Mark Init as complete
      this.log.trace(`${LOG_PREFIX} Init completed`);

    });

  }



  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }

  /**
   * Retrieves the Unit with the injected id and sets it as the Unit that needs to be deleted
   * @param callback The function to call when done
   */
  private initialiseUnit(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseTargetUnitRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveUnitRecord(this.id, (unit: Unit | null) => {

      // Set the target Unit
      this.log.trace(`${LOG_PREFIX} Setting the target Unit`);
      this.unit = unit;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }

  /**
   * Retrieves a Unit record given its unique identifier
   * @param id The unique identifier of the Unit
   * @param callback The function to call when done
   */
  private retrieveUnitRecord(id: number, callback: (unit: Unit | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveUnitRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the unit id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the unit id has been specified`);
    if (id) {

      // The Unit id has been specified
      this.log.trace(`${LOG_PREFIX} The Unit id has been specified`);
      this.log.debug(`${LOG_PREFIX} Unit Id = ${JSON.stringify(id)}`);

      // Try retrieving a Unit Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve a Unit Record with the passed in id`);
      const unit: Unit | undefined = id ? this.unitsDataService.records.find(d => d.id == id) : undefined;

      // Check if the Unit Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the Unit Record was successfully retrieved`);
      if (unit) {

        // The Unit Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Unit Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} Unit Record = ${JSON.stringify(this.unit)}`);

        // Return the Unit
        this.log.trace(`${LOG_PREFIX} Returning the Unit`);
        callback(unit);

      } else {

        // The Unit Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Unit Record was not successfully retrieved`);

        // Return null
        this.log.warn(`${LOG_PREFIX} Returning null`);
        callback(null);

      }


    } else {

      // The Unit id has not been specified
      this.log.error(`${LOG_PREFIX} The Unit id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }



  /**
   * Deletes Unit Records.
   * Emits an succeeded or failed event indicating whether or not the saving exercise was successful.
   * Error 500 = Indicates something unexpected happened at the server side
   */
  public delete(): void {

    this.log.trace(`${LOG_PREFIX} Entering delete()`);

    // Check if the target Unit record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Unit record was successfully initialised()`);
    if (this.unit) {

      // The target Unit record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Unit record was successfully initialised()`);

      // Delete the record
      this.log.trace(`${LOG_PREFIX} Deleting the Unit Record`);
      this.unitsDataService
        .deleteUnit(this.id)
        .subscribe({
          next: () => {

            // The Unit Record was deleted successfully
            this.log.trace(`${LOG_PREFIX} Unit Record was deleted successfuly`);

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The Unit Record was not deleted successfully
            this.log.trace(`${LOG_PREFIX} Unit Record was not deleted successfuly`);

            // Emit a 'failed' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
            this.failed.emit(500);
          }
        });

    } else {
      // The target Unit record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Unit record was not successfully initialised()`);

      // Emit an 'invalid' event
      this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
      this.failed.emit(500);

    }



  }


}
