/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';

/* Components */
import * as dataFormsElementTypesComponents from './components';


/* Containers */
import * as dataFormsElementTypesContainers from './containers';
import * as dataFormsElementTypesModalContainers from './containers/modals';

/* Guards */
import * as dataFormsElementTypesGuards from './guards';

/* Services */
import * as dataFormsElementTypesServices from './services';


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
        ...dataFormsElementTypesServices.services,
        ...dataFormsElementTypesGuards.guards
    ],
    declarations: [
        ...dataFormsElementTypesContainers.containers,
        ...dataFormsElementTypesComponents.components
    ],
    exports: [...dataFormsElementTypesContainers.containers, ...dataFormsElementTypesComponents.components],
    entryComponents: [...dataFormsElementTypesModalContainers.containers]
})
export class DataFormsElementsTypesModule {}
