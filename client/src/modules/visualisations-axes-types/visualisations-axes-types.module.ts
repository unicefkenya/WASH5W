/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';

/* Components */
import * as visualisationAxesTypesComponents from './components';


/* Containers */
import * as visualisationAxesTypesContainers from './containers';
import * as visualisationAxesTypesModalContainers from './containers/modals';

/* Guards */
import * as visualisationAxesTypesGuards from './guards';

/* Services */
import * as visualisationAxesTypesServices from './services';


@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        FormsModule,
        AppCommonModule,
        NavigationModule
    ],
    providers: [
        DecimalPipe,
        ...visualisationAxesTypesServices.services,
        ...visualisationAxesTypesGuards.guards
    ],
    declarations: [
        ...visualisationAxesTypesContainers.containers,
        ...visualisationAxesTypesComponents.components
    ],
    exports: [...visualisationAxesTypesContainers.containers, ...visualisationAxesTypesComponents.components],
    entryComponents: [...visualisationAxesTypesModalContainers.containers]
})
export class VisualisationsAxesTypesModule {}
