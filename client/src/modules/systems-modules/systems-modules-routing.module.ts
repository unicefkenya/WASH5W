/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { SystemsModulesModule } from './systems-modules.module';

/* Containers */
import * as systemsModulesContainers from './containers';

/* Guards */
import * as systemsModulesGuards from './guards';
import { SBRouteData } from '@modules/navigation/models';

/* Routes */
export const ROUTES: Routes = [ 
    {
        path: '',
        canActivate: [],
        component: systemsModulesContainers.SystemsModulesRecordsTabulationPageComponent,
        data: {
            title: 'SystemsModules',
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
    imports: [SystemsModulesModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class SystemsModulesRoutingModule {}
