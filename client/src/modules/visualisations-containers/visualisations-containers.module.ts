/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';
import { VisualisationsModule } from '@modules/visualisations/visualisations.module';
import { VisualisationVariablesModule } from '@modules/visualisation-variables/visualisation-variables.module';
import { VisualisationAxesModule } from '@modules/visualisation-axes/visualisation-axes.module';

/* Components */
import * as visualisationsContainersComponents from './components';


/* Containers */
import * as visualisationsContainersContainers from './containers';
import * as visualisationsContainersModalContainers from './containers/modals';

/* Guards */
import * as visualisationsContainersGuards from './guards';

/* Services */
import * as visualisationsContainersServices from './services';


@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        FormsModule,
        AppCommonModule,
        NavigationModule,
        VisualisationsModule,
        VisualisationVariablesModule,
        VisualisationAxesModule
    ],
    providers: [
        DecimalPipe,
        ...visualisationsContainersServices.services,
        ...visualisationsContainersGuards.guards
    ],
    declarations: [
        ...visualisationsContainersContainers.containers,
        ...visualisationsContainersComponents.components
    ],
    exports: [...visualisationsContainersContainers.containers, ...visualisationsContainersComponents.components],
    entryComponents: [...visualisationsContainersModalContainers.containers]
})
export class VisualisationsContainersModule {}
