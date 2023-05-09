/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';

/* Components */
import * as administrativeUnitsTypesComponents from './components';


/* Containers */
import * as administrativeUnitsTypesContainers from './containers';
import * as administrativeUnitsTypesModalContainers from './containers/modals';

/* Guards */
import * as administrativeUnitsTypesGuards from './guards';

/* Services */
import * as administrativeUnitsTypesServices from './services';


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
        ...administrativeUnitsTypesServices.services,
        ...administrativeUnitsTypesGuards.guards
    ],
    declarations: [
        ...administrativeUnitsTypesContainers.containers,
        ...administrativeUnitsTypesComponents.components
    ],
    exports: [...administrativeUnitsTypesContainers.containers, ...administrativeUnitsTypesComponents.components],
    entryComponents: [...administrativeUnitsTypesModalContainers.containers]
})
export class AdministrativeUnitsTypesModule {}
