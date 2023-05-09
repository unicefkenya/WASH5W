import { VisualisationAxesRecordsCreationModalComponent, VisualisationAxesRecordsUpdationModalComponent, VisualisationAxesRecordsDeletionModalComponent } from "./modals";
import { VisualisationAxesRecordsTabulationPageComponent } from "./visualisation-axes-records-tabulation-page/visualisation-axes-records-tabulation-page.component";

export const containers = [
    VisualisationAxesRecordsCreationModalComponent,
    VisualisationAxesRecordsDeletionModalComponent,
    VisualisationAxesRecordsTabulationPageComponent,   
    VisualisationAxesRecordsUpdationModalComponent
];

export * from "./visualisation-axes-records-tabulation-page/visualisation-axes-records-tabulation-page.component";
export * from "./modals";
