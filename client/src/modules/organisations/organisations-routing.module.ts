/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { OrganisationsModule } from './organisations.module';

/* Containers */
import * as organisationsContainers from './containers';

/* Guards */
import * as organisationsGuards from './guards';
import { SBRouteData } from '@modules/navigation/models';

/* Routes */
export const ROUTES: Routes = [ 
    {
        path: '',
        canActivate: [],
        component: organisationsContainers.OrganisationsRecordsTabulationPageComponent,
        data: {
            title: 'Organisations',
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
    imports: [OrganisationsModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class OrganisationsRoutingModule {}
