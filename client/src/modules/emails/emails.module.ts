/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';

/* Components */
import * as emailsComponents from './components';


/* Containers */
import * as emailsContainers from './containers';
import * as emailsModalContainers from './containers/modals';

/* Guards */
import * as emailsGuards from './guards';

/* Services */
import * as emailsServices from './services';


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
        ...emailsServices.services,
        ...emailsGuards.guards
    ],
    declarations: [
        ...emailsContainers.containers,
        ...emailsComponents.components
    ],
    exports: [...emailsContainers.containers, ...emailsComponents.components],
    entryComponents: [...emailsModalContainers.containers]
})
export class UnitsModule {}
