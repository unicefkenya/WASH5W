/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { OptionsModule } from './options.module';

/* Containers */
import * as optionsContainers from './containers';

/* Guards */
import * as optionsGuards from './guards';
import { SBRouteData } from '@modules/navigation/models';

/* Routes */
export const ROUTES: Routes = [ 
    {
        path: '',
        canActivate: [],
        component: optionsContainers.OptionsRecordsTabulationPageComponent,
        data: {
            title: 'Options',
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
    imports: [OptionsModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class OptionsRoutingModule {}
