/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';

/* Components */
import * as logicalElementsTypesComponents from './components';


/* Containers */
import * as logicalElementsTypesContainers from './containers';
import * as logicalElementsTypesModalContainers from './containers/modals';

/* Guards */
import * as logicalElementsTypesGuards from './guards';

/* Services */
import * as logicalElementsTypesServices from './services';


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
        ...logicalElementsTypesServices.services,
        ...logicalElementsTypesGuards.guards
    ],
    declarations: [
        ...logicalElementsTypesContainers.containers,
        ...logicalElementsTypesComponents.components
    ],
    exports: [...logicalElementsTypesContainers.containers, ...logicalElementsTypesComponents.components],
    entryComponents: [...logicalElementsTypesModalContainers.containers]
})
export class LogicalElementsTypesModule {}
