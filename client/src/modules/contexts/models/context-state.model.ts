import { State } from "@common/models/state.model";

export interface ContextState extends State {
    ids: number[] | null | undefined,
    name: string | null | undefined,
    abbreviation: string | null | undefined
}