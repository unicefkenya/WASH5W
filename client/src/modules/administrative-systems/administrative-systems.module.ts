/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';

/* Components */
import * as administrativeSystemsComponents from './components';


/* Containers */
import * as administrativeSystemsContainers from './containers';
import * as administrativeSystemsModalContainers from './containers/modals';

/* Guards */
import * as administrativeSystemsGuards from './guards';

/* Services */
import * as administrativeSystemsServices from './services';


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
        ...administrativeSystemsServices.services,
        ...administrativeSystemsGuards.guards
    ],
    declarations: [
        ...administrativeSystemsContainers.containers,
        ...administrativeSystemsComponents.components
    ],
    exports: [...administrativeSystemsContainers.containers, ...administrativeSystemsComponents.components],
    entryComponents: [...administrativeSystemsModalContainers.containers]
})
export class AdministrativeSystemsModule {}
