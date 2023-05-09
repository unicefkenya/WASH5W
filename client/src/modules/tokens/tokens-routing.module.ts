/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { UnitsModule } from './tokens.module';

/* Containers */
import * as tokenContainers from './containers';

/* Guards */
import * as tokensGuards from './guards';
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
    imports: [UnitsModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class UnitsRoutingModule {}
