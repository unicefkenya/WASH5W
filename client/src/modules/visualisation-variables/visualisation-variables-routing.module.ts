/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { VisualisationVariablesModule } from './visualisation-variables.module';

/* Containers */
import * as visualisationVariablesContainers from './containers';

/* Guards */
import * as visualisationVariablesGuards from './guards';
import { SBRouteData } from '@modules/navigation/models';

/* Routes */
export const ROUTES: Routes = [ 
    {
        path: '',
        canActivate: [],
        component: visualisationVariablesContainers.VisualisationVariablesRecordsTabulationPageComponent,
        data: {
            title: 'Visualisation Variables',
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
    imports: [VisualisationVariablesModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class VisualisationVariablesRoutingModule {}
