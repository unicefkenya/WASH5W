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
import * as quantitiesObservationsComponents from './components';


/* Containers */
import * as quantitiesObservationsContainers from './containers';
import * as quantitiesObservationsModalContainers from './containers/modals';

/* Guards */
import * as quantitiesObservationsGuards from './guards';

/* Services */
import * as quantitiesObservationsServices from './services';



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
        ...quantitiesObservationsServices.services,
        ...quantitiesObservationsGuards.guards
    ],
    declarations: [
        ...quantitiesObservationsContainers.containers,
        ...quantitiesObservationsComponents.components
    ],
    exports: [...quantitiesObservationsContainers.containers, ...quantitiesObservationsComponents.components],
    entryComponents: [...quantitiesObservationsModalContainers.containers]
})
export class QuantitiesObservationsModule {}
