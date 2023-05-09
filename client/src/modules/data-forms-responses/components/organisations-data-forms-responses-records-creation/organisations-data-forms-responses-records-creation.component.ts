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
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { FilterService } from '@app/app-filter.service';
import { DateUtilService } from '@common/services/date-util.service';
import { TextUtilService } from '@common/services/text-util.service';
import { AdministrativeHierarchy } from '@modules/administrative-hierarchies/models/administrative-hierarchy.model';
import { DataFormResponse } from '@modules/data-forms-responses/models/data-form-response.model';
import { DataFormsResponsesDataService } from '@modules/data-forms-responses/services/data-forms-responses-data.service';
import { DataFormResponsesInitialisationNotificationService } from '@modules/data-forms-responses/services/data-forms-responses-initialisation-message.service';
import { Entity } from '@modules/entities/models/entity.model';
import { Organisation } from '@modules/organisations/models/organisation.model';
import { NGXLogger } from 'ngx-logger';
import { timer } from 'rxjs';

const LOG_PREFIX: string = "[Organisations Data Forms Responses Records Creation Component]";

@Component({
  selector: 'sb-organisations-data-forms-responses-records-creation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './organisations-data-forms-responses-records-creation.component.html',
  styleUrls: ['organisations-data-forms-responses-records-creation.component.scss'],
})
export class OrganisationsDataFormsResponsesRecordsCreationComponent implements OnInit, OnDestroy {

  // Allow the parent component to pass in the target organisation
  @Input() public organisation!: Organisation;

  // Broadcasts selector windows open events
  @Output() public openedLocationSelector: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts selector windows close events
  @Output() public closedLocationSelector: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts selector windows open events
  @Output() public openedEntitySelector: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts selector windows close events
  @Output() public closedEntitySelector: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts successful Organisations Data Forms Responses creation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Organisations Data Forms Responses creation events together with their error plurals
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Keep tabs of the selected entity
  private entity: Entity | null = null;

  // Keep tabs of the selected Administrative Unit & its parentage
  private location: {id: number | null | undefined; name: string | null | undefined;}[] | null | undefined  = null;

  // Defines Organisations Data Forms Responses reactive form controls group
  public responsesForm = new FormGroup({

    siteType: new FormGroup({
      siteTypeId: new FormControl<number | null | undefined>(2, this.isSiteTypeRequired()),
      siteTypeName: new FormControl<string>("Location")
    }),

    entity: new FormGroup({
      entityId: new FormControl<number | null | undefined>(null, this.isEntityRequired()),
      entityName: new FormControl<string | null | undefined>("Choose Entity")
    }),

    location: new FormGroup({
      administrativeUnitId: new FormControl<number | null | undefined>(null, this.isLocationRequired()),
      administrativeUnitName: new FormControl<string | null | undefined>("Choose Location")
    })

  });

  // Keeps tabs of the currently visible content
  public page: string = "default";

  // Keeps tabs of whether the component has been successfully initialised
  public initialised: boolean = false;


  constructor(
    public dateUtilService: DateUtilService,
    public dataFormsResponsesDataService: DataFormsResponsesDataService,
    public dataFormResponsesInitialisationNotificationService: DataFormResponsesInitialisationNotificationService,
    public textUtilService: TextUtilService,
    public filterService: FilterService,
    private cd: ChangeDetectorRef,
    private log: NGXLogger) {

  }


  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Mark Init as complete
    this.log.trace(`${LOG_PREFIX} Init completed`);
    this.initialised = true;
    this.cd.detectChanges();

  }


  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }

  /**
   * Retrieves the id of the Site Type
   * @returns the id
   */
  public getSiteTypeId(): number | null | undefined {
    return this.responsesForm.get('siteType.siteTypeId')?.value
  }

  /**
   * Retrieves the name of the Site Type
   * @returns the name
   */
  public getSiteTypeName(): string | null | undefined {
    return this.responsesForm.get('siteType.siteTypeName')?.value
  }


  /**
   * Handles Site Type change events
   */
  public onSiteTypeChange(): void {

    this.log.trace(`${LOG_PREFIX} Entering onSiteTypeChange()`);

    // Get the selected siteType id
    this.log.trace(`${LOG_PREFIX} Getting the selected Site Type Id`);
    const siteTypeId: number | null | undefined = this.responsesForm.get('siteType.siteTypeId')?.value
    this.log.debug(`${LOG_PREFIX} Site Type Id = ${siteTypeId}`);

    // Get the Site Type with the specified id
    this.log.trace(`${LOG_PREFIX} Getting the Site Type with the specified Id`);

    if (siteTypeId) {

      switch (siteTypeId) {
        case 1:
          this.responsesForm.get('siteType.siteTypeName')?.setValue("Entity");
          break;
        case 2:
          this.responsesForm.get('siteType.siteTypeName')?.setValue("Location");
          break;
        default:
          this.responsesForm.get('siteType.siteTypeName')?.setValue("");

      }

    } else {

      // Update the forms
      this.log.trace(`${LOG_PREFIX} Updating the forms`);
      this.responsesForm.get('siteType.siteTypeName')?.setValue("");

    }

  }

  /**
   * Checks whether the Site Type is required
   * @returns 
   */
  private isSiteTypeRequired(): ValidatorFn {

    this.log.trace(`${LOG_PREFIX} Entering isSiteTypeRequired()`);

    return (control: AbstractControl): ValidationErrors | null => {

      // Check if a Site Type has been specified
      this.log.trace(`${LOG_PREFIX} Checking if a Site Type has been specified`);
      if (control.value) {

        // A Site Type has been specified
        this.log.trace(`${LOG_PREFIX} A Site Type has been specified`);

        // Considering the requirement constraint as upheld
        this.log.trace(`${LOG_PREFIX} Considering the requirement constraint as upheld`);

        // Return null
        return null;

      } else {

        // A Site Type has not been specified
        this.log.trace(`${LOG_PREFIX} A Site Type has not been specified`);

        // Considering the requirement constraint as violated
        this.log.trace(`${LOG_PREFIX} Considering the requirement constraint as violated`);

        return { 'required': true };

      }

    }

  }


  /**
   * Retrieves the id of the Administrative System
   * @returns the id
   */
  public getAdministrativeSystemId(): number | null | undefined {
    return this.responsesForm.get('location.administrativeSystemId')?.value
  }

  /**
   * Retrieves the id of the Administrative Structure
   * @returns the id
   */
  public getAdministrativeStructureId(): number | null | undefined {
    return this.responsesForm.get('location.administrativeStructureId')?.value
  }

  /**
   * Retrieves the id of the administrative hierarchy
   * @returns the id
   */
  public getAdministrativeHierarchyId(): number | null | undefined {
    return this.responsesForm.get('location.administrativeHierarchyId')?.value
  }


  /**
   * Retrieves the id of the Administrative Unit
   * @returns the id
   */
  public getAdministrativeUnitId(): number | null | undefined {
    return this.responsesForm.get('location.administrativeUnitId')?.value
  }

  /**
   * Retrieves the name of the Administrative Unit
   * @returns the name
   */
  public getAdministrativeUnitName(): string | null | undefined {
    return this.responsesForm.get('location.administrativeUnitName')?.value
  }


  /**
   * Get the selected entity location for preselection purposes
   * @returns 
   */
  public getSelectedLocations(): number[] {
    if (this.getAdministrativeUnitId()) {
      return [this.getAdministrativeUnitId() as number];
    } else {
      return [];
    }
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
   * Sets the selected location details and closes the location selector
   * @param hierarchies the hierarchical location + predecessors
   */
  onSelectAdministrativeHierarchy(hierarchies: AdministrativeHierarchy[]) {

    // Update the local location reference
    this.log.trace(`${LOG_PREFIX} Updating the local location reference`);
    this.location = [];
    for(let hierarchy of hierarchies){
      if(hierarchy.data.responsible?.id){
        this.location.push({id: hierarchy.data.responsible.id, name: hierarchy.data.responsible.name});
      }
    }  
    
    // Get the actual selected location
    this.log.trace(`${LOG_PREFIX} Getting the actual selected location`);
    const administrativeHierarchy: AdministrativeHierarchy = hierarchies[0];

    // Update the form
    this.log.trace(`${LOG_PREFIX} Updating the form`);
    this.responsesForm.get('location.administrativeUnitId')?.setValue((administrativeHierarchy && administrativeHierarchy.data.responsible?.id) ? administrativeHierarchy.data.responsible.id : null);
    this.responsesForm.get('location.administrativeUnitName')?.setValue((administrativeHierarchy && administrativeHierarchy.data.responsible?.name) ? this.textUtilService.truncate(administrativeHierarchy.data.responsible.name, [35, "..."]) : null);    

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
   * Checks whether the location is required
   * @returns 
   */
  private isLocationRequired(): ValidatorFn {

    this.log.trace(`${LOG_PREFIX} Entering isLocationRequired()`);

    return (control: AbstractControl): ValidationErrors | null => {

      // Check if a location has been specified
      this.log.trace(`${LOG_PREFIX} Checking if a location has been specified`);
      if (control.value) {

        // A location has been specified
        this.log.trace(`${LOG_PREFIX} A location has been specified`);

        // Considering the requirement constraint as upheld
        this.log.trace(`${LOG_PREFIX} Considering the requirement constraint as upheld`);

        // Return null
        return null;

      } else {

        // A location has not been specified
        this.log.trace(`${LOG_PREFIX} A location has not been specified`);

        // Considering the requirement constraint as violated if Site Type is location
        this.log.trace(`${LOG_PREFIX} Considering the requirement constraint as violated if Site Type is location`);

        return this.responsesForm ? (this.getSiteTypeId() == 2 ? { 'required': true } : null) : null;

      }

    }

  }


  /**
   * Retrieves the id of the entity
   * @returns the id
   */
  public getEntityId(): number | null | undefined {
    return this.responsesForm.get('entity.entityId')?.value
  }

  /**
   * Retrieves the name of the entity
   * @returns the name
   */
  public getEntityName(): string | null | undefined {
    return this.responsesForm.get('entity.entityName')?.value
  }


  /**
   * Get the selected entity entity for preselection purposes
   * @returns 
   */
  public getSelectedEntities(): number[] {
    if (this.getEntityId()) {
      return [this.getEntityId() as number];
    } else {
      return [];
    }
  }


  /**
   * Opens the Entity Selector
   */
  public openEntitySelector(): void {

    this.log.trace(`${LOG_PREFIX} Entering openEntitySelector()`);

    // Set the desired page to 'entities'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'entities'`);
    this.page = "entities";

    // Emit an 'openedEntitySelector' event
    this.log.trace(`${LOG_PREFIX} Emitting an 'openedEntitySelector' event`);
    this.openedEntitySelector.emit();

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();
  }


  /**
   * Closes the Entity Entities Selector
   */
  public closeEntitySelector(): void {

    this.log.trace(`${LOG_PREFIX} Entering closeEntitySelector()`);

    // Set the desired page to 'default'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'default'`);
    this.page = "default";

    // Emit a 'closedEntitySelector' event
    this.log.trace(`${LOG_PREFIX} Emitting a 'closedEntitySelector' event`);
    this.closedEntitySelector.emit();

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();
  }


  /**
  * Sets the selected entity details and close the entity selector
  * @param entity Sets 
  */
  onSelectEntity(entity: Entity) {

    // Keep a local reference to the selected entity
    this.log.trace(`${LOG_PREFIX} Keeping a local reference to the selected entity`);
    this.entity = entity;

    // Update the form
    this.log.trace(`${LOG_PREFIX} Updating the form`);
    this.responsesForm.get('entity.entityId')?.setValue((entity && entity.id) ? entity.id : null);
    this.responsesForm.get('entity.entityName')?.setValue((entity && entity.data?.name) ? this.textUtilService.truncate(entity.data.name, [35, "..."]) : null);

    // Set the desired page to 'default'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'default'`);
    this.page = "default";

    // Emit a 'closedEntitySelector' event
    this.log.trace(`${LOG_PREFIX} Emitting a 'closedEntitySelector' event`);
    this.closedEntitySelector.emit();

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();

  }


  /**
   * Checks whether the entity is required
   * @returns 
   */
  private isEntityRequired(): ValidatorFn {

    this.log.trace(`${LOG_PREFIX} Entering isEntityRequired()`);

    return (control: AbstractControl): ValidationErrors | null => {

      // Check if a entity has been specified
      this.log.trace(`${LOG_PREFIX} Checking if a entity has been specified`);
      if (control.value) {

        // A entity has been specified
        this.log.trace(`${LOG_PREFIX} A entity has been specified`);

        // Considering the requirement constraint as upheld
        this.log.trace(`${LOG_PREFIX} Considering the requirement constraint as upheld`);

        // Return null
        return null;

      } else {

        // A entity has not been specified
        this.log.trace(`${LOG_PREFIX} A entity has not been specified`);

        // Considering the requirement constraint as violated if Site Type is entity
        this.log.trace(`${LOG_PREFIX} Considering the requirement constraint as violated if Site Type is entity`);

        return this.responsesForm ? (this.getSiteTypeId() == 1 ? { 'required': true } : null) : null;

      }

    }

  }


  /**
   * Validates and saves a new Organisation Data Form Response Record.
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

      // Read in the provided Site Type
      this.log.trace(`${LOG_PREFIX} Reading in the provided Site Type`);
      const siteType: { id: number | null | undefined; name: string | null | undefined; } = { id: this.getSiteTypeId(), name: this.getSiteTypeName() };
      this.log.debug(`${LOG_PREFIX} Site Type = ${JSON.stringify(siteType)}`);      

      // Read in the provided entity
      this.log.trace(`${LOG_PREFIX} Reading in the provided entity`);
      let entity: { id: number | null | undefined; name: string | null | undefined; } | null;
      if(this.getSiteTypeId() == 1) {
        entity = { id: this.getEntityId(), name: this.getEntityName() };
      } else {
        entity = null;
      }
      this.log.debug(`${LOG_PREFIX} Entity = ${JSON.stringify(entity)}`);

      // Read in the provided location
      this.log.trace(`${LOG_PREFIX} Reading in the provided location`);
      let location: { id: number | null | undefined; name: string | null | undefined; }[] | null | undefined
      if(this.getSiteTypeId() == 1) {
        location = this.entity? this.entity.data.location : null;
      } else if(this.getSiteTypeId() == 2) {
        location = this.location
      } else {
        location = null;
      }
      this.log.debug(`${LOG_PREFIX} Location = ${JSON.stringify(location)}`);

      // Read in the provided reporter
      this.log.trace(`${LOG_PREFIX} Reading in the provided reporter`);
      const reporter: { id: number | null | undefined; roleId: number | null | undefined; name: string | null | undefined; } = { id: this.organisation?.id, roleId: 1, name: this.organisation?.data.name };
      this.log.debug(`${LOG_PREFIX} Site Type = ${JSON.stringify(siteType)}`);        



      // Save the record
      this.log.trace(`${LOG_PREFIX} Saving the Entities Record`);
      this.dataFormsResponsesDataService
        .createDataFormResponse(
          new DataFormResponse({
            data: {
              contextId: this.filterService.filter.activeContext?.id,
              timePeriodId: this.filterService.filter.activeReportingPeriod?.id,
              timePointId: this.dateUtilService.getTimePointIdFromDate(new Date()),
              formId: this.filterService.filter.activeDataForm?.id,
              location: location,
              organisations: [reporter],
              entity: entity,
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

            });


          }
        });


    } else {

      // The data entry form is invalid
      this.log.trace(`${LOG_PREFIX} The data entry form is invalid`);

      // Run the form fields validation request to validate all fields and display the error message(s)
      this.log.trace(`${LOG_PREFIX} Running the form fields validation request to validate all fields and display the error message(s)`);
      this.validateAllFormFields(this.responsesForm);

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
