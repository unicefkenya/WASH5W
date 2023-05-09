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

/* Components */
import * as logicalStructuresComponents from './components';


/* Containers */
import * as logicalStructuresContainers from './containers';
import * as logicalStructuresModalContainers from './containers/modals';

/* Guards */
import * as logicalStructuresGuards from './guards';

/* Services */
import * as logicalStructuresServices from './services';


@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        FormsModule,
        AppCommonModule,
        NavigationModule,
        LogicalElementsTypesModule,
        LogicalSchemesModule
    ],
    providers: [
        DecimalPipe,
        ...logicalStructuresServices.services,
        ...logicalStructuresGuards.guards
    ],
    declarations: [
        ...logicalStructuresContainers.containers,
        ...logicalStructuresComponents.components
    ],
    exports: [...logicalStructuresContainers.containers, ...logicalStructuresComponents.components],
    entryComponents: [...logicalStructuresModalContainers.containers]
})
export class LogicalStructuresModule {}
