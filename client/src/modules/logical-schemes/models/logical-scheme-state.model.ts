import { State } from "@common/models/state.model";

export interface LogicalSchemeState extends State {
    name: string | null | undefined
}