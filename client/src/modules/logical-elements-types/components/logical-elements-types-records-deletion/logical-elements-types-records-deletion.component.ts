import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { LogicalElementType } from '@modules/logical-elements-types/models/logical-element-type.model';
import { LogicalElementsTypesDataService } from '@modules/logical-elements-types/services/logical-elements-types-data.service';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Logical Elements Types Records Deletion Component]";

@Component({
  selector: 'sb-logicalElementsTypes-records-deletion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './logical-elements-types-records-deletion.component.html',
  styleUrls: ['logical-elements-types-records-deletion.component.scss'],
})
export class LogicalElementsTypesRecordsDeletionComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Logical Element Type record
  @Input() public id!: number;

  // Broadcasts successful Logical Elements Types updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Logical Elements Types updation events together with their error plurals
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the target Logical Element Type
  public logicalElementType: LogicalElementType | null | undefined = null;

  // Holds the custom icon classes
  public iconClasses: string[] = ["text-danger"];

  constructor(
    private logicalElementsTypesDataService: LogicalElementsTypesDataService,
    private log: NGXLogger) {

  }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Logical Element Type field based on the passed in id
    this.initialiseLogicalElementType(() => {

      // Mark Init as complete
      this.log.trace(`${LOG_PREFIX} Init completed`);

    });

  }



  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }

  /**
   * Retrieves the Logical Element Type with the injected id and sets it as the Logical Element Type that needs to be deleted
   * @param callback The function to call when done
   */
  private initialiseLogicalElementType(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseTargetLogicalElementTypeRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveLogicalElementTypeRecord(this.id, (logicalElementType: LogicalElementType | null) => {

      // Set the target Logical Element Type
      this.log.trace(`${LOG_PREFIX} Setting the target Logical Element Type`);
      this.logicalElementType = logicalElementType;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }

  /**
   * Retrieves a Logical Element Type record given its unique identifier
   * @param id The unique identifier of the Logical Element Type
   * @param callback The function to call when done
   */
  private retrieveLogicalElementTypeRecord(id: number, callback: (logicalElementType: LogicalElementType | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveLogicalElementTypeRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the logicalElementType id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the logicalElementType id has been specified`);
    if (id) {

      // The Logical Element Type id has been specified
      this.log.trace(`${LOG_PREFIX} The Logical Element Type id has been specified`);
      this.log.debug(`${LOG_PREFIX} Logical Element Type Id = ${JSON.stringify(id)}`);

      // Try retrieving a Logical Element Type Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve a Logical Element Type Record with the passed in id`);
      const logicalElementType: LogicalElementType | undefined = id ? this.logicalElementsTypesDataService.records.find(d => d.id == id) : undefined;

      // Check if the Logical Element Type Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the Logical Element Type Record was successfully retrieved`);
      if (logicalElementType) {

        // The Logical Element Type Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Logical Element Type Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} Logical Element Type Record = ${JSON.stringify(this.logicalElementType)}`);

        // Return the Logical Element Type
        this.log.trace(`${LOG_PREFIX} Returning the Logical Element Type`);
        callback(logicalElementType);

      } else {

        // The Logical Element Type Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Logical Element Type Record was not successfully retrieved`);

        // Return null
        this.log.warn(`${LOG_PREFIX} Returning null`);
        callback(null);

      }


    } else {

      // The Logical Element Type id has not been specified
      this.log.error(`${LOG_PREFIX} The Logical Element Type id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }



  /**
   * Deletes Logical Element Type Records.
   * Emits an succeeded or failed event indicating whether or not the saving exercise was successful.
   * Error 500 = Indicates something unexpected happened at the server side
   */
  public delete(): void {

    this.log.trace(`${LOG_PREFIX} Entering delete()`);

    // Check if the target Logical Element Type record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Logical Element Type record was successfully initialised()`);
    if (this.logicalElementType) {

      // The target Logical Element Type record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Logical Element Type record was successfully initialised()`);

      // Delete the record
      this.log.trace(`${LOG_PREFIX} Deleting the Logical Element Type Record`);
      this.logicalElementsTypesDataService
        .deleteLogicalElementType(this.id)
        .subscribe({
          next: () => {

            // The Logical Element Type Record was deleted successfully
            this.log.trace(`${LOG_PREFIX} Logical Element Type Record was deleted successfuly`);

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The Logical Element Type Record was not deleted successfully
            this.log.trace(`${LOG_PREFIX} Logical Element Type Record was not deleted successfuly`);

            // Emit a 'failed' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
            this.failed.emit(500);
          }
        });

    } else {
      // The target Logical Element Type record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Logical Element Type record was not successfully initialised()`);

      // Emit an 'invalid' event
      this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
      this.failed.emit(500);

    }



  }


}
