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
import { Subscription } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { ContextsDataService } from '@modules/contexts/services/contexts-data.service';
import { FilterService } from '@app/app-filter.service';
import { DataFormsSelectionDataService } from '@modules/data-forms/services/data-forms-selection-data.service';
import { DataFormsElementsTypesDataService } from '@modules/data-forms-elements-types/services/data-forms-elements-types-data.service';
import { DataFormElementType } from '@modules/data-forms-elements-types/models/data-form-element-type.model';

const LOG_PREFIX: string = "[Data Types Elements Types Records Selection Component]";

@Component({
    selector: 'sb-data-forms-elements-types-records-selection',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './data-forms-elements-types-records-selection.component.html',
    styleUrls: ['data-forms-elements-types-records-selection.component.scss'],
})
export class DataFormsElementsTypesRecordsSelectionComponent implements OnInit, OnDestroy, AfterViewInit {

    // Allows the parent component to inject the desired display mode: tabular or thumbnails
    @Input() public displayMode: string = "thumbnails";    

    // Allows the parent component to inject the desired selection mode: single or multi
    @Input() public selectionMode: string = "single";

    // Allows the parent component to inject the desired Contexts
    @Input() public desired: DataFormElementType[] = [];

    // Allows the parent component to inject the undesired Contexts
    // Ignored if the desired Contexts has been specified
    @Input() public undesired: DataFormElementType[] = [];

    // Allows the parent component to inject the previously selected Contexts
    @Input() public selected: DataFormElementType[] = [];

    // Broadcasts radio buttons selection events
    @Output() public select: EventEmitter<DataFormElementType> = new EventEmitter<DataFormElementType>();

    // Broadcasts checkboxes check events
    @Output() public check: EventEmitter<DataFormElementType> = new EventEmitter<DataFormElementType>();

    // Broadcasts checkboxes uncheck events
    @Output() public uncheck: EventEmitter<DataFormElementType> = new EventEmitter<DataFormElementType>();

    // Keeps a local reference to the displayed loading animation component.
    // Makes it possible to trigger the loading animation when a slow background service is invoked.
    private _animation!: LoadingAnimationComponent;

    // Keeps a local reference to the displayed pagination component.
    // Makes it possible to initialise / update the pagination component when the total number of records changes.
    private _pagination!: PaginationComponent;

    // Holds the component's initialisation status.
    // Makes it possible to display the most appropriate content based on whether the initialisation was a success or not.
    initialised: boolean | undefined;

    // Central gathering point for all the component's subscriptions.
    // Makes it efficient to unsubscribe from all subscriptions when the component is destroyed.   
    private _subscriptions: Subscription[] = [];

    // Instantitate a new reactive Form Group
    // This will allow us to define and enforce the validation rules for all the form controls.
    dataFormElementTypesForm = new FormGroup({
        contextId: new FormControl<number | null>(null, [
        ]),
    });

    constructor(
        private cd: ChangeDetectorRef,
        public contextsDataService: ContextsDataService,
        public dataFormElementTypesDataService: DataFormsSelectionDataService,
        public dataFormsElementsTypesDataService: DataFormsElementsTypesDataService,
        private filterService: FilterService,
        private log: NGXLogger) {

    }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

        // Mark Init as complete
        this.log.trace(`${LOG_PREFIX} Init completed`);


    }




    ngAfterViewInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngAfterViewInit()`);

        // Mark After-View-Init as complete
        this.log.trace(`${LOG_PREFIX} After-View-Init completed`);

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
    * Handles Data Type Selection Events
    * @param dataFormElementType The Selected Data Type
    */
    onSelect(dataFormElementType: DataFormElementType) {

        this.log.trace(`${LOG_PREFIX} Entering onSelect()`);
        this.log.debug(`${LOG_PREFIX} Selected Data Type = ${JSON.stringify(dataFormElementType)}`);

        // Broadcast the selected Data Type
        this.log.trace(`${LOG_PREFIX} Broadcasting the selected Data Type`);
        this.select.emit(dataFormElementType);
    }


    /** 
    * Handles Contexts Checkboxes Check Events
    * @param dataFormElementType The Checked Data Type
    */
    onCheck(dataFormElementType: DataFormElementType) {

        this.log.trace(`${LOG_PREFIX} Entering onCheck()`);
        this.log.debug(`${LOG_PREFIX} Checked Data Type = ${JSON.stringify(dataFormElementType)}`);

        // Broadcast the checked Data Type
        this.log.trace(`${LOG_PREFIX} Broadcasting the checked Data Type`);
        this.check.emit(dataFormElementType);
    }


    /** 
    * Handles Contexts Checkboxes Uncheck Events
    * @param dataFormElementType The Unchecked Data Type
    */
    onUncheck(dataFormElementType: DataFormElementType) {

        this.log.trace(`${LOG_PREFIX} Entering onUncheck()`);
        this.log.debug(`${LOG_PREFIX} Unchecked Data Type = ${JSON.stringify(dataFormElementType)}`);

        // Broadcast the unchecked Data Type
        this.log.trace(`${LOG_PREFIX} Broadcasting the unchecked Data Type`);
        this.uncheck.emit(dataFormElementType);

    }

    /**
     * Checks whether a Data Type record is currently selected
     * @param dataFormElementType The target Data Type
     * @returns True or false depending on whether the Data Type is currently selected or not respectively
     */
    isSelected(dataFormElementType: DataFormElementType): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isSelected()`);
        this.log.debug(`${LOG_PREFIX} Target Data Type = ${JSON.stringify(dataFormElementType)}`);

        // Check whether the Data Type is currently selected
        this.log.trace(`${LOG_PREFIX} Checking whether the Data Type is currently selected`);
        const selected: boolean = this.selected.some(e => e.id == dataFormElementType.id);
        this.log.debug(`${LOG_PREFIX} Selected = ${selected}`);

        return selected;
    }


    /**
     * Checks whether a Data Type record is currently checked
     * @param dataFormElementType The target Data Type
     * @returns True or false depending on whether the Data Type is currently checked or not respectively
     */
    isChecked(dataFormElementType: DataFormElementType): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isChecked()`);
        this.log.debug(`${LOG_PREFIX} Target Data Type = ${JSON.stringify(dataFormElementType)}`);

        // Check whether the Data Type is currently checked
        this.log.trace(`${LOG_PREFIX} Checking whether the Data Type is currently checked`);
        const checked: boolean = this.selected.some(e => e.id == dataFormElementType.id);
        this.log.debug(`${LOG_PREFIX} Checked = ${checked}`);

        return checked;
    }

    /**
     * Checks whether a Data Type record is desired
     * @param dataFormElementType The target Data Type
     * @returns True or false depending on whether the Data Type is desired or not respectively
     */
    isDesired(dataFormElementType: DataFormElementType): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isDesired()`);
        this.log.debug(`${LOG_PREFIX} Target Data Type = ${JSON.stringify(dataFormElementType)}`);

        // Check whether the Data Type is currently desired
        this.log.trace(`${LOG_PREFIX} Checking whether the Data Type is currently desired`);
        const desired: boolean = this.desired.some(e => e.id == dataFormElementType.id);
        this.log.debug(`${LOG_PREFIX} Desired = ${desired}`);

        return desired;
    }

    /**
     * Checks whether a Data Type record is undesired
     * @param dataFormElementType The target Data Type
     * @returns True or false depending on whether the Data Type is undesired or not respectively
     */
    isUndesired(dataFormElementType: DataFormElementType): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isUndesired()`);
        this.log.debug(`${LOG_PREFIX} Target Data Type = ${JSON.stringify(dataFormElementType)}`);

        // Check whether the Data Type is currently undesired
        this.log.trace(`${LOG_PREFIX} Checking whether the Data Type is currently undesired`);
        const undesired: boolean = this.undesired.some(e => e.id == dataFormElementType.id);
        this.log.debug(`${LOG_PREFIX} Undesired = ${undesired}`);

        return undesired;
    }


    onSelectionChange(e: any, dataFormElementType: DataFormElementType) {
        console.log(e);
        if (e.target.checked) {
            this.onSelect(dataFormElementType)
        }
    }

}
