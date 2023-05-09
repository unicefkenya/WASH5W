import { TimePeriodsFilterComponent } from './time-periods-filter/time-periods-filter.component';
import { TimePeriodsRecordsClosureComponent } from './time-periods-records-closure/time-periods-records-closure.component';
import { TimePeriodsRecordsSelectionComponent } from './time-periods-records-selection/time-periods-records-selection.component';
import { TimePeriodsRecordsTabulationComponent } from './time-periods-records-tabulation/time-periods-records-tabulation.component';


export const components = [
    TimePeriodsRecordsSelectionComponent,    
    TimePeriodsRecordsTabulationComponent,
    TimePeriodsRecordsClosureComponent,
    TimePeriodsFilterComponent
];


export * from './time-periods-records-closure/time-periods-records-closure.component';
export * from './time-periods-records-selection/time-periods-records-selection.component';
export * from './time-periods-records-tabulation/time-periods-records-tabulation.component';
export * from './time-periods-filter/time-periods-filter.component';

