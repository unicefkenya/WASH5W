import { TimePointsRecordsSelectionModalComponent, TimePointsRecordsClosureModalComponent } from "./modals";
import { TimePointsRecordsTabulationPageComponent } from "./time-points-records-tabulation-page/time-points-records-tabulation-page.component";

export const containers = [
    TimePointsRecordsSelectionModalComponent, 
    TimePointsRecordsTabulationPageComponent,   
    TimePointsRecordsClosureModalComponent
];

export * from "./time-points-records-tabulation-page/time-points-records-tabulation-page.component";
export * from "./modals";