/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { OptionsTypesModule } from './options-types.module';

/* Containers */
import * as optionsTypesContainers from './containers';

/* Guards */
import * as optionsTypesGuards from './guards';
import { SBRouteData } from '@modules/navigation/models';

/* Routes */
export const ROUTES: Routes = [ 
    {
        path: '',
        canActivate: [],
        component: optionsTypesContainers.OptionsTypesRecordsTabulationPageComponent,
        data: {
            title: 'OptionsTypes',
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
    imports: [OptionsTypesModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class OptionsTypesRoutingModule {}
