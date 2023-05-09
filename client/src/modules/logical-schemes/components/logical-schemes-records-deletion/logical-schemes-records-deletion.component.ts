import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { LogicalScheme } from '@modules/logical-schemes/models/logical-scheme.model';
import { LogicalSchemesDataService } from '@modules/logical-schemes/services/logical-schemes-data.service';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Logical Schemes Records Deletion Component]";

@Component({
  selector: 'sb-logical-schemes-records-deletion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './logical-schemes-records-deletion.component.html',
  styleUrls: ['logical-schemes-records-deletion.component.scss'],
})
export class LogicalSchemesRecordsDeletionComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Logical Scheme record
  @Input() public id!: number;

  // Broadcasts successful Logical Schemes updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Logical Schemes updation events together with their error plurals
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the target Logical Scheme
  public logicalScheme: LogicalScheme | null | undefined = null;

  // Holds the custom icon classes
  public iconClasses: string[] = ["text-danger"];

  constructor(
    private logicalSchemesDataService: LogicalSchemesDataService,
    private log: NGXLogger) {

  }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Logical Scheme field based on the passed in id
    this.initialiseLogicalScheme(() => {

      // Mark Init as complete
      this.log.trace(`${LOG_PREFIX} Init completed`);

    });

  }



  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }

  /**
   * Retrieves the Logical Scheme with the injected id and sets it as the Logical Scheme that needs to be deleted
   * @param callback The function to call when done
   */
  private initialiseLogicalScheme(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseTargetLogicalSchemeRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveLogicalSchemeRecord(this.id, (logicalScheme: LogicalScheme | null) => {

      // Set the target Logical Scheme
      this.log.trace(`${LOG_PREFIX} Setting the target Logical Scheme`);
      this.logicalScheme = logicalScheme;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }

  /**
   * Retrieves a Logical Scheme record given its unique identifier
   * @param id The unique identifier of the Logical Scheme
   * @param callback The function to call when done
   */
  private retrieveLogicalSchemeRecord(id: number, callback: (logicalScheme: LogicalScheme | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveLogicalSchemeRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the logicalScheme id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the logicalScheme id has been specified`);
    if (id) {

      // The Logical Scheme id has been specified
      this.log.trace(`${LOG_PREFIX} The Logical Scheme id has been specified`);
      this.log.debug(`${LOG_PREFIX} Logical Scheme Id = ${JSON.stringify(id)}`);

      // Try retrieving a Logical Scheme Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve a Logical Scheme Record with the passed in id`);
      const logicalScheme: LogicalScheme | undefined = id ? this.logicalSchemesDataService.records.find(d => d.id == id) : undefined;

      // Check if the Logical Scheme Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the Logical Scheme Record was successfully retrieved`);
      if (logicalScheme) {

        // The Logical Scheme Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Logical Scheme Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} Logical Scheme Record = ${JSON.stringify(this.logicalScheme)}`);

        // Return the Logical Scheme
        this.log.trace(`${LOG_PREFIX} Returning the Logical Scheme`);
        callback(logicalScheme);

      } else {

        // The Logical Scheme Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Logical Scheme Record was not successfully retrieved`);

        // Return null
        this.log.warn(`${LOG_PREFIX} Returning null`);
        callback(null);

      }


    } else {

      // The Logical Scheme id has not been specified
      this.log.error(`${LOG_PREFIX} The Logical Scheme id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }



  /**
   * Deletes Logical Scheme Records.
   * Emits an succeeded or failed event indicating whether or not the saving exercise was successful.
   * Error 500 = Indicates something unexpected happened at the server side
   */
  public delete(): void {

    this.log.trace(`${LOG_PREFIX} Entering delete()`);

    // Check if the target Logical Scheme record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Logical Scheme record was successfully initialised()`);
    if (this.logicalScheme) {

      // The target Logical Scheme record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Logical Scheme record was successfully initialised()`);

      // Delete the record
      this.log.trace(`${LOG_PREFIX} Deleting the Logical Scheme Record`);
      this.logicalSchemesDataService
        .deleteLogicalScheme(this.id)
        .subscribe({
          next: () => {

            // The Logical Scheme Record was deleted successfully
            this.log.trace(`${LOG_PREFIX} Logical Scheme Record was deleted successfuly`);

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The Logical Scheme Record was not deleted successfully
            this.log.trace(`${LOG_PREFIX} Logical Scheme Record was not deleted successfuly`);

            // Emit a 'failed' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
            this.failed.emit(500);
          }
        });

    } else {
      // The target Logical Scheme record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Logical Scheme record was not successfully initialised()`);

      // Emit an 'invalid' event
      this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
      this.failed.emit(500);

    }



  }


}
