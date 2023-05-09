/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';

/* Components */
import * as visualisationVariablesRolesComponents from './components';


/* Containers */
import * as visualisationVariablesRolesContainers from './containers';
import * as visualisationVariablesRolesModalContainers from './containers/modals';

/* Guards */
import * as visualisationVariablesRolesGuards from './guards';

/* Services */
import * as visualisationVariablesRolesServices from './services';


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
        ...visualisationVariablesRolesServices.services,
        ...visualisationVariablesRolesGuards.guards
    ],
    declarations: [
        ...visualisationVariablesRolesContainers.containers,
        ...visualisationVariablesRolesComponents.components
    ],
    exports: [...visualisationVariablesRolesContainers.containers, ...visualisationVariablesRolesComponents.components],
    entryComponents: [...visualisationVariablesRolesModalContainers.containers]
})
export class VisualisationVariablesRolesModule {}
