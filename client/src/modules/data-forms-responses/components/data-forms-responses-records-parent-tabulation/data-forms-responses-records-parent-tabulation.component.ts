import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostListener,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core';
import { LoadingAnimationComponent, PaginationComponent } from '@common/components';
import { NGXLogger } from 'ngx-logger';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataFormsResponsesDataService } from '@modules/data-forms-responses/services/data-forms-responses-data.service';
import { Context } from '@modules/contexts/models';
import { Filter, FilterService } from '@app/app-filter.service';
import { DataForm } from '@modules/data-forms/models/data-form.model';
import { ContextsDataService } from '@modules/contexts/services/contexts-data.service';
import { DataFormsDataService } from '@modules/data-forms/services/data-forms-data.service';
import { Subscription, first, BehaviorSubject } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { TimePeriodsDataService } from '@modules/time-periods/services/time-periods-data.service';
import { TimePeriod } from '@modules/time-periods/models/time-period.model';
import { DataFormResponse } from '@modules/data-forms-responses/models';
import { DataFormsFieldsResponsesService } from '@modules/data-forms-elements/services/data-forms-fields-responses.service';
import { DataFormFieldResponse } from '@modules/data-forms-elements/models/data-form-field-response.model';
import { DataFormsElementsDataService } from '@modules/data-forms-elements/services/data-forms-elements-data.service';
import moment from 'moment';
import { WorkflowTransition } from '@modules/workflow-transitions/models/workflow-transition.model';
import { WorkflowTransitionsSelectionDataService } from '@modules/workflow-transitions/services/workflow-transitions-selection-data.service';
import { Tab } from '@common/models/tab.model';
import { DataFormResponseState } from '@modules/data-forms-responses/models/data-form-response-state.model';
import { TextUtilService } from '@common/services/text-util.service';
import { DataFormsRecordsSelectionModalComponent } from '@modules/data-forms/containers/data-forms-records-selection-modal/data-forms-records-selection-modal.component';
import { TimePeriodsRecordsSelectionModalComponent } from '@modules/time-periods/containers/time-periods-records-selection-modal/time-periods-records-selection-modal.component';
import { environment } from 'environments/environment';
import { SystemUserRight } from '@modules/systems-users-rights/models';
import { DateUtilService } from '@common/services/date-util.service';
import { SystemsTasksDataService } from '@modules/systems-tasks/services/systems-tasks-data.service';
import { SystemTask, SystemTaskStatus, SystemTaskType } from '@modules/systems-tasks/models';

const LOG_PREFIX: string = "[Data Forms Responses Records Parent Tabulation Component]";

@Component({
    selector: 'sb-data-forms-responses-records-parent-tabulation',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './data-forms-responses-records-parent-tabulation.component.html',
    styleUrls: ['data-forms-responses-records-parent-tabulation.component.scss'],
})
export class DataFormsResponsesRecordsParentTabulationComponent implements OnInit, OnDestroy {

    // Keeps a local reference of the currently active Context
    public activeContext: Context | null | undefined = null;

    // Keeps a local reference of the active Context's active Reporting Period
    public activeReportingPeriod: TimePeriod | null | undefined = null;

    // Keeps a local reference of the active Context's active Data Form
    public activeDataForm: DataForm | null | undefined = null;

    // Keeps a local reference of the currently active Context's System Rights
    public activeContextSystemUserRights: SystemUserRight | null | undefined = null;

    // Keeps a local reference of whether the logged in user is a reviewer
    public canApproveRe: boolean = false;

    // Keeps tabs of the unique identifiers of the Workflow States covered by the active Data Form's Workflow Transitions
    public workflowStatesIds: number[] = [];

    // Keeps a local reference to the displayed loading animation component.
    // Makes it possible to trigger the loading animation when a slow background service is invoked.
    private _animation!: LoadingAnimationComponent;

    // Keeps tabs of the page's tabs if tabbed
    public tabs: Tab[] = [
        {
            index: 0,
            title: "Draft",
            link: "#",
            active: true
        },
        {
            index: 1,
            title: "In Review",
            link: "#",
            active: false
        },
        {
            index: 2,
            title: "Published",
            link: "#",
            active: false
        }
    ];

    // Keeps tabs on the active tab
    public activeTab: Tab | null = {
        index: 0,
        title: "Draft",
        link: "#",
        active: true
    };


    // Instantitate a new reactive Form Group
    // This will allow us to define and enforce the validation rules for all the form controls.
    dataFormResponsesForm = new FormGroup({

        dataForm: new FormGroup({
            dataFormId: new FormControl<number | null | undefined>(null),
            dataFormName: new FormControl<string | null | undefined>("Choose Data Form"),
            dataFormNameLong: new FormControl<string | null | undefined>("Choose Data Form"),
            dataFormNameShort: new FormControl<string | null | undefined>("Choose Data Form")
        }),

        reportingPeriod: new FormGroup({
            reportingPeriodId: new FormControl<number | null | undefined>(null),
            reportingPeriodNameLong: new FormControl<string | null | undefined>("Choose Reporting Period"),
            reportingPeriodNameShort: new FormControl<string | null | undefined>("Choose Reporting Period")
        })

    });


    // Keeps tabs of the currently visible content
    public page: string = "default";

    // Keeps tabs on the opened data form response
    public dataFormResponse!: DataFormResponse;

    // Keeps tabs on whether to guard the workflows
    guard: boolean = true;

    // Keep tabs on the identifier of the target form
    public dataFormId: number | null | undefined;

    // Keep tabs on the identifier of the target scope
    public scopeId: number | null | undefined;    // 1. Entity 2. Location 3. Organisation

    // Holds the component's initialisation status.
    // Makes it possible to display the most appropriate content based on whether the initialisation was a success or not.
    initialised: boolean | undefined;

    // Holds the component's loading status.
    public loaded: boolean = false;


    // Holds the required records state
    // Makes it possible to supply the filter, sort or search criteria that should be applied to records on retrieval.
    private stateSubject$ = new BehaviorSubject<DataFormResponseState>({
        searchTerm: null,
        page: 1,
        pageSize: 20,
        sortColumn: 'id',
        sortDirection: 'asc',
        timePeriodId: null,
        formId: null,
        locationId: null,
        organisationId: null,
        entityId: null,
        respondentTypeId: null,
        respondentId: null,
        respondentName: null,
        statusIds: null
    });
    readonly state$ = this.stateSubject$.asObservable();




    // Central gathering point for all the component's subscriptions.
    // Makes it efficient to unsubscribe from all subscriptions when the component is destroyed.   
    private _subscriptions: Subscription[] = [];

    constructor(
        private cd: ChangeDetectorRef,
        public dataFormsResponsesDataService: DataFormsResponsesDataService,
        public dataFormsFieldsResponsesService: DataFormsFieldsResponsesService,
        public dataFormsElementsDataService: DataFormsElementsDataService,
        public reportingPeriodsDataService: TimePeriodsDataService,
        public contextsDataService: ContextsDataService,
        public dataFormsDataService: DataFormsDataService,
        public workflowTransitionsDataService: WorkflowTransitionsSelectionDataService,
        public systemsTasksDataService: SystemsTasksDataService,
        public filterService: FilterService,
        public textUtilService: TextUtilService,
        public dateUtilService: DateUtilService,
        private modalService: NgbModal,
        private log: NGXLogger) {

    }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

        // Initialise the active Context
        this.initialiseActiveContext(() => {

            // Initialise the active Context changes handler
            this.initialiseActiveContextChangesHandler(() => {

                // Initialise the active Context's Reporting Periods
                this.initialiseActiveContextReportingPeriods(() => {

                    // Initialise the active Context's Active Reporting Period
                    this.initialiseActiveContextActiveReportingPeriod(() => {

                        // Initialise the active Context's Active Reporting Period changes handler
                        this.initialiseActiveContextActiveReportingPeriodChangesHandler(() => {

                            // Initialise the active Context's Data Forms
                            this.initialiseActiveContextDataForms(() => {

                                // Initialise the active Context's Active Data Form
                                this.initialiseActiveContextActiveDataForm(() => {

                                    // Initialise the active Context's Active Data Form changes handler
                                    this.initialiseActiveContextActiveDataFormChangesHandler(() => {

                                        // Initialise the transitions associated with the active Data Form
                                        this.initialiseActiveContextActiveDataFormWorkflowTransitions(() => {

                                            // Initialise the ids of the Workflow States covered by the active Data Form's Workflow Transitions
                                            this.initialiseActiveContextActiveDataFormWorkflowTransitionsStatesIds(() => {

                                                // Initialise the users rights in the active context
                                                this.initialiseActiveContextSystemUserRights(() => {

                                                    // Initialise the visible form fields
                                                    this.initialiseFormGroup(() => {

                                                        // Initialise the default desired records state
                                                        this.initialiseDesiredRecordsState(() => {

                                                            // Monitor & react to desired records state changes
                                                            this.initialiseDesiredRecordsStateChangesHandler(() => {

                                                                // Mark Init as complete
                                                                this.log.trace(`${LOG_PREFIX} Init completed`);
                                                                this.initialised = true;
                                                                this.cd.detectChanges();

                                                            });

                                                        });

                                                    });
                                                });

                                            });

                                        });

                                    });

                                });

                            });

                        });

                    });

                });

            });
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
     * Initialises the local reference to the displayed loading animation component
     */
    @ViewChild(LoadingAnimationComponent)
    public set animation(animation: LoadingAnimationComponent) {

        this.log.trace(`${LOG_PREFIX} Entering setAnimation()`);

        if (animation) {
            this._animation = animation;
        }
    }


    /**
     * Initialise the active Context
     * @param callback 
     */
    private initialiseActiveContext(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseActiveContext()`);

        this.activeContext = this.filterService.filter.activeContext;
        this.log.debug(`${LOG_PREFIX} Active Context = ${JSON.stringify(this.activeContext)}`);

        // Return
        this.log.trace(`${LOG_PREFIX} Returning`);
        callback();
    }

    /**
     * Subscribe and react to Context changes
     * @param callback The function to call when done
     */
    private initialiseActiveContextChangesHandler(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseActiveContextChangesHandler()`);

        // Subscribe to filtering criteria updates and react to them if the Context is changed
        this.log.trace(`${LOG_PREFIX} Subscribing to filtering criteria updates and reacting to them if the Context is changed`);
        this._subscriptions.push(
            this.filterService.currentFilter$
                .subscribe({
                    next: (filter) => {

                        // Check if the globally active Context has been changed
                        this.log.trace(`${LOG_PREFIX} Checking if the globally active Context has been changed`);
                        if ((JSON.stringify(this.activeContext) !== JSON.stringify(filter.activeContext))) {

                            // The globally active Context has been changed
                            this.log.trace(`${LOG_PREFIX} The globally active Context has been changed`);

                            // Update the local active Context reference
                            this.log.trace(`${LOG_PREFIX} Updating the local active Context reference`);
                            this.activeContext = Object.assign({}, filter.activeContext);

                            // Mark loaded as false
                            this.log.trace(`${LOG_PREFIX} Loading commenced`);
                            this.loaded = false;
                            this.cd.detectChanges();

                            // Re-initialise the active Context's Reporting Periods
                            this.initialiseActiveContextReportingPeriods(() => {

                                // Re-initialise the active Context's active Reporting Period
                                this.initialiseActiveContextActiveReportingPeriod(() => {

                                    // Re-initialise the active Context's Data Forms
                                    this.initialiseActiveContextDataForms(() => {

                                        // Re-initialise the active Context's active Data Form
                                        this.initialiseActiveContextActiveDataForm(() => {

                                            // Re-initialise the active Context's active Data Form's Workflow Transitions
                                            this.initialiseActiveContextActiveDataFormWorkflowTransitions(() => {

                                                // Re-initialise the ids of the Workflow States covered by the active Data Form's Workflow Transitions
                                                this.initialiseActiveContextActiveDataFormWorkflowTransitionsStatesIds(() => {

                                                    // Re-initialise the users rights in the active context
                                                    this.initialiseActiveContextSystemUserRights(() => {

                                                        // Re-initialise the visible form fields
                                                        this.initialiseFormGroup(() => {

                                                            // Re-initialise the default desired records state
                                                            this.initialiseDesiredRecordsState(() => {

                                                                // Mark loaded as true
                                                                this.log.trace(`${LOG_PREFIX} Loading complete`);
                                                                this.loaded = true;
                                                                this.cd.detectChanges();

                                                            });

                                                        });

                                                    });

                                                });

                                            });

                                        });

                                    });
                                });

                            });

                        } else {

                            // The globally active Context has not been changed
                            this.log.trace(`${LOG_PREFIX} The globally active Context has not been changed`);
                        }
                    }
                })
        );

        // Transfer control to the callback function
        callback();

    }


    /**
     * Retrieves and caches the active Context's Reporting Periods records
     * @param callback The function to call when done
     */
    private initialiseActiveContextReportingPeriods(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseActiveContextReportingPeriods()`);

        // Retrieve and cache the active Context's Reporting Periods records
        this.log.trace(`${LOG_PREFIX} Retrieving and caching the active Context's Reporting Periods records`);
        this.reportingPeriodsDataService
            .getTimePeriods(true, {
                searchTerm: null,
                page: 1,
                pageSize: 20,
                sortColumn: 'id',
                sortDirection: 'desc',
                contextId: this.filterService.filter.activeContext?.id,
                open: null,
                id: null
            })
            .pipe(first()) // This will automatically complete (and therefore unsubscribe) after the first value has been emitted.
            .subscribe({
                next: (reportingPeriods: TimePeriod[]) => {

                    // Active Context's Reporting Periods successfully retrieved and cached
                    this.log.debug(`${LOG_PREFIX} ${reportingPeriods.length} Active Context's Reporting Period(s) succesfully retrieved and cached`);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                },

                error: (err: any) => {

                    // Active Context's Reporting Period(s) retrieval / caching failed
                    this.log.error(`${LOG_PREFIX} Active Context's Reporting Period(s) retrieval / caching failed`);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                }
            });


    }


    /**
     * Sets the active Context's active Reporting Period if it has not been set in the global filter
     * @param callback The function to call when done
     */
    private initialiseActiveContextActiveReportingPeriod(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseActiveContextActiveReportingPeriod()`);

        // Check if the active Context's active Reporting Period has already been set in the global filter
        this.log.trace(`${LOG_PREFIX} Checking if the active Context's active Reporting Period has already been set in the global filter`);
        if (this.filterService.filter.activeReportingPeriod) {

            // The active Context's active Reporting Period has already been set in the global filter
            this.log.trace(`${LOG_PREFIX} The active Context's active Reporting Period has already been set in the global filter`);

            // Check if the set active Context's active Reporting Period record exists in the local records cache
            this.log.trace(`${LOG_PREFIX} Checking if the set active Context's active Reporting Period record exists in the local records cache`);
            if (this.reportingPeriodsDataService.records.some(a => a.id == this.filterService.filter.activeReportingPeriod?.id)) {

                // The set active Context's active Reporting Period record exists in the local records cache
                this.log.trace(`${LOG_PREFIX} The set active Context's active Reporting Period record exists in the local records cache`);

                // The initialisation is valid
                this.log.trace(`${LOG_PREFIX} The initialisation is valid`);

            } else {

                // The set active Context's active Reporting Period record does not exist in the local records cache
                this.log.trace(`${LOG_PREFIX} The set active Context's active Reporting Period record does not exist in the local records cache`);

                // The initialisation is invalid
                this.log.trace(`${LOG_PREFIX} The initialisation is invalid`);

                // Get the active Context's last Reporting Period record
                this.log.trace(`${LOG_PREFIX} Getting the active Context's last Reporting Period record`);
                const reportingPeriod: TimePeriod | null = this.reportingPeriodsDataService.records.length > 0 ? this.reportingPeriodsDataService.records[this.reportingPeriodsDataService.records.length - 1] : null;
                this.log.trace(`${LOG_PREFIX} Active Context's Last Reporting Period record = ${JSON.stringify(reportingPeriod)}`);

                // TODO: Get rid of the expanding reporting periods
                // Update the global filter
                this.log.trace(`${LOG_PREFIX} Updating the global filter`);
                this.filterService.update({ activeReportingPeriod: reportingPeriod, expandedTimePeriods: reportingPeriod ? [reportingPeriod] : [] });

            }

        } else {

            // The active Context's active Reporting Period has not been set in the global filter
            this.log.trace(`${LOG_PREFIX} The active Context's active Reporting Period has not been set in the global filter`);

            // Get the active Context's last Reporting Period record
            this.log.trace(`${LOG_PREFIX} Getting the active Context's last Reporting Period record`);
            const reportingPeriod: TimePeriod | null = this.reportingPeriodsDataService.records.length > 0 ? this.reportingPeriodsDataService.records[this.reportingPeriodsDataService.records.length - 1] : null;
            this.log.trace(`${LOG_PREFIX} Active Context's Last Reporting Period record = ${JSON.stringify(reportingPeriod)}`);

            // TODO: Get rid of the expanding reporting periods
            // Update the global filter
            this.log.trace(`${LOG_PREFIX} Updating the global filter`);
            this.filterService.update({ activeReportingPeriod: reportingPeriod, expandedTimePeriods: reportingPeriod ? [reportingPeriod] : [] });

        }

        // Update the local active Context's active Reporting Period reference
        this.log.trace(`${LOG_PREFIX} Updating the local active Context's active Reporting Period reference`);
        this.activeReportingPeriod = Object.assign({}, this.filterService.filter.activeReportingPeriod);

        // Return
        this.log.trace(`${LOG_PREFIX} Returning`);
        callback();

    }

    /**
     * Subscribe and react to the active Context's active Reporting Period changes
     * @param callback The function to call when done
     */
    private initialiseActiveContextActiveReportingPeriodChangesHandler(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseActiveContextActiveReportingPeriodChangesHandler()`);

        // Subscribe to filtering criteria updates and react to them if the Reporting Period is changed
        this.log.trace(`${LOG_PREFIX} Subscribing to filtering criteria updates and reacting to them if the Reporting Period is changed`);
        this._subscriptions.push(
            this.filterService.currentFilter$
                .subscribe({
                    next: (filter) => {

                        // Check if the globally active Context's Reporting Period has been changed
                        this.log.trace(`${LOG_PREFIX} Checking if the globally active Context's Reporting Period has been changed`);
                        if ((JSON.stringify(this.activeReportingPeriod) !== JSON.stringify(filter.activeReportingPeriod))) {

                            // The globally active Context's Reporting Period has been changed
                            this.log.trace(`${LOG_PREFIX} The globally active Context's Reporting Period has been changed`);

                            // Update the local active Context's Reporting Period reference
                            this.log.trace(`${LOG_PREFIX} Updating the local active Context's Reporting Period reference`);
                            this.activeReportingPeriod = Object.assign({}, filter.activeReportingPeriod);

                            // Update the form group
                            this.log.trace(`${LOG_PREFIX} Updating the form group`);
                            this.dataFormResponsesForm.get('reportingPeriod.reportingPeriodId')?.setValue((this.activeReportingPeriod && this.activeReportingPeriod.id) ? this.activeReportingPeriod.id : null);
                            this.dataFormResponsesForm.get('reportingPeriod.reportingPeriodNameLong')?.setValue(this.activeReportingPeriod ? this.textUtilService.truncate(this.getFormattedTimePeriod(this.activeReportingPeriod, false), [35, "..."]) : null);
                            this.dataFormResponsesForm.get('reportingPeriod.reportingPeriodNameShort')?.setValue(this.activeReportingPeriod ? this.textUtilService.truncate(this.getFormattedTimePeriod(this.activeReportingPeriod, true), [35, "..."]) : null);

                            // Mark loaded as false
                            this.log.trace(`${LOG_PREFIX} Loading commenced`);
                            this.loaded = false;
                            this.cd.detectChanges();

                            // Re-initialise the desired records state
                            this.initialiseDesiredRecordsState(() => {

                                // Mark loaded as true
                                this.log.trace(`${LOG_PREFIX} Loading complete`);
                                this.loaded = true;
                                this.cd.detectChanges();

                            });


                        } else {

                            // The globally active Context's Reporting Period has not been changed
                            this.log.trace(`${LOG_PREFIX} The globally active Context's Reporting Period has not been changed`);
                        }
                    }
                })
        );

        // Transfer control to the callback function
        callback();

    }


    /**
     * Retrieves and caches the active Context's Data Forms records
     * @param callback The function to call when done
     */
    private initialiseActiveContextDataForms(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseActiveContextDataForms()`);

        // Retrieve and cache the active Context's Data Forms records
        this.log.trace(`${LOG_PREFIX} Retrieving and caching the active Context's Data Forms records`);
        this.dataFormsDataService
            .getDataForms(true, {
                page: null,
                pageSize: null,
                searchTerm: null,
                sortColumn: 'name',
                sortDirection: 'asc',
                contextId: this.filterService.filter.activeContext?.id,
                name: null
            })
            .pipe(first()) // This will automatically complete (and therefore unsubscribe) after the first value has been emitted.
            .subscribe({
                next: (dataForms: DataForm[]) => {

                    // Active Context's Data Forms successfully retrieved and cached
                    this.log.debug(`${LOG_PREFIX} ${dataForms.length} Active Context's Data Form(s) succesfully retrieved and cached`);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                },

                error: (err: any) => {

                    // Active Context's Data Forms retrieval / caching failed
                    this.log.error(`${LOG_PREFIX} Active Context's Data Forms retrieval / caching failed`);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                }
            });


    }


    /**
     * Sets the active Context's active Data Form if it has not been set in the global filter
     * @param callback The function to call when done
     */
    private initialiseActiveContextActiveDataForm(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseActiveContextActiveDataForm()`);

        // Check if the active Context's active Data Form has already been set in the global filter
        this.log.trace(`${LOG_PREFIX} Checking if the active Context's active Data Form has already been set in the global filter`);
        if (this.filterService.filter.activeDataForm) {

            // The active Context's active Data Form has already been set in the global filter
            this.log.trace(`${LOG_PREFIX} The active Context's active Data Form has already been set in the global filter`);

            // Check if the set active Context's active Data Form record exists in the local records cache
            this.log.trace(`${LOG_PREFIX} Checking if the set active Context's active Data Form record exists in the local records cache`);
            if (this.dataFormsDataService.records.some(a => a.id == this.filterService.filter.activeDataForm?.id)) {

                // The set active Context's active Data Form record exists in the local records cache
                this.log.trace(`${LOG_PREFIX} The set active Context's active Data Form record exists in the local records cache`);

                // The initialisation is valid
                this.log.trace(`${LOG_PREFIX} The initialisation is valid`);

            } else {

                // The set active Context's active Data Form record does not exist in the local records cache
                this.log.trace(`${LOG_PREFIX} The set active Context's active Data Form record does not exist in the local records cache`);

                // The initialisation is invalid
                this.log.trace(`${LOG_PREFIX} The initialisation is invalid`);

                // Get the active Context's first Data Form record
                this.log.trace(`${LOG_PREFIX} Getting the active Context's first Data Form record`);
                const dataForm: DataForm | null = this.dataFormsDataService.records.length > 0 ? this.dataFormsDataService.records[0] : null;
                this.log.trace(`${LOG_PREFIX} Active Context's First Data Form record = ${JSON.stringify(dataForm)}`);

                // Update the global filter
                this.log.trace(`${LOG_PREFIX} Updating the global filter`);
                this.filterService.update({ activeDataForm: dataForm });

            }

        } else {

            // The active Context's active Data Form has not been set in the global filter
            this.log.trace(`${LOG_PREFIX} The active Context's active Data Form has not been set in the global filter`);

            // Get the active Context's first Data Form record
            this.log.trace(`${LOG_PREFIX} Getting the active Context's first Data Form record`);
            const dataForm: DataForm | null = this.dataFormsDataService.records.length > 0 ? this.dataFormsDataService.records[0] : null;
            this.log.trace(`${LOG_PREFIX} Active Context's First Data Form record = ${JSON.stringify(dataForm)}`);

            // Update the global filter
            this.log.trace(`${LOG_PREFIX} Updating the global filter`);
            this.filterService.update({ activeDataForm: dataForm });

        }

        // Update the local active Context's active Data Form reference
        this.log.trace(`${LOG_PREFIX} Updating the local active Context's active Data Form reference`);
        this.activeDataForm = Object.assign({}, this.filterService.filter.activeDataForm);

        // Return
        this.log.trace(`${LOG_PREFIX} Returning`);
        callback();

    }


    /**
     * Subscribe and react to the active Context's active Data Form changes
     * @param callback The function to call when done
     */
    private initialiseActiveContextActiveDataFormChangesHandler(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseActiveContextActiveDataFormChangesHandler()`);

        // Subscribe to filtering criteria updates and react to them if the Data Form is changed
        this.log.trace(`${LOG_PREFIX} Subscribing to filtering criteria updates and reacting to them if the Data Form is changed`);
        this._subscriptions.push(
            this.filterService.currentFilter$
                .subscribe({
                    next: (filter) => {

                        // Check if the globally active Context's Data Form has been changed
                        this.log.trace(`${LOG_PREFIX} Checking if the globally active Context's Data Form has been changed`);
                        if ((JSON.stringify(this.activeDataForm) !== JSON.stringify(filter.activeDataForm))) {

                            // The globally active Context's Data Form has been changed
                            this.log.trace(`${LOG_PREFIX} The globally active Context's Data Form has been changed`);

                            // Update the local active Context's Data Form reference
                            this.log.trace(`${LOG_PREFIX} Updating the local active Context's Data Form reference`);
                            this.activeDataForm = Object.assign({}, filter.activeDataForm);

                            // Update the form group
                            this.log.trace(`${LOG_PREFIX} Updating the form group`);
                            this.dataFormResponsesForm.get('dataForm.dataFormId')?.setValue((this.activeDataForm && this.activeDataForm.id) ? this.activeDataForm.id : null);
                            this.dataFormResponsesForm.get('dataForm.dataFormName')?.setValue((this.activeDataForm && this.activeDataForm.data?.name) ? this.activeDataForm.data.name : null);
                            this.dataFormResponsesForm.get('dataForm.dataFormNameLong')?.setValue((this.activeDataForm && this.activeDataForm.data?.name) ? this.textUtilService.truncate(this.activeDataForm.data.name, [150, "..."]) : null);
                            this.dataFormResponsesForm.get('dataForm.dataFormNameShort')?.setValue((this.activeDataForm && this.activeDataForm.data?.name) ? this.textUtilService.truncate(this.activeDataForm.data.name, [50, "..."]) : null);

                            // Mark loaded as false
                            this.log.trace(`${LOG_PREFIX} Loading commenced`);
                            this.loaded = false;
                            this.cd.detectChanges();

                            // Re-initialise the active Context's active Data Form's Workflow Transitions
                            this.initialiseActiveContextActiveDataFormWorkflowTransitions(() => {

                                // Re-initialise the ids of the Workflow States covered by the active Data Form's Workflow Transitions
                                this.initialiseActiveContextActiveDataFormWorkflowTransitionsStatesIds(() => {

                                    // Re-initialise the desired records state
                                    this.initialiseDesiredRecordsState(() => {

                                        // Mark loaded as true
                                        this.log.trace(`${LOG_PREFIX} Loading complete`);
                                        this.loaded = true;
                                        this.cd.detectChanges();

                                    });

                                });



                            });

                        } else {

                            // The globally active Context's Data Form has not been changed
                            this.log.trace(`${LOG_PREFIX} The globally active Context's Data Form has not been changed`);
                        }
                    }
                })
        );

        // Transfer control to the callback function
        callback();

    }

    /**
     * Retrieves and caches the active Context's active Data Form's Workflow Transitions records
     * @param callback The function to call when done
     */
    private initialiseActiveContextActiveDataFormWorkflowTransitions(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseWorkflowTransitions()`);

        // Retrieve and cache the active Context's active Data Form's Workflow Transitions records
        this.log.trace(`${LOG_PREFIX} Retrieving and caching the active Context's active Data Form's Workflow Transitions records`);
        this.workflowTransitionsDataService
            .getWorkflowTransitions(true, {
                page: null,
                pageSize: null,
                searchTerm: null,
                sortColumn: 'name',
                sortDirection: 'asc',
                workflowId: this.filterService.filter.activeDataForm?.data.workflow?.id,
                fromStateId: null,
                fromStateName: null,
                toStateId: null,
                toStateName: null,
                permissionId: null,
                permissionName: null,
                verb: null
            })
            .pipe(first()) // This will automatically complete (and therefore unsubscribe) after the first value has been emitted.
            .subscribe({
                next: (workflowTransitions: WorkflowTransition[]) => {

                    // Active Context's active Data Form's Workflow Transition(s) successfully retrieved and cached
                    this.log.debug(`${LOG_PREFIX} ${workflowTransitions.length} Active Context's active Data Form's Workflow Transition(s) successfully retrieved and cached`);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                },

                error: (err: any) => {

                    // Active Context's active Data Form's Workflow Transition(s) retrieval failed
                    this.log.error(`${LOG_PREFIX} Active Context's active Data Form's Workflow Transition(s) retrieval failed`);

                    // Return
                    this.log.trace(`${LOG_PREFIX} Returning`);
                    callback();
                }
            });


    }




    /**
     * Initialises the ids of the Workflow States covered by the Data Form's Workflow Transition(s) 
     * @param callback 
     */
    private initialiseActiveContextActiveDataFormWorkflowTransitionsStatesIds(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseActiveContextActiveDataFormWorkflowTransitionsStatesIds()`);

        // Collate the unique identifiers of the Workflow States covered by the Data Form's Workflow Transition(s)
        this.log.trace(`${LOG_PREFIX} Collating the unique identifiers of the Workflow States covered by the Data Form's Workflow Transition(s)`);

        const states: Set<number> = new Set();
        for (let transition of this.workflowTransitionsDataService.records) {

            if (transition.data.from?.id) {
                states.add(transition.data.from.id);
            }

            if (transition.data.to?.id) {
                states.add(transition.data.to.id);
            }
        }
        this.workflowStatesIds = Array.from(states);

        this.log.debug(`${LOG_PREFIX} Workflow States Ids = ${JSON.stringify(this.workflowStatesIds)}`);

        // Return
        this.log.trace(`${LOG_PREFIX} Returning`);
        callback();
    }

    /**
     * Initialise the active Context Rights
     * @param callback 
     */
    private initialiseActiveContextSystemUserRights(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseActiveContextRights()`);

        // Get all the user rights associated with the current context
        const temp: SystemUserRight[] | undefined = this.filterService.filter.activeSystemUser?.data.rights?.filter(r => r.data.context?.id == this.filterService.filter.activeContext?.id);

        // Use the first as the active right
        this.activeContextSystemUserRights = (temp && temp.length > 0) ? temp[0] : null
        this.log.debug(`${LOG_PREFIX} Active Context = ${JSON.stringify(this.activeContext)}`);

        // Return
        this.log.trace(`${LOG_PREFIX} Returning`);
        callback();
    }


    /**
     * Presets default values in the data tabulation form
     * @param callback The function to call when done
     */
    private initialiseFormGroup(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseFormGroup()`);

        this.log.trace(`${LOG_PREFIX} Get the Active Data Form`);
        const activeDataForm: DataForm | null | undefined = this.filterService.filter.activeDataForm;
        this.log.debug(`${LOG_PREFIX} Active Data Form = ${JSON.stringify(activeDataForm)}`);

        this.log.trace(`${LOG_PREFIX} Get the Active Reporting Period`);
        const activeReportingPeriod: TimePeriod | null | undefined = this.filterService.filter.activeReportingPeriod;
        this.log.debug(`${LOG_PREFIX} Active Reporting Period = ${JSON.stringify(activeReportingPeriod)}`);

        this.dataFormResponsesForm.get('dataForm.dataFormId')?.setValue((activeDataForm && activeDataForm.id) ? activeDataForm.id : null);
        this.dataFormResponsesForm.get('dataForm.dataFormName')?.setValue((activeDataForm && activeDataForm.data?.name) ? activeDataForm.data.name : null);
        this.dataFormResponsesForm.get('dataForm.dataFormNameLong')?.setValue((activeDataForm && activeDataForm.data?.name) ? this.textUtilService.truncate(activeDataForm.data.name, [150, "..."]) : null);
        this.dataFormResponsesForm.get('dataForm.dataFormNameShort')?.setValue((activeDataForm && activeDataForm.data?.name) ? this.textUtilService.truncate(activeDataForm.data.name, [50, "..."]) : null);

        this.dataFormResponsesForm.get('reportingPeriod.reportingPeriodId')?.setValue((activeReportingPeriod && activeReportingPeriod.id) ? activeReportingPeriod.id : null);
        this.dataFormResponsesForm.get('reportingPeriod.reportingPeriodNameLong')?.setValue(this.activeReportingPeriod ? this.textUtilService.truncate(this.getFormattedTimePeriod(this.activeReportingPeriod, false), [150, "..."]) : null);
        this.dataFormResponsesForm.get('reportingPeriod.reportingPeriodNameShort')?.setValue(this.activeReportingPeriod ? this.textUtilService.truncate(this.getFormattedTimePeriod(this.activeReportingPeriod, true), [50, "..."]) : null);

        // Return
        this.log.trace(`${LOG_PREFIX} Returning`);
        callback();

    }


    /**
     * Initialise is reviewer
     * @param callback 
     */
    private initialiseIsReviewer(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseIsReviewer()`);

        // Get the system user's context permissions
        this.log.trace(`${LOG_PREFIX} Get the system user's context permissions`);
        const permissions: string[] | null | undefined = this.filterService.filter.activeSystemUserContextSystemRole?.data.permissions;

        this.activeContext = this.filterService.filter.activeContext;
        this.log.debug(`${LOG_PREFIX} Active Context = ${JSON.stringify(this.activeContext)}`);

        // Return
        this.log.trace(`${LOG_PREFIX} Returning`);
        callback();
    }



    /**
     * Presets default values in the desired records state bean
     * @param callback The function to call when done
     */
    private initialiseDesiredRecordsState(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseDesiredRecordsState()`);

        this.log.trace(`${LOG_PREFIX} Get the Active Time Period`);
        const activeTimePeriod: TimePeriod | null | undefined = this.filterService.filter.activeReportingPeriod;
        this.log.debug(`${LOG_PREFIX} Active Time Period = ${JSON.stringify(activeTimePeriod)}`);

        this.log.trace(`${LOG_PREFIX} Get the Active Data Form`);
        const activeDataForm: DataForm | null | undefined = this.filterService.filter.activeDataForm;
        this.log.debug(`${LOG_PREFIX} Active Data Form = ${JSON.stringify(activeDataForm)}`);

        // Make a copy of the desired records state
        this.log.trace(`${LOG_PREFIX} Making a copy of the desired records state`);
        let copy: DataFormResponseState = Object.assign({}, this.stateSubject$.value);

        // Set the active time period id
        this.log.trace(`${LOG_PREFIX} Setting the active time period id`);
        copy.timePeriodId = activeTimePeriod?.id;

        // Set the active form id
        this.log.trace(`${LOG_PREFIX} Setting the active form id`);
        copy.formId = activeDataForm?.id;

        // Set the target entity, location or organisation
        this.log.trace(`${LOG_PREFIX} Setting the target entity, location or organisation`);
        if (this.isLoggedInUserEntityScoped()) {
            copy.entityId = this.activeContextSystemUserRights?.data.entity?.id;
            copy.locationId = null;
            copy.organisationId = null;
        } else if (this.isLoggedInUserLocationScoped()) {
            copy.entityId = null;
            copy.locationId = this.activeContextSystemUserRights?.data.location?.accountabilities[0]?.id;
            copy.organisationId = null;
        } else if (this.isLoggedInUserOrganisationScoped()) {
            copy.entityId = null;
            copy.locationId = null;
            copy.organisationId = this.activeContextSystemUserRights?.data.organisation?.id;
        }

        // TODO - Lock admin role
        // Set respondent and status ids based on the status of the response
        switch (this.activeTab?.index) {

            case 0: // Draft

                // The desired responses are at the draft stage
                this.log.trace(`${LOG_PREFIX} The desired responses are at the draft stage`);

                // Set the active status id to 1 (draft)
                this.log.trace(`${LOG_PREFIX} Setting the active status id to 1 (draft)`);
                copy.statusIds = [1];

                // Check if the logged in user is an admin
                this.log.trace(`${LOG_PREFIX} Checking if the logged in user is an admin`);
                if (this.filterService.filter.activeSystemUserContextSystemRole?.id == 1) {

                    // The logged in user is an admin
                    this.log.trace(`${LOG_PREFIX} The logged in user is an admin`);

                    // Set the respondent id to null - to allow the admin unrestricted access to the draft responses
                    this.log.trace(`${LOG_PREFIX} Setting the respondent id to null - to allow the admin unrestricted access to the draft responses`);
                    copy.respondentId = null;

                } else {

                    // The logged in user is not an admin
                    this.log.trace(`${LOG_PREFIX} The logged in user is not an admin`);

                    // Set the respondent id to the id of the logged in user - to allow the user access to the draft responses only if they are theirs
                    this.log.trace(`${LOG_PREFIX} Setting the respondent id to the id of the logged in user - to allow the user access to the draft responses only if they are theirs`);
                    copy.respondentId = this.filterService.filter.activeSystemUser?.id;
                }


                break;

            case 1: // In Review

                // The desired responses are at the review stage
                this.log.trace(`${LOG_PREFIX} The desired responses are at the review stage`);

                // Set the active status id to in-review
                this.log.trace(`${LOG_PREFIX} Setting the active status id to in-review`);

                copy.statusIds = this.workflowStatesIds.filter(id => (id != 1 && id != 3));

                // Check if The logged in user is an admin or eviewer
                this.log.trace(`${LOG_PREFIX} Checking if The logged in user is an admin or reviewer`);
                if (this.filterService.filter.activeSystemUserContextSystemRole?.id == 1) {

                    // The logged in user is an admin
                    this.log.trace(`${LOG_PREFIX} The logged in user is an admin`);

                    // Set the respondent id to null - to allow the admin unrestricted access to the in-review responses
                    this.log.trace(`${LOG_PREFIX} Setting the respondent id to null - to allow the admin unrestricted access to the in-review responses`);
                    copy.respondentId = null;

                } else if (this.filterService.filter.activeSystemUserContextSystemRole?.id &&
                    environment.roles.reviewers.includes(this.filterService.filter.activeSystemUserContextSystemRole?.id)) {

                    // The logged in user is a reviewer
                    this.log.trace(`${LOG_PREFIX} The logged in user is a reviewer`);

                    // Set the respondent id to null - to allow the reviewer unrestricted access to the in-review responses
                    this.log.trace(`${LOG_PREFIX} Setting the respondent id to null - to allow the reviewer unrestricted access to the in-review responses`);
                    copy.respondentId = null;

                } else {

                    // The user is not an admin or reviewer
                    this.log.trace(`${LOG_PREFIX} The user is not an admin or reviewer`);

                    // Set the respondent id to the id of the logged in user - to allow the user access to the in-review responses only if they are theirs
                    this.log.trace(`${LOG_PREFIX} Setting the respondent id to the id of the logged in user - to allow the user access to the in-review responses only if they are theirs`);
                    copy.respondentId = this.filterService.filter.activeSystemUser?.id;
                }


                break;

            case 2: // Published

                // The desired responses are at the published stage
                this.log.trace(`${LOG_PREFIX} The desired responses are at the published stage`);

                // Set the active status id to published
                this.log.trace(`${LOG_PREFIX} Setting the active status id to published`);

                copy.statusIds = [3];

                // Check if The logged in user is an admin or reviewer
                this.log.trace(`${LOG_PREFIX} Checking if The logged in user is an admin or reviewer`);
                if (this.filterService.filter.activeSystemUserContextSystemRole?.id == 1) {

                    // The logged in user is an admin
                    this.log.trace(`${LOG_PREFIX} The logged in user is an admin`);

                    // Set the respondent id to null - to allow the admin unrestricted access to the published responses
                    this.log.trace(`${LOG_PREFIX} Setting the respondent id to null - to allow the admin unrestricted access to the published responses`);
                    copy.respondentId = null;

                } else if (this.filterService.filter.activeSystemUserContextSystemRole?.id &&
                    environment.roles.reviewers.includes(this.filterService.filter.activeSystemUserContextSystemRole?.id)) {

                    // The logged in user is a reviewer
                    this.log.trace(`${LOG_PREFIX} The logged in user is a reviewer`);

                    // Set the respondent id to null - to allow the reviewer unrestricted access to the published responses
                    this.log.trace(`${LOG_PREFIX} Setting the respondent id to null - to allow the reviewer unrestricted access to the published responses`);
                    copy.respondentId = null;

                } else {

                    // The user is not an admin or reviewer
                    this.log.trace(`${LOG_PREFIX} The user is not an admin or reviewer`);

                    // Set the respondent id to the id of the logged in user - to allow the user access to the published responses only if they are theirs
                    this.log.trace(`${LOG_PREFIX} Setting the respondent id to the id of the logged in user - to allow the user access to the published responses only if they are theirs`);
                    copy.respondentId = this.filterService.filter.activeSystemUser?.id;
                }

                break;

            default:
                this.log.error(`${LOG_PREFIX} Unknown tab index`);
                this.log.warn(`${LOG_PREFIX} Setting status to -1`);
                copy.statusIds = [-1];


        }

        // Broadcast the newly desired record state
        this.log.trace(`${LOG_PREFIX} Broadcasting the newly desired record state`);
        this.stateSubject$.next(copy);

        // Return
        this.log.trace(`${LOG_PREFIX} Returning`);
        callback();

    }


    /**
     * Subscribe and react to desired records state changes
     * @param callback The function to call when done
     */
    private initialiseDesiredRecordsStateChangesHandler(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseDesiredRecordsStateChangesHandler()`);

        // Subscribe to desired record states changes and react to them
        this.log.trace(`${LOG_PREFIX} Subscribing to desired record states changes`);
        this._subscriptions.push(
            this.stateSubject$

                .subscribe({
                    next: (state) => {

                        // Desired records state changed
                        this.log.trace(`${LOG_PREFIX} Desired records state changed`);
                        this.log.debug(`${LOG_PREFIX} Desired records state = ${JSON.stringify(state)}`);
                        this.loaded = false;
                        this.cd.detectChanges();

                        // Retrieve the Data Form Response records corresponding to the passed in state
                        this.log.trace(`${LOG_PREFIX} Retrieving the Data Form Response records corresponding to the passed in state`);
                        this.dataFormsResponsesDataService
                            .getDataFormsResponses(true, state)
                            .subscribe({
                                next: (responses: DataFormResponse[]) => {
                                    this.loaded = true;
                                    this.cd.detectChanges();
                                },

                                error: (err: any) => {
                                    this.loaded = true;
                                    this.cd.detectChanges();
                                }
                            });

                    }
                })
        );

        // Transfer control to the callback function
        callback();

    }

    /**
 *Establishes whether the field is required
 * @returns True or False
 */
    public isRequired(): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isRequired()`);

        if (this.dataFormResponse.data.ongoing) {
            return true;
        } else {
            return false;
        }

    }



    /**
        * Checks if the reporting mode is cumulative
        * @returns 
        */
    public isCumulative(): boolean {
        return environment.response.cumulative;
    }

    /**
        * Checks if the current user is entity scoped
        * @returns 
        */
    public isLoggedInUserEntityScoped(): boolean {

        return (this.activeContextSystemUserRights?.data.scopeType?.id == 1) ? true : false;
    }

    /**
     * Checks if the current user is location scoped
     * @returns 
     */
    public isLoggedInUserLocationScoped(): boolean {

        return (this.activeContextSystemUserRights?.data.scopeType?.id == 2) ? true : false;
    }

    /**
     * Checks if the current user is organisation scoped
     * @returns 
     */
    public isLoggedInUserOrganisationScoped(): boolean {

        return (this.activeContextSystemUserRights?.data.scopeType?.id == 3) ? true : false;
    }

    /**
     * Classifies responses based on their source
     * @returns 1 if filled by an entity scoped user, 2 if filled by a location scoped user, 3 if filled by an organisation scoped user
     */
    public getResponseClassification(dataFormResponse: DataFormResponse): number | null {

        if (dataFormResponse) {
            if (dataFormResponse.data.entity) {
                return 1;
            } else if (dataFormResponse.data.organisations) {
                return 3;
            } else {
                return 2;
            }
        }

        return null;
    }

    /**
     * Takes in a time period object and returns a presentable string version of its period
     * @param timePeriod the time period
     * @returns The presentable string version of the time period
     * @see https://momentjs.com/docs/#/parsing/string/
     */
    public getFormattedTimePeriod(timePeriod: TimePeriod, short: boolean): string | null {

        this.log.trace(`${LOG_PREFIX} Entering getFormattedTimePeriod()`);

        if (timePeriod?.data?.start && timePeriod?.data?.end) {

            switch (timePeriod.data.typeId) {

                case 1: //Daily

                    return short ?
                        moment(timePeriod.data.start, "YYYY-MM-DD").format("DD/MM/YY") :
                        moment(timePeriod.data.start, "YYYY-MM-DD").format("ddd, MMM DD YYYY");

                default:

                    return short ?
                        `${moment(timePeriod.data.start, "YYYY-MM-DD").format("DD/MM/YY")} - ${moment(timePeriod.data.end, "YYYY-MM-DD").format("DD/MM/YY")}` :
                        `${moment(timePeriod.data.start, "YYYY-MM-DD").format("ddd, MMM DD YYYY")} - ${moment(timePeriod.data.end, "YYYY-MM-DD").format("ddd, MMM DD YYYY")}`;

            }

        } else {
            return null;
        }
    }


    /**
     * Gets a copy of the data form fields responses to avoid dirtying the clean ones during editing
     * @returns the data form fields responses copy
     */
    public getDataFormFieldsResponsesCopy(): DataFormFieldResponse[] {

        this.log.trace(`${LOG_PREFIX} Entering getDataFormFieldsResponsesCopy()`);

        if (this.dataFormResponse && this.dataFormResponse.data.responses) {
            return Object.assign([], this.dataFormResponse.data.responses);
        } else {
            return []
        }

    }

    /**
     * Deciphers the next possible permissible transitions based on the current status of the loaded response
     * @param workflowTransitions 
     */
    public getPermissibleTransitions(workflowTransitions: WorkflowTransition[] | null): WorkflowTransition[] {

        this.log.trace(`${LOG_PREFIX} Entering getPermissibleTransitions()`);

        // Check if the data form's workflow transitions were passed in
        this.log.trace(`${LOG_PREFIX} Checking if the data form's workflow transitions were passed in`);
        if (workflowTransitions && workflowTransitions.length > 0) {

            // The data form's workflow transitions were passed in
            this.log.trace(`${LOG_PREFIX} The data form's workflow transitions were passed in`);
            this.log.debug(`${LOG_PREFIX} Data form's workflow transitions = ${JSON.stringify(workflowTransitions)}`);

            // Get the possible data form transitions based on the data form response's status
            this.log.trace(`${LOG_PREFIX} Getting the possible data form transitions based on the data form response's status`);
            const possibleTransitions: WorkflowTransition[] = workflowTransitions.filter(w => w.data.from?.id == this.dataFormResponse.data.status?.id);

            // Get the possible permissible data form transitions based on the data form response's status & logged in user's role
            this.log.trace(`${LOG_PREFIX} Getting the possible permissible data form transitions based on the data form response's status & logged in user's role`);
            const permissibleTransitions: WorkflowTransition[] = [];

            for (let w of possibleTransitions) {

                switch (w.data.from?.id) {

                    case 1: // Draft

                        this.log.debug(`${LOG_PREFIX} Data form's status = Draft`);

                        // Check if the currently logged in user is the owner of the data form response
                        this.log.trace(`${LOG_PREFIX} Checking if the currently logged in user is the owner of the data form response`);
                        this.log.debug(`${LOG_PREFIX} Checking if ${this.dataFormResponse.data.respondent?.id} = ${this.filterService.filter.activeSystemUser?.id}`);

                        if (this.dataFormResponse.data.respondent?.id == this.filterService.filter.activeSystemUser?.id) {

                            // The currently logged in user is the owner of the data form response
                            this.log.trace(`${LOG_PREFIX} The currently logged in user is the owner of the data form response`);

                            // Queue the transition
                            this.log.trace(`${LOG_PREFIX} Queueing the transition`);
                            permissibleTransitions.push(w);

                        } else {

                            // The currently logged in user is not the owner of the data form response
                            this.log.trace(`${LOG_PREFIX} The currently logged in user is not the owner of the data form response`);

                            // Ignore the transition
                            this.log.trace(`${LOG_PREFIX} Ignoring the transition`);

                        }

                        break;

                    case 3: // Published

                        this.log.debug(`${LOG_PREFIX} Data form's status = Published`);

                        // Check if the currently logged in user is an administrator
                        this.log.trace(`${LOG_PREFIX} Checking if the currently logged in user is an administrator`);

                        switch (this.filterService.filter.activeSystemUserContextSystemRole?.id) {

                            case 1: // Admin

                                // The currently logged in user is an administrator
                                this.log.trace(`${LOG_PREFIX} The currently logged in user is an administrator`);

                                // Queue the transition
                                this.log.trace(`${LOG_PREFIX} Queueing the transition`);
                                permissibleTransitions.push(w);

                                break;

                            default:

                                // The currently logged in user is not an administrator
                                this.log.trace(`${LOG_PREFIX} The currently logged in user is not an administrator`);

                                // Ignore the transition
                                this.log.trace(`${LOG_PREFIX} Ignoring the transition`);

                        }

                        break;

                    default: // Review 

                        this.log.debug(`${LOG_PREFIX} Data form's status = Review`);

                        // Check if the currently logged in user is a reviewer or administrator
                        this.log.trace(`${LOG_PREFIX} Checking if the currently logged in user is a reviewer or administrator`);

                        switch (this.filterService.filter.activeSystemUserContextSystemRole?.id) {

                            case 1: // Admin
                            case 3: // Reviewer

                                // The currently logged in user is a reviewer or administrator
                                this.log.trace(`${LOG_PREFIX} The currently logged in user is a reviewer or administrator`);

                                // Queue the transition
                                this.log.trace(`${LOG_PREFIX} Queueing the transition`);
                                permissibleTransitions.push(w);

                                break;

                            default:

                                // The currently logged in user is not a reviewer or administrator
                                this.log.trace(`${LOG_PREFIX} The currently logged in user is not a reviewer or administrator`);

                                // Ignore the transition
                                this.log.trace(`${LOG_PREFIX} Ignoring the transition`);



                        }
                }

            }

            return permissibleTransitions;

        } else {

            // The data form's workflow transitions were not passed in
            this.log.error(`${LOG_PREFIX} The data form's workflow transitions were not passed in`);

            // Return
            this.log.warn(`${LOG_PREFIX} Returning an empty transition collection`);
            return [];
        }

    }

    /**
     * Establishes whether a data form response is editable
     * @param dataFormResponse the target data form response
     * @returns true or false 
     */
    public isEditable(dataFormResponse: DataFormResponse): boolean {

        // A form is editable:-
        // 1. if the current period is open
        // 2. if the response is in the draft state
        // 3. if the current user is the owner of the response
        if (!this.isCurrentTimePeriodOpen()) {
            return false;
        } else {
            if (dataFormResponse.data.status?.id != 1) {
                return false;
            } else {
                return dataFormResponse.data.respondent?.id == this.filterService.filter.activeSystemUser?.id
            }

        }

    }


    /**
     * Checks if the prevailing time period is open
     * @returns 
     */
    public isCurrentTimePeriodOpen(): boolean {

        return this.filterService.filter.activeReportingPeriod?.data.open ? this.filterService.filter.activeReportingPeriod.data.open : false;
    }

    /**
     * Updates the loading animation status
     * @param status The loading status 
     */
    onUpdateLoadingStatus(status: boolean): void {
        // Loading status changed
        this.log.trace(`${LOG_PREFIX} Loading status changed`);
        this.log.debug(`${LOG_PREFIX} Loading status = ${status}`);

        // Propagate the loading status to the loading animation component
        this.log.trace(`${LOG_PREFIX} Propagating the loading status to the loading animation component`);
        this._animation.loading = status;

        // Mark the UI as needing to be checked for changes
        this.log.trace(`${LOG_PREFIX} Marking the UI as needing to be checked for changes`);
        this.cd.markForCheck();

    }

    /**
     * Opens the Data Form Selector
     */
    public onOpenDataFormSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering onOpenDataFormSelector()`);
        this.modalService.open(DataFormsRecordsSelectionModalComponent, { centered: true, backdrop: 'static' });

    }

    /**
     * Opens the Reporting Period Selector
     */
    public onOpenReportingPeriodSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering onOpenReportingPeriodSelector()`);
        this.modalService.open(TimePeriodsRecordsSelectionModalComponent, { centered: true, backdrop: 'static' });

    }

    /**
     * Handles Data Forms change events
     */
    public onDataFormChange(): void {

        this.log.trace(`${LOG_PREFIX} Entering onDataFormChange()`);


        // Get the selected data form id
        this.log.trace(`${LOG_PREFIX} Getting the selected Data Form Id`);
        this.dataFormId = this.dataFormResponsesForm.get('dataFormId')?.value
        this.log.debug(`${LOG_PREFIX} Data Form Id = ${this.dataFormId}`);


        // Update the global filter
        this.log.trace(`${LOG_PREFIX} Updating the global filter`);
        this.filterService.update({ activeDataForm: this.dataFormsDataService.records.find(d => d.id == this.dataFormId) });



    }


    /**
     * Handles Data Forms change events
     */
    public onChangeTab(tab: Tab): void {

        if (tab.index != this.activeTab?.index) {

            // Update the active tab
            this.log.trace(`${LOG_PREFIX} Updating the active tab`);
            this.activeTab = tab;
            for (let t of this.tabs) {
                if (t.index == tab.index) {
                    t.active = true;
                } else {
                    t.active = false;
                }
            }

            // Mark loaded as false
            this.log.trace(`${LOG_PREFIX} Loading commenced`);
            this.loaded = false;
            this.cd.detectChanges();

            // Re-initialise the desired records state
            this.initialiseDesiredRecordsState(() => {

                // Mark loaded as true
                this.log.trace(`${LOG_PREFIX} Loading complete`);
                this.loaded = true;
                this.cd.detectChanges();

            });
        }



    }

    /**
     * Handles search events
     * @param searchTerm The term to search by
     */
    public onSearchTermChange(searchTerm: string): void {

        this.log.trace(`${LOG_PREFIX} Entering onSearchTermChange()`);
        this.log.debug(`${LOG_PREFIX} Search Term = ${searchTerm}`);

        // Check if the specified search term is different from the current search term
        this.log.trace(`${LOG_PREFIX} Check if the specified search term is different from the current search term`);

        if (searchTerm != this.stateSubject$.value.searchTerm) {

            // The specified search term is different from the current search
            this.log.trace(`${LOG_PREFIX} The specified search term is different from the current search`);

            // Make a copy of the desired records state
            this.log.trace(`${LOG_PREFIX} Making a copy of the desired records state`);
            let copy: DataFormResponseState = Object.assign({}, this.stateSubject$.value);

            // Update the copy of the desired records state
            this.log.trace(`${LOG_PREFIX} Updating the copy of the desired records state`);
            Object.assign(copy, { searchTerm: searchTerm });

            // Broadcast the newly desired record state
            this.log.trace(`${LOG_PREFIX} Broadcasting the newly desired record state`);
            this.stateSubject$.next(copy);

        } else {

            // The specified search term is not different from the current search
            this.log.trace(`${LOG_PREFIX} The specified search term is not different from the current search term`);

            // Ignore the event
            this.log.trace(`${LOG_PREFIX} Ignoring the change event`);

        }

    }


    /**
     * Handles page change events
     * @param page The page to load
     */
    public onPageChange(page: number): void {

        this.log.trace(`${LOG_PREFIX} Entering onPageChange()`);
        this.log.debug(`${LOG_PREFIX} Page = ${page}`);

        // Check if the specified page is different from the current page
        this.log.trace(`${LOG_PREFIX} Check if the specified page is different from the current page`);

        if (page != this.stateSubject$.value.page) {

            // The specified page is different from the current page
            this.log.trace(`${LOG_PREFIX} The specified page is different from the current page`);

            // Make a copy of the desired records state
            this.log.trace(`${LOG_PREFIX} Making a copy of the desired records state`);
            let copy: DataFormResponseState = Object.assign({}, this.stateSubject$.value);

            // Update the copy of the desired records state
            this.log.trace(`${LOG_PREFIX} Updating the copy of the desired records state`);
            Object.assign(copy, { page: page });

            // Broadcast the newly desired record state
            this.log.trace(`${LOG_PREFIX} Broadcasting the newly desired record state`);
            this.stateSubject$.next(copy);

        } else {

            // The specified page is not different from the current page
            this.log.trace(`${LOG_PREFIX} The specified page is not different from the current page`);

            // Ignore the event
            this.log.trace(`${LOG_PREFIX} Ignoring the change event`);

        }

    }

    /**
     * Handles page size change events
     * @param pageSize The page size to use
     */
    public onPageSizeChange(pageSize: number): void {

        this.log.trace(`${LOG_PREFIX} Entering onPageSizeChange()`);
        this.log.debug(`${LOG_PREFIX} Page Size = ${pageSize}`);

        // Check if the specified page size is different from the current page size
        this.log.trace(`${LOG_PREFIX} Check if the specified page size is different from the current page size`);

        if (pageSize != this.stateSubject$.value.pageSize) {

            // The specified page size is different from the current page size
            this.log.trace(`${LOG_PREFIX} The specified page size is different from the current page size`);

            // Make a copy of the desired records state
            this.log.trace(`${LOG_PREFIX} Making a copy of the desired records state`);
            let copy: DataFormResponseState = Object.assign({}, this.stateSubject$.value);

            // Update the copy of the desired records state
            this.log.trace(`${LOG_PREFIX} Updating the copy of the desired records state`);
            Object.assign(copy, { pageSize: pageSize });

            // Broadcast the newly desired record state
            this.log.trace(`${LOG_PREFIX} Broadcasting the newly desired record state`);
            this.stateSubject$.next(copy);

        } else {

            // The specified page size is not different from the current page size
            this.log.trace(`${LOG_PREFIX} The specified page size is not different from the current page size`);

            // Ignore the event
            this.log.trace(`${LOG_PREFIX} Ignoring the change event`);

        }

    }


    /**
     * Opens the data form for data entry or review
     * @param dataFormResponse the data form response whose responses are being manipulated or reviewed
     */
    public onOpenDataFormResponse(dataFormResponse: DataFormResponse): void {

        this.log.trace(`${LOG_PREFIX} Entering onOpenDataFormResponse()`);

        this.dataFormResponse = dataFormResponse;
        this.page = "form";
        this.cd.detectChanges();

    }


    /**
     * Closes the currently opened data form response page
     */
    public onCloseDataFormResponse(): void {

        this.page = "default";
        this.cd.detectChanges();
    }


    /**
     * Updates and saves the data form response on field responses changes
     * @param dataFormFieldResponses the field responses that are valid following changes
     */
    public onDataFormFieldsResponsesUpdation(dataFormFieldResponses: DataFormFieldResponse[]): void {

        this.dataFormResponse.data.responses = Object.assign([], dataFormFieldResponses);
        this.dataFormResponse.data.timePointId = this.dateUtilService.getTimePointIdFromDate(new Date());

        this.dataFormsResponsesDataService
            .updateDataFormResponse(this.dataFormResponse)
            .subscribe({
                next: (response: DataFormResponse) => {

                    // The Data Form Response Record was saved successfully
                    this.log.trace(`${LOG_PREFIX} Data Form Response Record was saved successfuly`);

                }
            });
    }

    /**
       * Flags whether or not the field should be required
       * @param e Switch event
       */
    public toggleRequireability(e: any): void {

        this.log.trace(`${LOG_PREFIX} Entering toggleRequireability()`);

        // Check if the switch has been checked
        this.log.trace(`${LOG_PREFIX} Checking if the switch has been checked`);
        if (e.target.checked) {

            // The switch has been checked
            this.log.trace(`${LOG_PREFIX} The switch has been checked`);

            // Update the record
            this.log.trace(`${LOG_PREFIX} Updating the record`);
            this.dataFormResponse.data.ongoing = true;


        } else {

            // The switch has been unchecked
            this.log.trace(`${LOG_PREFIX} The switch has been unchecked`);

            // Update the record
            this.log.trace(`${LOG_PREFIX} Updating the record`);
            this.dataFormResponse.data.ongoing = false;
        }

        this.dataFormsResponsesDataService
            .updateDataFormResponse(this.dataFormResponse)
            .subscribe({
                next: (response: DataFormResponse) => {

                    // The Data Form Response Record was saved successfully
                    this.log.trace(`${LOG_PREFIX} Data Form Response Record was saved successfuly`);

                }
            });

    }


    /**
     * Updates and saves the data form response on workflow transitions
     * @param transition the workflow transition
     */
    public processTransition(transition: WorkflowTransition): void {

        this.dataFormResponse.data.status = { id: transition.data.to?.id, name: transition.data.to?.name };
        this.dataFormResponse.data.timePointId = this.dateUtilService.getTimePointIdFromDate(new Date());

        this.dataFormsResponsesDataService
            .updateDataFormResponse(this.dataFormResponse)
            .subscribe({
                next: (response: DataFormResponse) => {

                    // The Data Form Response Record was saved successfully
                    this.log.trace(`${LOG_PREFIX} Data Form Response Record was saved successfuly`);

                    // Update the UI
                    this.page = "default";
                    this.cd.detectChanges();

                    // Check if the response has transitioned to the published state
                    this.log.trace(`${LOG_PREFIX} Checking if the response has transitioned to the published state`);
                    if (response.data.status?.id == 3) {

                        // The response has transitioned to the published state
                        this.log.trace(`${LOG_PREFIX} The response has transitioned to the published state`);

                        // Create an aggregation task
                        this.log.trace(`${LOG_PREFIX} Creating an aggregation task`);
                        this.systemsTasksDataService
                            .createSystemTask(new SystemTask({
                                id: null,
                                data: {
                                    contextId: this.filterService.filter.activeContext?.id,
                                    timePointId: response.data.timePointId,
                                    taskTypeId: SystemTaskType.AGGREGATION.id,
                                    taskStatusId: SystemTaskStatus.OPEN.id,
                                    locations: this.dataFormResponse.data.location
                                },
                                version: null
                            })).subscribe({
                                next: (res: SystemTask) => {

                                    // Aggregation task successfully created
                                    this.log.trace(`${LOG_PREFIX} Aggregation task successfully created`);
                                    this.log.debug(`${LOG_PREFIX} Task = ${JSON.stringify(res)}`);

                                },
                                error: (err: any) => {

                                    // Aggregation task creation failed
                                    this.log.error(`${LOG_PREFIX} Aggregation task creation failed`);
                                }
                            })


                    } else {
                        // The response has not transitioned to the published state
                        this.log.trace(`${LOG_PREFIX} The response has not transitioned to the published state`);


                    }



                }
            });
    }

}