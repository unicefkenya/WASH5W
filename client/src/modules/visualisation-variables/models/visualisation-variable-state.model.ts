import { State } from "@common/models/state.model";

export interface VisualisationVariableState extends State {
    id: number | null | undefined;
    visualisationId: number | null | undefined;
    indicatorId: number | null | undefined;
    roleId: number | null | undefined;
}