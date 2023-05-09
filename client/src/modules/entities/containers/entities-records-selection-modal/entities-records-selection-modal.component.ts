import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { Entity } from '@modules/entities/models/entity.model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Entities Records Tabulation Modal]";

@Component({
    selector: 'sb-entities-records-selection-modal',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './entities-records-selection-modal.component.html',
    styleUrls: ['entities-records-selection-modal.component.scss'],
})
export class EntitiesRecordsSelectionModalComponent implements OnInit {


    // Allows the parent component to inject the desired selection mode: single or multi
    @Input() public selectionMode: string = "single";

    // Allows the parent component to inject the desired Entity Types
    @Input() public desiredTypes: number[] = [];    

    // Allows the parent component to inject the desired Entity
    @Input() public desired: number[] = [];    

    // Allows the parent component to inject the undesired Entities
    // Ignored if the desired Entities has been specified
    @Input() public undesired: number[] = [];

    // Allows the parent component to inject the previously selected Entities
    @Input() public selected: number[] = [];
    // Propagates radio buttons selection events
    @Output() public select: EventEmitter<Entity> = new EventEmitter<Entity>();

    // Propagates checkboxes check events
    @Output() public check: EventEmitter<Entity> = new EventEmitter<Entity>();

    // Propagates checkboxes uncheck events
    @Output() public uncheck: EventEmitter<Entity> = new EventEmitter<Entity>();

    // Keeps tab of the page title
    public title: string = "Select Entity Record";

    constructor(
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
    * Propagates Entity Selection Events
    * @param entity The Selected Entity
    */
    onSelect(entity: Entity) {

        this.log.trace(`${LOG_PREFIX} Entering onSelect()`);
        this.log.debug(`${LOG_PREFIX} Selected Entity = ${JSON.stringify(entity)}`);

        // Broadcast the selected Entity
        this.log.trace(`${LOG_PREFIX} Broadcasting the selected Entity`);
        this.select.emit(entity);
    }


    /** 
    * Propagates Contexts Checkboxes Check Events
    * @param entity The Checked Entity
    */
    onCheck(entity: Entity) {

        this.log.trace(`${LOG_PREFIX} Entering onCheck()`);
        this.log.debug(`${LOG_PREFIX} Checked Entity = ${JSON.stringify(entity)}`);

        // Broadcast the checked Entity
        this.log.trace(`${LOG_PREFIX} Broadcasting the checked Entity`);
        this.check.emit(entity);
    }


    /** 
    * Propagates Contexts Checkboxes Uncheck Events
    * @param entity The Unchecked Entity
    */
    onUncheck(entity: Entity) {

        this.log.trace(`${LOG_PREFIX} Entering onUncheck()`);
        this.log.debug(`${LOG_PREFIX} Unchecked Entity = ${JSON.stringify(entity)}`);

        // Broadcast the unchecked Entity
        this.log.trace(`${LOG_PREFIX} Broadcasting the unchecked Entity`);
        this.uncheck.emit(entity);

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
