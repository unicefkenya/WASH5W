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
import { FormControl, FormGroup } from '@angular/forms';
import { FilterService } from '@app/app-filter.service';
import { VisualisationAxis } from '@modules/visualisation-axes/models/visualisation-axis.model';
import { OperatorsDataService } from '@modules/operators/services/operators-data.service';
import { Visualisation } from '@modules/visualisations/models/visualisation.model';
import { VisualisationContainer } from '@modules/visualisations-containers/models/visualisation-container.model';
import { VisualisationsDataService } from '@modules/visualisations/services/visualisations-data.service';
import { VisualisationsMessagesService } from '@modules/visualisations/services/visualisations-message.service';
import { VisualisationAxesRecordsUpdationModalComponent } from '@modules/visualisation-axes/containers/visualisation-axes-records-updation-modal/visualisation-axes-records-updation-modal.component';
import { VisualisationsAxesMessagesService } from '@modules/visualisation-axes/services/visualisations-axes-message.service';
import { VisualisationsAxesDataService } from '@modules/visualisation-axes/services/visualisations-axes-data.service';
import { VisualisationAxesRecordsDeletionModalComponent } from '@modules/visualisation-axes/containers/visualisation-axes-records-deletion-modal/visualisation-axes-records-deletion-modal.component';
import { VisualisationAxesRecordsCreationModalComponent } from '@modules/visualisation-axes/containers/visualisation-axes-records-creation-modal/visualisation-axes-records-creation-modal.component';

const LOG_PREFIX: string = "[Visualisation Axes Records Tabulation Component]";

@Component({
    selector: 'sb-visualisation-axes-records-tabulation',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './visualisation-axes-records-tabulation.component.html',
    styleUrls: ['visualisation-axes-records-tabulation.component.scss'],
})
export class VisualisationAxesRecordsTabulationComponent implements OnInit, OnDestroy, AfterViewInit {

    // Allows the parent component to inject the target visualisation container
    @Input() public container!: VisualisationContainer;

    // Keeps tabs of the visualisations
    private visualisationsSubject$ = new BehaviorSubject<Visualisation[]>([]);
    readonly visualisations$ = this.visualisationsSubject$.asObservable();

    // Keeps tabs of the visualisations axes
    private visualisationsAxesSubject$ = new BehaviorSubject<VisualisationAxis[]>([]);
    readonly visualisationsAxes$ = this.visualisationsAxesSubject$.asObservable();

    // Central gathering point for all the component's subscriptions.
    // Makes it efficient to unsubscribe from all subscriptions when the component is destroyed.   
    private _subscriptions: Subscription[] = [];

    // Keeps tabs of whether the component has been successfully initialised
    public initialised: boolean = false;

    // Instantitate a new reactive Form Group
    // This will allow us to define and enforce the validation rules for all the form controls.
    visualisationAxesForm = new FormGroup({
        visualisationId: new FormControl<number | null>(null, [
        ]),
    });

    constructor(
        private cd: ChangeDetectorRef,
        public visualisationsDataService: VisualisationsDataService,
        public visualisationsMessagesService: VisualisationsMessagesService,
        public visualisationsAxesDataService: VisualisationsAxesDataService,
        public visualisationsAxesMessagesService: VisualisationsAxesMessagesService,
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

                // Initialise the visualisation axes that belong to the active visualisation
                this.initialiseVisualisationsAxes(() => {

                    this._subscriptions.push(this.visualisationsMessagesService.visualisationModified$.subscribe({
                        next: () => {
                            this.reInitialiseVisualisations();
                        }
                    }))

                    this._subscriptions.push(this.visualisationsAxesMessagesService.visualisationAxisModified$.subscribe({
                        next: () => {
                            this.reInitialiseVisualisationsAxes();
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
        this.visualisationAxesForm.get('visualisationId')?.setValue((activeVisualisation && activeVisualisation.id) ? Number(activeVisualisation.id) : null);


        // Return
        this.log.trace(`${LOG_PREFIX} Returning`);
        callback();

    }

    private initialiseVisualisationsAxes(callback: () => void): void {

        if (this.visualisationAxesForm.get('visualisationId')?.value) {
            this.visualisationsAxesDataService
                .getVisualisationsAxes(false, {
                    page: null,
                    pageSize: null,
                    searchTerm: null,
                    sortColumn: null,
                    sortDirection: null,
                    id: null,
                    visualisationId: this.visualisationAxesForm.get('visualisationId')?.value,
                    axisId: null,
                    label: null
                })
                .subscribe({
                    next: (visualisationsAxes: VisualisationAxis[]) => {
                        this.visualisationsAxesSubject$.next(visualisationsAxes)
                        callback();
                    },
                    error: (err: Error) => {
                        this.visualisationsAxesSubject$.next([])
                        callback();
                    }
                });
        } else {
            this.visualisationsAxesSubject$.next([])
        }



    }



    public reInitialiseVisualisations(): void {

        this.initialised = false;

        // Initialise the visualisations that belong to the passed in container
        this.initialiseVisualisations(() => {

            // Preselect the active visualisation in the data tabulation form
            this.initialiseFormGroup(() => {

                // Initialise the visualisation axes that belong to the active visualisation
                this.initialiseVisualisationsAxes(() => {

                    // Mark Init as complete
                    this.log.trace(`${LOG_PREFIX} Init completed`);
                    this.initialised = true;
                    this.cd.markForCheck();

                })
            });
        })
    }


    public reInitialiseVisualisationsAxes(): void {

        this.initialised = false;

                // Initialise the visualisation axes that belong to the active visualisation
                this.initialiseVisualisationsAxes(() => {

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

        this.reInitialiseVisualisationsAxes();

    }


    /**
     * Handles Visualisation Axes Records Addition Requests
     */
     public onAddVisualisationAxis(): void {

        this.log.trace(`${LOG_PREFIX} Entering onAddVisualisationAxis()`);
        const modalRef = this.modalService.open(VisualisationAxesRecordsCreationModalComponent, { centered: true, backdrop: 'static' });
        modalRef.componentInstance.visualisationId = this.visualisationAxesForm.get('visualisationId')?.value;
    }

    /**
     * Handles Visualisation Axes Records Updation Requests
     * @param id The unique identifier of the Visualisation Axis record to update
     */
     public onUpdateVisualisationAxis(id: number): void {

        this.log.trace(`${LOG_PREFIX} Entering onUpdateVisualisationAxis()`);
        this.log.debug(`${LOG_PREFIX} Visualisation Axis Record Id = ${id}`);
        const modalRef = this.modalService.open(VisualisationAxesRecordsUpdationModalComponent, { centered: true, backdrop: 'static' });
        modalRef.componentInstance.id = id;

    }

    /**
     * Handles Visualisation Axes Records Deletion Requests
     * * @param id The unique identifier of the Visualisation Axis record to delete
     */
    public onDeleteVisualisationAxis(id: number): void {

        this.log.trace(`${LOG_PREFIX} Entering onDeleteVisualisationAxis()`);
        this.log.debug(`${LOG_PREFIX} Visualisation Axis Record Id = ${id}`);
        const modalRef = this.modalService.open(VisualisationAxesRecordsDeletionModalComponent, { centered: true, backdrop: 'static' });
        modalRef.componentInstance.id = id;
    }    




}
