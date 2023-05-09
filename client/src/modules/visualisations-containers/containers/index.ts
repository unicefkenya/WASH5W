import { VisualisationsContainersRecordsCreationModalComponent, VisualisationsContainersRecordsUpdationModalComponent, VisualisationsContainersRecordsDeletionModalComponent } from "./modals";
import { VisualisationsContainersRecordsParentTabulationPageComponent } from "./visualisations-containers-records-parent-tabulation-page/visualisations-containers-records-parent-tabulation-page.component";

export const containers = [
    VisualisationsContainersRecordsCreationModalComponent,
    VisualisationsContainersRecordsDeletionModalComponent,
    VisualisationsContainersRecordsParentTabulationPageComponent,   
    VisualisationsContainersRecordsUpdationModalComponent
];

export * from "./visualisations-containers-records-parent-tabulation-page/visualisations-containers-records-parent-tabulation-page.component";
export * from "./modals";