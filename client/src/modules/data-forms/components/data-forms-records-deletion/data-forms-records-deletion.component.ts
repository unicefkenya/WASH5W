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
import { DataForm } from '@modules/data-forms/models/data-form.model';
import { DataFormsDataService } from '@modules/data-forms/services/data-forms-data.service';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Data Forms Records Deletion Component]";

@Component({
  selector: 'sb-data-forms-records-deletion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './data-forms-records-deletion.component.html',
  styleUrls: ['data-forms-records-deletion.component.scss'],
})
export class DataFormsRecordsDeletionComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Data Form record
  @Input() public id!: number;

  // Broadcasts successful Data Forms updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Data Forms updation events together with their error codes
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the Data Form record with the passed in id
  public dataForm: DataForm | null | undefined;

  // Holds the custom icon classes
  public iconClasses: string[] = ["text-danger"];

  constructor(private dataFormsDataService: DataFormsDataService, private log: NGXLogger) { }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Data Form field based on the passed in id
    this.initialiseDataForm(() => {

      // Mark Init as complete
      this.log.trace(`${LOG_PREFIX} Init completed`);

    });

  }


  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }

  /**
   * Retrieves the Data Form with the injected id and sets it as the Data Form that needs to be updated
   * @param callback The function to call when done
   */
  private initialiseDataForm(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseDataForm()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveDataFormRecord(this.id, (dataForm: DataForm | null) => {

      // Set the target Data Form
      this.log.trace(`${LOG_PREFIX} Setting the target Data Form`);
      this.dataForm = dataForm;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }


  /**
   * Retrieves a Data Form record given its unique identifier synchronously
   * @param id The unique identifier of the Data Form
   * @param callback The function to call when done
   */
  private retrieveDataFormRecord(id: number, callback: (dataForm: DataForm | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveDataFormRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the context id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the context id has been specified`);
    if (id) {

      // The context id has been specified
      this.log.trace(`${LOG_PREFIX} The context id has been specified`);
      this.log.debug(`${LOG_PREFIX} Data Form Id = ${JSON.stringify(id)}`);

      // Try retrieving a Data Form Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve a Data Form Record with the passed in id`);
      const dataForm: DataForm | undefined = id ? this.dataFormsDataService.records.find(d => d.id == id) : undefined;

      // Check if the Data Form Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the Data Form Record was successfully retrieved`);
      if (dataForm) {

        // The Data Form Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Data Form Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} Data Form Record = ${JSON.stringify(this.dataForm)}`);

        // Return the Data Form
        this.log.warn(`${LOG_PREFIX} Returning the Data Form`);
        callback(dataForm);

      } else {

        // The Data Form Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Data Form Record was not successfully retrieved`);

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
   * Deletes Data Form Records.
   * Emits an succeeded or failed event indicating whether or not the saving exercise was successful.
   * Error 500 = Indicates something unexpected happened at the server side
   */
  public delete(): void {

    // Check if the target Data Form record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Data Form record was successfully initialised()`);
    if (this.dataForm) {

      // The target Data Form record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Data Form record was successfully initialised()`);

      // Delete the record
      this.log.trace(`${LOG_PREFIX} Deleting the Data Form Record`);
      this.dataFormsDataService
        .deleteDataForm(this.id)
        .subscribe({
          next: () => {

            // The Data Form Record was deleted successfully
            this.log.trace(`${LOG_PREFIX} Data Form Record was deleted successfuly`);

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The Data Form Record was not deleted successfully
            this.log.trace(`${LOG_PREFIX} Data Form Record was not deleted successfuly`);

            // Emit a 'failed' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
            this.failed.emit(500);
          }
        });

    } else {
      // The target Data Form record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Data Form record was not successfully initialised()`);

      // Emit an 'invalid' event
      this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
      this.failed.emit(500);

    }



  }


}
