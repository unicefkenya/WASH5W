import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { SystemUser } from '@modules/systems-users/models/system-user.model';
import { SystemsUsersDataService } from '@modules/systems-users/services/systems-users-data.service';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Systems Users Records Deletion Component]";

@Component({
  selector: 'sb-systemsUsers-records-deletion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './systems-users-records-deletion.component.html',
  styleUrls: ['systems-users-records-deletion.component.scss'],
})
export class SystemsUsersRecordsDeletionComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target System User record
  @Input() public id!: number;

  // Broadcasts successful Systems Users updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Systems Users updation events together with their error plurals
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the target System User
  public systemUser: SystemUser | null | undefined = null;

  // Holds the custom icon classes
  public iconClasses: string[] = ["text-danger"];

  constructor(
    private systemsUsersDataService: SystemsUsersDataService,
    private log: NGXLogger) {

  }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the System User field based on the passed in id
    this.initialiseSystemUser(() => {

      // Mark Init as complete
      this.log.trace(`${LOG_PREFIX} Init completed`);

    });

  }



  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }

  /**
   * Retrieves the System User with the injected id and sets it as the System User that needs to be deleted
   * @param callback The function to call when done
   */
  private initialiseSystemUser(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseTargetSystemUserRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveSystemUserRecord(this.id, (systemUser: SystemUser | null) => {

      // Set the target System User
      this.log.trace(`${LOG_PREFIX} Setting the target System User`);
      this.systemUser = systemUser;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }

  /**
   * Retrieves an System User record given its unique identifier
   * @param id The unique identifier of the System User
   * @param callback The function to call when done
   */
  private retrieveSystemUserRecord(id: number, callback: (systemUser: SystemUser | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveSystemUserRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the systemUser id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the systemUser id has been specified`);
    if (id) {

      // The System User id has been specified
      this.log.trace(`${LOG_PREFIX} The System User id has been specified`);
      this.log.debug(`${LOG_PREFIX} System User Id = ${JSON.stringify(id)}`);

      // Try retrieving an System User Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve an System User Record with the passed in id`);
      const systemUser: SystemUser | undefined = id ? this.systemsUsersDataService.records.find(d => d.id == id) : undefined;

      // Check if the System User Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the System User Record was successfully retrieved`);
      if (systemUser) {

        // The System User Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The System User Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} System User Record = ${JSON.stringify(this.systemUser)}`);

        // Return the System User
        this.log.trace(`${LOG_PREFIX} Returning the System User`);
        callback(systemUser);

      } else {

        // The System User Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The System User Record was not successfully retrieved`);

        // Return null
        this.log.warn(`${LOG_PREFIX} Returning null`);
        callback(null);

      }


    } else {

      // The System User id has not been specified
      this.log.error(`${LOG_PREFIX} The System User id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }



  /**
   * Deletes System User Records.
   * Emits an succeeded or failed event indicating whether or not the saving exercise was successful.
   * Error 500 = Indicates something unexpected happened at the server side
   */
  public delete(): void {

    this.log.trace(`${LOG_PREFIX} Entering delete()`);

    // Check if the target System User record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target System User record was successfully initialised()`);
    if (this.systemUser) {

      // The target System User record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target System User record was successfully initialised()`);

      // Delete the record
      this.log.trace(`${LOG_PREFIX} Deleting the System User Record`);
      this.systemsUsersDataService
        .deleteSystemUser(this.id)
        .subscribe({
          next: () => {

            // The System User Record was deleted successfully
            this.log.trace(`${LOG_PREFIX} System User Record was deleted successfuly`);

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The System User Record was not deleted successfully
            this.log.trace(`${LOG_PREFIX} System User Record was not deleted successfuly`);

            // Emit a 'failed' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
            this.failed.emit(500);
          }
        });

    } else {
      // The target System User record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target System User record was not successfully initialised()`);

      // Emit an 'invalid' event
      this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
      this.failed.emit(500);

    }



  }


}
