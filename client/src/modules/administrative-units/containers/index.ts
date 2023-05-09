import { AdministrativeUnitsRecordsSelectionModalComponent, AdministrativeUnitsRecordsCreationModalComponent, AdministrativeUnitsRecordsUpdationModalComponent, AdministrativeUnitsRecordsDeletionModalComponent } from "./modals";
import { AdministrativeUnitsRecordsTabulationPageComponent } from "./administrative-units-records-tabulation-page/administrative-units-records-tabulation-page.component";

export const containers = [
    AdministrativeUnitsRecordsCreationModalComponent,
    AdministrativeUnitsRecordsDeletionModalComponent,
    AdministrativeUnitsRecordsSelectionModalComponent, 
    AdministrativeUnitsRecordsTabulationPageComponent,   
    AdministrativeUnitsRecordsUpdationModalComponent
];

export * from "./administrative-units-records-tabulation-page/administrative-units-records-tabulation-page.component";
export * from "./modals";