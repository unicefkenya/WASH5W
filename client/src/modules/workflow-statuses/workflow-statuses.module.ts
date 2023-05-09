/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';

/* Components */
import * as workflowStatusesComponents from './components';


/* Containers */
import * as workflowStatusesContainers from './containers';
import * as workflowStatusesModalContainers from './containers/modals';

/* Guards */
import * as workflowStatusesGuards from './guards';

/* Services */
import * as workflowStatusesServices from './services';


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
        ...workflowStatusesServices.services,
        ...workflowStatusesGuards.guards
    ],
    declarations: [
        ...workflowStatusesContainers.containers,
        ...workflowStatusesComponents.components
    ],
    exports: [...workflowStatusesContainers.containers, ...workflowStatusesComponents.components],
    entryComponents: [...workflowStatusesModalContainers.containers]
})
export class WorkflowStatusesModule {}
