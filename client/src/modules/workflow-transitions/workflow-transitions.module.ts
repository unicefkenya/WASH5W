/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';
import { SystemsModulesPermissionsModule } from '@modules/systems-modules-permissions/systems-modules-permissions.module';
import { WorkflowsModule } from '@modules/workflows/workflows.module';
import { WorkflowStatusesModule } from '@modules/workflow-statuses/workflow-statuses.module';

/* Components */
import * as workflowTransitionsComponents from './components';


/* Containers */
import * as workflowTransitionsContainers from './containers';
import * as workflowTransitionsModalContainers from './containers/modals';

/* Guards */
import * as workflowTransitionsGuards from './guards';

/* Services */
import * as workflowTransitionsServices from './services';



@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        FormsModule,
        AppCommonModule,
        NavigationModule,
        WorkflowStatusesModule,
        SystemsModulesPermissionsModule,
        WorkflowsModule,
        WorkflowStatusesModule
    ],
    providers: [
        DecimalPipe,
        ...workflowTransitionsServices.services,
        ...workflowTransitionsGuards.guards
    ],
    declarations: [
        ...workflowTransitionsContainers.containers,
        ...workflowTransitionsComponents.components
    ],
    exports: [...workflowTransitionsContainers.containers, ...workflowTransitionsComponents.components],
    entryComponents: [...workflowTransitionsModalContainers.containers]
})
export class WorkflowTransitionsModule {}
