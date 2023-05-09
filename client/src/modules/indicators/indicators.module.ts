/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';
import { LogicalHierarchiesModule } from '@modules/logical-hierarchies/logical-hierarchies.module';
import { DataFormsElementsModule } from '@modules/data-forms-elements/data-forms-elements.module';
import { QuantitiesObservationsModule } from '@modules/quantities-observations/quantities-observations.module';

/* Components */
import * as indicatorsComponents from './components';


/* Containers */
import * as indicatorsContainers from './containers';
import * as indicatorsModalContainers from './containers/modals';

/* Guards */
import * as indicatorsGuards from './guards';

/* Services */
import * as indicatorsServices from './services';





@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        FormsModule,
        AppCommonModule,
        NavigationModule,
        LogicalHierarchiesModule,
        DataFormsElementsModule,
        QuantitiesObservationsModule
    ],
    providers: [
        DecimalPipe,
        ...indicatorsServices.services,
        ...indicatorsGuards.guards
    ],
    declarations: [
        ...indicatorsContainers.containers,
        ...indicatorsComponents.components
    ],
    exports: [...indicatorsContainers.containers, ...indicatorsComponents.components],
    entryComponents: [...indicatorsModalContainers.containers]
})
export class IndicatorsModule {}
