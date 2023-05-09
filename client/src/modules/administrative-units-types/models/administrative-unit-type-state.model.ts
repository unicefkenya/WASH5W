import { State } from "@common/models/state.model";

export interface AdministrativeUnitTypeState extends State {
    id: number | null | undefined,
    name: string | null | undefined,
    plural: string | null | undefined
}