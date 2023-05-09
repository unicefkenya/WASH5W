import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { FilterService } from '@app/app-filter.service';
import { TextUtilService } from '@common/services/text-util.service';
import { AdministrativeHierarchy } from '@modules/administrative-hierarchies/models/administrative-hierarchy.model';
import { AdministrativeUnit } from '@modules/administrative-units/models/administrative-unit.model';
import { NGXLogger } from 'ngx-logger';
import { first } from 'rxjs';
import { QuantityObservation } from '@modules/quantities-observations/models/quantity-observation.model';
import { formatDate } from '@angular/common';
import { QuantitiesObservationsDataService } from '@modules/quantities-observations/services/quantities-observations-data.service';


const LOG_PREFIX: string = "[Quantities Observations Records Creation Component]";

@Component({
  selector: 'sb-quantities-observations-records-creation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './quantities-observations-records-creation.component.html',
  styleUrls: ['quantities-observations-records-creation.component.scss'],
})
export class QuantitiesObservationsRecordsCreationComponent implements OnInit, OnDestroy {

  // Allows the parent component to inject the unique identifier of the active time period
  @Input() public timePeriodId!: number | null;

  // Allows the parent component to inject the unique identifier of the target indicator
  @Input() public phenomenonTypeId!: number | null;

  // Allows the parent component to inject the unique identifier of the target indicator's unit of measure
  @Input() public unitId!: number | null;

  // Allows the parent component to inject the unique identifier of the target observation type e.g. target / actual
  @Input() public observationTypeId!: number | null;

  // Broadcasts successful QuantitiesObservations creation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed QuantitiesObservations creation events together with their error codes
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Broadcasts selector windows open events
  @Output() public openedLocationSelector: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts selector windows close events
  @Output() public closedLocationSelector: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts the successful created QuantitiesObservations when working in embedded modes
  @Output() public created: EventEmitter<QuantityObservation> = new EventEmitter<QuantityObservation>();

  // Init the default page
  public page: string = "default";

  // Init the default date
  public defaultDate: Date = new Date(Date.now());

  // Hold a reference to the previous quantity observation
  public previous: QuantityObservation | null | undefined;

  // Defines QuantitiesObservations reactive form controls group
  quantitiesObservationsForm = new FormGroup({

    date: new FormControl<string>(formatDate(this.defaultDate, 'yyyy-MM-dd', 'en'), [Validators.required]),

    location: new FormGroup({
      locationId: new FormControl<number | null | undefined>(null, this.locationIsValid()),
      locationName: new FormControl<string | null | undefined>("Choose Location")
    }),

    amount: new FormControl<number | null>(null,
      [Validators.required]),

  });

  // Keeps tabs of whether the component has been successfully initialised
  public initialised: boolean = false;


  constructor(
    public quantitiesObservationsDataService: QuantitiesObservationsDataService,
    public filterService: FilterService,
    public textUtilService: TextUtilService,
    private cd: ChangeDetectorRef,
    private log: NGXLogger) {

  }


  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the data tabulation form
    this.initialiseFormGroup(() => {

      // Mark Init as complete
      this.log.trace(`${LOG_PREFIX} Init completed`);
      this.initialised = true;
      this.cd.markForCheck();

    });

  }



  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy`);

  }


  /**
   * Presets default values in the data creation form
   * @param callback The function to call when done
   */
  private initialiseFormGroup(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseFormGroup()`);

    // Get the active administrative unit
    this.log.trace(`${LOG_PREFIX} Getting the active administrative unit`);
    const activeAdministrativeUnit: AdministrativeUnit | null | undefined = this.filterService.filter.activeAdministrativeUnit;
    this.log.debug(`${LOG_PREFIX} Active administrative unit = ${JSON.stringify(activeAdministrativeUnit)}`);

    // Preselect the active administrative unit
    this.log.trace(`${LOG_PREFIX} Preselecting the active administrative unit`);
    if (activeAdministrativeUnit) {
      this.quantitiesObservationsForm.get('location.locationId')?.setValue(activeAdministrativeUnit ? activeAdministrativeUnit.id : null);
      this.quantitiesObservationsForm.get('location.locationName')?.setValue(activeAdministrativeUnit ? activeAdministrativeUnit.data.name : "Choose location");
    }

    // Return
    this.log.trace(`${LOG_PREFIX} Returning`);
    callback();

  }


  /**
   * Retrieves the previous quantity observation record
   * @param callback The function to call when done
   */
  private getPreviousQuantityObservation(callback: (previousQuantityObservation: QuantityObservation | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering getPreviousQuantityObservation()`);

    if (this.getQuantityObservationLocationId() && this.phenomenonTypeId && this.observationTypeId) {

      this.quantitiesObservationsDataService
        .getQuantitiesObservations(false, {
          page: null,
          pageSize: 1,
          searchTerm: null,
          sortColumn: "id",
          sortDirection: "desc",
          partiesIds: [this.getQuantityObservationLocationId() as number],
          timePointId: null,
          timePointIdGTE: null,
          timePointIdLTE: null,
          timePeriodId: null,
          phenomenonTypesIds: [this.phenomenonTypeId],
          observationTypeId: this.observationTypeId
        })
        .pipe(first()) // This will automatically complete (and therefore unsubscribe) after the first value has been emitted.
        .subscribe({
          next: (observations: QuantityObservation[]) => {

            callback(observations.length > 0 ? observations[0] : null);
          },

          error: (err: any) => {

            callback(null);
          }
        });
    } else {
      callback(null);
    }

  }


  /**
   * Retrieves the id of the location of the quantityObservation
   * @returns the field id
   */
  public getQuantityObservationLocationId(): number | null | undefined {
    return this.quantitiesObservationsForm.get('location.locationId')?.value
  }

  /**
   * Get the selected quantityObservation location for preselection purposes
   * @returns 
   */
  public getSelectedLocations(): number[] {
    if (this.getQuantityObservationLocationId()) {
      return [this.getQuantityObservationLocationId() as number];
    } else {
      return [];
    }
  }


  private getDateFromDateString(dateString: string | null | undefined): Date | null {

    if (!dateString) {
      return null;
    }

    return new Date(dateString);
  }

  getTimePointIdFromDate(date: Date | null): number | null {

    if (date) {
      let year = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date);
      let month = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(date);
      let day = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date);

      return parseInt(`${year}${month}${day}`);

    } else {

      return null;
    }


  }

  /**
   * Closes the Quantity Observation Locations Selector
   */
  public closeLocationSelector(): void {

    this.log.trace(`${LOG_PREFIX} Entering closeLocationSelector()`);

    // Set the desired page to 'default'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'default'`);
    this.page = "default";

    // Emit a 'closedLocationSelector' event
    this.log.trace(`${LOG_PREFIX} Emitting a 'closedLocationSelector' event`);
    this.closedLocationSelector.emit();

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();
  }


  /**
   * Opens the Location Selector
   */
  public openLocationSelector(): void {

    this.log.trace(`${LOG_PREFIX} Entering openLocationSelector()`);

    // Set the desired page to 'locations'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'locations'`);
    this.page = "locations";

    // Emit an 'openedLocationSelector' event
    this.log.trace(`${LOG_PREFIX} Emitting an 'openedLocationSelector' event`);
    this.openedLocationSelector.emit();

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();
  }


  /**
   * Sets the selected location details and close the location selector
   * @param element Sets 
   */
  onSelectAdministrativeHierarchyElement(element: AdministrativeHierarchy) {

    // Update the form
    this.log.trace(`${LOG_PREFIX} Updating the form`);
    this.quantitiesObservationsForm.get('location.locationId')?.setValue((element && element.data.responsible?.id) ? element.data.responsible.id : null);
    this.quantitiesObservationsForm.get('location.locationName')?.setValue((element && element.data.responsible?.name) ? this.textUtilService.truncate(element.data.responsible.name, [35, "..."]) : null);

    // Set the desired page to 'default'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'default'`);
    this.page = "default";

    // Emit a 'closedLocationSelector' event
    this.log.trace(`${LOG_PREFIX} Emitting a 'closedLocationSelector' event`);
    this.closedLocationSelector.emit();

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();
  }

  /**
   * Internal validator that checks whether a location has been specified
   * @returns 
   */
  private locationIsValid(): ValidatorFn {


    return (control: AbstractControl): ValidationErrors | null => {

      if (control.value) {
        return null;
      } else {
        return { 'required': true }
      }


    }
  }


  /**
   * Validates and saves a new QuantitiesObservations Record.
   * Emits a succeeded or failed event depending on whether the save request succeeded or failed respectively
   * Error 400 = Indicates that a user error was encountered
   * Error 500 = Indicates that a system error was encountered
   */
  public save(): void {

    this.log.trace(`${LOG_PREFIX} Entering save()`);

    // Check if the data entry form is valid
    this.log.trace(`${LOG_PREFIX} Checking if the data entry form is valid`);
    if (this.quantitiesObservationsForm.valid) {

      // The data entry form is valid
      this.log.trace(`${LOG_PREFIX} The data entry form is valid`);

      // Read in the provided date
      this.log.trace(`${LOG_PREFIX} Reading in the provided date`);
      const date: string | null | undefined = this.quantitiesObservationsForm.get('date')?.value?.trim();
      this.log.debug(`${LOG_PREFIX} Date = ${date}`);

      // Read in the provided location
      this.log.trace(`${LOG_PREFIX} Reading in the provided location`);
      const locationId: number | null | undefined = this.quantitiesObservationsForm.get('location.locationId')?.value;
      this.log.debug(`${LOG_PREFIX} Location Id = ${locationId}`);

      // Read in the provided amount
      this.log.trace(`${LOG_PREFIX} Reading in the provided amount`);
      const amount: number = this.quantitiesObservationsForm.get('amount')?.value? this.quantitiesObservationsForm.get('amount')?.value as number : 0;
      this.log.debug(`${LOG_PREFIX} Amount = ${amount}`);

      this.getPreviousQuantityObservation((previous: QuantityObservation | null) => {

        // Save the record
        this.log.trace(`${LOG_PREFIX} Saving the Quantity Observation Record`);
        this.quantitiesObservationsDataService
          .createQuantityObservation(
            new QuantityObservation({
              data: {
                partyId: locationId,
                timePointId: this.getTimePointIdFromDate(this.getDateFromDateString(date)),
                timePeriodId: this.timePeriodId,
                phenomenonTypeId: this.phenomenonTypeId,
                observationTypeId: this.observationTypeId,
                unitId: this.unitId,
                amount: Number(amount),
                total: (previous && previous.data.total)? Number(previous.data.total) + Number(amount) : Number(amount)
              },
              version: null
            }))
          .subscribe({
            next: (response: QuantityObservation) => {

              // The Quantity Observation Record was saved successfully
              this.log.trace(`${LOG_PREFIX} Quantity Observation Record was saved successfuly`);

              // Emit a 'succeeded' event
              this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
              this.succeeded.emit();

            },
            error: (error: any) => {

              // The Quantity Observation Record was not saved successfully
              this.log.trace(`${LOG_PREFIX} Quantity Observation Record was not saved successfuly`);

              // Emit a 'failed' event
              this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
              this.failed.emit(500);
            }
          });
      })



    } else {

      // The data entry form is invalid
      this.log.trace(`${LOG_PREFIX} The data entry form is invalid`);

      // Run the form fields validation request to validate all fields and display the error message(s)
      this.log.trace(`${LOG_PREFIX} Running the form fields validation request to validate all fields and display the error message(s)`);
      this.validateAllFormFields(this.quantitiesObservationsForm);

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
