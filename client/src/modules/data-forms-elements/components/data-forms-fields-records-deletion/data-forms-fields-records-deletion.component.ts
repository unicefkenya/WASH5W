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

const LOG_PREFIX: string = "[Data Forms Fields Records Deletion Component]";

@Component({
  selector: 'sb-data-forms-fields-records-deletion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './data-forms-fields-records-deletion.component.html',
  styleUrls: ['data-forms-fields-records-deletion.component.scss'],
})
export class DataFormsFieldsRecordsDeletionComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Data Form Field record
  @Input() public id!: number;

  // Broadcasts successful Data Form Fields updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Data Form Fields updation events together with their error codes
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the target Data Form Field
  public dataFormField: DataFormElement | null | undefined = null;

  // Holds the custom icon classes
  public iconClasses: string[] = ["text-danger"];

  constructor(
    private dataFormsElementsDataService: DataFormsElementsDataService,
    private log: NGXLogger) {

  }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Data Form Field field based on the passed in id
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
   * Retrieves the Data Form Field with the injected id and sets it as the Data Form Field that needs to be deleted
   * @param callback The function to call when done
   */
  private initialiseDataFormElement(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseTargetDataFormElementRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveDataFormElementRecord(this.id, (dataFormField: DataFormElement | null) => {

      // Set the target Data Form Field
      this.log.trace(`${LOG_PREFIX} Setting the target Data Form Field`);
      this.dataFormField = dataFormField;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }

  /**
   * Retrieves a Data Form Field record given its unique identifier
   * @param id The unique identifier of the Data Form Field
   * @param callback The function to call when done
   */
  private retrieveDataFormElementRecord(id: number, callback: (dataFormField: DataFormElement | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveDataFormElementRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the data form element id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the data form element id has been specified`);
    if (id) {

      // The data form element id has been specified
      this.log.trace(`${LOG_PREFIX} The data form element id has been specified`);
      this.log.debug(`${LOG_PREFIX} Data Form Field Id = ${JSON.stringify(id)}`);

      // Try retrieving a Data Form Field Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve a Data Form Field Record with the passed in id`);
      const dataFormField: DataFormElement | undefined = id ? this.dataFormsElementsDataService.records.find(d => d.id == id) : undefined;

      // Check if the Data Form Field Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the Data Form Field Record was successfully retrieved`);
      if (dataFormField) {

        // The Data Form Field Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Data Form Field Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} Data Form Field Record = ${JSON.stringify(this.dataFormField)}`);

        // Return the Data Form Field
        this.log.warn(`${LOG_PREFIX} Returning the Data Form Field`);
        callback(dataFormField);

      } else {

        // The Data Form Field Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Data Form Field Record was not successfully retrieved`);

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
   * Deletes Data Form Field Records.
   * Emits an succeeded or failed event indicating whether or not the saving exercise was successful.
   * Error 500 = Indicates something unexpected happened at the server side
   */
  public delete(): void {

    this.log.trace(`${LOG_PREFIX} Entering delete()`);

    // Check if the target Data Form Field record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Data Form Field record was successfully initialised()`);
    if (this.dataFormField) {

      // The target Data Form Field record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Data Form Field record was successfully initialised()`);

      // Delete the record
      this.log.trace(`${LOG_PREFIX} Deleting the Data Form Field Record`);
      this.dataFormsElementsDataService
        .deleteDataFormElement(this.id)
        .subscribe({
          next: () => {

            // The Data Form Field Record was deleted successfully
            this.log.trace(`${LOG_PREFIX} Data Form Field Record was deleted successfuly`);

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The Data Form Field Record was not deleted successfully
            this.log.trace(`${LOG_PREFIX} Data Form Field Record was not deleted successfuly`);

            // Emit a 'failed' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
            this.failed.emit(500);
          }
        });

    } else {
      // The target Data Form Field record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Data Form Field record was not successfully initialised()`);

      // Emit an 'invalid' event
      this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
      this.failed.emit(500);

    }



  }


}
