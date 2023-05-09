import { OrganisationsTypesRecordsSelectionModalComponent, OrganisationsTypesRecordsCreationModalComponent, OrganisationsTypesRecordsUpdationModalComponent, OrganisationsTypesRecordsDeletionModalComponent } from "./modals";
import { OrganisationsTypesRecordsTabulationPageComponent } from "./organisations-types-records-tabulation-page/organisations-types-records-tabulation-page.component";

export const containers = [
    OrganisationsTypesRecordsCreationModalComponent,
    OrganisationsTypesRecordsDeletionModalComponent,
    OrganisationsTypesRecordsSelectionModalComponent, 
    OrganisationsTypesRecordsTabulationPageComponent,   
    OrganisationsTypesRecordsUpdationModalComponent
];

export * from "./organisations-types-records-tabulation-page/organisations-types-records-tabulation-page.component";
export * from "./modals";