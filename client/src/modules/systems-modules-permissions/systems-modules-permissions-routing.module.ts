/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { SystemsModulesPermissionsModule } from './systems-modules-permissions.module';

/* Containers */
import * as systemsModulesPermissionsContainers from './containers';

/* Guards */
import * as systemsModulesPermissionsGuards from './guards';
import { SBRouteData } from '@modules/navigation/models';

/* Routes */
export const ROUTES: Routes = [ 
    {
        path: '',
        canActivate: [],
        component: systemsModulesPermissionsContainers.SystemsModulesPermissionsRecordsTabulationPageComponent,
        data: {
            title: 'Systems Modules Permissions',
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
    imports: [SystemsModulesPermissionsModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class SystemsModulesPermissionsRoutingModule {}
