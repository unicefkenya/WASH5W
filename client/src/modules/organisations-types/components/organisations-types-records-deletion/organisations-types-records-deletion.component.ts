import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { OrganisationType } from '@modules/organisations-types/models/organisation-type.model';
import { OrganisationsTypesDataService } from '@modules/organisations-types/services/organisations-types-data.service';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Organisations Types Records Deletion Component]";

@Component({
  selector: 'sb-organisationsTypes-records-deletion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './organisations-types-records-deletion.component.html',
  styleUrls: ['organisations-types-records-deletion.component.scss'],
})
export class OrganisationsTypesRecordsDeletionComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Organisation Type record
  @Input() public id!: number;

  // Broadcasts successful Organisations Types updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Organisations Types updation events together with their error plurals
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the target Organisation Type
  public organisationType: OrganisationType | null | undefined = null;

  // Holds the custom icon classes
  public iconClasses: string[] = ["text-danger"];

  constructor(
    private organisationsTypesDataService: OrganisationsTypesDataService,
    private log: NGXLogger) {

  }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Organisation Type field based on the passed in id
    this.initialiseOrganisationType(() => {

      // Mark Init as complete
      this.log.trace(`${LOG_PREFIX} Init completed`);

    });

  }



  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }

  /**
   * Retrieves the Organisation Type with the injected id and sets it as the Organisation Type that needs to be deleted
   * @param callback The function to call when done
   */
  private initialiseOrganisationType(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseTargetOrganisationTypeRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveOrganisationTypeRecord(this.id, (organisationType: OrganisationType | null) => {

      // Set the target Organisation Type
      this.log.trace(`${LOG_PREFIX} Setting the target Organisation Type`);
      this.organisationType = organisationType;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }

  /**
   * Retrieves an Organisation Type record given its unique identifier
   * @param id The unique identifier of the Organisation Type
   * @param callback The function to call when done
   */
  private retrieveOrganisationTypeRecord(id: number, callback: (organisationType: OrganisationType | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveOrganisationTypeRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the organisationType id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the organisationType id has been specified`);
    if (id) {

      // The Organisation Type id has been specified
      this.log.trace(`${LOG_PREFIX} The Organisation Type id has been specified`);
      this.log.debug(`${LOG_PREFIX} Organisation Type Id = ${JSON.stringify(id)}`);

      // Try retrieving an Organisation Type Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve an Organisation Type Record with the passed in id`);
      const organisationType: OrganisationType | undefined = id ? this.organisationsTypesDataService.records.find(d => d.id == id) : undefined;

      // Check if the Organisation Type Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the Organisation Type Record was successfully retrieved`);
      if (organisationType) {

        // The Organisation Type Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Organisation Type Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} Organisation Type Record = ${JSON.stringify(this.organisationType)}`);

        // Return the Organisation Type
        this.log.trace(`${LOG_PREFIX} Returning the Organisation Type`);
        callback(organisationType);

      } else {

        // The Organisation Type Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Organisation Type Record was not successfully retrieved`);

        // Return null
        this.log.warn(`${LOG_PREFIX} Returning null`);
        callback(null);

      }


    } else {

      // The Organisation Type id has not been specified
      this.log.error(`${LOG_PREFIX} The Organisation Type id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }



  /**
   * Deletes Organisation Type Records.
   * Emits an succeeded or failed event indicating whether or not the saving exercise was successful.
   * Error 500 = Indicates something unexpected happened at the server side
   */
  public delete(): void {

    this.log.trace(`${LOG_PREFIX} Entering delete()`);

    // Check if the target Organisation Type record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Organisation Type record was successfully initialised()`);
    if (this.organisationType) {

      // The target Organisation Type record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Organisation Type record was successfully initialised()`);

      // Delete the record
      this.log.trace(`${LOG_PREFIX} Deleting the Organisation Type Record`);
      this.organisationsTypesDataService
        .deleteOrganisationType(this.id)
        .subscribe({
          next: () => {

            // The Organisation Type Record was deleted successfully
            this.log.trace(`${LOG_PREFIX} Organisation Type Record was deleted successfuly`);

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The Organisation Type Record was not deleted successfully
            this.log.trace(`${LOG_PREFIX} Organisation Type Record was not deleted successfuly`);

            // Emit a 'failed' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
            this.failed.emit(500);
          }
        });

    } else {
      // The target Organisation Type record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Organisation Type record was not successfully initialised()`);

      // Emit an 'invalid' event
      this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
      this.failed.emit(500);

    }



  }


}
