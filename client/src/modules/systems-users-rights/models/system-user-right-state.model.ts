import { State } from "@common/models/state.model";

export interface SystemUserRightState extends State {

    id: number | null | undefined;
    systemUserId: number | null | undefined;
    contextId: number | null | undefined;
    
}