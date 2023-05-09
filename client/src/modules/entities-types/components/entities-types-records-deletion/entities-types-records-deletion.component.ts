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
import { EntityType } from '@modules/entities-types/models/entity-type.model';
import { EntitiesTypesDataService } from '@modules/entities-types/services/entities-types-data.service';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Entities Types Records Deletion Component]";

@Component({
  selector: 'sb-entities-types-records-deletion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './entities-types-records-deletion.component.html',
  styleUrls: ['entities-types-records-deletion.component.scss'],
})
export class EntitiesTypesRecordsDeletionComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Entity Type record
  @Input() public id!: number;

  // Broadcasts successful Entities Types updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Entities Types updation events together with their error codes
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the Entity Type record with the passed in id
  public entityType: EntityType | null | undefined;

  // Holds the custom icon classes
  public iconClasses: string[] = ["text-danger"];

  constructor(private entitiesTypesDataService: EntitiesTypesDataService, private log: NGXLogger) { }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Entity Type field based on the passed in id
    this.initialiseEntityType(() => {

      // Mark Init as complete
      this.log.trace(`${LOG_PREFIX} Init completed`);

    });

  }


  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }

  /**
   * Retrieves the Entity Type with the injected id and sets it as the Entity Type that needs to be updated
   * @param callback The function to call when done
   */
  private initialiseEntityType(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseEntityType()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveEntityTypeRecord(this.id, (entityType: EntityType | null) => {

      // Set the target Entity Type
      this.log.trace(`${LOG_PREFIX} Setting the target Entity Type`);
      this.entityType = entityType;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }


  /**
   * Retrieves a Entity Type record given its unique identifier synchronously
   * @param id The unique identifier of the Entity Type
   * @param callback The function to call when done
   */
  private retrieveEntityTypeRecord(id: number, callback: (entityType: EntityType | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveEntityTypeRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the context id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the context id has been specified`);
    if (id) {

      // The context id has been specified
      this.log.trace(`${LOG_PREFIX} The context id has been specified`);
      this.log.debug(`${LOG_PREFIX} Entity Type Id = ${JSON.stringify(id)}`);

      // Try retrieving a Entity Type Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve a Entity Type Record with the passed in id`);
      const entityType: EntityType | undefined = id ? this.entitiesTypesDataService.records.find(d => d.id == id) : undefined;

      // Check if the Entity Type Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the Entity Type Record was successfully retrieved`);
      if (entityType) {

        // The Entity Type Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Entity Type Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} Entity Type Record = ${JSON.stringify(this.entityType)}`);

        // Return the Entity Type
        this.log.warn(`${LOG_PREFIX} Returning the Entity Type`);
        callback(entityType);

      } else {

        // The Entity Type Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Entity Type Record was not successfully retrieved`);

        // Return null
        this.log.warn(`${LOG_PREFIX} Returning null`);
        callback(null);

      }


    } else {

      // The context id has not been specified
      this.log.error(`${LOG_PREFIX} The context id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }




  /**
   * Deletes Entity Type Records.
   * Emits an succeeded or failed event indicating whether or not the saving exercise was successful.
   * Error 500 = Indicates something unexpected happened at the server side
   */
  public delete(): void {

    // Check if the target Entity Type record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Entity Type record was successfully initialised()`);
    if (this.entityType) {

      // The target Entity Type record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Entity Type record was successfully initialised()`);

      // Delete the record
      this.log.trace(`${LOG_PREFIX} Deleting the Entity Type Record`);
      this.entitiesTypesDataService
        .deleteEntityType(this.id)
        .subscribe({
          next: () => {

            // The Entity Type Record was deleted successfully
            this.log.trace(`${LOG_PREFIX} Entity Type Record was deleted successfuly`);

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The Entity Type Record was not deleted successfully
            this.log.trace(`${LOG_PREFIX} Entity Type Record was not deleted successfuly`);

            // Emit a 'failed' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
            this.failed.emit(500);
          }
        });

    } else {
      // The target Entity Type record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Entity Type record was not successfully initialised()`);

      // Emit an 'invalid' event
      this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
      this.failed.emit(500);

    }



  }


}
