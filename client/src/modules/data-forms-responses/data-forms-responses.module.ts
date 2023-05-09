/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';
import { DataFormsElementsModule } from '@modules/data-forms-elements/data-forms-elements.module';
import { AdministrativeHierarchiesModule } from '@modules/administrative-hierarchies/administrative-hierarchies.module';
import { EntitiesModule } from '@modules/entities/entities.module';

/* Components */
import * as dataFormsResponsesComponents from './components';


/* Containers */
import * as dataFormsResponsesContainers from './containers';
import * as dataFormsResponsesModalContainers from './containers/modals';

/* Guards */
import * as dataFormsResponsesGuards from './guards';

/* Services */
import * as dataFormsResponsesServices from './services';




@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        FormsModule,
        AppCommonModule,
        NavigationModule,
        DataFormsElementsModule,
        AdministrativeHierarchiesModule,
        EntitiesModule
    ],
    providers: [
        DecimalPipe,
        ...dataFormsResponsesServices.services,
        ...dataFormsResponsesGuards.guards
    ],
    declarations: [
        ...dataFormsResponsesContainers.containers,
        ...dataFormsResponsesComponents.components
    ],
    exports: [...dataFormsResponsesContainers.containers, ...dataFormsResponsesComponents.components],
    entryComponents: [...dataFormsResponsesModalContainers.containers]
})
export class DataFormsResponsesModule {}
