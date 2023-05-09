/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { QuantitiesObservationsModule } from './quantities-observations.module';

/* Containers */
import * as quantitiesObservationsContainers from './containers';

/* Guards */
import * as quantitiesObservationsGuards from './guards';
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
    imports: [QuantitiesObservationsModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class QuantitiesObservationsRoutingModule {}
