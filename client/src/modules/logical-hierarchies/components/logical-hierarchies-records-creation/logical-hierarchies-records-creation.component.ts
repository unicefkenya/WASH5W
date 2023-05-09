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
import { LogicalHierarchy } from '@modules/logical-hierarchies/models/logical-hierarchy.model';
import { LogicalHierarchiesDataService } from '@modules/logical-hierarchies/services/logical-hierarchies-data.service';
import { NGXLogger } from 'ngx-logger';
import { LogicalScheme } from '@modules/logical-schemes/models/logical-scheme.model';
import { FilterService } from '@app/app-filter.service';
import { LogicalStructure } from '@modules/logical-structures/models/logical-structure.model';
import { LogicalElement } from '@modules/logical-elements/models/logical-element.model';

const LOG_PREFIX: string = "[Logical Hierarchies Records Creation Component]";

@Component({
  selector: 'sb-logical-hierarchies-records-creation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './logical-hierarchies-records-creation.component.html',
  styleUrls: ['logical-hierarchies-records-creation.component.scss'],
})
export class LogicalHierarchiesRecordsCreationComponent implements OnInit, OnDestroy {

  // Allows the parent component to inject the active logical scheme
  @Input() public scheme!: LogicalScheme;

  // Allows the parent component to inject the target commissioner
  @Input() public commissioner!: { id: number | null | undefined; name: string | null | undefined; };

  // Allows the parent component to inject the permissible logical structures
  @Input() public structures!: LogicalStructure[];

  // Broadcasts successful Logical Hierarchies creation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Logical Hierarchies creation events together with their error codes
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Broadcasts selector windows open events
  @Output() public openedSubsidiaryLogicalElementSelector: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts selector windows close events
  @Output() public closedSubsidiaryLogicalElementSelector: EventEmitter<void> = new EventEmitter<void>();


  // Keeps tabs of the currently visible content
  page: string = "default";

  // Keeps tabs of the processing errors
  public errors: Map<string, string> = new Map();

  // Keeps tabs of whether the page has been successfully initialised
  public initialised: boolean = false;

  // Defines Logical Hierarchies reactive form controls group
  logicalHierarchiesForm = new FormGroup({

    scheme: new FormGroup({
      schemeId: new FormControl<number | null | undefined>(null),
      schemeName: new FormControl<string>("")
    }),

    commissioner: new FormGroup({
      commissionerId: new FormControl<number | null | undefined>(null),
      commissionerName: new FormControl<string>("")
    }),

    responsible: new FormGroup({
      responsibleId: new FormControl<number | null | undefined>(null),
      responsibleTypeId: new FormControl<number | null | undefined>(null),
      responsibleName: new FormControl<string>("Select subsidiary element")
    }),

  });

  constructor(
    public logicalSchemesDataService: LogicalSchemesDataService,
    public logicalHierarchiesDataService: LogicalHierarchiesDataService,
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

    // Preselect the Active Logical Scheme
    this.log.trace(`${LOG_PREFIX} Preselecting the Active Logical Scheme`);
    this.logicalHierarchiesForm.get('scheme.schemeId')?.setValue(this.scheme ? this.scheme.id : null);
    this.logicalHierarchiesForm.get('scheme.schemeName')?.setValue(this.scheme && this.scheme.data?.name ? this.scheme.data.name : null);

    // Preselect the Active Commissioner
    this.log.trace(`${LOG_PREFIX} Preselecting the Active Commissioner`);
    this.logicalHierarchiesForm.get('commissioner.commissionerId')?.setValue(this.commissioner ? this.commissioner.id : null);
    this.logicalHierarchiesForm.get('commissioner.commissionerName')?.setValue(this.commissioner && this.commissioner.name ? this.commissioner.name : null);    

    // Return
    this.log.trace(`${LOG_PREFIX} Returning`);
    callback();

  }


  /**
   * Retrieves the id of the logical scheme
   * @returns the id
   */
  public getSchemeId(): number | null | undefined {
    return this.logicalHierarchiesForm.get('scheme.schemeId')?.value
  }

  /**
   * Retrieves the name of the scheme
   * @returns the name
   */
  public getSchemeName(): string | null | undefined {
    return this.logicalHierarchiesForm.get('scheme.schemeName')?.value
  }


  /**
   * Retrieves the id of the commissioner
   * @returns the id
   */
  public getCommissionerId(): number | null | undefined {
    return this.logicalHierarchiesForm.get('commissioner.commissionerId')?.value
  }


  /**
   * Retrieves the name of the commissioner
   * @returns the name
   */
  public getCommissionerName(): string | null | undefined {
    return this.logicalHierarchiesForm.get('commissioner.commissionerName')?.value
  }


  /**
   * Retrieves the id of the responsible
   * @returns the id
   */
  public getResponsibleId(): number | null | undefined {
    return this.logicalHierarchiesForm.get('responsible.responsibleId')?.value
  }

  /**
   * Retrieves the type id of the responsible
   * @returns the type id
   */
  public getResponsibleTypeId(): number | null | undefined {
    return this.logicalHierarchiesForm.get('responsible.responsibleTypeId')?.value
  }


  /**
   * Retrieves the name of the responsible
   * @returns the name
   */
  public getResponsibleName(): string | null | undefined {
    return this.logicalHierarchiesForm.get('responsible.responsibleName')?.value
  }

  /**
   * Retrieves the ids of the permissible logical elements types as at the time of creating a hierarchy record
   * @returns the ids
   */
  public getPermissibleUnitTypesIds(): number[] {

    const unitTypesIds: number[] = [];

    if (this.structures) {
      for (let struct of this.structures) {
        if (struct.data.responsible?.id) {
          unitTypesIds.push(struct.data.responsible.id);
        }
      }
    }

    return unitTypesIds;


  }

  /**
   * Retrieves the logical structure whose subsidiary is the passed in logical element type id
   * @param logicalElementTypeId the passed in logical element type id
   * @returns the logical structure
   */
  public getLogicalStructure(logicalElementTypeId: number | null | undefined): LogicalStructure | null {

    if (logicalElementTypeId) {

      let logicalStructure: LogicalStructure | undefined = undefined;

      if (this.structures) {
        logicalStructure = this.structures.find(s => s.data.responsible?.id == logicalElementTypeId);
      }

      return logicalStructure? logicalStructure : null;

    } else {
      return null;
    }


  }


  /**
   * Opens the Subsidiary Logical Element Selector
   */
  public openSubsidiaryLogicalElementSelector(): void {

    this.log.trace(`${LOG_PREFIX} Entering openSubsidiaryLogicalElementSelector()`);

    // Set the desired page to 'subsidiary-units'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'subsidiary-units'`);
    this.page = "subsidiary-units";

    // Emit an 'openedSubsidiaryLogicalElementSelector' event
    this.log.trace(`${LOG_PREFIX} Emitting an 'openedSubsidiaryLogicalElementSelector' event`);
    this.openedSubsidiaryLogicalElementSelector.emit();

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();
  }


  /**
   * Closes the Subsidiary Logical Element Selector
   */
  public closeSubsidiaryLogicalElementSelector(): void {

    this.log.trace(`${LOG_PREFIX} Entering closeSubsidiaryLogicalElementSelector()`);

    // Set the desired page to 'default'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'default'`);
    this.page = "default";

    // Emit a 'closedSubsidiaryLogicalElementSelector' event
    this.log.trace(`${LOG_PREFIX} Emitting a 'closedSubsidiaryLogicalElementSelector' event`);
    this.closedSubsidiaryLogicalElementSelector.emit();

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();
  }




  /** 
  * Handles Subsidiary Logical Element Selection Events
  * @param unit The Selected Logical Element
  */
  public onSelectSubsidiaryLogicalElement(unit: LogicalElement): void {

    this.log.trace(`${LOG_PREFIX} Entering onSelectSubsidiaryLogicalElement()`);
    this.log.debug(`${LOG_PREFIX} Selected Subsidiary Logical Element = ${JSON.stringify(unit)}`);

    // Update the form
    this.log.trace(`${LOG_PREFIX} Updating the form`);
    this.logicalHierarchiesForm.get('responsible.responsibleId')?.setValue((unit && unit.id) ? unit.id : null);
    this.logicalHierarchiesForm.get('responsible.responsibleTypeId')?.setValue((unit && unit.data.typeId) ? unit.data.typeId : null);
    this.logicalHierarchiesForm.get('responsible.responsibleName')?.setValue((unit && unit.data.name) ? this.textUtilService.truncate(unit.data.name, [35, "..."]) : null);

    // Set the desired page to 'default'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'default'`);
    this.page = "default";

    // Emit a 'closedSubsidiaryLogicalElementSelector' event
    this.log.trace(`${LOG_PREFIX} Emitting a 'closedSubsidiaryLogicalElementSelector' event`);
    this.closedSubsidiaryLogicalElementSelector.emit();

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

    // Validate the responsible
    if (!this.getResponsibleId()) {

      this.errors.set("responsible", "Subsidiary Logical Element is required");
      valid = false;

    }

    // Clear previous errors if valid
    if (valid) {
      this.errors.delete("responsible");
    }

    return valid;
  }


  /**
   * Validates and saves a new Logical Hierarchies Record.
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

      // Get the target accountability type (i.e. logical structure)
      this.log.trace(`${LOG_PREFIX} Getting the target accountability type (i.e. logical structure)`);
      const logicalStructure: LogicalStructure | null = this.getLogicalStructure(this.getResponsibleTypeId());

      // Save the record
      this.log.trace(`${LOG_PREFIX} Saving the Logical Hierarchies Record`);
      this.logicalHierarchiesDataService
        .createLogicalHierarchy(
          new LogicalHierarchy({
            data: {
              context: {id: this.filterService.filter.activeContext?.id},
              type: { id: logicalStructure? logicalStructure.id: null, name: logicalStructure? logicalStructure.data.responsible?.name : null  },
              commissioner: this.commissioner,
              responsible: { id: this.getResponsibleId(), name: this.getResponsibleName() }
            },
            version: null
          }))
        .subscribe({
          next: (response: LogicalHierarchy) => {

            // The Logical Hierarchy Record was saved successfully
            this.log.trace(`${LOG_PREFIX} Logical Hierarchy Record was saved successfuly`);

            // Reset the form
            this.log.trace(`${LOG_PREFIX} Resetting the form`);
            this.logicalHierarchiesForm.get('responsible.responsibleId')?.setValue(null);
            this.logicalHierarchiesForm.get('responsible.responsibleTypeId')?.setValue(null);
            this.logicalHierarchiesForm.get('responsible.responsibleName')?.setValue("Select subsidiary element");

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The Logical Hierarchy Record was not saved successfully
            this.log.trace(`${LOG_PREFIX} Logical Hierarchy Record was not saved successfuly`);

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
