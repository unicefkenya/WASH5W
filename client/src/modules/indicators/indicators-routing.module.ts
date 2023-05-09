/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { IndicatorsModule } from './indicators.module';

/* Containers */
import * as indicatorsContainers from './containers';

/* Guards */
import * as indicatorsGuards from './guards';
import { SBRouteData } from '@modules/navigation/models';

/* Routes */
export const ROUTES: Routes = [ 
    {
        path: '',
        canActivate: [],
        component: indicatorsContainers.IndicatorsRecordsTabulationPageComponent,
        data: {
            title: 'Indicators',
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
    imports: [IndicatorsModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class IndicatorsRoutingModule {}
