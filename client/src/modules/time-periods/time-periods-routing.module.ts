/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { TimePeriodsModule } from './time-periods.module';

/* Containers */
import * as timePeriodsContainers from './containers';

/* Guards */
import * as timePeriodsGuards from './guards';
import { SBRouteData } from '@modules/navigation/models';

/* Routes */
export const ROUTES: Routes = [ 
    {
        path: '',
        canActivate: [],
        component: timePeriodsContainers.TimePeriodsRecordsTabulationPageComponent,
        data: {
            title: 'TimePeriods',
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
    imports: [TimePeriodsModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class TimePeriodsRoutingModule {}
