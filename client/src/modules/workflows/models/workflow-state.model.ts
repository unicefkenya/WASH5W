import { State } from "@common/models/state.model";

export interface WorkflowState extends State {
    name: string | null | undefined
}