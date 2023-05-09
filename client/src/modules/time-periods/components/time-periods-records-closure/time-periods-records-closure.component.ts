import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { Context } from '@modules/contexts/models/context.model';
import { ContextsDataService } from '@modules/contexts/services/contexts-data.service';
import { DataFormResponse } from '@modules/data-forms-responses/models';
import { DataFormsResponsesDataService } from '@modules/data-forms-responses/services/data-forms-responses-data.service';
import { TimePeriod } from '@modules/time-periods/models/time-period.model';
import { TimePeriodsDataService } from '@modules/time-periods/services/time-periods-data.service';
import moment from 'moment';
import { NGXLogger } from 'ngx-logger';
import { environment } from 'environments/environment';

const LOG_PREFIX: string = "[Times Periods Records Closure Component]";

@Component({
  selector: 'sb-time-periods-records-closure',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './time-periods-records-closure.component.html',
  styleUrls: ['time-periods-records-closure.component.scss'],
})
export class TimePeriodsRecordsClosureComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Time Period record
  @Input() public id!: number;

  // Broadcasts successful Times Periods updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Times Periods updation events together with their error plurals
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the target context
  public context: Context | null | undefined = null;

  // Holds the target Time Period
  public timePeriod: TimePeriod | null | undefined = null;

  // Holds the custom icon classes
  public iconClasses: string[] = ["text-danger"];

  // Keeps tabs of whether the component has been initialised
  public initialised: boolean = false;


  constructor(
    public timePeriodsDataService: TimePeriodsDataService,
    public contextsDataService: ContextsDataService,
    public dataFormsResponsesDataService: DataFormsResponsesDataService,
    private cd: ChangeDetectorRef,
    private log: NGXLogger) {

  }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Time Period field based on the passed in id
    this.initialiseTimePeriod(() => {

      // Initialise the Context based on the time period
      this.initialiseContext(() => {

        // Mark Init as complete
        this.log.trace(`${LOG_PREFIX} Init completed`);
        this.initialised = true;
        this.cd.detectChanges();

      });

    });

  }



  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }

  /**
   * Retrieves the Time Period with the injected id and sets it as the Time Period that needs to be closed
   * @param callback The function to call when done
   */
  private initialiseTimePeriod(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseTimePeriod()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveTimePeriodRecord(this.id, (timePeriod: TimePeriod | null) => {

      // Set the target Time Period
      this.log.trace(`${LOG_PREFIX} Setting the target Time Period`);
      this.timePeriod = timePeriod;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }

  /**
   * Retrieves the Context of the injected time period
   * @param callback The function to call when done
   */
  private initialiseContext(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseContext()`);

    // Check if the context id was specified in the time period
    this.log.trace(`${LOG_PREFIX} Checking if the context id was specified in the time period`);
    if (this.timePeriod?.data.contextId) {

      // The context id was specified in the time period
      this.log.trace(`${LOG_PREFIX} The context id was specified in the time period`);

      this.retrieveContextRecord(this.timePeriod?.data.contextId, (context: Context | null) => {

        // Set the target Context
        this.log.trace(`${LOG_PREFIX} Setting the target Context`);
        this.context = context;

        // Return
        this.log.trace(`${LOG_PREFIX} Returning`);
        callback();

      });
    } else {

      // The context id was not specified in the time period
      this.log.trace(`${LOG_PREFIX} The context id was not specified in the time period`);

      // Set the target Context to null
      this.log.warn(`${LOG_PREFIX} Setting the target Context to null`);
      this.context = null;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();
    }



  }

  /**
     * Retrieves a TimePeriod record given its unique identifier synchronously
     * @param id The unique identifier of the TimePeriod
     * @param callback The function to call when done
     */
  private retrieveTimePeriodRecord(id: number | null | undefined, callback: (timePeriod: TimePeriod | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveTimePeriodRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the TimePeriod Id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the TimePeriod Id has been specified`);
    if (id) {

        // The TimePeriod Id has been specified
        this.log.trace(`${LOG_PREFIX} The TimePeriod Id has been specified`);
        this.log.debug(`${LOG_PREFIX} TimePeriod Id = ${JSON.stringify(id)}`);

        // Try retrieving a TimePeriod Record with the passed in id
        this.log.trace(`${LOG_PREFIX} Trying to retrieve a TimePeriod Record with the passed in id`);
        this.timePeriodsDataService
            .getTimePeriods(false, {
                page: null,
                pageSize: null,
                searchTerm: null,
                sortColumn: null,
                sortDirection: null,
                contextId: null,
                open: null,
                id: id
            })
            .subscribe({
                next: (timePeriods: TimePeriod[]) => {

                    // Check if a TimePeriod record with the given id was found
                    this.log.trace(`${LOG_PREFIX} Checking if a TimePeriod record with the given id was found`);
                    if (timePeriods.length > 0) {

                        //A TimePeriod record with the given id was found
                        this.log.trace(`${LOG_PREFIX} A TimePeriod record with the given id was found`);

                        // Return the TimePeriod record
                        this.log.trace(`${LOG_PREFIX} Returning the TimePeriod record`);
                        callback(timePeriods[0]);


                    } else {

                        //A TimePeriod record with the given id was not found
                        this.log.trace(`${LOG_PREFIX} A TimePeriod record with the given id was not found`);

                        // Return null
                        this.log.warn(`${LOG_PREFIX} Return null`);
                        callback(null);

                    }
                }
            });


    } else {

        // The TimePeriod Id has not been specified
        this.log.error(`${LOG_PREFIX} The TimePeriod Id has not been specified`);

        // Return null
        this.log.warn(`${LOG_PREFIX} Return null`);
        callback(null);

    }
}


  /**
     * Retrieves an Context record given its unique identifier synchronously
     * @param id The unique identifier of the Context
     * @param callback The function to call when done
     */
  private retrieveContextRecord(id: number | null | undefined, callback: (context: Context | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveContextRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the Context Id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the Context Id has been specified`);
    if (id) {

        // The Context Id has been specified
        this.log.trace(`${LOG_PREFIX} The Context Id has been specified`);
        this.log.debug(`${LOG_PREFIX} Context Id = ${JSON.stringify(id)}`);

        // Try retrieving an Context Record with the passed in id
        this.log.trace(`${LOG_PREFIX} Trying to retrieve an Context Record with the passed in id`);
        this.contextsDataService
            .getContexts(false, {
                page: null,
                pageSize: null,
                searchTerm: null,
                sortColumn: null,
                sortDirection: null,
                abbreviation: null,
                name: null,
                ids: [id]
            })
            .subscribe({
                next: (contexts: Context[]) => {

                    // Check if an Context record with the given id was found
                    this.log.trace(`${LOG_PREFIX} Checking if an Context record with the given id was found`);
                    if (contexts.length > 0) {

                        //An Context record with the given id was found
                        this.log.trace(`${LOG_PREFIX} An Context record with the given id was found`);

                        // Return the Context record
                        this.log.trace(`${LOG_PREFIX} Returning the Context record`);
                        callback(contexts[0]);


                    } else {

                        //An Context record with the given id was not found
                        this.log.trace(`${LOG_PREFIX} An Context record with the given id was not found`);

                        // Return null
                        this.log.warn(`${LOG_PREFIX} Return null`);
                        callback(null);

                    }
                }
            });


    } else {

        // The Context Id has not been specified
        this.log.error(`${LOG_PREFIX} The Context Id has not been specified`);

        // Return null
        this.log.warn(`${LOG_PREFIX} Return null`);
        callback(null);

    }
}


  /**
   * Takes in a time period object and returns a presentable string version of its period
   * @param timePeriod the time period
   * @returns The presentable string version of the time period
   */
  public getFormattedTimePeriod(): string | null {

    if (this.timePeriod && this.timePeriod.data.start && this.timePeriod.data.end) {

      switch (this.timePeriod.data.typeId) {

        case 1: //Daily

          return moment(this.timePeriod.data.start, "YYYY-MM-DD").format("MMMM Do YYYY");

        default:

          return `${moment(this.timePeriod.data.start, "YYYY-MM-DD").format("MMMM Do YYYY")} - ${moment(this.timePeriod.data.end, "YYYY-MM-DD").format("MMMM Do YYYY")}`;

      }

    } else {
      return null;
    }
  }


  /**
   * Deletes Time Period Records.
   * Emits an succeeded or failed event indicating whether or not the saving exercise was successful.
   * Error 500 = Indicates something unexpected happened at the server side
   */
  public close(): void {

    this.log.trace(`${LOG_PREFIX} Entering close()`);

    // Check if the target Time Period / Context records have been successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Time Period / Context records have been successfully initialised`);
    if (this.timePeriod && this.context) {

      // The target Time Period / Context records have been successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Time Period / Context records have been successfully initialised`);

      // Get the next time period
      this.log.trace(`${LOG_PREFIX} Getting the next time period`);
      const nextTimePeriod: TimePeriod | null = this.timePeriodsDataService.getNextTimePeriod(this.timePeriod, this.context);

      // Check if the next Time Period record was successfully initialised
      this.log.trace(`${LOG_PREFIX} Checking if the next Time Period record was successfully initialised()`);

      if (nextTimePeriod) {

        // The next Time Period record was successfully initialised
        this.log.trace(`${LOG_PREFIX} The next Time Period record was successfully initialised()`);

        // Close the current time period
        this.log.trace(`${LOG_PREFIX} Closing the current Time Period Record`);
        this.closeCurrentTimePeriod(this.timePeriod, (closedTimePeriod: TimePeriod) => {

          // Open the next time period
          this.log.trace(`${LOG_PREFIX} Opening the next Time Period Record`);
          this.openNextTimePeriod(nextTimePeriod, (openedTimePeriod: TimePeriod) => {

            // Check if the response mode is cumulative
            this.log.trace(`${LOG_PREFIX} Checking if the response mode is cumulative`);
            if (environment.response.cumulative) {

              // The response mode is cumulative
              this.log.trace(`${LOG_PREFIX} The response mode is cumulative`);

              // Retrieve the closed time period's data form responses
              this.log.trace(`${LOG_PREFIX} Retrieving the closed time period's data form responses`);
              this.retrieveClosedTimePeriodDataFormResponses(closedTimePeriod, (dataFormResponses: DataFormResponse[]) => {

                // Clone the closed time period's data form responses if found
                this.log.trace(`${LOG_PREFIX} Cloning the closed time period's data form responses if found`);
                if (dataFormResponses.length > 0) {

                  this.cloneDataFormResponsesIntoTheOpenedTimePeriod(openedTimePeriod, dataFormResponses, () => {

                    // Emit a 'succeeded' event
                    this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
                    this.succeeded.emit();

                  })

                } else {

                  // Emit a 'succeeded' event
                  this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
                  this.succeeded.emit();
                }

              })

            } else {

              // The response mode is not cumulative
              this.log.trace(`${LOG_PREFIX} The response mode is not cumulative`);

              // Emit a 'succeeded' event
              this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
              this.succeeded.emit();

            }

          })

        })



      } else {

        // The next Time Period record was not successfully initialised
        this.log.trace(`${LOG_PREFIX} The next Time Period record was not successfully initialised()`);

        // Emit an 'invalid' event
        this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
        this.failed.emit(500);

      }

    } else {

      // The target Time Period / Context records have not been successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Time Period / Context records have not been successfully initialised`);

      // Emit an 'invalid' event
      this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
      this.failed.emit(500);

    }



  }


  /**
   * Deletes Time Period Records.
   * Emits an succeeded or failed event indicating whether or not the saving exercise was successful.
   * Error 500 = Indicates something unexpected happened at the server side
   */
  public closeOrig(): void {

    this.log.trace(`${LOG_PREFIX} Entering close()`);

    // Check if the target Time Period / Context records have been successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Time Period / Context records have been successfully initialised`);
    if (this.timePeriod && this.context) {

      // The target Time Period / Context records have been successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Time Period / Context records have been successfully initialised`);

      // Get the next time period
      this.log.trace(`${LOG_PREFIX} Getting the next time period`);
      const nextTimePeriod: TimePeriod | null = this.timePeriodsDataService.getNextTimePeriod(this.timePeriod, this.context);

      // Check if the next Time Period record was successfully initialised
      this.log.trace(`${LOG_PREFIX} Checking if the next Time Period record was successfully initialised()`);

      if (nextTimePeriod) {

        // The next Time Period record was successfully initialised
        this.log.trace(`${LOG_PREFIX} The next Time Period record was successfully initialised()`);

        // Close the current time period
        this.log.trace(`${LOG_PREFIX} Closing the current Time Period Record`);
        this.timePeriod.data.open = false;
        this.timePeriodsDataService
          .updateTimePeriod(this.timePeriod)
          .subscribe({
            next: () => {

              // The current Time Period Record was closed successfully
              this.log.trace(`${LOG_PREFIX} The current Time Period Record was closed successfuly`);

              this.timePeriodsDataService
                .createTimePeriod(nextTimePeriod)
                .subscribe({
                  next: () => {

                    // The next Time Period Record was opened successfully
                    this.log.trace(`${LOG_PREFIX} The next Time Period Record was opened successfuly`);

                    // Emit a 'succeeded' event
                    this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
                    this.succeeded.emit();
                  },
                  error: (error: any) => {

                    // The current Time Period Record was not successfully
                    this.log.trace(`${LOG_PREFIX} Current Time Period Record was not closed successfuly`);

                    // Emit a 'failed' event
                    this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
                    this.failed.emit(500);
                  }
                });

            },
            error: (error: any) => {

              // The current Time Period Record was not successfully
              this.log.trace(`${LOG_PREFIX} Current Time Period Record was not closed successfuly`);

              // Emit a 'failed' event
              this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
              this.failed.emit(500);
            }
          });



      } else {

        // The next Time Period record was not successfully initialised
        this.log.trace(`${LOG_PREFIX} The next Time Period record was not successfully initialised()`);

        // Emit an 'invalid' event
        this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
        this.failed.emit(500);

      }

    } else {

      // The target Time Period / Context records have not been successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Time Period / Context records have not been successfully initialised`);

      // Emit an 'invalid' event
      this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
      this.failed.emit(500);

    }



  }

  private closeCurrentTimePeriod(outgoingTimePeriod: TimePeriod, callback: (closedTimePeriod: TimePeriod) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering closeCurrentTimePeriod()`);

    outgoingTimePeriod.data.open = false;

    this.timePeriodsDataService
      .updateTimePeriod(outgoingTimePeriod)
      .subscribe({
        next: (result: TimePeriod) => {

          // The current Time Period Record was closed successfully
          this.log.trace(`${LOG_PREFIX} Current Time Period Record was closed successfuly`);

          // Return
          this.log.warn(`${LOG_PREFIX} Returning`);
          callback(result);

        },
        error: (error: any) => {

          // The current Time Period Record was not closed successfully
          this.log.trace(`${LOG_PREFIX} Current Time Period Record was not closed successfuly`);

          // Emit a 'failed' event
          this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
          this.failed.emit(500);
        }
      });

  }


  private openNextTimePeriod(incomingTimePeriod: TimePeriod, callback: (openedTimePeriod: TimePeriod) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering createNextTimePeriod()`);

    this.timePeriodsDataService
      .createTimePeriod(incomingTimePeriod)
      .subscribe({
        next: (result: TimePeriod) => {

          // The next Time Period Record was opened successfully
          this.log.trace(`${LOG_PREFIX} The next Time Period Record was opened successfuly`);

          // Return
          this.log.warn(`${LOG_PREFIX} Returning`);
          callback(result);
        },
        error: (error: any) => {

          // The current Time Period Record was not successfully
          this.log.trace(`${LOG_PREFIX} Current Time Period Record was not closed successfuly`);

          // Emit a 'failed' event
          this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
          this.failed.emit(500);
        }
      });

  }



  private retrieveClosedTimePeriodDataFormResponses(closedTimePeriod: TimePeriod, callback: (closedTimePeriodDataFormResponses: DataFormResponse[]) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveClosedTimePeriodResponses()`);

    this.dataFormsResponsesDataService
      .getDataFormsResponses(false, {
        searchTerm: null,
        page: null,
        pageSize: null,
        sortColumn: null,
        sortDirection: null,
        timePeriodId: closedTimePeriod.id,
        formId: null,
        locationId: null,
        organisationId: null,
        entityId: null,
        respondentTypeId: null,
        respondentId: null,
        respondentName: null,
        statusIds: null
      })
      .subscribe({
        next: (result: DataFormResponse[]) => {

          // The closed Time Period's responses were retrieved successfully
          this.log.trace(`${LOG_PREFIX} The closed Time Period's responses were retrieved successfully`);

          // Return
          this.log.warn(`${LOG_PREFIX} Returning`);
          callback(result);
        },
        error: (error: any) => {

          // The closed Time Period's responses were not retrieved successfully
          this.log.trace(`${LOG_PREFIX} The closed Time Period's responses were not retrieved successfully`);

          // Emit a 'failed' event
          this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
          this.failed.emit(500);
        }
      });

  }


  private cloneDataFormResponsesIntoTheOpenedTimePeriod(openedTimePeriod: TimePeriod, closedTimePeriodDataFormResponses: DataFormResponse[], callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveClosedTimePeriodResponses()`);

    const clonedTimePeriodDataFormResponses: DataFormResponse[] = closedTimePeriodDataFormResponses.filter(c => c.data.ongoing).map((response) => {
      const clonedResponse = JSON.parse(JSON.stringify(response));

      // Modify the attributes you want to change
      clonedResponse.id = null;
      clonedResponse.data.timePeriodId = openedTimePeriod.id;
      clonedResponse.data.date = new Date();
      clonedResponse.data.status = {
        "id": 1,
        "name": "Draft"
      };

      return clonedResponse;
    });

    this.dataFormsResponsesDataService
      .createDataFormResponses(clonedTimePeriodDataFormResponses)
      .subscribe({
        next: (result: DataFormResponse[]) => {

          // The closed Time Period's responses were cloned successfully
          this.log.trace(`${LOG_PREFIX} The closed Time Period's responses were cloned successfully`);

          // Return
          this.log.warn(`${LOG_PREFIX} Returning`);
          callback();
        },
        error: (error: any) => {

          // The closed Time Period's responses were not cloned successfully
          this.log.trace(`${LOG_PREFIX} The closed Time Period's responses were not cloned successfully`);

          // Emit a 'failed' event
          this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
          this.failed.emit(500);
        }
      });

  }



}
