import { State } from "@common/models/state.model";

export interface AdministrativeUnitState extends State {
  id: number | null | undefined,
  typesIds: number[] | null | undefined,
  name: string | null | undefined
}