import { State } from "@common/models/state.model";

export interface SystemRoleState extends State {
    ids: number[] | null | undefined;
    code: string | null | undefined;
    name: string | null | undefined;
}