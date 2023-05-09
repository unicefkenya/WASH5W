import { State } from "@common/models/state.model";

export interface DissagregationState extends State {
  ids: number[] | null | undefined;
  typeId: number | null | undefined;
  name: string | null | undefined;
}