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
import { Entity } from '@modules/entities/models/entity.model';
import { EntitiesDataService } from '@modules/entities/services/entities-data.service';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Entities Records Deletion Component]";

@Component({
  selector: 'sb-entities-records-deletion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './entities-records-deletion.component.html',
  styleUrls: ['entities-records-deletion.component.scss'],
})
export class EntitiesRecordsDeletionComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Entity record
  @Input() public id!: number;

  // Broadcasts successful Entities updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Entities updation events together with their error codes
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the Entity record with the passed in id
  public entity: Entity | null | undefined;

  // Holds the custom icon classes
  public iconClasses: string[] = ["text-danger"];

  constructor(private entitiesDataService: EntitiesDataService, private log: NGXLogger) { }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Entity field based on the passed in id
    this.initialiseEntity(() => {

      // Mark Init as complete
      this.log.trace(`${LOG_PREFIX} Init completed`);

    });

  }


  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }

  /**
   * Retrieves the Entity with the injected id and sets it as the Entity that needs to be updated
   * @param callback The function to call when done
   */
  private initialiseEntity(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseEntity()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveEntityRecord(this.id, (entity: Entity | null) => {

      // Set the target Entity
      this.log.trace(`${LOG_PREFIX} Setting the target Entity`);
      this.entity = entity;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }


  /**
   * Retrieves a Entity record given its unique identifier synchronously
   * @param id The unique identifier of the Entity
   * @param callback The function to call when done
   */
  private retrieveEntityRecord(id: number, callback: (entity: Entity | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveEntityRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the Entity Type Id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the Entity Type Id has been specified`);
    if (id) {

      // The Entity Type Id has been specified
      this.log.trace(`${LOG_PREFIX} The Entity Type Id has been specified`);
      this.log.debug(`${LOG_PREFIX} Entity Id = ${JSON.stringify(id)}`);

      // Try retrieving a Entity Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve a Entity Record with the passed in id`);
      const entity: Entity | undefined = id ? this.entitiesDataService.records.find(d => d.id == id) : undefined;

      // Check if the Entity Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the Entity Record was successfully retrieved`);
      if (entity) {

        // The Entity Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Entity Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} Entity Record = ${JSON.stringify(this.entity)}`);

        // Return the Entity
        this.log.warn(`${LOG_PREFIX} Returning the Entity`);
        callback(entity);

      } else {

        // The Entity Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Entity Record was not successfully retrieved`);

        // Return null
        this.log.warn(`${LOG_PREFIX} Returning null`);
        callback(null);

      }


    } else {

      // The Entity Type Id has not been specified
      this.log.error(`${LOG_PREFIX} The Entity Type Id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }




  /**
   * Deletes Entity Records.
   * Emits an succeeded or failed event indicating whether or not the saving exercise was successful.
   * Error 500 = Indicates something unexpected happened at the server side
   */
  public delete(): void {

    // Check if the target Entity record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Entity record was successfully initialised()`);
    if (this.entity) {

      // The target Entity record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Entity record was successfully initialised()`);

      // Delete the record
      this.log.trace(`${LOG_PREFIX} Deleting the Entity Record`);
      this.entitiesDataService
        .deleteEntity(this.id)
        .subscribe({
          next: () => {

            // The Entity Record was deleted successfully
            this.log.trace(`${LOG_PREFIX} Entity Record was deleted successfuly`);

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The Entity Record was not deleted successfully
            this.log.trace(`${LOG_PREFIX} Entity Record was not deleted successfuly`);

            // Emit a 'failed' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
            this.failed.emit(500);
          }
        });

    } else {
      // The target Entity record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Entity record was not successfully initialised()`);

      // Emit an 'invalid' event
      this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
      this.failed.emit(500);

    }



  }


}
