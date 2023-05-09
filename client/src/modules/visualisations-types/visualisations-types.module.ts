/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';

/* Components */
import * as visualisationsTypesComponents from './components';


/* Containers */
import * as visualisationsTypesContainers from './containers';
import * as visualisationsTypesModalContainers from './containers/modals';

/* Guards */
import * as visualisationsTypesGuards from './guards';

/* Services */
import * as visualisationsTypesServices from './services';


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
        ...visualisationsTypesServices.services,
        ...visualisationsTypesGuards.guards
    ],
    declarations: [
        ...visualisationsTypesContainers.containers,
        ...visualisationsTypesComponents.components
    ],
    exports: [...visualisationsTypesContainers.containers, ...visualisationsTypesComponents.components],
    entryComponents: [...visualisationsTypesModalContainers.containers]
})
export class VisualisationsTypesModule {}
