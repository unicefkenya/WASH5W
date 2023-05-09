/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';

/* Components */
import * as operatorsComponents from './components';


/* Containers */
import * as operatorsContainers from './containers';
import * as operatorsModalContainers from './containers/modals';

/* Guards */
import * as operatorsGuards from './guards';

/* Services */
import * as operatorsServices from './services';


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
        ...operatorsServices.services,
        ...operatorsGuards.guards
    ],
    declarations: [
        ...operatorsContainers.containers,
        ...operatorsComponents.components
    ],
    exports: [...operatorsContainers.containers, ...operatorsComponents.components],
    entryComponents: [...operatorsModalContainers.containers]
})
export class OperatorsModule {}
