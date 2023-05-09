/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';
import { LogicalElementsTypesModule } from '@modules/logical-elements-types/logical-elements-types.module';
import { LogicalSchemesModule } from '@modules/logical-schemes/logical-schemes.module';
import { LogicalElementsModule } from '@modules/logical-elements/logical-elements.module';

/* Components */
import * as logicalHierarchiesComponents from './components';


/* Containers */
import * as logicalHierarchiesContainers from './containers';
import * as logicalHierarchiesModalContainers from './containers/modals';

/* Guards */
import * as logicalHierarchiesGuards from './guards';

/* Services */
import * as logicalHierarchiesServices from './services';



@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        FormsModule,
        AppCommonModule,
        NavigationModule,
        LogicalElementsTypesModule,
        LogicalSchemesModule,
        LogicalElementsModule
    ],
    providers: [
        DecimalPipe,
        ...logicalHierarchiesServices.services,
        ...logicalHierarchiesGuards.guards
    ],
    declarations: [
        ...logicalHierarchiesContainers.containers,
        ...logicalHierarchiesComponents.components
    ],
    exports: [...logicalHierarchiesContainers.containers, ...logicalHierarchiesComponents.components],
    entryComponents: [...logicalHierarchiesModalContainers.containers]
})
export class LogicalHierarchiesModule {}
