/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { WorkflowsModule } from './workflows.module';

/* Containers */
import * as workflowsContainers from './containers';

/* Guards */
import * as workflowsGuards from './guards';
import { SBRouteData } from '@modules/navigation/models';

/* Routes */
export const ROUTES: Routes = [ 
    {
        path: '',
        canActivate: [],
        component: workflowsContainers.WorkflowsRecordsTabulationPageComponent,
        data: {
            title: 'Workflows',
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
    imports: [WorkflowsModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class WorkflowsRoutingModule {}
