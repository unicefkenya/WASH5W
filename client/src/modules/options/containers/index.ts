import { OptionsRecordsSelectionModalComponent, OptionsRecordsCreationModalComponent, OptionsRecordsUpdationModalComponent, OptionsRecordsDeletionModalComponent } from "./modals";
import { OptionsRecordsTabulationPageComponent } from "./options-records-tabulation-page/options-records-tabulation-page.component";

export const containers = [
    OptionsRecordsCreationModalComponent,
    OptionsRecordsDeletionModalComponent,
    OptionsRecordsSelectionModalComponent, 
    OptionsRecordsTabulationPageComponent,   
    OptionsRecordsUpdationModalComponent
];

export * from "./options-records-tabulation-page/options-records-tabulation-page.component";
export * from "./modals";