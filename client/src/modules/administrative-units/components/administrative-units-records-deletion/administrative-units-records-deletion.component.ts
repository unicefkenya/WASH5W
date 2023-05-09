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
import { AdministrativeUnit } from '@modules/administrative-units/models/administrative-unit.model';
import { AdministrativeUnitsDataService } from '@modules/administrative-units/services/administrative-units-data.service';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Administrative Units Records Deletion Component]";

@Component({
  selector: 'sb-administrative-units-records-deletion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './administrative-units-records-deletion.component.html',
  styleUrls: ['administrative-units-records-deletion.component.scss'],
})
export class AdministrativeUnitsRecordsDeletionComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Administrative Unit record
  @Input() public id!: number;

  // Broadcasts successful Administrative Units updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Administrative Units updation events together with their error codes
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the Administrative Unit record with the passed in id
  public administrativeUnit: AdministrativeUnit | null | undefined;

  // Holds the custom icon classes
  public iconClasses: string[] = ["text-danger"];

  constructor(private administrativeUnitsDataService: AdministrativeUnitsDataService, private log: NGXLogger) { }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Administrative Unit field based on the passed in id
    this.initialiseAdministrativeUnit(() => {

      // Mark Init as complete
      this.log.trace(`${LOG_PREFIX} Init completed`);

    });

  }


  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }

  /**
   * Retrieves the Administrative Unit with the injected id and sets it as the Administrative Unit that needs to be updated
   * @param callback The function to call when done
   */
  private initialiseAdministrativeUnit(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseAdministrativeUnit()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveAdministrativeUnitRecord(this.id, (administrativeUnit: AdministrativeUnit | null) => {

      // Set the target Administrative Unit
      this.log.trace(`${LOG_PREFIX} Setting the target Administrative Unit`);
      this.administrativeUnit = administrativeUnit;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }


  /**
   * Retrieves an Administrative Unit record given its unique identifier synchronously
   * @param id The unique identifier of the Administrative Unit
   * @param callback The function to call when done
   */
  private retrieveAdministrativeUnitRecord(id: number, callback: (administrativeUnit: AdministrativeUnit | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveAdministrativeUnitRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the Administrative Unit Type Id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the Administrative Unit Type Id has been specified`);
    if (id) {

      // The Administrative Unit Type Id has been specified
      this.log.trace(`${LOG_PREFIX} The Administrative Unit Type Id has been specified`);
      this.log.debug(`${LOG_PREFIX} Administrative Unit Id = ${JSON.stringify(id)}`);

      // Try retrieving an Administrative Unit Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve an Administrative Unit Record with the passed in id`);
      const administrativeUnit: AdministrativeUnit | undefined = id ? this.administrativeUnitsDataService.records.find(d => d.id == id) : undefined;

      // Check if the Administrative Unit Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the Administrative Unit Record was successfully retrieved`);
      if (administrativeUnit) {

        // The Administrative Unit Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Administrative Unit Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} Administrative Unit Record = ${JSON.stringify(this.administrativeUnit)}`);

        // Return the Administrative Unit
        this.log.warn(`${LOG_PREFIX} Returning the Administrative Unit`);
        callback(administrativeUnit);

      } else {

        // The Administrative Unit Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Administrative Unit Record was not successfully retrieved`);

        // Return null
        this.log.warn(`${LOG_PREFIX} Returning null`);
        callback(null);

      }


    } else {

      // The Administrative Unit Type Id has not been specified
      this.log.error(`${LOG_PREFIX} The Administrative Unit Type Id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }




  /**
   * Deletes Administrative Unit Records.
   * Emits an succeeded or failed event indicating whether or not the saving exercise was successful.
   * Error 500 = Indicates something unexpected happened at the server side
   */
  public delete(): void {

    // Check if the target Administrative Unit record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Administrative Unit record was successfully initialised()`);
    if (this.administrativeUnit) {

      // The target Administrative Unit record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Administrative Unit record was successfully initialised()`);

      // Delete the record
      this.log.trace(`${LOG_PREFIX} Deleting the Administrative Unit Record`);
      this.administrativeUnitsDataService
        .deleteAdministrativeUnit(this.id)
        .subscribe({
          next: () => {

            // The Administrative Unit Record was deleted successfully
            this.log.trace(`${LOG_PREFIX} Administrative Unit Record was deleted successfuly`);

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The Administrative Unit Record was not deleted successfully
            this.log.trace(`${LOG_PREFIX} Administrative Unit Record was not deleted successfuly`);

            // Emit a 'failed' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
            this.failed.emit(500);
          }
        });

    } else {
      // The target Administrative Unit record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Administrative Unit record was not successfully initialised()`);

      // Emit an 'invalid' event
      this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
      this.failed.emit(500);

    }



  }


}
