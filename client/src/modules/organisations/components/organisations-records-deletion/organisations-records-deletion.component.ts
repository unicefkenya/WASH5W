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
import { Organisation } from '@modules/organisations/models/organisation.model';
import { OrganisationsDataService } from '@modules/organisations/services/organisations-data.service';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Organisations Records Deletion Component]";

@Component({
  selector: 'sb-organisations-records-deletion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './organisations-records-deletion.component.html',
  styleUrls: ['organisations-records-deletion.component.scss'],
})
export class OrganisationsRecordsDeletionComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Organisation record
  @Input() public id!: number;

  // Broadcasts successful Organisations updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Organisations updation events together with their error codes
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the Organisation record with the passed in id
  public organisation: Organisation | null | undefined;

  // Holds the custom icon classes
  public iconClasses: string[] = ["text-danger"];

  constructor(private organisationsDataService: OrganisationsDataService, private log: NGXLogger) { }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Organisation field based on the passed in id
    this.initialiseOrganisation(() => {

      // Mark Init as complete
      this.log.trace(`${LOG_PREFIX} Init completed`);

    });

  }


  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }

  /**
   * Retrieves the Organisation with the injected id and sets it as the Organisation that needs to be updated
   * @param callback The function to call when done
   */
  private initialiseOrganisation(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseOrganisation()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveOrganisationRecord(this.id, (organisation: Organisation | null) => {

      // Set the target Organisation
      this.log.trace(`${LOG_PREFIX} Setting the target Organisation`);
      this.organisation = organisation;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }


  /**
   * Retrieves an Organisation record given its unique identifier synchronously
   * @param id The unique identifier of the Organisation
   * @param callback The function to call when done
   */
  private retrieveOrganisationRecord(id: number, callback: (organisation: Organisation | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveOrganisationRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the Organisation Type Id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the Organisation Type Id has been specified`);
    if (id) {

      // The Organisation Type Id has been specified
      this.log.trace(`${LOG_PREFIX} The Organisation Type Id has been specified`);
      this.log.debug(`${LOG_PREFIX} Organisation Id = ${JSON.stringify(id)}`);

      // Try retrieving an Organisation Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve an Organisation Record with the passed in id`);
      const organisation: Organisation | undefined = id ? this.organisationsDataService.records.find(d => d.id == id) : undefined;

      // Check if the Organisation Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the Organisation Record was successfully retrieved`);
      if (organisation) {

        // The Organisation Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Organisation Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} Organisation Record = ${JSON.stringify(this.organisation)}`);

        // Return the Organisation
        this.log.warn(`${LOG_PREFIX} Returning the Organisation`);
        callback(organisation);

      } else {

        // The Organisation Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Organisation Record was not successfully retrieved`);

        // Return null
        this.log.warn(`${LOG_PREFIX} Returning null`);
        callback(null);

      }


    } else {

      // The Organisation Type Id has not been specified
      this.log.error(`${LOG_PREFIX} The Organisation Type Id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }




  /**
   * Deletes Organisation Records.
   * Emits an succeeded or failed event indicating whether or not the saving exercise was successful.
   * Error 500 = Indicates something unexpected happened at the server side
   */
  public delete(): void {

    // Check if the target Organisation record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Organisation record was successfully initialised()`);
    if (this.organisation) {

      // The target Organisation record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Organisation record was successfully initialised()`);

      // Delete the record
      this.log.trace(`${LOG_PREFIX} Deleting the Organisation Record`);
      this.organisationsDataService
        .deleteOrganisation(this.id)
        .subscribe({
          next: () => {

            // The Organisation Record was deleted successfully
            this.log.trace(`${LOG_PREFIX} Organisation Record was deleted successfuly`);

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The Organisation Record was not deleted successfully
            this.log.trace(`${LOG_PREFIX} Organisation Record was not deleted successfuly`);

            // Emit a 'failed' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
            this.failed.emit(500);
          }
        });

    } else {
      // The target Organisation record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Organisation record was not successfully initialised()`);

      // Emit an 'invalid' event
      this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
      this.failed.emit(500);

    }



  }


}
