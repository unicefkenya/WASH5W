/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { SystemsUsersModule } from './systems-users.module';

/* Containers */
import * as systemsUsersContainers from './containers';

/* Guards */
import * as systemsUsersGuards from './guards';
import { SBRouteData } from '@modules/navigation/models';

/* Routes */
export const ROUTES: Routes = [ 
    {
        path: '',
        canActivate: [],
        component: systemsUsersContainers.SystemsUsersRecordsTabulationPageComponent,
        data: {
            title: 'SystemsUsers',
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
    imports: [SystemsUsersModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class SystemsUsersRoutingModule {}
