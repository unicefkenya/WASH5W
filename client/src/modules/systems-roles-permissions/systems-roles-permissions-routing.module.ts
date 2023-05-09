/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { SystemsRolesPermissionsModule } from './systems-roles-permissions.module';

/* Containers */
import * as systemsRolesPermissionsContainers from './containers';

/* Guards */
import * as systemsRolesPermissionsGuards from './guards';
import { SBRouteData } from '@modules/navigation/models';

/* Routes */
export const ROUTES: Routes = [ 
    {
        path: '',
        canActivate: [],
        component: systemsRolesPermissionsContainers.SystemsRolesPermissionsRecordsTabulationPageComponent,
        data: {
            title: 'Systems Roles Permissions',
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
    imports: [SystemsRolesPermissionsModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class SystemsRolesPermissionsRoutingModule {}
