/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';

/* Components */
import * as timePeriodsComponents from './components';


/* Containers */
import * as timePeriodsContainers from './containers';
import * as timePeriodsModalContainers from './containers/modals';

/* Guards */
import * as timePeriodsGuards from './guards';

/* Services */
import * as timePeriodsServices from './services';

/* Other */
import * as moment from 'moment';


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
        ...timePeriodsServices.services,
        ...timePeriodsGuards.guards
    ],
    declarations: [
        ...timePeriodsContainers.containers,
        ...timePeriodsComponents.components
    ],
    exports: [...timePeriodsContainers.containers, ...timePeriodsComponents.components],
    entryComponents: [...timePeriodsModalContainers.containers]
})
export class TimePeriodsModule {}
