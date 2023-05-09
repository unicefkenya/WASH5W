/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';
import { AdministrativeUnitsTypesModule } from '@modules/administrative-units-types/administrative-units-types.module';
import { AdministrativeSystemsModule } from '@modules/administrative-systems/administrative-systems.module';
import { AdministrativeUnitsModule } from '@modules/administrative-units/administrative-units.module';

/* Components */
import * as administrativeHierarchiesComponents from './components';


/* Containers */
import * as administrativeHierarchiesContainers from './containers';
import * as administrativeHierarchiesModalContainers from './containers/modals';

/* Guards */
import * as administrativeHierarchiesGuards from './guards';

/* Services */
import * as administrativeHierarchiesServices from './services';



@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        FormsModule,
        AppCommonModule,
        NavigationModule,
        AdministrativeUnitsTypesModule,
        AdministrativeSystemsModule,
        AdministrativeUnitsModule
    ],
    providers: [
        DecimalPipe,
        ...administrativeHierarchiesServices.services,
        ...administrativeHierarchiesGuards.guards
    ],
    declarations: [
        ...administrativeHierarchiesContainers.containers,
        ...administrativeHierarchiesComponents.components
    ],
    exports: [...administrativeHierarchiesContainers.containers, ...administrativeHierarchiesComponents.components],
    entryComponents: [...administrativeHierarchiesModalContainers.containers]
})
export class AdministrativeHierarchiesModule {}
