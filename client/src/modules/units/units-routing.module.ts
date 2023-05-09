/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { UnitsModule } from './units.module';

/* Containers */
import * as unitsContainers from './containers';

/* Guards */
import * as unitsGuards from './guards';
import { SBRouteData } from '@modules/navigation/models';

/* Routes */
export const ROUTES: Routes = [ 
    {
        path: '',
        canActivate: [],
        component: unitsContainers.UnitsRecordsTabulationPageComponent,
        data: {
            title: 'Units',
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
    imports: [UnitsModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class UnitsRoutingModule {}
