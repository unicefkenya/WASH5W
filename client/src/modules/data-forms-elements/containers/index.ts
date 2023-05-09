import { DataFormsFieldsRecordsCreationModalComponent, DataFormsFieldsRecordsUpdationModalComponent, DataFormsFieldsRecordsDeletionModalComponent, DataFormsGroupsRecordsCreationModalComponent, DataFormsGroupsRecordsUpdationModalComponent} from "./modals";
import { DataFormsElementsConfigurationViewsTabulationPageComponent} from "./data-forms-elements-configuration-views-tabulation-page/data-forms-elements-configuration-views-tabulation-page.component";
import { DataFormsElementsResponseViewsTabulationPageComponent } from "./data-forms-elements-response-views-tabulation-page/data-forms-elements-response-views-tabulation-page.component";
import { DataFormsGroupsRecordsDeletionModalComponent } from "./data-forms-groups-records-deletion-modal/data-forms-groups-records-deletion-modal.component";

export const containers = [
    DataFormsFieldsRecordsCreationModalComponent,
    DataFormsFieldsRecordsDeletionModalComponent,
    DataFormsFieldsRecordsUpdationModalComponent,
    DataFormsElementsConfigurationViewsTabulationPageComponent,
    DataFormsElementsResponseViewsTabulationPageComponent,
    DataFormsGroupsRecordsCreationModalComponent,
    DataFormsGroupsRecordsUpdationModalComponent,
    DataFormsGroupsRecordsDeletionModalComponent 
];

export * from "./data-forms-elements-configuration-views-tabulation-page/data-forms-elements-configuration-views-tabulation-page.component";
export * from "./data-forms-elements-response-views-tabulation-page/data-forms-elements-response-views-tabulation-page.component";
export * from "./modals";