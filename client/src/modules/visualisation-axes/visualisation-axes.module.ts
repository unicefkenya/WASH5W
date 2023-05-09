/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';

/* Components */
import * as visualisationAxesComponents from './components';


/* Containers */
import * as visualisationAxesContainers from './containers';
import * as visualisationAxesModalContainers from './containers/modals';

/* Guards */
import * as visualisationAxesGuards from './guards';

/* Services */
import * as visualisationAxesServices from './services';



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
        ...visualisationAxesServices.services,
        ...visualisationAxesGuards.guards
    ],
    declarations: [
        ...visualisationAxesContainers.containers,
        ...visualisationAxesComponents.components
    ],
    exports: [...visualisationAxesContainers.containers, ...visualisationAxesComponents.components],
    entryComponents: [...visualisationAxesModalContainers.containers]
})
export class VisualisationAxesModule {}
