/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { ScopesTypesModule } from './scopes-types.module';

/* Containers */
import * as scopesTypesContainers from './containers';

/* Guards */
import * as scopesTypesGuards from './guards';
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
    imports: [ScopesTypesModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class ScopesTypesRoutingModule {}
