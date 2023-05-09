import { DataFormsRecordsSelectionModalComponent, DataFormsRecordsCreationModalComponent, DataFormsRecordsUpdationModalComponent, DataFormsRecordsDeletionModalComponent } from "./modals";
import { DataFormsRecordsTabulationPageComponent } from "./data-forms-records-tabulation-page/data-forms-records-tabulation-page.component";

export const containers = [
    DataFormsRecordsCreationModalComponent,
    DataFormsRecordsDeletionModalComponent,
    DataFormsRecordsSelectionModalComponent, 
    DataFormsRecordsTabulationPageComponent,   
    DataFormsRecordsUpdationModalComponent
];

export * from "./data-forms-records-tabulation-page/data-forms-records-tabulation-page.component";
export * from "./modals";