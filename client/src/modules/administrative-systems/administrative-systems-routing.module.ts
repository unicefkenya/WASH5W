/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { AdministrativeSystemsModule } from './administrative-systems.module';

/* Containers */
import * as administrativeSystemsContainers from './containers';

/* Guards */
import * as administrativeSystemsGuards from './guards';
import { SBRouteData } from '@modules/navigation/models';

/* Routes */
export const ROUTES: Routes = [ 
    {
        path: '',
        canActivate: [],
        component: administrativeSystemsContainers.AdministrativeSystemsRecordsTabulationPageComponent,
        data: {
            title: 'AdministrativeSystems',
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
    imports: [AdministrativeSystemsModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class AdministrativeSystemsRoutingModule {}
