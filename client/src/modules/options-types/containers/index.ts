import { OptionsTypesRecordsSelectionModalComponent, OptionsTypesRecordsCreationModalComponent, OptionsTypesRecordsUpdationModalComponent, OptionsTypesRecordsDeletionModalComponent } from "./modals";
import { OptionsTypesRecordsTabulationPageComponent } from "./options-types-records-tabulation-page/options-types-records-tabulation-page.component";

export const containers = [
    OptionsTypesRecordsCreationModalComponent,
    OptionsTypesRecordsDeletionModalComponent,
    OptionsTypesRecordsSelectionModalComponent, 
    OptionsTypesRecordsTabulationPageComponent,   
    OptionsTypesRecordsUpdationModalComponent
];

export * from "./options-types-records-tabulation-page/options-types-records-tabulation-page.component";
export * from "./modals";