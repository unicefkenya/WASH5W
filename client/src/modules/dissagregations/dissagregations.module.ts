/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';

/* Components */
import * as dissagregationsComponents from './components';


/* Containers */
import * as dissagregationsContainers from './containers';
import * as dissagregationsModalContainers from './containers/modals';

/* Guards */
import * as dissagregationsGuards from './guards';

/* Services */
import * as dissagregationsServices from './services';



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
        ...dissagregationsServices.services,
        ...dissagregationsGuards.guards
    ],
    declarations: [
        ...dissagregationsContainers.containers,
        ...dissagregationsComponents.components
    ],
    exports: [...dissagregationsContainers.containers, ...dissagregationsComponents.components],
    entryComponents: [...dissagregationsModalContainers.containers]
})
export class DissagregationsModule {}
