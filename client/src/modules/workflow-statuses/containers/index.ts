import { WorkflowStatusesRecordsSelectionModalComponent, WorkflowStatusesRecordsCreationModalComponent, WorkflowStatusesRecordsUpdationModalComponent, WorkflowStatusesRecordsDeletionModalComponent } from "./modals";
import { WorkflowStatusesRecordsTabulationPageComponent } from "./workflow-statuses-records-tabulation-page/workflow-statuses-records-tabulation-page.component";

export const containers = [
    WorkflowStatusesRecordsCreationModalComponent,
    WorkflowStatusesRecordsDeletionModalComponent,
    WorkflowStatusesRecordsSelectionModalComponent, 
    WorkflowStatusesRecordsTabulationPageComponent,   
    WorkflowStatusesRecordsUpdationModalComponent
];

export * from "./workflow-statuses-records-tabulation-page/workflow-statuses-records-tabulation-page.component";
export * from "./modals";