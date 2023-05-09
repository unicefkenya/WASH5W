/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { VisualisationAxesModule } from './visualisation-axes.module';

/* Containers */
import * as visualisationAxesContainers from './containers';

/* Guards */
import * as visualisationAxesGuards from './guards';
import { SBRouteData } from '@modules/navigation/models';

/* Routes */
export const ROUTES: Routes = [ 
    {
        path: '',
        canActivate: [],
        component: visualisationAxesContainers.VisualisationAxesRecordsTabulationPageComponent,
        data: {
            title: 'Visualisation Axes',
            breadcrumbs: [],
        } as SBRouteData,
    },
    {
        path: '**',
        pathMatch: 'full',
        loadChildren: () =>
            import('modules/error/error-routing.module').then(m => m.ErrorRoutingModule),
    }           
];



@NgModule({
    imports: [VisualisationAxesModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class VisualisationAxesRoutingModule {}
