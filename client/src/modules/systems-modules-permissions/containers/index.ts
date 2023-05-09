import { SystemsModulesPermissionsRecordsSelectionModalComponent, SystemsModulesPermissionsRecordsCreationModalComponent, SystemsModulesPermissionsRecordsUpdationModalComponent, SystemsModulesPermissionsRecordsDeletionModalComponent } from "./modals";
import { SystemsModulesPermissionsRecordsTabulationPageComponent } from "./systems-modules-permissions-records-tabulation-page/systems-modules-permissions-records-tabulation-page.component";

export const containers = [
    SystemsModulesPermissionsRecordsCreationModalComponent,
    SystemsModulesPermissionsRecordsDeletionModalComponent,
    SystemsModulesPermissionsRecordsSelectionModalComponent, 
    SystemsModulesPermissionsRecordsTabulationPageComponent,   
    SystemsModulesPermissionsRecordsUpdationModalComponent
];

export * from "./systems-modules-permissions-records-tabulation-page/systems-modules-permissions-records-tabulation-page.component";
export * from "./modals";