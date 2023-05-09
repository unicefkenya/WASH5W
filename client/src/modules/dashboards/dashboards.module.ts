/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/* Modules */
import { AppCommonModule } from '@common/app-common.module';
import { NavigationModule } from '@modules/navigation/navigation.module';
import { HighchartsChartModule } from 'highcharts-angular';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';


/* Components */
import * as dashboardsComponents from './components';


/* Containers */
import * as dashboardsContainers from './containers';
import * as dashboardsModalContainers from './containers/modals';

/* Guards */
import * as dashboardsGuards from './guards';

/* Services */
import * as dashboardsServices from './services';




@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        FormsModule,
        AppCommonModule,
        NavigationModule,
        HighchartsChartModule,
        LeafletModule
    ],
    providers: [
        DecimalPipe,
        ...dashboardsServices.services,
        ...dashboardsGuards.guards
    ],
    declarations: [
        ...dashboardsContainers.containers,
        ...dashboardsComponents.components
    ],
    exports: [...dashboardsContainers.containers, ...dashboardsComponents.components],
    entryComponents: [...dashboardsModalContainers.containers]
})
export class DashboardsModule {}
