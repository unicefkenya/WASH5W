/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';

/* Components */
import * as logicalElementsComponents from './components';


/* Containers */
import * as logicalElementsContainers from './containers';
import * as logicalElementsModalContainers from './containers/modals';

/* Guards */
import * as logicalElementsGuards from './guards';

/* Services */
import * as logicalElementsServices from './services';



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
        ...logicalElementsServices.services,
        ...logicalElementsGuards.guards
    ],
    declarations: [
        ...logicalElementsContainers.containers,
        ...logicalElementsComponents.components
    ],
    exports: [...logicalElementsContainers.containers, ...logicalElementsComponents.components],
    entryComponents: [...logicalElementsModalContainers.containers]
})
export class LogicalElementsModule {}
