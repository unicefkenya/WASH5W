import { UnitsRecordsSelectionModalComponent, UnitsRecordsCreationModalComponent, UnitsRecordsUpdationModalComponent, UnitsRecordsDeletionModalComponent } from "./modals";
import { UnitsRecordsTabulationPageComponent } from "./units-records-tabulation-page/units-records-tabulation-page.component";

export const containers = [
    UnitsRecordsCreationModalComponent,
    UnitsRecordsDeletionModalComponent,
    UnitsRecordsSelectionModalComponent, 
    UnitsRecordsTabulationPageComponent,   
    UnitsRecordsUpdationModalComponent
];

export * from "./units-records-tabulation-page/units-records-tabulation-page.component";
export * from "./modals";