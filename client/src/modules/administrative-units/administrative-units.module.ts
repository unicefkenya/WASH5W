/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';

/* Components */
import * as administrativeUnitsComponents from './components';


/* Containers */
import * as administrativeUnitsContainers from './containers';
import * as administrativeUnitsModalContainers from './containers/modals';

/* Guards */
import * as administrativeUnitsGuards from './guards';

/* Services */
import * as administrativeUnitsServices from './services';



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
        ...administrativeUnitsServices.services,
        ...administrativeUnitsGuards.guards
    ],
    declarations: [
        ...administrativeUnitsContainers.containers,
        ...administrativeUnitsComponents.components
    ],
    exports: [...administrativeUnitsContainers.containers, ...administrativeUnitsComponents.components],
    entryComponents: [...administrativeUnitsModalContainers.containers]
})
export class AdministrativeUnitsModule {}
