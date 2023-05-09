import { UnitData } from "./unit-data.model";

export class Unit {

	id!: number | null;
	data!: UnitData;	
	version!: number | null;

    constructor(options?: Partial<Unit>) {
        Object.assign(this, options);
    }	
}