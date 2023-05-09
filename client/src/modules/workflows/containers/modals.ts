import { WorkflowsRecordsCreationModalComponent } from "./workflows-records-creation-modal/workflows-records-creation-modal.component";
import { WorkflowsRecordsDeletionModalComponent } from "./workflows-records-deletion-modal/workflows-records-deletion-modal.component";
import { WorkflowsRecordsSelectionModalComponent } from "./workflows-records-selection-modal/workflows-records-selection-modal.component";
import { WorkflowsRecordsUpdationModalComponent } from "./workflows-records-updation-modal/workflows-records-updation-modal.component";

export const containers = [
    WorkflowsRecordsCreationModalComponent,
    WorkflowsRecordsDeletionModalComponent,
    WorkflowsRecordsUpdationModalComponent,
    WorkflowsRecordsSelectionModalComponent,
];

export * from "./workflows-records-creation-modal/workflows-records-creation-modal.component";
export * from "./workflows-records-deletion-modal/workflows-records-deletion-modal.component";
export * from "./workflows-records-selection-modal/workflows-records-selection-modal.component";
export * from "./workflows-records-updation-modal/workflows-records-updation-modal.component";

