import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { Context } from '@modules/contexts/models/context.model';
import { ContextsDataService } from '@modules/contexts/services/contexts-data.service';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Contexts Records Deletion Component]";

@Component({
  selector: 'sb-contexts-records-deletion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contexts-records-deletion.component.html',
  styleUrls: ['contexts-records-deletion.component.scss'],
})
export class ContextsRecordsDeletionComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Context record
  @Input() public id!: number;

  // Broadcasts successful Contexts updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Contexts updation events together with their error abbreviations
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the target Context
  public context: Context | null | undefined = null;

  // Holds the custom icon classes
  public iconClasses: string[] = ["text-danger"];

  constructor(
    private contextsDataService: ContextsDataService,
    private log: NGXLogger) {

  }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Context field based on the passed in id
    this.initialiseContext(() => {

      // Mark Init as complete
      this.log.trace(`${LOG_PREFIX} Init completed`);

    });

  }



  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }

  /**
   * Retrieves the Context with the injected id and sets it as the Context that needs to be deleted
   * @param callback The function to call when done
   */
  private initialiseContext(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseTargetContextRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveContextRecord(this.id, (context: Context | null) => {

      // Set the target Context
      this.log.trace(`${LOG_PREFIX} Setting the target Context`);
      this.context = context;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }

  /**
   * Retrieves a Context record given its unique identifier
   * @param id The unique identifier of the Context
   * @param callback The function to call when done
   */
  private retrieveContextRecord(id: number, callback: (context: Context | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveContextRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the context id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the context id has been specified`);
    if (id) {

      // The context id has been specified
      this.log.trace(`${LOG_PREFIX} The context id has been specified`);
      this.log.debug(`${LOG_PREFIX} Context Id = ${JSON.stringify(id)}`);

      // Try retrieving a Context Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve a Context Record with the passed in id`);
      const context: Context | undefined = id ? this.contextsDataService.records.find(d => d.id == id) : undefined;

      // Check if the Context Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the Context Record was successfully retrieved`);
      if (context) {

        // The Context Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Context Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} Context Record = ${JSON.stringify(this.context)}`);

        // Return the Context
        this.log.trace(`${LOG_PREFIX} Returning the Context`);
        callback(context);

      } else {

        // The Context Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Context Record was not successfully retrieved`);

        // Return null
        this.log.warn(`${LOG_PREFIX} Returning null`);
        callback(null);

      }


    } else {

      // The context id has not been specified
      this.log.error(`${LOG_PREFIX} The context id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }



  /**
   * Deletes Context Records.
   * Emits an succeeded or failed event indicating whether or not the saving exercise was successful.
   * Error 500 = Indicates something unexpected happened at the server side
   */
  public delete(): void {

    this.log.trace(`${LOG_PREFIX} Entering delete()`);

    // Check if the target Context record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Context record was successfully initialised()`);
    if (this.context) {

      // The target Context record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Context record was successfully initialised()`);

      // Delete the record
      this.log.trace(`${LOG_PREFIX} Deleting the Context Record`);
      this.contextsDataService
        .deleteContext(this.id)
        .subscribe({
          next: () => {

            // The Context Record was deleted successfully
            this.log.trace(`${LOG_PREFIX} Context Record was deleted successfuly`);

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The Context Record was not deleted successfully
            this.log.trace(`${LOG_PREFIX} Context Record was not deleted successfuly`);

            // Emit a 'failed' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
            this.failed.emit(500);
          }
        });

    } else {
      // The target Context record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Context record was not successfully initialised()`);

      // Emit an 'invalid' event
      this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
      this.failed.emit(500);

    }



  }


}
