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
import { Option } from '@modules/options/models/option.model';
import { OptionsDataService } from '@modules/options/services/options-data.service';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Options Records Deletion Component]";

@Component({
  selector: 'sb-options-records-deletion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './options-records-deletion.component.html',
  styleUrls: ['options-records-deletion.component.scss'],
})
export class OptionsRecordsDeletionComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Option record
  @Input() public id!: number;

  // Broadcasts successful Options updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Options updation events together with their error codes
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the Option record with the passed in id
  public option: Option | null | undefined;

  // Holds the custom icon classes
  public iconClasses: string[] = ["text-danger"];

  constructor(private optionsDataService: OptionsDataService, private log: NGXLogger) { }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Option field based on the passed in id
    this.initialiseOption(() => {

      // Mark Init as complete
      this.log.trace(`${LOG_PREFIX} Init completed`);

    });

  }


  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }

  /**
   * Retrieves the Option with the injected id and sets it as the Option that needs to be updated
   * @param callback The function to call when done
   */
  private initialiseOption(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseOption()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveOptionRecord(this.id, (option: Option | null) => {

      // Set the target Option
      this.log.trace(`${LOG_PREFIX} Setting the target Option`);
      this.option = option;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }


  /**
   * Retrieves an Option record given its unique identifier synchronously
   * @param id The unique identifier of the Option
   * @param callback The function to call when done
   */
  private retrieveOptionRecord(id: number, callback: (option: Option | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveOptionRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the Option Type Id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the Option Type Id has been specified`);
    if (id) {

      // The Option Type Id has been specified
      this.log.trace(`${LOG_PREFIX} The Option Type Id has been specified`);
      this.log.debug(`${LOG_PREFIX} Option Id = ${JSON.stringify(id)}`);

      // Try retrieving an Option Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve an Option Record with the passed in id`);
      const option: Option | undefined = id ? this.optionsDataService.records.find(d => d.id == id) : undefined;

      // Check if the Option Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the Option Record was successfully retrieved`);
      if (option) {

        // The Option Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Option Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} Option Record = ${JSON.stringify(this.option)}`);

        // Return the Option
        this.log.warn(`${LOG_PREFIX} Returning the Option`);
        callback(option);

      } else {

        // The Option Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Option Record was not successfully retrieved`);

        // Return null
        this.log.warn(`${LOG_PREFIX} Returning null`);
        callback(null);

      }


    } else {

      // The Option Type Id has not been specified
      this.log.error(`${LOG_PREFIX} The Option Type Id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }




  /**
   * Deletes Option Records.
   * Emits an succeeded or failed event indicating whether or not the saving exercise was successful.
   * Error 500 = Indicates something unexpected happened at the server side
   */
  public delete(): void {

    // Check if the target Option record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Option record was successfully initialised()`);
    if (this.option) {

      // The target Option record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Option record was successfully initialised()`);

      // Delete the record
      this.log.trace(`${LOG_PREFIX} Deleting the Option Record`);
      this.optionsDataService
        .deleteOption(this.id)
        .subscribe({
          next: () => {

            // The Option Record was deleted successfully
            this.log.trace(`${LOG_PREFIX} Option Record was deleted successfuly`);

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The Option Record was not deleted successfully
            this.log.trace(`${LOG_PREFIX} Option Record was not deleted successfuly`);

            // Emit a 'failed' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
            this.failed.emit(500);
          }
        });

    } else {
      // The target Option record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Option record was not successfully initialised()`);

      // Emit an 'invalid' event
      this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
      this.failed.emit(500);

    }



  }


}
