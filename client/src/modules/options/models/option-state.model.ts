import { State } from "@common/models/state.model";

export interface OptionState extends State {
  ids: number[] | null | undefined;
  typeId: number | null | undefined;
  name: string | null | undefined;
}