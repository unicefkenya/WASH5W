import { State } from "@common/models/state.model";

export interface DataFormState extends State {
    contextId: number | null | undefined,
    name: string | null | undefined 
  }