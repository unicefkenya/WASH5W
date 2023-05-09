/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { OperatorsModule } from './operators.module';

/* Containers */
import * as operatorsContainers from './containers';

/* Guards */
import * as operatorsGuards from './guards';
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
    imports: [OperatorsModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class OperatorsRoutingModule {}
