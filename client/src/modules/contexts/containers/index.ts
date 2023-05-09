import { ContextsRecordsSelectionModalComponent, ContextsRecordsCreationModalComponent, ContextsRecordsUpdationModalComponent, ContextsRecordsDeletionModalComponent } from "./modals";
import { ContextsRecordsTabulationPageComponent } from "./contexts-records-tabulation-page/contexts-records-tabulation-page.component";

export const containers = [
    ContextsRecordsCreationModalComponent,
    ContextsRecordsDeletionModalComponent,
    ContextsRecordsSelectionModalComponent, 
    ContextsRecordsTabulationPageComponent,   
    ContextsRecordsUpdationModalComponent
];

export * from "./contexts-records-tabulation-page/contexts-records-tabulation-page.component";
export * from "./modals";