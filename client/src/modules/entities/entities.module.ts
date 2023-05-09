/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';
import { AdministrativeHierarchiesModule } from '@modules/administrative-hierarchies/administrative-hierarchies.module';


/* Components */
import * as entitiesComponents from './components';


/* Containers */
import * as entitiesContainers from './containers';
import * as entitiesModalContainers from './containers/modals';

/* Guards */
import * as entitiesGuards from './guards';

/* Services */
import * as entitiesServices from './services';



@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        FormsModule,
        AppCommonModule,
        NavigationModule,
        AdministrativeHierarchiesModule
    ],
    providers: [
        DecimalPipe,
        ...entitiesServices.services,
        ...entitiesGuards.guards
    ],
    declarations: [
        ...entitiesContainers.containers,
        ...entitiesComponents.components
    ],
    exports: [...entitiesContainers.containers, ...entitiesComponents.components],
    entryComponents: [...entitiesModalContainers.containers]
})
export class EntitiesModule {}
