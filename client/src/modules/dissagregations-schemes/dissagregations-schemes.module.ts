/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';

/* Components */
import * as dissagregationsSchemesComponents from './components';


/* Containers */
import * as dissagregationsSchemesContainers from './containers';
import * as dissagregationsSchemesModalContainers from './containers/modals';

/* Guards */
import * as dissagregationsSchemesGuards from './guards';

/* Services */
import * as dissagregationsSchemesServices from './services';


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
        ...dissagregationsSchemesServices.services,
        ...dissagregationsSchemesGuards.guards
    ],
    declarations: [
        ...dissagregationsSchemesContainers.containers,
        ...dissagregationsSchemesComponents.components
    ],
    exports: [...dissagregationsSchemesContainers.containers, ...dissagregationsSchemesComponents.components],
    entryComponents: [...dissagregationsSchemesModalContainers.containers]
})
export class DissagregationsSchemesModule {}
