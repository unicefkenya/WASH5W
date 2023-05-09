/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { WorkflowStatusesModule } from './workflow-statuses.module';

/* Containers */
import * as workflowStatusesContainers from './containers';

/* Guards */
import * as workflowStatusesGuards from './guards';
import { SBRouteData } from '@modules/navigation/models';

/* Routes */
export const ROUTES: Routes = [ 
    {
        path: '',
        canActivate: [],
        component: workflowStatusesContainers.WorkflowStatusesRecordsTabulationPageComponent,
        data: {
            title: 'WorkflowStatuses',
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
    imports: [WorkflowStatusesModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class WorkflowStatusesRoutingModule {}
