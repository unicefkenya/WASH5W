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
import { Observable, first, of, Subscription, BehaviorSubject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataFormsFieldsRecordsUpdationModalComponent } from '@modules/data-forms-elements/containers/data-forms-fields-records-updation-modal/data-forms-fields-records-updation-modal.component';
import { DataFormsFieldsRecordsDeletionModalComponent } from '@modules/data-forms-elements/containers/data-forms-fields-records-deletion-modal/data-forms-fields-records-deletion-modal.component';
import { DataFormsGroupsRecordsCreationModalComponent } from '@modules/data-forms-elements/containers/data-forms-groups-records-creation-modal/data-forms-groups-records-creation-modal.component';
import { DataFormsFieldsRecordsCreationModalComponent } from '@modules/data-forms-elements/containers/data-forms-fields-records-creation-modal/data-forms-fields-records-creation-modal.component';
import { DataFormsGroupsRecordsUpdationModalComponent } from '@modules/data-forms-elements/containers/data-forms-groups-records-updation-modal/data-forms-groups-records-updation-modal.component';
import { DataFormsGroupsRecordsDeletionModalComponent } from '@modules/data-forms-elements/containers/data-forms-groups-records-deletion-modal/data-forms-groups-records-deletion-modal.component';
import { DataFormsFieldsResponsesService } from '@modules/data-forms-elements/services/data-forms-fields-responses.service';
import { DataFormFieldResponse } from '@modules/data-forms-elements/models/data-form-field-response.model';
import { environment } from 'environments/environment';

const LOG_PREFIX: string = "[Data Form Groups Records Response Views Component]";

@Component({
  selector: 'sb-data-forms-groups-records-response-views',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './data-forms-groups-records-response-views.component.html',
  styleUrls: ['data-forms-groups-records-response-views.component.scss'],
})
export class DataFormsGroupsRecordsResponseViewsComponent implements OnInit {

  // Allows the parent component to inject the target record group
  @Input() public dataFormElement: DataFormElement | null | undefined;

  // Allows the parent component to inject the target group's nested data form elements
  @Input() public nestedDataFormElements: DataFormElement[] | undefined;

  // Allows the parent component to specify mode of working
  @Input() public mode: string = "mock"; // mock, actual  

  // Allows the parent component to specify whether the form fields should be disabled
  @Input() public disabled: boolean = false;

  @Input() public odd: boolean = true;

  // Keep tabs on the field type
  public dataFormElementType!: DataFormElementType | null;

  // Keeps tabs of the currently visible content
  page: string = "default";

  // Keeps tabs of the repeat count if repeat group
  /*private repeatCountSubject$ = new BehaviorSubject<number | null | undefined>(0);
  readonly repeatCount$ = this.repeatCountSubject$.asObservable();*/

  public repeatCount: number = 0

  // Keeps tabs of whether the page has been successfully initialised
  public initialised: boolean = false;

  // Keep tabs of whether the system is using a logical framework
  public logical = environment.indicators.logical;

  public descriptionCollapsed: boolean = true; 

  // Central gathering point for all the component's subscriptions.
  // Makes it efficient to unsubscribe from all subscriptions when the component is destroyed.   
  private _subscriptions: Subscription[] = [];


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

      if (this.dataFormElementType?.id == 2) { // repeat-group

        this.repeatCount = (this.dataFormElement?.data.repeatabilityRule?.fieldId ? this.dataFormsResponsesService.getResponse(this.dataFormElement.data.repeatabilityRule.fieldId).value : 0);

        // Keep tabs of and update the repeat count
        this._subscriptions.push(
          this.dataFormsResponsesService.responseUpdated$.subscribe({
            next: (response: DataFormFieldResponse) => {
              if (response.fieldId == this.dataFormElement?.data.repeatabilityRule?.fieldId) {
                this.repeatCount = (this.dataFormElement?.data.repeatabilityRule?.fieldId ? this.dataFormsResponsesService.getResponse(this.dataFormElement.data.repeatabilityRule.fieldId).value : 0);
                this.cd.markForCheck();
              }
            }
          })
        );

      }



      // Mark init as complete
      this.log.trace(`${LOG_PREFIX} Init completed`);
      this.initialised = true;
      this.cd.detectChanges();

    });



  }


  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

    // Clear all subscriptions
    this.log.trace(`${LOG_PREFIX} Clearing all subscriptions`);
    this._subscriptions.forEach(s => s.unsubscribe());
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


  public counter(i: any): any[] {
    return new Array(parseInt(i));
  }

  toggleDescriptionCollapse() {
    this.descriptionCollapsed = !this.descriptionCollapsed;
  }

}
