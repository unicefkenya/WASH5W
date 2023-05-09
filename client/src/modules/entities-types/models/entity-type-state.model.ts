import { State } from "@common/models/state.model";

export interface EntityTypeState extends State {
    id: number | null | undefined,
    contextId: number | null | undefined,
    name: string | null | undefined,
    plural: string | null | undefined
  }