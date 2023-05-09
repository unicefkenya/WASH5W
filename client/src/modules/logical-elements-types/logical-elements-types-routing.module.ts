/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { LogicalElementsTypesModule } from './logical-elements-types.module';

/* Containers */
import * as logicalElementsTypesContainers from './containers';

/* Guards */
import * as logicalElementsTypesGuards from './guards';
import { SBRouteData } from '@modules/navigation/models';

/* Routes */
export const ROUTES: Routes = [ 
    {
        path: '',
        canActivate: [],
        component: logicalElementsTypesContainers.LogicalElementsTypesRecordsTabulationPageComponent,
        data: {
            title: 'LogicalElementsTypes',
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
    imports: [LogicalElementsTypesModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class LogicalElementsTypesRoutingModule {}
