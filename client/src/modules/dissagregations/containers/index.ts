import { DissagregationsRecordsSelectionModalComponent, DissagregationsRecordsCreationModalComponent, DissagregationsRecordsUpdationModalComponent, DissagregationsRecordsDeletionModalComponent } from "./modals";
import { DissagregationsRecordsTabulationPageComponent } from "./dissagregations-records-tabulation-page/dissagregations-records-tabulation-page.component";

export const containers = [
    DissagregationsRecordsCreationModalComponent,
    DissagregationsRecordsDeletionModalComponent,
    DissagregationsRecordsSelectionModalComponent, 
    DissagregationsRecordsTabulationPageComponent,   
    DissagregationsRecordsUpdationModalComponent
];

export * from "./dissagregations-records-tabulation-page/dissagregations-records-tabulation-page.component";
export * from "./modals";