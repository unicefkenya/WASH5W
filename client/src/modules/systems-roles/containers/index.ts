import { SystemsRolesRecordsSelectionModalComponent, SystemsRolesRecordsCreationModalComponent, SystemsRolesRecordsUpdationModalComponent, SystemsRolesRecordsDeletionModalComponent } from "./modals";
import { SystemsRolesRecordsTabulationPageComponent } from "./systems-roles-records-tabulation-page/systems-roles-records-tabulation-page.component";

export const containers = [
    SystemsRolesRecordsCreationModalComponent,
    SystemsRolesRecordsDeletionModalComponent,
    SystemsRolesRecordsSelectionModalComponent, 
    SystemsRolesRecordsTabulationPageComponent,   
    SystemsRolesRecordsUpdationModalComponent
];

export * from "./systems-roles-records-tabulation-page/systems-roles-records-tabulation-page.component";
export * from "./modals";