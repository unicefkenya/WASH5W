/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { AdministrativeUnitsTypesModule } from './administrative-units-types.module';

/* Containers */
import * as administrativeUnitsTypesContainers from './containers';

/* Guards */
import * as administrativeUnitsTypesGuards from './guards';
import { SBRouteData } from '@modules/navigation/models';

/* Routes */
export const ROUTES: Routes = [ 
    {
        path: '',
        canActivate: [],
        component: administrativeUnitsTypesContainers.AdministrativeUnitsTypesRecordsTabulationPageComponent,
        data: {
            title: 'AdministrativeUnitsTypes',
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
    imports: [AdministrativeUnitsTypesModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class AdministrativeUnitsTypesRoutingModule {}
