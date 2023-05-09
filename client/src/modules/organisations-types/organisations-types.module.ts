/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';

/* Components */
import * as organisationsTypesComponents from './components';


/* Containers */
import * as organisationsTypesContainers from './containers';
import * as organisationsTypesModalContainers from './containers/modals';

/* Guards */
import * as organisationsTypesGuards from './guards';

/* Services */
import * as organisationsTypesServices from './services';


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
        ...organisationsTypesServices.services,
        ...organisationsTypesGuards.guards
    ],
    declarations: [
        ...organisationsTypesContainers.containers,
        ...organisationsTypesComponents.components
    ],
    exports: [...organisationsTypesContainers.containers, ...organisationsTypesComponents.components],
    entryComponents: [...organisationsTypesModalContainers.containers]
})
export class OrganisationsTypesModule {}
