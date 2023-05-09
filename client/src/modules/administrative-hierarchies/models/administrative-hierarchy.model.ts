import { AdministrativeHierarchyData } from "./administrative-hierarchy-data.model";

export class AdministrativeHierarchy {

	id!: number | null;
	data!: AdministrativeHierarchyData;	
	version!: number | null;

    constructor(options?: Partial<AdministrativeHierarchy>) {
        Object.assign(this, options);
    }	
}