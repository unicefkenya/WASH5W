import { TimePeriodsFilterModalComponent, TimePeriodsRecordsSelectionModalComponent, TimePeriodsRecordsClosureModalComponent } from "./modals";
import { TimePeriodsRecordsTabulationPageComponent } from "./time-periods-records-tabulation-page/time-periods-records-tabulation-page.component";

export const containers = [
    TimePeriodsRecordsSelectionModalComponent, 
    TimePeriodsRecordsTabulationPageComponent,   
    TimePeriodsRecordsClosureModalComponent,
    TimePeriodsFilterModalComponent
];

export * from "./time-periods-records-tabulation-page/time-periods-records-tabulation-page.component";
export * from "./modals";