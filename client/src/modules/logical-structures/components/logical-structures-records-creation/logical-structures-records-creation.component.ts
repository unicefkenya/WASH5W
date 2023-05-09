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
import { LogicalSchemesDataService } from '@modules/logical-schemes/services/logical-schemes-data.service';
import { LogicalStructure } from '@modules/logical-structures/models/logical-structure.model';
import { LogicalStructuresDataService } from '@modules/logical-structures/services/logical-structures-data.service';
import { LogicalElementType } from '@modules/logical-elements-types/models/logical-element-type.model';
import { NGXLogger } from 'ngx-logger';
import { LogicalScheme } from '@modules/logical-schemes/models/logical-scheme.model';
import { FilterService } from '@app/app-filter.service';

const LOG_PREFIX: string = "[Logical Structures Records Creation Component]";

@Component({
  selector: 'sb-logical-structures-records-creation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './logical-structures-records-creation.component.html',
  styleUrls: ['logical-structures-records-creation.component.scss'],
})
export class LogicalStructuresRecordsCreationComponent implements OnInit, OnDestroy {

  // Allows the parent component to inject the unique identifier of the parent Scheme record
  @Input() public schemeId!: number;

  // Broadcasts successful Logical Structures creation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Logical Structures creation events together with their error codes
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Broadcasts selector windows open events
  @Output() public openedParentLogicalElementTypeSelector: EventEmitter<void> = new EventEmitter<void>();
  @Output() public openedSubsidiaryLogicalElementTypeSelector: EventEmitter<void> = new EventEmitter<void>();
  @Output() public openedSchemeSelector: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts selector windows close events
  @Output() public closedParentLogicalElementTypeSelector: EventEmitter<void> = new EventEmitter<void>();
  @Output() public closedSubsidiaryLogicalElementTypeSelector: EventEmitter<void> = new EventEmitter<void>();
  @Output() public closedSchemeSelector: EventEmitter<void> = new EventEmitter<void>();

  // Keeps tabs of the currently visible content
  page: string = "default";

  // Keeps tabs of the processing errors
  public errors: Map<string, string> = new Map();

  // Keeps tabs of whether the page has been successfully initialised
  public initialised: boolean = false;

  // Defines Logical Structures reactive form controls group
  logicalStructuresForm = new FormGroup({

    scheme: new FormGroup({
      schemeId: new FormControl<number | null | undefined>(null),
      schemeName: new FormControl<string>("Select Scheme")
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
    public logicalSchemesDataService: LogicalSchemesDataService,
    public logicalStructuresDataService: LogicalStructuresDataService,
    public filterService: FilterService,
    public textUtilService: TextUtilService,
    private cd: ChangeDetectorRef,
    private log: NGXLogger) {

  }


  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Preselect the active scheme in the data tabulation form
    this.initialiseFormGroup(() => {

      // Mark Init as complete
      this.log.trace(`${LOG_PREFIX} Init completed`);
      this.initialised = true;

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

    // Get the Active Logical Scheme
    this.log.trace(`${LOG_PREFIX} Get the Active Logical Scheme`);
    const activeLogicalScheme: LogicalScheme | null | undefined = this.filterService.filter.activeLogicalScheme;
    this.log.debug(`${LOG_PREFIX} Active Logical Scheme = ${JSON.stringify(activeLogicalScheme)}`);    

    // Preselect the Active Logical Scheme
    this.log.trace(`${LOG_PREFIX} Preselecting the Active Logical Scheme`);
    this.logicalStructuresForm.get('scheme.schemeId')?.setValue(activeLogicalScheme ? activeLogicalScheme.id : null);
    this.logicalStructuresForm.get('scheme.schemeName')?.setValue(activeLogicalScheme && activeLogicalScheme.data?.name ? activeLogicalScheme.data.name : null);

    // Return
    this.log.trace(`${LOG_PREFIX} Returning`);
    callback();

  }


  /**
   * Retrieves the id of the logical scheme
   * @returns the id
   */
  public getSchemeId(): number | null | undefined {
    return this.logicalStructuresForm.get('scheme.schemeId')?.value
  }

  /**
   * Retrieves the name of the scheme
   * @returns the name
   */
   public getSchemeName(): string | null | undefined {
    return this.logicalStructuresForm.get('scheme.schemeName')?.value
  }  


  /**
   * Retrieves the id of the parent type
   * @returns the id
   */
  public getParentTypeId(): number | null | undefined {
    return this.logicalStructuresForm.get('parentType.parentTypeId')?.value
  }


  /**
   * Retrieves the name of the parent type
   * @returns the name
   */
  public getParentTypeName(): string | null | undefined {
    return this.logicalStructuresForm.get('parentType.parentTypeName')?.value
  }


  /**
   * Retrieves the id of the subsidiary type
   * @returns the id
   */
  public getSubsidiaryTypeId(): number | null | undefined {
    return this.logicalStructuresForm.get('subsidiaryType.subsidiaryTypeId')?.value
  }


  /**
   * Retrieves the name of the subsidiary type
   * @returns the name
   */
  public getSubsidiaryTypeName(): string | null | undefined {
    return this.logicalStructuresForm.get('subsidiaryType.subsidiaryTypeName')?.value
  }


  /**
   * Opens the Scheme Selector
   */
   public openSchemeSelector(): void {

    this.log.trace(`${LOG_PREFIX} Entering openSchemeSelector()`);

    // Set the desired page to 'schemes'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'schemes'`);
    this.page = "schemes";

    // Emit an 'openedSchemeSelector' event
    this.log.trace(`${LOG_PREFIX} Emitting an 'openedSchemeSelector' event`);
    this.openedSchemeSelector.emit();

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();
  }



  /**
   * Closes the Scheme Selector
   */
  public closeSchemeSelector(): void {

    this.log.trace(`${LOG_PREFIX} Entering closeSchemeSelector()`);

    // Set the desired page to 'default'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'default'`);
    this.page = "default";

    // Emit a 'closedSchemeSelector' event
    this.log.trace(`${LOG_PREFIX} Emitting a 'closedSchemeSelector' event`);
    this.closedSchemeSelector.emit();

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();
  }




  /** 
  * Handles Scheme Selection Events
  * @param type The Selected Administrative Unit Type
  */
  public onSelectScheme(type: LogicalElementType): void {

    this.log.trace(`${LOG_PREFIX} Entering onSelectScheme()`);
    this.log.debug(`${LOG_PREFIX} Selected Scheme = ${JSON.stringify(type)}`);

    // Set the scheme details
    this.log.trace(`${LOG_PREFIX} Setting the scheme details`);
    this.logicalStructuresForm.get('scheme.schemeId')?.setValue((type && type.id) ? type.id : null);
    this.logicalStructuresForm.get('scheme.schemeName')?.setValue((type && type.data.name) ? this.textUtilService.truncate(type.data.name, [35, "..."]) : null);

    // Clear the parent details
    this.log.trace(`${LOG_PREFIX} Clearing the parent details`);
    this.logicalStructuresForm.get('parentType.parentTypeId')?.setValue(null);
    this.logicalStructuresForm.get('parentType.parentTypeName')?.setValue("Select parent type");    

    // Clear the subsidiary details
    this.log.trace(`${LOG_PREFIX} Clearing the subsidiary details`);
    this.logicalStructuresForm.get('subsidiaryType.subsidiaryTypeId')?.setValue(null);
    this.logicalStructuresForm.get('subsidiaryType.subsidiaryTypeName')?.setValue("Select subsidiary type");

    // Set the desired page to 'default'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'default'`);
    this.page = "default";

    // Emit a 'closedSchemeSelector' event
    this.log.trace(`${LOG_PREFIX} Emitting a 'closedSchemeSelector' event`);
    this.closedSchemeSelector.emit();

    // Delete scheme errors
    this.errors.delete("scheme");

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();

  }



  /**
   * Opens the Parent Administrative Unit Type Selector
   */
  public openParentLogicalElementTypeSelector(): void {

    this.log.trace(`${LOG_PREFIX} Entering openParentLogicalElementTypeSelector()`);

    // Set the desired page to 'parent-types'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'parent-types'`);
    this.page = "parent-types";

    // Emit an 'openedParentLogicalElementTypeSelector' event
    this.log.trace(`${LOG_PREFIX} Emitting an 'openedParentLogicalElementTypeSelector' event`);
    this.openedParentLogicalElementTypeSelector.emit();

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();
  }



  /**
   * Closes the Parent Administrative Unit Type Selector
   */
  public closeParentLogicalElementTypeSelector(): void {

    this.log.trace(`${LOG_PREFIX} Entering closeParentLogicalElementTypeSelector()`);

    // Set the desired page to 'default'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'default'`);
    this.page = "default";

    // Emit a 'closedParentLogicalElementTypeSelector' event
    this.log.trace(`${LOG_PREFIX} Emitting a 'closedParentLogicalElementTypeSelector' event`);
    this.closedParentLogicalElementTypeSelector.emit();

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();
  }




  /** 
  * Handles Parent Administrative Unit Type Selection Events
  * @param type The Selected Administrative Unit Type
  */
  public onSelectParentLogicalElementType(type: LogicalElementType): void {

    this.log.trace(`${LOG_PREFIX} Entering onSelectParentLogicalElementType()`);
    this.log.debug(`${LOG_PREFIX} Selected Parent Administrative Unit Type = ${JSON.stringify(type)}`);

    // Set the parent type details
    this.log.trace(`${LOG_PREFIX} Setting the parent type details`);
    this.logicalStructuresForm.get('parentType.parentTypeId')?.setValue((type && type.id) ? type.id : null);
    this.logicalStructuresForm.get('parentType.parentTypeName')?.setValue((type && type.data.name) ? this.textUtilService.truncate(type.data.name, [35, "..."]) : null);

    // Clear the subsidiary details
    this.log.trace(`${LOG_PREFIX} Clearing the subsidiary details`);
    this.logicalStructuresForm.get('subsidiaryType.subsidiaryTypeId')?.setValue(null);
    this.logicalStructuresForm.get('subsidiaryType.subsidiaryTypeName')?.setValue("Select subsidiary type");  

    // Set the desired page to 'default'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'default'`);
    this.page = "default";

    // Emit a 'closedParentLogicalElementTypeSelector' event
    this.log.trace(`${LOG_PREFIX} Emitting a 'closedParentLogicalElementTypeSelector' event`);
    this.closedParentLogicalElementTypeSelector.emit();

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();

  }


  /**
   * Opens the Subsidiary Administrative Unit Type Selector
   */
  public openSubsidiaryLogicalElementTypeSelector(): void {

    this.log.trace(`${LOG_PREFIX} Entering openSubsidiaryLogicalElementTypeSelector()`);

    // Set the desired page to 'subsidiary-types'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'subsidiary-types'`);
    this.page = "subsidiary-types";

    // Emit an 'openedSubsidiaryLogicalElementTypeSelector' event
    this.log.trace(`${LOG_PREFIX} Emitting an 'openedSubsidiaryLogicalElementTypeSelector' event`);
    this.openedSubsidiaryLogicalElementTypeSelector.emit();

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();
  }



  /**
   * Closes the Subsidiary Administrative Unit Type Selector
   */
  public closeSubsidiaryLogicalElementTypeSelector(): void {

    this.log.trace(`${LOG_PREFIX} Entering closeSubsidiaryLogicalElementTypeSelector()`);

    // Set the desired page to 'default'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'default'`);
    this.page = "default";

    // Emit a 'closedSubsidiaryLogicalElementTypeSelector' event
    this.log.trace(`${LOG_PREFIX} Emitting a 'closedSubsidiaryLogicalElementTypeSelector' event`);
    this.closedSubsidiaryLogicalElementTypeSelector.emit();

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();
  }




  /** 
  * Handles Subsidiary Administrative Unit Type Selection Events
  * @param type The Selected Administrative Unit Type
  */
  public onSelectSubsidiaryLogicalElementType(type: LogicalElementType): void {

    this.log.trace(`${LOG_PREFIX} Entering onSelectSubsidiaryLogicalElementType()`);
    this.log.debug(`${LOG_PREFIX} Selected Subsidiary Administrative Unit Type = ${JSON.stringify(type)}`);

    // Update the form
    this.log.trace(`${LOG_PREFIX} Updating the form`);
    this.logicalStructuresForm.get('subsidiaryType.subsidiaryTypeId')?.setValue((type && type.id) ? type.id : null);
    this.logicalStructuresForm.get('subsidiaryType.subsidiaryTypeName')?.setValue((type && type.data.name) ? this.textUtilService.truncate(type.data.name, [35, "..."]) : null);

    // Set the desired page to 'default'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'default'`);
    this.page = "default";

    // Emit a 'closedSubsidiaryLogicalElementTypeSelector' event
    this.log.trace(`${LOG_PREFIX} Emitting a 'closedSubsidiaryLogicalElementTypeSelector' event`);
    this.closedSubsidiaryLogicalElementTypeSelector.emit();

    // Remove any subsidiary related errors
    this.errors.delete("subsidiaryType");

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

    // Validate the logical scheme
    if (!this.getSchemeId()) {

      this.errors.set("scheme", "Logical Scheme is required");
      valid = false;

    }

    // Validate the subsidiary type
    if (!this.getSubsidiaryTypeId()) {

      this.errors.set("subsidiaryType", "Subsidiary Logical Element Type is required");
      valid = false;

    }

    // Clear previous errors if valid
    if (valid) {
      this.errors.delete("scheme");
      this.errors.delete("subsidiaryType");
    }

    return valid;
  }


  /**
   * Validates and saves a new Logical Structures Record.
   * Emits a succeeded or failed event depending on whether the save request succeeded or failed respectively
   * Error 400 = Indicates that a user error was encountered
   * Error 500 = Indicates that a scheme error was encountered
   */
  public save(): void {

    this.log.trace(`${LOG_PREFIX} Entering save()`);

    // Check if the data entry form is valid
    this.log.trace(`${LOG_PREFIX} Checking if the data entry form is valid`);
    if (this.isValid()) {

      // The data entry form is valid
      this.log.trace(`${LOG_PREFIX} The data entry form is valid`);

      // Save the record
      this.log.trace(`${LOG_PREFIX} Saving the Logical Structures Record`);
      this.logicalStructuresDataService
        .createLogicalStructure(
          new LogicalStructure({
            data: {
              hierarchy: { id: this.getSchemeId(), name: this.getSchemeName() },
              commissioner: { id: this.getParentTypeId(), name: this.getParentTypeId()? this.getParentTypeName() : null },
              responsible: { id: this.getSubsidiaryTypeId(), name: this.getSubsidiaryTypeName() },
            },
            version: null
          }))
        .subscribe({
          next: (response: LogicalStructure) => {

            // The Logical Structure Record was saved successfully
            this.log.trace(`${LOG_PREFIX} Logical Structure Record was saved successfuly`);

            // Reset the form
            this.log.trace(`${LOG_PREFIX} Resetting the form`);
            this.logicalStructuresForm.get('parentType.parentTypeId')?.setValue(null);
            this.logicalStructuresForm.get('parentType.parentTypeName')?.setValue("Select parent type");
            this.logicalStructuresForm.get('subsidiaryType.subsidiaryTypeId')?.setValue(null);
            this.logicalStructuresForm.get('subsidiaryType.subsidiaryTypeName')?.setValue("Select subsidiary type");

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The Logical Structure Record was not saved successfully
            this.log.trace(`${LOG_PREFIX} Logical Structure Record was not saved successfuly`);

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
