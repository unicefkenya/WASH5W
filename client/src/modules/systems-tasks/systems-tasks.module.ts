/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';

/* Components */
import * as systemsTasksComponents from './components';


/* Containers */
import * as systemsTasksContainers from './containers';
import * as systemsTasksModalContainers from './containers/modals';

/* Guards */
import * as systemsTasksGuards from './guards';

/* Services */
import * as systemsTasksServices from './services';


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
        ...systemsTasksServices.services,
        ...systemsTasksGuards.guards
    ],
    declarations: [
        ...systemsTasksContainers.containers,
        ...systemsTasksComponents.components
    ],
    exports: [...systemsTasksContainers.containers, ...systemsTasksComponents.components],
    entryComponents: [...systemsTasksModalContainers.containers]
})
export class SystemsTasksModule {}
