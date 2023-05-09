/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { EntitiesModule } from './entities.module';

/* Containers */
import * as entitiesContainers from './containers';

/* Guards */
import * as entitiesGuards from './guards';
import { SBRouteData } from '@modules/navigation/models';

/* Routes */
export const ROUTES: Routes = [ 
    {
        path: '',
        canActivate: [],
        component: entitiesContainers.EntitiesRecordsTabulationPageComponent,
        data: {
            title: 'Entities',
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
    imports: [EntitiesModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class EntitiesRoutingModule {}
