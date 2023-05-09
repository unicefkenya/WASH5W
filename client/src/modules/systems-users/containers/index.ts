import { SystemsUsersRecordsSelectionModalComponent, SystemsUsersRecordsCreationModalComponent, SystemsUsersRecordsUpdationModalComponent, SystemsUsersRecordsDeletionModalComponent } from "./modals";
import { SystemsUsersRecordsTabulationPageComponent } from "./systems-users-records-tabulation-page/systems-users-records-tabulation-page.component";

export const containers = [
    SystemsUsersRecordsCreationModalComponent,
    SystemsUsersRecordsDeletionModalComponent,
    SystemsUsersRecordsSelectionModalComponent, 
    SystemsUsersRecordsTabulationPageComponent,   
    SystemsUsersRecordsUpdationModalComponent
];

export * from "./systems-users-records-tabulation-page/systems-users-records-tabulation-page.component";
export * from "./modals";