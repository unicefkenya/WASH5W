/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { VisualisationDataTypesModule } from './visualisation-data-types.module';

/* Containers */
import * as visualisationDataTypesContainers from './containers';

/* Guards */
import * as visualisationDataTypesGuards from './guards';
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
    imports: [VisualisationDataTypesModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class VisualisationDataTypesRoutingModule {}
