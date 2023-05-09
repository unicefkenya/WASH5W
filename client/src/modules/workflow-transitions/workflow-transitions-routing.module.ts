/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { WorkflowTransitionsModule } from './workflow-transitions.module';

/* Containers */
import * as workflowTransitionsContainers from './containers';

/* Guards */
import * as workflowTransitionsGuards from './guards';
import { SBRouteData } from '@modules/navigation/models';

/* Routes */
export const ROUTES: Routes = [ 
    {
        path: '',
        canActivate: [],
        component: workflowTransitionsContainers.WorkflowTransitionsRecordsTabulationPageComponent,
        data: {
            title: 'Workflow Transitions',
            breadcrumbs: [],
        } as SBRouteData,
    },
    {
        path: '**',
        pathMatch: 'full',
        loadChildren: () =>
            import('modules/error/error-routing.module').then(m => m.ErrorRoutingModule),
    }           
];



@NgModule({
    imports: [WorkflowTransitionsModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class WorkflowTransitionsRoutingModule {}
