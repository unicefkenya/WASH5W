import { AdministrativeUnitsTypesRecordsSelectionModalComponent, AdministrativeUnitsTypesRecordsCreationModalComponent, AdministrativeUnitsTypesRecordsUpdationModalComponent, AdministrativeUnitsTypesRecordsDeletionModalComponent } from "./modals";
import { AdministrativeUnitsTypesRecordsTabulationPageComponent } from "./administrative-units-types-records-tabulation-page/administrative-units-types-records-tabulation-page.component";

export const containers = [
    AdministrativeUnitsTypesRecordsCreationModalComponent,
    AdministrativeUnitsTypesRecordsDeletionModalComponent,
    AdministrativeUnitsTypesRecordsSelectionModalComponent, 
    AdministrativeUnitsTypesRecordsTabulationPageComponent,   
    AdministrativeUnitsTypesRecordsUpdationModalComponent
];

export * from "./administrative-units-types-records-tabulation-page/administrative-units-types-records-tabulation-page.component";
export * from "./modals";