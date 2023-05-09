import { State } from "@common/models/state.model";

export interface EntityState extends State {
  id: number | null | undefined;
  typeId: number | null | undefined;
  locationId: number | null | undefined;
  name: string | null | undefined;
}