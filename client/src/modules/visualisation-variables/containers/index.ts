import { VisualisationVariablesRecordsCreationModalComponent, VisualisationVariablesRecordsUpdationModalComponent, VisualisationVariablesRecordsDeletionModalComponent } from "./modals";
import { VisualisationVariablesRecordsTabulationPageComponent } from "./visualisation-variables-records-tabulation-page/visualisation-variables-records-tabulation-page.component";

export const containers = [
    VisualisationVariablesRecordsCreationModalComponent,
    VisualisationVariablesRecordsDeletionModalComponent,
    VisualisationVariablesRecordsTabulationPageComponent,   
    VisualisationVariablesRecordsUpdationModalComponent
];

export * from "./visualisation-variables-records-tabulation-page/visualisation-variables-records-tabulation-page.component";
export * from "./modals";