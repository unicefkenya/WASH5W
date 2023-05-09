import { AdministrativeUnit } from "@modules/administrative-units/models/administrative-unit.model";
import { EntityClassification } from "./entity-classification.model";

export class EntityData {

	typeId: number | null | undefined;  
    location: {id: number | null | undefined; name: string | null | undefined;}[] | null | undefined;
    name: string | null | undefined;
    classifications: EntityClassification[] | null | undefined;

    constructor(options?: Partial<EntityData>) {
        Object.assign(this, options);
    }	
}