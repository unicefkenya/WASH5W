import { AdministrativeStructuresRecordsSelectionModalComponent, AdministrativeStructuresRecordsCreationModalComponent, AdministrativeStructuresRecordsUpdationModalComponent, AdministrativeStructuresRecordsDeletionModalComponent } from "./modals";
import { AdministrativeStructuresRecordsTabulationPageComponent } from "./administrative-structures-records-tabulation-page/administrative-structures-records-tabulation-page.component";

export const containers = [
    AdministrativeStructuresRecordsCreationModalComponent,
    AdministrativeStructuresRecordsDeletionModalComponent,
    AdministrativeStructuresRecordsSelectionModalComponent, 
    AdministrativeStructuresRecordsTabulationPageComponent,   
    AdministrativeStructuresRecordsUpdationModalComponent
];

export * from "./administrative-structures-records-tabulation-page/administrative-structures-records-tabulation-page.component";
export * from "./modals";