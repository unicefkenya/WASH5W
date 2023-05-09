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
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { VisualisationsRecordsDeletionModalComponent } from '@modules/visualisations/containers/visualisations-records-deletion-modal/visualisations-records-deletion-modal.component';
import { VisualisationsRecordsUpdationModalComponent } from '@modules/visualisations/containers/visualisations-records-updation-modal/visualisations-records-updation-modal.component';
import { VisualisationsDataService } from '@modules/visualisations/services/visualisations-data.service';
import { Visualisation } from '@modules/visualisations/models/visualisation.model';
import { OperatorsDataService } from '@modules/operators/services/operators-data.service';
import { VisualisationsTypesDataService } from '@modules/visualisations-types/services/visualisation-types-data.service';
import { VisualisationsFormatsDataService } from '@modules/visualisations-formats/services/visualisations-formats-data.service';
import { VisualisationContainer } from '@modules/visualisations-containers/models/visualisation-container.model';
import { VisualisationsMessagesService } from '@modules/visualisations/services/visualisations-message.service';
import { VisualisationFormat } from '@modules/visualisations-formats/models/visualisation-format.model';
import { VisualisationType } from '@modules/visualisations-types/models/visualisation-type.model';
import { VisualisationsDataTypesDataService } from '@modules/visualisation-data-types/services/visualisation-data-types-data.service';
import { VisualisationDataType } from '@modules/visualisation-data-types/models/visualisation-data-type.model';

const LOG_PREFIX: string = "[Visualisations Records Tabulation Component]";

@Component({
    selector: 'sb-visualisations-records-tabulation',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './visualisations-records-tabulation.component.html',
    styleUrls: ['visualisations-records-tabulation.component.scss'],
})
export class VisualisationsRecordsTabulationComponent implements OnInit, OnDestroy, AfterViewInit {

    // Allows the parent component to inject the target visualisation container
    @Input() public container!: VisualisationContainer;

    // Keeps tabs of the visualisations
    private visualisationsSubject$ = new BehaviorSubject<Visualisation[]>([]);
    readonly visualisations$ = this.visualisationsSubject$.asObservable();

    // Central gathering point for all the component's subscriptions.
    // Makes it efficient to unsubscribe from all subscriptions when the component is destroyed.   
    private _subscriptions: Subscription[] = [];

    // Keeps tabs of whether the component has been successfully initialised
    public initialised: boolean = false;

    constructor(
        private cd: ChangeDetectorRef,
        public visualisationsTypesDataService: VisualisationsTypesDataService,
        public visualisationsFormatsDataService: VisualisationsFormatsDataService,
        public visualisationsDataService: VisualisationsDataService,
        public visualisationsDataTypesDataService: VisualisationsDataTypesDataService,
        public visualisationsMessagesService: VisualisationsMessagesService,
        public operatorsDataService: OperatorsDataService,
        private modalService: NgbModal,
        private log: NGXLogger) {

    }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

        this.initialiseVisualisations(() => {

            this._subscriptions.push(this.visualisationsMessagesService.visualisationModified$.subscribe({
                next: () => {
                    this.reInitialiseVisualisations();
                }
            }))

            // Mark Init as complete
            this.log.trace(`${LOG_PREFIX} Init completed`);
            this.initialised = true;
            this.cd.markForCheck();
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


    public reInitialiseVisualisations(): void {

        this.initialised = false;

        this.initialiseVisualisations(() => {

            // Mark Init as complete
            this.log.trace(`${LOG_PREFIX} Init completed`);
            this.initialised = true;
            this.cd.markForCheck();
        })
    }

    /**
     * Returns the title of the visualisation type given its unique identifier
     * @param id the unique identifier of the visualisation type
     * @returns the title
     */
    public getTypeTitle$(id: number | null | undefined): Observable<string | null> {
        if (id) {
            return new Observable(o => {
                this.visualisationsFormatsDataService.getVisualisationFormatById$(id).subscribe({
                    next: (visualisationFormat: VisualisationFormat) => {
                        o.next(visualisationFormat.data.name);
                        o.complete();
                    },
                    error: (err: Error) => {
                        o.next(null);
                        o.complete();
                    }
                })
            })
        } else {
            return of(null);
        }
    }


    /**
     * Returns the title of the visualisation subtype given its unique identifier
     * @param id the unique identifier of the visualisation subtype
     * @returns the title
     */
     public getSubtypeTitle$(id: number | null | undefined): Observable<string | null> {
        if (id) {
            return new Observable(o => {
                this.visualisationsTypesDataService.getVisualisationTypeById$(id).subscribe({
                    next: (visualisationType: VisualisationType) => {
                        o.next(visualisationType.data.name);
                        o.complete();
                    },
                    error: (err: Error) => {
                        o.next(null);
                        o.complete();
                    }
                })
            })
        } else {
            return of(null);
        }
    }    


    /**
     * Returns the title of the visualisation data type given its unique identifier
     * @param id the unique identifier of the visualisation data type
     * @returns the title
     */
     public getDataTypeTitle$(id: number | null | undefined): Observable<string | null> {
        if (id) {
            return new Observable(o => {
                this.visualisationsDataTypesDataService.getVisualisationDataTypeById$(id).subscribe({
                    next: (visualisationDataType: VisualisationDataType) => {
                        o.next(visualisationDataType.data.name);
                        o.complete();
                    },
                    error: (err: Error) => {
                        o.next(null);
                        o.complete();
                    }
                })
            })
        } else {
            return of(null);
        }
    }  
    
    
    /**
     * Handles Visualisations Records Updation Requests
     * @param id The unique identifier of the Visualisation record to update
     */
    public onUpdateVisualisation(id: number): void {

        this.log.trace(`${LOG_PREFIX} Entering onUpdateVisualisation()`);
        this.log.debug(`${LOG_PREFIX} Visualisation Record Id = ${id}`);
        const modalRef = this.modalService.open(VisualisationsRecordsUpdationModalComponent, { centered: true, backdrop: 'static' });
        modalRef.componentInstance.id = id;

    }

    /**
     * Handles Visualisations Records Deletion Requests
     * * @param id The unique identifier of the Visualisation record to delete
     */
    public onDeleteVisualisation(id: number): void {

        this.log.trace(`${LOG_PREFIX} Entering onDeleteVisualisation()`);
        this.log.debug(`${LOG_PREFIX} Visualisation Record Id = ${id}`);
        const modalRef = this.modalService.open(VisualisationsRecordsDeletionModalComponent, { centered: true, backdrop: 'static' });
        modalRef.componentInstance.id = id;
    }


}
