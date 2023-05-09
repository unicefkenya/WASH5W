/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { VisualisationsTypesModule } from './visualisations-types.module';

/* Containers */
import * as visualisationsTypesContainers from './containers';

/* Guards */
import * as visualisationsTypesGuards from './guards';
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
    imports: [VisualisationsTypesModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class VisualisationsAxesRoutingModule {}
