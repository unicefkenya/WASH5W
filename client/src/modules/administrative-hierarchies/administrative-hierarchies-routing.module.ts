/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { AdministrativeHierarchiesModule } from './administrative-hierarchies.module';

/* Containers */
import * as administrativeHierarchiesContainers from './containers';

/* Guards */
import * as administrativeHierarchiesGuards from './guards';
import { SBRouteData } from '@modules/navigation/models';

/* Routes */
export const ROUTES: Routes = [ 
    {
        path: '',
        canActivate: [],
        component: administrativeHierarchiesContainers.AdministrativeHierarchiesRecordsTabulationPageComponent,
        data: {
            title: 'Administrative Hierarchies',
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
    imports: [AdministrativeHierarchiesModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class AdministrativeHierarchiesRoutingModule {}
