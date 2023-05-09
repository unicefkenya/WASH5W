import { State } from "@common/models/state.model";

export interface DissagregationSchemeState extends State {
    ids: number[] | null | undefined;
    name: string | null | undefined;
}