import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { OptionType } from '@modules/options-types/models/option-type.model';
import { OptionsTypesDataService } from '@modules/options-types/services/options-types-data.service';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Options Types Records Deletion Component]";

@Component({
  selector: 'sb-optionsTypes-records-deletion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './options-types-records-deletion.component.html',
  styleUrls: ['options-types-records-deletion.component.scss'],
})
export class OptionsTypesRecordsDeletionComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Option Type record
  @Input() public id!: number;

  // Broadcasts successful Options Types updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Options Types updation events together with their error plurals
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the target Option Type
  public optionType: OptionType | null | undefined = null;

  // Holds the custom icon classes
  public iconClasses: string[] = ["text-danger"];

  constructor(
    private optionsTypesDataService: OptionsTypesDataService,
    private log: NGXLogger) {

  }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Option Type field based on the passed in id
    this.initialiseOptionType(() => {

      // Mark Init as complete
      this.log.trace(`${LOG_PREFIX} Init completed`);

    });

  }



  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }

  /**
   * Retrieves the Option Type with the injected id and sets it as the Option Type that needs to be deleted
   * @param callback The function to call when done
   */
  private initialiseOptionType(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseTargetOptionTypeRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveOptionTypeRecord(this.id, (optionType: OptionType | null) => {

      // Set the target Option Type
      this.log.trace(`${LOG_PREFIX} Setting the target Option Type`);
      this.optionType = optionType;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }

  /**
   * Retrieves an Option Type record given its unique identifier
   * @param id The unique identifier of the Option Type
   * @param callback The function to call when done
   */
  private retrieveOptionTypeRecord(id: number, callback: (optionType: OptionType | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveOptionTypeRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the optionType id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the optionType id has been specified`);
    if (id) {

      // The Option Type id has been specified
      this.log.trace(`${LOG_PREFIX} The Option Type id has been specified`);
      this.log.debug(`${LOG_PREFIX} Option Type Id = ${JSON.stringify(id)}`);

      // Try retrieving an Option Type Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve an Option Type Record with the passed in id`);
      const optionType: OptionType | undefined = id ? this.optionsTypesDataService.records.find(d => d.id == id) : undefined;

      // Check if the Option Type Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the Option Type Record was successfully retrieved`);
      if (optionType) {

        // The Option Type Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Option Type Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} Option Type Record = ${JSON.stringify(this.optionType)}`);

        // Return the Option Type
        this.log.trace(`${LOG_PREFIX} Returning the Option Type`);
        callback(optionType);

      } else {

        // The Option Type Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Option Type Record was not successfully retrieved`);

        // Return null
        this.log.warn(`${LOG_PREFIX} Returning null`);
        callback(null);

      }


    } else {

      // The Option Type id has not been specified
      this.log.error(`${LOG_PREFIX} The Option Type id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }



  /**
   * Deletes Option Type Records.
   * Emits an succeeded or failed event indicating whether or not the saving exercise was successful.
   * Error 500 = Indicates something unexpected happened at the server side
   */
  public delete(): void {

    this.log.trace(`${LOG_PREFIX} Entering delete()`);

    // Check if the target Option Type record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Option Type record was successfully initialised()`);
    if (this.optionType) {

      // The target Option Type record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Option Type record was successfully initialised()`);

      // Delete the record
      this.log.trace(`${LOG_PREFIX} Deleting the Option Type Record`);
      this.optionsTypesDataService
        .deleteOptionType(this.id)
        .subscribe({
          next: () => {

            // The Option Type Record was deleted successfully
            this.log.trace(`${LOG_PREFIX} Option Type Record was deleted successfuly`);

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The Option Type Record was not deleted successfully
            this.log.trace(`${LOG_PREFIX} Option Type Record was not deleted successfuly`);

            // Emit a 'failed' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
            this.failed.emit(500);
          }
        });

    } else {
      // The target Option Type record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Option Type record was not successfully initialised()`);

      // Emit an 'invalid' event
      this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
      this.failed.emit(500);

    }



  }


}
