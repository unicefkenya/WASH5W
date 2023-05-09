import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { SystemRole } from '@modules/systems-roles/models/system-role.model';
import { SystemsRolesDataService } from '@modules/systems-roles/services/systems-roles-data.service';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Systems Roles Records Deletion Component]";

@Component({
  selector: 'sb-systemsRoles-records-deletion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './systems-roles-records-deletion.component.html',
  styleUrls: ['systems-roles-records-deletion.component.scss'],
})
export class SystemsRolesRecordsDeletionComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target System Role record
  @Input() public id!: number;

  // Broadcasts successful Systems Roles updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Systems Roles updation events together with their error plurals
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the target System Role
  public systemRole: SystemRole | null | undefined = null;

  // Holds the custom icon classes
  public iconClasses: string[] = ["text-danger"];

  constructor(
    private systemsRolesDataService: SystemsRolesDataService,
    private log: NGXLogger) {

  }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the System Role field based on the passed in id
    this.initialiseSystemRole(() => {

      // Mark Init as complete
      this.log.trace(`${LOG_PREFIX} Init completed`);

    });

  }



  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }

  /**
   * Retrieves the System Role with the injected id and sets it as the System Role that needs to be deleted
   * @param callback The function to call when done
   */
  private initialiseSystemRole(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseTargetSystemRoleRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveSystemRoleRecord(this.id, (systemRole: SystemRole | null) => {

      // Set the target System Role
      this.log.trace(`${LOG_PREFIX} Setting the target System Role`);
      this.systemRole = systemRole;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }

  /**
   * Retrieves an System Role record given its unique identifier
   * @param id The unique identifier of the System Role
   * @param callback The function to call when done
   */
  private retrieveSystemRoleRecord(id: number, callback: (systemRole: SystemRole | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveSystemRoleRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the systemRole id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the systemRole id has been specified`);
    if (id) {

      // The System Role id has been specified
      this.log.trace(`${LOG_PREFIX} The System Role id has been specified`);
      this.log.debug(`${LOG_PREFIX} System Role Id = ${JSON.stringify(id)}`);

      // Try retrieving an System Role Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve an System Role Record with the passed in id`);
      const systemRole: SystemRole | undefined = id ? this.systemsRolesDataService.records.find(d => d.id == id) : undefined;

      // Check if the System Role Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the System Role Record was successfully retrieved`);
      if (systemRole) {

        // The System Role Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The System Role Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} System Role Record = ${JSON.stringify(this.systemRole)}`);

        // Return the System Role
        this.log.trace(`${LOG_PREFIX} Returning the System Role`);
        callback(systemRole);

      } else {

        // The System Role Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The System Role Record was not successfully retrieved`);

        // Return null
        this.log.warn(`${LOG_PREFIX} Returning null`);
        callback(null);

      }


    } else {

      // The System Role id has not been specified
      this.log.error(`${LOG_PREFIX} The System Role id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }



  /**
   * Deletes System Role Records.
   * Emits an succeeded or failed event indicating whether or not the saving exercise was successful.
   * Error 500 = Indicates something unexpected happened at the server side
   */
  public delete(): void {

    this.log.trace(`${LOG_PREFIX} Entering delete()`);

    // Check if the target System Role record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target System Role record was successfully initialised()`);
    if (this.systemRole) {

      // The target System Role record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target System Role record was successfully initialised()`);

      // Delete the record
      this.log.trace(`${LOG_PREFIX} Deleting the System Role Record`);
      this.systemsRolesDataService
        .deleteSystemRole(this.id)
        .subscribe({
          next: () => {

            // The System Role Record was deleted successfully
            this.log.trace(`${LOG_PREFIX} System Role Record was deleted successfuly`);

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The System Role Record was not deleted successfully
            this.log.trace(`${LOG_PREFIX} System Role Record was not deleted successfuly`);

            // Emit a 'failed' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
            this.failed.emit(500);
          }
        });

    } else {
      // The target System Role record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target System Role record was not successfully initialised()`);

      // Emit an 'invalid' event
      this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
      this.failed.emit(500);

    }



  }


}
