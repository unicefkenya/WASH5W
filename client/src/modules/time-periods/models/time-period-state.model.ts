import { State } from "@common/models/state.model";

export interface TimePeriodState extends State {
  id: number | null | undefined,
  contextId: number | null | undefined,
  open: boolean | null | undefined
}