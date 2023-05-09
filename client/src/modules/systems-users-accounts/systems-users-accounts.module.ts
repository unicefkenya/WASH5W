/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';

/* Components */
import * as systemUsersAccountsComponents from './components';


/* Containers */
import * as systemUsersAccountsContainers from './containers';
import * as systemUsersAccountsModalContainers from './containers/modals';

/* Guards */
import * as systemUsersAccountsGuards from './guards';

/* Services */
import * as systemUsersAccountsServices from './services';


@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        FormsModule,
        AppCommonModule,
        NavigationModule
    ],
    providers: [
        DecimalPipe,
        ...systemUsersAccountsServices.services,
        ...systemUsersAccountsGuards.guards
    ],
    declarations: [
        ...systemUsersAccountsContainers.containers,
        ...systemUsersAccountsComponents.components
    ],
    exports: [...systemUsersAccountsContainers.containers, ...systemUsersAccountsComponents.components],
    entryComponents: [...systemUsersAccountsModalContainers.containers]
})
export class SystemsUsersAccountsModule {}
