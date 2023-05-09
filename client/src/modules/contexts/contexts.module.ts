/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';

/* Components */
import * as contextsComponents from './components';


/* Containers */
import * as contextsContainers from './containers';
import * as contextsModalContainers from './containers/modals';

/* Guards */
import * as contextsGuards from './guards';

/* Services */
import * as contextsServices from './services';


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
        ...contextsServices.services,
        ...contextsGuards.guards
    ],
    declarations: [
        ...contextsContainers.containers,
        ...contextsComponents.components
    ],
    exports: [...contextsContainers.containers, ...contextsComponents.components],
    entryComponents: [...contextsModalContainers.containers]
})
export class ContextsModule {}
