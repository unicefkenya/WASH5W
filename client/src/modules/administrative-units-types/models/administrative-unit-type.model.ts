import { AdministrativeUnitTypeData } from "./administrative-unit-type-data.model";

export class AdministrativeUnitType {

	id!: number | null;
	data!: AdministrativeUnitTypeData;	
	version!: number | null;

    constructor(options?: Partial<AdministrativeUnitType>) {
        Object.assign(this, options);
    }	
}