/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';

/* Components */
import * as visualisationsComponents from './components';


/* Containers */
import * as visualisationsContainers from './containers';
import * as visualisationsModalContainers from './containers/modals';

/* Guards */
import * as visualisationsGuards from './guards';

/* Services */
import * as visualisationsServices from './services';


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
        ...visualisationsServices.services,
        ...visualisationsGuards.guards
    ],
    declarations: [
        ...visualisationsContainers.containers,
        ...visualisationsComponents.components
    ],
    exports: [...visualisationsContainers.containers, ...visualisationsComponents.components],
    entryComponents: [...visualisationsModalContainers.containers]
})
export class VisualisationsModule {}
