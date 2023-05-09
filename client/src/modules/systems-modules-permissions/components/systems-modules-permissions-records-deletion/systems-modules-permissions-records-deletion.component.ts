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
import { SystemModulePermission } from '@modules/systems-modules-permissions/models/system-module-permission.model';
import { SystemsModulesPermissionsDataService } from '@modules/systems-modules-permissions/services/systems-modules-permissions-data.service';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Systems Modules Permissions Records Deletion Component]";

@Component({
  selector: 'sb-systems-modules-permissions-records-deletion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './systems-modules-permissions-records-deletion.component.html',
  styleUrls: ['systems-modules-permissions-records-deletion.component.scss'],
})
export class SystemsModulesPermissionsRecordsDeletionComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target System Module Permission record
  @Input() public id!: number;

  // Broadcasts successful Systems Modules Permissions updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Systems Modules Permissions updation events together with their error codes
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the System Module Permission record with the passed in id
  public systemModulePermission: SystemModulePermission | null | undefined;

  // Holds the custom icon classes
  public iconClasses: string[] = ["text-danger"];

  constructor(private systemsModulesPermissionsDataService: SystemsModulesPermissionsDataService, private log: NGXLogger) { }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the System Module Permission field based on the passed in id
    this.initialiseSystemModulePermission(() => {

      // Mark Init as complete
      this.log.trace(`${LOG_PREFIX} Init completed`);

    });

  }


  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }

  /**
   * Retrieves the System Module Permission with the injected id and sets it as the System Module Permission that needs to be updated
   * @param callback The function to call when done
   */
  private initialiseSystemModulePermission(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseSystemModulePermission()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveSystemModulePermissionRecord(this.id, (systemModulePermission: SystemModulePermission | null) => {

      // Set the target System Module Permission
      this.log.trace(`${LOG_PREFIX} Setting the target System Module Permission`);
      this.systemModulePermission = systemModulePermission;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }


  /**
   * Retrieves an System Module Permission record given its unique identifier synchronously
   * @param id The unique identifier of the System Module Permission
   * @param callback The function to call when done
   */
  private retrieveSystemModulePermissionRecord(id: number, callback: (systemModulePermission: SystemModulePermission | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveSystemModulePermissionRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the System Module Id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the System Module Id has been specified`);
    if (id) {

      // The System Module Id has been specified
      this.log.trace(`${LOG_PREFIX} The System Module Id has been specified`);
      this.log.debug(`${LOG_PREFIX} System Module Permission Id = ${JSON.stringify(id)}`);

      // Try retrieving an System Module Permission Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve an System Module Permission Record with the passed in id`);
      const systemModulePermission: SystemModulePermission | undefined = id ? this.systemsModulesPermissionsDataService.records.find(d => d.id == id) : undefined;

      // Check if the System Module Permission Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the System Module Permission Record was successfully retrieved`);
      if (systemModulePermission) {

        // The System Module Permission Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The System Module Permission Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} System Module Permission Record = ${JSON.stringify(this.systemModulePermission)}`);

        // Return the System Module Permission
        this.log.warn(`${LOG_PREFIX} Returning the System Module Permission`);
        callback(systemModulePermission);

      } else {

        // The System Module Permission Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The System Module Permission Record was not successfully retrieved`);

        // Return null
        this.log.warn(`${LOG_PREFIX} Returning null`);
        callback(null);

      }


    } else {

      // The System Module Id has not been specified
      this.log.error(`${LOG_PREFIX} The System Module Id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }




  /**
   * Deletes System Module Permission Records.
   * Emits an succeeded or failed event indicating whether or not the saving exercise was successful.
   * Error 500 = Indicates something unexpected happened at the server side
   */
  public delete(): void {

    // Check if the target System Module Permission record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target System Module Permission record was successfully initialised()`);
    if (this.systemModulePermission) {

      // The target System Module Permission record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target System Module Permission record was successfully initialised()`);

      // Delete the record
      this.log.trace(`${LOG_PREFIX} Deleting the System Module Permission Record`);
      this.systemsModulesPermissionsDataService
        .deleteSystemModulePermission(this.id)
        .subscribe({
          next: () => {

            // The System Module Permission Record was deleted successfully
            this.log.trace(`${LOG_PREFIX} System Module Permission Record was deleted successfuly`);

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The System Module Permission Record was not deleted successfully
            this.log.trace(`${LOG_PREFIX} System Module Permission Record was not deleted successfuly`);

            // Emit a 'failed' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
            this.failed.emit(500);
          }
        });

    } else {
      // The target System Module Permission record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target System Module Permission record was not successfully initialised()`);

      // Emit an 'invalid' event
      this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
      this.failed.emit(500);

    }



  }


}
