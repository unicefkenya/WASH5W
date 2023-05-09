import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Filter, FilterService } from '@app/app-filter.service';
import { AuthService } from '@modules/auth/services/auth.service';
import { Context } from '@modules/contexts/models/context.model';
import { SystemRole } from '@modules/systems-roles/models/system-role.model';
import { SystemsUsersAccountsService } from '@modules/systems-users-accounts/services/systems-users-accounts.service';
import { VisualisationContainer } from '@modules/visualisations-containers/models/visualisation-container.model';
import { VisualisationsContainersDataService } from '@modules/visualisations-containers/services/visualisations-containers-data.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NGXLogger } from 'ngx-logger';
import { Subscription, first } from 'rxjs';

const LOG_PREFIX: string = "[Contexts Records Tabulation Modal]";

@Component({
    selector: 'sb-contexts-records-selection-modal',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './contexts-records-selection-modal.component.html',
    styleUrls: ['contexts-records-selection-modal.component.scss'],
})
export class ContextsRecordsSelectionModalComponent implements OnInit {

    // Allows the parent component to inject the selection use case: configuration or filtering
    @Input() public usecase: string = "configuration";

    // Allows the parent component to inject the desired selection mode: single or multi
    @Input() public selectionMode: string = "single";

    // Allows the parent component to inject the desired Contexts
    @Input() public desired: Context[] = [];

    // Allows the parent component to inject the undesired Contexts
    // Ignored if the desired Contexts has been specified
    @Input() public undesired: Context[] = [];

    // Allows the parent component to inject the ids of the previously selected Contexts
    @Input() public selected: number[] = [];

    // Propagates radio buttons selection events
    @Output() public select: EventEmitter<Context> = new EventEmitter<Context>();

    // Propagates checkboxes check events
    @Output() public check: EventEmitter<Context> = new EventEmitter<Context>();

    // Propagates checkboxes uncheck events
    @Output() public uncheck: EventEmitter<Context> = new EventEmitter<Context>();

    // Keeps tab of the page title
    public title: string = "Select Context Record";

    constructor(
        public systemsUsersAccountsService: SystemsUsersAccountsService,
        public filterService: FilterService,
        public authService: AuthService,
        private router: Router,
        private visualisationsContainersDataService: VisualisationsContainersDataService,
        private log: NGXLogger, public activeContextsModal: NgbActiveModal,) { }

    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);
    }

    @HostListener('window:beforeunload')
    ngOnDestroy() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

    }

    /** 
    * Propagates Context Selection Events
    * @param context The Selected Context
    */
        onSelect(context: Context) {

            this.log.trace(`${LOG_PREFIX} Entering onSelect()`);
            this.log.debug(`${LOG_PREFIX} Selected Context = ${JSON.stringify(context)}`);
    
            // Make a copy of the global filter
            this.log.trace(`${LOG_PREFIX} Making a copy of the global filter`);
            const filter: Filter = Object.assign({}, this.filterService.filter);
    
            // Prepare the account for the new context
            this.log.trace(`${LOG_PREFIX} Preparing the account for the new context`);
            this.systemsUsersAccountsService.prepareUserAccountAfterContextSwitch(filter, context, () => {
    
                // Update the global filter
                this.log.trace(`${LOG_PREFIX} Updating the global filter`);
                this.filterService.update(filter);
    
            })
    
            // Close the modal
            this.log.trace(`${LOG_PREFIX} Closing the modal`);
            this.activeContextsModal.close();
    
    
        }


    /** 
    * Propagates Contexts Checkboxes Check Events
    * @param context The Checked Context
    */
    onCheck(context: Context) {

        this.log.trace(`${LOG_PREFIX} Entering onCheck()`);
        this.log.debug(`${LOG_PREFIX} Checked Context = ${JSON.stringify(context)}`);

        // Broadcast the checked Context
        this.log.trace(`${LOG_PREFIX} Broadcasting the checked Context`);
        this.check.emit(context);
    }


    /** 
    * Propagates Contexts Checkboxes Uncheck Events
    * @param context The Unchecked Context
    */
    onUncheck(context: Context) {

        this.log.trace(`${LOG_PREFIX} Entering onUncheck()`);
        this.log.debug(`${LOG_PREFIX} Unchecked Context = ${JSON.stringify(context)}`);

        // Broadcast the unchecked Context
        this.log.trace(`${LOG_PREFIX} Broadcasting the unchecked Context`);
        this.uncheck.emit(context);

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
