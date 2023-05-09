import { WorkflowTransitionsRecordsSelectionModalComponent, WorkflowTransitionsRecordsCreationModalComponent, WorkflowTransitionsRecordsUpdationModalComponent, WorkflowTransitionsRecordsDeletionModalComponent } from "./modals";
import { WorkflowTransitionsRecordsTabulationPageComponent } from "./workflow-transitions-records-tabulation-page/workflow-transitions-records-tabulation-page.component";

export const containers = [
    WorkflowTransitionsRecordsCreationModalComponent,
    WorkflowTransitionsRecordsDeletionModalComponent,
    WorkflowTransitionsRecordsSelectionModalComponent, 
    WorkflowTransitionsRecordsTabulationPageComponent,   
    WorkflowTransitionsRecordsUpdationModalComponent
];

export * from "./workflow-transitions-records-tabulation-page/workflow-transitions-records-tabulation-page.component";
export * from "./modals";