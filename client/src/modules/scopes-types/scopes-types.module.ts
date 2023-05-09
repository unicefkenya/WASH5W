/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';

/* Components */
import * as scopesTypesComponents from './components';


/* Containers */
import * as scopesTypesContainers from './containers';
import * as scopesTypesModalContainers from './containers/modals';

/* Guards */
import * as scopesTypesGuards from './guards';

/* Services */
import * as scopesTypesServices from './services';


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
        ...scopesTypesServices.services,
        ...scopesTypesGuards.guards
    ],
    declarations: [
        ...scopesTypesContainers.containers,
        ...scopesTypesComponents.components
    ],
    exports: [...scopesTypesContainers.containers, ...scopesTypesComponents.components],
    entryComponents: [...scopesTypesModalContainers.containers]
})
export class ScopesTypesModule {}
