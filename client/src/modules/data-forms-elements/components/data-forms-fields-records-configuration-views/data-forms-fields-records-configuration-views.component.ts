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
import { RelevancyRule, ValidationRule } from '@modules/data-forms-elements/models';
import { DataFormElement } from '@modules/data-forms-elements/models/data-form-element.model';
import { DataFormsElementsDataService } from '@modules/data-forms-elements/services/data-forms-elements-data.service';
import { OperatorsDataService } from '@modules/operators/services/operators-data.service';
import { OptionsSelectionDataService } from '@modules/options/services/options-selection-data.service';
import { Option } from '@modules/options/models/option.model';
import { NGXLogger } from 'ngx-logger';
import { Observable, first, of, map, BehaviorSubject } from 'rxjs';
import { Operator } from '@modules/operators/models/operator.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataFormsFieldsRecordsUpdationModalComponent } from '@modules/data-forms-elements/containers/data-forms-fields-records-updation-modal/data-forms-fields-records-updation-modal.component';
import { DataFormsFieldsRecordsDeletionModalComponent } from '@modules/data-forms-elements/containers/data-forms-fields-records-deletion-modal/data-forms-fields-records-deletion-modal.component';
import { DataFormsGroupsRecordsUpdationModalComponent } from '@modules/data-forms-elements/containers/data-forms-groups-records-updation-modal/data-forms-groups-records-updation-modal.component';
import { DataFormsGroupsRecordsDeletionModalComponent } from '@modules/data-forms-elements/containers/data-forms-groups-records-deletion-modal/data-forms-groups-records-deletion-modal.component';

const LOG_PREFIX: string = "[Data Form Fields Records Configuration Views Component]";

@Component({
  selector: 'sb-data-forms-fields-records-configuration-views',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './data-forms-fields-records-configuration-views.component.html',
  styleUrls: ['data-forms-fields-records-configuration-views.component.scss'],
})
export class DataFormsFieldsRecordsConfigurationViewsComponent implements OnInit {

  // Allows the parent component to inject the target record Data Form Element
  @Input() public dataFormElement: DataFormElement | null | undefined;

  // Allows the parent component to assign the current display position an odd or even position
  @Input() public odd: boolean = true;

  // Keeps tabs of the relevancy rule
  public relevancyRule: RelevancyRule | null = null;

  // Keeps tabs of the validation rules
  public validationRules: ValidationRule[] = [];

  // Keeps tabs of the options
  public options: Option[] = [];

  // Keep tabs on the field type
  public dataFormElementType!: DataFormElementType | null;

  // Keeps tabs of the data form element types operators
  public operators: Operator[] = [];

  // Keeps tabs of the currently visible content
  page: string = "default";

  // Keep tabs on whether the field's description is expanded or collapsed
  public descriptionCollapsed: boolean = true;

  // Keeps tabs of whether data form elements are being reordered
  private reorderingSubject$ = new BehaviorSubject<boolean>(false);
  readonly reordering$ = this.reorderingSubject$.asObservable();

  // Keeps tabs of whether the page has been successfully initialised
  public initialised: boolean = false;


  constructor(
    public dataFormsElementsDataService: DataFormsElementsDataService,
    public dataFormsElementsTypesDataService: DataFormsElementsTypesDataService,
    public operatorsDataService: OperatorsDataService,
    public optionsDataService: OptionsSelectionDataService,
    public filterService: FilterService,
    public textUtilService: TextUtilService,
    public modalService: NgbModal,
    private cd: ChangeDetectorRef,
    private log: NGXLogger) {

  }


  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    this.initialiseDataFormFieldType(() => {

      this.initialiseRelevancyRule(() => {

        this.initialiseValidationRules(() => {

          this.initialiseOptions(() => {

            this.initialiseOperators(() => {

              // Mark init as complete
              this.log.trace(`${LOG_PREFIX} Init completed`);
              this.initialised = true;
              this.cd.detectChanges();

            })
          })
        })
      });



    });



  }


  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }


  /**
   * Creates a local copy of the relevancy rule fashioned after the previously saved details in the target Data Form Element
   * @param callback The function to call when done
   */
  private initialiseRelevancyRule(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseRelevancyRule()`);

    // Initialise the relevancy rule
    this.log.trace(`${LOG_PREFIX} Initialise the relevancy rule`);
    this.relevancyRule = this.dataFormElement ? Object.assign({}, this.dataFormElement?.data.conditionalRelevancyRule) : null;

    // Transfer control to the callback function
    this.log.trace(`${LOG_PREFIX} Returning`);
    callback();

  }



  /**
   * Creates a local copy of the validation rules fashioned after the previously saved details in the target Data Form Element
   * @param callback The function to call when done
   */
  private initialiseValidationRules(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseValidationRules()`);

    // Initialise the validation rules
    this.log.trace(`${LOG_PREFIX} Initialise the validation rules`);
    this.validationRules = this.dataFormElement ? Object.assign([], this.dataFormElement?.data.validationRules) : [];

    // Transfer control to the callback function
    this.log.trace(`${LOG_PREFIX} Returning`);
    callback();

  }


  /**
   * Creates a local copy of selected option records fashioned after the previously saved option ids in the target Data Form Element
   * @param callback The function to call when done
   */
  private initialiseOptions(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseOptions()`);

    // Check if the field is optionable
    this.log.trace(`${LOG_PREFIX} Checking if the field is optionable`);
    if (this.dataFormElement && this.isOptionable(this.dataFormElement.data.typeId)) {

      // The field is optionable
      this.log.trace(`${LOG_PREFIX} The field is optionable`);

      // Get the options corresponding to the data form field
      this.log.trace(`${LOG_PREFIX} Getting the options corresponding to the data form field`);
      this.getOptions$(this.dataFormElement.data.options)
        .subscribe({
          next: (options: Option[]) => {

            // Initialise the options
            this.log.trace(`${LOG_PREFIX} Initialising the options`);
            this.options = options;

            // Transfer control to the callback function
            this.log.trace(`${LOG_PREFIX} Returning`);
            callback();

          }
        });

    } else {

      // The field is not optionable
      this.log.trace(`${LOG_PREFIX} The field is not optionable`);

      // Initialise options to an empty array
      this.log.trace(`${LOG_PREFIX} Initialising options to an empty array`);
      this.options = [];

      // Transfer control to the callback function
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    }

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

    // Initialise the validation rules
    this.log.trace(`${LOG_PREFIX} Initialise the validation rules`);
    this.validationRules = this.dataFormElement ? Object.assign([], this.dataFormElement?.data.validationRules) : [];


  }


  /**
   * Creates a local copy of the field types operators if the field is validated
   * @param callback The function to call when done
   */
  private initialiseOperators(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseOperators()`);

    // Check if the field is validated
    this.log.trace(`${LOG_PREFIX} Checking if the field is validated`);
    if (this.dataFormElement && this.dataFormElement.data.validated) {

      // The field is validated
      this.log.trace(`${LOG_PREFIX} The field is validated`);

      // Get the operators corresponding to the data form field type
      this.log.trace(`${LOG_PREFIX} Getting the operators corresponding to the data form field type`);
      this.getOperators$(this.dataFormElement.data.typeId)
        .subscribe({
          next: (operators: Operator[]) => {

            // Initialise the operators
            this.log.trace(`${LOG_PREFIX} Initialising the operators`);
            this.operators = operators;

            // Transfer control to the callback function
            this.log.trace(`${LOG_PREFIX} Returning`);
            callback();

          }
        });

    } else {

      // The field is not validated
      this.log.trace(`${LOG_PREFIX} The field is not validated`);

      // Initialise operators to an empty array
      this.log.trace(`${LOG_PREFIX} Initialising operators to an empty array`);
      this.operators = [];

      // Transfer control to the callback function
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    }

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
   * Asynchronously retrieves the options associated with given unique identifiers
   * @param optionsIds The options unique ids
   * @returns The options
   */
  public getOptions$(optionsIds: number[] | null | undefined): Observable<Option[]> {

    this.log.trace(`${LOG_PREFIX} Entering getOptions()`);
    this.log.debug(`${LOG_PREFIX} Option Ids = ${JSON.stringify(optionsIds)}`);

    // Check if the Option Ids were specified
    this.log.trace(`${LOG_PREFIX} Checking if the Option Ids were specified`);
    if (optionsIds && optionsIds.length > 0) {

      // The Option Ids were specified
      this.log.trace(`${LOG_PREFIX} The Option Ids were specified`);

      // Asynchronously get the corresponding Options
      this.log.trace(`${LOG_PREFIX} Asynchronously getting the corresponding Options`);
      return new Observable(obs => {

        // Get all the options
        this.optionsDataService.getOptions(true, {
          searchTerm: null,
          page: null,
          pageSize: null,
          sortColumn: 'id',
          sortDirection: 'asc',
          ids: null,
          typeId: null,
          name: null
        })
          .pipe(
            first(),
            map((options: Option[]) => {
              return options.filter(o => o.id && optionsIds.includes(o.id));
            }))
          .subscribe({
            next: (options: Option[]) => {

              // Return the relevant options
              this.log.trace(`${LOG_PREFIX} Returning the relevant options`);
              obs.next(options);
            }
          });
      });

    } else {

      // The Option Ids were not specified
      this.log.trace(`${LOG_PREFIX} The Option Ids were not specified`);

      // Return an empty observable
      this.log.trace(`${LOG_PREFIX} Returning an empty observable`);
      return of([]);
    }


  }




  /**
   * Retrieves the ids of the selected options
   * @returns an array of numbers
   */
  public getOptionsIds(): number[] {
    const optionsIds: number[] = [];
    this.options ? this.options.forEach(o => {
      if (o.id) {
        optionsIds.push(o.id);
      }
    }) : [];
    return optionsIds;
  }


  /**
   * Establishes whether a field, based on its type, should have optional values
   * @param fieldTypeId The field type's id
   * @returns 
   */
  public isOptionable(fieldTypeId: number | null | undefined) {
    return fieldTypeId ? ([8, 9, 10].includes(fieldTypeId)) : false;
  }


  /**
   * Gets all the operators that are associated with a particular data form field type
   * @param dataFormFieldTypeId the data form field type
   * @returns the list of operators
   */
  public getOperators$(dataFormFieldTypeId: number | null | undefined): Observable<Operator[]> {

    if (dataFormFieldTypeId) {

      // Asynchronously get the Data Form Element Type's operators
      this.log.trace(`${LOG_PREFIX} Asynchronously getting the Data Form Element Type's operators`);
      return new Observable(obs => {

        // Get the Data Form Element's Data Form Element Type
        this.dataFormsElementsTypesDataService.getDataFormElementTypeById$(dataFormFieldTypeId)
          .pipe(first())
          .subscribe({
            next: (value: DataFormElementType) => {

              // Get the operators associated with the Data Form Element Type
              this.operatorsDataService.getOperatorsByIds$(value.data.operators)
                .pipe(first())
                .subscribe({
                  next: (operators: Operator[]) => {

                    this.log.debug(`${LOG_PREFIX} Operators = ${JSON.stringify(operators)}`);

                    // Return the operators
                    this.log.trace(`${LOG_PREFIX} Returning the operators`);
                    obs.next(operators);

                  }
                });
            }
          });
      });

    } else {
      return of([]);
    }


  }


  /**
 * Retrieves the operator with the passed in id
 * @param operatorId the operator id
 * @returns the operator
 */
  getOperator(operatorId: number): Operator | undefined {
    return this.operators.find(o => o.id == operatorId);
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
    * Handles stepwise moving up of fields
    * @param dataFormElement The field to be moved up
    */
  public onMoveUpField(field: DataFormElement | null | undefined): void {

    this.log.trace(`${LOG_PREFIX} Entering onMoveUpField()`);
    this.log.debug(`${LOG_PREFIX} Field = ${JSON.stringify(field)}`);

    // Check if the required field details are present
    this.log.trace(`${LOG_PREFIX} Checking if the required field details are present`);
    if (field && field.data.dataFormId && field.data.index) {

      // The required field details are present
      this.log.trace(`${LOG_PREFIX} The required field details are present`);

      // Flag re-ordering as ongoing
      this.log.trace(`${LOG_PREFIX} Flagging re-ordering as ongoing`);
      this.reorderingSubject$.next(true);

      // Get the target field's predecessor
      this.log.trace(`${LOG_PREFIX} Getting the target field's predecessor`);
      this.dataFormsElementsDataService
        .getPrecedingDataFormElement(field.data.dataFormId, field.data.parentId, field.data.index)
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
              const _predeccessor: DataFormElement = { ...predecessor, data: { ...predecessor.data, index: field.data.index } };
              const _group: DataFormElement = { ...field, data: { ...field.data, index: predecessor.data.index } };

              // Save the update
              this.log.trace(`${LOG_PREFIX} Saving the update`);
              this.dataFormsElementsDataService
                .updateDataFormElements([_predeccessor, _group])
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

            // Could not successfully get the target field's predecessor
            this.log.error(`${LOG_PREFIX} Could not successfully get the target field's predecessor`);

            // Unflag re-ordering as ongoing
            this.log.trace(`${LOG_PREFIX} Unflagging re-ordering as ongoing`);
            this.reorderingSubject$.next(false);
          }

        });



    } else {

      // The required field details are not present
      this.log.error(`${LOG_PREFIX} The required field details are not present`);

    }



  }

  /**
   * Handles stepwise moving down of fields
   * @param dataFormElement The field to be moved down
   */
  public onMoveDownField(field: DataFormElement | null | undefined): void {

    this.log.trace(`${LOG_PREFIX} Entering onMoveDownField()`);
    this.log.debug(`${LOG_PREFIX} Field = ${JSON.stringify(field)}`);

    // Check if the required field details are present
    this.log.trace(`${LOG_PREFIX} Checking if the required field details are present`);
    if (field && field.data.dataFormId && field.data.index) {

      // The required field details are present
      this.log.trace(`${LOG_PREFIX} The required field details are present`);

      // Flag re-ordering as ongoing
      this.log.trace(`${LOG_PREFIX} Flagging re-ordering as ongoing`);
      this.reorderingSubject$.next(true);

      // Get the target field's successor
      this.log.trace(`${LOG_PREFIX} Getting the target field's successor`);
      this.dataFormsElementsDataService
        .getSucceedingDataFormElement(field.data.dataFormId, field.data.parentId, field.data.index)
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
              const _successor: DataFormElement = { ...successor, data: { ...successor.data, index: field.data.index } };
              const _group: DataFormElement = { ...field, data: { ...field.data, index: successor.data.index } };

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

            // Could not successfully get the target field's successor
            this.log.error(`${LOG_PREFIX} Could not successfully get the target field's successor`);

            // Unflag re-ordering as ongoing
            this.log.trace(`${LOG_PREFIX} Unflagging re-ordering as ongoing`);
            this.reorderingSubject$.next(false);
          }

        });



    } else {

      // The required field details are not present
      this.log.error(`${LOG_PREFIX} The required field details are not present`);

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


  /**
 * Handles Fields Copy Requests
 * @param id The unique identifier of the Field to copy
 */
  public onCopyField(id: number): void {

    this.log.trace(`${LOG_PREFIX} Entering onCopyField()`);
    this.log.debug(`${LOG_PREFIX} Group Id = ${id}`);

    this.dataFormsElementsDataService.getDataFormsElements(false, {
      searchTerm: null,
      page: null,
      pageSize: null,
      sortColumn: null,
      sortDirection: null,
      id: id,
      indexLTE: null,
      indexGTE: null,
      dataFormId: null,
      categoryId: null,
      typeId: null,
      parentId: null,
      name: null
    })
      .pipe(first())
      .subscribe({
        next: (value: DataFormElement[]) => {
          this.updateAndSaveDataField(value[0]).then((clonedField: DataFormElement) => {

          });
        }
      });

  }


  private updateAndSaveDataField(field: DataFormElement): Promise<DataFormElement> {
    const copy: DataFormElement = Object.assign({}, field);
    copy.id = null;

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

  toggleDescriptionCollapse() {
    this.descriptionCollapsed = !this.descriptionCollapsed;
  }

}
