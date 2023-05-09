import { EntitiesTypesRecordsSelectionModalComponent, EntitiesTypesRecordsCreationModalComponent, EntitiesTypesRecordsUpdationModalComponent, EntitiesTypesRecordsDeletionModalComponent } from "./modals";
import { EntitiesTypesRecordsTabulationPageComponent } from "./entities-types-records-tabulation-page/entities-types-records-tabulation-page.component";

export const containers = [
    EntitiesTypesRecordsCreationModalComponent,
    EntitiesTypesRecordsDeletionModalComponent,
    EntitiesTypesRecordsSelectionModalComponent, 
    EntitiesTypesRecordsTabulationPageComponent,   
    EntitiesTypesRecordsUpdationModalComponent
];

export * from "./entities-types-records-tabulation-page/entities-types-records-tabulation-page.component";
export * from "./modals";