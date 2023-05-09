import { State } from "@common/models/state.model";

export interface VisualisationState extends State {

    id: number | null | undefined;
    visualisationContainerId: number | null | undefined;
    visualisationTypeId: number | null | undefined;
    visualisationDataTypeId: number | null | undefined;
    name: string | null | undefined;

}