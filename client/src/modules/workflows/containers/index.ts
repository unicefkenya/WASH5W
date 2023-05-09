import { WorkflowsRecordsSelectionModalComponent, WorkflowsRecordsCreationModalComponent, WorkflowsRecordsUpdationModalComponent, WorkflowsRecordsDeletionModalComponent } from "./modals";
import { WorkflowsRecordsTabulationPageComponent } from "./workflows-records-tabulation-page/workflows-records-tabulation-page.component";

export const containers = [
    WorkflowsRecordsCreationModalComponent,
    WorkflowsRecordsDeletionModalComponent,
    WorkflowsRecordsSelectionModalComponent, 
    WorkflowsRecordsTabulationPageComponent,   
    WorkflowsRecordsUpdationModalComponent
];

export * from "./workflows-records-tabulation-page/workflows-records-tabulation-page.component";
export * from "./modals";