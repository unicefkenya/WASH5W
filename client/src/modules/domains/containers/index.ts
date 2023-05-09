import { DomainsRecordsSelectionModalComponent, DomainsRecordsCreationModalComponent, DomainsRecordsUpdationModalComponent, DomainsRecordsDeletionModalComponent } from "./modals";
import { DomainsRecordsTabulationPageComponent } from "./domains-records-tabulation-page/domains-records-tabulation-page.component";

export const containers = [
    DomainsRecordsCreationModalComponent,
    DomainsRecordsDeletionModalComponent,
    DomainsRecordsSelectionModalComponent, 
    DomainsRecordsTabulationPageComponent,   
    DomainsRecordsUpdationModalComponent
];

export * from "./domains-records-tabulation-page/domains-records-tabulation-page.component";
export * from "./modals";