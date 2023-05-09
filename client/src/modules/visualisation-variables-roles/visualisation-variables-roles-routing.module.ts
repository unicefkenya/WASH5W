/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { VisualisationVariablesRolesModule } from './visualisation-variables-roles.module';

/* Containers */
import * as visualisationVariablesRolesContainers from './containers';

/* Guards */
import * as visualisationVariablesRolesGuards from './guards';
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
    imports: [VisualisationVariablesRolesModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class VisualisationVariablesRolesRoutingModule {}
