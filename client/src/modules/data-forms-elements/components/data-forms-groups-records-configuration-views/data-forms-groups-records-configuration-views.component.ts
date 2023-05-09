import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  Input,
  OnInit
} from '@angular/core';
import { FilterService } from '@app/app-filter.service';
import { TextUtilService } from '@common/services/text-util.service';
import { DataFormElementType } from '@modules/data-forms-elements-types/models/data-form-element-type.model';
import { DataFormsElementsTypesDataService } from '@modules/data-forms-elements-types/services/data-forms-elements-types-data.service';
import { DataFormElement } from '@modules/data-forms-elements/models/data-form-element.model';
import { DataFormsElementsDataService } from '@modules/data-forms-elements/services/data-forms-elements-data.service';
import { NGXLogger } from 'ngx-logger';
import { Observable, first, of, forkJoin, BehaviorSubject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataFormsFieldsRecordsUpdationModalComponent } from '@modules/data-forms-elements/containers/data-forms-fields-records-updation-modal/data-forms-fields-records-updation-modal.component';
import { DataFormsFieldsRecordsDeletionModalComponent } from '@modules/data-forms-elements/containers/data-forms-fields-records-deletion-modal/data-forms-fields-records-deletion-modal.component';
import { DataFormsGroupsRecordsCreationModalComponent } from '@modules/data-forms-elements/containers/data-forms-groups-records-creation-modal/data-forms-groups-records-creation-modal.component';
import { DataFormsFieldsRecordsCreationModalComponent } from '@modules/data-forms-elements/containers/data-forms-fields-records-creation-modal/data-forms-fields-records-creation-modal.component';
import { DataFormsGroupsRecordsUpdationModalComponent } from '@modules/data-forms-elements/containers/data-forms-groups-records-updation-modal/data-forms-groups-records-updation-modal.component';
import { DataFormsGroupsRecordsDeletionModalComponent } from '@modules/data-forms-elements/containers/data-forms-groups-records-deletion-modal/data-forms-groups-records-deletion-modal.component';
import { DataFormsFieldsResponsesService } from '@modules/data-forms-elements/services/data-forms-fields-responses.service';
import { DataFormFieldResponse } from '@modules/data-forms-elements/models/data-form-field-response.model';

const LOG_PREFIX: string = "[Data Form Groups Records Configuration Views Component]";

@Component({
  selector: 'sb-data-forms-groups-records-configuration-views',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './data-forms-groups-records-configuration-views.component.html',
  styleUrls: ['data-forms-groups-records-configuration-views.component.scss'],
})
export class DataFormsGroupsRecordsConfigurationViewsComponent implements OnInit {

  // Allows the parent component to inject the target record group
  @Input() public dataFormElement: DataFormElement | null | undefined;

  // Allows the parent component to inject the target group's nested data form elements
  @Input() public nestedDataFormElements: DataFormElement[] | undefined;

  // Allows the parent component to assign the current display position an odd or even position
  @Input() public odd: boolean = true;

  // Keep tabs on the field type
  public dataFormElementType!: DataFormElementType | null;

  // Keeps tabs of the currently visible content
  public page: string = "default";

  // Keeps tabs of whether data form elements are being reordered
  private reorderingSubject$ = new BehaviorSubject<boolean>(false);
  readonly reordering$ = this.reorderingSubject$.asObservable();

  // Keeps tabs of whether the page has been successfully initialised
  public initialised: boolean = false;

  public descriptionCollapsed: boolean = true;

  constructor(
    public dataFormsElementsDataService: DataFormsElementsDataService,
    public dataFormsElementsTypesDataService: DataFormsElementsTypesDataService,
    public dataFormsResponsesService: DataFormsFieldsResponsesService,
    public filterService: FilterService,
    public textUtilService: TextUtilService,
    public modalService: NgbModal,
    private cd: ChangeDetectorRef,
    private log: NGXLogger) {

  }


  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    this.initialiseDataFormFieldType(() => {

      // Mark init as complete
      this.log.trace(`${LOG_PREFIX} Init completed`);
      this.initialised = true;
      this.cd.detectChanges();

    });



  }


  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }


  /**
 * Creates a local copy of the type of the Data Form Element
 * @param callback The function to call when done
 */
  private initialiseDataFormFieldType(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseDataFormFieldType()`);

    this.getDataFormFieldType$(this.dataFormElement?.data.typeId)
      .subscribe({
        next: (type: DataFormElementType | null) => {

          this.dataFormElementType = type;

          // Transfer control to the callback function
          this.log.trace(`${LOG_PREFIX} Returning`);
          callback();

        }
      })

  }


  /**
  * Retrieves a Data Form Element Type record given its unique identifier synchronously
  * @param id The unique identifier of the Data Form Element Type
  */
  public getDataFormFieldType$(id: number | null | undefined): Observable<DataFormElementType | null> {

    this.log.trace(`${LOG_PREFIX} Entering getDataFormFieldType$()`);

    // Check if Data Form Element Type's Id was specified
    this.log.trace(`${LOG_PREFIX} Checking if Data Form Element Type's Id was specified`);
    if (id) {

      // The Data Form Element Type's Id was specified
      this.log.trace(`${LOG_PREFIX} The Data Form Element Type's Id was specified`);
      this.log.debug(`${LOG_PREFIX} Data Form Element Type = ${JSON.stringify(id)}`);

      // Asynchronously get the Data Form Element Type's operators
      this.log.trace(`${LOG_PREFIX} Asynchronously getting the Data Form Element Type's operators`);
      return new Observable(obs => {

        // Get the Data Form Element's Data Form Element Type
        this.dataFormsElementsTypesDataService.getDataFormElementTypeById$(id)
          .pipe(first())
          .subscribe({
            next: (value: DataFormElementType) => {

              // Return the operators
              this.log.trace(`${LOG_PREFIX} Returning the operators`);
              obs.next(value);
            }
          });
      });

    } else {

      // The Data Form Element Type's Id was not specified
      this.log.trace(`${LOG_PREFIX} The Data Form Element Type's Id was not specified`);

      // Return an empty observable
      this.log.trace(`${LOG_PREFIX} Returning an empty observable`);
      return of(null);
    }


  }



  /**
   * Retrieves the data form elements that belong to the parent with the specified id
   * @param parentId the parent id
   * @returns the data form elements
   */
  public getNestedDataFormElements(parentId: number): DataFormElement[] | undefined {
    return this.dataFormsElementsDataService.nestedDataFormElements.get(parentId);
  }



  /**
   * Retrieves the data form field with the specified id
   * @param id the data form field's id
   * @returns the data form field if it exists
   */
  public getDataFormResponse(id: number): DataFormFieldResponse | undefined {
    return this.dataFormsResponsesService.getResponse(id);
  }



  /**
   * Handles Data Forms Elements Records Addition Requests
   * @typeId The unique identifier of the category of element that needs to be added
   */
  public onAddDataFormElement(categoryId: number): void {

    this.log.trace(`${LOG_PREFIX} Entering onAddDataFormElement()`);
    this.log.debug(`${LOG_PREFIX} Data Form Element Category Id = ${categoryId}`);

    // Check what category of element needs to be added
    switch (categoryId) {

      case 1:

        // A group needs to be added
        // Open the group addition modal
        this.log.trace(`${LOG_PREFIX} Opening the group addition modal`);
        const groupModalRef = this.modalService.open(DataFormsGroupsRecordsCreationModalComponent, { centered: true, backdrop: 'static' });
        groupModalRef.componentInstance.contextId = this.filterService.filter.activeContext?.id;
        groupModalRef.componentInstance.dataFormId = this.filterService.filter.activeDataForm?.id;
        groupModalRef.componentInstance.parentId = this.dataFormElement?.id;

        break;

      case 2:

        // A field needs to be added
        // Open the field addition modal
        this.log.trace(`${LOG_PREFIX} Opening the field addition modal`);
        const fieldModalRef = this.modalService.open(DataFormsFieldsRecordsCreationModalComponent, { centered: true, backdrop: 'static' });
        fieldModalRef.componentInstance.contextId = this.filterService.filter.activeContext?.id;
        fieldModalRef.componentInstance.dataFormId = this.filterService.filter.activeDataForm?.id;
        fieldModalRef.componentInstance.parentId = this.dataFormElement?.id;

        break;

      default:
        this.log.trace(`${LOG_PREFIX} Unsupported element type`);

    }

  }



  /**
   * Handles Data Forms Elements Records Updation Requests
   * @param id The unique identifier of the Data Form record to update
   * @typeId The unique identifier of the category of element that needs to be updated
   */
  public onUpdateDataFormElement(id: number, categoryId: number): void {

    this.log.trace(`${LOG_PREFIX} Entering onUpdateDataForm()`);
    this.log.debug(`${LOG_PREFIX} Data Form Record Id = ${id}`);
    this.log.debug(`${LOG_PREFIX} Data Form Element Category Id = ${categoryId}`);

    // Check what category of element needs to be updated
    switch (categoryId) {

      case 1:

        // A group needs to be updated
        // Open the group updation modal
        this.log.trace(`${LOG_PREFIX} Opening the group updation modal`);
        const groupModalRef = this.modalService.open(DataFormsGroupsRecordsUpdationModalComponent, { centered: true, backdrop: 'static' });
        groupModalRef.componentInstance.id = id;
        groupModalRef.componentInstance.contextId = this.filterService.filter.activeContext?.id;
        groupModalRef.componentInstance.dataFormId = this.filterService.filter.activeDataForm?.id;

        break;

      case 2:

        // A field needs to be updated
        // Open the field updation modal
        this.log.trace(`${LOG_PREFIX} Opening the field updation modal`);
        const fieldModalRef = this.modalService.open(DataFormsFieldsRecordsUpdationModalComponent, { centered: true, backdrop: 'static' });
        fieldModalRef.componentInstance.id = id;
        fieldModalRef.componentInstance.contextId = this.filterService.filter.activeContext?.id;
        fieldModalRef.componentInstance.dataFormId = this.filterService.filter.activeDataForm?.id;

        break;

      default:
        this.log.trace(`${LOG_PREFIX} Unsupported element type`);

    }

  }

  /**
   * Handles Data Forms Records Deletion Requests
   * @param id The unique identifier of the Data Form record to delete
   * @typeId The unique identifier of the category of element that needs to be deleted
   */
  public onDeleteDataFormElement(id: number, categoryId: number): void {

    this.log.trace(`${LOG_PREFIX} Entering onDeleteDataForm()`);
    this.log.debug(`${LOG_PREFIX} Data Form Record Id = ${id}`);
    this.log.debug(`${LOG_PREFIX} Data Form Element Category Id = ${categoryId}`);

    // Check what category of element needs to be deleted
    switch (categoryId) {

      case 1:

        // A group needs to be deleted
        // Open the group deletion modal
        this.log.trace(`${LOG_PREFIX} Opening the group deletion modal`);
        const groupModalRef = this.modalService.open(DataFormsGroupsRecordsDeletionModalComponent, { centered: true, backdrop: 'static' });
        groupModalRef.componentInstance.id = id;

        break;

      case 2:

        // A field needs to be deleted
        // Open the field deletion modal
        this.log.trace(`${LOG_PREFIX} Opening the field deletion modal`);
        const fieldModalRef = this.modalService.open(DataFormsFieldsRecordsDeletionModalComponent, { centered: true, backdrop: 'static' });
        fieldModalRef.componentInstance.id = id;

        break;

      default:
        this.log.trace(`${LOG_PREFIX} Unsupported element type`);

    }

  }


  /**
   * Handles Groups Copy Requests
   * @param id The unique identifier of the Group to copy
   */
  public onCopyGroup(id: number): void {

    this.log.trace(`${LOG_PREFIX} Entering onCopyGroup()`);
    this.log.debug(`${LOG_PREFIX} Group Id = ${id}`);

    this.dataFormsElementsDataService.getDataFormsElementsRecursively(id)
      .pipe(first())
      .subscribe({
        next: (value: DataFormElement[]) => {
          this.updateAndSaveDataFormGroupElements(id, value);
        }
      });

  }


  /**
  * Handles stepwise moving up of groups
  * @param dataFormElement The group to be moved up
  */
  public onMoveUpGroup(group: DataFormElement | null | undefined): void {

    this.log.trace(`${LOG_PREFIX} Entering onMoveUpGroup()`);
    this.log.debug(`${LOG_PREFIX} Group = ${JSON.stringify(group)}`);

    // Check if the required group details are present
    this.log.trace(`${LOG_PREFIX} Checking if the required group details are present`);
    if (group && group.data.dataFormId && group.data.index) {

      // The required group details are present
      this.log.trace(`${LOG_PREFIX} The required group details are present`);

      // Flag re-ordering as ongoing
      this.log.trace(`${LOG_PREFIX} Flagging re-ordering as ongoing`);
      this.reorderingSubject$.next(true);

      // Get the target group's predecessor
      this.log.trace(`${LOG_PREFIX} Getting the target group's predecessor`);
      this.dataFormsElementsDataService
        .getPrecedingDataFormElement(group.data.dataFormId, group.data.parentId, group.data.index)
        .subscribe({
          next: (predecessor: DataFormElement | null) => {

            // Check if a predecessor was successfully retrieved
            this.log.trace(`${LOG_PREFIX} Checking if a predecessor was successfully retrieved`);
            if (predecessor) {

              // A predecessor was successfully retrieved
              this.log.trace(`${LOG_PREFIX} A predecessor was successfully retrieved`);
              this.log.debug(`${LOG_PREFIX} Predecessor = ${JSON.stringify(predecessor)}`);

              // Interchange the data form elements indices
              this.log.trace(`${LOG_PREFIX} Interchanging the data form elements indices`);
              const _predecessor: DataFormElement = { ...predecessor, data: { ...predecessor.data, index: group.data.index } };
              const _group: DataFormElement = { ...group, data: { ...group.data, index: predecessor.data.index } };

              // Save the update
              this.log.trace(`${LOG_PREFIX} Saving the update`);
              this.dataFormsElementsDataService
                .updateDataFormElements([_predecessor, _group])
                .subscribe({
                  next: (res: DataFormElement[]) => {

                    // Data form elements successfully reordered
                    this.log.trace(`${LOG_PREFIX} Data form elements successfully reordered`);

                    // Unflag re-ordering as ongoing
                    this.log.trace(`${LOG_PREFIX} Unflagging re-ordering as ongoing`);
                    this.reorderingSubject$.next(false);
                  },
                  error: (err: any) => {
                    // Data form elements reordering failed
                    this.log.error(`${LOG_PREFIX} Data form elements reordering failed`);

                    // Unflag re-ordering as ongoing
                    this.log.trace(`${LOG_PREFIX} Unflagging re-ordering as ongoing`);
                    this.reorderingSubject$.next(false);
                  }

                });

            } else {

              // A predecessor was not successfully retrieved
              this.log.trace(`${LOG_PREFIX} A predecessor was not successfully retrieved`);

              // Re-ordering is redundant
              this.log.trace(`${LOG_PREFIX} Re-ordering is redundant`);

              // Unflag re-ordering as ongoing
              this.log.trace(`${LOG_PREFIX} Unflagging re-ordering as ongoing`);
              this.reorderingSubject$.next(false);



            }
          },
          error: (err: any) => {

            // Could not successfully get the target group's predecessor
            this.log.error(`${LOG_PREFIX} Could not successfully get the target group's predecessor`);

            // Unflag re-ordering as ongoing
            this.log.trace(`${LOG_PREFIX} Unflagging re-ordering as ongoing`);
            this.reorderingSubject$.next(false);
          }

        });



    } else {

      // The required group details are not present
      this.log.error(`${LOG_PREFIX} The required group details are not present`);

    }



  }

  /**
   * Handles stepwise moving down of groups
   * @param dataFormElement The group to be moved down
   */
  public onMoveDownGroup(group: DataFormElement | null | undefined): void {

    this.log.trace(`${LOG_PREFIX} Entering onMoveDownGroup()`);
    this.log.debug(`${LOG_PREFIX} Group = ${JSON.stringify(group)}`);

    // Check if the required group details are present
    this.log.trace(`${LOG_PREFIX} Checking if the required group details are present`);
    if (group && group.data.dataFormId && group.data.index) {

      // The required group details are present
      this.log.trace(`${LOG_PREFIX} The required group details are present`);

      // Flag re-ordering as ongoing
      this.log.trace(`${LOG_PREFIX} Flagging re-ordering as ongoing`);
      this.reorderingSubject$.next(true);

      // Get the target group's successor
      this.log.trace(`${LOG_PREFIX} Getting the target group's successor`);
      this.dataFormsElementsDataService
        .getSucceedingDataFormElement(group.data.dataFormId, group.data.parentId, group.data.index)
        .subscribe({
          next: (successor: DataFormElement | null) => {

            // Check if a successor was successfully retrieved
            this.log.trace(`${LOG_PREFIX} Checking if a successor was successfully retrieved`);
            if (successor) {

              // A successor was successfully retrieved
              this.log.trace(`${LOG_PREFIX} A successor was successfully retrieved`);
              this.log.debug(`${LOG_PREFIX} Successor = ${JSON.stringify(successor)}`);

              // Interchange the data form elements indices
              this.log.trace(`${LOG_PREFIX} Interchanging the data form elements indices`);
              const _successor: DataFormElement = { ...successor, data: { ...successor.data, index: group.data.index } };
              const _group: DataFormElement = { ...group, data: { ...group.data, index: successor.data.index } };

              // Save the update
              this.log.trace(`${LOG_PREFIX} Saving the update`);
              this.dataFormsElementsDataService
                .updateDataFormElements([_successor, _group])
                .subscribe({
                  next: (res: DataFormElement[]) => {

                    // Data form elements successfully reordered
                    this.log.trace(`${LOG_PREFIX} Data form elements successfully reordered`);

                    // Unflag re-ordering as ongoing
                    this.log.trace(`${LOG_PREFIX} Unflagging re-ordering as ongoing`);
                    this.reorderingSubject$.next(false);
                  },
                  error: (err: any) => {
                    // Data form elements reordering failed
                    this.log.error(`${LOG_PREFIX} Data form elements reordering failed`);

                    // Unflag re-ordering as ongoing
                    this.log.trace(`${LOG_PREFIX} Unflagging re-ordering as ongoing`);
                    this.reorderingSubject$.next(false);
                  }

                });

            } else {

              // A successor was not successfully retrieved
              this.log.trace(`${LOG_PREFIX} A successor was not successfully retrieved`);

              // Re-ordering is redundant
              this.log.trace(`${LOG_PREFIX} Re-ordering is redundant`);

              // Unflag re-ordering as ongoing
              this.log.trace(`${LOG_PREFIX} Unflagging re-ordering as ongoing`);
              this.reorderingSubject$.next(false);



            }
          },
          error: (err: any) => {

            // Could not successfully get the target group's successor
            this.log.error(`${LOG_PREFIX} Could not successfully get the target group's successor`);

            // Unflag re-ordering as ongoing
            this.log.trace(`${LOG_PREFIX} Unflagging re-ordering as ongoing`);
            this.reorderingSubject$.next(false);
          }

        });



    } else {

      // The required group details are not present
      this.log.error(`${LOG_PREFIX} The required group details are not present`);

    }



  }

  private async updateAndSaveDataFormGroupElements(topmostId: number, dataFormElements: DataFormElement[]): Promise<void> {

    // Initialize a new map dataFormElementsMapping to store the DataFormElement objects grouped by their parent IDs
    const dataFormElementsMapping: Map<number | null, DataFormElement[]> = new Map();

    // Loop through each DataFormElement object in the input array and group them by their parent IDs in the dataFormElementsMapping map.
    for (const dataFormElement of dataFormElements) {
      const key: number | null = dataFormElement.data.parentId ?? null;
      const dataFormElements: DataFormElement[] | undefined = dataFormElementsMapping.get(key);
      if (dataFormElements) {
        dataFormElements.push(dataFormElement);
      } else {
        dataFormElementsMapping.set(key, [dataFormElement]);
      }
    }

    // Initialize another map updatedDataFormElementsMapping to store the updated DataFormElement objects after they have been created.
    const updatedDataFormElementsMapping: Map<number, DataFormElement> = new Map();

    // Try retriving the topmost data form element from the list of data form elements
    this.log.trace(`${LOG_PREFIX} Trying to retrive the topmost data form element from the list of data form elements`);
    const topmost: DataFormElement | undefined = dataFormElements.find(d => d.id == topmostId);

    // Check if the topmost data form element was successfully retrieved
    this.log.trace(`${LOG_PREFIX} Checking if the topmost data form element was successfully retrieved`);
    if (topmost) {

      // The topmost data form element was successfully retrieved
      this.log.trace(`${LOG_PREFIX} The topmost data form element was successfully retrieved`);

      // Check if the topmost data form element has a parent
      this.log.trace(`${LOG_PREFIX} Checking if the topmost data form element has a parent`);
      if (topmost.data.parentId) {

        // The topmost data form element has a parent
        this.log.trace(`${LOG_PREFIX} The topmost data form element has a parent`);

        // Add a stub of the parent, as is, to the updatedDataFormElementsMapping
        this.log.trace(`${LOG_PREFIX} Adding a stub of the parent, as is, to the updatedDataFormElementsMapping`);
        updatedDataFormElementsMapping.set(topmost.data.parentId, new DataFormElement({ id: topmost.data.parentId }));

      }

    }

    // Loops through each key (i.e., parent ID) in the dataFormElementsMapping map.
    for (const key of dataFormElementsMapping.keys()) {
      const dataFormElements: DataFormElement[] | undefined = dataFormElementsMapping.get(key);
      if (dataFormElements) {
        for (const dataFormElement of dataFormElements) {

          // For each key, loops through each DataFormElement object in the corresponding value array and retrieves its updated parent from the updatedDataFormElementsMapping map (if it exists).
          const updatedParent: DataFormElement | undefined = dataFormElement.data.parentId ? updatedDataFormElementsMapping.get(dataFormElement.data.parentId) : undefined;

          // Call the updateAndSaveDataFormElement function asynchronously, passing the DataFormElement object and its updated parent as arguments.
          // Once the updateAndSaveDataFormElement function is resolved, sets the updated DataFormElement object in the updatedDataFormElementsMapping map (if it has an ID)
          await this.updateAndSaveDataFormGroupElement(dataFormElement, updatedParent).then((updatedDataFormElement: DataFormElement) => {
            if (dataFormElement.id) {
              updatedDataFormElementsMapping.set(dataFormElement.id, updatedDataFormElement);
            }
          });
        }
      }
    }
  }

  private updateAndSaveDataFormGroupElement(child: DataFormElement, parent: DataFormElement | undefined): Promise<DataFormElement> {
    const copy: DataFormElement = Object.assign({}, child);
    copy.id = null;
    copy.data.parentId = parent ? parent.id : null;

    return new Promise((resolve, reject) => {
      this.dataFormsElementsDataService.createDataFormElement(copy).subscribe({
        next: (value: DataFormElement) => {
          resolve(value);
        },
        error: (err: any) => {
          reject(err);
        }
      });
    });
  }


  /**
   * Checks whether a Data Form Element record is currently expanded
   * @param dataFormElement The unique identifier of the target Data Form Element
   * @returns True or false depending on whether the Data Form Element is currently expanded or not respectively
   */
  public isExpanded(dataFormElement: DataFormElement | null | undefined): boolean {

    this.log.trace(`${LOG_PREFIX} Entering isExpanded()`);
    this.log.debug(`${LOG_PREFIX} Target Data Form Element Id = ${JSON.stringify(dataFormElement)}`);

    // Check if a data form element was passed in
    this.log.trace(`${LOG_PREFIX} Checking if a data form element was passed in`);
    if (dataFormElement) {

      // A data form element was passed in
      this.log.trace(`${LOG_PREFIX} A data form element was passed in`);

      // Check whether the Data Form Element is currently expanded
      this.log.trace(`${LOG_PREFIX} Checking whether the Data Form Element is currently expanded`);
      const expanded: boolean = this.filterService.filter.expandedDataFormElements.some(element => element.id == dataFormElement.id);
      this.log.debug(`${LOG_PREFIX} Expanded = ${expanded}`);

      return expanded;

    } else {


      // A data form element was not passed in
      this.log.warn(`${LOG_PREFIX} A data form element was not passed in`);

      // Return false by default
      this.log.warn(`${LOG_PREFIX} Returning false by default`);

      return false;
    }


  }


  /**
   * Checks whether a Data Form Element record is currently collapsed
   * @param dataFormElement The unique identifier of the target Data Form Element
   * @returns True or false depending on whether the Data Form Element is currently collapsed or not respectively
   */
  public isCollapsed(dataFormElement: DataFormElement | null | undefined): boolean {

    this.log.trace(`${LOG_PREFIX} Entering isCollapsed()`);
    this.log.debug(`${LOG_PREFIX} Target Data Form Element = ${JSON.stringify(dataFormElement)}`);

    // Check if a data form element was passed in
    this.log.trace(`${LOG_PREFIX} Checking if a data form element was passed in`);
    if (dataFormElement) {

      // A data form element was passed in
      this.log.trace(`${LOG_PREFIX} A data form element was passed in`);

      // Check whether the Data Form Element is currently collapsed
      this.log.trace(`${LOG_PREFIX} Checking whether the Data Form Element is currently collapsed`);
      const collapsed: boolean = !(this.filterService.filter.expandedDataFormElements.some(element => element.id == dataFormElement.id));
      this.log.debug(`${LOG_PREFIX} Collapsed = ${collapsed}`);

      return collapsed;

    } else {


      // A data form element was not passed in
      this.log.warn(`${LOG_PREFIX} A data form element was not passed in`);

      // Return false by default
      this.log.warn(`${LOG_PREFIX} Returning false by default`);

      return false;
    }

  }


  /**
   * Expands records
   */
  public onExpand(dataFormElement: DataFormElement | null | undefined): void {

    this.log.trace(`${LOG_PREFIX} Entering onExpand()`);
    this.log.debug(`${LOG_PREFIX} Data Form Element = ${JSON.stringify(dataFormElement)}`);

    // Check if a data form element was passed in
    this.log.trace(`${LOG_PREFIX} Checking if a data form element was passed in`);
    if (dataFormElement) {

      // Add the Data Form Element into the array of expanded Data Form Elements records
      this.log.trace(`${LOG_PREFIX} Add the Data Form Element into the array of expanded Data Form Elements records`);
      if (!(this.filterService.filter.expandedDataFormElements.some(d => d.id == dataFormElement.id))) {
        this.filterService.filter.expandedDataFormElements.push(dataFormElement);
      }

      this.cd.detectChanges();

    } else {


      // A data form element was not passed in
      this.log.warn(`${LOG_PREFIX} A data form element was not passed in`);

    }

  }


  /**
   * Collapses records
   */
  public onCollapse(dataFormElement: DataFormElement | null | undefined): void {

    this.log.trace(`${LOG_PREFIX} Entering onCollapse()`);
    this.log.debug(`${LOG_PREFIX} Data Form Element Id = ${JSON.stringify(dataFormElement)}`);

    // Check if a data form element was passed in
    this.log.trace(`${LOG_PREFIX} Checking if a data form element was passed in`);
    if (dataFormElement) {

      // A data form element was passed in
      this.log.trace(`${LOG_PREFIX} A data form element was passed in`);

      // Remove the Data Form Element from the array of expanded Data Form Elements
      this.log.trace(`${LOG_PREFIX} Remove the Data Form Element from the array of expanded Data Form Elements`);
      let index: number = this.filterService.filter.expandedDataFormElements.findIndex(d => d.id == dataFormElement.id)
      if (index != -1) {
        this.filterService.filter.expandedDataFormElements.splice(index, 1);
      }

      this.cd.detectChanges();

    } else {


      // A data form element was not passed in
      this.log.warn(`${LOG_PREFIX} A data form element was not passed in`);

    }

  }

  toggleDescriptionCollapse() {
    this.descriptionCollapsed = !this.descriptionCollapsed;
  }

}
