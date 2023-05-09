import { EntityData } from "./entity-data.model";

export class Entity {

	id!: number | null;
	data!: EntityData;	
	version!: number | null;

    constructor(options?: Partial<Entity>) {
        Object.assign(this, options);
    }	
}