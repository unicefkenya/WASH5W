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
import { LogicalElement } from '@modules/logical-elements/models/logical-element.model';
import { LogicalElementsDataService } from '@modules/logical-elements/services/logical-elements-data.service';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Logical Elements Records Deletion Component]";

@Component({
  selector: 'sb-logical-elements-records-deletion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './logical-elements-records-deletion.component.html',
  styleUrls: ['logical-elements-records-deletion.component.scss'],
})
export class LogicalElementsRecordsDeletionComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Logical Element record
  @Input() public id!: number;

  // Broadcasts successful Logical Elements updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Logical Elements updation events together with their error codes
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the Logical Element record with the passed in id
  public logicalElement: LogicalElement | null | undefined;

  // Holds the custom icon classes
  public iconClasses: string[] = ["text-danger"];

  constructor(private logicalElementsDataService: LogicalElementsDataService, private log: NGXLogger) { }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Logical Element field based on the passed in id
    this.initialiseLogicalElement(() => {

      // Mark Init as complete
      this.log.trace(`${LOG_PREFIX} Init completed`);

    });

  }


  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }

  /**
   * Retrieves the Logical Element with the injected id and sets it as the Logical Element that needs to be updated
   * @param callback The function to call when done
   */
  private initialiseLogicalElement(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseLogicalElement()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveLogicalElementRecord(this.id, (logicalElement: LogicalElement | null) => {

      // Set the target Logical Element
      this.log.trace(`${LOG_PREFIX} Setting the target Logical Element`);
      this.logicalElement = logicalElement;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }


  /**
   * Retrieves a Logical Element record given its unique identifier synchronously
   * @param id The unique identifier of the Logical Element
   * @param callback The function to call when done
   */
  private retrieveLogicalElementRecord(id: number, callback: (logicalElement: LogicalElement | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveLogicalElementRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the Logical Element Type Id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the Logical Element Type Id has been specified`);
    if (id) {

      // The Logical Element Type Id has been specified
      this.log.trace(`${LOG_PREFIX} The Logical Element Type Id has been specified`);
      this.log.debug(`${LOG_PREFIX} Logical Element Id = ${JSON.stringify(id)}`);

      // Try retrieving a Logical Element Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve a Logical Element Record with the passed in id`);
      const logicalElement: LogicalElement | undefined = id ? this.logicalElementsDataService.records.find(d => d.id == id) : undefined;

      // Check if the Logical Element Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the Logical Element Record was successfully retrieved`);
      if (logicalElement) {

        // The Logical Element Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Logical Element Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} Logical Element Record = ${JSON.stringify(this.logicalElement)}`);

        // Return the Logical Element
        this.log.warn(`${LOG_PREFIX} Returning the Logical Element`);
        callback(logicalElement);

      } else {

        // The Logical Element Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Logical Element Record was not successfully retrieved`);

        // Return null
        this.log.warn(`${LOG_PREFIX} Returning null`);
        callback(null);

      }


    } else {

      // The Logical Element Type Id has not been specified
      this.log.error(`${LOG_PREFIX} The Logical Element Type Id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }




  /**
   * Deletes Logical Element Records.
   * Emits an succeeded or failed event indicating whether or not the saving exercise was successful.
   * Error 500 = Indicates something unexpected happened at the server side
   */
  public delete(): void {

    // Check if the target Logical Element record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Logical Element record was successfully initialised()`);
    if (this.logicalElement) {

      // The target Logical Element record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Logical Element record was successfully initialised()`);

      // Delete the record
      this.log.trace(`${LOG_PREFIX} Deleting the Logical Element Record`);
      this.logicalElementsDataService
        .deleteLogicalElement(this.id)
        .subscribe({
          next: () => {

            // The Logical Element Record was deleted successfully
            this.log.trace(`${LOG_PREFIX} Logical Element Record was deleted successfuly`);

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The Logical Element Record was not deleted successfully
            this.log.trace(`${LOG_PREFIX} Logical Element Record was not deleted successfuly`);

            // Emit a 'failed' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
            this.failed.emit(500);
          }
        });

    } else {
      // The target Logical Element record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Logical Element record was not successfully initialised()`);

      // Emit an 'invalid' event
      this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
      this.failed.emit(500);

    }



  }


}
