import { HierarchicalLocation } from "@modules/administrative-hierarchies/models/hierarchical-location.model";
import { Entity } from "@modules/entities/models";
import { Organisation } from "@modules/organisations/models/organisation.model";

export class SystemUserRightData {

    user: { id: number | null | undefined} | null | undefined;
    context: { id: number | null | undefined; name: string | null | undefined;} | null | undefined;
    role: { id: number | null | undefined; name: string | null | undefined;} | null | undefined;
    scopeType: { id: number | null | undefined;  name: string | null | undefined;} | null | undefined; // The scope type to which the users rights is limited: entity, location or organisation
    party: {id: number | null | undefined;  name: string | null | undefined; } | null | undefined; // The specific party to which the users rights is limited 
    accountabilitySystem: { id: number | null | undefined} | null | undefined;
    accountabilityType: { id: number | null | undefined} | null | undefined;
    accountability: { id: number | null | undefined} | null | undefined;
    
    entity: Entity | null | undefined;
    location: HierarchicalLocation | null | undefined;
    organisation: Organisation | null | undefined;

    
    constructor(options?: Partial<SystemUserRightData>) {
        Object.assign(this, options);
    }
}