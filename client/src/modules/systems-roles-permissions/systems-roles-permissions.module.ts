/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';

/* Components */
import * as systemsRolesPermissionsComponents from './components';


/* Containers */
import * as systemsRolesPermissionsContainers from './containers';
import * as systemsRolesPermissionsModalContainers from './containers/modals';

/* Guards */
import * as systemsRolesPermissionsGuards from './guards';

/* Services */
import * as systemsRolesPermissionsServices from './services';


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
        ...systemsRolesPermissionsServices.services,
        ...systemsRolesPermissionsGuards.guards
    ],
    declarations: [
        ...systemsRolesPermissionsContainers.containers,
        ...systemsRolesPermissionsComponents.components
    ],
    exports: [...systemsRolesPermissionsContainers.containers, ...systemsRolesPermissionsComponents.components],
    entryComponents: [...systemsRolesPermissionsModalContainers.containers]
})
export class SystemsRolesPermissionsModule {}
