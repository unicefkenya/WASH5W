import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { DataFormElement } from '@modules/data-forms-elements/models/data-form-element.model';
import { DataFormsElementsDataService } from '@modules/data-forms-elements/services/data-forms-elements-data.service';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Data Forms Groups Records Deletion Component]";

@Component({
  selector: 'sb-data-forms-groups-records-deletion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './data-forms-groups-records-deletion.component.html',
  styleUrls: ['data-forms-groups-records-deletion.component.scss'],
})
export class DataFormsGroupsRecordsDeletionComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Data Form Group record
  @Input() public id!: number;

  // Broadcasts successful Data Form Groups updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Data Form Groups updation events together with their error codes
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the target Data Form Group
  public dataFormGroup: DataFormElement | null | undefined = null;

  // Holds the custom icon classes
  public iconClasses: string[] = ["text-danger"];

  constructor(
    private dataFormsElementsDataService: DataFormsElementsDataService,
    private log: NGXLogger) {

  }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Data Form Group field based on the passed in id
    this.initialiseDataFormElement(() => {

      // Mark Init as complete
      this.log.trace(`${LOG_PREFIX} Init completed`);

    });

  }



  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }

  /**
   * Retrieves the Data Form Group with the injected id and sets it as the Data Form Group that needs to be deleted
   * @param callback The function to call when done
   */
  private initialiseDataFormElement(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseTargetDataFormElementRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveDataFormElementRecord(this.id, (dataFormGroup: DataFormElement | null) => {

      // Set the target Data Form Group
      this.log.trace(`${LOG_PREFIX} Setting the target Data Form Group`);
      this.dataFormGroup = dataFormGroup;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }

  /**
   * Retrieves a Data Form Group record given its unique identifier
   * @param id The unique identifier of the Data Form Group
   * @param callback The function to call when done
   */
  private retrieveDataFormElementRecord(id: number, callback: (dataFormGroup: DataFormElement | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveDataFormElementRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the data form element id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the data form element id has been specified`);
    if (id) {

      // The data form element id has been specified
      this.log.trace(`${LOG_PREFIX} The data form element id has been specified`);
      this.log.debug(`${LOG_PREFIX} Data Form Group Id = ${JSON.stringify(id)}`);

      // Try retrieving a Data Form Group Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve a Data Form Group Record with the passed in id`);
      const dataFormGroup: DataFormElement | undefined = id ? this.dataFormsElementsDataService.records.find(d => d.id == id) : undefined;

      // Check if the Data Form Group Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the Data Form Group Record was successfully retrieved`);
      if (dataFormGroup) {

        // The Data Form Group Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Data Form Group Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} Data Form Group Record = ${JSON.stringify(this.dataFormGroup)}`);

        // Return the Data Form Group
        this.log.warn(`${LOG_PREFIX} Returning the Data Form Group`);
        callback(dataFormGroup);

      } else {

        // The Data Form Group Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Data Form Group Record was not successfully retrieved`);

        // Return null
        this.log.warn(`${LOG_PREFIX} Returning null`);
        callback(null);

      }


    } else {

      // The data form element id has not been specified
      this.log.error(`${LOG_PREFIX} The data form element id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }



  /**
   * Deletes Data Form Group Records.
   * Emits an succeeded or failed event indicating whether or not the saving exercise was successful.
   * Error 500 = Indicates something unexpected happened at the server side
   */
  public delete(): void {

    this.log.trace(`${LOG_PREFIX} Entering delete()`);

    // Check if the target Data Form Group record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Data Form Group record was successfully initialised()`);
    if (this.dataFormGroup) {

      // The target Data Form Group record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Data Form Group record was successfully initialised()`);

      // Delete the group
      this.log.trace(`${LOG_PREFIX} Deleting the group`);
      this.dataFormsElementsDataService
        .deleteDataFormElement(this.id)
        .subscribe({
          next: () => {

            // The Data Form Group Record was deleted successfully
            this.log.trace(`${LOG_PREFIX} Data Form Group Record was deleted successfuly`);

            // Delete the group's fields
            this.log.trace(`${LOG_PREFIX} Deleting the groups fields`);
            this.dataFormsElementsDataService
              .deleteDataFormElements(this.id)
              .subscribe({
                next: () => {

                  // The Data Form Group's fields were deleted successfully
                  this.log.trace(`${LOG_PREFIX} The Data Form Group's fields were deleted successfully`);

                  // Emit a 'succeeded' event
                  this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
                  this.succeeded.emit();
                },
                error: (error: any) => {

                  // The Data Form Group's fields were not deleted successfully
                  this.log.trace(`${LOG_PREFIX} The Data Form Group's fields were not deleted successfully`);

                  // Emit a 'failed' event
                  this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
                  this.failed.emit(500);
                }
              });
          },
          error: (error: any) => {

            // The Data Form Group Record was not deleted successfully
            this.log.trace(`${LOG_PREFIX} Data Form Group Record was not deleted successfuly`);

            // Emit a 'failed' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
            this.failed.emit(500);
          }
        });

    } else {
      // The target Data Form Group record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Data Form Group record was not successfully initialised()`);

      // Emit an 'invalid' event
      this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
      this.failed.emit(500);

    }



  }


}
