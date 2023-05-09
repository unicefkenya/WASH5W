/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';

/* Components */
import * as systemsRolesComponents from './components';


/* Containers */
import * as systemsRolesContainers from './containers';
import * as systemsRolesModalContainers from './containers/modals';

/* Guards */
import * as systemsRolesGuards from './guards';

/* Services */
import * as systemsRolesServices from './services';


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
        ...systemsRolesServices.services,
        ...systemsRolesGuards.guards
    ],
    declarations: [
        ...systemsRolesContainers.containers,
        ...systemsRolesComponents.components
    ],
    exports: [...systemsRolesContainers.containers, ...systemsRolesComponents.components],
    entryComponents: [...systemsRolesModalContainers.containers]
})
export class SystemsRolesModule {}
