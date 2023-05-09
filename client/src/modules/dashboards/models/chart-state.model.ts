import { AdministrativeUnit } from "@modules/administrative-units/models/administrative-unit.model";

export interface ChartState {
  administrativeUnit: AdministrativeUnit | null | undefined;
}