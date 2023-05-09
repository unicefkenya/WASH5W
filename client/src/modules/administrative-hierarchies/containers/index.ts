import { AdministrativeHierarchiesRecordsSelectionModalComponent, AssignedAdministrativeHierarchiesRecordsSelectionModalComponent, AdministrativeHierarchiesRecordsCreationModalComponent, AdministrativeHierarchiesRecordsDeletionModalComponent } from "./modals";
import { AdministrativeHierarchiesRecordsTabulationPageComponent } from "./administrative-hierarchies-records-tabulation-page/administrative-hierarchies-records-tabulation-page.component";

export const containers = [
    AdministrativeHierarchiesRecordsCreationModalComponent,
    AdministrativeHierarchiesRecordsDeletionModalComponent,
    AdministrativeHierarchiesRecordsSelectionModalComponent,
    AdministrativeHierarchiesRecordsTabulationPageComponent,
    AssignedAdministrativeHierarchiesRecordsSelectionModalComponent
];

export * from "./administrative-hierarchies-records-tabulation-page/administrative-hierarchies-records-tabulation-page.component";
export * from "./modals";