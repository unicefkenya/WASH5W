import { LogicalElementsRecordsSelectionModalComponent, LogicalElementsRecordsCreationModalComponent, LogicalElementsRecordsUpdationModalComponent, LogicalElementsRecordsDeletionModalComponent } from "./modals";
import { LogicalElementsRecordsTabulationPageComponent } from "./logical-elements-records-tabulation-page/logical-elements-records-tabulation-page.component";

export const containers = [
    LogicalElementsRecordsCreationModalComponent,
    LogicalElementsRecordsDeletionModalComponent,
    LogicalElementsRecordsSelectionModalComponent, 
    LogicalElementsRecordsTabulationPageComponent,   
    LogicalElementsRecordsUpdationModalComponent
];

export * from "./logical-elements-records-tabulation-page/logical-elements-records-tabulation-page.component";
export * from "./modals";