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
import { WorkflowsDataService } from '@modules/workflows/services/workflows-data.service';
import { WorkflowTransition } from '@modules/workflow-transitions/models/workflow-transition.model';
import { WorkflowTransitionsDataService } from '@modules/workflow-transitions/services/workflow-transitions-data.service';
import { NGXLogger } from 'ngx-logger';
import { FilterService } from '@app/app-filter.service';
import { Observable, of } from 'rxjs';
import { SystemModulePermission } from '@modules/systems-modules-permissions/models/system-module-permission.model';
import { WorkflowStatus } from '@modules/workflow-statuses/models/workflow-status.model';
import { Workflow } from '@modules/workflows/models/workflow.model';

const LOG_PREFIX: string = "[Workflow Transitions Records Updation Component]";

@Component({
  selector: 'sb-workflow-transitions-records-updation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './workflow-transitions-records-updation.component.html',
  styleUrls: ['workflow-transitions-records-updation.component.scss'],
})
export class WorkflowTransitionsRecordsUpdationComponent implements OnInit, OnDestroy {

  // Allows the from component to inject the unique identifier of the target record
  @Input() public id!: number;

  // Broadcasts successful Workflow Transitions updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Workflow Transitions updation events together with their error codes
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Broadcasts selector windows open events
  @Output() public openedFromWorkflowStatusSelector: EventEmitter<void> = new EventEmitter<void>();
  @Output() public openedToWorkflowStatusSelector: EventEmitter<void> = new EventEmitter<void>();
  @Output() public openedWorkflowSelector: EventEmitter<void> = new EventEmitter<void>();
  @Output() public openedPermissionSelector: EventEmitter<void> = new EventEmitter<void>();


  // Broadcasts selector windows close events
  @Output() public closedFromWorkflowStatusSelector: EventEmitter<void> = new EventEmitter<void>();
  @Output() public closedToWorkflowStatusSelector: EventEmitter<void> = new EventEmitter<void>();
  @Output() public closedWorkflowSelector: EventEmitter<void> = new EventEmitter<void>();
  @Output() public closedPermissionSelector: EventEmitter<void> = new EventEmitter<void>();

  // Holds the Workflow Transition record with the passed in id
  public workflowTransition: WorkflowTransition | null | undefined;

  // Keeps tabs of the currently visible content
  page: string = "default";

  // Keeps tabs of the processing errors
  public errors: Map<string, string> = new Map();

  // Keeps tabs of whether the page has been successfully initialised
  public initialised: boolean = false;

  // Defines Workflow Transitions reactive form controls group
  workflowTransitionsForm = new FormGroup({

    workflow: new FormGroup({
      workflowId: new FormControl<number | null | undefined>(null),
      workflowName: new FormControl<string>("Select workflow")
    }),

    fromStatus: new FormGroup({
      fromStatusId: new FormControl<number | null | undefined>(null),
      fromStatusName: new FormControl<string>("Select 'from' status")
    }),

    toStatus: new FormGroup({
      toStatusId: new FormControl<number | null | undefined>(null),
      toStatusName: new FormControl<string>("Select 'to' status")
    }),

    permission: new FormGroup({
      permissionId: new FormControl<number | null | undefined>(null),
      permissionName: new FormControl<string>("Select permission required")
    }),

    verb: new FormControl<string | null>('')

  });



  constructor(
    public workflowsDataService: WorkflowsDataService,
    public workflowTransitionsDataService: WorkflowTransitionsDataService,
    public filterService: FilterService,
    public textUtilService: TextUtilService,
    private cd: ChangeDetectorRef,
    private log: NGXLogger) {

  }


  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Workflow Transition with the passed in id
    this.initialiseWorkflowTransition(() => {

      // Preselect the active workflow in the data tabulation form
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
   * Retrieves the Workflow Transition with the injected id and sets it as the Workflow Transition that needs to be updated
   * @param callback The function to call when done
   */
  private initialiseWorkflowTransition(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseWorkflowTransition()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    // Get the Workflow Transition corresponding to the passed in id
    this.log.trace(`${LOG_PREFIX} Getting the Workflow Transition corresponding to the passed in id`);
    this.getWorkflowTransition$(this.id)
      .subscribe({
        next: (workflowTransition: WorkflowTransition | null) => {

          // Set the target Workflow Transition
          this.log.trace(`${LOG_PREFIX} Setting the target Workflow Transition`);
          this.workflowTransition = workflowTransition;

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

    // Get the Target Workflow
    this.log.trace(`${LOG_PREFIX} Get the Target Workflow`);
    const targetWorkflow: Workflow | null | undefined = this.workflowsDataService.records.find(w => w.id == this.workflowTransition?.data.workflowId);
    this.log.debug(`${LOG_PREFIX} Target Workflow = ${JSON.stringify(targetWorkflow)}`);

    // Preset the Workflow details
    this.log.trace(`${LOG_PREFIX} Presetting the Workflow details`);
    this.workflowTransitionsForm.get('workflow.workflowId')?.setValue(targetWorkflow ? targetWorkflow.id : null);
    this.workflowTransitionsForm.get('workflow.workflowName')?.setValue(targetWorkflow && targetWorkflow.data?.name ? targetWorkflow.data.name : null);

    // Preset the From Status details
    this.log.trace(`${LOG_PREFIX} Presetting the From Status details`);
    this.workflowTransitionsForm.get('fromStatus.fromStatusId')?.setValue(this.workflowTransition && this.workflowTransition.data?.from?.id ? this.workflowTransition.data?.from?.id : null);
    this.workflowTransitionsForm.get('fromStatus.fromStatusName')?.setValue(this.workflowTransition && this.workflowTransition.data?.from?.name ? this.workflowTransition.data?.from?.name : null);

    // Preset the To Status details
    this.log.trace(`${LOG_PREFIX} Presetting the To Status details`);
    this.workflowTransitionsForm.get('toStatus.toStatusId')?.setValue(this.workflowTransition && this.workflowTransition.data?.to?.id ? this.workflowTransition.data?.to?.id : null);
    this.workflowTransitionsForm.get('toStatus.toStatusName')?.setValue(this.workflowTransition && this.workflowTransition.data?.to?.name ? this.workflowTransition.data?.to?.name : null);

    // Preset the Permission details
    this.log.trace(`${LOG_PREFIX} Presetting the Permission details`);
    this.workflowTransitionsForm.get('permission.permissionId')?.setValue(this.workflowTransition && this.workflowTransition.data?.permission?.id ? this.workflowTransition.data?.permission?.id : null);
    this.workflowTransitionsForm.get('permission.permissionName')?.setValue(this.workflowTransition && this.workflowTransition.data?.permission?.name ? this.workflowTransition.data?.permission?.name : null);

    // Preset the Verb details
    this.log.trace(`${LOG_PREFIX} Presetting the Verb details`);
    this.workflowTransitionsForm.get('verb')?.setValue(this.workflowTransition?.data?.verb ? this.workflowTransition?.data?.verb : null);

    // Return
    this.log.trace(`${LOG_PREFIX} Returning`);
    callback();

  }



  /**
  * Retrieves a Workflow Transition record given its unique identifier synchronously
  * @param id The unique identifier of the Workflow Transition
  */
  public getWorkflowTransition$(id: number | null | undefined): Observable<WorkflowTransition | null> {

    this.log.trace(`${LOG_PREFIX} Entering getWorkflowTransition$()`);

    // Check if the Workflow Transition's Id was specified
    this.log.trace(`${LOG_PREFIX} Checking if the Workflow Transition's Id was specified`);
    if (id) {

      // The Workflow Transition's Id was specified
      this.log.trace(`${LOG_PREFIX} The Workflow Transition's Id was specified`);
      this.log.debug(`${LOG_PREFIX} Workflow Transition = ${JSON.stringify(id)}`);

      // Asynchronously get and return the Workflow Transition
      return new Observable(obs => {

        // Try retrieving a Workflow Transition Record with the passed in id
        this.log.trace(`${LOG_PREFIX} Trying to retrieve a Workflow Transition Record with the passed in id`);
        const workflowTransition: WorkflowTransition | undefined = id ? this.workflowTransitionsDataService.records.find(d => d.id == id) : undefined;

        // Check if the Workflow Transition Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} Checking if the Workflow Transition Record was successfully retrieved`);
        if (workflowTransition) {

          // The Workflow Transition Record was successfully retrieved
          this.log.trace(`${LOG_PREFIX} The Workflow Transition Record was successfully retrieved`);
          this.log.debug(`${LOG_PREFIX} Workflow Transition Record = ${JSON.stringify(workflowTransition)}`);

          // Return the Workflow Transition
          this.log.trace(`${LOG_PREFIX} Returning the Workflow Transition`);
          obs.next(workflowTransition);

        } else {

          // The Workflow Transition Record was not successfully retrieved
          this.log.trace(`${LOG_PREFIX} The Workflow Transition Record was not successfully retrieved`);

          // Return null
          this.log.warn(`${LOG_PREFIX} Returning null`);
          obs.next(null);

        }

      });

    } else {

      // The Workflow Transition's Id was not specified
      this.log.trace(`${LOG_PREFIX} The Workflow Transition's Id was not specified`);

      // Return an empty observable
      this.log.trace(`${LOG_PREFIX} Returning an empty observable`);
      return of(null);
    }


  }



  /**
   * Retrieves the id of the Workflow
   * @returns the id
   */
  public getWorkflowId(): number | null | undefined {
    return this.workflowTransitionsForm.get('workflow.workflowId')?.value
  }

  /**
   * Retrieves the name of the workflow
   * @returns the name
   */
  public getWorkflowName(): string | null | undefined {
    return this.workflowTransitionsForm.get('workflow.workflowName')?.value
  }


  /**
   * Retrieves the id of the from type
   * @returns the id
   */
  public getFromStatusId(): number | null | undefined {
    return this.workflowTransitionsForm.get('fromStatus.fromStatusId')?.value
  }


  /**
   * Retrieves the name of the from type
   * @returns the name
   */
  public getFromStatusName(): string | null | undefined {
    return this.workflowTransitionsForm.get('fromStatus.fromStatusName')?.value
  }


  /**
   * Retrieves the id of the to type
   * @returns the id
   */
  public getToStatusId(): number | null | undefined {
    return this.workflowTransitionsForm.get('toStatus.toStatusId')?.value
  }


  /**
   * Retrieves the name of the to type
   * @returns the name
   */
  public getToStatusName(): string | null | undefined {
    return this.workflowTransitionsForm.get('toStatus.toStatusName')?.value
  }

  /**
   * Retrieves the id of the Permission
   * @returns the id
   */
  public getPermissionId(): number | null | undefined {
    return this.workflowTransitionsForm.get('permission.permissionId')?.value
  }

  /**
   * Retrieves the name of the permission
   * @returns the name
   */
  public getPermissionName(): string | null | undefined {
    return this.workflowTransitionsForm.get('permission.permissionName')?.value
  }

  /**
   * Retrieves the verb of the transition
   * @returns the verb
   */
  public getVerb(): string | null | undefined {
    return this.workflowTransitionsForm.get('verb')?.value
  }



  /**
   * Opens the Workflow Selector
   */
  public openWorkflowSelector(): void {

    this.log.trace(`${LOG_PREFIX} Entering openWorkflowSelector()`);

    // Set the desired page to 'workflows'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'workflows'`);
    this.page = "workflows";

    // Emit an 'openedWorkflowSelector' event
    this.log.trace(`${LOG_PREFIX} Emitting an 'openedWorkflowSelector' event`);
    this.openedWorkflowSelector.emit();

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();
  }



  /**
   * Closes the Workflow Selector
   */
  public closeWorkflowSelector(): void {

    this.log.trace(`${LOG_PREFIX} Entering closeWorkflowSelector()`);

    // Set the desired page to 'default'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'default'`);
    this.page = "default";

    // Emit a 'closedWorkflowSelector' event
    this.log.trace(`${LOG_PREFIX} Emitting a 'closedWorkflowSelector' event`);
    this.closedWorkflowSelector.emit();

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();
  }




  /** 
  * Handles Workflow Selection Events
  * @param type The Selected Workflow Status
  */
  public onSelectWorkflow(type: WorkflowStatus): void {

    this.log.trace(`${LOG_PREFIX} Entering onSelectWorkflow()`);
    this.log.debug(`${LOG_PREFIX} Selected Workflow = ${JSON.stringify(type)}`);

    // Set the workflow details
    this.log.trace(`${LOG_PREFIX} Setting the workflow details`);
    this.workflowTransitionsForm.get('workflow.workflowId')?.setValue((type && type.id) ? type.id : null);
    this.workflowTransitionsForm.get('workflow.workflowName')?.setValue((type && type.data.name) ? this.textUtilService.truncate(type.data.name, [35, "..."]) : null);

    // Clear the from details
    this.log.trace(`${LOG_PREFIX} Clearing the from details`);
    this.workflowTransitionsForm.get('fromStatus.fromStatusId')?.setValue(null);
    this.workflowTransitionsForm.get('fromStatus.fromStatusName')?.setValue("Select 'from' status");

    // Clear the to details
    this.log.trace(`${LOG_PREFIX} Clearing the to details`);
    this.workflowTransitionsForm.get('toStatus.toStatusId')?.setValue(null);
    this.workflowTransitionsForm.get('toStatus.toStatusName')?.setValue("Select 'to' status");

    // Clear the permission details
    this.log.trace(`${LOG_PREFIX} Clearing the permission details`);
    this.workflowTransitionsForm.get('permission.permissionId')?.setValue(null);
    this.workflowTransitionsForm.get('permission.permissionName')?.setValue("Select permission required");

    // Set the desired page to 'default'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'default'`);
    this.page = "default";

    // Emit a 'closedWorkflowSelector' event
    this.log.trace(`${LOG_PREFIX} Emitting a 'closedWorkflowSelector' event`);
    this.closedWorkflowSelector.emit();

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();

  }



  /**
   * Opens the From Workflow Status Selector
   */
  public openFromWorkflowStatusSelector(): void {

    this.log.trace(`${LOG_PREFIX} Entering openFromWorkflowStatusSelector()`);

    // Set the desired page to 'from-statuses'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'from-statuses'`);
    this.page = "from-statuses";

    // Emit an 'openedFromWorkflowStatusSelector' event
    this.log.trace(`${LOG_PREFIX} Emitting an 'openedFromWorkflowStatusSelector' event`);
    this.openedFromWorkflowStatusSelector.emit();

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();
  }



  /**
   * Closes the From Workflow Status Selector
   */
  public closeFromWorkflowStatusSelector(): void {

    this.log.trace(`${LOG_PREFIX} Entering closeFromWorkflowStatusSelector()`);

    // Set the desired page to 'default'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'default'`);
    this.page = "default";

    // Emit a 'closedFromWorkflowStatusSelector' event
    this.log.trace(`${LOG_PREFIX} Emitting a 'closedFromWorkflowStatusSelector' event`);
    this.closedFromWorkflowStatusSelector.emit();

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();
  }




  /** 
  * Handles From Workflow Status Selection Events
  * @param type The Selected Workflow Status
  */
  public onSelectFromWorkflowStatus(type: WorkflowStatus): void {

    this.log.trace(`${LOG_PREFIX} Entering onSelectFromWorkflowStatus()`);
    this.log.debug(`${LOG_PREFIX} Selected From Workflow Status = ${JSON.stringify(type)}`);

    // Set the from type details
    this.log.trace(`${LOG_PREFIX} Setting the from type details`);
    this.workflowTransitionsForm.get('fromStatus.fromStatusId')?.setValue((type && type.id) ? type.id : null);
    this.workflowTransitionsForm.get('fromStatus.fromStatusName')?.setValue((type && type.data.name) ? this.textUtilService.truncate(type.data.name, [35, "..."]) : null);

    // Clear the to details
    this.log.trace(`${LOG_PREFIX} Clearing the to details`);
    this.workflowTransitionsForm.get('toStatus.toStatusId')?.setValue(null);
    this.workflowTransitionsForm.get('toStatus.toStatusName')?.setValue("Select 'to' status");

    // Set the desired page to 'default'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'default'`);
    this.page = "default";

    // Emit a 'closedFromWorkflowStatusSelector' event
    this.log.trace(`${LOG_PREFIX} Emitting a 'closedFromWorkflowStatusSelector' event`);
    this.closedFromWorkflowStatusSelector.emit();

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();

  }


  /**
   * Opens the To Workflow Status Selector
   */
  public openToWorkflowStatusSelector(): void {

    this.log.trace(`${LOG_PREFIX} Entering openToWorkflowStatusSelector()`);

    // Set the desired page to 'to-statuses'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'to-statuses'`);
    this.page = "to-statuses";

    // Emit an 'openedToWorkflowStatusSelector' event
    this.log.trace(`${LOG_PREFIX} Emitting an 'openedToWorkflowStatusSelector' event`);
    this.openedToWorkflowStatusSelector.emit();

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();
  }



  /**
   * Closes the To Workflow Status Selector
   */
  public closeToWorkflowStatusSelector(): void {

    this.log.trace(`${LOG_PREFIX} Entering closeToWorkflowStatusSelector()`);

    // Set the desired page to 'default'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'default'`);
    this.page = "default";

    // Emit a 'closedToWorkflowStatusSelector' event
    this.log.trace(`${LOG_PREFIX} Emitting a 'closedToWorkflowStatusSelector' event`);
    this.closedToWorkflowStatusSelector.emit();

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();
  }




  /** 
  * Handles To Workflow Status Selection Events
  * @param type The Selected Workflow Status
  */
  public onSelectToWorkflowStatus(type: WorkflowStatus): void {

    this.log.trace(`${LOG_PREFIX} Entering onSelectToWorkflowStatus()`);
    this.log.debug(`${LOG_PREFIX} Selected To Workflow Status = ${JSON.stringify(type)}`);

    // Update the form
    this.log.trace(`${LOG_PREFIX} Updating the form`);
    this.workflowTransitionsForm.get('toStatus.toStatusId')?.setValue((type && type.id) ? type.id : null);
    this.workflowTransitionsForm.get('toStatus.toStatusName')?.setValue((type && type.data.name) ? this.textUtilService.truncate(type.data.name, [35, "..."]) : null);

    // Set the desired page to 'default'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'default'`);
    this.page = "default";

    // Emit a 'closedToWorkflowStatusSelector' event
    this.log.trace(`${LOG_PREFIX} Emitting a 'closedToWorkflowStatusSelector' event`);
    this.closedToWorkflowStatusSelector.emit();

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();

  }



  /**
   * Opens the Permission Selector
   */
  public openPermissionSelector(): void {

    this.log.trace(`${LOG_PREFIX} Entering openPermissionSelector()`);

    // Set the desired page to 'permissions'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'permissions'`);
    this.page = "permissions";

    // Emit an 'openedPermissionSelector' event
    this.log.trace(`${LOG_PREFIX} Emitting an 'openedPermissionSelector' event`);
    this.openedPermissionSelector.emit();

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();
  }



  /**
   * Closes the Permission Selector
   */
  public closePermissionSelector(): void {

    this.log.trace(`${LOG_PREFIX} Entering closePermissionSelector()`);

    // Set the desired page to 'default'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'default'`);
    this.page = "default";

    // Emit a 'closedPermissionSelector' event
    this.log.trace(`${LOG_PREFIX} Emitting a 'closedPermissionSelector' event`);
    this.closedPermissionSelector.emit();

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();
  }




  /** 
  * Handles Permission Selection Events
  * @param type The Selected Permission Status
  */
  public onSelectPermission(type: SystemModulePermission): void {

    this.log.trace(`${LOG_PREFIX} Entering onSelectPermission()`);
    this.log.debug(`${LOG_PREFIX} Selected Permission = ${JSON.stringify(type)}`);

    // Set the permission details
    this.log.trace(`${LOG_PREFIX} Setting the permission details`);
    this.workflowTransitionsForm.get('permission.permissionId')?.setValue((type && type.id) ? type.id : null);
    this.workflowTransitionsForm.get('permission.permissionName')?.setValue((type && type.data.name) ? this.textUtilService.truncate(type.data.name, [35, "..."]) : null);

    // Set the desired page to 'default'
    this.log.trace(`${LOG_PREFIX} Setting the desired page to 'default'`);
    this.page = "default";

    // Emit a 'closedPermissionSelector' event
    this.log.trace(`${LOG_PREFIX} Emitting a 'closedPermissionSelector' event`);
    this.closedPermissionSelector.emit();

    // Redraw the UI
    this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
    this.cd.detectChanges();

  }


  /**
   * Checks whether the verb is valid
   * @returns True or False 
   */
  private isVerbValid(): boolean {

    let valid: boolean = true;

    // Get the verb
    const verb: string | null | undefined = this.getVerb();

    // Validate the verb
    if (verb) {

      if (verb.trim().length < 2) {
        this.errors.set("verb", "Verb should be at least 2 characters long");
        valid = false;
      }

      if (verb.trim().length > 250) {
        this.errors.set("verb", "Verb should not be more than 250 characters long");
        valid = false;
      }

    } else {
      this.errors.set("verb", "Verb is required");
      valid = false;
    }

    // Clear previous errors if valid
    if (valid) {
      this.errors.delete("verb");
    }

    return valid;
  }



  /**
   * Checks whether all the required inputs have been provided correctly
   * @returns True or False 
   */
  private isValid(): boolean {

    this.log.trace(`${LOG_PREFIX} Entering isValid()`);

    let valid: boolean = true;

    // Validate the Workflow
    if (!this.getWorkflowId()) {

      this.errors.set("workflow", "Workflow is required");
      valid = false;

    }

    // Validate the from type
    if (!this.getFromStatusId()) {

      this.errors.set("fromStatus", "From Status is required");
      valid = false;

    }


    // Validate the to type
    if (!this.getToStatusId()) {

      this.errors.set("toStatus", "To Status is required");
      valid = false;

    }

    // Validate the Permission
    if (!this.getPermissionId()) {

      this.errors.set("permission", "Permission is required");
      valid = false;

    }


    // Validate verb
    if (!this.isVerbValid()) {
      valid = false;
    }

    // Clear previous errors if valid
    if (valid) {
      this.errors.delete("workflow");
      this.errors.delete("fromStatus");
      this.errors.delete("toStatus");
      this.errors.delete("permission");
      this.errors.delete("verb");
    }

    return valid;
  }


  /**
   * Validates and saves a new Workflow Transitions Record.
   * Emits a succeeded or failed event depending on whether the save request succeeded or failed respectively
   * Error 400 = Indicates that a user error was encountered
   * Error 500 = Indicates that a workflow error was encountered
   */
  public save(): void {

    this.log.trace(`${LOG_PREFIX} Entering save()`);

    // Check if the data entry form is valid
    this.log.trace(`${LOG_PREFIX} Checking if the data entry form is valid`);
    if (this.isValid()) {

      // The data entry form is valid
      this.log.trace(`${LOG_PREFIX} The data entry form is valid`);

      // Save the record
      this.log.trace(`${LOG_PREFIX} Saving the Workflow Transitions Record`);
      this.workflowTransitionsDataService
        .updateWorkflowTransition(
          new WorkflowTransition({
            id: this.workflowTransition?.id,
            data: {
              workflowId: this.getWorkflowId(),
              from: { id: this.getFromStatusId(), name: this.getFromStatusName() },
              to: { id: this.getToStatusId(), name: this.getToStatusName() },
              permission: { id: this.getPermissionId(), name: this.getPermissionName() },
              verb: this.getVerb()
            },
            version: this.workflowTransition?.version
          }))
        .subscribe({
          next: (response: WorkflowTransition) => {

            // The Workflow Transition Record was saved successfully
            this.log.trace(`${LOG_PREFIX} Workflow Transition Record was saved successfuly`);

            // Reset the form
            this.log.trace(`${LOG_PREFIX} Resetting the form`);
            this.workflowTransitionsForm.get('fromStatus.fromStatusId')?.setValue(null);
            this.workflowTransitionsForm.get('fromStatus.fromStatusName')?.setValue("Select 'from' status");
            this.workflowTransitionsForm.get('toStatus.toStatusId')?.setValue(null);
            this.workflowTransitionsForm.get('toStatus.toStatusName')?.setValue("Select 'to' status");
            this.workflowTransitionsForm.get('permission.permissionId')?.setValue(null);
            this.workflowTransitionsForm.get('permission.permissionName')?.setValue("Select permission required");

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The Workflow Transition Record was not saved successfully
            this.log.trace(`${LOG_PREFIX} Workflow Transition Record was not saved successfuly`);

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
