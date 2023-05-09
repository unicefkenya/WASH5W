import { SystemsUsersRightsRecordsSelectionModalComponent, SystemsUsersRightsRecordsCreationModalComponent, SystemsUsersRightsRecordsUpdationModalComponent, SystemsUsersRightsRecordsDeletionModalComponent } from "./modals";
import { SystemsUsersRightsRecordsTabulationPageComponent } from "./systems-users-rights-records-tabulation-page/systems-users-rights-records-tabulation-page.component";

export const containers = [
    SystemsUsersRightsRecordsCreationModalComponent,
    SystemsUsersRightsRecordsDeletionModalComponent,
    SystemsUsersRightsRecordsSelectionModalComponent, 
    SystemsUsersRightsRecordsTabulationPageComponent,   
    SystemsUsersRightsRecordsUpdationModalComponent
];

export * from "./systems-users-rights-records-tabulation-page/systems-users-rights-records-tabulation-page.component";
export * from "./modals";