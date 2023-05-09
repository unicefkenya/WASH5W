import { State } from "@common/models/state.model";

export interface VisualisationAxisTypeState extends State {
    id: number | null | undefined;
    name: string | null | undefined;
  }