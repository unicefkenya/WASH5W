/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { LogicalStructuresModule } from './logical-structures.module';

/* Containers */
import * as logicalStructuresContainers from './containers';

/* Guards */
import * as logicalStructuresGuards from './guards';
import { SBRouteData } from '@modules/navigation/models';

/* Routes */
export const ROUTES: Routes = [ 
    {
        path: '',
        canActivate: [],
        component: logicalStructuresContainers.LogicalStructuresRecordsTabulationPageComponent,
        data: {
            title: 'Logical Structures',
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
    imports: [LogicalStructuresModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class LogicalStructuresRoutingModule {}
