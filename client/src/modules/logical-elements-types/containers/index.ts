import { LogicalElementsTypesRecordsSelectionModalComponent, LogicalElementsTypesRecordsCreationModalComponent, LogicalElementsTypesRecordsUpdationModalComponent, LogicalElementsTypesRecordsDeletionModalComponent } from "./modals";
import { LogicalElementsTypesRecordsTabulationPageComponent } from "./logical-elements-types-records-tabulation-page/logical-elements-types-records-tabulation-page.component";

export const containers = [
    LogicalElementsTypesRecordsCreationModalComponent,
    LogicalElementsTypesRecordsDeletionModalComponent,
    LogicalElementsTypesRecordsSelectionModalComponent, 
    LogicalElementsTypesRecordsTabulationPageComponent,   
    LogicalElementsTypesRecordsUpdationModalComponent
];

export * from "./logical-elements-types-records-tabulation-page/logical-elements-types-records-tabulation-page.component";
export * from "./modals";