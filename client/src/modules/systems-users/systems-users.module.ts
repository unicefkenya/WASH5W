/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';
import { SystemsUsersRightsModule } from '@modules/systems-users-rights/systems-users-rights.module';

/* Components */
import * as systemsUsersComponents from './components';


/* Containers */
import * as systemsUsersContainers from './containers';
import * as systemsUsersModalContainers from './containers/modals';

/* Guards */
import * as systemsUsersGuards from './guards';

/* Services */
import * as systemsUsersServices from './services';


@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        FormsModule,
        AppCommonModule,
        NavigationModule,
        SystemsUsersRightsModule
    ],
    providers: [
        DecimalPipe,
        ...systemsUsersServices.services,
        ...systemsUsersGuards.guards
    ],
    declarations: [
        ...systemsUsersContainers.containers,
        ...systemsUsersComponents.components
    ],
    exports: [...systemsUsersContainers.containers, ...systemsUsersComponents.components],
    entryComponents: [...systemsUsersModalContainers.containers]
})
export class SystemsUsersModule {}
