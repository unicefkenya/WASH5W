/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';
import { IndicatorsModule } from '@modules/indicators/indicators.module';

/* Components */
import * as visualisationVariablesComponents from './components';


/* Containers */
import * as visualisationVariablesContainers from './containers';
import * as visualisationVariablesModalContainers from './containers/modals';

/* Guards */
import * as visualisationVariablesGuards from './guards';

/* Services */
import * as visualisationVariablesServices from './services';




@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        FormsModule,
        AppCommonModule,
        NavigationModule,
        IndicatorsModule
    ],
    providers: [
        DecimalPipe,
        ...visualisationVariablesServices.services,
        ...visualisationVariablesGuards.guards
    ],
    declarations: [
        ...visualisationVariablesContainers.containers,
        ...visualisationVariablesComponents.components
    ],
    exports: [...visualisationVariablesContainers.containers, ...visualisationVariablesComponents.components],
    entryComponents: [...visualisationVariablesModalContainers.containers]
})
export class VisualisationVariablesModule {}
