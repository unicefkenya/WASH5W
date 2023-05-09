import { EntityTypeData } from "./entity-type-data.model";

export class EntityType {

	id!: number | null;
	data!: EntityTypeData;	
	version!: number | null;

    constructor(options?: Partial<EntityType>) {
        Object.assign(this, options);
    }	
}