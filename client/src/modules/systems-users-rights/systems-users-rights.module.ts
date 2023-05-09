/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';
import { AdministrativeHierarchiesModule } from '@modules/administrative-hierarchies/administrative-hierarchies.module';
import { OrganisationsModule } from '@modules/organisations/organisations.module';
import { EntitiesModule } from '@modules/entities/entities.module';

/* Components */
import * as systemsUsersRightsComponents from './components';


/* Containers */
import * as systemsUsersRightsContainers from './containers';
import * as systemsUsersRightsModalContainers from './containers/modals';

/* Guards */
import * as systemsUsersRightsGuards from './guards';

/* Services */
import * as systemsUsersRightsServices from './services';



@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        FormsModule,
        AppCommonModule,
        NavigationModule,
        AdministrativeHierarchiesModule,
        OrganisationsModule,
        EntitiesModule
    ],
    providers: [
        DecimalPipe,
        ...systemsUsersRightsServices.services,
        ...systemsUsersRightsGuards.guards
    ],
    declarations: [
        ...systemsUsersRightsContainers.containers,
        ...systemsUsersRightsComponents.components
    ],
    exports: [...systemsUsersRightsContainers.containers, ...systemsUsersRightsComponents.components],
    entryComponents: [...systemsUsersRightsModalContainers.containers]
})
export class SystemsUsersRightsModule {}
