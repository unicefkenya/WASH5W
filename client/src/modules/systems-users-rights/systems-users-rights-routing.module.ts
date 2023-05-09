/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { SystemsUsersRightsModule } from './systems-users-rights.module';

/* Containers */
import * as systemsUsersRightsContainers from './containers';

/* Guards */
import * as systemsUsersRightsGuards from './guards';
import { SBRouteData } from '@modules/navigation/models';

/* Routes */
export const ROUTES: Routes = [ 
    {
        path: '',
        canActivate: [],
        component: systemsUsersRightsContainers.SystemsUsersRightsRecordsTabulationPageComponent,
        data: {
            title: 'SystemsUsersRights',
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
    imports: [SystemsUsersRightsModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class SystemsUsersRightsRoutingModule {}
