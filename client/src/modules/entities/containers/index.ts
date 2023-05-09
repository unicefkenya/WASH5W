import { EntitiesRecordsSelectionModalComponent, EntitiesRecordsCreationModalComponent, EntitiesRecordsUpdationModalComponent, EntitiesRecordsDeletionModalComponent } from "./modals";
import { EntitiesRecordsTabulationPageComponent } from "./entities-records-tabulation-page/entities-records-tabulation-page.component";

export const containers = [
    EntitiesRecordsCreationModalComponent,
    EntitiesRecordsDeletionModalComponent,
    EntitiesRecordsSelectionModalComponent, 
    EntitiesRecordsTabulationPageComponent,   
    EntitiesRecordsUpdationModalComponent
];

export * from "./entities-records-tabulation-page/entities-records-tabulation-page.component";
export * from "./modals";