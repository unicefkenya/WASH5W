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
import { AdministrativeHierarchy } from '@modules/administrative-hierarchies/models/administrative-hierarchy.model';
import { AdministrativeHierarchiesDataService } from '@modules/administrative-hierarchies/services/administrative-hierarchies-data.service';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Administrative Hierarchies Records Deletion Component]";

@Component({
  selector: 'sb-administrative-hierarchies-records-deletion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './administrative-hierarchies-records-deletion.component.html',
  styleUrls: ['administrative-hierarchies-records-deletion.component.scss'],
})
export class AdministrativeHierarchiesRecordsDeletionComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Administrative Hierarchy record
  @Input() public id!: number;

  // Broadcasts successful Administrative Hierarchies updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Administrative Hierarchies updation events together with their error codes
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the Administrative Hierarchy record with the passed in id
  public administrativeHierarchy: AdministrativeHierarchy | null | undefined;

  // Holds the custom icon classes
  public iconClasses: string[] = ["text-danger"];

  constructor(private administrativeHierarchiesDataService: AdministrativeHierarchiesDataService, private log: NGXLogger) { }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Administrative Hierarchy field based on the passed in id
    this.initialiseAdministrativeHierarchy(() => {

      // Mark Init as complete
      this.log.trace(`${LOG_PREFIX} Init completed`);

    });

  }


  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }

  /**
   * Retrieves the Administrative Hierarchy with the injected id and sets it as the Administrative Hierarchy that needs to be updated
   * @param callback The function to call when done
   */
  private initialiseAdministrativeHierarchy(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseAdministrativeHierarchy()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveAdministrativeHierarchyRecord(this.id, (administrativeHierarchy: AdministrativeHierarchy | null) => {

      // Set the target Administrative Hierarchy
      this.log.trace(`${LOG_PREFIX} Setting the target Administrative Hierarchy`);
      this.administrativeHierarchy = administrativeHierarchy;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }


  /**
   * Retrieves an Administrative Hierarchy record given its unique identifier synchronously
   * @param id The unique identifier of the Administrative Hierarchy
   * @param callback The function to call when done
   */
  private retrieveAdministrativeHierarchyRecord(id: number, callback: (administrativeHierarchy: AdministrativeHierarchy | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveAdministrativeHierarchyRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the Administrative System Id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the Administrative System Id has been specified`);
    if (id) {

      // The Administrative System Id has been specified
      this.log.trace(`${LOG_PREFIX} The Administrative System Id has been specified`);
      this.log.debug(`${LOG_PREFIX} Administrative Hierarchy Id = ${JSON.stringify(id)}`);

      // Try retrieving an Administrative Hierarchy Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve an Administrative Hierarchy Record with the passed in id`);
      const administrativeHierarchy: AdministrativeHierarchy | undefined = id ? this.administrativeHierarchiesDataService.records.find(d => d.id == id) : undefined;

      // Check if the Administrative Hierarchy Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the Administrative Hierarchy Record was successfully retrieved`);
      if (administrativeHierarchy) {

        // The Administrative Hierarchy Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Administrative Hierarchy Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} Administrative Hierarchy Record = ${JSON.stringify(this.administrativeHierarchy)}`);

        // Return the Administrative Hierarchy
        this.log.warn(`${LOG_PREFIX} Returning the Administrative Hierarchy`);
        callback(administrativeHierarchy);

      } else {

        // The Administrative Hierarchy Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Administrative Hierarchy Record was not successfully retrieved`);

        // Return null
        this.log.warn(`${LOG_PREFIX} Returning null`);
        callback(null);

      }


    } else {

      // The Administrative System Id has not been specified
      this.log.error(`${LOG_PREFIX} The Administrative System Id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }




  /**
   * Deletes Administrative Hierarchy Records.
   * Emits an succeeded or failed event indicating whether or not the saving exercise was successful.
   * Error 500 = Indicates something unexpected happened at the server side
   */
  public delete(): void {

    // Check if the target Administrative Hierarchy record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Administrative Hierarchy record was successfully initialised()`);
    if (this.administrativeHierarchy) {

      // The target Administrative Hierarchy record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Administrative Hierarchy record was successfully initialised()`);

      // Delete the record
      this.log.trace(`${LOG_PREFIX} Deleting the Administrative Hierarchy Record`);
      this.administrativeHierarchiesDataService
        .deleteAdministrativeHierarchy(this.id)
        .subscribe({
          next: () => {

            // The Administrative Hierarchy Record was deleted successfully
            this.log.trace(`${LOG_PREFIX} Administrative Hierarchy Record was deleted successfuly`);

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The Administrative Hierarchy Record was not deleted successfully
            this.log.trace(`${LOG_PREFIX} Administrative Hierarchy Record was not deleted successfuly`);

            // Emit a 'failed' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
            this.failed.emit(500);
          }
        });

    } else {
      // The target Administrative Hierarchy record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Administrative Hierarchy record was not successfully initialised()`);

      // Emit an 'invalid' event
      this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
      this.failed.emit(500);

    }



  }


}
