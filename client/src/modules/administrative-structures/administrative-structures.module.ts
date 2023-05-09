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

/* Components */
import * as administrativeStructuresComponents from './components';


/* Containers */
import * as administrativeStructuresContainers from './containers';
import * as administrativeStructuresModalContainers from './containers/modals';

/* Guards */
import * as administrativeStructuresGuards from './guards';

/* Services */
import * as administrativeStructuresServices from './services';


@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        FormsModule,
        AppCommonModule,
        NavigationModule,
        AdministrativeUnitsTypesModule,
        AdministrativeSystemsModule
    ],
    providers: [
        DecimalPipe,
        ...administrativeStructuresServices.services,
        ...administrativeStructuresGuards.guards
    ],
    declarations: [
        ...administrativeStructuresContainers.containers,
        ...administrativeStructuresComponents.components
    ],
    exports: [...administrativeStructuresContainers.containers, ...administrativeStructuresComponents.components],
    entryComponents: [...administrativeStructuresModalContainers.containers]
})
export class AdministrativeStructuresModule {}
