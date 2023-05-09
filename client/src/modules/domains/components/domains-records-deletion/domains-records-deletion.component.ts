import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { Domain } from '@modules/domains/models/domain.model';
import { DomainsDataService } from '@modules/domains/services/domains-data.service';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Domains Records Deletion Component]";

@Component({
  selector: 'sb-domains-records-deletion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './domains-records-deletion.component.html',
  styleUrls: ['domains-records-deletion.component.scss'],
})
export class DomainsRecordsDeletionComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Domain record
  @Input() public id!: number;

  // Broadcasts successful Domains updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Domains updation events together with their error abbreviations
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the target Domain
  public domain: Domain | null | undefined = null;

  // Holds the custom icon classes
  public iconClasses: string[] = ["text-danger"];

  constructor(
    private domainsDataService: DomainsDataService,
    private log: NGXLogger) {

  }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Domain field based on the passed in id
    this.initialiseDomain(() => {

      // Mark Init as complete
      this.log.trace(`${LOG_PREFIX} Init completed`);

    });

  }



  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }

  /**
   * Retrieves the Domain with the injected id and sets it as the Domain that needs to be deleted
   * @param callback The function to call when done
   */
  private initialiseDomain(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseTargetDomainRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveDomainRecord(this.id, (domain: Domain | null) => {

      // Set the target Domain
      this.log.trace(`${LOG_PREFIX} Setting the target Domain`);
      this.domain = domain;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }

  /**
   * Retrieves a Domain record given its unique identifier
   * @param id The unique identifier of the Domain
   * @param callback The function to call when done
   */
  private retrieveDomainRecord(id: number, callback: (domain: Domain | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveDomainRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the domain id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the domain id has been specified`);
    if (id) {

      // The domain id has been specified
      this.log.trace(`${LOG_PREFIX} The domain id has been specified`);
      this.log.debug(`${LOG_PREFIX} Domain Id = ${JSON.stringify(id)}`);

      // Try retrieving a Domain Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve a Domain Record with the passed in id`);
      const domain: Domain | undefined = id ? this.domainsDataService.records.find(d => d.id == id) : undefined;

      // Check if the Domain Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the Domain Record was successfully retrieved`);
      if (domain) {

        // The Domain Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Domain Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} Domain Record = ${JSON.stringify(this.domain)}`);

        // Return the Domain
        this.log.trace(`${LOG_PREFIX} Returning the Domain`);
        callback(domain);

      } else {

        // The Domain Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Domain Record was not successfully retrieved`);

        // Return null
        this.log.warn(`${LOG_PREFIX} Returning null`);
        callback(null);

      }


    } else {

      // The domain id has not been specified
      this.log.error(`${LOG_PREFIX} The domain id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }



  /**
   * Deletes Domain Records.
   * Emits an succeeded or failed event indicating whether or not the saving exercise was successful.
   * Error 500 = Indicates something unexpected happened at the server side
   */
  public delete(): void {

    this.log.trace(`${LOG_PREFIX} Entering delete()`);

    // Check if the target Domain record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Domain record was successfully initialised()`);
    if (this.domain) {

      // The target Domain record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Domain record was successfully initialised()`);

      // Delete the record
      this.log.trace(`${LOG_PREFIX} Deleting the Domain Record`);
      this.domainsDataService
        .deleteDomain(this.id)
        .subscribe({
          next: () => {

            // The Domain Record was deleted successfully
            this.log.trace(`${LOG_PREFIX} Domain Record was deleted successfuly`);

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The Domain Record was not deleted successfully
            this.log.trace(`${LOG_PREFIX} Domain Record was not deleted successfuly`);

            // Emit a 'failed' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
            this.failed.emit(500);
          }
        });

    } else {
      // The target Domain record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Domain record was not successfully initialised()`);

      // Emit an 'invalid' event
      this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
      this.failed.emit(500);

    }



  }


}
