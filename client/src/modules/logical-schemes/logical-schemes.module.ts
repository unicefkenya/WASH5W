/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';

/* Components */
import * as logicalSchemesComponents from './components';


/* Containers */
import * as logicalSchemesContainers from './containers';
import * as logicalSchemesModalContainers from './containers/modals';

/* Guards */
import * as logicalSchemesGuards from './guards';

/* Services */
import * as logicalSchemesServices from './services';


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
        ...logicalSchemesServices.services,
        ...logicalSchemesGuards.guards
    ],
    declarations: [
        ...logicalSchemesContainers.containers,
        ...logicalSchemesComponents.components
    ],
    exports: [...logicalSchemesContainers.containers, ...logicalSchemesComponents.components],
    entryComponents: [...logicalSchemesModalContainers.containers]
})
export class LogicalSchemesModule {}
