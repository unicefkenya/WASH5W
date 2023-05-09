import { AdministrativeSystemsRecordsSelectionModalComponent, AdministrativeSystemsRecordsCreationModalComponent, AdministrativeSystemsRecordsUpdationModalComponent, AdministrativeSystemsRecordsDeletionModalComponent } from "./modals";
import { AdministrativeSystemsRecordsTabulationPageComponent } from "./administrative-systems-records-tabulation-page/administrative-systems-records-tabulation-page.component";

export const containers = [
    AdministrativeSystemsRecordsCreationModalComponent,
    AdministrativeSystemsRecordsDeletionModalComponent,
    AdministrativeSystemsRecordsSelectionModalComponent, 
    AdministrativeSystemsRecordsTabulationPageComponent,   
    AdministrativeSystemsRecordsUpdationModalComponent
];

export * from "./administrative-systems-records-tabulation-page/administrative-systems-records-tabulation-page.component";
export * from "./modals";