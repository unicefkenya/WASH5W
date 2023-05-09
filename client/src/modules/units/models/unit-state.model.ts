import { State } from "@common/models/state.model";

export interface UnitState extends State {
    id: number | null | undefined;
    name: string | null | undefined;
    abbreviation: string | null | undefined;
}