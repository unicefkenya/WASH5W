/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { VisualisationsContainersTypesModule } from './visualisations-containers-types.module';

/* Containers */
import * as visualisationsContainersTypesContainers from './containers';

/* Guards */
import * as visualisationsContainersTypesGuards from './guards';
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
    imports: [VisualisationsContainersTypesModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class VisualisationContainersRoutingModule {}
