import { State } from "@common/models/state.model";

export interface IndicatorState extends State {
    ids: number[] | null | undefined;
    contextId: number | null | undefined;
    no: string | null | undefined;
    name: string | null | undefined;
    logicalParentId: number | null | undefined;
}