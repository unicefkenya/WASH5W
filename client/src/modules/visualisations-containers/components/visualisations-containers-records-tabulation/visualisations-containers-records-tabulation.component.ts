import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostListener,
    Input,
    OnDestroy,
    OnInit
} from '@angular/core';
import { FilterService } from '@app/app-filter.service';
import { VisualisationsContainersRecordsCreationModalComponent } from '@modules/visualisations-containers/containers/visualisations-containers-records-creation-modal/visualisations-containers-records-creation-modal.component';
import { VisualisationsContainersRecordsDeletionModalComponent } from '@modules/visualisations-containers/containers/visualisations-containers-records-deletion-modal/visualisations-containers-records-deletion-modal.component';
import { VisualisationsContainersRecordsUpdationModalComponent } from '@modules/visualisations-containers/containers/visualisations-containers-records-updation-modal/visualisations-containers-records-updation-modal.component';
import { VisualisationContainer } from '@modules/visualisations-containers/models/visualisation-container.model';
import { NGXLogger } from 'ngx-logger';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { VisualisationsContainersDataService } from '@modules/visualisations-containers/services/visualisations-containers-data.service';
import { Visualisation } from '@modules/visualisations/models/visualisation.model';
import { VisualisationsDataService } from '@modules/visualisations/services/visualisations-data.service';
import { VisualisationsRecordsCreationModalComponent } from '@modules/visualisations/containers/visualisations-records-creation-modal/visualisations-records-creation-modal.component';
import { VisualisationVariablesDataService } from '@modules/visualisation-variables/services/visualisation-variables-data.service';
import { Tab } from '@common/models/tab.model';
import { Subscription } from 'rxjs/internal/Subscription';
import { VisualisationsMessagesService } from '@modules/visualisations/services/visualisations-message.service';
import { VisualisationsAxesDataService } from '@modules/visualisation-axes/services/visualisations-axes-data.service';
import { TextUtilService } from '@common/services/text-util.service';

const LOG_PREFIX: string = "[Visualisations Containers Records Tabulation Component]";

@Component({
    selector: 'sb-visualisations-containers-records-tabulation',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './visualisations-containers-records-tabulation.component.html',
    styleUrls: ['visualisations-containers-records-tabulation.component.scss'],
})
export class VisualisationsContainersRecordsTabulationComponent implements OnInit, OnDestroy {

    // Allows the parent component to inject the target visualisation container
    @Input() public container!: VisualisationContainer;

    // Allows the parent component to inject the target group's nested visualisations containers
    @Input() public nestedVisualisationContainers: VisualisationContainer[] = [];

    // Allows the parent component to assign the current display position an odd or even position
    @Input() public odd: boolean = true;

    // The target container's visualisations if any
    public visualisations!: Visualisation[];

    activeTabIndex: number = 0;

    // The details page in case the container has visualisations
    public tabs: Tab[] = [
        {
            index: 0,
            title: "Visualisations",
            link: null,
            active: true
        },
        {
            index: 1,
            title: "Visualisations Variables",
            link: null,
            active: false
        },
        {
            index: 2,
            title: "Visualisations Axes",
            link: null,
            active: false
        }
    ]


    // Central gathering point for all the component's subscriptions.
    // Makes it efficient to unsubscribe from all subscriptions when the component is destroyed.   
    private _subscriptions: Subscription[] = [];

    // Keeps tabs of whether the component has been successfully initialised
    public initialised: boolean = false;

    constructor(
        private modalService: NgbModal,
        private cd: ChangeDetectorRef,
        public filterService: FilterService,
        public visualisationsContainersDataService: VisualisationsContainersDataService,
        public visualisationsDataService: VisualisationsDataService,
        public visualisationsVariablesDataService: VisualisationVariablesDataService,
        public visualisationsAxesDataService: VisualisationsAxesDataService,
        public visualisationsMessagesService: VisualisationsMessagesService,
        public textUtilService: TextUtilService,
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


    openTab(index: number) {

        // Get the currently opened tab
        const current: Tab | undefined = this.tabs.find(t => t.active == true);

        // Mark the currently opened tab as inactive
        if (current) {
            current.active = false;
        }

        // Get the newly opened tab
        const incoming: Tab | undefined = this.tabs.find(t => t.index == index);

        // Mark the newly opened tab as active
        if (incoming) {
            incoming.active = true;
            this.activeTabIndex = incoming.index;
        }



        this.cd.detectChanges();
    }


    getActiveTabIndex(): number {

        // Get the currently opened tab
        const current: Tab | undefined = this.tabs.find(t => t.active == true);

        if (current) {
            return current.index
        } else {
            return -1;
        }
    }

    @HostListener('window:beforeunload')
    ngOnDestroy() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

    }


    private initialiseVisualisations(callback: () => void): void {

        // Retrieve the visualisation containers visualisations if any
        this.log.trace(`${LOG_PREFIX} Retrieving the visualisation containers visualisations`);
        switch (this.container.data.typeId) {
            case 2: // Page
            case 3: // Page Tabs
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
                            this.visualisations = visualisations;
                            callback();
                        },
                        error: (err: Error) => {
                            this.visualisations = [];
                            callback();
                        }
                    });
                break;
            default:
                // Visualisations are only tied to page / page tabs
                this.visualisations = [];
                callback()
        }

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
     * Retrieves the visualisations containers that belong to the parent with the specified id
     * @param parentId the parent id
     * @returns the visualisations containers
     */
    public getNestedVisualisationContainers(parentId: number): VisualisationContainer[] | undefined {
        return this.visualisationsContainersDataService.nestedVisualisationContainers.get(parentId);
    }




    /**
     * Checks whether a Visualisation Container record is currently expanded
     * @param visualisationContainer The unique identifier of the target Visualisation Container
     * @returns True or false depending on whether the Visualisation Container is currently expanded or not respectively
     */
    public isExpanded(visualisationContainer: VisualisationContainer | null | undefined): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isExpanded()`);
        this.log.debug(`${LOG_PREFIX} Target Visualisation Container Id = ${JSON.stringify(visualisationContainer)}`);

        // Check if a Visualisation Container id was passed in
        this.log.trace(`${LOG_PREFIX} Checking if a Visualisation Container id was passed in`);
        if (visualisationContainer?.id) {

            // A Visualisation Container was passed in
            this.log.trace(`${LOG_PREFIX} A Visualisation Container was passed in`);

            // Check whether the Visualisation Container is currently expanded
            this.log.trace(`${LOG_PREFIX} Checking whether the Visualisation Container is currently expanded`);
            const expanded: boolean = this.filterService.filter.expandedVisualisationContainersIds.some(id => id == visualisationContainer.id);
            this.log.debug(`${LOG_PREFIX} Expanded = ${expanded}`);

            return expanded;

        } else {


            // A Visualisation Container was not passed in
            this.log.warn(`${LOG_PREFIX} A Visualisation Container was not passed in`);

            // Return false by default
            this.log.warn(`${LOG_PREFIX} Returning false by default`);

            return false;
        }


    }


    /**
     * Checks whether a Visualisation Container record is currently collapsed
     * @param visualisationContainer The unique identifier of the target Visualisation Container
     * @returns True or false depending on whether the Visualisation Container is currently collapsed or not respectively
     */
    public isCollapsed(visualisationContainer: VisualisationContainer | null | undefined): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isCollapsed()`);
        this.log.debug(`${LOG_PREFIX} Target Visualisation Container = ${JSON.stringify(visualisationContainer)}`);

        // Check if a Visualisation Container id was passed in
        this.log.trace(`${LOG_PREFIX} Checking if a Visualisation Container id was passed in`);
        if (visualisationContainer?.id) {

            // A Visualisation Container was passed in
            this.log.trace(`${LOG_PREFIX} A Visualisation Container was passed in`);

            // Check whether the Visualisation Container is currently collapsed
            this.log.trace(`${LOG_PREFIX} Checking whether the Visualisation Container is currently collapsed`);
            const collapsed: boolean = !(this.filterService.filter.expandedVisualisationContainersIds.some(id => id == visualisationContainer.id));
            this.log.debug(`${LOG_PREFIX} Collapsed = ${collapsed}`);

            return collapsed;

        } else {


            // A Visualisation Container was not passed in
            this.log.warn(`${LOG_PREFIX} A Visualisation Container was not passed in`);

            // Return false by default
            this.log.warn(`${LOG_PREFIX} Returning false by default`);

            return false;
        }

    }


    /**
     * Expands records
     */
    public onExpand(visualisationContainer: VisualisationContainer | null | undefined): void {

        this.log.trace(`${LOG_PREFIX} Entering onExpand()`);
        this.log.debug(`${LOG_PREFIX} Visualisation Container = ${JSON.stringify(visualisationContainer)}`);

        // Check if a Visualisation Container id was passed in
        this.log.trace(`${LOG_PREFIX} Checking if a Visualisation Container id was passed in`);
        if (visualisationContainer?.id) {

            // Make a copy of the currently expanded Visualisation Containers ids
            this.log.trace(`${LOG_PREFIX} Making a copy of the currently expanded Visualisation Containers ids`);
            const ids: number[] = Object.assign([], this.filterService.filter.expandedVisualisationContainersIds);

            // Add the expanded Visualisation Container to the copy of expanded Visualisation Containers ids
            this.log.trace(`${LOG_PREFIX} Adding the expanded Visualisation Container to the copy of expanded Visualisation Containers ids`);
            if (!(ids.some(id => id == visualisationContainer.id))) {
                ids.push(visualisationContainer.id);
            }

            // Update the global filter of expanded system modules ids
            this.log.trace(`${LOG_PREFIX} Updating the global filter of expanded system modules ids`);
            this.filterService.update({ expandedVisualisationContainersIds: ids })

            this.cd.detectChanges();

        } else {


            // A Visualisation Container was not passed in
            this.log.warn(`${LOG_PREFIX} A Visualisation Container was not passed in`);

        }

    }


    /**
     * Collapses records
     */
    public onCollapse(visualisationContainer: VisualisationContainer | null | undefined): void {

        this.log.trace(`${LOG_PREFIX} Entering onCollapse()`);
        this.log.debug(`${LOG_PREFIX} Visualisation Container Id = ${JSON.stringify(visualisationContainer)}`);

        // Check if a Visualisation Container id was passed in
        this.log.trace(`${LOG_PREFIX} Checking if a Visualisation Container id was passed in`);
        if (visualisationContainer?.id) {

            // Make a copy of the currently expanded Visualisation Containers ids
            this.log.trace(`${LOG_PREFIX} Making a copy of the currently expanded Visualisation Containers ids`);
            const ids: number[] = Object.assign([], this.filterService.filter.expandedVisualisationContainersIds);

            // Remove the collapsed Visualisation Container from the copy of expanded Visualisation Containers ids
            this.log.trace(`${LOG_PREFIX} Remove the collapsed Visualisation Container from the copy of expanded Visualisation Containers ids`);
            let index: number = ids.findIndex(id => id == visualisationContainer.id)
            if (index != -1) {
                ids.splice(index, 1);
            }

            // Update the global filter of expanded system modules ids
            this.log.trace(`${LOG_PREFIX} Updating the global filter of expanded system modules ids`);
            this.filterService.update({ expandedVisualisationContainersIds: ids })

            this.cd.detectChanges();

        } else {


            // A Visualisation Container was not passed in
            this.log.warn(`${LOG_PREFIX} A Visualisation Container was not passed in`);

        }

    }



    /**
     * Handles Visualisations Containers Rights Records Addition Requests
     */
    public onAddVisualisationContainer(typeId: number): void {

        this.log.trace(`${LOG_PREFIX} Entering onAddVisualisationContainer()`);

        const modalRef = this.modalService.open(VisualisationsContainersRecordsCreationModalComponent, { centered: true, backdrop: 'static' });
        modalRef.componentInstance.contextId = this.filterService.filter.activeContext?.id;
        modalRef.componentInstance.typeId = typeId;
        modalRef.componentInstance.parentId = this.container.id;

    }

    /**
     * Handles Visualisations Containers Rights Records Updation Requests
     */
    public onUpdateVisualisationContainer(id: number): void {

        this.log.trace(`${LOG_PREFIX} Entering onUpdateVisualisationContainer()`);
        this.log.debug(`${LOG_PREFIX} Visualisation Container Right Id = ${id}`);

        const modalRef = this.modalService.open(VisualisationsContainersRecordsUpdationModalComponent, { centered: true, backdrop: 'static' });
        modalRef.componentInstance.id = id;

    }

    /**
     * Handles Visualisations Containers Rights Records Deletion Requests
     */
    public onDeleteVisualisationContainer(id: number): void {

        this.log.trace(`${LOG_PREFIX} Entering onDeleteVisualisationContainer()`);
        this.log.debug(`${LOG_PREFIX} Visualisation Container Right Id = ${id}`);

        const modalRef = this.modalService.open(VisualisationsContainersRecordsDeletionModalComponent, { centered: true, backdrop: 'static' });
        modalRef.componentInstance.id = id;
    }

    /**
     * Handles Visualisations Records Addition Requests
     */
    public onAddVisualisation(): void {

        this.log.trace(`${LOG_PREFIX} Entering onAddVisualisation()`);
        const modalRef = this.modalService.open(VisualisationsRecordsCreationModalComponent, { centered: true, backdrop: 'static' });
        modalRef.componentInstance.containerId = this.container.id;
    }



}
