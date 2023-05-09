import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FilterService } from '@app/app-filter.service';
import { AdministrativeHierarchiesRecordsSelectionModalComponent } from '@modules/administrative-hierarchies/containers/administrative-hierarchies-records-selection-modal/administrative-hierarchies-records-selection-modal.component';
import { ContextsRecordsSelectionModalComponent } from '@modules/contexts/containers/contexts-records-selection-modal/contexts-records-selection-modal.component';
import { TimePeriodsFilterModalComponent } from '@modules/time-periods/containers/time-periods-filter-modal/time-periods-filter-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Top Nav Filter Component]";

@Component({
    selector: 'sb-topnav-filter',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './top-nav-filter.component.html',
    styleUrls: ['top-nav-filter.component.scss'],
})
export class TopNavFilterComponent implements OnInit {

    constructor(
        public filterService: FilterService,
        private modalService: NgbModal,
        private log: NGXLogger) { }

    ngOnInit() { }

    onFilterByContext() {
        this.log.trace(`${LOG_PREFIX} Entering onFilterByContext()`);
        this.clearOtherModals();
        const modalRef = this.modalService.open(ContextsRecordsSelectionModalComponent, { centered: true, backdrop: 'static' });
        modalRef.componentInstance.selected = this.filterService.filter.activeContext ? [this.filterService.filter.activeContext.id] : [];
        modalRef.componentInstance.usecase = "filtering";
    }

    onFilterByLocation() {
        this.log.trace(`${LOG_PREFIX} Entering onFilterByLocation()`);
        this.clearOtherModals();
        const modalRef = this.modalService.open(AdministrativeHierarchiesRecordsSelectionModalComponent, { centered: true, backdrop: 'static' });
        modalRef.componentInstance.selected = this.filterService.filter.activeAdministrativeUnit ? [this.filterService.filter.activeAdministrativeUnit.id] : [];
    }   
    
    onFilterByTime() {
        this.log.trace(`${LOG_PREFIX} Entering onFilterByTime()`);
        this.clearOtherModals();
        this.modalService.open(TimePeriodsFilterModalComponent, { centered: true, backdrop: 'static' });
    }   

    clearOtherModals() {
        if (this.modalService.hasOpenModals()) {
            this.modalService.dismissAll();
        }
    }

}
