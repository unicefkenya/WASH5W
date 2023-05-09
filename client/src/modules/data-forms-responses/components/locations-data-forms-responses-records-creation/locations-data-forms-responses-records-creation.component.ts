import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { FilterService } from '@app/app-filter.service';
import { DateUtilService } from '@common/services/date-util.service';
import { TextUtilService } from '@common/services/text-util.service';
import { AdministrativeHierarchy } from '@modules/administrative-hierarchies/models/administrative-hierarchy.model';
import { DataFormResponse } from '@modules/data-forms-responses/models/data-form-response.model';
import { DataFormsResponsesDataService } from '@modules/data-forms-responses/services/data-forms-responses-data.service';
import { DataFormResponsesInitialisationNotificationService } from '@modules/data-forms-responses/services/data-forms-responses-initialisation-message.service';
import { SystemUserRight } from '@modules/systems-users-rights/models/system-user-right.model';
import { NGXLogger } from 'ngx-logger';
import { timer } from 'rxjs';

const LOG_PREFIX: string = "[Locations Data Form Responses Records Creation Component]";

@Component({
  selector: 'sb-locations-data-forms-responses-records-creation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './locations-data-forms-responses-records-creation.component.html',
  styleUrls: ['locations-data-forms-responses-records-creation.component.scss'],
})
export class LocationsDataFormsResponsesRecordsCreationComponent implements OnInit, OnDestroy {

  // Broadcasts selector windows open events
  @Output() public openedLocationSelector: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts selector windows close events
  @Output() public closedLocationSelector: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts successful Entities creation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Entities creation events together with their error codes
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Keeps tabs of the currently visible content
  public page: string = "default";

  // Keeps tabs of the errors
  public errors: Map<string, string> = new Map();

  // Defines Data Form Responses reactive form controls group
  responsesForm = new FormGroup({

    location: new FormGroup({
      locationId: new FormControl<number | null | undefined>(null, this.locationIsValid()),
      locationName: new FormControl<string | null | undefined>("Choose Location")
    })

  });

  // Keep tabs of the selected Administrative Unit & its parentage
  private location: { id: number | null | undefined; name: string | null | undefined; }[] | null | undefined = null;

  // Keeps tabs of whether the component has been successfully initialised
  public initialised: boolean = false;

  constructor(
    public dateUtilService: DateUtilService,
    public textUtilService: TextUtilService,
    public dataFormsResponsesDataService: DataFormsResponsesDataService,
    public filterService: FilterService,
    public dataFormResponsesInitialisationNotificationService: DataFormResponsesInitialisationNotificationService,
    private cd: ChangeDetectorRef,
    private log: NGXLogger) {

  }


  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Mark Init as complete
    this.log.trace(`${LOG_PREFIX} Init completed`);
    this.initialised = true;



  }



  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy`);

  }


  /**
   * Closes the Entity Locations Selector
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
   * @param hierarchies the selected location - & its parents
   */
  onSelectAdministrativeHierarchyElement(hierarchies: AdministrativeHierarchy[]) {

    // 1. Capture the selected location and its parent locations
    this.log.trace(`${LOG_PREFIX} Capturing the selected location and its parent locations`);

    // 1.1 Collate the selected location and its parent locations
    this.location = [];
    for (let hierarchy of hierarchies) {
      if (hierarchy.data.responsible?.id) {
        this.location.push({ id: hierarchy.data.responsible.id, name: hierarchy.data.responsible.name });
      }
    }

    // 1.2. Append the parents of the user's assigned location to the collated locations
    const right: SystemUserRight | undefined = this.getSystemUserRight();

    if (right?.data.location?.accountabilities) {
      for (let hierarchy of right.data.location.accountabilities) {
        if (hierarchy.data.responsible?.id) {
          const parentLocation: { id: number | null | undefined; name: string | null | undefined; } = { id: hierarchy.data.responsible.id, name: hierarchy.data.responsible.name };
          if (!(this.location.find(obj => obj.id === parentLocation.id))) {
            this.location.push(parentLocation);
          }
        }
      }
    }

    // Get the actual selected location
    this.log.trace(`${LOG_PREFIX} Getting the actual selected location`);
    const administrativeHierarchy: AdministrativeHierarchy = hierarchies[0];

    // Update the form
    this.log.trace(`${LOG_PREFIX} Updating the form`);
    this.responsesForm.get('location.locationId')?.setValue((administrativeHierarchy && administrativeHierarchy.data.responsible?.id) ? administrativeHierarchy.data.responsible.id : null);
    this.responsesForm.get('location.locationName')?.setValue((administrativeHierarchy && administrativeHierarchy.data.responsible?.name) ? this.textUtilService.truncate(administrativeHierarchy.data.responsible.name, [35, "..."]) : null);

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
      * Retrieves the logged in user's rights in the current context
      * @returns the user's right
      */
  private getSystemUserRight(): SystemUserRight | undefined {

    let right: SystemUserRight | undefined = undefined;

    // Check if the active user has been properly set
    this.log.trace(`${LOG_PREFIX} Checking if the active user has been properly set`);
    if (this.filterService.filter.activeSystemUser && this.filterService.filter.activeSystemUser.data.rights) {

      // The active user has been properly set
      this.log.trace(`${LOG_PREFIX} The active user has been properly set`);

      // Check if the active user's rights have been set
      this.log.trace(`${LOG_PREFIX} Checking if the active user's rights have been set`);
      if (this.filterService.filter.activeSystemUser.data.rights.length > 0) {

        // The active user's right have been set
        this.log.trace(`${LOG_PREFIX} The active user's right have been set`);

        // Check if the active context has been set
        this.log.trace(`${LOG_PREFIX} Checking if the active context has been set`);
        if (this.filterService.filter.activeContext) {

          // The active context has been set
          this.log.trace(`${LOG_PREFIX} The active context has been set`);

          // Try retrieving the user's right in the active context
          this.log.trace(`${LOG_PREFIX} Trying to retrieve the user's right in the active context`);
          right = this.filterService.filter.activeSystemUser.data.rights.find(r => r.data.context?.id == this.filterService.filter.activeContext?.id);


        }
      }
    }

    // Return the user right
    this.log.trace(`${LOG_PREFIX} Returning the user right`);
    return right;
  }


  /**
   * Validates and saves a new Entities Record.
   * Emits a succeeded or failed event depending on whether the save request succeeded or failed respectively
   * Error 400 = Indicates that a user error was encountered
   * Error 500 = Indicates that a system error was encountered
   */
  public save(): void {

    this.log.trace(`${LOG_PREFIX} Entering save()`);

    // Check if the data entry form is valid
    this.log.trace(`${LOG_PREFIX} Checking if the data entry form is valid`);
    if (this.responsesForm.valid) {

      // The data entry form is valid
      this.log.trace(`${LOG_PREFIX} The data entry form is valid`);

      // Read in the provided Entity Location Id
      this.log.trace(`${LOG_PREFIX} Reading in the provided Entity Location Id`);
      const locationId: number | null | undefined = this.responsesForm.get('location.locationId')?.value;
      this.log.debug(`${LOG_PREFIX} Location Id = ${locationId}`);

      // Read in the provided Entity Location Name
      this.log.trace(`${LOG_PREFIX} Reading in the provided Entity Location Name`);
      const locationName: string | null | undefined = this.responsesForm.get('location.locationName')?.value;
      this.log.debug(`${LOG_PREFIX} Location Name = ${locationName}`);

      // Save the record
      this.log.trace(`${LOG_PREFIX} Saving the Data Form Response Record`);
      this.dataFormsResponsesDataService
        .createDataFormResponse(
          new DataFormResponse({
            data: {
              contextId: this.filterService.filter.activeContext?.id,
              timePeriodId: this.filterService.filter.activeReportingPeriod?.id,
              timePointId: this.dateUtilService.getTimePointIdFromDate(new Date()),
              formId: this.filterService.filter.activeDataForm?.id,
              location: this.location,
              organisations: null,
              entity: null,
              respondent: {
                "id": this.filterService.filter.activeSystemUser?.id,
                "name": this.filterService.filter.activeSystemUser?.data.name,
                "email": this.filterService.filter.activeSystemUser?.data.email
              },
              responses: [],
              status: {
                "id": 1,
                "name": "Draft"
              },
              ongoing: true
            },
            version: null
          }))
        .subscribe({
          next: (response: DataFormResponse) => {

            // The Data Form Response Record was saved successfully
            this.log.trace(`${LOG_PREFIX} Data Form Response Record was saved successfuly`);

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();

            timer(950).subscribe(x => {

              // Notify interested parties
              this.dataFormResponsesInitialisationNotificationService.notify(response);

            })


          }
        });


    } else {

      // The data form response form is invalid
      this.log.trace(`${LOG_PREFIX} The data form response form is invalid`);

      // Validate the form fields
      this.log.trace(`${LOG_PREFIX} Validating the form fields`);
      this.validateAllFormFields(this.responsesForm);

      // Emit an 'invalid' event
      this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
      this.failed.emit(400);
    }

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
   * See: https://loiane.com/2017/08/angular-reactive-forms-trigger-validation-on-submit
   * @param formGroup 
   */
  private validateAllFormFields(formGroup: FormGroup): void {
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
