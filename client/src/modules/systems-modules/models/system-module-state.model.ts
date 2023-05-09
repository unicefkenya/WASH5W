import { State } from "@common/models/state.model";

export interface SystemModuleState extends State {
    ids: number[] | null | undefined;
    name: string | null | undefined;
    enabled: boolean | null | undefined;
    customisable: boolean | null | undefined;
}