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
import { LogicalHierarchy } from '@modules/logical-hierarchies/models/logical-hierarchy.model';
import { LogicalHierarchiesDataService } from '@modules/logical-hierarchies/services/logical-hierarchies-data.service';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Logical Hierarchies Records Deletion Component]";

@Component({
  selector: 'sb-logical-hierarchies-records-deletion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './logical-hierarchies-records-deletion.component.html',
  styleUrls: ['logical-hierarchies-records-deletion.component.scss'],
})
export class LogicalHierarchiesRecordsDeletionComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Logical Hierarchy record
  @Input() public id!: number;

  // Broadcasts successful Logical Hierarchies updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Logical Hierarchies updation events together with their error codes
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the Logical Hierarchy record with the passed in id
  public logicalHierarchy: LogicalHierarchy | null | undefined;

  // Holds the custom icon classes
  public iconClasses: string[] = ["text-danger"];

  constructor(private logicalHierarchiesDataService: LogicalHierarchiesDataService, private log: NGXLogger) { }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Logical Hierarchy field based on the passed in id
    this.initialiseLogicalHierarchy(() => {

      // Mark Init as complete
      this.log.trace(`${LOG_PREFIX} Init completed`);

    });

  }


  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }

  /**
   * Retrieves the Logical Hierarchy with the injected id and sets it as the Logical Hierarchy that needs to be updated
   * @param callback The function to call when done
   */
  private initialiseLogicalHierarchy(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseLogicalHierarchy()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveLogicalHierarchyRecord(this.id, (logicalHierarchy: LogicalHierarchy | null) => {

      // Set the target Logical Hierarchy
      this.log.trace(`${LOG_PREFIX} Setting the target Logical Hierarchy`);
      this.logicalHierarchy = logicalHierarchy;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }


  /**
   * Retrieves a Logical Hierarchy record given its unique identifier synchronously
   * @param id The unique identifier of the Logical Hierarchy
   * @param callback The function to call when done
   */
  private retrieveLogicalHierarchyRecord(id: number, callback: (logicalHierarchy: LogicalHierarchy | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveLogicalHierarchyRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the Logical Scheme Id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the Logical Scheme Id has been specified`);
    if (id) {

      // The Logical Scheme Id has been specified
      this.log.trace(`${LOG_PREFIX} The Logical Scheme Id has been specified`);
      this.log.debug(`${LOG_PREFIX} Logical Hierarchy Id = ${JSON.stringify(id)}`);

      // Try retrieving a Logical Hierarchy Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve a Logical Hierarchy Record with the passed in id`);
      const logicalHierarchy: LogicalHierarchy | undefined = id ? this.logicalHierarchiesDataService.records.find(d => d.id == id) : undefined;

      // Check if the Logical Hierarchy Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the Logical Hierarchy Record was successfully retrieved`);
      if (logicalHierarchy) {

        // The Logical Hierarchy Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Logical Hierarchy Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} Logical Hierarchy Record = ${JSON.stringify(this.logicalHierarchy)}`);

        // Return the Logical Hierarchy
        this.log.warn(`${LOG_PREFIX} Returning the Logical Hierarchy`);
        callback(logicalHierarchy);

      } else {

        // The Logical Hierarchy Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Logical Hierarchy Record was not successfully retrieved`);

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
   * Deletes Logical Hierarchy Records.
   * Emits an succeeded or failed event indicating whether or not the saving exercise was successful.
   * Error 500 = Indicates something unexpected happened at the server side
   */
  public delete(): void {

    // Check if the target Logical Hierarchy record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Logical Hierarchy record was successfully initialised()`);
    if (this.logicalHierarchy) {

      // The target Logical Hierarchy record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Logical Hierarchy record was successfully initialised()`);

      // Delete the record
      this.log.trace(`${LOG_PREFIX} Deleting the Logical Hierarchy Record`);
      this.logicalHierarchiesDataService
        .deleteLogicalHierarchy(this.id)
        .subscribe({
          next: () => {

            // The Logical Hierarchy Record was deleted successfully
            this.log.trace(`${LOG_PREFIX} Logical Hierarchy Record was deleted successfuly`);

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The Logical Hierarchy Record was not deleted successfully
            this.log.trace(`${LOG_PREFIX} Logical Hierarchy Record was not deleted successfuly`);

            // Emit a 'failed' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
            this.failed.emit(500);
          }
        });

    } else {
      // The target Logical Hierarchy record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Logical Hierarchy record was not successfully initialised()`);

      // Emit an 'invalid' event
      this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
      this.failed.emit(500);

    }



  }


}
