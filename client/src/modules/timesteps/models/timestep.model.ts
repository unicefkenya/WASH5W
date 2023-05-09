import { TimestepData } from "./timestep-data.model";

export class Timestep {

	id!: number | null;
	data!: TimestepData;	
	version!: number | null;

    constructor(options?: Partial<Timestep>) {
        Object.assign(this, options);
    }	
}