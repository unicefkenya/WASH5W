import { State } from "@common/models/state.model";

export interface SystemTaskState extends State {
    id: number | null | undefined;
    contextId: string | null | undefined;
    timePointId: string | null | undefined;
    taskTypeId: string | null | undefined;
    taskStatusId: string | null | undefined; 
}