/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { SystemsTasksModule } from './systems-tasks.module';

/* Containers */
import * as systemsTasksContainers from './containers';

/* Guards */
import * as systemsTasksGuards from './guards';
import { SBRouteData } from '@modules/navigation/models';

/* Routes */
export const ROUTES: Routes = [ 
    {
        path: '',
        canActivate: [],
        component: systemsTasksContainers.SystemsTasksRecordsTabulationPageComponent,
        data: {
            title: 'SystemsTasks',
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
    imports: [SystemsTasksModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class SystemsTasksRoutingModule {}
