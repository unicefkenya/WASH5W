/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';

/* Components */
import * as systemsModulesPermissionsComponents from './components';


/* Containers */
import * as systemsModulesPermissionsContainers from './containers';
import * as systemsModulesPermissionsModalContainers from './containers/modals';

/* Guards */
import * as systemsModulesPermissionsGuards from './guards';

/* Services */
import * as systemsModulesPermissionsServices from './services';



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
        ...systemsModulesPermissionsServices.services,
        ...systemsModulesPermissionsGuards.guards
    ],
    declarations: [
        ...systemsModulesPermissionsContainers.containers,
        ...systemsModulesPermissionsComponents.components
    ],
    exports: [...systemsModulesPermissionsContainers.containers, ...systemsModulesPermissionsComponents.components],
    entryComponents: [...systemsModulesPermissionsModalContainers.containers]
})
export class SystemsModulesPermissionsModule {}
