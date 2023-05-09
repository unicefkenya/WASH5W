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
import { AdministrativeHierarchy } from '@modules/administrative-hierarchies/models/administrative-hierarchy.model';
import { AdministrativeHierarchiesDataService } from '@modules/administrative-hierarchies/services/administrative-hierarchies-data.service';
import { NGXLogger } from 'ngx-logger';
import { AdministrativeSystem } from '@modules/administrative-systems/models/administrative-system.model';
import { FilterService } from '@app/app-filter.service';
import { AdministrativeStructure } from '@modules/administrative-structures/models/administrative-structure.model';
import { AdministrativeUnit } from '@modules/administrative-units/models/administrative-unit.model';

const LOG_PREFIX: string = "[Administrative Hierarchies Records Creation Component]";

@Component({
  selector: 'sb-administrative-hierarchies-records-creation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './administrative-hierarchies-records-creation.component.html',
  styleUrls: ['administrative-hierarchies-records-creation.component.scss'],
})
export class AdministrativeHierarchiesRecordsCreationComponent implements OnInit, OnDestroy {

  // Allows the parent component to inject the active administrative system
  @Input() public system!: AdministrativeSystem;

  // Allows the parent component to inject the target commissioner
  @Input() public commissioner!: { id: number | null | undefined; name: string | null | undefined; };

  // Allows the parent component to inject the permissible administrative structures
  @Input() public structures!: AdministrativeStructure[];

  // Broadcasts successful Administrative Hierarchies creation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Administrative Hierarchies creation events together with their error codes
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Broadcasts selector windows open events
  @Output() public openedSubsidiaryAdministrativeUnitSelector: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts selector windows close events
  @Output() public closedSubsidiaryAdministrativeUnitSelector: EventEmitter<void> = new EventEmitter<void>();


  // Keeps tabs of the currently visible content
  page: string = "default";

  // Keeps tabs of the processing errors
  public errors: Map<string, string> = new Map();

  // Keeps tabs of whether the page has been successfully initialised
  public initialised: boolean = false;

  // Defines Administrative Hierarchies reactive form controls group
  administrativeHierarchiesForm = new FormGroup({

    system: new FormGroup({
      systemId: new FormControl<number | null | undefined>(null),
      systemName: new FormControl<string>("")
    }),

    commissioner: new FormGroup({
      commissionerId: new FormControl<number | null | undefined>(null),
      commissionerName: new FormControl<string>("")
    }),

    responsible: new FormGroup({
      responsibleId: new FormControl<number | null | undefined>(null),
      responsibleTypeId: new FormControl<number | null | undefined>(null),
      responsibleName: new FormControl<string>("Select subsidiary")
    }),

  });

  constructor(
    public administrativeSystemsDataService: AdministrativeSystemsDataService,
    public administrativeHierarchiesDataService: AdministrativeHierarchiesDataService,
    public filterService: FilterService,
    public textUtilService: TextUtilService,
    private cd: ChangeDetectorRef,
    private log: NGXLogger) {

  }


  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Preselect the active system in the data tabulation form
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

    // Preselect the Active Administrative System
    this.log.trace(`${LOG_PREFIX} Preselecting the Active Administrative System`);
    this.administrativeHierarchiesForm.get('system.systemId')?.setValue(this.system ? this.system.id : null);
    this.administrativeHierarchiesForm.get('system.systemName')?.setValue(this.system && this.system.data?.name ? this.system.data.name : null);

    // Preselect the Active Commissioner
    this.log.trace(`${LOG_PREFIX} Preselecting the Active Commissioner`);
    this.administrativeHierarchiesForm.get('commissioner.commissionerId')?.setValue(this.commissioner ? this.commissioner.id : null);
    this.administrativeHierarchiesForm.get('commissioner.commissionerName')?.setValue(this.commissioner && this.commissioner.name ? this.commissioner.name : null);    

    // Return
    this.log.trace(`${LOG_PREFIX} Returning`);
    callback();

  }


  /**
   * Retrieves the id of the administrative system
   * @returns the id
   */
  public getSystemId(): number | null | undefined {
    return this.administrativeHierarchiesForm.get('system.systemId')?.value
  }

  /**
   * Retrieves the name of the system
   * @returns the name
   */
  public getSystemName(): string | null | undefined {
    return this.administrativeHierarchiesForm.get('system.systemName')?.value
  }


  /**
   * Retrieves the id of the commissioner
   * @returns the id
   */
  public getCommissionerId(): number | null | undefined {
    return this.administrativeHierarchiesForm.get('commissioner.commissionerId')?.value
  }


  /**
   * Retrieves the name of the commissioner
   * @returns the name
   */
  public getCommissionerName(): string | null | undefined {
    return this.administrativeHierarchiesForm.get('commissioner.commissionerName')?.value
  }


  /**
   * Retrieves the id of the responsible
   * @returns the id
   */
  public getResponsibleId(): number | null | undefined {
    return this.administrativeHierarchiesForm.get('responsible.responsibleId')?.value
  }

  /**
   * Retrieves the type id of the responsible
   * @returns the type id
   */
  public getResponsibleTypeId(): number | null | undefined {
    return this.administrativeHierarchiesForm.get('responsible.responsibleTypeId')?.value
  }


  /**
   * Retrieves the name of the responsible
   * @returns the name
   */
  public getResponsibleName(): string | null | undefined {
    return this.administrativeHierarchiesForm.get('responsible.responsibleName')?.value
  }

  /**
   * Retrieves the ids of the permissible administrative units types as at the time of creating a hierarchy record
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
   * Retrieves the id of the administrative structure whose subsidiary is the passed in administrative unit type id
   * @param administrativeUnitTypeId the passed in administrative unit type id
   * @returns the administrative structure id
   */
  public getAdministrativeStructureId(administrativeUnitTypeId: number | null | undefined): number | null {

    if (administrativeUnitTypeId) {

      let administrativeStructure: AdministrativeStructure | undefined = undefined;

      if (this.structures) {
        administrativeStructure = this.structures.find(s => s.data.responsible?.id == administrativeUnitTypeId);
      }

      return administrativeStructure ? administrativeStructure.id : null;

    } else {
      return null;
    }


  }


  /**
   * Opens the Subsidiary Administrative Unit Selector
   */
  public openSubsidiaryAdministrativeUnitSelector(): void {

    this.log.trace(`${LOG_PREFIX} Entering openSubsidiaryAdministrativeUnitSelector()`);

    // Set the desired page to 'subsidiary-units'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'subsidiary-units'`);
    this.page = "subsidiary-units";

    // Emit an 'openedSubsidiaryAdministrativeUnitSelector' event
    this.log.trace(`${LOG_PREFIX} Emitting an 'openedSubsidiaryAdministrativeUnitSelector' event`);
    this.openedSubsidiaryAdministrativeUnitSelector.emit();

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();
  }


  /**
   * Closes the Subsidiary Administrative Unit Selector
   */
  public closeSubsidiaryAdministrativeUnitSelector(): void {

    this.log.trace(`${LOG_PREFIX} Entering closeSubsidiaryAdministrativeUnitSelector()`);

    // Set the desired page to 'default'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'default'`);
    this.page = "default";

    // Emit a 'closedSubsidiaryAdministrativeUnitSelector' event
    this.log.trace(`${LOG_PREFIX} Emitting a 'closedSubsidiaryAdministrativeUnitSelector' event`);
    this.closedSubsidiaryAdministrativeUnitSelector.emit();

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();
  }




  /** 
  * Handles Subsidiary Administrative Unit Selection Events
  * @param unit The Selected Administrative Unit
  */
  public onSelectSubsidiaryAdministrativeUnit(unit: AdministrativeUnit): void {

    this.log.trace(`${LOG_PREFIX} Entering onSelectSubsidiaryAdministrativeUnit()`);
    this.log.debug(`${LOG_PREFIX} Selected Subsidiary Administrative Unit = ${JSON.stringify(unit)}`);

    // Update the form
    this.log.trace(`${LOG_PREFIX} Updating the form`);
    this.administrativeHierarchiesForm.get('responsible.responsibleId')?.setValue((unit && unit.id) ? unit.id : null);
    this.administrativeHierarchiesForm.get('responsible.responsibleTypeId')?.setValue((unit && unit.data.typeId) ? unit.data.typeId : null);
    this.administrativeHierarchiesForm.get('responsible.responsibleName')?.setValue((unit && unit.data.name) ? this.textUtilService.truncate(unit.data.name, [35, "..."]) : null);

    // Set the desired page to 'default'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'default'`);
    this.page = "default";

    // Emit a 'closedSubsidiaryAdministrativeUnitSelector' event
    this.log.trace(`${LOG_PREFIX} Emitting a 'closedSubsidiaryAdministrativeUnitSelector' event`);
    this.closedSubsidiaryAdministrativeUnitSelector.emit();

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

      this.errors.set("responsible", "Subsidiary Administrative Unit is required");
      valid = false;

    }

    // Clear previous errors if valid
    if (valid) {
      this.errors.delete("responsible");
    }

    return valid;
  }


  /**
   * Validates and saves a new Administrative Hierarchies Record.
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
      this.log.trace(`${LOG_PREFIX} Saving the Administrative Hierarchies Record`);
      this.administrativeHierarchiesDataService
        .createAdministrativeHierarchy(
          new AdministrativeHierarchy({
            data: {
              type: { id: this.getAdministrativeStructureId(this.getResponsibleTypeId()) },
              commissioner: this.commissioner,
              responsible: { id: this.getResponsibleId(), name: this.getResponsibleName() }
            },
            version: null
          }))
        .subscribe({
          next: (response: AdministrativeHierarchy) => {

            // The Administrative Hierarchy Record was saved successfully
            this.log.trace(`${LOG_PREFIX} Administrative Hierarchy Record was saved successfuly`);

            // Reset the form
            this.log.trace(`${LOG_PREFIX} Resetting the form`);
            this.administrativeHierarchiesForm.get('responsible.responsibleId')?.setValue(null);
            this.administrativeHierarchiesForm.get('responsible.responsibleTypeId')?.setValue(null);
            this.administrativeHierarchiesForm.get('responsible.responsibleName')?.setValue("Select subsidiary");

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The Administrative Hierarchy Record was not saved successfully
            this.log.trace(`${LOG_PREFIX} Administrative Hierarchy Record was not saved successfuly`);

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
