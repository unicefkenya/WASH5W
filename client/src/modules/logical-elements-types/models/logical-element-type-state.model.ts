import { State } from "@common/models/state.model";

export interface LogicalElementTypeState extends State {
    name: string | null | undefined,
    plural: string | null | undefined
}