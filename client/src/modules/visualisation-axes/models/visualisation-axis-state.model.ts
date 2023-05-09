import { State } from "@common/models/state.model";

export interface VisualisationAxisState extends State {
  id: number | null | undefined;
  visualisationId: number | null | undefined;
  axisId: number | null | undefined;
  label: string | null | undefined;
}