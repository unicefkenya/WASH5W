import { SystemsModulesRecordsSelectionModalComponent, SystemsModulesRecordsCreationModalComponent, SystemsModulesRecordsUpdationModalComponent, SystemsModulesRecordsDeletionModalComponent } from "./modals";
import { SystemsModulesRecordsTabulationPageComponent } from "./systems-modules-records-tabulation-page/systems-modules-records-tabulation-page.component";

export const containers = [
    SystemsModulesRecordsCreationModalComponent,
    SystemsModulesRecordsDeletionModalComponent,
    SystemsModulesRecordsSelectionModalComponent, 
    SystemsModulesRecordsTabulationPageComponent,   
    SystemsModulesRecordsUpdationModalComponent
];

export * from "./systems-modules-records-tabulation-page/systems-modules-records-tabulation-page.component";
export * from "./modals";