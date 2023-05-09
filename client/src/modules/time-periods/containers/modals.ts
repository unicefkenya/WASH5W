import { TimePeriodsFilterModalComponent } from "./time-periods-filter-modal/time-periods-filter-modal.component";
import { TimePeriodsRecordsClosureModalComponent } from "./time-periods-records-closure-modal/time-periods-records-closure-modal.component";
import { TimePeriodsRecordsSelectionModalComponent } from "./time-periods-records-selection-modal/time-periods-records-selection-modal.component";

export const containers = [
    TimePeriodsRecordsClosureModalComponent,
    TimePeriodsRecordsSelectionModalComponent,
    TimePeriodsFilterModalComponent
];

export * from "./time-periods-records-closure-modal/time-periods-records-closure-modal.component";
export * from "./time-periods-records-selection-modal/time-periods-records-selection-modal.component";
export * from  "./time-periods-filter-modal/time-periods-filter-modal.component";

