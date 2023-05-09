/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { DissagregationsSchemesModule } from './dissagregations-schemes.module';

/* Containers */
import * as dissagregationsSchemesContainers from './containers';

/* Guards */
import * as dissagregationsSchemesGuards from './guards';
import { SBRouteData } from '@modules/navigation/models';

/* Routes */
export const ROUTES: Routes = [ 
    {
        path: '',
        canActivate: [],
        component: dissagregationsSchemesContainers.DissagregationsSchemesRecordsTabulationPageComponent,
        data: {
            title: 'DissagregationsSchemes',
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
    imports: [DissagregationsSchemesModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class DissagregationsSchemesRoutingModule {}
