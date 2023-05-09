import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { DataFormResponse } from '@modules/data-forms-responses/models/data-form-response.model';
import { DataFormsResponsesDataService } from '@modules/data-forms-responses/services/data-forms-responses-data.service';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Data Forms Responses Records Deletion Component]";

@Component({
  selector: 'sb-dataFormsResponses-records-deletion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './data-forms-responses-records-deletion.component.html',
  styleUrls: ['data-forms-responses-records-deletion.component.scss'],
})
export class DataFormsResponsesRecordsDeletionComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Data Form Response record
  @Input() public id!: number;

  // Broadcasts successful Data Forms Responses updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Data Forms Responses updation events together with their error plurals
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the target Data Form Response
  public dataFormResponse: DataFormResponse | null | undefined = null;

  // Holds the custom icon classes
  public iconClasses: string[] = ["text-danger"];

  constructor(
    private dataFormsResponsesDataService: DataFormsResponsesDataService,
    private log: NGXLogger) {

  }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Data Form Response field based on the passed in id
    this.initialiseDataFormResponse(() => {

      // Mark Init as complete
      this.log.trace(`${LOG_PREFIX} Init completed`);

    });

  }



  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }

  /**
   * Retrieves the Data Form Response with the injected id and sets it as the Data Form Response that needs to be deleted
   * @param callback The function to call when done
   */
  private initialiseDataFormResponse(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseTargetDataFormResponseRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveDataFormResponseRecord(this.id, (dataFormResponse: DataFormResponse | null) => {

      // Set the target Data Form Response
      this.log.trace(`${LOG_PREFIX} Setting the target Data Form Response`);
      this.dataFormResponse = dataFormResponse;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }

  /**
   * Retrieves a Data Form Response record given its unique identifier
   * @param id The unique identifier of the Data Form Response
   * @param callback The function to call when done
   */
  private retrieveDataFormResponseRecord(id: number, callback: (dataFormResponse: DataFormResponse | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveDataFormResponseRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the dataFormResponse id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the dataFormResponse id has been specified`);
    if (id) {

      // The Data Form Response id has been specified
      this.log.trace(`${LOG_PREFIX} The Data Form Response id has been specified`);
      this.log.debug(`${LOG_PREFIX} Data Form Response Id = ${JSON.stringify(id)}`);

      // Try retrieving a Data Form Response Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve a Data Form Response Record with the passed in id`);
      const dataFormResponse: DataFormResponse | undefined = id ? this.dataFormsResponsesDataService.records.find(d => d.id == id) : undefined;

      // Check if the Data Form Response Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the Data Form Response Record was successfully retrieved`);
      if (dataFormResponse) {

        // The Data Form Response Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Data Form Response Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} Data Form Response Record = ${JSON.stringify(this.dataFormResponse)}`);

        // Return the Data Form Response
        this.log.trace(`${LOG_PREFIX} Returning the Data Form Response`);
        callback(dataFormResponse);

      } else {

        // The Data Form Response Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Data Form Response Record was not successfully retrieved`);

        // Return null
        this.log.warn(`${LOG_PREFIX} Returning null`);
        callback(null);

      }


    } else {

      // The Data Form Response id has not been specified
      this.log.error(`${LOG_PREFIX} The Data Form Response id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }



  /**
   * Deletes Data Form Response Records.
   * Emits an succeeded or failed event indicating whether or not the saving exercise was successful.
   * Error 500 = Indicates something unexpected happened at the server side
   */
  public delete(): void {

    this.log.trace(`${LOG_PREFIX} Entering delete()`);

    // Check if the target Data Form Response record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Data Form Response record was successfully initialised()`);
    if (this.dataFormResponse) {

      // The target Data Form Response record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Data Form Response record was successfully initialised()`);

      // Delete the record
      this.log.trace(`${LOG_PREFIX} Deleting the Data Form Response Record`);
      this.dataFormsResponsesDataService
        .deleteDataFormResponse(this.id)
        .subscribe({
          next: () => {

            // The Data Form Response Record was deleted successfully
            this.log.trace(`${LOG_PREFIX} Data Form Response Record was deleted successfuly`);

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The Data Form Response Record was not deleted successfully
            this.log.trace(`${LOG_PREFIX} Data Form Response Record was not deleted successfuly`);

            // Emit a 'failed' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
            this.failed.emit(500);
          }
        });

    } else {
      // The target Data Form Response record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Data Form Response record was not successfully initialised()`);

      // Emit an 'invalid' event
      this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
      this.failed.emit(500);

    }



  }


}
