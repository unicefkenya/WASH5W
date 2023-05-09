import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { AdministrativeUnitType } from '@modules/administrative-units-types/models/administrative-unit-type.model';
import { AdministrativeUnitsTypesDataService } from '@modules/administrative-units-types/services/administrative-units-types-data.service';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Administrative Units Types Records Deletion Component]";

@Component({
  selector: 'sb-administrativeUnitsTypes-records-deletion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './administrative-units-types-records-deletion.component.html',
  styleUrls: ['administrative-units-types-records-deletion.component.scss'],
})
export class AdministrativeUnitsTypesRecordsDeletionComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Administrative Unit Type record
  @Input() public id!: number;

  // Broadcasts successful Administrative Units Types updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Administrative Units Types updation events together with their error plurals
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the target Administrative Unit Type
  public administrativeUnitType: AdministrativeUnitType | null | undefined = null;

  // Holds the custom icon classes
  public iconClasses: string[] = ["text-danger"];

  constructor(
    private administrativeUnitsTypesDataService: AdministrativeUnitsTypesDataService,
    private log: NGXLogger) {

  }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Administrative Unit Type field based on the passed in id
    this.initialiseAdministrativeUnitType(() => {

      // Mark Init as complete
      this.log.trace(`${LOG_PREFIX} Init completed`);

    });

  }



  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }

  /**
   * Retrieves the Administrative Unit Type with the injected id and sets it as the Administrative Unit Type that needs to be deleted
   * @param callback The function to call when done
   */
  private initialiseAdministrativeUnitType(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseTargetAdministrativeUnitTypeRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveAdministrativeUnitTypeRecord(this.id, (administrativeUnitType: AdministrativeUnitType | null) => {

      // Set the target Administrative Unit Type
      this.log.trace(`${LOG_PREFIX} Setting the target Administrative Unit Type`);
      this.administrativeUnitType = administrativeUnitType;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }

  /**
   * Retrieves an Administrative Unit Type record given its unique identifier
   * @param id The unique identifier of the Administrative Unit Type
   * @param callback The function to call when done
   */
  private retrieveAdministrativeUnitTypeRecord(id: number, callback: (administrativeUnitType: AdministrativeUnitType | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveAdministrativeUnitTypeRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the administrativeUnitType id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the administrativeUnitType id has been specified`);
    if (id) {

      // The Administrative Unit Type id has been specified
      this.log.trace(`${LOG_PREFIX} The Administrative Unit Type id has been specified`);
      this.log.debug(`${LOG_PREFIX} Administrative Unit Type Id = ${JSON.stringify(id)}`);

      // Try retrieving an Administrative Unit Type Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve an Administrative Unit Type Record with the passed in id`);
      const administrativeUnitType: AdministrativeUnitType | undefined = id ? this.administrativeUnitsTypesDataService.records.find(d => d.id == id) : undefined;

      // Check if the Administrative Unit Type Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the Administrative Unit Type Record was successfully retrieved`);
      if (administrativeUnitType) {

        // The Administrative Unit Type Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Administrative Unit Type Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} Administrative Unit Type Record = ${JSON.stringify(this.administrativeUnitType)}`);

        // Return the Administrative Unit Type
        this.log.trace(`${LOG_PREFIX} Returning the Administrative Unit Type`);
        callback(administrativeUnitType);

      } else {

        // The Administrative Unit Type Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Administrative Unit Type Record was not successfully retrieved`);

        // Return null
        this.log.warn(`${LOG_PREFIX} Returning null`);
        callback(null);

      }


    } else {

      // The Administrative Unit Type id has not been specified
      this.log.error(`${LOG_PREFIX} The Administrative Unit Type id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }



  /**
   * Deletes Administrative Unit Type Records.
   * Emits an succeeded or failed event indicating whether or not the saving exercise was successful.
   * Error 500 = Indicates something unexpected happened at the server side
   */
  public delete(): void {

    this.log.trace(`${LOG_PREFIX} Entering delete()`);

    // Check if the target Administrative Unit Type record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Administrative Unit Type record was successfully initialised()`);
    if (this.administrativeUnitType) {

      // The target Administrative Unit Type record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Administrative Unit Type record was successfully initialised()`);

      // Delete the record
      this.log.trace(`${LOG_PREFIX} Deleting the Administrative Unit Type Record`);
      this.administrativeUnitsTypesDataService
        .deleteAdministrativeUnitType(this.id)
        .subscribe({
          next: () => {

            // The Administrative Unit Type Record was deleted successfully
            this.log.trace(`${LOG_PREFIX} Administrative Unit Type Record was deleted successfuly`);

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The Administrative Unit Type Record was not deleted successfully
            this.log.trace(`${LOG_PREFIX} Administrative Unit Type Record was not deleted successfuly`);

            // Emit a 'failed' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
            this.failed.emit(500);
          }
        });

    } else {
      // The target Administrative Unit Type record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Administrative Unit Type record was not successfully initialised()`);

      // Emit an 'invalid' event
      this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
      this.failed.emit(500);

    }



  }


}
