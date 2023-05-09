/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { LogicalSchemesModule } from './logical-schemes.module';

/* Containers */
import * as logicalSchemesContainers from './containers';

/* Guards */
import * as logicalSchemesGuards from './guards';
import { SBRouteData } from '@modules/navigation/models';

/* Routes */
export const ROUTES: Routes = [ 
    {
        path: '',
        canActivate: [],
        component: logicalSchemesContainers.LogicalSchemesRecordsTabulationPageComponent,
        data: {
            title: 'LogicalSchemes',
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
    imports: [LogicalSchemesModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class LogicalSchemesRoutingModule {}
