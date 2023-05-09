import { AdministrativeHierarchy } from "@modules/administrative-hierarchies/models/administrative-hierarchy.model";
import { AdministrativeSystem } from "@modules/administrative-systems/models";

export interface HierarchicalLocation {
    system: AdministrativeSystem | null | undefined,
    accountabilities: AdministrativeHierarchy[]
}