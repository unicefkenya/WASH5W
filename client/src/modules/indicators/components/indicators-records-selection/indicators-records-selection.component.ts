import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    HostListener,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { LoadingAnimationComponent, PaginationComponent } from '@common/components';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject, Subscription, debounceTime, first } from 'rxjs';
import { Indicator } from '@modules/indicators/models/indicator.model';
import { IndicatorState } from '@modules/indicators/models/indicator-state.model';
import { IndicatorsSelectionDataService } from '@modules/indicators/services/indicators-selection-data.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LogicalHierarchy } from '@modules/logical-hierarchies/models/logical-hierarchy.model';
import { TextUtilService } from '@common/services/text-util.service';
import { environment } from 'environments/environment';

const LOG_PREFIX: string = "[Indicators Records Selection Component]";

@Component({
    selector: 'sb-indicators-records-selection',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './indicators-records-selection.component.html',
    styleUrls: ['indicators-records-selection.component.scss'],
})
export class IndicatorsRecordsSelectionComponent implements OnInit, OnDestroy, AfterViewInit {

    // Allows the parent component to inject the unique identifier of the parent Context record
    @Input() public contextId!: number;

    // Allows the parent component to inject the desired selection mode: single or multi
    @Input() public selectionMode: string = "single";

    // Allows the parent component to inject the desired Indicators
    @Input() public desired: number[] = [];

    // Allows the parent component to inject the undesired Indicators
    // Ignored if the desired Indicators has been specified
    @Input() public undesired: number[] = [];

    // Allows the parent component to inject the previously selected Indicators
    @Input() public selected: number[] = [];

    // Broadcasts selector windows open / close events
    @Output() public openedLogicalElementSelector: EventEmitter<void> = new EventEmitter<void>();
    @Output() public closedLogicalElementSelector: EventEmitter<void> = new EventEmitter<void>();

    // Broadcasts radio buttons selection events
    @Output() public select: EventEmitter<Indicator> = new EventEmitter<Indicator>();

    // Broadcasts checkboxes check events
    @Output() public check: EventEmitter<Indicator> = new EventEmitter<Indicator>();

    // Broadcasts checkboxes uncheck events
    @Output() public uncheck: EventEmitter<Indicator> = new EventEmitter<Indicator>();

    // Flags whether the indicators are associated with a logical strategy
    public logical: boolean = environment.indicators.logical;

    // Keeps a local reference to the displayed loading animation component.
    // Makes it possible to trigger the loading animation when a slow background service is invoked.
    private _animation!: LoadingAnimationComponent;

    // Keeps a local reference to the displayed pagination component.
    // Makes it possible to initialise / update the pagination component when the total number of records changes.
    private _pagination!: PaginationComponent;

    // Holds the required records state
    // Makes it possible to supply the filter, sort or search criteria that should be applied to records on retrieval.
    private stateSubject$ = new BehaviorSubject<IndicatorState>({
        searchTerm: null,
        page: 1,
        pageSize: 3,
        sortColumn: 'id',
        sortDirection: 'asc',
        ids: null,
        contextId: null,
        no: null,
        name: null,
        logicalParentId: null
    });
    readonly state$ = this.stateSubject$.asObservable();

    // Defines Indicators reactive form controls group
    public defaultForm = new FormGroup({

        logicalElement: new FormGroup({
            logicalElementId: new FormControl<number | null | undefined>(null),
            logicalElementName: new FormControl<string>("Optionally choose logical parent"),
            truncatedLogicalElementName: new FormControl<string>("Optionally choose logical parent")
        })

    });

    // Keeps tabs of the currently visible content
    page: string = "default";

    // Central gathering point for all the component's subscriptions.
    // Makes it efficient to unsubscribe from all subscriptions when the component is destroyed.   
    private _subscriptions: Subscription[] = [];

    constructor(
        private cd: ChangeDetectorRef,
        public indicatorsDataService: IndicatorsSelectionDataService,
        public textUtilService: TextUtilService,
        private log: NGXLogger) {

    }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

        // Set the default active Context's id as the contextId in the desired records state
        this.initialiseDesiredRecordsState(() => {

            // Monitor & react to desired records state changes
            this.initialiseDesiredRecordsStateChangesHandler(() => {

                // Mark Init as complete
                this.log.trace(`${LOG_PREFIX} Init completed`);
            });

        });


    }


    ngAfterViewInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngAfterViewInit()`);

        // Set the initial page size
        this.initialisePaginationPageSize(() => {

            // Monitor & react to total record counts changes
            this.initialiseTotalRecordCountsChangesHandler(() => {

                // Monitor & react to loading status changes
                this.initialiseLoadingStatusChangesHandler(() => {

                    // Mark After-View-Init as complete
                    this.log.trace(`${LOG_PREFIX} After-View-Init completed`);
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
     * Initialises the local reference to the displayed pagination component
     */
    @ViewChild(PaginationComponent)
    public set pagination(pagination: PaginationComponent) {

        this.log.trace(`${LOG_PREFIX} Entering setPagination()`);

        if (pagination) {
            this._pagination = pagination;
        }
    }





    /**
     * Presets default values in the desired records state bean
     * @param callback The function to call when done
     */
    private initialiseDesiredRecordsState(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseDesiredRecordsState()`);

        // Make a copy of the desired records state
        this.log.trace(`${LOG_PREFIX} Making a copy of the desired records state`);
        let copy: IndicatorState = Object.assign({}, this.stateSubject$.value);

        // Set the active Context as the desired Context
        this.log.trace(`${LOG_PREFIX} Setting the active Context as the desired Context`);
        Object.assign(copy, { contextId: this.contextId });

        // Broadcast the newly desired record state
        this.log.trace(`${LOG_PREFIX} Broadcasting the newly desired record state`);
        this.stateSubject$.next(copy);

        // Return
        this.log.trace(`${LOG_PREFIX} Returning`);
        callback();

    }



    /**
     * Initialises the pagination component's initial page size based on the value set in the desired records state
     * @param callback The function to call when done
     */
    private initialisePaginationPageSize(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialisePaginationPageSize()`);

        // Set the initial page size
        this.log.trace(`${LOG_PREFIX} Setting the initial page size`);
        this._pagination.pageSize = this.stateSubject$.value.pageSize ? this.stateSubject$.value.pageSize : 20;

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
                        this.log.debug(`${LOG_PREFIX} Desired records state = ${state}`);

                        // Retrieve the Indicator records corresponding to the passed in state
                        this.log.trace(`${LOG_PREFIX} Retrieving the Indicator records corresponding to the passed in state`);
                        this.indicatorsDataService
                            .getIndicators(true, state)
                            .pipe(first())
                            .subscribe();

                    }
                })
        );

        // Transfer control to the callback function
        callback();

    }


    /**
     * Subscribe and react to loading status changes
     * @param callback The function to call when done
     */
    private initialiseLoadingStatusChangesHandler(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseLoadingStatusChangesHandler()`);

        // Subscribe to loading events and propagate them to the loading component.
        this.log.trace(`${LOG_PREFIX} Subscribing to loading status changes`);
        this._subscriptions.push(
            this.indicatorsDataService.loading$
                .subscribe(
                    (loading) => {

                        // Loading status changed
                        this.log.trace(`${LOG_PREFIX} Loading status changed`);
                        this.log.debug(`${LOG_PREFIX} Loading status = ${loading}`);

                        // Propagate the loading status to the loading animation component
                        this.log.trace(`${LOG_PREFIX} Propagating the loading status to the loading animation component`);
                        this._animation.loading = loading;

                        // Mark the UI as needing to be checked for changes
                        this.log.trace(`${LOG_PREFIX} Marking the UI as needing to be checked for changes`);
                        this.cd.markForCheck();

                    }));



        // Transfer control to the callback function
        callback();

    }

    /**
     * Subscribe and react to total record count changes
     * @param callback The function to call when done
     */
    private initialiseTotalRecordCountsChangesHandler(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseTotalRecordCountsChangesHandler()`);

        // Subscribe to the total record count changes
        this.log.trace(`${LOG_PREFIX} Subscribing to total record counts changes`);
        this._subscriptions.push(
            this.indicatorsDataService.totalRecords$.subscribe(
                (total) => {

                    // Total record count changed
                    this.log.trace(`${LOG_PREFIX} Total record count changed`);
                    this.log.debug(`${LOG_PREFIX} Total record count = ${total}`);

                    // Propagate the total record count to the pagination component
                    this.log.trace(`${LOG_PREFIX} Propagating the total record count to the pagination component`);
                    this._pagination.total = total;
                    this.log.debug(`${LOG_PREFIX} Total Records = ${this._pagination.total}`);

                }));

        // Transfer control to the callback function
        callback();

    }



    /**
     * Retrieves the id of the LogicalElement
     * @returns the id
     */
    public getLogicalElementId(): number | null | undefined {
        return this.defaultForm.get('logicalElement.logicalElementId')?.value
    }

    /**
     * Retrieves the name of the logicalElement
     * @returns the name
     */
    public getLogicalElementName(): string | null | undefined {
        return this.defaultForm.get('logicalElement.logicalElementName')?.value
    }



    /**
     * Opens the LogicalElement Selector
     */
    public openLogicalElementSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering openLogicalElementSelector()`);

        // Set the desired page to 'logicalElements'
        this.log.trace(`${LOG_PREFIX} Setting the desired page to 'logicalElements'`);
        this.page = "logicalElements";

        // Emit an 'openedLogicalElementSelector' event
        this.log.trace(`${LOG_PREFIX} Emitting an 'openedLogicalElementSelector' event`);
        this.openedLogicalElementSelector.emit();

        // Redraw the UI
        this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
        this.cd.detectChanges();
    }


    /**
     * Clears the selected Logical Element Selector
     */
    public clearLogicalElementSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering clearLogicalElementSelector()`);

        // Make a copy of the desired records state
        this.log.trace(`${LOG_PREFIX} Making a copy of the desired records state`);
        let copy: IndicatorState = Object.assign({}, this.stateSubject$.value);

        // Update the copy of the desired records state
        this.log.trace(`${LOG_PREFIX} Updating the copy of the desired records state`);
        Object.assign(copy, {
            logicalParentId: null
        });

        // Broadcast the newly desired record state
        this.log.trace(`${LOG_PREFIX} Broadcasting the newly desired record state`);
        this.stateSubject$.next(copy);

        // Update the form
        this.log.trace(`${LOG_PREFIX} Updating the form`);
        this.defaultForm.get('logicalElement.logicalElementId')?.setValue(null);
        this.defaultForm.get('logicalElement.logicalElementName')?.setValue("Optionally choose logical parent");
        this.defaultForm.get('logicalElement.truncatedLogicalElementName')?.setValue(this.truncate("Optionally choose logical parent"));


    }




    /**
     * Closes the LogicalElement Selector
     */
    public closeLogicalElementSelector(): void {

        this.log.trace(`${LOG_PREFIX} Entering closeLogicalElementSelector()`);

        // Set the desired page to 'default'
        this.log.trace(`${LOG_PREFIX} Setting the desired page to 'default'`);
        this.page = "default";

        // Emit a 'closedLogicalElementSelector' event
        this.log.trace(`${LOG_PREFIX} Emitting a 'closedLogicalElementSelector' event`);
        this.closedLogicalElementSelector.emit();

        // Redraw the UI
        this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
        this.cd.detectChanges();
    }




    /**
     * Sets the selected logicalElement details and close the logicalElement selector
     * @param element Sets 
     */
    onSelectLogicalHierarchyElement(element: LogicalHierarchy) {

        // Make a copy of the desired records state
        this.log.trace(`${LOG_PREFIX} Making a copy of the desired records state`);
        let copy: IndicatorState = Object.assign({}, this.stateSubject$.value);

        // Update the copy of the desired records state
        this.log.trace(`${LOG_PREFIX} Updating the copy of the desired records state`);
        Object.assign(copy, {
            logicalParentId: element.data.responsible?.id
        });

        // Broadcast the newly desired record state
        this.log.trace(`${LOG_PREFIX} Broadcasting the newly desired record state`);
        this.stateSubject$.next(copy);

        // Update the form
        this.log.trace(`${LOG_PREFIX} Updating the form`);
        this.defaultForm.get('logicalElement.logicalElementId')?.setValue((element && element.data.responsible?.id) ? element.data.responsible.id : null);
        this.defaultForm.get('logicalElement.logicalElementName')?.setValue((element && element.data.responsible?.name) ? element.data.responsible.name : "Optionally choose logical parent");
        this.defaultForm.get('logicalElement.truncatedLogicalElementName')?.setValue((element && element.data.responsible?.name) ? this.truncate(element.data.responsible.name) : "Optionally choose logical parent");

        // Set the desired page to 'default'
        this.log.trace(`${LOG_PREFIX} Setting the desired page to 'default'`);
        this.page = "default";

        // Emit a 'closedLogicalElementSelector' event
        this.log.trace(`${LOG_PREFIX} Emitting a 'closedLogicalElementSelector' event`);
        this.closedLogicalElementSelector.emit();

        // Redraw the UI
        this.log.trace(`${LOG_PREFIX} Redrawing the UI`);
        this.cd.detectChanges();
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
            let copy: IndicatorState = Object.assign({}, this.stateSubject$.value);

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
            let copy: IndicatorState = Object.assign({}, this.stateSubject$.value);

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
            let copy: IndicatorState = Object.assign({}, this.stateSubject$.value);

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
    * Handles Indicator Selection Events
    * @param indicator The Selected Indicator
    */
    public onSelect(indicator: Indicator): void {

        this.log.trace(`${LOG_PREFIX} Entering onSelect()`);
        this.log.debug(`${LOG_PREFIX} Selected Indicator = ${JSON.stringify(indicator)}`);

        // Broadcast the selected Indicator
        this.log.trace(`${LOG_PREFIX} Broadcasting the selected Indicator`);
        this.select.emit(indicator);
    }


    /** 
    * Handles Indicators Checkboxes Check Events
    * @param indicator The Checked Indicator
    */
    public onCheck(indicator: Indicator): void {

        this.log.trace(`${LOG_PREFIX} Entering onCheck()`);
        this.log.debug(`${LOG_PREFIX} Checked Indicator = ${JSON.stringify(indicator)}`);

        // Broadcast the checked Indicator
        this.log.trace(`${LOG_PREFIX} Broadcasting the checked Indicator`);
        this.check.emit(indicator);
    }


    /** 
    * Handles Indicators Checkboxes Uncheck Events
    * @param indicator The Unchecked Indicator
    */
    public onUncheck(indicator: Indicator): void {

        this.log.trace(`${LOG_PREFIX} Entering onUncheck()`);
        this.log.debug(`${LOG_PREFIX} Unchecked Indicator = ${JSON.stringify(indicator)}`);

        // Broadcast the unchecked Indicator
        this.log.trace(`${LOG_PREFIX} Broadcasting the unchecked Indicator`);
        this.uncheck.emit(indicator);

    }

    /**
     * Checks whether an Indicator record is currently selected
     * @param indicator The target Indicator
     * @returns True or false depending on whether the Indicator is currently selected or not respectively
     */
    public isSelected(indicator: Indicator): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isSelected()`);
        this.log.debug(`${LOG_PREFIX} Target Indicator = ${JSON.stringify(indicator)}`);

        // Check whether the Indicator is currently selected
        this.log.trace(`${LOG_PREFIX} Checking whether the Indicator is currently selected`);
        const selected: boolean = this.selected.some(id => id == indicator.id);
        this.log.debug(`${LOG_PREFIX} Selected = ${selected}`);

        return selected;
    }


    /**
     * Checks whether an Indicator record is currently checked
     * @param indicator The target Indicator
     * @returns True or false depending on whether the Indicator is currently checked or not respectively
     */
    public isChecked(indicator: Indicator): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isChecked()`);
        this.log.debug(`${LOG_PREFIX} Target Indicator = ${JSON.stringify(indicator)}`);

        // Check whether the Indicator is currently checked
        this.log.trace(`${LOG_PREFIX} Checking whether the Indicator is currently checked`);
        const checked: boolean = this.selected.some(id => id == indicator.id);
        this.log.debug(`${LOG_PREFIX} Checked = ${checked}`);

        return checked;
    }

    /**
     * Checks whether an Indicator record is desired
     * @param indicator The target Indicator
     * @returns True or false depending on whether the Indicator is desired or not respectively
     */
    public isDesired(indicator: Indicator): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isDesired()`);
        this.log.debug(`${LOG_PREFIX} Target Indicator = ${JSON.stringify(indicator)}`);

        // Check whether the Indicator is currently desired
        this.log.trace(`${LOG_PREFIX} Checking whether the Indicator is currently desired`);
        const desired: boolean = this.desired.some(id => id == indicator.id);
        this.log.debug(`${LOG_PREFIX} Desired = ${desired}`);

        return desired;
    }

    /**
     * Checks whether an Indicator record is undesired
     * @param indicator The target Indicator
     * @returns True or false depending on whether the Indicator is undesired or not respectively
     */
    public isUndesired(indicator: Indicator): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isUndesired()`);
        this.log.debug(`${LOG_PREFIX} Target Indicator = ${JSON.stringify(indicator)}`);
        this.log.debug(`${LOG_PREFIX} ${JSON.stringify(indicator.id)} == ${JSON.stringify(this.undesired[0])}`);

        // Check whether the Indicator is currently undesired
        this.log.trace(`${LOG_PREFIX} Checking whether the Indicator is currently undesired`);
        const undesired: boolean = this.undesired.some(id => id == indicator.id);
        this.log.debug(`${LOG_PREFIX} Undesired = ${undesired}`);

        return undesired;
    }

    public truncate(text: string): string {
        return this.textUtilService.truncate(text, [35, "..."])
    }


}
