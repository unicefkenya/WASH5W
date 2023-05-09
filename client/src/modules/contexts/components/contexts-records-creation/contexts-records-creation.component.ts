import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Context } from '@modules/contexts/models/context.model';
import { ContextsDataService } from '@modules/contexts/services/contexts-data.service';
import { Timestep } from '@modules/timesteps/models/timestep.model';
import { TimestepsDataService } from '@modules/timesteps/services/timesteps-data.service';
import { NGXLogger } from 'ngx-logger';
import { map } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { of } from 'rxjs/internal/observable/of';
import { formatDate } from '@angular/common';
import { TimePeriodsDataService } from '@modules/time-periods/services/time-periods-data.service';
import { TimePeriod } from '@modules/time-periods/models/time-period.model';
import moment from 'moment';

const LOG_PREFIX: string = "[Contexts Records Creation Component]";

@Component({
  selector: 'sb-contexts-records-creation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contexts-records-creation.component.html',
  styleUrls: ['contexts-records-creation.component.scss'],
})
export class ContextsRecordsCreationComponent implements OnInit, OnDestroy {

  // Broadcasts successful Contexts creation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Contexts creation events together with their error abbreviations
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Init the default start date
  public startDate: Date = new Date(Date.now());

  // Keeps tabs of the selected timestep
  private timestep: { id: number | null | undefined; name: string | null | undefined } | null | undefined = null;

  // Defines Contexts reactive form controls group
  public contextsForm = new FormGroup({

    abbreviation: new FormControl<string | null>('',
      [Validators.required, Validators.minLength(2), Validators.maxLength(250)],
      [this.abbreviationExists()]),

    name: new FormControl<string | null>('',
      [Validators.required, Validators.minLength(2), Validators.maxLength(250)],
      [this.nameExists()]),

    timestep: new FormControl<number | null>(null,
      [Validators.required]),

    startDate: new FormControl<string>(formatDate(this.startDate, 'yyyy-MM-dd', 'en'), [Validators.required]),

    description: new FormControl<string | null>('',
      [Validators.maxLength(500)])
  });


  constructor(
    public contextsDataService: ContextsDataService,
    public timestepsDataService: TimestepsDataService,
    public timePeriodsDataService: TimePeriodsDataService,
    private log: NGXLogger) {

  }


  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Mark Init as complete
    this.log.trace(`${LOG_PREFIX} Init completed`);

  }


  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }

  /**
   * Keep tabs of timestep selection events and updates the local selected timestep field
   * @param selectedTimestep The selected timestep
   */
  public onTimestepChange() {

    this.log.trace(`${LOG_PREFIX} Entering onTimestepChange()`);

    // Read in the selected timestep
    this.log.trace(`${LOG_PREFIX} Reading in the selected timestep`);
    const timestepId: number | null | undefined = this.contextsForm.get('timestep')?.value;
    this.log.debug(`${LOG_PREFIX} Timestep Id = ${timestepId}`);

    // Retrieve the timestep with the selected id
    this.log.trace(`${LOG_PREFIX} Retrieving the timestep with the selected id`);
    if (timestepId) {

      this.timestepsDataService.getTimestepById$(timestepId).subscribe({
        next: (selectedTimestep: Timestep) => {
          this.timestep = {
            id: selectedTimestep.id,
            name: selectedTimestep.data.name
          }
        }
      })
    } else {
      this.timestep = null;
    }

  }


  /**
   * Internal validator that checks whether a proposed Context's abbreviation already exists
   * @returns 
   */
  private abbreviationExists(): AsyncValidatorFn {

    this.log.trace(`${LOG_PREFIX} Entering abbreviationExists()`);

    return (control: AbstractControl): Observable<ValidationErrors | null> => {

      // Check if an abbreviation value has been provided
      this.log.trace(`${LOG_PREFIX} Check if an abbreviation value has been provided`);
      if (control.value) {

        // An abbreviation value has been provided
        this.log.trace(`${LOG_PREFIX} An abbreviation value has been provided`);

        // Attempt retrieving Contexts with the same abbreviation
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve Contexts with the same abbreviation`);
        return this.contextsDataService
          .getContexts(false, {
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            ids: null,
            abbreviation: control.value,
            name: null
          })
          .pipe(
            map((contexts: Context[]) => {

              // Check if a Context record with the same abbreviation was found
              this.log.trace(`${LOG_PREFIX} Checking if a Context record with the same abbreviation was found`);
              if (contexts.length > 0) {

                // A Context record with the same abbreviation was found
                this.log.trace(`${LOG_PREFIX} A Context record with the same abbreviation was found`);

                // Mark 'abbreviation exists' as true
                this.log.trace(`${LOG_PREFIX} Marking 'abbreviation exists' as true`);
                return { 'exists': true };

              } else {

                // A Context record with the same abbreviation was not found
                this.log.trace(`${LOG_PREFIX} A Context record with the same abbreviation was not found`);

                // Mark 'abbreviation exists' as false
                this.log.trace(`${LOG_PREFIX} Marking 'abbreviation exists' as false`);
                return null;

              }
            }

            )
          )

      } else {

        // An abbreviation value has not been provided
        this.log.trace(`${LOG_PREFIX} An abbreviation value has not been provided`);

        // Mark 'abbreviation exists' as false
        this.log.trace(`${LOG_PREFIX} Marking 'abbreviation exists' as false`);
        return of(null);
      }

    };

  }

  /**
   * Internal validator that checks whether a proposed Context's name already exists
   * @returns 
   */
  private nameExists(): AsyncValidatorFn {

    this.log.trace(`${LOG_PREFIX} Entering nameExists()`);

    return (control: AbstractControl): Observable<ValidationErrors | null> => {

      // Check if a name value has been provided
      this.log.trace(`${LOG_PREFIX} Check if a name value has been provided`);
      if (control.value) {

        // A name value has been provided
        this.log.trace(`${LOG_PREFIX} A name value has been provided`);

        // Attempt retrieving Contexts with the same name
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve Contexts with the same name`);
        return this.contextsDataService
          .getContexts(false, {
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            ids: null,
            abbreviation: null,
            name: control.value.trim()
          })
          .pipe(
            map((contexts: Context[]) => {

              // Check if a Context record with the same name was found
              this.log.trace(`${LOG_PREFIX} Checking if a Context record with the same name was found`);
              if (contexts.length > 0) {

                // A Context record with the same name was found
                this.log.trace(`${LOG_PREFIX} A Context record with the same name was found`);

                // Mark 'name exists' as true
                this.log.trace(`${LOG_PREFIX} Marking 'name exists' as true`);
                return { 'exists': true };

              } else {

                // A Context record with the same name was not found
                this.log.trace(`${LOG_PREFIX} A Context record with the same name was not found`);

                // Mark 'name exists' as false
                this.log.trace(`${LOG_PREFIX} Marking 'name exists' as false`);
                return null;

              }
            }

            )
          )

      } else {

        // A name value has not been provided
        this.log.trace(`${LOG_PREFIX} A name value has not been provided`);

        // Mark 'name exists' as false
        this.log.trace(`${LOG_PREFIX} Marking 'name exists' as false`);
        return of(null);
      }

    };

  }



  /**
   * Validates and saves a new Context Record.
   * Emits a succeeded or failed event depending on whether the save request succeeded or failed respectively
   * Error 400 = Indicates that a user error was encountered
   * Error 500 = Indicates that a system error was encountered
   */
  public save(): void {

    this.log.trace(`${LOG_PREFIX} Entering save()`);

    // Check if the data entry form is valid
    this.log.trace(`${LOG_PREFIX} Checking if the data entry form is valid`);
    if (this.contextsForm.valid) {

      // The data entry form is valid
      this.log.trace(`${LOG_PREFIX} The data entry form is valid`);

      // Read in the provided abbreviation
      this.log.trace(`${LOG_PREFIX} Reading in the provided abbreviation`);
      const abbreviation: string | null | undefined = this.contextsForm.get('abbreviation')?.value?.trim();
      this.log.debug(`${LOG_PREFIX} Context Abbreviation = ${abbreviation}`);

      // Read in the provided name
      this.log.trace(`${LOG_PREFIX} Reading in the provided name`);
      const name: string | null | undefined = this.contextsForm.get('name')?.value?.trim();
      this.log.debug(`${LOG_PREFIX} Context Name = ${name}`);

      // Read in the provided start date
      this.log.trace(`${LOG_PREFIX} Reading in the provided start date`);
      const startDate: string | null | undefined = this.contextsForm.get('startDate')?.value?.trim();
      this.log.debug(`${LOG_PREFIX} Context Start Date = ${startDate}`);

      // Read in the provided description
      this.log.trace(`${LOG_PREFIX} Reading in the provided description`);
      const description: string | null | undefined = this.contextsForm.get('description')?.value?.trim();
      this.log.debug(`${LOG_PREFIX} Context Description = ${description}`);

      // Save the record
      this.log.trace(`${LOG_PREFIX} Saving the Context Record`);
      this.contextsDataService
        .createContext(new Context({ data: { abbreviation, name, description, schemeId: 1, timestep: this.timestep}, version: null }))
        .subscribe({
          next: (response: Context) => {

            // The Context Record was saved successfully
            this.log.trace(`${LOG_PREFIX} Context Record was saved successfuly`);

            // Get the context's initial time period
            this.log.trace(`${LOG_PREFIX} Get the context's initial time period`);
            const initialTimePeriod: TimePeriod | null = this.timePeriodsDataService.getNextTimePeriod(
              new TimePeriod({
                id: null,
                data: {
                  contextId: response.id,
                  typeId: response.data.timestep?.id,
                  start: (moment(startDate, "YYYY-MM-DD").subtract('1', 'day')).format(),
                  end: (moment(startDate, "YYYY-MM-DD").subtract('1', 'day')).format(),
                  open: true
                },
                version: null
              }), response);

            // Check if the initial time period was successfully retrieved
            this.log.trace(`${LOG_PREFIX} Checking if the initial time period was successfully retrieved`);
            if (initialTimePeriod) {

              // The initial time period was successfully retrieved
              this.log.trace(`${LOG_PREFIX} The initial time period was successfully retrieved`);

              // Save the initial time period
              this.log.trace(`${LOG_PREFIX} Saving the initial time period`);
              this.timePeriodsDataService.createTimePeriod(initialTimePeriod).subscribe({
                next: (value: TimePeriod) => {

                  // The Context's Initial Time Period was saved successfully
                  this.log.trace(`${LOG_PREFIX} Context's Initial Time Period Record was saved successfuly`);


                  // Reset the form
                  this.log.trace(`${LOG_PREFIX} Resetting the form`);
                  this.contextsForm.reset();

                  // Emit a 'succeeded' event
                  this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
                  this.succeeded.emit();

                },
                error: (error: any) => {

                  // The Context's Initial Time Period was not saved successfully
                  this.log.trace(`${LOG_PREFIX} Context's Initial Time Period Record was not saved successfuly`);

                  // Emit a 'failed' event
                  this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
                  this.failed.emit(500);
                }
              })

            } else {

              // The initial time period was not successfully retrieved
              this.log.warn(`${LOG_PREFIX} Context's Initial Time Period was not successfully retrieved`);

              // Emit a 'failed' event
              this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
              this.failed.emit(500);

            }


          },
          error: (error: any) => {

            // The Context Record was not saved successfully
            this.log.trace(`${LOG_PREFIX} Context Record was not saved successfuly`);

            // Emit a 'failed' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
            this.failed.emit(500);
          }
        });
    } else {

      // The data entry form is invalid
      this.log.trace(`${LOG_PREFIX} The data entry form is invalid`);

      // Run the form fields validation request to validate all fields and display the error message(s)
      this.log.trace(`${LOG_PREFIX} Running the form fields validation request to validate all fields and display the error message(s)`);
      this.validateAllFormFields(this.contextsForm);

      // Emit an 'invalid' event
      this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
      this.failed.emit(400);
    }
  }

  /**
   * See: https://loiane.com/2017/08/angular-reactive-forms-trigger-validation-on-submit
   * @param formGroup 
   */
  private validateAllFormFields(formGroup: FormGroup): void {

    this.log.trace(`${LOG_PREFIX} Entering validateAllFormFields()`);

    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }


}
