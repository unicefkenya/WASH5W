/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { DashboardsModule } from './dashboards.module';

/* Containers */
import * as dashboardsContainers from './containers';

/* Guards */
import * as dashboardsGuards from './guards';
import { SBRouteData } from '@modules/navigation/models';

/* Routes */
export const ROUTES: Routes = [ 
    {
        path: '',
        canActivate: [],
        component: dashboardsContainers.DashboardHomePageComponent,
        data: {
            title: 'Dashboards',
            breadcrumbs: [
            ],
        } as SBRouteData,
    }   
];

@NgModule({
    imports: [DashboardsModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class DashboardsRoutingModule {}
