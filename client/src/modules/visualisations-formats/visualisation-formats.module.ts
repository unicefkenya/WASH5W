/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';

/* Components */
import * as visualisationsFormatsComponents from './components';


/* Containers */
import * as visualisationsFormatsContainers from './containers';
import * as visualisationsFormatsModalContainers from './containers/modals';

/* Guards */
import * as visualisationsFormatsGuards from './guards';

/* Services */
import * as visualisationsFormatsServices from './services';


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
        ...visualisationsFormatsServices.services,
        ...visualisationsFormatsGuards.guards
    ],
    declarations: [
        ...visualisationsFormatsContainers.containers,
        ...visualisationsFormatsComponents.components
    ],
    exports: [...visualisationsFormatsContainers.containers, ...visualisationsFormatsComponents.components],
    entryComponents: [...visualisationsFormatsModalContainers.containers]
})
export class VisualisationsFormatsModule {}
