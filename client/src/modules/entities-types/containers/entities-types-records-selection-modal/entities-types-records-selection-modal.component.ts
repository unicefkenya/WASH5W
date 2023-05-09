import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, OnInit, Output} from '@angular/core';
import { EntityType } from '@modules/entities-types/models/entity-type.model';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Entities Types Records Tabulation Modal]";

@Component({
    selector: 'sb-entities-types-records-selection-modal',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './entities-types-records-selection-modal.component.html',
    styleUrls: ['entities-types-records-selection-modal.component.scss'],
})
export class EntitiesTypesRecordsSelectionModalComponent implements OnInit {


    // Allows the parent component to inject the desired selection mode: single or multi
    @Input() public selectionMode: string = "single";

    // Allows the parent component to inject the desired Contexts
    @Input() public desired: EntityType[] = [];    

    // Allows the parent component to inject the undesired Contexts
    // Ignored if the desired Contexts has been specified
    @Input() public undesired: EntityType[] = [];

    // Allows the parent component to inject the previously selected Contexts
    @Input() public selected: EntityType[] = [];

    // Propagates radio buttons selection events
    @Output() public select: EventEmitter<EntityType> = new EventEmitter<EntityType>();

    // Propagates checkboxes check events
    @Output() public check: EventEmitter<EntityType> = new EventEmitter<EntityType>();

    // Propagates checkboxes uncheck events
    @Output() public uncheck: EventEmitter<EntityType> = new EventEmitter<EntityType>();     

    constructor(private log: NGXLogger) { }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);
    }


    @HostListener('window:beforeunload')
    ngOnDestroy() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

    }

    /** 
    * Propagates Entity Type Selection Events
    * @param entityType The Selected Entity Type
    */
     onSelect(entityType: EntityType) {

        this.log.trace(`${LOG_PREFIX} Entering onSelect()`);
        this.log.debug(`${LOG_PREFIX} Selected Entity Type = ${JSON.stringify(entityType)}`);

        // Broadcast the selected Entity Type
        this.log.trace(`${LOG_PREFIX} Broadcasting the selected Entity Type`);
        this.select.emit(entityType);
    }


    /** 
    * Propagates Contexts Checkboxes Check Events
    * @param entityType The Checked Entity Type
    */
    onCheck(entityType: EntityType) {

        this.log.trace(`${LOG_PREFIX} Entering onCheck()`);
        this.log.debug(`${LOG_PREFIX} Checked Entity Type = ${JSON.stringify(entityType)}`);

        // Broadcast the checked Entity Type
        this.log.trace(`${LOG_PREFIX} Broadcasting the checked Entity Type`);
        this.check.emit(entityType);
    }


    /** 
    * Propagates Contexts Checkboxes Uncheck Events
    * @param entityType The Unchecked Entity Type
    */
    onUncheck(entityType: EntityType) {

        this.log.trace(`${LOG_PREFIX} Entering onUncheck()`);
        this.log.debug(`${LOG_PREFIX} Unchecked Entity Type = ${JSON.stringify(entityType)}`);

        // Broadcast the unchecked Entity Type
        this.log.trace(`${LOG_PREFIX} Broadcasting the unchecked Entity Type`);
        this.uncheck.emit(entityType);

    }   

}
