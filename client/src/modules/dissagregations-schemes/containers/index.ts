import { DissagregationsSchemesRecordsSelectionModalComponent, DissagregationsSchemesRecordsCreationModalComponent, DissagregationsSchemesRecordsUpdationModalComponent, DissagregationsSchemesRecordsDeletionModalComponent } from "./modals";
import { DissagregationsSchemesRecordsTabulationPageComponent } from "./dissagregations-schemes-records-tabulation-page/dissagregations-schemes-records-tabulation-page.component";

export const containers = [
    DissagregationsSchemesRecordsCreationModalComponent,
    DissagregationsSchemesRecordsDeletionModalComponent,
    DissagregationsSchemesRecordsSelectionModalComponent, 
    DissagregationsSchemesRecordsTabulationPageComponent,   
    DissagregationsSchemesRecordsUpdationModalComponent
];

export * from "./dissagregations-schemes-records-tabulation-page/dissagregations-schemes-records-tabulation-page.component";
export * from "./modals";