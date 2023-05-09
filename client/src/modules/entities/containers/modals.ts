import { EntitiesRecordsCreationModalComponent } from "./entities-records-creation-modal/entities-records-creation-modal.component";
import { EntitiesRecordsDeletionModalComponent } from "./entities-records-deletion-modal/entities-records-deletion-modal.component";
import { EntitiesRecordsSelectionModalComponent } from "./entities-records-selection-modal/entities-records-selection-modal.component";
import { EntitiesRecordsUpdationModalComponent } from "./entities-records-updation-modal/entities-records-updation-modal.component";

export const containers = [
    EntitiesRecordsCreationModalComponent,
    EntitiesRecordsDeletionModalComponent,
    EntitiesRecordsUpdationModalComponent,
    EntitiesRecordsSelectionModalComponent,
];

export * from "./entities-records-creation-modal/entities-records-creation-modal.component";
export * from "./entities-records-deletion-modal/entities-records-deletion-modal.component";
export * from "./entities-records-selection-modal/entities-records-selection-modal.component";
export * from "./entities-records-updation-modal/entities-records-updation-modal.component";

