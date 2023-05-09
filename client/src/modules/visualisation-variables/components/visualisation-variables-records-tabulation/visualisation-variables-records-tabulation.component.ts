import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostListener,
    Input,
    OnDestroy,
    OnInit,
} from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { Subscription, BehaviorSubject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { VisualisationVariablesRecordsCreationModalComponent } from '@modules/visualisation-variables/containers/visualisation-variables-records-creation-modal/visualisation-variables-records-creation-modal.component';
import { VisualisationVariablesRecordsDeletionModalComponent } from '@modules/visualisation-variables/containers/visualisation-variables-records-deletion-modal/visualisation-variables-records-deletion-modal.component';
import { VisualisationVariablesRecordsUpdationModalComponent } from '@modules/visualisation-variables/containers/visualisation-variables-records-updation-modal/visualisation-variables-records-updation-modal.component';
import { VisualisationVariablesDataService } from '@modules/visualisation-variables/services/visualisation-variables-data.service';
import { FormControl, FormGroup } from '@angular/forms';
import { FilterService } from '@app/app-filter.service';
import { VisualisationVariable } from '@modules/visualisation-variables/models/visualisation-variable.model';
import { OperatorsDataService } from '@modules/operators/services/operators-data.service';
import { VisualisationContainer } from '@modules/visualisations-containers/models/visualisation-container.model';
import { VisualisationsDataService } from '@modules/visualisations/services/visualisations-data.service';
import { VisualisationsMessagesService } from '@modules/visualisations/services/visualisations-message.service';
import { Visualisation } from '@modules/visualisations/models/visualisation.model';
import { VisualisationsVariablesMessagesService } from '@modules/visualisation-variables/services/visualisations-variables-message.service';

const LOG_PREFIX: string = "[Visualisation Variables Records Tabulation Component]";

@Component({
    selector: 'sb-visualisation-variables-records-tabulation',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './visualisation-variables-records-tabulation.component.html',
    styleUrls: ['visualisation-variables-records-tabulation.component.scss'],
})
export class VisualisationVariablesRecordsTabulationComponent implements OnInit, OnDestroy, AfterViewInit {

    // Allows the parent component to inject the target visualisation container
    @Input() public container!: VisualisationContainer;

    // Keeps tabs of the visualisations
    private visualisationsSubject$ = new BehaviorSubject<Visualisation[]>([]);
    readonly visualisations$ = this.visualisationsSubject$.asObservable();

    // Keeps tabs of the visualisations variables
    private visualisationsVariablesSubject$ = new BehaviorSubject<VisualisationVariable[]>([]);
    readonly visualisationsVariables$ = this.visualisationsVariablesSubject$.asObservable();

    // Central gathering point for all the component's subscriptions.
    // Makes it efficient to unsubscribe from all subscriptions when the component is destroyed.   
    private _subscriptions: Subscription[] = [];

    // Keeps tabs of whether the component has been successfully initialised
    public initialised: boolean = false;

    // Instantitate a new reactive Form Group
    // This will allow us to define and enforce the validation rules for all the form controls.
    visualisationVariablesForm = new FormGroup({
        visualisationId: new FormControl<number | null>(null, [
        ]),
    });

    constructor(
        private cd: ChangeDetectorRef,
        public visualisationsDataService: VisualisationsDataService,
        public visualisationsMessagesService: VisualisationsMessagesService,
        public visualisationsVariablesDataService: VisualisationVariablesDataService,
        public visualisationsVariablesMessagesService: VisualisationsVariablesMessagesService,
        public operatorsDataService: OperatorsDataService,
        private filterService: FilterService,
        private modalService: NgbModal,
        private log: NGXLogger) {

    }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

        // Initialise the visualisations that belong to the passed in container
        this.initialiseVisualisations(() => {

            // Preselect the active visualisation in the data tabulation form
            this.initialiseFormGroup(() => {

                // Initialise the visualisation variables that belong to the active visualisation
                this.initialiseVisualisationsVariables(() => {

                    this._subscriptions.push(this.visualisationsMessagesService.visualisationModified$.subscribe({
                        next: () => {
                            this.reInitialiseVisualisations();
                        }
                    }))

                    this._subscriptions.push(this.visualisationsVariablesMessagesService.visualisationVariableModified$.subscribe({
                        next: () => {
                            this.reInitialiseVisualisationsVariables();
                        }
                    }))

                    // Mark Init as complete
                    this.log.trace(`${LOG_PREFIX} Init completed`);
                    this.initialised = true;
                    this.cd.markForCheck();

                })
            });
        })


    }




    ngAfterViewInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngAfterViewInit()`);


    }

    @HostListener('window:beforeunload')
    ngOnDestroy() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

        // Clear all subscriptions
        this.log.trace(`${LOG_PREFIX} Clearing all subscriptions`);
        this._subscriptions.forEach(s => s.unsubscribe());
    }


    private initialiseVisualisations(callback: () => void): void {

        this.visualisationsDataService
            .getVisualisations(false, {
                searchTerm: null,
                page: null,
                pageSize: null,
                sortColumn: 'id',
                sortDirection: 'asc',
                id: null,
                visualisationContainerId: this.container.id,
                visualisationTypeId: null,
                visualisationDataTypeId: null,
                name: null
            })
            .subscribe({
                next: (visualisations: Visualisation[]) => {
                    this.visualisationsSubject$.next(visualisations)
                    callback();
                },
                error: (err: Error) => {
                    this.visualisationsSubject$.next([])
                    callback();
                }
            });

    }


    /**
     * Presets default values in the data tabulation form
     * @param callback The function to call when done
     */
    private initialiseFormGroup(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseFormGroup()`);

        this.log.trace(`${LOG_PREFIX} Get the Active Visualisation`);
        const activeVisualisation: Visualisation | null = this.visualisationsSubject$.value ? this.visualisationsSubject$.value[0] : null;
        this.log.debug(`${LOG_PREFIX} Active Visualisation = ${JSON.stringify(activeVisualisation)}`);

        // Select the active Visualisation
        this.log.trace(`${LOG_PREFIX} Selecting the active Visualisation`);
        this.visualisationVariablesForm.get('visualisationId')?.setValue((activeVisualisation && activeVisualisation.id) ? Number(activeVisualisation.id) : null);


        // Return
        this.log.trace(`${LOG_PREFIX} Returning`);
        callback();

    }

    private initialiseVisualisationsVariables(callback: () => void): void {

        if (this.visualisationVariablesForm.get('visualisationId')?.value) {
            this.visualisationsVariablesDataService
                .getVisualisationsVariables(false, {
                    searchTerm: null,
                    page: null,
                    pageSize: null,
                    sortColumn: 'id',
                    sortDirection: 'asc',
                    id: null,
                    visualisationId: this.visualisationVariablesForm.get('visualisationId')?.value,
                    indicatorId: null,
                    roleId: null
                })
                .subscribe({
                    next: (visualisationsVariables: VisualisationVariable[]) => {
                        this.visualisationsVariablesSubject$.next(visualisationsVariables)
                        callback();
                    },
                    error: (err: Error) => {
                        this.visualisationsVariablesSubject$.next([])
                        callback();
                    }
                });
        } else {
            this.visualisationsVariablesSubject$.next([])
        }



    }



    public reInitialiseVisualisations(): void {

        this.initialised = false;

        // Initialise the visualisations that belong to the passed in container
        this.initialiseVisualisations(() => {

            // Preselect the active visualisation in the data tabulation form
            this.initialiseFormGroup(() => {

                // Initialise the visualisation variables that belong to the active visualisation
                this.initialiseVisualisationsVariables(() => {

                    // Mark Init as complete
                    this.log.trace(`${LOG_PREFIX} Init completed`);
                    this.initialised = true;
                    this.cd.markForCheck();

                })
            });
        })
    }


    public reInitialiseVisualisationsVariables(): void {

        this.initialised = false;

                // Initialise the visualisation variables that belong to the active visualisation
                this.initialiseVisualisationsVariables(() => {

                    // Mark Init as complete
                    this.log.trace(`${LOG_PREFIX} Init completed`);
                    this.initialised = true;
                    this.cd.markForCheck();

                })
    }    


    /**
     * Handles Visualisation change events
     */
    public onVisualisationChange(): void {

        this.log.trace(`${LOG_PREFIX} Entering onVisualisationChange()`);

        this.reInitialiseVisualisationsVariables();

    }

    /**
     * Handles Visualisation Variables Records Addition Requests
     */
    public onAddVisualisationVariable(): void {

        this.log.trace(`${LOG_PREFIX} Entering onAddVisualisationVariable()`);
        const modalRef = this.modalService.open(VisualisationVariablesRecordsCreationModalComponent, { centered: true, backdrop: 'static' });
        modalRef.componentInstance.visualisationId = this.visualisationVariablesForm.get('visualisationId')?.value;
    }

    /**
     * Handles Visualisation Variables Records Updation Requests
     * @param id The unique identifier of the Visualisation Variable record to update
     */
    public onUpdateVisualisationVariable(id: number): void {

        this.log.trace(`${LOG_PREFIX} Entering onUpdateVisualisationVariable()`);
        this.log.debug(`${LOG_PREFIX} Visualisation Variable Record Id = ${id}`);
        const modalRef = this.modalService.open(VisualisationVariablesRecordsUpdationModalComponent, { centered: true, backdrop: 'static' });
        modalRef.componentInstance.id = id;

    }

    /**
     * Handles Visualisation Variables Records Deletion Requests
     * * @param id The unique identifier of the Visualisation Variable record to delete
     */
    public onDeleteVisualisationVariable(id: number): void {

        this.log.trace(`${LOG_PREFIX} Entering onDeleteVisualisationVariable()`);
        this.log.debug(`${LOG_PREFIX} Visualisation Variable Record Id = ${id}`);
        const modalRef = this.modalService.open(VisualisationVariablesRecordsDeletionModalComponent, { centered: true, backdrop: 'static' });
        modalRef.componentInstance.id = id;
    }

}
