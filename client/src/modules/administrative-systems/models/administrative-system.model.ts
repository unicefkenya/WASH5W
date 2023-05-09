import { AdministrativeSystemData } from "./administrative-system-data.model";

export class AdministrativeSystem {

	id!: number | null;
	data!: AdministrativeSystemData;	
	version!: number | null;

    constructor(options?: Partial<AdministrativeSystem>) {
        Object.assign(this, options);
    }	
}