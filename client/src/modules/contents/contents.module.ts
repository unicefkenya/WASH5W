/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';

/* Components */
import * as contentsComponents from './components';


/* Containers */
import * as contentsContainers from './containers';
import * as contentsModalContainers from './containers/modals';

/* Guards */
import * as contentsGuards from './guards';

/* Services */
import * as contentsServices from './services';


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
        ...contentsServices.services,
        ...contentsGuards.guards
    ],
    declarations: [
        ...contentsContainers.containers,
        ...contentsComponents.components
    ],
    exports: [...contentsContainers.containers, ...contentsComponents.components],
    entryComponents: [...contentsModalContainers.containers]
})
export class ContentsModule {}
