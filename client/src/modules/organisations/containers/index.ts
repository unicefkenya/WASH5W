import { OrganisationsRecordsSelectionModalComponent, OrganisationsRecordsCreationModalComponent, OrganisationsRecordsUpdationModalComponent, OrganisationsRecordsDeletionModalComponent } from "./modals";
import { OrganisationsRecordsTabulationPageComponent } from "./organisations-records-tabulation-page/organisations-records-tabulation-page.component";

export const containers = [
    OrganisationsRecordsCreationModalComponent,
    OrganisationsRecordsDeletionModalComponent,
    OrganisationsRecordsSelectionModalComponent, 
    OrganisationsRecordsTabulationPageComponent,   
    OrganisationsRecordsUpdationModalComponent
];

export * from "./organisations-records-tabulation-page/organisations-records-tabulation-page.component";
export * from "./modals";