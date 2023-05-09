/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';
import { OptionsTypesModule } from '@modules/options-types/options-types.module';

/* Components */
import * as entitiesTypesComponents from './components';


/* Containers */
import * as entitiesTypesContainers from './containers';
import * as entitiesTypesModalContainers from './containers/modals';

/* Guards */
import * as entitiesTypesGuards from './guards';

/* Services */
import * as entitiesTypesServices from './services';





@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        FormsModule,
        AppCommonModule,
        NavigationModule,
        OptionsTypesModule
    ],
    providers: [
        DecimalPipe,
        ...entitiesTypesServices.services,
        ...entitiesTypesGuards.guards
    ],
    declarations: [
        ...entitiesTypesContainers.containers,
        ...entitiesTypesComponents.components
    ],
    exports: [...entitiesTypesContainers.containers, ...entitiesTypesComponents.components],
    entryComponents: [...entitiesTypesModalContainers.containers]
})
export class EntitiesTypesModule {}
