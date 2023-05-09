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
import { AdministrativeStructure } from '@modules/administrative-structures/models/administrative-structure.model';
import { AdministrativeStructuresDataService } from '@modules/administrative-structures/services/administrative-structures-data.service';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Administrative Structures Records Deletion Component]";

@Component({
  selector: 'sb-administrative-structures-records-deletion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './administrative-structures-records-deletion.component.html',
  styleUrls: ['administrative-structures-records-deletion.component.scss'],
})
export class AdministrativeStructuresRecordsDeletionComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Administrative Structure record
  @Input() public id!: number;

  // Broadcasts successful Administrative Structures updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Administrative Structures updation events together with their error codes
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the Administrative Structure record with the passed in id
  public administrativeStructure: AdministrativeStructure | null | undefined;

  // Holds the custom icon classes
  public iconClasses: string[] = ["text-danger"];

  constructor(private administrativeStructuresDataService: AdministrativeStructuresDataService, private log: NGXLogger) { }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Administrative Structure field based on the passed in id
    this.initialiseAdministrativeStructure(() => {

      // Mark Init as complete
      this.log.trace(`${LOG_PREFIX} Init completed`);

    });

  }


  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }

  /**
   * Retrieves the Administrative Structure with the injected id and sets it as the Administrative Structure that needs to be updated
   * @param callback The function to call when done
   */
  private initialiseAdministrativeStructure(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseAdministrativeStructure()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveAdministrativeStructureRecord(this.id, (administrativeStructure: AdministrativeStructure | null) => {

      // Set the target Administrative Structure
      this.log.trace(`${LOG_PREFIX} Setting the target Administrative Structure`);
      this.administrativeStructure = administrativeStructure;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }


  /**
   * Retrieves an Administrative Structure record given its unique identifier synchronously
   * @param id The unique identifier of the Administrative Structure
   * @param callback The function to call when done
   */
  private retrieveAdministrativeStructureRecord(id: number, callback: (administrativeStructure: AdministrativeStructure | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveAdministrativeStructureRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the Administrative System Id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the Administrative System Id has been specified`);
    if (id) {

      // The Administrative System Id has been specified
      this.log.trace(`${LOG_PREFIX} The Administrative System Id has been specified`);
      this.log.debug(`${LOG_PREFIX} Administrative Structure Id = ${JSON.stringify(id)}`);

      // Try retrieving an Administrative Structure Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve an Administrative Structure Record with the passed in id`);
      const administrativeStructure: AdministrativeStructure | undefined = id ? this.administrativeStructuresDataService.records.find(d => d.id == id) : undefined;

      // Check if the Administrative Structure Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the Administrative Structure Record was successfully retrieved`);
      if (administrativeStructure) {

        // The Administrative Structure Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Administrative Structure Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} Administrative Structure Record = ${JSON.stringify(this.administrativeStructure)}`);

        // Return the Administrative Structure
        this.log.warn(`${LOG_PREFIX} Returning the Administrative Structure`);
        callback(administrativeStructure);

      } else {

        // The Administrative Structure Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Administrative Structure Record was not successfully retrieved`);

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
   * Deletes Administrative Structure Records.
   * Emits an succeeded or failed event indicating whether or not the saving exercise was successful.
   * Error 500 = Indicates something unexpected happened at the server side
   */
  public delete(): void {

    // Check if the target Administrative Structure record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Administrative Structure record was successfully initialised()`);
    if (this.administrativeStructure) {

      // The target Administrative Structure record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Administrative Structure record was successfully initialised()`);

      // Delete the record
      this.log.trace(`${LOG_PREFIX} Deleting the Administrative Structure Record`);
      this.administrativeStructuresDataService
        .deleteAdministrativeStructure(this.id)
        .subscribe({
          next: () => {

            // The Administrative Structure Record was deleted successfully
            this.log.trace(`${LOG_PREFIX} Administrative Structure Record was deleted successfuly`);

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The Administrative Structure Record was not deleted successfully
            this.log.trace(`${LOG_PREFIX} Administrative Structure Record was not deleted successfuly`);

            // Emit a 'failed' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
            this.failed.emit(500);
          }
        });

    } else {
      // The target Administrative Structure record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Administrative Structure record was not successfully initialised()`);

      // Emit an 'invalid' event
      this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
      this.failed.emit(500);

    }



  }


}
