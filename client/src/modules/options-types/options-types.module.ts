/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';

/* Components */
import * as optionsTypesComponents from './components';


/* Containers */
import * as optionsTypesContainers from './containers';
import * as optionsTypesModalContainers from './containers/modals';

/* Guards */
import * as optionsTypesGuards from './guards';

/* Services */
import * as optionsTypesServices from './services';


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
        ...optionsTypesServices.services,
        ...optionsTypesGuards.guards
    ],
    declarations: [
        ...optionsTypesContainers.containers,
        ...optionsTypesComponents.components
    ],
    exports: [...optionsTypesContainers.containers, ...optionsTypesComponents.components],
    entryComponents: [...optionsTypesModalContainers.containers]
})
export class OptionsTypesModule {}
