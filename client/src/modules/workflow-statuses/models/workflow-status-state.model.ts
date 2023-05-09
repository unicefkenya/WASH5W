import { State } from "@common/models/state.model";

export interface WorkflowStatusState extends State {
    name: string | null | undefined
}