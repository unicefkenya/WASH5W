import { State } from "@common/models/state.model";

export interface OrganisationState extends State {
  id: number | null | undefined;
  typeId: number | null | undefined;
  name: string | null | undefined;
  abbreviation: string | null | undefined;
}