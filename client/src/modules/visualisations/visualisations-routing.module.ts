/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { VisualisationsModule } from './visualisations.module';

/* Containers */
import * as visualisationsContainers from './containers';

/* Guards */
import * as visualisationsGuards from './guards';
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
    imports: [VisualisationsModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class VisualisationsRoutingModule {}
