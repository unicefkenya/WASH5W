import { LogicalHierarchiesRecordsSelectionModalComponent, LogicalHierarchiesRecordsCreationModalComponent, LogicalHierarchiesRecordsDeletionModalComponent } from "./modals";
import { LogicalHierarchiesRecordsTabulationPageComponent } from "./logical-hierarchies-records-tabulation-page/logical-hierarchies-records-tabulation-page.component";

export const containers = [
    LogicalHierarchiesRecordsCreationModalComponent,
    LogicalHierarchiesRecordsDeletionModalComponent,
    LogicalHierarchiesRecordsSelectionModalComponent,
    LogicalHierarchiesRecordsTabulationPageComponent
];

export * from "./logical-hierarchies-records-tabulation-page/logical-hierarchies-records-tabulation-page.component";
export * from "./modals";