/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { DataFormsElementsModule } from './data-forms-elements.module';

/* Containers */
import * as dataFormsElementsContainers from './containers';

/* Guards */
import * as dataFormsElementsGuards from './guards';
import { SBRouteData } from '@modules/navigation/models';
import { AuthGuard } from '@modules/auth/guards/auth.guard';

/* Routes */
export const ROUTES: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: '/designs',
    },   
    {
        path: 'designs',
        canActivate: [],
        component: dataFormsElementsContainers.DataFormsElementsConfigurationViewsTabulationPageComponent,
        data: {
            title: 'Data Forms Design',
            breadcrumbs: [],
        } as SBRouteData,
    },
    {
        path: 'designs_previews',
        canActivate: [],
        component: dataFormsElementsContainers.DataFormsElementsResponseViewsTabulationPageComponent,
        data: {
            title: 'Data Forms Previews',
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
    imports: [DataFormsElementsModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class DataFormsElementsRoutingModule { }
