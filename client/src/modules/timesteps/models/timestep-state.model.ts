import { State } from "@common/models/state.model";

export interface TimestepState extends State {
    name: string | null | undefined;
  }