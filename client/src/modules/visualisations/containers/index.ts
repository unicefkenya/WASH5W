import { VisualisationsRecordsCreationModalComponent, VisualisationsRecordsUpdationModalComponent, VisualisationsRecordsDeletionModalComponent } from "./modals";
import { VisualisationsRecordsTabulationPageComponent } from "./visualisations-records-tabulation-page/visualisations-records-tabulation-page.component";

export const containers = [
    VisualisationsRecordsCreationModalComponent,
    VisualisationsRecordsDeletionModalComponent,
    VisualisationsRecordsTabulationPageComponent,   
    VisualisationsRecordsUpdationModalComponent
];

export * from "./visualisations-records-tabulation-page/visualisations-records-tabulation-page.component";
export * from "./modals";