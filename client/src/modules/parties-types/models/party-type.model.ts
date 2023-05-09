import { PartyTypeData } from "./party-type-data.model";

export class PartyType {

	id!: number | null;
	data!: PartyTypeData;	
	version!: number | null;

    constructor(options?: Partial<PartyType>) {
        Object.assign(this, options);
    }	
}