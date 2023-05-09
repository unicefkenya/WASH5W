import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { AdministrativeSystem } from '@modules/administrative-systems/models/administrative-system.model';
import { AdministrativeSystemsDataService } from '@modules/administrative-systems/services/administrative-systems-data.service';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Administrative Systems Records Deletion Component]";

@Component({
  selector: 'sb-administrative-systems-records-deletion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './administrative-systems-records-deletion.component.html',
  styleUrls: ['administrative-systems-records-deletion.component.scss'],
})
export class AdministrativeSystemsRecordsDeletionComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Administrative System record
  @Input() public id!: number;

  // Broadcasts successful Administrative Systems updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Administrative Systems updation events together with their error plurals
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the target Administrative System
  public administrativeSystem: AdministrativeSystem | null | undefined = null;

  // Holds the custom icon classes
  public iconClasses: string[] = ["text-danger"];

  constructor(
    private administrativeSystemsDataService: AdministrativeSystemsDataService,
    private log: NGXLogger) {

  }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Administrative System field based on the passed in id
    this.initialiseAdministrativeSystem(() => {

      // Mark Init as complete
      this.log.trace(`${LOG_PREFIX} Init completed`);

    });

  }



  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }

  /**
   * Retrieves the Administrative System with the injected id and sets it as the Administrative System that needs to be deleted
   * @param callback The function to call when done
   */
  private initialiseAdministrativeSystem(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseTargetAdministrativeSystemRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveAdministrativeSystemRecord(this.id, (administrativeSystem: AdministrativeSystem | null) => {

      // Set the target Administrative System
      this.log.trace(`${LOG_PREFIX} Setting the target Administrative System`);
      this.administrativeSystem = administrativeSystem;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }

  /**
   * Retrieves an Administrative System record given its unique identifier
   * @param id The unique identifier of the Administrative System
   * @param callback The function to call when done
   */
  private retrieveAdministrativeSystemRecord(id: number, callback: (administrativeSystem: AdministrativeSystem | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveAdministrativeSystemRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the administrativeSystem id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the administrativeSystem id has been specified`);
    if (id) {

      // The Administrative System id has been specified
      this.log.trace(`${LOG_PREFIX} The Administrative System id has been specified`);
      this.log.debug(`${LOG_PREFIX} Administrative System Id = ${JSON.stringify(id)}`);

      // Try retrieving an Administrative System Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve an Administrative System Record with the passed in id`);
      const administrativeSystem: AdministrativeSystem | undefined = id ? this.administrativeSystemsDataService.records.find(d => d.id == id) : undefined;

      // Check if the Administrative System Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the Administrative System Record was successfully retrieved`);
      if (administrativeSystem) {

        // The Administrative System Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Administrative System Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} Administrative System Record = ${JSON.stringify(this.administrativeSystem)}`);

        // Return the Administrative System
        this.log.trace(`${LOG_PREFIX} Returning the Administrative System`);
        callback(administrativeSystem);

      } else {

        // The Administrative System Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Administrative System Record was not successfully retrieved`);

        // Return null
        this.log.warn(`${LOG_PREFIX} Returning null`);
        callback(null);

      }


    } else {

      // The Administrative System id has not been specified
      this.log.error(`${LOG_PREFIX} The Administrative System id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }



  /**
   * Deletes Administrative System Records.
   * Emits an succeeded or failed event indicating whether or not the saving exercise was successful.
   * Error 500 = Indicates something unexpected happened at the server side
   */
  public delete(): void {

    this.log.trace(`${LOG_PREFIX} Entering delete()`);

    // Check if the target Administrative System record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Administrative System record was successfully initialised()`);
    if (this.administrativeSystem) {

      // The target Administrative System record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Administrative System record was successfully initialised()`);

      // Delete the record
      this.log.trace(`${LOG_PREFIX} Deleting the Administrative System Record`);
      this.administrativeSystemsDataService
        .deleteAdministrativeSystem(this.id)
        .subscribe({
          next: () => {

            // The Administrative System Record was deleted successfully
            this.log.trace(`${LOG_PREFIX} Administrative System Record was deleted successfuly`);

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The Administrative System Record was not deleted successfully
            this.log.trace(`${LOG_PREFIX} Administrative System Record was not deleted successfuly`);

            // Emit a 'failed' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
            this.failed.emit(500);
          }
        });

    } else {
      // The target Administrative System record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Administrative System record was not successfully initialised()`);

      // Emit an 'invalid' event
      this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
      this.failed.emit(500);

    }



  }


}
