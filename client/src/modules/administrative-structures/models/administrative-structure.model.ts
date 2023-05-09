import { AdministrativeStructureData } from "./administrative-structure-data.model";

export class AdministrativeStructure {

	id!: number | null;
	data!: AdministrativeStructureData;	
	version!: number | null;

    constructor(options?: Partial<AdministrativeStructure>) {
        Object.assign(this, options);
    }	
}