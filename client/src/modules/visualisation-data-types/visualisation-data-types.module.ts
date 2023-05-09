/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';

/* Components */
import * as visualisationDataTypesComponents from './components';


/* Containers */
import * as visualisationDataTypesContainers from './containers';
import * as visualisationDataTypesModalContainers from './containers/modals';

/* Guards */
import * as visualisationDataTypesGuards from './guards';

/* Services */
import * as visualisationDataTypesServices from './services';


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
        ...visualisationDataTypesServices.services,
        ...visualisationDataTypesGuards.guards
    ],
    declarations: [
        ...visualisationDataTypesContainers.containers,
        ...visualisationDataTypesComponents.components
    ],
    exports: [...visualisationDataTypesContainers.containers, ...visualisationDataTypesComponents.components],
    entryComponents: [...visualisationDataTypesModalContainers.containers]
})
export class VisualisationDataTypesModule {}
