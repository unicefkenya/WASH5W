/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';

/* Components */
import * as optionsComponents from './components';


/* Containers */
import * as optionsContainers from './containers';
import * as optionsModalContainers from './containers/modals';

/* Guards */
import * as optionsGuards from './guards';

/* Services */
import * as optionsServices from './services';



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
        ...optionsServices.services,
        ...optionsGuards.guards
    ],
    declarations: [
        ...optionsContainers.containers,
        ...optionsComponents.components
    ],
    exports: [...optionsContainers.containers, ...optionsComponents.components],
    entryComponents: [...optionsModalContainers.containers]
})
export class OptionsModule {}
