/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { DissagregationsModule } from './dissagregations.module';

/* Containers */
import * as dissagregationsContainers from './containers';

/* Guards */
import * as dissagregationsGuards from './guards';
import { SBRouteData } from '@modules/navigation/models';

/* Routes */
export const ROUTES: Routes = [ 
    {
        path: '',
        canActivate: [],
        component: dissagregationsContainers.DissagregationsRecordsTabulationPageComponent,
        data: {
            title: 'Dissagregations',
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
    imports: [DissagregationsModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class DissagregationsRoutingModule {}
