/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';

/* Components */
import * as timestepsComponents from './components';


/* Containers */
import * as timestepsContainers from './containers';
import * as timestepsModalContainers from './containers/modals';

/* Guards */
import * as timestepsGuards from './guards';

/* Services */
import * as timestepsServices from './services';


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
        ...timestepsServices.services,
        ...timestepsGuards.guards
    ],
    declarations: [
        ...timestepsContainers.containers,
        ...timestepsComponents.components
    ],
    exports: [...timestepsContainers.containers, ...timestepsComponents.components],
    entryComponents: [...timestepsModalContainers.containers]
})
export class TimestepsModule {}
