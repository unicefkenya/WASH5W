/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';

/* Components */
import * as workflowsComponents from './components';


/* Containers */
import * as workflowsContainers from './containers';
import * as workflowsModalContainers from './containers/modals';

/* Guards */
import * as workflowsGuards from './guards';

/* Services */
import * as workflowsServices from './services';


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
        ...workflowsServices.services,
        ...workflowsGuards.guards
    ],
    declarations: [
        ...workflowsContainers.containers,
        ...workflowsComponents.components
    ],
    exports: [...workflowsContainers.containers, ...workflowsComponents.components],
    entryComponents: [...workflowsModalContainers.containers]
})
export class WorkflowsModule {}
