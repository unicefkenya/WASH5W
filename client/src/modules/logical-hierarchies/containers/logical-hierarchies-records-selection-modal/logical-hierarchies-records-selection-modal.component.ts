import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { FilterService } from '@app/app-filter.service';
import { LogicalHierarchy } from '@modules/logical-hierarchies/models/logical-hierarchy.model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Logical Hierarchies Records Tabulation Modal]";

@Component({
    selector: 'sb-logical-hierarchies-records-selection-modal',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './logical-hierarchies-records-selection-modal.component.html',
    styleUrls: ['logical-hierarchies-records-selection-modal.component.scss'],
})
export class LogicalHierarchiesRecordsSelectionModalComponent implements OnInit {


    // Allows the parent component to inject the desired selection mode: single or multi
    @Input() public selectionMode: string = "single";

    // Allows the parent component to inject the desired Contexts
    @Input() public desired: LogicalHierarchy[] = [];

    // Allows the parent component to inject the undesired Contexts
    // Ignored if the desired Contexts has been specified
    @Input() public undesired: LogicalHierarchy[] = [];

    // Allows the parent component to inject the previously selected Contexts
    @Input() public selected: LogicalHierarchy[] = [];

    // Propagates radio buttons selection events
    @Output() public select: EventEmitter<LogicalHierarchy> = new EventEmitter<LogicalHierarchy>();

    // Propagates checkboxes check events
    @Output() public check: EventEmitter<LogicalHierarchy> = new EventEmitter<LogicalHierarchy>();

    // Propagates checkboxes uncheck events
    @Output() public uncheck: EventEmitter<LogicalHierarchy> = new EventEmitter<LogicalHierarchy>();

    // Keeps tab of the page title
    public title: string = "Select Logical Hierarchy Record";

    constructor(
        public filterService: FilterService,
        private log: NGXLogger,
        public activeContextsModal: NgbActiveModal,) { }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);
    }


    @HostListener('window:beforeunload')
    ngOnDestroy() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

    }

    /** 
    * Propagates Logical Hierarchy Selection Events
    * @param logicalHierarchy The Selected Logical Hierarchy
    */
    onSelect(logicalHierarchy: LogicalHierarchy) {

        this.log.trace(`${LOG_PREFIX} Entering onSelect()`);
        this.log.debug(`${LOG_PREFIX} Selected Logical Hierarchy = ${JSON.stringify(logicalHierarchy)}`);

        if (logicalHierarchy) {

            // Broadcast the selected Logical Hierarchy
            this.log.trace(`${LOG_PREFIX} Broadcasting the selected Logical Hierarchy`);
            this.select.emit(logicalHierarchy);
            this.filterService.update({ selectedLogicalHierarchy: logicalHierarchy });

            // Close the modal
            this.log.trace(`${LOG_PREFIX} Closing the modal`);
            this.activeContextsModal.close();

        }

    }


    /** 
    * Propagates Contexts Checkboxes Check Events
    * @param logicalHierarchy The Checked Logical Hierarchy
    */
    onCheck(logicalHierarchy: LogicalHierarchy) {

        this.log.trace(`${LOG_PREFIX} Entering onCheck()`);
        this.log.debug(`${LOG_PREFIX} Checked Logical Hierarchy = ${JSON.stringify(logicalHierarchy)}`);

        // Broadcast the checked Logical Hierarchy
        this.log.trace(`${LOG_PREFIX} Broadcasting the checked Logical Hierarchy`);
        this.check.emit(logicalHierarchy);
    }


    /** 
    * Propagates Contexts Checkboxes Uncheck Events
    * @param logicalHierarchy The Unchecked Logical Hierarchy
    */
    onUncheck(logicalHierarchy: LogicalHierarchy) {

        this.log.trace(`${LOG_PREFIX} Entering onUncheck()`);
        this.log.debug(`${LOG_PREFIX} Unchecked Logical Hierarchy = ${JSON.stringify(logicalHierarchy)}`);

        // Broadcast the unchecked Logical Hierarchy
        this.log.trace(`${LOG_PREFIX} Broadcasting the unchecked Logical Hierarchy`);
        this.uncheck.emit(logicalHierarchy);

    }



    /**
     * Closes the modal
     */
    onDone() {

        this.log.trace(`${LOG_PREFIX} Entering onDone()`);

        // Close the modal
        this.log.trace(`${LOG_PREFIX} Closing the modal`);
        this.activeContextsModal.close();
    }

}
