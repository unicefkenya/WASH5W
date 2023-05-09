/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';

/* Components */
import * as organisationsComponents from './components';


/* Containers */
import * as organisationsContainers from './containers';
import * as organisationsModalContainers from './containers/modals';

/* Guards */
import * as organisationsGuards from './guards';

/* Services */
import * as organisationsServices from './services';



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
        ...organisationsServices.services,
        ...organisationsGuards.guards
    ],
    declarations: [
        ...organisationsContainers.containers,
        ...organisationsComponents.components
    ],
    exports: [...organisationsContainers.containers, ...organisationsComponents.components],
    entryComponents: [...organisationsModalContainers.containers]
})
export class OrganisationsModule {}
