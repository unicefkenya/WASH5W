import { VisualisationMapComponent} from "./maps/maps.component";
import { VisualisationChartsComponent } from "./charts/charts.component";
import { VisualisationTableComponent } from "./tables/tables.component";

export const components = [
    VisualisationChartsComponent,
    VisualisationMapComponent,
    VisualisationTableComponent
];

export * from "./charts/charts.component";
export * from "./maps/maps.component";
export * from "./tables/tables.component";