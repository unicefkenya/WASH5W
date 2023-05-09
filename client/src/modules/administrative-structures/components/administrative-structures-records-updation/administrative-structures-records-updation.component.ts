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
import { FormControl, FormGroup } from '@angular/forms';
import { TextUtilService } from '@common/services/text-util.service';
import { AdministrativeSystemsDataService } from '@modules/administrative-systems/services/administrative-systems-data.service';
import { AdministrativeStructure } from '@modules/administrative-structures/models/administrative-structure.model';
import { AdministrativeStructuresDataService } from '@modules/administrative-structures/services/administrative-structures-data.service';
import { AdministrativeUnitType } from '@modules/administrative-units-types/models/administrative-unit-type.model';
import { NGXLogger } from 'ngx-logger';
import { FilterService } from '@app/app-filter.service';
import { Observable, of } from 'rxjs';

const LOG_PREFIX: string = "[Administrative Structures Records Updation Component]";

@Component({
  selector: 'sb-administrative-structures-records-updation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './administrative-structures-records-updation.component.html',
  styleUrls: ['administrative-structures-records-updation.component.scss'],
})
export class AdministrativeStructuresRecordsUpdationComponent implements OnInit, OnDestroy {

  // Allows the parent component to inject the unique identifier of the target record
  @Input() public id!: number;

  // Broadcasts successful Administrative Structures updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Administrative Structures updation events together with their error codes
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Broadcasts selector windows open events
  @Output() public openedParentAdministrativeUnitTypeSelector: EventEmitter<void> = new EventEmitter<void>();
  @Output() public openedSubsidiaryAdministrativeUnitTypeSelector: EventEmitter<void> = new EventEmitter<void>();
  @Output() public openedSystemSelector: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts selector windows close events
  @Output() public closedParentAdministrativeUnitTypeSelector: EventEmitter<void> = new EventEmitter<void>();
  @Output() public closedSubsidiaryAdministrativeUnitTypeSelector: EventEmitter<void> = new EventEmitter<void>();
  @Output() public closedSystemSelector: EventEmitter<void> = new EventEmitter<void>();

  // Holds the Administrative Structure record with the passed in id
  public administrativeStructure: AdministrativeStructure | null | undefined;

  // Keeps tabs of the currently visible content
  page: string = "default";

  // Keeps tabs of the processing errors
  public errors: Map<string, string> = new Map();

  // Keeps tabs of whether the page has been successfully initialised
  public initialised: boolean = false;

  // Defines Administrative Structures reactive form controls group
  administrativeStructuresForm = new FormGroup({

    system: new FormGroup({
      systemId: new FormControl<number | null | undefined>(null),
      systemName: new FormControl<string>("Select system")
    }),

    parentType: new FormGroup({
      parentTypeId: new FormControl<number | null | undefined>(null),
      parentTypeName: new FormControl<string>("Select parent type")
    }),

    subsidiaryType: new FormGroup({
      subsidiaryTypeId: new FormControl<number | null | undefined>(null),
      subsidiaryTypeName: new FormControl<string>("Select subsidiary type")
    }),

  });



  constructor(
    public administrativeSystemsDataService: AdministrativeSystemsDataService,
    public administrativeStructuresDataService: AdministrativeStructuresDataService,
    public filterService: FilterService,
    public textUtilService: TextUtilService,
    private cd: ChangeDetectorRef,
    private log: NGXLogger) {

  }


  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Administrative Structure with the passed in id
    this.initialiseAdministrativeStructure(() => {

      // Preselect the active system in the data tabulation form
      this.initialiseFormGroup(() => {

        // Mark Init as complete
        this.log.trace(`${LOG_PREFIX} Init completed`);
        this.initialised = true;

      });

    });



  }



  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy`);

  }


  /**
   * Retrieves the Administrative Structure with the injected id and sets it as the Administrative Structure that needs to be updated
   * @param callback The function to call when done
   */
  private initialiseAdministrativeStructure(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseAdministrativeStructure()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    // Get the Administrative Structure corresponding to the passed in id
    this.log.trace(`${LOG_PREFIX} Getting the Administrative Structure corresponding to the passed in id`);
    this.getAdministrativeStructure$(this.id)
      .subscribe({
        next: (administrativeStructure: AdministrativeStructure | null) => {

          // Set the target Administrative Structure
          this.log.trace(`${LOG_PREFIX} Setting the target Administrative Structure`);
          this.administrativeStructure = administrativeStructure;

          // Transfer control to the callback function
          this.log.trace(`${LOG_PREFIX} Returning`);
          callback();

        }
      })

  }

  /**
   * Presets default values in the data updation form
   * @param callback The function to call when done
   */
  private initialiseFormGroup(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseFormGroup()`);

    // Preset the System details
    this.log.trace(`${LOG_PREFIX} Presetting the System details`);
    this.administrativeStructuresForm.get('system.systemId')?.setValue(this.administrativeStructure && this.administrativeStructure.data?.hierarchy?.id ? this.administrativeStructure.data?.hierarchy?.id : null);
    this.administrativeStructuresForm.get('system.systemName')?.setValue(this.administrativeStructure && this.administrativeStructure.data?.hierarchy?.name ? this.administrativeStructure.data?.hierarchy?.name : null);

    // Preset the Parent Type details
    this.log.trace(`${LOG_PREFIX} Presetting the Parent Type details`);
    this.administrativeStructuresForm.get('parentType.parentTypeId')?.setValue(this.administrativeStructure && this.administrativeStructure.data?.commissioner?.id ? this.administrativeStructure.data?.commissioner?.id : null);
    this.administrativeStructuresForm.get('parentType.parentTypeName')?.setValue(this.administrativeStructure && this.administrativeStructure.data?.commissioner?.name ? this.administrativeStructure.data?.commissioner?.name : null);
    
    // Preset the Subsidiary Type details
    this.log.trace(`${LOG_PREFIX} Presetting the Subsidiary Type details`);
    this.administrativeStructuresForm.get('subsidiaryType.subsidiaryTypeId')?.setValue(this.administrativeStructure && this.administrativeStructure.data?.responsible?.id ? this.administrativeStructure.data?.responsible?.id : null);
    this.administrativeStructuresForm.get('subsidiaryType.subsidiaryTypeName')?.setValue(this.administrativeStructure && this.administrativeStructure.data?.responsible?.name ? this.administrativeStructure.data?.responsible?.name : null);     

    // Return
    this.log.trace(`${LOG_PREFIX} Returning`);
    callback();

  }



  /**
  * Retrieves an Administrative Structure record given its unique identifier synchronously
  * @param id The unique identifier of the Administrative Structure
  */
  public getAdministrativeStructure$(id: number | null | undefined): Observable<AdministrativeStructure | null> {

    this.log.trace(`${LOG_PREFIX} Entering getAdministrativeStructure$()`);

    // Check if the Administrative Structure's Id was specified
    this.log.trace(`${LOG_PREFIX} Checking if the Administrative Structure's Id was specified`);
    if (id) {

      // The Administrative Structure's Id was specified
      this.log.trace(`${LOG_PREFIX} The Administrative Structure's Id was specified`);
      this.log.debug(`${LOG_PREFIX} Administrative Structure = ${JSON.stringify(id)}`);

      // Asynchronously get and return the Administrative Structure
      return new Observable(obs => {

        // Try retrieving an Administrative Structure Record with the passed in id
        this.log.trace(`${LOG_PREFIX} Trying to retrieve an Administrative Structure Record with the passed in id`);
        const administrativeStructure: AdministrativeStructure | undefined = id ? this.administrativeStructuresDataService.records.find(d => d.id == id) : undefined;

        // Check if the Administrative Structure Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} Checking if the Administrative Structure Record was successfully retrieved`);
        if (administrativeStructure) {

          // The Administrative Structure Record was successfully retrieved
          this.log.trace(`${LOG_PREFIX} The Administrative Structure Record was successfully retrieved`);
          this.log.debug(`${LOG_PREFIX} Administrative Structure Record = ${JSON.stringify(administrativeStructure)}`);

          // Return the Administrative Structure
          this.log.trace(`${LOG_PREFIX} Returning the Administrative Structure`);
          obs.next(administrativeStructure);

        } else {

          // The Administrative Structure Record was not successfully retrieved
          this.log.trace(`${LOG_PREFIX} The Administrative Structure Record was not successfully retrieved`);

          // Return null
          this.log.warn(`${LOG_PREFIX} Returning null`);
          obs.next(null);

        }

      });

    } else {

      // The Administrative Structure's Id was not specified
      this.log.trace(`${LOG_PREFIX} The Administrative Structure's Id was not specified`);

      // Return an empty observable
      this.log.trace(`${LOG_PREFIX} Returning an empty observable`);
      return of(null);
    }


  }



  /**
   * Retrieves the id of the administrative system
   * @returns the id
   */
   public getSystemId(): number | null | undefined {
    return this.administrativeStructuresForm.get('system.systemId')?.value
  }

  /**
   * Retrieves the name of the system
   * @returns the name
   */
   public getSystemName(): string | null | undefined {
    return this.administrativeStructuresForm.get('system.systemName')?.value
  }  


  /**
   * Retrieves the id of the parent type
   * @returns the id
   */
  public getParentTypeId(): number | null | undefined {
    return this.administrativeStructuresForm.get('parentType.parentTypeId')?.value
  }


  /**
   * Retrieves the name of the parent type
   * @returns the name
   */
  public getParentTypeName(): string | null | undefined {
    return this.administrativeStructuresForm.get('parentType.parentTypeName')?.value
  }


  /**
   * Retrieves the id of the subsidiary type
   * @returns the id
   */
  public getSubsidiaryTypeId(): number | null | undefined {
    return this.administrativeStructuresForm.get('subsidiaryType.subsidiaryTypeId')?.value
  }


  /**
   * Retrieves the name of the subsidiary type
   * @returns the name
   */
  public getSubsidiaryTypeName(): string | null | undefined {
    return this.administrativeStructuresForm.get('subsidiaryType.subsidiaryTypeName')?.value
  }



  /**
   * Opens the System Selector
   */
   public openSystemSelector(): void {

    this.log.trace(`${LOG_PREFIX} Entering openSystemSelector()`);

    // Set the desired page to 'systems'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'systems'`);
    this.page = "systems";

    // Emit an 'openedSystemSelector' event
    this.log.trace(`${LOG_PREFIX} Emitting an 'openedSystemSelector' event`);
    this.openedSystemSelector.emit();

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();
  }



  /**
   * Closes the System Selector
   */
  public closeSystemSelector(): void {

    this.log.trace(`${LOG_PREFIX} Entering closeSystemSelector()`);

    // Set the desired page to 'default'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'default'`);
    this.page = "default";

    // Emit a 'closedSystemSelector' event
    this.log.trace(`${LOG_PREFIX} Emitting a 'closedSystemSelector' event`);
    this.closedSystemSelector.emit();

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();
  }




  /** 
  * Handles System Selection Events
  * @param type The Selected Administrative Unit Type
  */
  public onSelectSystem(type: AdministrativeUnitType): void {

    this.log.trace(`${LOG_PREFIX} Entering onSelectSystem()`);
    this.log.debug(`${LOG_PREFIX} Selected System = ${JSON.stringify(type)}`);

    // Set the system details
    this.log.trace(`${LOG_PREFIX} Setting the system details`);
    this.administrativeStructuresForm.get('system.systemId')?.setValue((type && type.id) ? type.id : null);
    this.administrativeStructuresForm.get('system.systemName')?.setValue((type && type.data.name) ? this.textUtilService.truncate(type.data.name, [35, "..."]) : null);

    // Clear the parent details
    this.log.trace(`${LOG_PREFIX} Clearing the parent details`);
    this.administrativeStructuresForm.get('parentType.parentTypeId')?.setValue(null);
    this.administrativeStructuresForm.get('parentType.parentTypeName')?.setValue("Select parent type");    

    // Clear the subsidiary details
    this.log.trace(`${LOG_PREFIX} Clearing the subsidiary details`);
    this.administrativeStructuresForm.get('subsidiaryType.subsidiaryTypeId')?.setValue(null);
    this.administrativeStructuresForm.get('subsidiaryType.subsidiaryTypeName')?.setValue("Select subsidiary type");

    // Set the desired page to 'default'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'default'`);
    this.page = "default";

    // Emit a 'closedSystemSelector' event
    this.log.trace(`${LOG_PREFIX} Emitting a 'closedSystemSelector' event`);
    this.closedSystemSelector.emit();

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();

  }



  /**
   * Opens the Parent Administrative Unit Type Selector
   */
  public openParentAdministrativeUnitTypeSelector(): void {

    this.log.trace(`${LOG_PREFIX} Entering openParentAdministrativeUnitTypeSelector()`);

    // Set the desired page to 'parent-types'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'parent-types'`);
    this.page = "parent-types";

    // Emit an 'openedParentAdministrativeUnitTypeSelector' event
    this.log.trace(`${LOG_PREFIX} Emitting an 'openedParentAdministrativeUnitTypeSelector' event`);
    this.openedParentAdministrativeUnitTypeSelector.emit();

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();
  }



  /**
   * Closes the Parent Administrative Unit Type Selector
   */
  public closeParentAdministrativeUnitTypeSelector(): void {

    this.log.trace(`${LOG_PREFIX} Entering closeParentAdministrativeUnitTypeSelector()`);

    // Set the desired page to 'default'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'default'`);
    this.page = "default";

    // Emit a 'closedParentAdministrativeUnitTypeSelector' event
    this.log.trace(`${LOG_PREFIX} Emitting a 'closedParentAdministrativeUnitTypeSelector' event`);
    this.closedParentAdministrativeUnitTypeSelector.emit();

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();
  }




  /** 
  * Handles Parent Administrative Unit Type Selection Events
  * @param type The Selected Administrative Unit Type
  */
  public onSelectParentAdministrativeUnitType(type: AdministrativeUnitType): void {

    this.log.trace(`${LOG_PREFIX} Entering onSelectParentAdministrativeUnitType()`);
    this.log.debug(`${LOG_PREFIX} Selected Parent Administrative Unit Type = ${JSON.stringify(type)}`);

    // Set the parent type details
    this.log.trace(`${LOG_PREFIX} Setting the parent type details`);
    this.administrativeStructuresForm.get('parentType.parentTypeId')?.setValue((type && type.id) ? type.id : null);
    this.administrativeStructuresForm.get('parentType.parentTypeName')?.setValue((type && type.data.name) ? this.textUtilService.truncate(type.data.name, [35, "..."]) : null);

    // Clear the subsidiary details
    this.log.trace(`${LOG_PREFIX} Clearing the subsidiary details`);
    this.administrativeStructuresForm.get('subsidiaryType.subsidiaryTypeId')?.setValue(null);
    this.administrativeStructuresForm.get('subsidiaryType.subsidiaryTypeName')?.setValue("Select subsidiary type");    

    // Set the desired page to 'default'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'default'`);
    this.page = "default";

    // Emit a 'closedParentAdministrativeUnitTypeSelector' event
    this.log.trace(`${LOG_PREFIX} Emitting a 'closedParentAdministrativeUnitTypeSelector' event`);
    this.closedParentAdministrativeUnitTypeSelector.emit();

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();

  }


  /**
   * Opens the Subsidiary Administrative Unit Type Selector
   */
  public openSubsidiaryAdministrativeUnitTypeSelector(): void {

    this.log.trace(`${LOG_PREFIX} Entering openSubsidiaryAdministrativeUnitTypeSelector()`);

    // Set the desired page to 'subsidiary-types'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'subsidiary-types'`);
    this.page = "subsidiary-types";

    // Emit an 'openedSubsidiaryAdministrativeUnitTypeSelector' event
    this.log.trace(`${LOG_PREFIX} Emitting an 'openedSubsidiaryAdministrativeUnitTypeSelector' event`);
    this.openedSubsidiaryAdministrativeUnitTypeSelector.emit();

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();
  }



  /**
   * Closes the Subsidiary Administrative Unit Type Selector
   */
  public closeSubsidiaryAdministrativeUnitTypeSelector(): void {

    this.log.trace(`${LOG_PREFIX} Entering closeSubsidiaryAdministrativeUnitTypeSelector()`);

    // Set the desired page to 'default'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'default'`);
    this.page = "default";

    // Emit a 'closedSubsidiaryAdministrativeUnitTypeSelector' event
    this.log.trace(`${LOG_PREFIX} Emitting a 'closedSubsidiaryAdministrativeUnitTypeSelector' event`);
    this.closedSubsidiaryAdministrativeUnitTypeSelector.emit();

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();
  }




  /** 
  * Handles Subsidiary Administrative Unit Type Selection Events
  * @param type The Selected Administrative Unit Type
  */
  public onSelectSubsidiaryAdministrativeUnitType(type: AdministrativeUnitType): void {

    this.log.trace(`${LOG_PREFIX} Entering onSelectSubsidiaryAdministrativeUnitType()`);
    this.log.debug(`${LOG_PREFIX} Selected Subsidiary Administrative Unit Type = ${JSON.stringify(type)}`);

    // Update the form
    this.log.trace(`${LOG_PREFIX} Updating the form`);
    this.administrativeStructuresForm.get('subsidiaryType.subsidiaryTypeId')?.setValue((type && type.id) ? type.id : null);
    this.administrativeStructuresForm.get('subsidiaryType.subsidiaryTypeName')?.setValue((type && type.data.name) ? this.textUtilService.truncate(type.data.name, [35, "..."]) : null);

    // Set the desired page to 'default'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'default'`);
    this.page = "default";

    // Emit a 'closedSubsidiaryAdministrativeUnitTypeSelector' event
    this.log.trace(`${LOG_PREFIX} Emitting a 'closedSubsidiaryAdministrativeUnitTypeSelector' event`);
    this.closedSubsidiaryAdministrativeUnitTypeSelector.emit();

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();

  }



  /**
   * Checks whether all the required inputs have been provided correctly
   * @returns True or False 
   */
  private isValid(): boolean {

    this.log.trace(`${LOG_PREFIX} Entering isValid()`);

    let valid: boolean = true;

    // Validate the administrative system
    if (!this.getSystemId()) {

      this.errors.set("system", "Administrative System is required");
      valid = false;

    }

    // Validate the subsidiary type
    if (!this.getSubsidiaryTypeId()) {

      this.errors.set("subsidiaryType", "Subsidiary Administrative Type is required");
      valid = false;

    }

    // Clear previous errors if valid
    if (valid) {
      this.errors.delete("system");
      this.errors.delete("subsidiaryType");
    }

    return valid;
  }


  /**
   * Validates and saves a new Administrative Structures Record.
   * Emits a succeeded or failed event depending on whether the save request succeeded or failed respectively
   * Error 400 = Indicates that a user error was encountered
   * Error 500 = Indicates that a system error was encountered
   */
  public save(): void {

    this.log.trace(`${LOG_PREFIX} Entering save()`);

    // Check if the data entry form is valid
    this.log.trace(`${LOG_PREFIX} Checking if the data entry form is valid`);
    if (this.isValid()) {

      // The data entry form is valid
      this.log.trace(`${LOG_PREFIX} The data entry form is valid`);

      // Save the record
      this.log.trace(`${LOG_PREFIX} Saving the Administrative Structures Record`);
      this.administrativeStructuresDataService
        .updateAdministrativeStructure(
          new AdministrativeStructure({
            id: this.administrativeStructure?.id,
            data: {
              hierarchy: { id: this.getSystemId(), name: this.getSystemName() },
              commissioner: { id: this.getParentTypeId(), name: this.getParentTypeId()? this.getParentTypeName() : null },
              responsible: { id: this.getSubsidiaryTypeId(), name: this.getSubsidiaryTypeName() },
            },
            version: this.administrativeStructure?.version
          }))
        .subscribe({
          next: (response: AdministrativeStructure) => {

            // The Administrative Structure Record was saved successfully
            this.log.trace(`${LOG_PREFIX} Administrative Structure Record was saved successfuly`);

            // Reset the form
            this.log.trace(`${LOG_PREFIX} Resetting the form`);
            this.administrativeStructuresForm.get('parentType.parentTypeId')?.setValue(null);
            this.administrativeStructuresForm.get('parentType.parentTypeName')?.setValue("Select parent type");
            this.administrativeStructuresForm.get('subsidiaryType.subsidiaryTypeId')?.setValue(null);
            this.administrativeStructuresForm.get('subsidiaryType.subsidiaryTypeName')?.setValue("Select subsidiary type");

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The Administrative Structure Record was not saved successfully
            this.log.trace(`${LOG_PREFIX} Administrative Structure Record was not saved successfuly`);

            // Emit a 'failed' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
            this.failed.emit(500);
          }
        });
    } else {

      // The data entry form is invalid
      this.log.trace(`${LOG_PREFIX} The data entry form is invalid`);

      // Emit an 'invalid' event
      this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
      this.failed.emit(400);
    }

  }


}
