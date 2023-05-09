/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';

/* Components */
import * as systemsModulesComponents from './components';


/* Containers */
import * as systemsModulesContainers from './containers';
import * as systemsModulesModalContainers from './containers/modals';

/* Guards */
import * as systemsModulesGuards from './guards';

/* Services */
import * as systemsModulesServices from './services';


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
        ...systemsModulesServices.services,
        ...systemsModulesGuards.guards
    ],
    declarations: [
        ...systemsModulesContainers.containers,
        ...systemsModulesComponents.components
    ],
    exports: [...systemsModulesContainers.containers, ...systemsModulesComponents.components],
    entryComponents: [...systemsModulesModalContainers.containers]
})
export class SystemsModulesModule {}
