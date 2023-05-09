import { IndicatorsRecordsSelectionModalComponent, IndicatorsRecordsCreationModalComponent, IndicatorsRecordsUpdationModalComponent, IndicatorsRecordsDeletionModalComponent } from "./modals";
import { IndicatorsRecordsTabulationPageComponent } from "./indicators-records-tabulation-page/indicators-records-tabulation-page.component";

export const containers = [
    IndicatorsRecordsCreationModalComponent,
    IndicatorsRecordsDeletionModalComponent,
    IndicatorsRecordsSelectionModalComponent, 
    IndicatorsRecordsTabulationPageComponent,   
    IndicatorsRecordsUpdationModalComponent
];

export * from "./indicators-records-tabulation-page/indicators-records-tabulation-page.component";
export * from "./modals";