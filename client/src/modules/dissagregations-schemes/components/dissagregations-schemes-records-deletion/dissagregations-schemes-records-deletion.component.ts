import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { DissagregationScheme } from '@modules/dissagregations-schemes/models/dissagregation-scheme.model';
import { DissagregationsSchemesDataService } from '@modules/dissagregations-schemes/services/dissagregations-schemes-data.service';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Dissagregations Schemes Records Deletion Component]";

@Component({
  selector: 'sb-dissagregationsSchemes-records-deletion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dissagregations-schemes-records-deletion.component.html',
  styleUrls: ['dissagregations-schemes-records-deletion.component.scss'],
})
export class DissagregationsSchemesRecordsDeletionComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Dissagregation Scheme record
  @Input() public id!: number;

  // Broadcasts successful Dissagregations Schemes updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Dissagregations Schemes updation events together with their error plurals
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the target Dissagregation Scheme
  public dissagregationScheme: DissagregationScheme | null | undefined = null;

  // Holds the custom icon classes
  public iconClasses: string[] = ["text-danger"];

  constructor(
    private dissagregationsSchemesDataService: DissagregationsSchemesDataService,
    private log: NGXLogger) {

  }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Dissagregation Scheme field based on the passed in id
    this.initialiseDissagregationScheme(() => {

      // Mark Init as complete
      this.log.trace(`${LOG_PREFIX} Init completed`);

    });

  }



  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }

  /**
   * Retrieves the Dissagregation Scheme with the injected id and sets it as the Dissagregation Scheme that needs to be deleted
   * @param callback The function to call when done
   */
  private initialiseDissagregationScheme(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseTargetDissagregationSchemeRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveDissagregationSchemeRecord(this.id, (dissagregationScheme: DissagregationScheme | null) => {

      // Set the target Dissagregation Scheme
      this.log.trace(`${LOG_PREFIX} Setting the target Dissagregation Scheme`);
      this.dissagregationScheme = dissagregationScheme;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }

  /**
   * Retrieves an Dissagregation Scheme record given its unique identifier
   * @param id The unique identifier of the Dissagregation Scheme
   * @param callback The function to call when done
   */
  private retrieveDissagregationSchemeRecord(id: number, callback: (dissagregationScheme: DissagregationScheme | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveDissagregationSchemeRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the dissagregationScheme id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the dissagregationScheme id has been specified`);
    if (id) {

      // The Dissagregation Scheme id has been specified
      this.log.trace(`${LOG_PREFIX} The Dissagregation Scheme id has been specified`);
      this.log.debug(`${LOG_PREFIX} Dissagregation Scheme Id = ${JSON.stringify(id)}`);

      // Try retrieving an Dissagregation Scheme Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve an Dissagregation Scheme Record with the passed in id`);
      const dissagregationScheme: DissagregationScheme | undefined = id ? this.dissagregationsSchemesDataService.records.find(d => d.id == id) : undefined;

      // Check if the Dissagregation Scheme Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the Dissagregation Scheme Record was successfully retrieved`);
      if (dissagregationScheme) {

        // The Dissagregation Scheme Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Dissagregation Scheme Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} Dissagregation Scheme Record = ${JSON.stringify(this.dissagregationScheme)}`);

        // Return the Dissagregation Scheme
        this.log.trace(`${LOG_PREFIX} Returning the Dissagregation Scheme`);
        callback(dissagregationScheme);

      } else {

        // The Dissagregation Scheme Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Dissagregation Scheme Record was not successfully retrieved`);

        // Return null
        this.log.warn(`${LOG_PREFIX} Returning null`);
        callback(null);

      }


    } else {

      // The Dissagregation Scheme id has not been specified
      this.log.error(`${LOG_PREFIX} The Dissagregation Scheme id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }



  /**
   * Deletes Dissagregation Scheme Records.
   * Emits an succeeded or failed event indicating whether or not the saving exercise was successful.
   * Error 500 = Indicates something unexpected happened at the server side
   */
  public delete(): void {

    this.log.trace(`${LOG_PREFIX} Entering delete()`);

    // Check if the target Dissagregation Scheme record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Dissagregation Scheme record was successfully initialised()`);
    if (this.dissagregationScheme) {

      // The target Dissagregation Scheme record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Dissagregation Scheme record was successfully initialised()`);

      // Delete the record
      this.log.trace(`${LOG_PREFIX} Deleting the Dissagregation Scheme Record`);
      this.dissagregationsSchemesDataService
        .deleteDissagregationScheme(this.id)
        .subscribe({
          next: () => {

            // The Dissagregation Scheme Record was deleted successfully
            this.log.trace(`${LOG_PREFIX} Dissagregation Scheme Record was deleted successfuly`);

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The Dissagregation Scheme Record was not deleted successfully
            this.log.trace(`${LOG_PREFIX} Dissagregation Scheme Record was not deleted successfuly`);

            // Emit a 'failed' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
            this.failed.emit(500);
          }
        });

    } else {
      // The target Dissagregation Scheme record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Dissagregation Scheme record was not successfully initialised()`);

      // Emit an 'invalid' event
      this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
      this.failed.emit(500);

    }



  }


}
