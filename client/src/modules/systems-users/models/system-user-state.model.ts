import { State } from "@common/models/state.model";

export interface SystemUserState extends State {
    id: number | null | undefined;
    name: string | null | undefined;
    email: string | null | undefined;
    password: string | null | undefined;
}