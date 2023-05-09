/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';

/* Components */
import * as dataFormsComponents from './components';


/* Containers */
import * as dataFormsContainers from './containers';
import * as dataFormsModalContainers from './containers/modals';

/* Guards */
import * as dataFormsGuards from './guards';

/* Services */
import * as dataFormsServices from './services';



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
        ...dataFormsServices.services,
        ...dataFormsGuards.guards
    ],
    declarations: [
        ...dataFormsContainers.containers,
        ...dataFormsComponents.components
    ],
    exports: [...dataFormsContainers.containers, ...dataFormsComponents.components],
    entryComponents: [...dataFormsModalContainers.containers]
})
export class DataFormsModule {}
