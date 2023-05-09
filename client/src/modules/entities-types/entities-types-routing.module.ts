/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { EntitiesTypesModule } from './entities-types.module';

/* Containers */
import * as entitiesTypesContainers from './containers';

/* Guards */
import * as entitiesTypesGuards from './guards';
import { SBRouteData } from '@modules/navigation/models';

/* Routes */
export const ROUTES: Routes = [ 
    {
        path: '',
        canActivate: [],
        component: entitiesTypesContainers.EntitiesTypesRecordsTabulationPageComponent,
        data: {
            title: 'Entities Types',
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
    imports: [EntitiesTypesModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class EntitiesTypesRoutingModule {}
