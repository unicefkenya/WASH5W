/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { ContextsModule } from './contexts.module';

/* Containers */
import * as contextsContainers from './containers';

/* Guards */
import * as contextsGuards from './guards';
import { SBRouteData } from '@modules/navigation/models';

/* Routes */
export const ROUTES: Routes = [ 
    {
        path: '',
        canActivate: [],
        component: contextsContainers.ContextsRecordsTabulationPageComponent,
        data: {
            title: 'Contexts',
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
    imports: [ContextsModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class ContextsRoutingModule {}
