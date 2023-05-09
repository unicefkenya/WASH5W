/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { VisualisationsContainersModule } from './visualisations-containers.module';

/* Containers */
import * as visualisationsContainersContainers from './containers';

/* Guards */
import * as visualisationsContainersGuards from './guards';
import { SBRouteData } from '@modules/navigation/models';

/* Routes */
export const ROUTES: Routes = [ 
    {
        path: '',
        canActivate: [],
        component: visualisationsContainersContainers.VisualisationsContainersRecordsParentTabulationPageComponent,
        data: {
            title: 'VisualisationsContainers',
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
    imports: [VisualisationsContainersModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class VisualisationsContainersRoutingModule {}
