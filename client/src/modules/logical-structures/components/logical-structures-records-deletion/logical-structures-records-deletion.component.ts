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
import { LogicalStructure } from '@modules/logical-structures/models/logical-structure.model';
import { LogicalStructuresDataService } from '@modules/logical-structures/services/logical-structures-data.service';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Logical Structures Records Deletion Component]";

@Component({
  selector: 'sb-logical-structures-records-deletion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './logical-structures-records-deletion.component.html',
  styleUrls: ['logical-structures-records-deletion.component.scss'],
})
export class LogicalStructuresRecordsDeletionComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Logical Structure record
  @Input() public id!: number;

  // Broadcasts successful Logical Structures updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Logical Structures updation events together with their error codes
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the Logical Structure record with the passed in id
  public logicalStructure: LogicalStructure | null | undefined;

  // Holds the custom icon classes
  public iconClasses: string[] = ["text-danger"];

  constructor(private logicalStructuresDataService: LogicalStructuresDataService, private log: NGXLogger) { }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Logical Structure field based on the passed in id
    this.initialiseLogicalStructure(() => {

      // Mark Init as complete
      this.log.trace(`${LOG_PREFIX} Init completed`);

    });

  }


  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }

  /**
   * Retrieves the Logical Structure with the injected id and sets it as the Logical Structure that needs to be updated
   * @param callback The function to call when done
   */
  private initialiseLogicalStructure(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseLogicalStructure()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveLogicalStructureRecord(this.id, (logicalStructure: LogicalStructure | null) => {

      // Set the target Logical Structure
      this.log.trace(`${LOG_PREFIX} Setting the target Logical Structure`);
      this.logicalStructure = logicalStructure;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }


  /**
   * Retrieves a Logical Structure record given its unique identifier synchronously
   * @param id The unique identifier of the Logical Structure
   * @param callback The function to call when done
   */
  private retrieveLogicalStructureRecord(id: number, callback: (logicalStructure: LogicalStructure | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveLogicalStructureRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the Logical Scheme Id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the Logical Scheme Id has been specified`);
    if (id) {

      // The Logical Scheme Id has been specified
      this.log.trace(`${LOG_PREFIX} The Logical Scheme Id has been specified`);
      this.log.debug(`${LOG_PREFIX} Logical Structure Id = ${JSON.stringify(id)}`);

      // Try retrieving a Logical Structure Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve a Logical Structure Record with the passed in id`);
      const logicalStructure: LogicalStructure | undefined = id ? this.logicalStructuresDataService.records.find(d => d.id == id) : undefined;

      // Check if the Logical Structure Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the Logical Structure Record was successfully retrieved`);
      if (logicalStructure) {

        // The Logical Structure Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Logical Structure Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} Logical Structure Record = ${JSON.stringify(this.logicalStructure)}`);

        // Return the Logical Structure
        this.log.warn(`${LOG_PREFIX} Returning the Logical Structure`);
        callback(logicalStructure);

      } else {

        // The Logical Structure Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Logical Structure Record was not successfully retrieved`);

        // Return null
        this.log.warn(`${LOG_PREFIX} Returning null`);
        callback(null);

      }


    } else {

      // The Logical Scheme Id has not been specified
      this.log.error(`${LOG_PREFIX} The Logical Scheme Id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }




  /**
   * Deletes Logical Structure Records.
   * Emits an succeeded or failed event indicating whether or not the saving exercise was successful.
   * Error 500 = Indicates something unexpected happened at the server side
   */
  public delete(): void {

    // Check if the target Logical Structure record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Logical Structure record was successfully initialised()`);
    if (this.logicalStructure) {

      // The target Logical Structure record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Logical Structure record was successfully initialised()`);

      // Delete the record
      this.log.trace(`${LOG_PREFIX} Deleting the Logical Structure Record`);
      this.logicalStructuresDataService
        .deleteLogicalStructure(this.id)
        .subscribe({
          next: () => {

            // The Logical Structure Record was deleted successfully
            this.log.trace(`${LOG_PREFIX} Logical Structure Record was deleted successfuly`);

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The Logical Structure Record was not deleted successfully
            this.log.trace(`${LOG_PREFIX} Logical Structure Record was not deleted successfuly`);

            // Emit a 'failed' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
            this.failed.emit(500);
          }
        });

    } else {
      // The target Logical Structure record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Logical Structure record was not successfully initialised()`);

      // Emit an 'invalid' event
      this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
      this.failed.emit(500);

    }



  }


}
