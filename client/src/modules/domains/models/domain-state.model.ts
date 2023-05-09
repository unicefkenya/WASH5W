import { State } from "@common/models/state.model";

export interface DomainState extends State {
    ids: number[] | null | undefined;
    name: string | null | undefined;
}