/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { OrganisationsTypesModule } from './organisations-types.module';

/* Containers */
import * as organisationsTypesContainers from './containers';

/* Guards */
import * as organisationsTypesGuards from './guards';
import { SBRouteData } from '@modules/navigation/models';

/* Routes */
export const ROUTES: Routes = [ 
    {
        path: '',
        canActivate: [],
        component: organisationsTypesContainers.OrganisationsTypesRecordsTabulationPageComponent,
        data: {
            title: 'OrganisationsTypes',
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
    imports: [OrganisationsTypesModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class OrganisationsTypesRoutingModule {}
