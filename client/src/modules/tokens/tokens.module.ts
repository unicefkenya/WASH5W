/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';

/* Components */
import * as tokensComponents from './components';


/* Containers */
import * as tokensContainers from './containers';
import * as tokensModalContainers from './containers/modals';

/* Guards */
import * as tokensGuards from './guards';

/* Services */
import * as tokensServices from './services';


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
        ...tokensServices.services,
        ...tokensGuards.guards
    ],
    declarations: [
        ...tokensContainers.containers,
        ...tokensComponents.components
    ],
    exports: [...tokensContainers.containers, ...tokensComponents.components],
    entryComponents: [...tokensModalContainers.containers]
})
export class UnitsModule {}
