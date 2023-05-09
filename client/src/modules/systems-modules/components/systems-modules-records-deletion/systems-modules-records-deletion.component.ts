import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { SystemModule } from '@modules/systems-modules/models/system-module.model';
import { SystemsModulesDataService } from '@modules/systems-modules/services/systems-modules-data.service';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Systems Modules Records Deletion Component]";

@Component({
  selector: 'sb-systemsModules-records-deletion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './systems-modules-records-deletion.component.html',
  styleUrls: ['systems-modules-records-deletion.component.scss'],
})
export class SystemsModulesRecordsDeletionComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target System Module record
  @Input() public id!: number;

  // Broadcasts successful Systems Modules updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Systems Modules updation events together with their error plurals
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the target System Module
  public systemModule: SystemModule | null | undefined = null;

  // Holds the custom icon classes
  public iconClasses: string[] = ["text-danger"];

  constructor(
    private systemsModulesDataService: SystemsModulesDataService,
    private log: NGXLogger) {

  }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the System Module field based on the passed in id
    this.initialiseSystemModule(() => {

      // Mark Init as complete
      this.log.trace(`${LOG_PREFIX} Init completed`);

    });

  }



  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }

  /**
   * Retrieves the System Module with the injected id and sets it as the System Module that needs to be deleted
   * @param callback The function to call when done
   */
  private initialiseSystemModule(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseTargetSystemModuleRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveSystemModuleRecord(this.id, (systemModule: SystemModule | null) => {

      // Set the target System Module
      this.log.trace(`${LOG_PREFIX} Setting the target System Module`);
      this.systemModule = systemModule;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }

  /**
   * Retrieves an System Module record given its unique identifier
   * @param id The unique identifier of the System Module
   * @param callback The function to call when done
   */
  private retrieveSystemModuleRecord(id: number, callback: (systemModule: SystemModule | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveSystemModuleRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the systemModule id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the systemModule id has been specified`);
    if (id) {

      // The System Module id has been specified
      this.log.trace(`${LOG_PREFIX} The System Module id has been specified`);
      this.log.debug(`${LOG_PREFIX} System Module Id = ${JSON.stringify(id)}`);

      // Try retrieving an System Module Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve an System Module Record with the passed in id`);
      const systemModule: SystemModule | undefined = id ? this.systemsModulesDataService.records.find(d => d.id == id) : undefined;

      // Check if the System Module Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the System Module Record was successfully retrieved`);
      if (systemModule) {

        // The System Module Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The System Module Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} System Module Record = ${JSON.stringify(this.systemModule)}`);

        // Return the System Module
        this.log.trace(`${LOG_PREFIX} Returning the System Module`);
        callback(systemModule);

      } else {

        // The System Module Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The System Module Record was not successfully retrieved`);

        // Return null
        this.log.warn(`${LOG_PREFIX} Returning null`);
        callback(null);

      }


    } else {

      // The System Module id has not been specified
      this.log.error(`${LOG_PREFIX} The System Module id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }



  /**
   * Deletes System Module Records.
   * Emits an succeeded or failed event indicating whether or not the saving exercise was successful.
   * Error 500 = Indicates something unexpected happened at the server side
   */
  public delete(): void {

    this.log.trace(`${LOG_PREFIX} Entering delete()`);

    // Check if the target System Module record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target System Module record was successfully initialised()`);
    if (this.systemModule) {

      // The target System Module record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target System Module record was successfully initialised()`);

      // Delete the record
      this.log.trace(`${LOG_PREFIX} Deleting the System Module Record`);
      this.systemsModulesDataService
        .deleteSystemModule(this.id)
        .subscribe({
          next: () => {

            // The System Module Record was deleted successfully
            this.log.trace(`${LOG_PREFIX} System Module Record was deleted successfuly`);

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The System Module Record was not deleted successfully
            this.log.trace(`${LOG_PREFIX} System Module Record was not deleted successfuly`);

            // Emit a 'failed' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
            this.failed.emit(500);
          }
        });

    } else {
      // The target System Module record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target System Module record was not successfully initialised()`);

      // Emit an 'invalid' event
      this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
      this.failed.emit(500);

    }



  }


}
