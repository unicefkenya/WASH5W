import { LogicalStructuresRecordsSelectionModalComponent, LogicalStructuresRecordsCreationModalComponent, LogicalStructuresRecordsUpdationModalComponent, LogicalStructuresRecordsDeletionModalComponent } from "./modals";
import { LogicalStructuresRecordsTabulationPageComponent } from "./logical-structures-records-tabulation-page/logical-structures-records-tabulation-page.component";

export const containers = [
    LogicalStructuresRecordsCreationModalComponent,
    LogicalStructuresRecordsDeletionModalComponent,
    LogicalStructuresRecordsSelectionModalComponent, 
    LogicalStructuresRecordsTabulationPageComponent,   
    LogicalStructuresRecordsUpdationModalComponent
];

export * from "./logical-structures-records-tabulation-page/logical-structures-records-tabulation-page.component";
export * from "./modals";