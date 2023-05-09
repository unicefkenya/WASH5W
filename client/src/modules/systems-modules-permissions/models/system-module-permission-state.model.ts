import { State } from "@common/models/state.model";

export interface SystemModulePermissionState extends State {
  systemModuleId: number | null | undefined;
  code: string | null | undefined;
  name: string | null | undefined;
}