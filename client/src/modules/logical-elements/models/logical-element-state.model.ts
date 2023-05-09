import { State } from "@common/models/state.model";

export interface LogicalElementState extends State {
  id: number | null | undefined;
  contextId: number | null | undefined;
  typesIds: number[] | null | undefined;
  no: string | null | undefined;
  name: string | null | undefined
}