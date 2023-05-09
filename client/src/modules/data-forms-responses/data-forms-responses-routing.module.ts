/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { DataFormsResponsesModule } from './data-forms-responses.module';

/* Containers */
import * as dataFormsResponsesContainers from './containers';

/* Guards */
import * as dataFormsResponsesGuards from './guards';
import { SBRouteData } from '@modules/navigation/models';

/* Routes */
export const ROUTES: Routes = [ 
    {
        path: '',
        canActivate: [],
        component: dataFormsResponsesContainers.DataFormsResponsesRecordsParentTabulationPageComponent,
        data: {
            title: 'DataFormsResponses',
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
    imports: [DataFormsResponsesModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class DataFormsResponsesRoutingModule {}
