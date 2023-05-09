import { AdministrativeUnitData } from "./administrative-unit-data.model";

export class AdministrativeUnit {

	id!: number | null;
	data!: AdministrativeUnitData;	
	version!: number | null;

    constructor(options?: Partial<AdministrativeUnit>) {
        Object.assign(this, options);
    }	
}