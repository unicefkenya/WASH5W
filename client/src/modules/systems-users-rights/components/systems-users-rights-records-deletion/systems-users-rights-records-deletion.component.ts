import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { SystemUserRight } from '@modules/systems-users-rights/models/system-user-right.model';
import { SystemsUsersRightsDataService } from '@modules/systems-users-rights/services/systems-users-rights-data.service';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Systems Users Rights Records Deletion Component]";

@Component({
  selector: 'sb-systems-users-rights-records-deletion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './systems-users-rights-records-deletion.component.html',
  styleUrls: ['systems-users-rights-records-deletion.component.scss'],
})
export class SystemsUsersRightsRecordsDeletionComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target System User Right record
  @Input() public id!: number;

  // Broadcasts successful Systems Users Rights updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Systems Users Rights updation events together with their error plurals
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the target System User Right
  public systemUserRight: SystemUserRight | null | undefined = null;

  // Holds the custom icon classes
  public iconClasses: string[] = ["text-danger"];

  constructor(
    private systemsUsersRightsDataService: SystemsUsersRightsDataService,
    private log: NGXLogger) {

  }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the System User Right field based on the passed in id
    this.initialiseSystemUserRight(() => {

      // Mark Init as complete
      this.log.trace(`${LOG_PREFIX} Init completed`);

    });

  }



  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }

  /**
   * Retrieves the System User Right with the injected id and sets it as the System User Right that needs to be deleted
   * @param callback The function to call when done
   */
  private initialiseSystemUserRight(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseTargetSystemUserRightRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveSystemUserRightRecord(this.id, (systemUserRight: SystemUserRight | null) => {

      // Set the target System User Right
      this.log.trace(`${LOG_PREFIX} Setting the target System User Right`);
      this.systemUserRight = systemUserRight;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }

  /**
   * Retrieves an System User Right record given its unique identifier
   * @param id The unique identifier of the System User Right
   * @param callback The function to call when done
   */
  private retrieveSystemUserRightRecord(id: number, callback: (systemUserRight: SystemUserRight | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveSystemUserRightRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the systemUserRight id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the systemUserRight id has been specified`);
    if (id) {

      // The System User Right id has been specified
      this.log.trace(`${LOG_PREFIX} The System User Right id has been specified`);
      this.log.debug(`${LOG_PREFIX} System User Right Id = ${JSON.stringify(id)}`);

      // Try retrieving an System User Right Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve an System User Right Record with the passed in id`);
      const systemUserRight: SystemUserRight | undefined = id ? this.systemsUsersRightsDataService.records.find(d => d.id == id) : undefined;

      // Check if the System User Right Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the System User Right Record was successfully retrieved`);
      if (systemUserRight) {

        // The System User Right Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The System User Right Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} System User Right Record = ${JSON.stringify(this.systemUserRight)}`);

        // Return the System User Right
        this.log.trace(`${LOG_PREFIX} Returning the System User Right`);
        callback(systemUserRight);

      } else {

        // The System User Right Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The System User Right Record was not successfully retrieved`);

        // Return null
        this.log.warn(`${LOG_PREFIX} Returning null`);
        callback(null);

      }


    } else {

      // The System User Right id has not been specified
      this.log.error(`${LOG_PREFIX} The System User Right id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }



  /**
   * Deletes System User Right Records.
   * Emits an succeeded or failed event indicating whether or not the saving exercise was successful.
   * Error 500 = Indicates something unexpected happened at the server side
   */
  public delete(): void {

    this.log.trace(`${LOG_PREFIX} Entering delete()`);

    // Check if the target System User Right record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target System User Right record was successfully initialised()`);
    if (this.systemUserRight) {

      // The target System User Right record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target System User Right record was successfully initialised()`);

      // Delete the record
      this.log.trace(`${LOG_PREFIX} Deleting the System User Right Record`);
      this.systemsUsersRightsDataService
        .deleteSystemUserRight(this.id)
        .subscribe({
          next: () => {

            // The System User Right Record was deleted successfully
            this.log.trace(`${LOG_PREFIX} System User Right Record was deleted successfuly`);

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The System User Right Record was not deleted successfully
            this.log.trace(`${LOG_PREFIX} System User Right Record was not deleted successfuly`);

            // Emit a 'failed' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
            this.failed.emit(500);
          }
        });

    } else {
      // The target System User Right record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target System User Right record was not successfully initialised()`);

      // Emit an 'invalid' event
      this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
      this.failed.emit(500);

    }



  }


}
