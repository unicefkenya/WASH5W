/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';
import { OptionsModule } from '@modules/options/options.module';
import { DataFormsElementsTypesModule } from '@modules/data-forms-elements-types/data-forms-elements-types.module';

/* Components */
import * as dataFormsElementsComponents from './components';


/* Containers */
import * as dataFormsElementsContainers from './containers';
import * as dataFormsElementsModalContainers from './containers/modals';

/* Guards */
import * as dataFormsElementsGuards from './guards';

/* Services */
import * as dataFormsElementsServices from './services';


@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        FormsModule,
        AppCommonModule,
        NavigationModule,
        OptionsModule,
        DataFormsElementsTypesModule
    ],
    providers: [
        DecimalPipe,
        ...dataFormsElementsServices.services,
        ...dataFormsElementsGuards.guards
    ],
    declarations: [
        ...dataFormsElementsContainers.containers,
        ...dataFormsElementsComponents.components
    ],
    exports: [...dataFormsElementsContainers.containers, ...dataFormsElementsComponents.components],
    entryComponents: [...dataFormsElementsModalContainers.containers]
})
export class DataFormsElementsModule {}
