/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { LogicalHierarchiesModule } from './logical-hierarchies.module';

/* Containers */
import * as logicalHierarchiesContainers from './containers';

/* Guards */
import * as logicalHierarchiesGuards from './guards';
import { SBRouteData } from '@modules/navigation/models';

/* Routes */
export const ROUTES: Routes = [ 
    {
        path: '',
        canActivate: [],
        component: logicalHierarchiesContainers.LogicalHierarchiesRecordsTabulationPageComponent,
        data: {
            title: 'Logical Hierarchies',
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
    imports: [LogicalHierarchiesModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class LogicalHierarchiesRoutingModule {}
