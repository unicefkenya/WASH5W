import { LogicalSchemesRecordsSelectionModalComponent, LogicalSchemesRecordsCreationModalComponent, LogicalSchemesRecordsUpdationModalComponent, LogicalSchemesRecordsDeletionModalComponent } from "./modals";
import { LogicalSchemesRecordsTabulationPageComponent } from "./logical-schemes-records-tabulation-page/logical-schemes-records-tabulation-page.component";

export const containers = [
    LogicalSchemesRecordsCreationModalComponent,
    LogicalSchemesRecordsDeletionModalComponent,
    LogicalSchemesRecordsSelectionModalComponent, 
    LogicalSchemesRecordsTabulationPageComponent,   
    LogicalSchemesRecordsUpdationModalComponent
];

export * from "./logical-schemes-records-tabulation-page/logical-schemes-records-tabulation-page.component";
export * from "./modals";