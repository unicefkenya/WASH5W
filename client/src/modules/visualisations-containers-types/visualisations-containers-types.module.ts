/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';

/* Components */
import * as visualisationsContainersTypesComponents from './components';


/* Containers */
import * as visualisationsContainersTypesContainers from './containers';
import * as visualisationsContainersTypesModalContainers from './containers/modals';

/* Guards */
import * as visualisationsContainersTypesGuards from './guards';

/* Services */
import * as visualisationsContainersTypesServices from './services';


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
        ...visualisationsContainersTypesServices.services,
        ...visualisationsContainersTypesGuards.guards
    ],
    declarations: [
        ...visualisationsContainersTypesContainers.containers,
        ...visualisationsContainersTypesComponents.components
    ],
    exports: [...visualisationsContainersTypesContainers.containers, ...visualisationsContainersTypesComponents.components],
    entryComponents: [...visualisationsContainersTypesModalContainers.containers]
})
export class VisualisationsContainersTypesModule {}
