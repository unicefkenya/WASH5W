/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { SystemsUsersAccountsModule } from './systems-users-accounts.module';

/* Containers */
import * as systemUsersAccountsContainers from './containers';

/* Guards */
import * as systemUsersAccountsGuards from './guards';
import { SBRouteData } from '@modules/navigation/models';

/* Routes */
export const ROUTES: Routes = [ 
    {
        path: '**',
        pathMatch: 'full',
        loadChildren: () =>
            import('modules/error/error-routing.module').then(m => m.ErrorRoutingModule),
    }           
];



@NgModule({
    imports: [SystemsUsersAccountsModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class SystemsUsersAccountsRoutingModule {}
