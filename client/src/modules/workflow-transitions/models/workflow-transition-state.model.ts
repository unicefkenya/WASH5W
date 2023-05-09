import { State } from "@common/models/state.model";

export interface WorkflowTransitionState extends State {
    workflowId: number | null | undefined;
	fromStateId: number | null | undefined;
    fromStateName: string | null | undefined;
    toStateId: number | null | undefined;
    toStateName: string | null | undefined;
    permissionId: number | null | undefined;
    permissionName: number | null | undefined;
    verb: string | null | undefined;
}