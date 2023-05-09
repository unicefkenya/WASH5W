/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { SystemsRolesModule } from './systems-roles.module';

/* Containers */
import * as systemsRolesContainers from './containers';

/* Guards */
import * as systemsRolesGuards from './guards';
import { SBRouteData } from '@modules/navigation/models';

/* Routes */
export const ROUTES: Routes = [ 
    {
        path: '',
        canActivate: [],
        component: systemsRolesContainers.SystemsRolesRecordsTabulationPageComponent,
        data: {
            title: 'SystemsRoles',
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
    imports: [SystemsRolesModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class SystemsRolesRoutingModule {}
